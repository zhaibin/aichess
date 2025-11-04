// 完整的HTML模板（包含所有功能）
import { Language } from '../types';
import { getAllTranslations } from '../services/i18n';
import { getSEOTags } from './seo-tags.template';
import { AI_MODELS } from '../config/constants';

export function getFullHTMLTemplate(lang: Language): string {
  const translations = getAllTranslations();
  const t = (key: string) => translations[lang]?.[key] || translations['en'][key] || key;
  
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  ${getSEOTags(lang)}
  
  <!-- PWA -->
  <meta name="theme-color" content="#667eea">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <link rel="manifest" href="/manifest.json">
  
  <!-- Schema.org结构化数据 -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "AIChess",
    "url": "https://aichess.win",
    "description": "${t('appName')} - ${t('welcomeText')}",
    "applicationCategory": "GameApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "2000"
    }
  }
  </script>

  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      color: #333;
    }
    
    .container { max-width: 1400px; margin: 0 auto; padding: 20px; }
    
    /* 固定按钮 */
    .new-game-btn {
      position: fixed;
      top: 20px;
      left: 20px;
      z-index: 1000;
      background: #4caf50;
      color: white;
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-size: 1em;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      transition: all 0.3s;
      font-weight: 600;
    }
    
    .new-game-btn:hover {
      background: #45a049;
      transform: translateY(-2px);
    }
    
    /* 语言选择器 */
    .language-selector {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
    }
    
    .language-selector select {
      padding: 10px 15px;
      border: 2px solid #ddd;
      border-radius: 8px;
      font-size: 1em;
      background: white;
      cursor: pointer;
    }
    
    /* 侧边栏 */
    .setup-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 1999;
      display: none;
    }
    
    .setup-overlay.show { display: block; }
    
    .game-setup-sidebar {
      position: fixed;
      top: 0;
      right: -400px;
      width: 400px;
      height: 100vh;
      background: white;
      padding: 30px;
      box-shadow: -5px 0 20px rgba(0,0,0,0.3);
      transition: right 0.3s ease;
      z-index: 2000;
      overflow-y: auto;
    }
    
    .game-setup-sidebar.open { right: 0; }
    
    .close-setup {
      position: absolute;
      top: 20px;
      right: 20px;
      background: #f44336;
      color: white;
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      font-size: 1.5em;
      cursor: pointer;
    }
    
    /* 游戏区域 */
    .game-area {
      display: grid;
      grid-template-columns: 1fr 400px;
      gap: 20px;
    }
    
    @media (max-width: 1024px) {
      .game-area {
        grid-template-columns: 1fr;
      }
      .game-setup-sidebar {
        width: 100%;
        right: -100%;
      }
    }
    
    /* 棋盘 */
    .board-container {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }
    
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
      overflow: hidden;
      box-shadow: 0 8px 24px rgba(0,0,0,0.3);
    }
    
    .square {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 3.5em;
      cursor: pointer;
      transition: all 0.2s;
      user-select: none;
    }
    
    .square.light { background-color: #f0d9b5; }
    .square.dark { background-color: #b58863; }
    .square.selected {
      background-color: #7fc97f !important;
      box-shadow: inset 0 0 0 3px #4caf50;
    }
    
    @media (max-width: 768px) {
      .square { font-size: 2.5em; }
    }
    
    /* 信息面板 */
    .info-panel {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    
    .player-info {
      padding: 15px;
      border-radius: 8px;
      background: #f5f5f5;
    }
    
    .player-info.active {
      background: #e3f2fd;
      border: 2px solid #2196f3;
    }
    
    .player-name {
      font-weight: bold;
      font-size: 1.1em;
      margin-bottom: 8px;
    }
    
    .timer {
      font-size: 1.5em;
      font-weight: bold;
      color: #2196f3;
      font-family: 'Courier New', monospace;
    }
    
    .timer.low {
      color: #f44336;
      animation: pulse 1s infinite;
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    
    .move-history {
      flex: 1;
      overflow-y: auto;
      max-height: 400px;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 15px;
      background: #fafafa;
    }
    
    .move-history h3 {
      margin-bottom: 10px;
      color: #666;
    }
    
    /* 欢迎消息 */
    .welcome-message {
      text-align: center;
      padding: 40px 20px;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 12px;
      margin: 20px auto;
      max-width: 600px;
    }
    
    .welcome-message h2 {
      color: #667eea;
      margin-bottom: 15px;
      font-size: 2em;
    }
    
    .welcome-message p {
      color: #666;
      font-size: 1.1em;
      line-height: 1.6;
    }
    
    /* 按钮 */
    button {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-size: 1em;
      cursor: pointer;
      transition: all 0.3s;
      font-weight: 600;
    }
    
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }
    
    .btn-primary { background: #2196f3; color: white; }
    .btn-success { background: #4caf50; color: white; }
    .btn-danger { background: #f44336; color: white; }
    
    /* 表单 */
    .form-group { margin-bottom: 20px; }
    
    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: #555;
    }
    
    select, input {
      width: 100%;
      padding: 12px;
      border: 2px solid #ddd;
      border-radius: 8px;
      font-size: 1em;
    }
    
    select:focus, input:focus {
      outline: none;
      border-color: #2196f3;
    }
    
    /* Footer */
    footer {
      text-align: center;
      color: white;
      margin-top: 40px;
      padding: 30px 20px;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 12px;
    }
    
    footer h2 {
      font-size: 2em;
      margin-bottom: 15px;
    }
    
    .footer-links {
      margin-top: 20px;
      font-size: 0.9em;
    }
    
    .footer-links a {
      color: white;
      text-decoration: none;
      margin: 0 15px;
      opacity: 0.8;
    }
    
    .footer-links a:hover {
      opacity: 1;
      text-decoration: underline;
    }
    
    .hidden { display: none !important; }
  </style>
</head>
<body>
  <!-- 新游戏按钮 -->
  <button class="new-game-btn" onclick="openGameSetup()">
    <span id="new-game-btn-text">${t('newGame')}</span>
  </button>
  
  <!-- 遮罩层 -->
  <div class="setup-overlay" id="setup-overlay" onclick="closeGameSetup()"></div>
  
  <!-- 语言选择器 -->
  <div class="language-selector">
    <select id="language-select">
      <option value="zh-CN" ${lang === 'zh-CN' ? 'selected' : ''}>简体中文</option>
      <option value="zh-TW" ${lang === 'zh-TW' ? 'selected' : ''}>繁體中文</option>
      <option value="en" ${lang === 'en' ? 'selected' : ''}>English</option>
      <option value="fr" ${lang === 'fr' ? 'selected' : ''}>Français</option>
      <option value="es" ${lang === 'es' ? 'selected' : ''}>Español</option>
      <option value="de" ${lang === 'de' ? 'selected' : ''}>Deutsch</option>
      <option value="it" ${lang === 'it' ? 'selected' : ''}>Italiano</option>
      <option value="pt" ${lang === 'pt' ? 'selected' : ''}>Português</option>
      <option value="ru" ${lang === 'ru' ? 'selected' : ''}>Русский</option>
      <option value="ja" ${lang === 'ja' ? 'selected' : ''}>日本語</option>
      <option value="ko" ${lang === 'ko' ? 'selected' : ''}>한국어</option>
    </select>
  </div>
  
  <div class="container">
    <!-- 游戏设置侧边栏 -->
    <div class="game-setup-sidebar" id="game-setup">
      <button class="close-setup" onclick="closeGameSetup()">×</button>
      <h2 id="new-game-title">${t('newGame')}</h2>
      
      <div class="form-group">
        <label id="game-mode-label">${t('newGame')}</label>
        <select id="game-mode">
          <option value="human-vs-human">${t('humanVsHuman')}</option>
          <option value="human-vs-ai">${t('humanVsAI')}</option>
          <option value="ai-vs-ai">${t('aiVsAI')}</option>
        </select>
      </div>
      
      <div class="form-group">
        <label id="time-control-label">${t('timeControl')}</label>
        <select id="time-control">
          <option value="300">${t('minutes5')}</option>
          <option value="600" selected>${t('minutes10')}</option>
          <option value="900">${t('minutes15')}</option>
        </select>
      </div>
      
      <div class="form-group" id="white-ai-group" style="display:none;">
        <label id="white-ai-label">${t('whitePlayer')} ${t('ai')}</label>
        <select id="white-ai">
          ${Object.values(AI_MODELS).map(m => `<option value="${m.id}">${m.name}</option>`).join('\n          ')}
        </select>
      </div>
      
      <div class="form-group" id="black-ai-group" style="display:none;">
        <label id="black-ai-label">${t('blackPlayer')} ${t('ai')}</label>
        <select id="black-ai">
          ${Object.values(AI_MODELS).map(m => `<option value="${m.id}">${m.name}</option>`).join('\n          ')}
        </select>
      </div>
      
      <button class="btn-success" id="start-game" onclick="startGame()">${t('startGame')}</button>
    </div>
    
    <!-- 游戏区域 -->
    <div class="game-area" id="game-area">
      <div class="board-container">
        <!-- 欢迎消息 -->
        <div class="welcome-message" id="welcome-message">
          <h2 id="welcome-title">${t('appName')}</h2>
          <p id="welcome-text">${t('welcomeText')}</p>
          <p id="welcome-features">${t('welcomeFeatures')}</p>
        </div>
        
        <div id="chessboard"></div>
      </div>
      
      <div class="info-panel">
        <div class="player-info" id="white-player-info">
          <div class="player-name" id="white-player-name">${t('whitePlayer')}</div>
          <div class="timer" id="white-timer">10:00</div>
        </div>
        
        <div class="player-info" id="black-player-info">
          <div class="player-name" id="black-player-name">${t('blackPlayer')}</div>
          <div class="timer" id="black-timer">10:00</div>
        </div>
        
        <div class="move-history">
          <h3 id="move-history-title">${t('moveHistory')}</h3>
          <div id="move-list"></div>
        </div>
        
        <div class="game-controls">
          <button class="btn-danger" onclick="resign()">${t('resign')}</button>
        </div>
      </div>
    </div>
    
    <!-- Footer -->
    <footer>
      <h2>AIChess - Intelligent Chess Platform</h2>
      <p>Challenge 5 powerful AI chess players on a completely free online chess platform</p>
      <p>🤖 5 AI Models | 💯 Forever Free | 🌍 11 Languages | ⚡ Global CDN</p>
      
      <div class="footer-links">
        <a href="https://github.com/aichess/aichess" target="_blank" rel="noopener">GitHub</a>
        <span>|</span>
        <a href="#" onclick="openPrivacyPolicy(); return false;">Privacy Policy</a>
        <span>|</span>
        <a href="#" onclick="openTerms(); return false;">Terms of Service</a>
        <span>|</span>
        <a href="mailto:contact@aichess.win">Contact Us</a>
      </div>
      
      <div class="copyright">
        <p>© 2025 AIChess.win. All Rights Reserved.</p>
        <p>Open Source under MIT License | Powered by Cloudflare Workers & AI</p>
      </div>
    </footer>
  </div>
  
  <script>
    // 全局变量
    let gameState = null;
    let selectedSquare = null;
    let chess = null;
    let updateInterval = null;
    let currentLanguage = '${lang}';
    
    // 翻译
    const translations = ${JSON.stringify(translations)};
    const t = (key) => translations[currentLanguage]?.[key] || translations['en'][key] || key;
    
    // 初始化
    async function init() {
      if (typeof Chess === 'undefined') {
        console.log('等待Chess引擎加载...');
        setTimeout(init, 100);
        return;
      }
      
      console.log('Chess引擎已加载');
      chess = new Chess();
      updateLanguage();
      renderBoard();
      
      // 语言切换
      document.getElementById('language-select').addEventListener('change', (e) => {
        currentLanguage = e.target.value;
        updateLanguage();
        const url = new URL(window.location.href);
        url.searchParams.set('lang', currentLanguage);
        window.history.replaceState({}, '', url);
      });
      
      // 游戏模式切换
      document.getElementById('game-mode').addEventListener('change', updateAISelectors);
      updateAISelectors();
    }
    
    function updateLanguage() {
      const safeUpdate = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
      };
      
      safeUpdate('new-game-btn-text', t('newGame'));
      safeUpdate('new-game-title', t('newGame'));
      safeUpdate('welcome-title', t('appName'));
      safeUpdate('welcome-text', t('welcomeText'));
      safeUpdate('welcome-features', t('welcomeFeatures'));
      safeUpdate('game-mode-label', t('newGame'));
      safeUpdate('time-control-label', t('timeControl'));
      safeUpdate('white-ai-label', t('whitePlayer') + ' ' + t('ai'));
      safeUpdate('black-ai-label', t('blackPlayer') + ' ' + t('ai'));
      safeUpdate('start-game', t('startGame'));
      safeUpdate('move-history-title', t('moveHistory'));
      safeUpdate('white-player-name', t('whitePlayer'));
      safeUpdate('black-player-name', t('blackPlayer'));
      
      const gameModeSelect = document.getElementById('game-mode');
      if (gameModeSelect && gameModeSelect.options.length >= 3) {
        gameModeSelect.options[0].textContent = t('humanVsHuman');
        gameModeSelect.options[1].textContent = t('humanVsAI');
        gameModeSelect.options[2].textContent = t('aiVsAI');
      }
      
      const timeControlSelect = document.getElementById('time-control');
      if (timeControlSelect && timeControlSelect.options.length >= 3) {
        timeControlSelect.options[0].textContent = t('minutes5');
        timeControlSelect.options[1].textContent = t('minutes10');
        timeControlSelect.options[2].textContent = t('minutes15');
      }
    }
    
    function openGameSetup() {
      document.getElementById('game-setup').classList.add('open');
      document.getElementById('setup-overlay').classList.add('show');
    }
    
    function closeGameSetup() {
      document.getElementById('game-setup').classList.remove('open');
      document.getElementById('setup-overlay').classList.remove('show');
    }
    
    function updateAISelectors() {
      const mode = document.getElementById('game-mode').value;
      const whiteAI = document.getElementById('white-ai-group');
      const blackAI = document.getElementById('black-ai-group');
      
      if (mode === 'human-vs-ai') {
        whiteAI.style.display = 'none';
        blackAI.style.display = 'block';
      } else if (mode === 'ai-vs-ai') {
        whiteAI.style.display = 'block';
        blackAI.style.display = 'block';
      } else {
        whiteAI.style.display = 'none';
        blackAI.style.display = 'none';
      }
    }
    
    async function startGame() {
      if (typeof Chess === 'undefined') {
        alert(t('invalidMove'));
        return;
      }
      
      const mode = document.getElementById('game-mode').value;
      const timeControl = parseInt(document.getElementById('time-control').value);
      
      let whitePlayerType = 'human';
      let blackPlayerType = 'human';
      let whiteAIModel = null;
      let blackAIModel = null;
      
      if (mode === 'human-vs-ai') {
        blackPlayerType = 'ai';
        blackAIModel = document.getElementById('black-ai').value;
      } else if (mode === 'ai-vs-ai') {
        whitePlayerType = 'ai';
        blackPlayerType = 'ai';
        whiteAIModel = document.getElementById('white-ai').value;
        blackAIModel = document.getElementById('black-ai').value;
      }
      
      try {
        const response = await fetch('/api/create-game', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode,
            timeControl,
            whitePlayerType,
            blackPlayerType,
            whiteAIModel,
            blackAIModel
          })
        });
        
        gameState = await response.json();
        chess = new Chess(gameState.fen);
        
        closeGameSetup();
        document.getElementById('welcome-message').classList.add('hidden');
        
        renderBoard();
        updateGameInfo();
        
        updateInterval = setInterval(pollGameState, 1000);
      } catch (error) {
        console.error('Failed to start game:', error);
        alert(t('invalidMove'));
      }
    }
    
    function renderBoard() {
      if (!chess) {
        console.error('Chess引擎未初始化');
        return;
      }
      
      const board = document.getElementById('chessboard');
      if (!board) {
        console.error('棋盘容器未找到');
        return;
      }
      
      board.innerHTML = '';
      
      // 使用board()方法获取棋盘数组
      const squares = chess.board();
      
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          const square = document.createElement('div');
          square.className = 'square ' + ((row + col) % 2 === 0 ? 'light' : 'dark');
          square.dataset.square = String.fromCharCode(97 + col) + (row + 1);
          
          const piece = squares[7 - row][col];
          if (piece) {
            const symbols = {
              'wp': '♙', 'wn': '♘', 'wb': '♗', 'wr': '♖', 'wq': '♕', 'wk': '♔',
              'bp': '♟', 'bn': '♞', 'bb': '♝', 'br': '♜', 'bq': '♛', 'bk': '♚'
            };
            square.textContent = symbols[piece.color + piece.type] || '';
          }
          
          square.addEventListener('click', () => handleSquareClick(square));
          board.appendChild(square);
        }
      }
    }
    
    function handleSquareClick(square) {
      if (!gameState || gameState.status !== 'active') return;
      
      const squareName = square.dataset.square;
      
      if (selectedSquare) {
        makeMove(selectedSquare, squareName);
        selectedSquare = null;
        clearHighlights();
      } else {
        const piece = chess.get(squareName);
        if (piece && piece.color === chess.turn) {
          selectedSquare = squareName;
          highlightSquare(square);
        }
      }
    }
    
    function highlightSquare(square) {
      clearHighlights();
      square.classList.add('selected');
    }
    
    function clearHighlights() {
      document.querySelectorAll('.square.selected').forEach(sq => {
        sq.classList.remove('selected');
      });
    }
    
    async function makeMove(from, to) {
      try {
        const response = await fetch('/api/make-move', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gameId: gameState.id, from, to })
        });
        
        if (response.ok) {
          gameState = await response.json();
          chess = new Chess(gameState.fen);
          renderBoard();
          updateGameInfo();
        }
      } catch (error) {
        console.error('Move failed:', error);
      }
    }
    
    async function pollGameState() {
      if (!gameState) return;
      
      try {
        const response = await fetch('/api/game-state?gameId=' + gameState.id);
        const newState = await response.json();
        
        if (newState.fen !== gameState.fen) {
          gameState = newState;
          chess = new Chess(gameState.fen);
          renderBoard();
          updateGameInfo();
        }
      } catch (error) {
        console.error('Poll failed:', error);
      }
    }
    
    function updateGameInfo() {
      document.getElementById('white-player-name').textContent = gameState.whitePlayer.name;
      document.getElementById('black-player-name').textContent = gameState.blackPlayer.name;
      
      updateTimer('white-timer', gameState.whitePlayer.timeRemaining);
      updateTimer('black-timer', gameState.blackPlayer.timeRemaining);
      
      if (gameState.currentTurn === 'w') {
        document.getElementById('white-player-info').classList.add('active');
        document.getElementById('black-player-info').classList.remove('active');
      } else {
        document.getElementById('white-player-info').classList.remove('active');
        document.getElementById('black-player-info').classList.add('active');
      }
      
      updateMoveHistory();
    }
    
    function updateTimer(id, seconds) {
      const el = document.getElementById(id);
      if (!el) return;
      
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      el.textContent = mins + ':' + (secs < 10 ? '0' : '') + secs;
      
      if (seconds < 60) {
        el.classList.add('low');
      } else {
        el.classList.remove('low');
      }
    }
    
    function updateMoveHistory() {
      const moveList = document.getElementById('move-list');
      if (!moveList || !gameState.moves) return;
      
      moveList.innerHTML = '';
      for (let i = 0; i < gameState.moves.length; i++) {
        const move = gameState.moves[i];
        const moveEl = document.createElement('div');
        moveEl.textContent = (Math.floor(i/2) + 1) + '. ' + move.san;
        moveList.appendChild(moveEl);
      }
    }
    
    async function resign() {
      if (!gameState) return;
      if (confirm(t('resign') + '?')) {
        // 实现认输逻辑
        if (updateInterval) clearInterval(updateInterval);
        alert(t('gameOver'));
      }
    }
    
    function openPrivacyPolicy() {
      alert('Privacy Policy (English Only)\\n\\nWe respect your privacy...');
    }
    
    function openTerms() {
      alert('Terms of Service (English Only)\\n\\nBy using AIChess...');
    }
    
    // 启动
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

