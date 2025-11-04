// HTML模板
import { Language } from '../types';
import { getAllTranslations } from '../services/i18n';

export function getHTMLTemplate(lang: Language): string {
  const translations = getAllTranslations();
  
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AIChess - AI Chess Platform</title>
  <meta name="description" content="Play chess against 5 powerful AI models">
  <link rel="canonical" href="https://aichess.win/?lang=${lang}">
  <link rel="manifest" href="/manifest.json">
  <meta name="theme-color" content="#667eea">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      color: #333;
    }
    .container { max-width: 1400px; margin: 0 auto; padding: 20px; }
    #chessboard {
      width: 100%;
      max-width: 800px;
      aspect-ratio: 1;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(8, 1fr);
      grid-template-rows: repeat(8, 1fr);
      border: 3px solid #333;
      border-radius: 8px;
    }
    .square {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 3.5em;
      cursor: pointer;
      user-select: none;
    }
    .square.light { background-color: #f0d9b5; }
    .square.dark { background-color: #b58863; }
    .square.selected { background-color: #7fc97f !important; }
    .hidden { display: none !important; }
  </style>
</head>
<body>
  <div class="container">
    <div id="game-area">
      <div id="chessboard"></div>
    </div>
  </div>
  <script>
    const translations = ${JSON.stringify(translations)};
    let currentLanguage = '${lang}';
    let chess = null;
    let gameState = null;
    
    const t = (key) => translations[currentLanguage]?.[key] || key;
    
    async function init() {
      if (typeof Chess === 'undefined') {
        setTimeout(init, 100);
        return;
      }
      chess = new Chess();
      renderBoard();
    }
    
    function renderBoard() {
      const board = document.getElementById('chessboard');
      board.innerHTML = '';
      const squares = chess.board();
      
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          const square = document.createElement('div');
          square.className = 'square ' + ((row + col) % 2 === 0 ? 'light' : 'dark');
          const piece = squares[7 - row][col];
          if (piece) {
            const symbols = {
              'wp': '♙', 'wn': '♘', 'wb': '♗', 'wr': '♖', 'wq': '♕', 'wk': '♔',
              'bp': '♟', 'bn': '♞', 'bb': '♝', 'br': '♜', 'bq': '♛', 'bk': '♚'
            };
            square.textContent = symbols[piece.color + piece.type] || '';
          }
          board.appendChild(square);
        }
      }
    }
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  </script>
  <script src="/chess-engine.js"></script>
</body>
</html>`;
}

