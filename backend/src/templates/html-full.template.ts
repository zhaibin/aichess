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
    
    .board-wrapper {
      position: relative;
      width: 100%;
      max-width: 800px;
      margin: 0 auto;
    }
    
    #chessboard {
      width: 100%;
      aspect-ratio: 1;
      display: grid;
      grid-template-columns: repeat(8, 1fr);
      grid-template-rows: repeat(8, 1fr);
      border: 3px solid #333;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 8px 24px rgba(0,0,0,0.3);
    }
    
    /* 坐标标注 */
    .coordinates {
      position: absolute;
      font-weight: bold;
      color: #333;
      font-size: 0.9em;
      user-select: none;
    }
    
    .file-coords {
      bottom: -25px;
      left: 0;
      right: 0;
      display: flex;
      justify-content: space-around;
    }
    
    .file-coord {
      flex: 1;
      text-align: center;
    }
    
    .rank-coords {
      position: absolute;
      left: -25px;
      top: 0;
      bottom: 0;
      display: flex;
      flex-direction: column-reverse;
      justify-content: space-around;
    }
    
    .rank-coord {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
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
    
    .square.can-move {
      box-shadow: inset 0 0 0 2px rgba(76, 175, 80, 0.3);
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
      transition: all 0.3s ease;
      border: 3px solid transparent;
    }
    
    .player-info.active {
      background: #e3f2fd;
      border: 3px solid #2196f3;
      animation: pulse-border 1.5s ease-in-out infinite;
      box-shadow: 0 0 20px rgba(33, 150, 243, 0.4);
    }
    
    @keyframes pulse-border {
      0%, 100% {
        border-color: #2196f3;
        box-shadow: 0 0 20px rgba(33, 150, 243, 0.4);
      }
      50% {
        border-color: #ff9800;
        box-shadow: 0 0 30px rgba(255, 152, 0, 0.6);
      }
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
    
    .move-item {
      padding: 8px;
      margin-bottom: 5px;
      background: white;
      border-radius: 4px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .move-number {
      font-weight: bold;
      color: #666;
      min-width: 35px;
      display: inline-block;
    }
    
    .white-move {
      color: #333;
      font-weight: 600;
      margin-right: 12px;
      min-width: 50px;
      display: inline-block;
    }
    
    .black-move {
      color: #666;
      font-weight: 600;
      min-width: 50px;
      display: inline-block;
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
    
    /* 升变选择对话框 */
    .promotion-dialog {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 10px 50px rgba(0,0,0,0.5);
      z-index: 3000;
      display: none;
    }
    
    .promotion-dialog.show { display: block; }
    
    .promotion-dialog h3 {
      margin-bottom: 20px;
      color: #333;
      text-align: center;
    }
    
    .promotion-options {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
    }
    
    .promotion-piece {
      width: 80px;
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 3em;
      background: #f0f0f0;
      border: 2px solid #ddd;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .promotion-piece:hover {
      background: #e0e0e0;
      border-color: #2196f3;
      transform: scale(1.1);
    }
    
    /* 胜利庆祝效果 */
    .victory-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      z-index: 9999;
      display: none;
      align-items: center;
      justify-content: center;
      flex-direction: column;
    }
    
    .victory-overlay.show { display: flex; }
    
    .victory-message {
      background: white;
      padding: 50px;
      border-radius: 20px;
      text-align: center;
      animation: victoryPop 0.5s ease-out;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    }
    
    .victory-message h2 {
      font-size: 3em;
      color: #4caf50;
      margin-bottom: 20px;
      animation: pulse 2s ease-in-out infinite;
    }
    
    .victory-message p {
      font-size: 1.5em;
      color: #666;
      margin-bottom: 30px;
    }
    
    .victory-message button {
      background: #4caf50;
      color: white;
      padding: 15px 40px;
      border: none;
      border-radius: 10px;
      font-size: 1.2em;
      cursor: pointer;
      transition: all 0.3s;
    }
    
    .victory-message button:hover {
      background: #45a049;
      transform: scale(1.05);
    }
    
    @keyframes victoryPop {
      0% {
        transform: scale(0);
        opacity: 0;
      }
      50% {
        transform: scale(1.1);
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
    }
    
    /* 撒花效果 */
    .confetti {
      position: absolute;
      width: 10px;
      height: 10px;
      background: #f44336;
      animation: confetti-fall 3s linear infinite;
    }
    
    @keyframes confetti-fall {
      0% {
        top: -10%;
        opacity: 1;
      }
      100% {
        top: 110%;
        opacity: 0;
        transform: rotate(720deg);
      }
    }
  </style>
</head>
<body>
  <!-- 胜利庆祝 -->
  <div class="victory-overlay" id="victory-overlay">
    <div class="victory-message">
      <h2 id="victory-title">🎉 将死！</h2>
      <p id="victory-text"></p>
      <button onclick="location.reload()">再来一局</button>
    </div>
  </div>
  <!-- 升变选择对话框 -->
  <div class="promotion-dialog" id="promotion-dialog">
    <h3 id="promotion-title">选择升变棋子</h3>
    <div class="promotion-options" id="promotion-options"></div>
  </div>
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
        
        <div class="board-wrapper">
          <div id="chessboard"></div>
          <!-- 列坐标 (a-h) -->
          <div class="coordinates file-coords">
            <div class="file-coord">a</div>
            <div class="file-coord">b</div>
            <div class="file-coord">c</div>
            <div class="file-coord">d</div>
            <div class="file-coord">e</div>
            <div class="file-coord">f</div>
            <div class="file-coord">g</div>
            <div class="file-coord">h</div>
          </div>
          <!-- 行坐标 (1-8) -->
          <div class="coordinates rank-coords">
            <div class="rank-coord">1</div>
            <div class="rank-coord">2</div>
            <div class="rank-coord">3</div>
            <div class="rank-coord">4</div>
            <div class="rank-coord">5</div>
            <div class="rank-coord">6</div>
            <div class="rank-coord">7</div>
            <div class="rank-coord">8</div>
          </div>
        </div>
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
    let timerInterval = null;
    let currentLanguage = '${lang}';
    let lastMoveTime = Date.now();
    
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
        console.log('游戏已创建:', gameState);
        
        chess = new Chess(gameState.fen);
        
        closeGameSetup();
        document.getElementById('welcome-message').classList.add('hidden');
        
        renderBoard();
        updateGameInfo();
        
        // 启动倒计时（所有游戏模式）
        startGameTimer();
        
        // 开始轮询游戏状态（只对AI vs AI模式）
        if (updateInterval) clearInterval(updateInterval);
        if (gameState.mode === 'ai-vs-ai') {
          // AI vs AI模式：需要轮询查看进展
          console.log('🤖 AI vs AI模式，开始轮询');
          updateInterval = setInterval(pollGameState, 2000); // 改为2秒轮询一次
        }
        
        console.log('游戏开始，状态:', gameState.status, '当前回合:', gameState.currentTurn);
        console.log('完整gameState:', gameState);
        
        // AI vs AI模式：游戏已由backend队列启动，只需轮询即可
        if (gameState.mode === 'ai-vs-ai') {
          console.log('🔥 AI vs AI对战已在后台队列中运行');
          console.log('💡 提示：队列处理需要时间，请耐心等待...');
          console.log('每2秒检查一次更新');
        }
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
      console.log('渲染棋盘, chess.turn:', chess.turn);
      
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          const square = document.createElement('div');
          square.className = 'square ' + ((row + col) % 2 === 0 ? 'light' : 'dark');
          
          // 正确的映射：页面从上到下是rank 8到1
          const rank = 8 - row;  // row=0 → rank=8, row=7 → rank=1
          const file = String.fromCharCode(97 + col);  // col=0 → 'a'
          square.dataset.square = file + rank;
          
          // board数组：index 7=rank8, index 0=rank1
          const boardRow = rank - 1;  // rank=8 → index=7, rank=1 → index=0
          const piece = squares[boardRow][col];
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
      
      // 显示当前回合提示
      if (gameState && gameState.status === 'active') {
        console.log('📌 当前回合:', gameState.currentTurn === 'w' ? '白方(底部1-2行)' : '黑方(顶部7-8行)');
      }
      
      // 高亮当前回合的所有棋子
      highlightCurrentTurnPieces();
    }
    
    // 高亮当前回合的所有棋子（视觉提示）
    function highlightCurrentTurnPieces() {
      const currentColor = gameState ? gameState.currentTurn : chess.turn;
      const squares = document.querySelectorAll('.square');
      
      squares.forEach(sq => {
        const squareName = sq.dataset.square;
        const piece = chess.get(squareName);
        
        // 移除旧的高亮
        sq.classList.remove('can-move');
        
        // 如果是当前回合的棋子，添加淡淡的高亮
        if (piece && piece.color === currentColor) {
          sq.classList.add('can-move');
        }
      });
    }
    
    async function handleSquareClick(square) {
      const squareName = square.dataset.square;
      console.log('点击方格:', squareName, 'gameState:', gameState ? gameState.status : 'null');
      
      // 练习模式（无游戏状态）
      if (!gameState) {
        console.log('练习模式');
        if (selectedSquare) {
          // 检查是否需要升变
          const piece = chess.get(selectedSquare);
          const toSquare = chess.parseSquare(squareName);
          let promotion = undefined;
          
          if (piece && piece.type === 'p' && (toSquare.rank === 7 || toSquare.rank === 0)) {
            console.log('🎯 兵到达底线，需要升变');
            showPromotionDialog(piece.color).then(selectedPromotion => {
              if (selectedPromotion) {
                const result = chess.move({ from: selectedSquare, to: squareName, promotion: selectedPromotion });
                if (result) {
                  console.log('练习升变成功');
                  renderBoard();
                  updateMoveHistory();
                  highlightCurrentTurnPieces();
                }
              }
              selectedSquare = null;
              clearHighlights();
            });
            return;
          }
          
          const result = chess.move({ from: selectedSquare, to: squareName });
          if (result) {
            console.log('练习移动成功');
            renderBoard();
            updateMoveHistory(); // 更新行棋历史
            
            // 自动选中下一回合棋子（可选）
            highlightCurrentTurnPieces();
          }
          selectedSquare = null;
          clearHighlights();
        } else {
          const piece = chess.get(squareName);
          if (piece && piece.color === chess.turn) {
            selectedSquare = squareName;
            highlightSquare(square);
          }
        }
        return;
      }
      
      console.log('游戏模式:', gameState.mode, '状态:', gameState.status, '当前回合:', gameState.currentTurn);
      
      // 人人对战：本地处理
      if (gameState.mode === 'human-vs-human') {
        console.log('人人对战模式');
        if (selectedSquare) {
          // 检查是否需要升变
          const piece = chess.get(selectedSquare);
          const toSquare = chess.parseSquare(squareName);
          
          if (piece && piece.type === 'p' && (toSquare.rank === 7 || toSquare.rank === 0)) {
            console.log('🎯 兵到达底线，需要升变');
            showPromotionDialog(piece.color).then(promotion => {
              if (promotion) {
                const result = chess.move({ from: selectedSquare, to: squareName, promotion });
                if (result) {
                  console.log('本地升变成功:', result);
                  const now = Date.now();
                  const elapsed = Math.floor((now - lastMoveTime) / 1000);
                  const currentPlayer = gameState.currentTurn === 'w' ? gameState.whitePlayer : gameState.blackPlayer;
                  currentPlayer.timeRemaining = Math.max(0, currentPlayer.timeRemaining - elapsed);
                  
                  renderBoard();
                  gameState.currentTurn = chess.turn;
                  updateMoveHistory();
                  updateGameInfo();
                  resetTimer();
                }
              }
              selectedSquare = null;
              clearHighlights();
            });
            return;
          }
          
          const result = chess.move({ from: selectedSquare, to: squareName });
          if (result) {
            console.log('本地移动成功:', result);
            
            // 更新当前玩家剩余时间
            const now = Date.now();
            const elapsed = Math.floor((now - lastMoveTime) / 1000);
            const currentPlayer = gameState.currentTurn === 'w' ? gameState.whitePlayer : gameState.blackPlayer;
            currentPlayer.timeRemaining = Math.max(0, currentPlayer.timeRemaining - elapsed);
            
            renderBoard();
            gameState.currentTurn = chess.turn;
            updateMoveHistory(); // 更新行棋历史
            updateGameInfo(); // 更新信息（包括倒计时）
            resetTimer(); // 重置计时器
          }
          selectedSquare = null;
          clearHighlights();
        } else {
          const piece = chess.get(squareName);
          console.log('选择棋子:', piece, 'chess.turn:', chess.turn);
          if (piece && piece.color === chess.turn) {
            selectedSquare = squareName;
            highlightSquare(square);
            console.log('✅ 棋子已选中:', squareName);
          } else if (piece && piece.color !== chess.turn) {
            console.log('❌ 不是当前回合的棋子！当前回合:', chess.turn === 'w' ? '白方' : '黑方', '你点击的是:', piece.color === 'w' ? '白棋' : '黑棋');
            // 不弹窗，通过闪烁提示
            flashPlayerInfo(chess.turn);
          }
        }
        return;
      }
      
      // AI vs AI：只能观看
      if (gameState.mode === 'ai-vs-ai') {
        console.log('AI vs AI模式，只能观战');
        return;
      }
      
      // 人机对战：只允许人类移动
      if (gameState.mode === 'human-vs-ai') {
        console.log('人机对战模式, selectedSquare:', selectedSquare);
        const currentPlayer = gameState.currentTurn === 'w' ? gameState.whitePlayer : gameState.blackPlayer;
        console.log('当前玩家:', currentPlayer.type, '颜色:', currentPlayer.color);
        
        // AI回合，禁止操作
        if (currentPlayer.type === 'ai') {
          console.log('AI的回合，请等待...');
          return;
        }
        
        // 人类回合
        if (selectedSquare) {
          console.log('🎯 尝试移动:', selectedSquare, '->', squareName);
          await makeMove(selectedSquare, squareName);
          selectedSquare = null;
          clearHighlights();
        } else {
          const piece = chess.get(squareName);
          console.log('点击棋子:', piece, '需要颜色:', gameState.currentTurn);
          
          if (piece && piece.color === gameState.currentTurn) {
            selectedSquare = squareName;
            highlightSquare(square);
            console.log('✅ 棋子已选中:', squareName);
          } else if (piece && piece.color !== gameState.currentTurn) {
            console.log('❌ 不是你的回合！当前回合:', gameState.currentTurn === 'w' ? '白方(第1-2行)' : '黑方(第7-8行)');
            // 不弹窗，通过闪烁提示
            flashPlayerInfo(gameState.currentTurn);
          }
        }
        return; // ✅ 重要：必须return，防止继续执行
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
    
    /**
     * 显示升变选择对话框
     */
    function showPromotionDialog(color) {
      return new Promise((resolve) => {
        const dialog = document.getElementById('promotion-dialog');
        const options = document.getElementById('promotion-options');
        const title = document.getElementById('promotion-title');
        
        title.textContent = t('selectPromotionPiece') || '选择升变棋子';
        
        const pieces = [
          { type: 'q', symbol: color === 'w' ? '♕' : '♛', name: t('queen') || '后' },
          { type: 'r', symbol: color === 'w' ? '♖' : '♜', name: t('rook') || '车' },
          { type: 'b', symbol: color === 'w' ? '♗' : '♝', name: t('bishop') || '象' },
          { type: 'n', symbol: color === 'w' ? '♘' : '♞', name: t('knight') || '马' }
        ];
        
        options.innerHTML = '';
        pieces.forEach(piece => {
          const btn = document.createElement('div');
          btn.className = 'promotion-piece';
          btn.textContent = piece.symbol;
          btn.title = piece.name;
          btn.onclick = () => {
            dialog.classList.remove('show');
            resolve(piece.type);
          };
          options.appendChild(btn);
        });
        
        dialog.classList.add('show');
        
        // ESC键取消
        const escHandler = (e) => {
          if (e.key === 'Escape') {
            dialog.classList.remove('show');
            document.removeEventListener('keydown', escHandler);
            resolve(null);
          }
        };
        document.addEventListener('keydown', escHandler);
      });
    }
    
    async function makeMove(from, to, promotion) {
      if (!gameState || !gameState.id) {
        console.error('游戏未开始，无法调用API');
        return;
      }
      
      // 检查是否需要升变
      if (!promotion) {
        const piece = chess.get(from);
        const toSquare = chess.parseSquare ? chess.parseSquare(to) : { rank: parseInt(to[1]) - 1 };
        const toRank = toSquare.rank !== undefined ? toSquare.rank : parseInt(to[1]) - 1;
        
        if (piece && piece.type === 'p' && (toRank === 7 || toRank === 0)) {
          console.log('🎯 兵到达底线，需要升变');
          promotion = await showPromotionDialog(piece.color);
          if (!promotion) {
            console.log('❌ 取消升变');
            return;
          }
          console.log('✅ 选择升变:', promotion);
        }
      }
      
      try {
        console.log('执行移动:', { gameId: gameState.id, from, to, promotion });
        
        const response = await fetch('/api/make-move', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gameId: gameState.id, from, to, promotion })
        });
        
        if (response.ok) {
          gameState = await response.json();
          chess = new Chess(gameState.fen);
          renderBoard();
          updateGameInfo();
          console.log('移动成功');
          
          // 人机对战：人类移动后，立即请求AI移动
          if (gameState.mode === 'human-vs-ai' && gameState.status === 'active') {
            const nextPlayer = gameState.currentTurn === 'w' ? gameState.whitePlayer : gameState.blackPlayer;
            if (nextPlayer.type === 'ai') {
              console.log('等待AI思考...');
              await getAIMove();
            }
          }
        } else {
          const error = await response.json();
          console.error('移动失败:', response.status, error);
          alert(t('invalidMove') + ': ' + (error.error || '未知错误'));
        }
      } catch (error) {
        console.error('Move failed:', error);
        alert(t('invalidMove'));
      }
    }
    
    async function getAIMove() {
      try {
        console.log('请求AI移动...');
        const response = await fetch('/api/ai-move', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gameId: gameState.id })
        });
        
        if (response.ok) {
          gameState = await response.json();
          chess = new Chess(gameState.fen);
          renderBoard();
          updateGameInfo();
          console.log('AI移动完成');
        } else {
          const error = await response.json();
          console.error('AI移动失败:', error);
        }
      } catch (error) {
        console.error('AI move failed:', error);
      }
    }
    
    async function pollGameState() {
      if (!gameState || !gameState.id) return;
      
      try {
        console.log('轮询游戏状态...');
        const response = await fetch('/api/game-state?gameId=' + gameState.id);
        if (!response.ok) {
          console.error('Poll failed with status:', response.status);
          return;
        }
        
        const newState = await response.json();
        console.log('获取到新状态:', newState);
        console.log('当前回合:', newState.currentTurn, 'FEN变化:', newState.fen !== gameState.fen);
        
        if (newState && newState.fen && newState.fen !== gameState.fen) {
          console.log('🔄 棋盘更新! 从', gameState.fen, '到', newState.fen);
          gameState = newState;
          chess = new Chess(gameState.fen);
          renderBoard();
          updateGameInfo();
        } else {
          console.log('无变化，继续等待...');
        }
        
        // AI vs AI模式：检查是否游戏结束
        if (gameState.mode === 'ai-vs-ai' && gameState.status !== 'active') {
          console.log('AI vs AI游戏结束');
          if (updateInterval) {
            clearInterval(updateInterval);
            updateInterval = null;
          }
        }
      } catch (error) {
        console.error('Poll failed:', error);
      }
    }
    
    function updateGameInfo() {
      if (!gameState || !gameState.whitePlayer || !gameState.blackPlayer) {
        console.error('游戏状态不完整');
        return;
      }
      
      const whiteNameEl = document.getElementById('white-player-name');
      const blackNameEl = document.getElementById('black-player-name');
      
      if (whiteNameEl) whiteNameEl.textContent = gameState.whitePlayer.name || t('whitePlayer');
      if (blackNameEl) blackNameEl.textContent = gameState.blackPlayer.name || t('blackPlayer');
      
      updateTimer('white-timer', gameState.whitePlayer.timeRemaining);
      updateTimer('black-timer', gameState.blackPlayer.timeRemaining);
      
      // 更新当前回合高亮（带闪烁动画）
      const whiteInfo = document.getElementById('white-player-info');
      const blackInfo = document.getElementById('black-player-info');
      
      if (gameState.currentTurn === 'w') {
        whiteInfo.classList.add('active');
        blackInfo.classList.remove('active');
      } else {
        whiteInfo.classList.remove('active');
        blackInfo.classList.add('active');
      }
      
      updateMoveHistory();
    }
    
    // 闪烁提示当前回合（替代弹窗）
    function flashPlayerInfo(color) {
      const infoEl = document.getElementById(color === 'w' ? 'white-player-info' : 'black-player-info');
      if (!infoEl) return;
      
      // 快速闪烁3次
      let count = 0;
      const interval = setInterval(() => {
        infoEl.style.transform = count % 2 === 0 ? 'scale(1.05)' : 'scale(1)';
        infoEl.style.background = count % 2 === 0 ? '#fff3cd' : '#e3f2fd';
        count++;
        if (count > 6) {
          clearInterval(interval);
          infoEl.style.transform = 'scale(1)';
          infoEl.style.background = '#e3f2fd';
        }
      }, 200);
    }
    
    // 启动游戏倒计时
    function startGameTimer() {
      if (timerInterval) clearInterval(timerInterval);
      
      lastMoveTime = Date.now();
      
      timerInterval = setInterval(() => {
        if (!gameState || gameState.status !== 'active') {
          if (timerInterval) clearInterval(timerInterval);
          return;
        }
        
        const now = Date.now();
        const elapsed = Math.floor((now - lastMoveTime) / 1000);
        
        // 扣除当前回合玩家的时间
        const currentPlayer = gameState.currentTurn === 'w' ? gameState.whitePlayer : gameState.blackPlayer;
        const newTime = currentPlayer.timeRemaining - elapsed;
        
        if (newTime <= 0) {
          // 时间用完，判负
          currentPlayer.timeRemaining = 0;
          gameState.status = 'timeout';
          gameState.winner = gameState.currentTurn === 'w' ? 'b' : 'w';
          
          if (timerInterval) clearInterval(timerInterval);
          
          alert((gameState.currentTurn === 'w' ? t('whitePlayer') : t('blackPlayer')) + ' ' + t('timeout') + '! ' + 
                (gameState.winner === 'w' ? t('whitePlayer') : t('blackPlayer')) + ' ' + t('whiteWins'));
          return;
        }
        
        // 更新显示
        updateTimer(gameState.currentTurn === 'w' ? 'white-timer' : 'black-timer', newTime);
      }, 100); // 每0.1秒更新一次，更精确
      
      console.log('⏱️ 倒计时已启动');
    }
    
    // 重置倒计时（移动后调用）
    function resetTimer() {
      lastMoveTime = Date.now();
      console.log('⏱️ 倒计时重置');
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
      console.log('更新行棋历史, moveList元素:', !!moveList, 'moves数量:', gameState?.moves?.length);
      
      if (!moveList) {
        console.error('❌ move-list元素未找到');
        return;
      }
      
      // 本地模式：显示chess引擎的历史（PGN格式）
      if (!gameState || !gameState.moves || gameState.moves.length === 0) {
        if (chess && chess.history) {
          const history = chess.history();
          console.log('使用chess引擎历史:', history);
          moveList.innerHTML = '';
          
          // 按照PGN格式显示：1.e4 e5 2.Nf3 Nc6
          for (let i = 0; i < history.length; i += 2) {
            const moveEl = document.createElement('div');
            moveEl.className = 'move-item';
            const moveNum = Math.floor(i/2) + 1;
            const whiteMove = history[i];
            const blackMove = history[i + 1] || '';
            moveEl.innerHTML = '<span class="move-number">' + moveNum + '.</span> ' + 
                               '<span class="white-move">' + whiteMove + '</span> ' +
                               (blackMove ? '<span class="black-move">' + blackMove + '</span>' : '');
            moveList.appendChild(moveEl);
          }
        } else {
          moveList.innerHTML = '<div style="color: #999; padding: 10px;">' + t('moveHistory') + '</div>';
        }
        return;
      }
      
      // 游戏模式：显示gameState的历史（PGN格式）
      console.log('使用gameState历史:', gameState.moves);
      moveList.innerHTML = '';
      
      // 按照标准记谱格式：1.e4 e5 2.Nf3 Nc6
      for (let i = 0; i < gameState.moves.length; i += 2) {
        const moveEl = document.createElement('div');
        moveEl.className = 'move-item';
        const moveNum = Math.floor(i/2) + 1;
        const whiteMove = gameState.moves[i];
        const blackMove = gameState.moves[i + 1];
        
        moveEl.innerHTML = '<span class="move-number">' + moveNum + '.</span> ' +
                           '<span class="white-move">' + whiteMove.san + '</span> ' +
                           (blackMove ? '<span class="black-move">' + blackMove.san + '</span>' : '');
        moveList.appendChild(moveEl);
      }
      
      // 自动滚动到底部
      moveList.scrollTop = moveList.scrollHeight;
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

