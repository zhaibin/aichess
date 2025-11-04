// 游戏分析和提示

import { ChessGame } from './chess-utils';
import { GameState } from './types';

export interface PositionEvaluation {
  score: number; // 分数（正数利于白方，负数利于黑方）
  bestMove: string;
  analysis: string;
}

export interface MoveHint {
  from: string;
  to: string;
  score: number;
  description: string;
}

/**
 * 游戏分析引擎
 */
export class GameAnalysis {
  /**
   * 简单的位置评估（材料平衡）
   */
  static evaluatePosition(fen: string): number {
    const chess = new ChessGame(fen);
    const board = chess.board();

    const pieceValues: Record<string, number> = {
      p: 1,
      n: 3,
      b: 3,
      r: 5,
      q: 9,
      k: 0
    };

    let score = 0;

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece) {
          const value = pieceValues[piece.type];
          score += piece.color === 'w' ? value : -value;
        }
      }
    }

    return score;
  }

  /**
   * 获取最佳移动提示
   */
  static getBestMove(fen: string): MoveHint | null {
    const chess = new ChessGame(fen);
    const moves = chess.getLegalMoves();

    if (moves.length === 0) {
      return null;
    }

    let bestMove: MoveHint | null = null;
    let bestScore = -Infinity;
    const currentPlayer = chess.getTurn();

    for (const moveStr of moves) {
      const from = moveStr.substring(0, 2);
      const to = moveStr.substring(2, 4);
      const promotion = moveStr.length > 4 ? moveStr.substring(4) : undefined;

      // 尝试移动
      const testChess = new ChessGame(fen);
      testChess.makeMove(from, to, promotion);

      // 评估新位置
      let score = this.evaluatePosition(testChess.getFen());
      
      // 如果是黑方，反转分数
      if (currentPlayer === 'b') {
        score = -score;
      }

      // 检查是否将死
      if (testChess.isCheckmate()) {
        score = 1000;
      }

      // 检查是否将军
      if (testChess.isCheck()) {
        score += 0.5;
      }

      if (score > bestScore) {
        bestScore = score;
        bestMove = {
          from,
          to,
          score,
          description: this.describeMoveQuality(score)
        };
      }
    }

    return bestMove;
  }

  /**
   * 获取多个移动建议
   */
  static getTopMoves(fen: string, count: number = 3): MoveHint[] {
    const chess = new ChessGame(fen);
    const moves = chess.getLegalMoves();
    const currentPlayer = chess.getTurn();

    const evaluatedMoves: MoveHint[] = [];

    for (const moveStr of moves) {
      const from = moveStr.substring(0, 2);
      const to = moveStr.substring(2, 4);
      const promotion = moveStr.length > 4 ? moveStr.substring(4) : undefined;

      const testChess = new ChessGame(fen);
      testChess.makeMove(from, to, promotion);

      let score = this.evaluatePosition(testChess.getFen());
      
      if (currentPlayer === 'b') {
        score = -score;
      }

      if (testChess.isCheckmate()) {
        score = 1000;
      }

      if (testChess.isCheck()) {
        score += 0.5;
      }

      evaluatedMoves.push({
        from,
        to,
        score,
        description: this.describeMoveQuality(score)
      });
    }

    // 排序并返回前N个
    return evaluatedMoves
      .sort((a, b) => b.score - a.score)
      .slice(0, count);
  }

  /**
   * 分析整局游戏
   */
  static analyzeGame(game: GameState): {
    whiteAccuracy: number;
    blackAccuracy: number;
    criticalMoments: number[];
    mistakes: { moveIndex: number; player: 'w' | 'b'; description: string }[];
  } {
    const mistakes: { moveIndex: number; player: 'w' | 'b'; description: string }[] = [];
    const criticalMoments: number[] = [];

    let prevEval = 0;

    for (let i = 0; i < game.moves.length; i++) {
      const chess = new ChessGame();
      
      // 重建到当前位置
      for (let j = 0; j < i; j++) {
        const move = game.moves[j];
        chess.makeMove(move.from, move.to, move.promotion);
      }

      const currentEval = this.evaluatePosition(chess.getFen());
      const evalChange = Math.abs(currentEval - prevEval);

      // 检测关键时刻（评估变化超过2分）
      if (evalChange > 2) {
        criticalMoments.push(i);
      }

      // 检测失误（评估下降超过1.5分）
      const player = i % 2 === 0 ? 'w' : 'b';
      const expectedChange = player === 'w' ? 1 : -1;
      const actualChange = currentEval - prevEval;

      if ((player === 'w' && actualChange < -1.5) || (player === 'b' && actualChange > 1.5)) {
        mistakes.push({
          moveIndex: i,
          player,
          description: '失误：评估下降显著'
        });
      }

      prevEval = currentEval;
    }

    // 计算准确率（简化）
    const whiteMistakes = mistakes.filter(m => m.player === 'w').length;
    const blackMistakes = mistakes.filter(m => m.player === 'b').length;
    const whiteAccuracy = Math.max(0, 100 - whiteMistakes * 10);
    const blackAccuracy = Math.max(0, 100 - blackMistakes * 10);

    return {
      whiteAccuracy,
      blackAccuracy,
      criticalMoments,
      mistakes
    };
  }

  /**
   * 描述移动质量
   */
  private static describeMoveQuality(score: number): string {
    if (score >= 1000) return '将死！';
    if (score >= 5) return '绝佳';
    if (score >= 2) return '优秀';
    if (score >= 0.5) return '不错';
    if (score >= -0.5) return '平稳';
    if (score >= -2) return '可疑';
    return '失误';
  }

  /**
   * 检查位置是否为战术位置
   */
  static isTacticalPosition(fen: string): boolean {
    const chess = new ChessGame(fen);
    
    // 检查是否有将军
    if (chess.isCheck()) {
      return true;
    }

    // 检查是否有捕获移动
    const moves = chess.getLegalMoves();
    for (const moveStr of moves) {
      const from = moveStr.substring(0, 2);
      const to = moveStr.substring(2, 4);
      
      const testChess = new ChessGame(fen);
      const piece = testChess.get(to);
      
      if (piece) {
        return true; // 有可捕获的棋子
      }
    }

    return false;
  }
}

