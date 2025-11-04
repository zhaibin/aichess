// 游戏回放功能

import { GameState, Move } from './types';
import { ChessGame } from './chess-utils';

export interface ReplayState {
  gameId: string;
  currentMoveIndex: number;
  totalMoves: number;
  fen: string;
  isPlaying: boolean;
  playbackSpeed: number; // 毫秒/步
}

/**
 * 游戏回放控制器
 */
export class GameReplay {
  private game: GameState;
  private currentIndex: number;
  private chess: ChessGame;

  constructor(game: GameState) {
    this.game = game;
    this.currentIndex = -1;
    this.chess = new ChessGame();
  }

  /**
   * 跳转到开始
   */
  goToStart(): string {
    this.currentIndex = -1;
    this.chess = new ChessGame();
    return this.chess.getFen();
  }

  /**
   * 跳转到结束
   */
  goToEnd(): string {
    this.currentIndex = this.game.moves.length - 1;
    this.chess = new ChessGame(this.game.fen);
    return this.chess.getFen();
  }

  /**
   * 下一步
   */
  next(): { fen: string; move: Move | null; hasNext: boolean } {
    if (this.currentIndex >= this.game.moves.length - 1) {
      return {
        fen: this.chess.getFen(),
        move: null,
        hasNext: false
      };
    }

    this.currentIndex++;
    const move = this.game.moves[this.currentIndex];
    this.chess.makeMove(move.from, move.to, move.promotion);

    return {
      fen: this.chess.getFen(),
      move,
      hasNext: this.currentIndex < this.game.moves.length - 1
    };
  }

  /**
   * 上一步
   */
  previous(): { fen: string; move: Move | null; hasPrevious: boolean } {
    if (this.currentIndex < 0) {
      return {
        fen: this.chess.getFen(),
        move: null,
        hasPrevious: false
      };
    }

    this.chess.undo();
    const move = this.game.moves[this.currentIndex];
    this.currentIndex--;

    return {
      fen: this.chess.getFen(),
      move,
      hasPrevious: this.currentIndex >= 0
    };
  }

  /**
   * 跳转到指定步
   */
  goToMove(index: number): string {
    if (index < -1 || index >= this.game.moves.length) {
      throw new Error('Invalid move index');
    }

    // 重建到指定位置
    this.chess = new ChessGame();
    for (let i = 0; i <= index; i++) {
      const move = this.game.moves[i];
      this.chess.makeMove(move.from, move.to, move.promotion);
    }

    this.currentIndex = index;
    return this.chess.getFen();
  }

  /**
   * 获取当前状态
   */
  getState(): ReplayState {
    return {
      gameId: this.game.id,
      currentMoveIndex: this.currentIndex,
      totalMoves: this.game.moves.length,
      fen: this.chess.getFen(),
      isPlaying: false,
      playbackSpeed: 1000
    };
  }

  /**
   * 导出PGN
   */
  exportPGN(): string {
    const date = new Date(this.game.createdAt);
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '.');

    let pgn = `[Event "AIChess Game"]\n`;
    pgn += `[Site "aichess.win"]\n`;
    pgn += `[Date "${dateStr}"]\n`;
    pgn += `[White "${this.game.whitePlayer.name}"]\n`;
    pgn += `[Black "${this.game.blackPlayer.name}"]\n`;
    pgn += `[TimeControl "${this.game.timeControl}"]\n`;

    if (this.game.winner === 'w') {
      pgn += `[Result "1-0"]\n`;
    } else if (this.game.winner === 'b') {
      pgn += `[Result "0-1"]\n`;
    } else if (this.game.winner === 'draw') {
      pgn += `[Result "1/2-1/2"]\n`;
    } else {
      pgn += `[Result "*"]\n`;
    }

    pgn += `\n`;

    // 添加移动
    let moveText = '';
    for (let i = 0; i < this.game.moves.length; i++) {
      if (i % 2 === 0) {
        moveText += `${Math.floor(i / 2) + 1}. `;
      }
      moveText += `${this.game.moves[i].san} `;
    }

    pgn += moveText.trim();

    // 添加结果
    if (this.game.winner === 'w') {
      pgn += ` 1-0`;
    } else if (this.game.winner === 'b') {
      pgn += ` 0-1`;
    } else if (this.game.winner === 'draw') {
      pgn += ` 1/2-1/2`;
    }

    return pgn;
  }

  /**
   * 导入PGN
   */
  static importPGN(pgn: string): GameState | null {
    try {
      const chess = new ChessGame();
      if (!chess.loadPgn(pgn)) {
        return null;
      }

      // 解析PGN头部
      const headers: Record<string, string> = {};
      const headerRegex = /\[(\w+)\s+"([^"]+)"\]/g;
      let match;
      while ((match = headerRegex.exec(pgn)) !== null) {
        headers[match[1]] = match[2];
      }

      // 创建游戏状态（简化版）
      const gameState: GameState = {
        id: crypto.randomUUID(),
        mode: 'human-vs-human',
        status: 'completed',
        timeControl: parseInt(headers.TimeControl || '600'),
        whitePlayer: {
          type: 'human',
          name: headers.White || 'White',
          color: 'w',
          timeRemaining: 0
        },
        blackPlayer: {
          type: 'human',
          name: headers.Black || 'Black',
          color: 'b',
          timeRemaining: 0
        },
        currentTurn: chess.getTurn(),
        fen: chess.getFen(),
        moves: chess.getHistory().map((san, index) => ({
          from: '',
          to: '',
          san,
          timestamp: Date.now(),
          timeRemaining: 0
        })),
        createdAt: Date.now(),
        lastMoveAt: Date.now()
      };

      return gameState;
    } catch (error) {
      console.error('PGN import error:', error);
      return null;
    }
  }
}

