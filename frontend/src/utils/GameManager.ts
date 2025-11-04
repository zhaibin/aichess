// 游戏管理器
import { ChessBoard } from '../components/ChessBoard';
import { api } from './api';

export class GameManager {
  private board: ChessBoard;
  private gameId: string | null = null;
  private updateInterval: number | null = null;

  constructor(board: ChessBoard) {
    this.board = board;
  }

  async startNewGame(): Promise<void> {
    try {
      const game = await api.createGame({
        mode: 'human-vs-ai',
        timeControl: 600,
        whitePlayerType: 'human',
        blackPlayerType: 'ai',
        blackAIModel: 'gpt-oss-20b'
      });

      this.gameId = game.id;
      this.board.reset();
      
      // 开始轮询游戏状态
      this.startPolling();
      
      console.log('Game started:', this.gameId);
    } catch (error) {
      console.error('Failed to start game:', error);
      alert('Failed to start game. Please try again.');
    }
  }

  private startPolling(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateInterval = window.setInterval(async () => {
      if (this.gameId) {
        try {
          const game = await api.getGameState(this.gameId);
          // 更新UI
          this.updateGameInfo(game);
        } catch (error) {
          console.error('Failed to poll game state:', error);
        }
      }
    }, 1000);
  }

  private updateGameInfo(game: any): void {
    const infoPanel = document.getElementById('game-info');
    if (infoPanel) {
      infoPanel.innerHTML = `
        <div class="player-info">
          <h3>White: ${game.whitePlayer.name}</h3>
          <p>Time: ${this.formatTime(game.whitePlayer.timeRemaining)}</p>
        </div>
        <div class="player-info">
          <h3>Black: ${game.blackPlayer.name}</h3>
          <p>Time: ${this.formatTime(game.blackPlayer.timeRemaining)}</p>
        </div>
        <div class="game-status">
          <p>Status: ${game.status}</p>
          <p>Turn: ${game.currentTurn === 'w' ? 'White' : 'Black'}</p>
        </div>
      `;
    }
  }

  private formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  stopPolling(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
}

