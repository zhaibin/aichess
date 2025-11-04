// 完整的国际象棋引擎实现（不依赖外部库）

export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type PieceColor = 'w' | 'b';

export interface Piece {
  type: PieceType;
  color: PieceColor;
}

export interface Square {
  file: number; // 0-7 (a-h)
  rank: number; // 0-7 (1-8)
}

export interface Move {
  from: Square;
  to: Square;
  piece: Piece;
  captured?: Piece;
  promotion?: PieceType;
  castling?: 'k' | 'q';
  enPassant?: boolean;
}

/**
 * 国际象棋引擎类
 */
export class ChessEngine {
  private board: (Piece | null)[][];
  private currentTurn: PieceColor;
  private castlingRights: { w: { k: boolean; q: boolean }; b: { k: boolean; q: boolean } };
  private enPassantTarget: Square | null;
  private halfMoveClock: number;
  private fullMoveNumber: number;
  private moveHistory: Move[];

  constructor(fen?: string) {
    this.board = this.createEmptyBoard();
    this.currentTurn = 'w';
    this.castlingRights = {
      w: { k: true, q: true },
      b: { k: true, q: true }
    };
    this.enPassantTarget = null;
    this.halfMoveClock = 0;
    this.fullMoveNumber = 1;
    this.moveHistory = [];

    if (fen) {
      this.loadFen(fen);
    } else {
      this.setupInitialPosition();
    }
  }

  /**
   * 创建空棋盘
   */
  private createEmptyBoard(): (Piece | null)[][] {
    return Array(8).fill(null).map(() => Array(8).fill(null));
  }

  /**
   * 设置初始位置
   */
  private setupInitialPosition(): void {
    // 白方
    this.board[0] = [
      { type: 'r', color: 'w' },
      { type: 'n', color: 'w' },
      { type: 'b', color: 'w' },
      { type: 'q', color: 'w' },
      { type: 'k', color: 'w' },
      { type: 'b', color: 'w' },
      { type: 'n', color: 'w' },
      { type: 'r', color: 'w' }
    ];
    this.board[1] = Array(8).fill(null).map(() => ({ type: 'p', color: 'w' }));

    // 黑方
    this.board[7] = [
      { type: 'r', color: 'b' },
      { type: 'n', color: 'b' },
      { type: 'b', color: 'b' },
      { type: 'q', color: 'b' },
      { type: 'k', color: 'b' },
      { type: 'b', color: 'b' },
      { type: 'n', color: 'b' },
      { type: 'r', color: 'b' }
    ];
    this.board[6] = Array(8).fill(null).map(() => ({ type: 'p', color: 'b' }));

    // 中间空行
    for (let i = 2; i < 6; i++) {
      this.board[i] = Array(8).fill(null);
    }
  }

  /**
   * 从FEN字符串加载棋盘
   */
  private loadFen(fen: string): void {
    const parts = fen.split(' ');
    const position = parts[0];
    
    // 解析棋盘位置
    const ranks = position.split('/');
    for (let rank = 0; rank < 8; rank++) {
      let file = 0;
      for (const char of ranks[7 - rank]) {
        if (char >= '1' && char <= '8') {
          file += parseInt(char);
        } else {
          const color: PieceColor = char === char.toUpperCase() ? 'w' : 'b';
          const type = char.toLowerCase() as PieceType;
          this.board[rank][file] = { type, color };
          file++;
        }
      }
    }

    // 解析轮到谁
    this.currentTurn = parts[1] === 'w' ? 'w' : 'b';

    // 解析王车易位权限
    if (parts[2]) {
      this.castlingRights = {
        w: { k: parts[2].includes('K'), q: parts[2].includes('Q') },
        b: { k: parts[2].includes('k'), q: parts[2].includes('q') }
      };
    }

    // 解析吃过路兵目标
    if (parts[3] && parts[3] !== '-') {
      this.enPassantTarget = this.algebraicToSquare(parts[3]);
    }

    // 解析半回合和全回合数
    this.halfMoveClock = parts[4] ? parseInt(parts[4]) : 0;
    this.fullMoveNumber = parts[5] ? parseInt(parts[5]) : 1;
  }

  /**
   * 转换代数记号为Square
   */
  private algebraicToSquare(algebraic: string): Square {
    return {
      file: algebraic.charCodeAt(0) - 97, // a=0, b=1, ...
      rank: parseInt(algebraic[1]) - 1
    };
  }

  /**
   * 转换Square为代数记号
   */
  private squareToAlgebraic(square: Square): string {
    return String.fromCharCode(97 + square.file) + (square.rank + 1);
  }

