// 国际象棋工具类（使用chess.js库）
import { Chess } from 'chess.js';

export class ChessGame {
  private chess: Chess;

  constructor(fen?: string) {
    this.chess = fen ? new Chess(fen) : new Chess();
  }

  /**
   * 验证并执行移动
   */
  makeMove(from: string, to: string, promotion?: string): { success: boolean; san?: string; fen?: string } {
    try {
      const move = this.chess.move({
        from,
        to,
        promotion: promotion as any
      });

      if (move) {
        return {
          success: true,
          san: move.san,
          fen: this.chess.fen()
        };
      }
      return { success: false };
    } catch (error) {
      return { success: false };
    }
  }

  /**
   * 获取所有合法移动
   */
  getLegalMoves(): string[] {
    return this.chess.moves({ verbose: true }).map(m => `${m.from}${m.to}`);
  }

  /**
   * 检查是否为将军
   */
  isCheck(): boolean {
    return this.chess.isCheck();
  }

  /**
   * 检查是否为将死
   */
  isCheckmate(): boolean {
    return this.chess.isCheckmate();
  }

  /**
   * 检查是否为和棋
   */
  isDraw(): boolean {
    return this.chess.isDraw() || this.chess.isStalemate() || this.chess.isThreefoldRepetition() || this.chess.isInsufficientMaterial();
  }

  /**
   * 检查是否游戏结束
   */
  isGameOver(): boolean {
    return this.chess.isGameOver();
  }

  /**
   * 获取当前FEN
   */
  getFen(): string {
    return this.chess.fen();
  }

  /**
   * 获取当前轮到哪方
   */
  getTurn(): 'w' | 'b' {
    return this.chess.turn();
  }

  /**
   * 获取棋盘ASCII表示
   */
  getAscii(): string {
    return this.chess.ascii();
  }

  /**
   * 获取移动历史
   */
  getHistory(): string[] {
    return this.chess.history();
  }

  /**
   * 撤销移动
   */
  undo() {
    return this.chess.undo();
  }

  /**
   * 从PGN加载游戏
   */
  loadPgn(pgn: string): boolean {
    return this.chess.loadPgn(pgn);
  }

  /**
   * 获取PGN
   */
  getPgn(): string {
    return this.chess.pgn();
  }
}

/**
 * 将移动转换为UCI格式
 */
export function moveToUCI(from: string, to: string, promotion?: string): string {
  return `${from}${to}${promotion || ''}`;
}

/**
 * 解析UCI格式移动
 */
export function parseUCI(uci: string): { from: string; to: string; promotion?: string } {
  return {
    from: uci.substring(0, 2),
    to: uci.substring(2, 4),
    promotion: uci.length > 4 ? uci.substring(4) : undefined
  };
}

