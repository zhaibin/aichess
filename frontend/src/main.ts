// AIChess Frontend Entry Point
import './styles/main.css';
import { ChessBoard } from './components/ChessBoard';
import { GameManager } from './utils/GameManager';

// 初始化应用
async function init() {
  console.log('AIChess v4.0 Frontend Initializing...');
  
  const app = document.getElementById('app');
  if (!app) {
    console.error('App container not found');
    return;
  }

  // 创建基本UI结构
  app.innerHTML = `
    <div class="container">
      <header class="header">
        <h1>AIChess</h1>
        <button id="new-game-btn" class="btn-primary">New Game</button>
      </header>
      <main class="game-area">
        <div class="board-container">
          <div id="chessboard"></div>
        </div>
        <div class="info-panel">
          <div id="game-info"></div>
        </div>
      </main>
    </div>
  `;

  // 初始化Chess引擎（从backend加载）
  await loadChessEngine();
  
  // 初始化棋盘
  const board = new ChessBoard('chessboard');
  board.render();

  // 初始化游戏管理器
  const gameManager = new GameManager(board);

  // 绑定事件
  document.getElementById('new-game-btn')?.addEventListener('click', () => {
    gameManager.startNewGame();
  });

  console.log('AIChess v4.0 Frontend Ready!');
}

// 加载Chess引擎
async function loadChessEngine(): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = '/chess-engine.js';
    script.onload = () => {
      console.log('Chess Engine loaded');
      resolve();
    };
    script.onerror = () => {
      console.error('Failed to load Chess Engine');
      reject(new Error('Chess Engine load failed'));
    };
    document.head.appendChild(script);
  });
}

// 启动应用
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

