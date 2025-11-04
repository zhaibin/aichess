// 棋盘组件
declare const Chess: any;

export class ChessBoard {
  private containerId: string;
  private chess: any;
  private selectedSquare: string | null = null;

  constructor(containerId: string) {
    this.containerId = containerId;
    this.chess = new Chess();
  }

  render(): void {
    const container = document.getElementById(this.containerId);
    if (!container) {
      console.error('Board container not found');
      return;
    }

    container.innerHTML = '';
    container.className = 'chessboard';

    const board = this.chess.board();
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const square = document.createElement('div');
        square.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
        square.dataset.square = this.indexToSquare(row, col);
        
        const piece = board[7 - row][col];
        if (piece) {
          square.textContent = this.getPieceSymbol(piece);
        }

        square.addEventListener('click', () => this.handleSquareClick(square));
        container.appendChild(square);
      }
    }
  }

  private handleSquareClick(square: HTMLElement): void {
    const squareName = square.dataset.square!;

    if (this.selectedSquare) {
      // 尝试移动
      const result = this.chess.move({
        from: this.selectedSquare,
        to: squareName
      });

      if (result) {
        this.render();
      }
      
      this.selectedSquare = null;
      this.clearHighlights();
    } else {
      // 选择棋子
      const piece = this.chess.get(squareName);
      if (piece && piece.color === this.chess.turn) {
        this.selectedSquare = squareName;
        this.highlightSquare(square);
      }
    }
  }

  private highlightSquare(square: HTMLElement): void {
    this.clearHighlights();
    square.classList.add('selected');
  }

  private clearHighlights(): void {
    document.querySelectorAll('.square.selected').forEach(sq => {
      sq.classList.remove('selected');
    });
  }

  private indexToSquare(row: number, col: number): string {
    const file = String.fromCharCode(97 + col); // a-h
    const rank = (row + 1).toString(); // 1-8
    return file + rank;
  }

  private getPieceSymbol(piece: any): string {
    const symbols: Record<string, string> = {
      'wp': '♙', 'wn': '♘', 'wb': '♗', 'wr': '♖', 'wq': '♕', 'wk': '♔',
      'bp': '♟', 'bn': '♞', 'bb': '♝', 'br': '♜', 'bq': '♛', 'bk': '♚'
    };
    return symbols[piece.color + piece.type] || '';
  }

  reset(): void {
    this.chess = new Chess();
    this.selectedSquare = null;
    this.render();
  }
}