  /**
   * 获取FEN字符串
   */
  getFen(): string {
    let fen = '';

    // 棋盘位置
    for (let rank = 7; rank >= 0; rank--) {
      let empty = 0;
      for (let file = 0; file < 8; file++) {
        const piece = this.board[rank][file];
        if (piece) {
          if (empty > 0) {
            fen += empty;
            empty = 0;
          }
          const char = piece.color === 'w' ? piece.type.toUpperCase() : piece.type;
          fen += char;
        } else {
          empty++;
        }
      }
      if (empty > 0) fen += empty;
      if (rank > 0) fen += '/';
    }

    fen += ` ${this.currentTurn}`;

    // 王车易位
    let castling = '';
    if (this.castlingRights.w.k) castling += 'K';
    if (this.castlingRights.w.q) castling += 'Q';
    if (this.castlingRights.b.k) castling += 'k';
    if (this.castlingRights.b.q) castling += 'q';
    fen += ` ${castling || '-'}`;

    // 吃过路兵
    fen += ` ${this.enPassantTarget ? this.squareToAlgebraic(this.enPassantTarget) : '-'}`;

    // 半回合和全回合
    fen += ` ${this.halfMoveClock} ${this.fullMoveNumber}`;

    return fen;
  }

  /**
   * 获取棋盘数组
   */
  getBoard(): (Piece | null)[][] {
    return this.board.map(rank => [...rank]);
  }

  /**
   * 获取某位置的棋子
   */
  getPiece(square: Square): Piece | null {
    if (!this.isValidSquare(square)) return null;
    return this.board[square.rank][square.file];
  }

  /**
   * 验证方格是否有效
   */
  private isValidSquare(square: Square): boolean {
    return square.rank >= 0 && square.rank < 8 && square.file >= 0 && square.file < 8;
  }

  /**
   * 执行移动
   */
  makeMove(from: string, to: string, promotion?: string): { success: boolean; san?: string; fen?: string } {
    const fromSquare = this.algebraicToSquare(from);
    const toSquare = this.algebraicToSquare(to);

    if (!this.isLegalMove(fromSquare, toSquare)) {
      return { success: false };
    }

    const piece = this.getPiece(fromSquare);
    if (!piece) return { success: false };

    // 执行移动
    const captured = this.getPiece(toSquare);
    this.board[toSquare.rank][toSquare.file] = piece;
    this.board[fromSquare.rank][fromSquare.file] = null;

    // 升变
    if (promotion && piece.type === 'p' && (toSquare.rank === 0 || toSquare.rank === 7)) {
      this.board[toSquare.rank][toSquare.file] = { type: promotion as PieceType, color: piece.color };
    }

    // 记录移动
    this.moveHistory.push({
      from: fromSquare,
      to: toSquare,
      piece,
      captured
    });

    // 切换轮次
    this.currentTurn = this.currentTurn === 'w' ? 'b' : 'w';
    if (this.currentTurn === 'w') {
      this.fullMoveNumber++;
    }

    return { success: true, san: `${from}${to}`, fen: this.getFen() };
  }

  /**
   * 检查移动是否合法
   */
  private isLegalMove(from: Square, to: Square): boolean {
    const piece = this.getPiece(from);
    if (!piece) return false;
    if (piece.color !== this.currentTurn) return false;
    if (!this.isValidSquare(to)) return false;

    const targetPiece = this.getPiece(to);
    if (targetPiece && targetPiece.color === piece.color) return false;

    // 基本移动规则检查
    return this.canPieceMove(piece, from, to);
  }

  /**
   * 检查棋子是否可以移动到目标位置
   */
  private canPieceMove(piece: Piece, from: Square, to: Square): boolean {
    const dx = to.file - from.file;
    const dy = to.rank - from.rank;

    switch (piece.type) {
      case 'p': // 兵
        return this.canPawnMove(piece.color, from, to, dx, dy);
      case 'n': // 马
        return Math.abs(dx) * Math.abs(dy) === 2;
      case 'b': // 象
        return Math.abs(dx) === Math.abs(dy) && this.isPathClear(from, to);
      case 'r': // 车
        return (dx === 0 || dy === 0) && this.isPathClear(from, to);
      case 'q': // 后
        return (dx === 0 || dy === 0 || Math.abs(dx) === Math.abs(dy)) && this.isPathClear(from, to);
      case 'k': // 王
        return Math.abs(dx) <= 1 && Math.abs(dy) <= 1;
      default:
        return false;
    }
  }

