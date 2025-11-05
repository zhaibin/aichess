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
    
    /* 棋盘区域顶部控制栏 */
    .board-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      gap: 15px;
    }
    
    .board-controls .new-game-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      font-size: 0.95em;
      cursor: pointer;
      font-weight: 600;
      transition: transform 0.2s;
      white-space: nowrap;
    }
    
    .board-controls .new-game-btn:hover {
      transform: scale(1.05);
    }
    
    .board-controls .board-title {
      font-size: 2em;
      font-weight: bold;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      flex: 1;
      text-align: center;
      white-space: nowrap;
    }
    
    .board-controls .language-selector select {
      padding: 8px 12px;
      border: 2px solid #667eea;
      border-radius: 8px;
      font-size: 0.95em;
      background: white;
      cursor: pointer;
      white-space: nowrap;
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
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
      padding: 0;
      transition: all 0.2s;
    }
    
    .close-setup:hover {
      background: #d32f2f;
      transform: scale(1.1);
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
      position: relative;
      display: flex;
      justify-content: space-around;
      width: 100%;
      margin-top: 8px;
    }
    
    .file-coord {
      flex: 1;
      text-align: center;
    }
    
    .rank-coords {
      position: absolute;
      left: -30px;
      top: 3px;
      bottom: 3px;
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
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 3.5em;
      cursor: pointer;
      transition: all 0.2s;
      user-select: none;
      box-sizing: border-box;
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
      .container {
        flex-direction: column;
        padding: 10px;
      }
      
      .game-setup-sidebar {
        width: 100%;
        max-width: none;
      }
      
      .board-container {
        width: 100%;
        max-width: min(95vw, 500px);
        margin: 0 auto;
        padding: 15px;
        padding-bottom: 40px !important;
      }
      
      .board-wrapper {
        width: 100%;
      }
      
      .board-controls {
        flex-direction: column;
        gap: 8px;
      }
      
      .board-controls .board-title {
        font-size: 1.6em;
        order: -1;
      }
      
      .board-controls .new-game-btn,
      .board-controls .language-selector {
        width: 100%;
      }
      
      .board-controls .language-selector select {
        width: 100%;
      }
      
      #chessboard {
        width: 100%;
        aspect-ratio: 1;
      }
      
      .square { 
        font-size: clamp(1.8em, 7vw, 2.5em);
      }
      
      .rank-coords {
        display: none;
      }
      
      .file-coords {
        margin-top: 5px;
        font-size: 0.8em;
      }
      
      .board-container {
        padding-bottom: 40px !important;
      }
      
      .info-panel {
        width: 100%;
        margin-top: 20px;
      }
      
      .move-history {
        max-height: 200px;
      }
      
      .footer-links {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 10px;
      }
      
      .footer-links span {
        display: none;
      }
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
      max-height: 300px;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 15px;
      background: #fafafa;
    }
    
    .move-history h3 {
      margin-bottom: 10px;
      color: #666;
    }
    
    /* AI思考展示 */
    .ai-thinking {
      border: 2px solid #2196f3;
      border-radius: 8px;
      padding: 15px;
      background: #e3f2fd;
      display: none;
      margin-top: 15px;
    }
    
    .ai-thinking.show {
      display: block;
    }
    
    .ai-thinking h4 {
      color: #1976d2;
      margin-bottom: 10px;
      font-size: 1em;
    }
    
    .ai-thinking .thinking-item {
      font-size: 0.9em;
      margin: 5px 0;
      color: #555;
    }
    
    .ai-thinking .thinking-label {
      font-weight: bold;
      color: #1976d2;
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
      padding: 40px 20px;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 12px;
    }
    
    .footer-logo {
      margin-bottom: 20px;
    }
    
    .footer-logo .logo-icon {
      filter: drop-shadow(0 4px 12px rgba(0,0,0,0.3));
    }
    
    footer h2 {
      font-size: 2em;
      margin: 15px 0;
    }
    
    footer p {
      margin: 10px 0;
      opacity: 0.9;
    }
    
    .footer-links {
      margin: 25px 0;
      font-size: 1em;
    }
    
    .footer-links a {
      color: white;
      text-decoration: none;
      margin: 0 12px;
      opacity: 0.9;
      transition: opacity 0.3s;
      font-weight: 500;
    }
    
    .footer-links a:hover {
      opacity: 1;
      text-decoration: underline;
    }
    
    .footer-links span {
      opacity: 0.6;
      margin: 0 5px;
    }
    
    .copyright {
      margin-top: 20px;
      opacity: 0.8;
      font-size: 0.9em;
    }
    
    .copyright p {
      margin: 5px 0;
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
  
  <!-- 遮罩层 -->
  <div class="setup-overlay" id="setup-overlay" onclick="closeGameSetup()"></div>
  
  <!-- 语言选择器（仅用于侧边栏同步，不显示） -->
  <div class="language-selector" style="display: none;">
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
        <!-- 棋盘顶部控制栏 -->
        <div class="board-controls">
          <button class="new-game-btn" onclick="openGameSetup()">
            <span id="new-game-btn-board">${t('newGame')}</span>
          </button>
          <h1 class="board-title">AI Chess</h1>
          <div class="language-selector">
            <select id="language-select-board">
              <option value="zh-CN" ${lang === 'zh-CN' ? 'selected' : ''}>简体中文</option>
              <option value="zh-TW" ${lang === 'zh-TW' ? 'selected' : ''}>繁體中文</option>
              <option value="en" ${lang === 'en' ? 'selected' : ''}>English</option>
              <option value="fr" ${lang === 'fr' ? 'selected' : ''}>Français</option>
              <option value="es" ${lang === 'es' ? 'selected' : ''}>Español</option>
              <option value="de" ${lang === 'de' ? 'selected' : ''}>Deutsch</option>
              <option value="it" ${lang === 'it' ? 'selected' : ''}>Italiano</option>
              <option value="pt" ${lang === 'pt' ? 'selected' : ''}>Português</option>
              <option value="ru" ${lang === 'ru' ? 'selected' : ''}>Русский</option>
              <option value="ar" ${lang === 'ar' ? 'selected' : ''}>العربية</option>
              <option value="ja" ${lang === 'ja' ? 'selected' : ''}>日本語</option>
              <option value="ko" ${lang === 'ko' ? 'selected' : ''}>한국어</option>
            </select>
          </div>
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
        
        <!-- AI思考展示 -->
        <div class="ai-thinking" id="ai-thinking">
          <h4 id="ai-thinking-title">🧠 ${t('aiThinking')}</h4>
          <div class="thinking-item">
            <span class="thinking-label" id="ai-phase-label">${t('aiPhase')}:</span>
            <span id="ai-phase">-</span>
          </div>
          <div class="thinking-item">
            <span class="thinking-label" id="ai-reasoning-label">${t('aiReasoning')}:</span>
            <span id="ai-reasoning">-</span>
          </div>
          <div class="thinking-item">
            <span class="thinking-label" id="ai-evaluation-label">${t('aiEvaluation')}:</span>
            <span id="ai-evaluation">-</span>
          </div>
          <div class="thinking-item">
            <span class="thinking-label" id="ai-confidence-label">${t('aiConfidence')}:</span>
            <span id="ai-confidence">-</span>
          </div>
        </div>
        
        <div class="game-controls">
          <button class="btn-danger" onclick="resign()">${t('resign')}</button>
        </div>
      </div>
    </div>
    
    <!-- Footer -->
    <footer>
      <!-- Logo -->
      <div class="footer-logo">
        <svg class="logo-icon" viewBox="0 0 64 64" width="64" height="64">
          <defs>
            <linearGradient id="footerLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#FFD700;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#FFA500;stop-opacity:1" />
            </linearGradient>
          </defs>
          <rect x="8" y="8" width="48" height="48" fill="url(#footerLogoGrad)" rx="4"/>
          <rect x="8" y="8" width="12" height="12" fill="#fff" opacity="0.4"/>
          <rect x="32" y="8" width="12" height="12" fill="#fff" opacity="0.4"/>
          <rect x="20" y="20" width="12" height="12" fill="#fff" opacity="0.4"/>
          <rect x="44" y="20" width="12" height="12" fill="#fff" opacity="0.4"/>
          <rect x="8" y="32" width="12" height="12" fill="#fff" opacity="0.4"/>
          <rect x="32" y="32" width="12" height="12" fill="#fff" opacity="0.4"/>
          <rect x="20" y="44" width="12" height="12" fill="#fff" opacity="0.4"/>
          <rect x="44" y="44" width="12" height="12" fill="#fff" opacity="0.4"/>
          <circle cx="32" cy="32" r="16" fill="#fff" opacity="0.9"/>
          <text x="32" y="38" font-size="20" font-weight="bold" text-anchor="middle" fill="#764ba2">AI</text>
        </svg>
      </div>
      
      <h2>AIChess.win</h2>
      <p>Challenge 5 powerful AI chess players | Completely free online chess platform</p>
      <p>🤖 5 AI Models | 💯 Forever Free | 🌍 11 Languages | ⚡ Global CDN</p>
      
      <div class="footer-links">
        <a href="/about?lang=${lang}" target="_blank" id="footer-about">${t('about')}</a>
        <span>|</span>
        <a href="/privacy?lang=${lang}" target="_blank" id="footer-privacy">${t('privacy')}</a>
        <span>|</span>
        <a href="/terms?lang=${lang}" target="_blank" id="footer-terms">${t('terms')}</a>
        <span>|</span>
          <a href="https://github.com/zhaibin/aichess" target="_blank" rel="noopener">GitHub</a>
        <span>|</span>
        <a href="mailto:contact@aichess.win">Contact</a>
      </div>
      
      <div class="copyright">
        <p>© 2024-2025 AIChess.win. All Rights Reserved.</p>
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
      
      // 语言切换（侧边栏）
      const langSelectSidebar = document.getElementById('language-select');
      if (langSelectSidebar) {
        langSelectSidebar.addEventListener('change', (e) => {
          currentLanguage = e.target.value;
          updateLanguage();
          const url = new URL(window.location.href);
          url.searchParams.set('lang', currentLanguage);
          window.history.replaceState({}, '', url);
          // 同步棋盘控制栏的语言选择器
          const boardLangSelect = document.getElementById('language-select-board');
          if (boardLangSelect) boardLangSelect.value = currentLanguage;
        });
      }
      
      // 语言切换（棋盘控制栏）
      const langSelectBoard = document.getElementById('language-select-board');
      if (langSelectBoard) {
        langSelectBoard.addEventListener('change', (e) => {
          currentLanguage = e.target.value;
          updateLanguage();
          const url = new URL(window.location.href);
          url.searchParams.set('lang', currentLanguage);
          window.history.replaceState({}, '', url);
          // 同步侧边栏的语言选择器
          if (langSelectSidebar) langSelectSidebar.value = currentLanguage;
        });
      }
      
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
      safeUpdate('new-game-btn-board', t('newGame'));
      safeUpdate('new-game-title', t('newGame'));
      safeUpdate('game-mode-label', t('newGame'));
      safeUpdate('time-control-label', t('timeControl'));
      safeUpdate('white-ai-label', t('whitePlayer') + ' ' + t('ai'));
      safeUpdate('black-ai-label', t('blackPlayer') + ' ' + t('ai'));
      safeUpdate('start-game', t('startGame'));
      safeUpdate('move-history-title', t('moveHistory'));
      safeUpdate('white-player-name', t('whitePlayer'));
      safeUpdate('black-player-name', t('blackPlayer'));
      
      // AI思考界面
      safeUpdate('ai-thinking-title', '🧠 ' + t('aiThinking'));
      safeUpdate('ai-phase-label', t('aiPhase') + ':');
      safeUpdate('ai-reasoning-label', t('aiReasoning') + ':');
      safeUpdate('ai-evaluation-label', t('aiEvaluation') + ':');
      safeUpdate('ai-confidence-label', t('aiConfidence') + ':');
      
      // 更新Footer链接
      safeUpdate('footer-about', t('about'));
      safeUpdate('footer-privacy', t('privacy'));
      safeUpdate('footer-terms', t('terms'));
      
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
        
        // AI vs AI模式：前端主动触发首次AI移动
        if (gameState.mode === 'ai-vs-ai') {
          console.log('🔥 AI vs AI对战，前端触发首次移动');
          console.log('💡 每2秒检查更新并触发下一步');
          
          // 立即触发第一步
          setTimeout(() => {
            console.log('🚀 触发首次AI移动');
            triggerAIvsAIMove();
          }, 500);
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
        console.log('无游戏状态，将自动创建人与人对战');
        if (selectedSquare) {
          // 检查是否需要升变
          const piece = chess.get(selectedSquare);
          const toSquare = chess.parseSquare(squareName);
          
          if (piece && piece.type === 'p' && (toSquare.rank === 7 || toSquare.rank === 0)) {
            console.log('🎯 兵到达底线，需要升变');
            showPromotionDialog(piece.color).then(async selectedPromotion => {
              if (selectedPromotion) {
                const move = chess.move({ from: selectedSquare, to: squareName, promotion: selectedPromotion });
                if (move) {
                  console.log('✅ 升变成功，自动创建游戏');
                  // 自动创建人与人对战
                  try {
                    const createResponse = await fetch('/api/create-game', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        mode: 'human-vs-human',
                        timeControl: 600,
                        whitePlayer: { type: 'human', name: 'White' },
                        blackPlayer: { type: 'human', name: 'Black' }
                      })
                    });
                    gameState = await createResponse.json();
                    const moveResponse = await fetch('/api/make-move', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        gameId: gameState.id,
                        from: move.from,
                        to: move.to,
                        promotion: move.promotion
                      })
                    });
                    gameState = await moveResponse.json();
                    chess = new Chess(gameState.fen);
                    renderBoard();
                    updateGameInfo();
                    updateMoveHistory();
                    startGameTimer();
                  } catch (error) {
                    console.error('创建游戏失败:', error);
                    chess.undo();
                  }
                }
              }
              selectedSquare = null;
              clearHighlights();
            });
            return;
          }
          
          const move = chess.move({ from: selectedSquare, to: squareName });
          if (move) {
            console.log('✅ 移动成功，自动创建人与人对战');
            // 自动创建人与人对战
            try {
              const createResponse = await fetch('/api/create-game', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  mode: 'human-vs-human',
                  timeControl: 600,
                  whitePlayer: { type: 'human', name: 'White' },
                  blackPlayer: { type: 'human', name: 'Black' }
                })
              });
              gameState = await createResponse.json();
              const moveResponse = await fetch('/api/make-move', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  gameId: gameState.id,
                  from: move.from,
                  to: move.to,
                  promotion: move.promotion
                })
              });
              gameState = await moveResponse.json();
              chess = new Chess(gameState.fen);
              renderBoard();
              updateGameInfo();
              updateMoveHistory();
              startGameTimer();
            } catch (error) {
              console.error('创建游戏失败:', error);
              chess.undo();
              renderBoard();
            }
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
    
    async function getAIMove(retryCount = 0) {
      const moveStartTime = Date.now();
      const currentPlayer = gameState.currentTurn === 'w' ? gameState.whitePlayer : gameState.blackPlayer;
      
      // ✅ 显示AI正在思考
      showAIThinking(currentPlayer.name, 'thinking');
      
      try {
        console.log('请求AI移动...', retryCount > 0 ? '[重试 ' + retryCount + ']' : '');
        const response = await fetch('/api/ai-move', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gameId: gameState.id })
        });
        
        const moveEndTime = Date.now();
        const thinkingTime = Math.floor((moveEndTime - moveStartTime) / 1000);
        
        if (response.ok) {
          console.log('✅ AI移动成功，思考时间:', thinkingTime, '秒');
          
          // ✅ 扣除实际思考时间
          currentPlayer.timeRemaining = Math.max(0, currentPlayer.timeRemaining - thinkingTime);
          
          const result = await response.json();
          gameState = result;
          
          // ✅ 显示AI思考结果（如果后端返回了分析）
          if (result.aiAnalysis) {
            showAIThinking(
              currentPlayer.name,
              'completed',
              result.aiAnalysis.phase,
              result.aiAnalysis.reasoning,
              result.aiAnalysis.evaluation,
              result.aiAnalysis.confidence
            );
          } else {
            // 降级为随机移动时
            showAIThinking(currentPlayer.name, 'random');
          }
          
          chess = new Chess(gameState.fen);
          renderBoard();
          updateGameInfo();
          
          // ✅ 重置计时起点
          lastMoveTime = Date.now();
          
          console.log('AI移动完成');
        } else {
          const error = await response.json();
          console.error('❌ AI移动失败 (HTTP', response.status, '):', error);
          
          // ✅ 400错误（Invalid move）时重试
          if (response.status === 400 && retryCount < 3) {
            console.log('🔄 AI移动无效，1秒后重试...', retryCount + 1, '/3');
            setTimeout(() => getAIMove(retryCount + 1), 1000);
          } else {
            console.error('❌ AI移动失败次数过多');
            hideAIThinking();
            alert('AI移动失败，请重新开始游戏');
          }
        }
      } catch (error) {
        console.error('AI move failed:', error);
        
        // 网络错误也重试
        if (retryCount < 3) {
          console.log('🔄 网络错误，1秒后重试...', retryCount + 1, '/3');
          setTimeout(() => getAIMove(retryCount + 1), 1000);
        } else {
          hideAIThinking();
        }
      }
    }
    
    /**
     * 显示/隐藏AI思考过程
     */
    function showAIThinking(playerName, status, phase, reasoning, evaluation, confidence) {
      const thinkingBox = document.getElementById('ai-thinking');
      if (!thinkingBox) return;
      
      if (status === 'thinking') {
        thinkingBox.classList.add('show');
        document.getElementById('ai-phase').textContent = '思考中...';
        document.getElementById('ai-reasoning').textContent = playerName + ' 正在分析局面...';
        document.getElementById('ai-evaluation').textContent = '-';
        document.getElementById('ai-confidence').textContent = '-';
      } else if (status === 'random') {
        document.getElementById('ai-phase').textContent = '随机移动';
        document.getElementById('ai-reasoning').textContent = '使用随机合法移动（Workers AI降级）';
        document.getElementById('ai-evaluation').textContent = '-';
        document.getElementById('ai-confidence').textContent = 'N/A';
      } else if (status === 'completed') {
        document.getElementById('ai-phase').textContent = phase || '-';
        document.getElementById('ai-reasoning').textContent = reasoning || '移动完成';
        document.getElementById('ai-evaluation').textContent = evaluation || '-';
        document.getElementById('ai-confidence').textContent = confidence || '-';
      }
    }
    
    function hideAIThinking() {
      const thinkingBox = document.getElementById('ai-thinking');
      if (thinkingBox) thinkingBox.classList.remove('show');
    }
    
    /**
     * AI vs AI前端触发移动（带重试）
     */
    async function triggerAIvsAIMove(retryCount = 0) {
      if (!gameState || gameState.mode !== 'ai-vs-ai' || gameState.status !== 'active') {
        console.log('⚠️ 游戏状态不适合AI移动');
        return;
      }
      
      const currentPlayer = gameState.currentTurn === 'w' ? gameState.whitePlayer : gameState.blackPlayer;
      
      if (currentPlayer.type !== 'ai') {
        console.log('⚠️ 当前玩家不是AI');
        return;
      }
      
      console.log('🤖 触发AI移动:', currentPlayer.name, '(' + gameState.currentTurn + ')', retryCount > 0 ? '[重试 ' + retryCount + ']' : '');
      
      // ✅ AI vs AI模式也显示思考
      showAIThinking(currentPlayer.name, 'thinking');
      
      const moveStartTime = Date.now(); // 记录开始时间
      
      try {
        const response = await fetch('/api/ai-move', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gameId: gameState.id })
        });
        
        if (response.ok) {
          const newState = await response.json();
          const moveEndTime = Date.now();
          const thinkingTime = Math.floor((moveEndTime - moveStartTime) / 1000);
          
          console.log('✅ AI移动成功，思考时间:', thinkingTime, '秒');
          
          // ✅ 显示AI思考结果
          if (newState.aiAnalysis) {
            showAIThinking(
              currentPlayer.name,
              'completed',
              newState.aiAnalysis.phase,
              newState.aiAnalysis.reasoning,
              newState.aiAnalysis.evaluation,
              newState.aiAnalysis.confidence
            );
          } else {
            showAIThinking(currentPlayer.name, 'random');
          }
          
          // ✅ 扣除实际思考时间
          currentPlayer.timeRemaining = Math.max(0, currentPlayer.timeRemaining - thinkingTime);
          console.log('⏱️', currentPlayer.name, '消耗', thinkingTime, '秒，剩余', currentPlayer.timeRemaining, '秒');
          
          gameState = newState;
          chess = new Chess(gameState.fen);
          renderBoard();
          updateGameInfo();
          
          // ✅ 重置倒计时起点（下一个玩家开始计时）
          lastMoveTime = Date.now();
          
          // 如果游戏还在进行，触发下一步
          if (gameState.status === 'active') {
            const nextPlayer = gameState.currentTurn === 'w' ? gameState.whitePlayer : gameState.blackPlayer;
            if (nextPlayer.type === 'ai') {
              console.log('🔁 立即触发下一步AI移动');
              setTimeout(() => triggerAIvsAIMove(0), 500);
            }
          } else {
            console.log('🏁 游戏结束，状态:', gameState.status);
            if (timerInterval) {
              clearInterval(timerInterval);
              timerInterval = null;
              console.log('⏱️ 倒计时已停止');
            }
          }
        } else {
          const error = await response.json();
          console.error('❌ AI移动失败 (HTTP', response.status, '):', error);
          
          // ✅ 400错误（Invalid move）时重试
          if (response.status === 400 && retryCount < 3) {
            console.log('🔄 AI移动无效，1秒后重试...', retryCount + 1, '/3');
            setTimeout(() => triggerAIvsAIMove(retryCount + 1), 1000);
          } else {
            console.error('❌ AI移动失败次数过多，停止游戏');
            gameState.status = 'error';
            if (timerInterval) {
              clearInterval(timerInterval);
              timerInterval = null;
            }
          }
        }
      } catch (error) {
        console.error('❌ 触发AI移动异常:', error);
        
        // 网络错误也重试
        if (retryCount < 3) {
          console.log('🔄 网络错误，1秒后重试...', retryCount + 1, '/3');
          setTimeout(() => triggerAIvsAIMove(retryCount + 1), 1000);
        }
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
      
      // ✅ 检查游戏结束状态
      checkGameOver();
    }
    
    /**
     * 检查游戏是否结束（将死/和棋）
     */
    function checkGameOver() {
      if (!chess || !gameState) return;
      
      // 检查将死
      if (chess.isCheckmate()) {
        console.log('🎉 将死！游戏结束');
        const winner = gameState.currentTurn === 'w' ? '黑方' : '白方';
        const winnerPlayer = gameState.currentTurn === 'w' ? gameState.blackPlayer : gameState.whitePlayer;
        
        gameState.status = 'completed';
        gameState.winner = gameState.currentTurn === 'w' ? 'b' : 'w';
        
        // 停止倒计时
        if (timerInterval) {
          clearInterval(timerInterval);
          console.log('⏱️ 倒计时已停止');
        }
        
        // 显示胜利庆祝
        showVictory(winner, winnerPlayer.name, '将死');
        return;
      }
      
      // 检查和棋
      if (chess.isDraw()) {
        console.log('🤝 和棋！游戏结束');
        gameState.status = 'draw';
        gameState.winner = 'draw';
        
        // 停止倒计时
        if (timerInterval) {
          clearInterval(timerInterval);
        }
        
        showVictory('和棋', '双方平局', '和棋');
        return;
      }
      
      // 检查将军（提示）
      if (chess.isCheck()) {
        console.log('⚠️ 将军！');
        flashPlayerInfo(gameState.currentTurn);
      }
    }
    
    /**
     * 显示胜利庆祝
     */
    function showVictory(winner, winnerName, reason) {
      const overlay = document.getElementById('victory-overlay');
      const title = document.getElementById('victory-title');
      const text = document.getElementById('victory-text');
      
      if (reason === '和棋') {
        title.textContent = '🤝 和棋！';
        title.style.color = '#ff9800';
        text.textContent = '双方平局';
      } else if (reason === '超时') {
        title.textContent = '⏰ 超时！';
        title.style.color = '#f44336';
        text.textContent = winner + ' (' + winnerName + ') 获胜！对手超时';
      } else {
        title.textContent = '🎉 ' + winner + ' 获胜！';
        text.textContent = winnerName + ' 将死对方！';
      }
      
      overlay.classList.add('show');
      
      // 撒花效果
      createConfetti();
    }
    
    /**
     * 创建撒花动画
     */
    function createConfetti() {
      const overlay = document.getElementById('victory-overlay');
      const colors = ['#f44336', '#e91e63', '#9c27b0', '#3f51b5', '#2196f3', '#4caf50', '#ffeb3b', '#ff9800'];
      
      for (let i = 0; i < 100; i++) {
        setTimeout(() => {
          const confetti = document.createElement('div');
          confetti.className = 'confetti';
          confetti.style.left = Math.random() * 100 + '%';
          confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
          confetti.style.animationDelay = Math.random() * 3 + 's';
          confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
          overlay.appendChild(confetti);
          
          // 3秒后移除
          setTimeout(() => confetti.remove(), 5000);
        }, i * 30);
      }
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
      if (timerInterval) {
        clearInterval(timerInterval);
        console.log('⏱️ 清除旧的倒计时');
      }
      
      lastMoveTime = Date.now();
      
      timerInterval = setInterval(() => {
        if (!gameState || gameState.status !== 'active') {
          if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
            console.log('⏱️ 游戏非active状态，停止倒计时');
          }
          return;
        }
        
        const now = Date.now();
        const elapsed = Math.floor((now - lastMoveTime) / 1000);
        
        // 当前正在思考的玩家
        const thinkingPlayer = gameState.currentTurn === 'w' ? gameState.whitePlayer : gameState.blackPlayer;
        const waitingPlayer = gameState.currentTurn === 'w' ? gameState.blackPlayer : gameState.whitePlayer;
        
        // 计算思考时间（实时显示，不修改gameState）
        const displayTime = Math.max(0, thinkingPlayer.timeRemaining - elapsed);
        
        // 超时检测
        if (displayTime <= 0 && thinkingPlayer.timeRemaining > 0) {
          // 时间用完，判负
          console.log('⏰ 超时！', thinkingPlayer.name, '时间用完');
          thinkingPlayer.timeRemaining = 0;
          gameState.status = 'timeout';
          gameState.winner = gameState.currentTurn === 'w' ? 'b' : 'w';
          
          if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
          }
          
          // 显示超时胜利
          showVictory(
            gameState.winner === 'w' ? '白方' : '黑方',
            waitingPlayer.name,
            '超时'
          );
          return;
        }
        
        // 更新显示（只显示，不扣除）
        updateTimer('white-timer', gameState.currentTurn === 'w' ? displayTime : gameState.whitePlayer.timeRemaining);
        updateTimer('black-timer', gameState.currentTurn === 'b' ? displayTime : gameState.blackPlayer.timeRemaining);
      }, 100); // 每0.1秒更新一次
      
      console.log('⏱️ 倒计时已启动');
    }
    
    // 重置倒计时（移动后调用）
    function resetTimer() {
      const now = Date.now();
      const elapsed = Math.floor((now - lastMoveTime) / 1000);
      
      // ✅ 关键修复：移动后，扣除的是刚才移动的玩家的时间
      // currentTurn已经切换，所以上一个玩家是currentTurn的对手
      if (gameState && gameState.status === 'active') {
        // 刚才移动的是对方（因为currentTurn已经切换了）
        const justMovedPlayer = gameState.currentTurn === 'w' ? gameState.blackPlayer : gameState.whitePlayer;
        justMovedPlayer.timeRemaining = Math.max(0, justMovedPlayer.timeRemaining - elapsed);
        console.log('⏱️ 倒计时重置,', (justMovedPlayer.color === 'w' ? '白方' : '黑方'), '刚才移动，消耗', elapsed, '秒，剩余', justMovedPlayer.timeRemaining, '秒');
      }
      
      lastMoveTime = now;
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

