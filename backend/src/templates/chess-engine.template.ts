// Chess引擎模板
export function getChessEngineScript(): string {
  return `// AIChess自研国际象棋引擎 v4.0
class ChessEngine {
  constructor(fen) {
    this._board = this.createEmptyBoard();
    this.turn = 'w';
    this.moveHistory = [];
    
    if (fen) {
      this.loadFen(fen);
    } else {
      this.setupInitialPosition();
    }
  }

  createEmptyBoard() {
    return Array(8).fill(null).map(() => Array(8).fill(null));
  }

  setupInitialPosition() {
    const backRow = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
    this._board[0] = backRow.map(t => ({ type: t, color: 'w' }));
    this._board[1] = Array(8).fill(null).map(() => ({ type: 'p', color: 'w' }));
    this._board[6] = Array(8).fill(null).map(() => ({ type: 'p', color: 'b' }));
    this._board[7] = backRow.map(t => ({ type: t, color: 'b' }));
    for (let i = 2; i < 6; i++) this._board[i] = Array(8).fill(null);
  }

  loadFen(fen) {
    const parts = fen.split(' ');
    const ranks = parts[0].split('/');
    for (let rank = 0; rank < 8; rank++) {
      let file = 0;
      for (const char of ranks[7 - rank]) {
        if (char >= '1' && char <= '8') {
          file += parseInt(char);
        } else {
          const color = char === char.toUpperCase() ? 'w' : 'b';
          this._board[rank][file++] = { type: char.toLowerCase(), color };
        }
      }
    }
    this.turn = parts[1] || 'w';
  }

  fen() {
    let fen = '';
    for (let rank = 7; rank >= 0; rank--) {
      let empty = 0;
      for (let file = 0; file < 8; file++) {
        const piece = this._board[rank][file];
        if (piece) {
          if (empty) { fen += empty; empty = 0; }
          fen += piece.color === 'w' ? piece.type.toUpperCase() : piece.type;
        } else empty++;
      }
      if (empty) fen += empty;
      if (rank > 0) fen += '/';
    }
    return fen + ' ' + this.turn + ' KQkq - 0 1';
  }

  board() {
    return this._board.map(r => r.map(p => p ? { type: p.type, color: p.color } : null));
  }

  get(sq) {
    const pos = this.parseSquare(sq);
    return pos ? this._board[pos.rank][pos.file] : null;
  }

  parseSquare(sq) {
    if (sq.length !== 2) return null;
    const file = sq.charCodeAt(0) - 97;
    const rank = parseInt(sq[1]) - 1;
    return file >= 0 && file < 8 && rank >= 0 && rank < 8 ? { file, rank } : null;
  }

  squareToString(pos) {
    return String.fromCharCode(97 + pos.file) + (pos.rank + 1);
  }

  move(moveObj) {
    const from = this.parseSquare(moveObj.from);
    const to = this.parseSquare(moveObj.to);
    if (!from || !to) return null;

    const piece = this._board[from.rank][from.file];
    if (!piece || piece.color !== this.turn) return null;

    if (!this.isLegalMove(from, to)) return null;

    const captured = this._board[to.rank][to.file];
    this._board[to.rank][to.file] = piece;
    this._board[from.rank][from.file] = null;

    if (moveObj.promotion && piece.type === 'p' && (to.rank === 0 || to.rank === 7)) {
      this._board[to.rank][to.file] = { type: moveObj.promotion, color: piece.color };
    }

    const move = {
      from: moveObj.from,
      to: moveObj.to,
      san: moveObj.from + moveObj.to,
      piece: piece.type,
      captured: captured ? captured.type : undefined
    };

    this.moveHistory.push(move);
    this.turn = this.turn === 'w' ? 'b' : 'w';
    return move;
  }

  isLegalMove(from, to) {
    const piece = this._board[from.rank][from.file];
    if (!piece) return false;

    const target = this._board[to.rank][to.file];
    if (target && target.color === piece.color) return false;

    return this.canPieceMove(piece, from, to);
  }

  canPieceMove(piece, from, to) {
    const dx = to.file - from.file;
    const dy = to.rank - from.rank;

    switch (piece.type) {
      case 'p':
        const dir = piece.color === 'w' ? 1 : -1;
        const startRank = piece.color === 'w' ? 1 : 6;
        const target = this._board[to.rank][to.file];
        if (dx === 0 && dy === dir && !target) return true;
        if (dx === 0 && dy === 2 * dir && from.rank === startRank && !target) {
          return !this._board[from.rank + dir][from.file];
        }
        if (Math.abs(dx) === 1 && dy === dir && target && target.color !== piece.color) return true;
        return false;
      case 'n':
        return Math.abs(dx) * Math.abs(dy) === 2;
      case 'b':
        return Math.abs(dx) === Math.abs(dy) && this.isPathClear(from, to);
      case 'r':
        return (dx === 0 || dy === 0) && this.isPathClear(from, to);
      case 'q':
        return (dx === 0 || dy === 0 || Math.abs(dx) === Math.abs(dy)) && this.isPathClear(from, to);
      case 'k':
        return Math.abs(dx) <= 1 && Math.abs(dy) <= 1;
      default:
        return false;
    }
  }

  isPathClear(from, to) {
    const dx = Math.sign(to.file - from.file);
    const dy = Math.sign(to.rank - from.rank);
    let x = from.file + dx;
    let y = from.rank + dy;
    while (x !== to.file || y !== to.rank) {
      if (this._board[y][x]) return false;
      x += dx;
      y += dy;
    }
    return true;
  }

  moves(opts) {
    const moves = [];
    const square = opts && opts.square ? this.parseSquare(opts.square) : null;
    
    for (let fromRank = 0; fromRank < 8; fromRank++) {
      for (let fromFile = 0; fromFile < 8; fromFile++) {
        if (square && (square.rank !== fromRank || square.file !== fromFile)) continue;
        
        const piece = this._board[fromRank][fromFile];
        if (!piece || piece.color !== this.turn) continue;

        for (let toRank = 0; toRank < 8; toRank++) {
          for (let toFile = 0; toFile < 8; toFile++) {
            const from = { file: fromFile, rank: fromRank };
            const to = { file: toFile, rank: toRank };
            if (this.isLegalMove(from, to)) {
              moves.push({
                from: this.squareToString(from),
                to: this.squareToString(to)
              });
            }
          }
        }
      }
    }
    return moves;
  }

  isCheck() { return false; }
  isCheckmate() { return false; }
  isDraw() { return false; }
  isStalemate() { return false; }
  isGameOver() { return this.moves().length === 0; }
  history() { return this.moveHistory.map(m => m.san); }
  undo() {
    const last = this.moveHistory.pop();
    if (last) this.turn = this.turn === 'w' ? 'b' : 'w';
    return last;
  }
}

window.Chess = ChessEngine;
console.log('AIChess Engine v4.0 loaded');`;
}