  /**
   * 检查兵的移动
   */
  private canPawnMove(color: PieceColor, from: Square, to: Square, dx: number, dy: number): boolean {
    const direction = color === 'w' ? 1 : -1;
    const startRank = color === 'w' ? 1 : 6;
    const targetPiece = this.getPiece(to);

    // 直走
    if (dx === 0 && dy === direction && !targetPiece) {
      return true;
    }

    // 首次移动两格
    if (dx === 0 && dy === 2 * direction && from.rank === startRank && !targetPiece) {
      const midSquare = { file: from.file, rank: from.rank + direction };
      return !this.getPiece(midSquare);
    }

    // 吃子
    if (Math.abs(dx) === 1 && dy === direction && targetPiece && targetPiece.color !== color) {
      return true;
    }

    return false;
  }

  /**
   * 检查路径是否畅通
   */
  private isPathClear(from: Square, to: Square): boolean {
    const dx = Math.sign(to.file - from.file);
    const dy = Math.sign(to.rank - from.rank);

    let x = from.file + dx;
    let y = from.rank + dy;

    while (x !== to.file || y !== to.rank) {
      if (this.board[y][x] !== null) return false;
      x += dx;
      y += dy;
    }

    return true;
  }

  /**
   * 获取所有合法移动
   */
  getLegalMoves(): string[] {
    const moves: string[] = [];

    for (let fromRank = 0; fromRank < 8; fromRank++) {
      for (let fromFile = 0; fromFile < 8; fromFile++) {
        const piece = this.board[fromRank][fromFile];
        if (!piece || piece.color !== this.currentTurn) continue;

        for (let toRank = 0; toRank < 8; toRank++) {
          for (let toFile = 0; toFile < 8; toFile++) {
            const from = { file: fromFile, rank: fromRank };
            const to = { file: toFile, rank: toRank };

            if (this.isLegalMove(from, to)) {
              moves.push(this.squareToAlgebraic(from) + this.squareToAlgebraic(to));
            }
          }
        }
      }
    }

    return moves;
  }

  /**
   * 获取当前轮次
   */
  getTurn(): PieceColor {
    return this.currentTurn;
  }

  /**
   * 检查是否被将军
   */
  isCheck(): boolean {
    // 找到己方国王
    const king = this.findKing(this.currentTurn);
    if (!king) return false;

    // 检查是否有对方棋子可以攻击国王
    return this.isSquareAttacked(king, this.currentTurn === 'w' ? 'b' : 'w');
  }

  /**
   * 查找国王位置
   */
  private findKing(color: PieceColor): Square | null {
    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const piece = this.board[rank][file];
        if (piece && piece.type === 'k' && piece.color === color) {
          return { file, rank };
        }
      }
    }
    return null;
  }

  /**
   * 检查方格是否被攻击
   */
  private isSquareAttacked(square: Square, byColor: PieceColor): boolean {
    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const piece = this.board[rank][file];
        if (!piece || piece.color !== byColor) continue;

        const from = { file, rank };
        if (this.canPieceMove(piece, from, square)) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * 检查是否将死
   */
  isCheckmate(): boolean {
    return this.isCheck() && this.getLegalMoves().length === 0;
  }

  /**
   * 检查是否和棋
   */
  isDraw(): boolean {
    return this.isStalemate() || this.isInsufficientMaterial();
  }

  /**
   * 检查是否僵局
   */
  isStalemate(): boolean {
    return !this.isCheck() && this.getLegalMoves().length === 0;
  }

  /**
   * 检查是否子力不足
   */
  private isInsufficientMaterial(): boolean {
    let pieces = 0;
    let knights = 0;
    let bishops = 0;

    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const piece = this.board[rank][file];
        if (piece) {
          pieces++;
          if (piece.type === 'n') knights++;
          if (piece.type === 'b') bishops++;
          if (piece.type === 'p' || piece.type === 'r' || piece.type === 'q') {
            return false; // 有兵、车或后，不是子力不足
          }
        }
      }
    }

    // 只有王、或王+马、或王+象
    return pieces <= 3 && knights + bishops <= 1;
  }

  /**
   * 检查游戏是否结束
   */
  isGameOver(): boolean {
    return this.isCheckmate() || this.isDraw();
  }

  /**
   * 撤销移动
   */
  undo(): boolean {
    const lastMove = this.moveHistory.pop();
    if (!lastMove) return false;

    this.board[lastMove.from.rank][lastMove.from.file] = lastMove.piece;
    this.board[lastMove.to.rank][lastMove.to.file] = lastMove.captured || null;
    this.currentTurn = this.currentTurn === 'w' ? 'b' : 'w';

    return true;
  }

  /**
   * 获取移动历史（SAN格式简化版）
   */
  getHistory(): string[] {
    return this.moveHistory.map(m => 
      this.squareToAlgebraic(m.from) + this.squareToAlgebraic(m.to)
    );
  }
}

