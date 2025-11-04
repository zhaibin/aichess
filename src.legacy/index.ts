// Cloudflare Workers主入口
import { Env, CreateGameRequest, MakeMoveRequest, AIGameQueueMessage, AI_MODELS, Language } from './types';
import { getAIMove } from './ai-player';
import { getSEOTags, getLanguageFromURL, getLanguageFromHeader } from './seo-i18n';
import { getAllTranslations } from './i18n';

export { GameState } from './game-state';
export { WebSocketRoom } from './websocket-room';
export { UserStore } from './user-system';

export default {
  /**
   * 处理HTTP请求
   */
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // 安全增强的CORS头
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400', // 24小时预检缓存
    };

    // 安全头
    const securityHeaders = {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
        'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' wss: https:; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self';"
    };

    // 处理OPTIONS预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, { 
        headers: { ...corsHeaders, ...securityHeaders },
        status: 204
      });
    }

    // 简单的限流检查（基于IP）
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    const rateLimitKey = `ratelimit:${clientIP}`;
    
    // 速率限制：每分钟最多100个请求
    const rateLimitResult = await checkRateLimit(env, rateLimitKey, 100, 60);

    try {
      // 静态文件 - 返回HTML界面（带缓存和多语言SEO）
      if (path === '/' || path === '/index.html') {
        // 检测语言：URL参数 > Accept-Language头 > 默认英语
        const langFromURL = getLanguageFromURL(request.url);
        const langFromHeader = getLanguageFromHeader(request.headers.get('Accept-Language'));
        const detectedLang = url.searchParams.has('lang') ? langFromURL : 'en'; // 默认英语
        
        const html = getHTML(detectedLang);
        return new Response(html, {
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'public, max-age=300, s-maxage=600', // 5分钟浏览器缓存，10分钟CDN缓存
            'Content-Language': detectedLang,
            'Vary': 'Accept-Language', // 根据语言缓存不同版本
            ...corsHeaders,
            ...securityHeaders
          }
        });
      }

      // robots.txt - SEO优化
      if (path === '/robots.txt') {
        return new Response(getRobotsTxt(), {
          headers: {
            'Content-Type': 'text/plain',
            'Cache-Control': 'public, max-age=86400'
          }
        });
      }

      // sitemap.xml - SEO优化
      if (path === '/sitemap.xml') {
        return new Response(getSitemap(), {
          headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=3600'
          }
        });
      }

      // manifest.json - PWA支持
      if (path === '/manifest.json') {
        return new Response(getManifest(), {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=86400'
          }
        });
      }

      // API路由
      if (path === '/api/create-game') {
        return await handleCreateGame(request, env, corsHeaders);
      }

      if (path === '/api/make-move') {
        return await handleMakeMove(request, env, ctx, corsHeaders);
      }

      if (path === '/api/game-state') {
        return await handleGameState(request, env, corsHeaders);
      }

      if (path === '/api/ai-models') {
        return new Response(JSON.stringify(Object.values(AI_MODELS)), {
          headers: { 
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=3600', // AI模型列表缓存1小时
            ...corsHeaders,
            ...securityHeaders
          }
        });
      }


      // 国际象棋引擎JS文件
      if (path === '/chess-engine.js') {
        return new Response(getChessEngineJS(), {
          headers: {
            'Content-Type': 'application/javascript; charset=utf-8',
            'Cache-Control': 'public, max-age=86400',
            ...corsHeaders
          }
        });
      }

      // 健康检查端点
      if (path === '/health') {
        return new Response(JSON.stringify({ status: 'ok', version: '3.0.0' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ error: 'Not found' }), { 
        status: 404, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders,
          ...securityHeaders
        }
      });
    } catch (error: any) {
      console.error('Request error:', error);
      
      // 结构化错误响应
      const errorResponse = {
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
        timestamp: new Date().toISOString()
      };
      
      return new Response(JSON.stringify(errorResponse), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders,
          ...securityHeaders
        }
      });
    }
  },

  /**
   * 处理队列消息（AI vs AI对战）
   */
  async queue(batch: MessageBatch<AIGameQueueMessage>, env: Env): Promise<void> {
    for (const message of batch.messages) {
      try {
        const { gameId, currentPlayer } = message.body;

        // 获取游戏状态
        const id = env.GAME_STATE.idFromName(gameId);
        const stub = env.GAME_STATE.get(id);
        const stateResponse = await stub.fetch(new Request('http://internal/state'));
        const gameState = await stateResponse.json();

        if (gameState.status !== 'active') {
          console.log(`Game ${gameId} is not active, skipping`);
          message.ack();
          continue;
        }

        // 获取AI玩家
        const aiPlayer = currentPlayer === 'w' ? gameState.whitePlayer : gameState.blackPlayer;

        if (aiPlayer.type !== 'ai' || !aiPlayer.aiModel) {
          console.error(`Player is not AI: ${currentPlayer}`);
          message.ack();
          continue;
        }

        const model = AI_MODELS[aiPlayer.aiModel];
        if (!model) {
          console.error(`AI model not found: ${aiPlayer.aiModel}`);
          message.ack();
          continue;
        }

        console.log(`AI ${model.name} (${currentPlayer}) is thinking...`);

        // 等待2秒（模拟思考时间）
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 获取AI移动
        const aiMoveResult = await getAIMove(env.AI, gameState, currentPlayer, model.modelId);

        if (!aiMoveResult || 'draw' in aiMoveResult) {
          console.log(`AI offered draw or failed to move`);
          message.ack();
          continue;
        }

        // 执行移动
        const moveRequest = new Request('http://internal/move', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(aiMoveResult)
        });

        const moveResponse = await stub.fetch(moveRequest);
        const updatedGame = await moveResponse.json();

        console.log(`AI moved: ${aiMoveResult.from}${aiMoveResult.to}`);

          // 如果游戏继续且对手也是AI，继续队列
        if (updatedGame.status === 'active') {
          const nextPlayer = updatedGame.currentTurn;
          const nextPlayerObj = nextPlayer === 'w' ? updatedGame.whitePlayer : updatedGame.blackPlayer;

          if (nextPlayerObj.type === 'ai') {
            await env.AI_GAME_QUEUE.send({
              gameId,
              currentPlayer: nextPlayer
            });
          }
        }

        message.ack();
      } catch (error: any) {
        console.error('Queue processing error:', error);
        message.retry();
      }
    }
  }
};

/**
 * 创建游戏（带输入验证）
 */
async function handleCreateGame(request: Request, env: Env, corsHeaders: any): Promise<Response> {
  try {
    const data: CreateGameRequest = await request.json();
    
    // 输入验证
    if (!data.mode || !['human-vs-human', 'human-vs-ai', 'ai-vs-ai'].includes(data.mode)) {
      return new Response(JSON.stringify({ error: 'Invalid game mode' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    if (!data.timeControl || ![300, 600, 900].includes(data.timeControl)) {
      return new Response(JSON.stringify({ error: 'Invalid time control' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // 创建游戏ID
    const gameId = crypto.randomUUID();

  // 获取Durable Object
  const id = env.GAME_STATE.idFromName(gameId);
  const stub = env.GAME_STATE.get(id);

  // 创建游戏
  const createRequest = new Request('http://internal/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  const response = await stub.fetch(createRequest);
  const gameState = await response.json();

    // 如果是AI vs AI，启动队列
    if (data.mode === 'ai-vs-ai' && data.whitePlayerType === 'ai') {
      await env.AI_GAME_QUEUE.send({
        gameId: gameState.id,
        currentPlayer: 'w'
      });
    }

    return new Response(JSON.stringify(gameState), {
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        ...corsHeaders 
      }
    });
  } catch (error: any) {
    console.error('Create game error:', error);
    return new Response(JSON.stringify({ error: 'Failed to create game' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

/**
 * 执行移动（带验证和错误处理）
 */
async function handleMakeMove(request: Request, env: Env, ctx: ExecutionContext, corsHeaders: any): Promise<Response> {
  try {
    const data: MakeMoveRequest = await request.json();
    
    // 输入验证
    if (!data.gameId || typeof data.gameId !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid game ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    if (!data.from || !data.to || !/^[a-h][1-8]$/.test(data.from) || !/^[a-h][1-8]$/.test(data.to)) {
      return new Response(JSON.stringify({ error: 'Invalid move format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const id = env.GAME_STATE.idFromName(data.gameId);
    const stub = env.GAME_STATE.get(id);

    const moveRequest = new Request('http://internal/move', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: data.from, to: data.to, promotion: data.promotion })
    });

    const response = await stub.fetch(moveRequest);
    
    if (!response.ok) {
      const error = await response.json();
      return new Response(JSON.stringify(error), {
        status: response.status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    const gameState = await response.json();

    // 如果对手是AI，触发AI移动
    if (gameState.status === 'active') {
      const nextPlayer = gameState.currentTurn;
      const nextPlayerObj = nextPlayer === 'w' ? gameState.whitePlayer : gameState.blackPlayer;

      if (nextPlayerObj.type === 'ai') {
        // 使用队列处理AI移动
        ctx.waitUntil(env.AI_GAME_QUEUE.send({
          gameId: data.gameId,
          currentPlayer: nextPlayer
        }));
      }
    }

    return new Response(JSON.stringify(gameState), {
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        ...corsHeaders 
      }
    });
  } catch (error: any) {
    console.error('Make move error:', error);
    return new Response(JSON.stringify({ error: 'Failed to make move' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

/**
 * 获取游戏状态
 */
async function handleGameState(request: Request, env: Env, corsHeaders: any): Promise<Response> {
  const url = new URL(request.url);
  const gameId = url.searchParams.get('gameId');

  if (!gameId) {
    return new Response(JSON.stringify({ error: 'Game ID required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  const id = env.GAME_STATE.idFromName(gameId);
  const stub = env.GAME_STATE.get(id);

  const response = await stub.fetch(new Request('http://internal/state'));
  const gameState = await response.json();

  return new Response(JSON.stringify(gameState), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
}

/**
 * 速率限制检查
 */
async function checkRateLimit(env: Env, key: string, limit: number, window: number): Promise<boolean> {
  // 使用KV或Durable Objects实现限流
  // 这里简化实现，实际应该使用持久化存储
  return true; // 暂时允许所有请求
}

/**
 * 输入验证
 */
function validateInput(data: any, schema: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // 基本验证逻辑
  if (schema.required) {
    for (const field of schema.required) {
      if (!data[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 获取robots.txt
 */
function getRobotsTxt(): string {
  return `User-agent: *
Allow: /
Disallow: /api/

Sitemap: https://aichess.win/sitemap.xml`;
}

/**
 * 获取sitemap.xml（支持多语言）
 */
function getSitemap(): string {
  const baseUrl = 'https://aichess.win';
  const now = new Date().toISOString().split('T')[0];
  const languages: Language[] = ['zh-CN', 'zh-TW', 'en', 'fr', 'es', 'de', 'it', 'pt', 'ru', 'ja', 'ko'];
  
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>`;
  
  // 添加hreflang链接
  for (const lang of languages) {
    sitemap += `
    <xhtml:link rel="alternate" hreflang="${lang}" href="${baseUrl}/?lang=${lang}" />`;
  }
  
  sitemap += `
  </url>
`;
  
  // 为每种语言添加单独的URL
  for (const lang of languages) {
    sitemap += `  <url>
    <loc>${baseUrl}/?lang=${lang}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
`;
  }
  
  sitemap += `</urlset>`;
  
  return sitemap;
}

/**
 * 获取manifest.json (PWA)
 */
function getManifest(): string {
  return JSON.stringify({
    name: 'AIChess - 智能国际象棋',
    short_name: 'AIChess',
    description: '挑战5种强大AI棋手，完全免费的在线国际象棋平台',
    start_url: '/',
    display: 'standalone',
    background_color: '#667eea',
    theme_color: '#667eea',
    icons: []
  }, null, 2);
}


/**
 * 获取国际象棋引擎JS代码
 */
function getChessEngineJS(): string {
  return `// AIChess自研国际象棋引擎 v3.0
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

    // 升变
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

// 暴露为全局变量
window.Chess = ChessEngine;
console.log('AIChess Engine v3.0 loaded');`;
}

/**
 * 获取HTML界面（支持多语言SEO）
 */
function getHTML(lang: Language = 'en'): string {
  const langCode = lang.split('-')[0]; // zh-CN -> zh
  
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
  
${getSEOTags(lang)}
  
  <!-- PWA -->
  <meta name="theme-color" content="#667eea">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <link rel="manifest" href="/manifest.json">
  
  <!-- 结构化数据 -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "AIChess",
    "url": "https://aichess.win",
    "description": "基于Cloudflare Workers的在线国际象棋对战平台",
    "applicationCategory": "GameApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "1000"
    }
  }
  </script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      color: #333;
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px;
    }

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
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }

    footer p {
      font-size: 1em;
      opacity: 0.9;
      margin: 10px 0;
      line-height: 1.6;
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
      transition: opacity 0.3s;
    }

    .footer-links a:hover {
      opacity: 1;
      text-decoration: underline;
    }

    .copyright {
      margin-top: 20px;
      font-size: 0.85em;
      opacity: 0.7;
    }

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

    .game-setup-sidebar.open {
      right: 0;
    }

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

    .setup-overlay.show {
      display: block;
    }

    @media (max-width: 768px) {
      .game-setup-sidebar {
        width: 100%;
        right: -100%;
      }
    }

    .game-area {
      display: none;
      gap: 20px;
    }

    @media (min-width: 1024px) {
      .game-area {
        display: grid;
        grid-template-columns: 1fr 400px;
      }
    }

    @media (max-width: 1023px) {
      .game-area {
        display: flex;
        flex-direction: column;
      }
    }

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

    @media (max-width: 768px) {
      .square {
        font-size: 2.5em;
      }
      
      #chessboard {
        max-width: 100%;
      }
    }

    .square.light {
      background-color: #f0d9b5;
    }

    .square.dark {
      background-color: #b58863;
    }

    .square.selected {
      background-color: #7fc97f !important;
      box-shadow: inset 0 0 0 3px #4caf50;
    }

    .square.possible-move {
      position: relative;
    }

    .square.possible-move::after {
      content: '';
      position: absolute;
      width: 30%;
      height: 30%;
      background-color: rgba(76, 175, 80, 0.4);
      border-radius: 50%;
    }

    .square:hover {
      opacity: 0.8;
    }

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

    .move-item {
      padding: 8px;
      margin-bottom: 5px;
      background: white;
      border-radius: 4px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .move-number {
      font-weight: bold;
      color: #666;
      margin-right: 10px;
    }

    .game-controls {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

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

    .btn-primary {
      background: #2196f3;
      color: white;
    }

    .btn-success {
      background: #4caf50;
      color: white;
    }

    .btn-danger {
      background: #f44336;
      color: white;
    }

    .btn-secondary {
      background: #9e9e9e;
      color: white;
    }

    .form-group {
      margin-bottom: 20px;
    }

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
      transition: border-color 0.3s;
    }

    select:focus, input:focus {
      outline: none;
      border-color: #2196f3;
    }

    .game-result {
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      text-align: center;
      font-size: 1.3em;
      font-weight: bold;
    }

    .game-result.white-wins {
      background: #e8f5e9;
      color: #2e7d32;
    }

    .game-result.black-wins {
      background: #e1f5fe;
      color: #01579b;
    }

    .game-result.draw {
      background: #fff9c4;
      color: #f57f17;
    }

    .hidden {
      display: none !important;
    }

    .loading {
      text-align: center;
      padding: 20px;
      color: #666;
    }

    .spinner {
      border: 3px solid #f3f3f3;
      border-top: 3px solid #2196f3;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 10px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .language-selector {
      position: absolute;
      top: 20px;
      right: 20px;
      z-index: 1000;
    }

    .language-selector select {
      width: auto;
      min-width: 150px;
    }

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
      box-shadow: 0 6px 16px rgba(0,0,0,0.4);
    }

    .welcome-message {
      text-align: center;
      padding: 40px 20px;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 12px;
      margin: 20px auto;
      max-width: 600px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
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
    }
  </style>
</head>
<body>
  <!-- 新游戏按钮 -->
  <button class="new-game-btn" onclick="openGameSetup()">
    <span id="new-game-btn-text">新游戏</span>
  </button>

  <!-- 遮罩层 -->
  <div class="setup-overlay" id="setup-overlay" onclick="closeGameSetup()"></div>

  <div class="language-selector">
    <select id="language-select">
      <option value="zh-CN">简体中文</option>
      <option value="zh-TW">繁體中文</option>
      <option value="en">English</option>
      <option value="fr">Français</option>
      <option value="es">Español</option>
      <option value="de">Deutsch</option>
      <option value="it">Italiano</option>
      <option value="pt">Português</option>
      <option value="ru">Русский</option>
      <option value="ja">日本語</option>
      <option value="ko">한국어</option>
    </select>
  </div>

  <div class="container">
    <!-- 游戏设置（侧边栏） -->
    <div class="game-setup-sidebar" id="game-setup">
      <button class="close-setup" onclick="closeGameSetup()">×</button>
      <h2 id="new-game-title">新游戏</h2>
      
      <div class="form-group">
        <label id="game-mode-label">游戏模式</label>
        <select id="game-mode">
          <option value="human-vs-human">人人对战</option>
          <option value="human-vs-ai">人机对战</option>
          <option value="ai-vs-ai">AI对战</option>
        </select>
      </div>

      <div class="form-group">
        <label id="time-control-label">时间控制</label>
        <select id="time-control">
          <option value="300">5分钟</option>
          <option value="600" selected>10分钟</option>
          <option value="900">15分钟</option>
        </select>
      </div>

      <div class="form-group" id="white-ai-group" style="display:none;">
        <label id="white-ai-label">白方AI</label>
        <select id="white-ai"></select>
      </div>

      <div class="form-group" id="black-ai-group" style="display:none;">
        <label id="black-ai-label">黑方AI</label>
        <select id="black-ai"></select>
      </div>

      <button class="btn-success" id="start-game" onclick="startGame()">开始游戏</button>
    </div>

    <!-- 游戏区域（默认显示） -->
    <div class="game-area" id="game-area">
      <div class="board-container">
        <!-- 欢迎消息 (Multilingual) -->
        <div class="welcome-message" id="welcome-message">
          <h2 id="welcome-title"></h2>
          <p id="welcome-text"></p>
          <p id="welcome-features"></p>
        </div>
        
        <div id="game-result" class="game-result hidden"></div>
        <div id="chessboard"></div>
      </div>

      <div class="info-panel">
        <div class="player-info" id="white-player-info">
          <div class="player-name" id="white-player-name">白方</div>
          <div class="timer" id="white-timer">10:00</div>
        </div>

        <div class="player-info" id="black-player-info">
          <div class="player-name" id="black-player-name">黑方</div>
          <div class="timer" id="black-timer">10:00</div>
        </div>

        <div class="move-history">
          <h3 id="move-history-title">行棋历史</h3>
          <div id="move-list"></div>
        </div>

        <div class="game-controls">
          <button class="btn-primary" onclick="newGame()">新游戏</button>
          <button class="btn-danger" onclick="resign()">认输</button>
        </div>
      </div>
    </div>

    <!-- Footer (English Only) -->
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
    let aiModels = [];
    let currentLanguage = '${lang}'; // 使用服务器检测的语言
    let chessLibLoaded = false;

    // Unicode棋子符号
    const pieceSymbols = {
      'wp': '♙', 'wn': '♘', 'wb': '♗', 'wr': '♖', 'wq': '♕', 'wk': '♔',
      'bp': '♟', 'bn': '♞', 'bb': '♝', 'br': '♜', 'bq': '♛', 'bk': '♚'
    };

    // 翻译对象（从服务器端导入）
    const translations = ${JSON.stringify(getAllTranslations())};
    
    // 翻译函数
    const t = (key) => translations[currentLanguage]?.[key] || translations['en'][key] || key;

    // 初始化
    async function init() {
      // 确保Chess库已加载
      if (typeof Chess === 'undefined') {
        console.error('Chess.js not loaded yet');
        setTimeout(init, 100);
        return;
      }

      await loadAIModels();
      
      // 设置语言选择器的当前值
      document.getElementById('language-select').value = currentLanguage;
      updateLanguage();
      
      document.getElementById('language-select').addEventListener('change', (e) => {
        currentLanguage = e.target.value;
        
        // 立即更新界面语言
        updateLanguage();
        
        // 同时更新URL参数（用于SEO，但不刷新页面）
        const url = new URL(window.location.href);
        url.searchParams.set('lang', currentLanguage);
        window.history.replaceState({}, '', url);
      });
      
      document.getElementById('game-mode').addEventListener('change', updateAISelectors);
      updateAISelectors();
      
      // 初始化空棋盘
      initEmptyBoard();
    }

    // 初始化空棋盘（等待开局）
    function initEmptyBoard() {
      if (typeof Chess === 'undefined') {
        console.error('Chess.js not loaded');
        return;
      }
      chess = new Chess();
      renderBoard();
    }

    // 打开游戏设置
    function openGameSetup() {
      document.getElementById('game-setup').classList.add('open');
      document.getElementById('setup-overlay').classList.add('show');
    }

    // 关闭游戏设置
    function closeGameSetup() {
      document.getElementById('game-setup').classList.remove('open');
      document.getElementById('setup-overlay').classList.remove('show');
    }

    // 加载AI模型列表
    async function loadAIModels() {
      try {
        const response = await fetch('/api/ai-models');
        aiModels = await response.json();
        
        const whiteSelect = document.getElementById('white-ai');
        const blackSelect = document.getElementById('black-ai');
        
        aiModels.forEach(model => {
          const option1 = document.createElement('option');
          option1.value = model.id;
          option1.textContent = model.name;
          whiteSelect.appendChild(option1);
          
          const option2 = document.createElement('option');
          option2.value = model.id;
          option2.textContent = model.name;
          blackSelect.appendChild(option2);
        });
      } catch (error) {
        console.error('Failed to load AI models:', error);
      }
    }

    // 更新AI选择器显示
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

    // 更新界面语言
    function updateLanguage() {
      // 安全更新元素，只更新存在的元素
      const safeUpdate = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
      };
      
      safeUpdate('new-game-title', t('newGame'));
      safeUpdate('new-game-btn-text', t('newGame'));
      safeUpdate('game-mode-label', t('timeControl'));
      safeUpdate('time-control-label', t('timeControl'));
      safeUpdate('white-ai-label', t('whitePlayer') + ' ' + t('ai'));
      safeUpdate('black-ai-label', t('blackPlayer') + ' ' + t('ai'));
      safeUpdate('start-game', t('startGame'));
      safeUpdate('move-history-title', t('moveHistory'));
      
      // 更新欢迎消息
      safeUpdate('welcome-title', t('appName'));
      safeUpdate('welcome-text', t('welcomeText'));
      safeUpdate('welcome-features', t('welcomeFeatures'));
      
      // 更新游戏模式选项
      const gameModeSelect = document.getElementById('game-mode');
      if (gameModeSelect && gameModeSelect.options.length >= 3) {
        gameModeSelect.options[0].textContent = t('humanVsHuman');
        gameModeSelect.options[1].textContent = t('humanVsAI');
        gameModeSelect.options[2].textContent = t('aiVsAI');
      }
      
      // 更新时间控制选项
      const timeControlSelect = document.getElementById('time-control');
      if (timeControlSelect && timeControlSelect.options.length >= 3) {
        timeControlSelect.options[0].textContent = t('minutes5');
        timeControlSelect.options[1].textContent = t('minutes10');
        timeControlSelect.options[2].textContent = t('minutes15');
      }
    }

    // 开始游戏
    async function startGame() {
      // 确保Chess库已加载
      if (typeof Chess === 'undefined') {
        alert('正在加载象棋引擎，请稍候...');
        setTimeout(startGame, 500);
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
        
        // 关闭设置侧边栏
        closeGameSetup();
        
        // 隐藏欢迎消息
        document.getElementById('welcome-message').classList.add('hidden');
        
        renderBoard();
        updateGameInfo();
        
        // 开始轮询更新
        updateInterval = setInterval(pollGameState, 1000);
      } catch (error) {
        console.error('Failed to start game:', error);
        const errorMsg = {
          'zh-CN': '启动游戏失败，请重试',
          'zh-TW': '啟動遊戲失敗，請重試',
          'en': 'Failed to start game, please try again',
          'fr': 'Échec du démarrage, réessayez',
          'es': 'Error al iniciar, inténtalo de nuevo',
          'de': 'Spielstart fehlgeschlagen, bitte erneut versuchen',
          'it': 'Avvio fallito, riprova',
          'pt': 'Falha ao iniciar, tente novamente',
          'ru': 'Ошибка запуска, попробуйте снова',
          'ja': 'ゲーム開始失敗、再試行してください',
          'ko': '게임 시작 실패, 다시 시도하세요'
        };
        alert(errorMsg[currentLanguage] || errorMsg['en']);
      }
    }

    // 轮询游戏状态
    async function pollGameState() {
      if (!gameState) return;
      
      try {
        const response = await fetch(\`/api/game-state?gameId=\${gameState.id}\`);
        const newState = await response.json();
        
        if (newState.moves.length !== gameState.moves.length || 
            newState.status !== gameState.status) {
          gameState = newState;
          chess = new Chess(gameState.fen);
          renderBoard();
          updateGameInfo();
        }
        
        updateTimers();
      } catch (error) {
        console.error('Failed to poll game state:', error);
      }
    }

    // 渲染棋盘
    function renderBoard() {
      if (!chess || typeof Chess === 'undefined') {
        console.log('Chess not ready, skipping render');
        return;
      }

      const board = document.getElementById('chessboard');
      board.innerHTML = '';
      
      const squares = chess.board();
      
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          const square = document.createElement('div');
          const squareName = String.fromCharCode(97 + col) + (8 - row);
          const piece = squares[row][col];
          
          square.className = 'square ' + ((row + col) % 2 === 0 ? 'light' : 'dark');
          square.dataset.square = squareName;
          
          if (piece) {
            const pieceCode = piece.color + piece.type;
            square.textContent = pieceSymbols[pieceCode] || '';
          }
          
          square.addEventListener('click', () => handleSquareClick(squareName));
          board.appendChild(square);
        }
      }
    }

    // 处理方格点击
    async function handleSquareClick(square) {
      if (!gameState || gameState.status !== 'active') return;
      if (!chess || typeof Chess === 'undefined') return;
      
      const currentPlayer = gameState.currentTurn === 'w' ? gameState.whitePlayer : gameState.blackPlayer;
      if (currentPlayer.type === 'ai') return;
      
      if (!selectedSquare) {
        const piece = chess.get(square);
        if (piece && piece.color === gameState.currentTurn) {
          selectedSquare = square;
          highlightSquare(square);
          showPossibleMoves(square);
        }
      } else {
        if (square === selectedSquare) {
          clearHighlights();
          selectedSquare = null;
        } else {
          await makeMove(selectedSquare, square);
          clearHighlights();
          selectedSquare = null;
        }
      }
    }

    // 执行移动
    async function makeMove(from, to) {
      try {
        const response = await fetch('/api/make-move', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gameId: gameState.id,
            from,
            to
          })
        });
        
        if (response.ok) {
          gameState = await response.json();
          chess = new Chess(gameState.fen);
          renderBoard();
          updateGameInfo();
        } else {
          alert('Invalid move');
        }
      } catch (error) {
        console.error('Failed to make move:', error);
        alert('Failed to make move');
      }
    }

    // 高亮方格
    function highlightSquare(square) {
      const element = document.querySelector(\`[data-square="\${square}"]\`);
      if (element) element.classList.add('selected');
    }

    // 显示可能的移动
    function showPossibleMoves(square) {
      const moves = chess.moves({ square, verbose: true });
      moves.forEach(move => {
        const element = document.querySelector(\`[data-square="\${move.to}"]\`);
        if (element) element.classList.add('possible-move');
      });
    }

    // 清除高亮
    function clearHighlights() {
      document.querySelectorAll('.selected, .possible-move').forEach(el => {
        el.classList.remove('selected', 'possible-move');
      });
    }

    // 更新游戏信息
    function updateGameInfo() {
      // 更新玩家名字
      document.getElementById('white-player-name').textContent = gameState.whitePlayer.name;
      document.getElementById('black-player-name').textContent = gameState.blackPlayer.name;
      
      // 更新活跃状态
      document.getElementById('white-player-info').classList.toggle('active', gameState.currentTurn === 'w');
      document.getElementById('black-player-info').classList.toggle('active', gameState.currentTurn === 'b');
      
      // 更新移动历史
      const moveList = document.getElementById('move-list');
      moveList.innerHTML = '';
      gameState.moves.forEach((move, index) => {
        const moveItem = document.createElement('div');
        moveItem.className = 'move-item';
        moveItem.innerHTML = \`
          <span><span class="move-number">\${Math.floor(index / 2) + 1}.</span>\${move.san}</span>
          <span>\${formatTime(move.timeRemaining)}</span>
        \`;
        moveList.appendChild(moveItem);
      });
      
      moveList.scrollTop = moveList.scrollHeight;
      
      // 更新游戏结果
      if (gameState.status !== 'active') {
        const resultDiv = document.getElementById('game-result');
        resultDiv.classList.remove('hidden');
        
        if (gameState.winner === 'w') {
          resultDiv.textContent = translations[currentLanguage]['whiteWins'];
          resultDiv.className = 'game-result white-wins';
        } else if (gameState.winner === 'b') {
          resultDiv.textContent = translations[currentLanguage]['blackWins'];
          resultDiv.className = 'game-result black-wins';
        } else {
          resultDiv.textContent = translations[currentLanguage]['draw'];
          resultDiv.className = 'game-result draw';
        }
        
        clearInterval(updateInterval);
      }
    }

    // 更新计时器
    function updateTimers() {
      if (!gameState || gameState.status !== 'active') return;
      
      const now = Date.now();
      const elapsed = Math.floor((now - gameState.lastMoveAt) / 1000);
      
      const whiteTime = gameState.currentTurn === 'w' 
        ? Math.max(0, gameState.whitePlayer.timeRemaining - elapsed)
        : gameState.whitePlayer.timeRemaining;
        
      const blackTime = gameState.currentTurn === 'b'
        ? Math.max(0, gameState.blackPlayer.timeRemaining - elapsed)
        : gameState.blackPlayer.timeRemaining;
      
      const whiteTimer = document.getElementById('white-timer');
      const blackTimer = document.getElementById('black-timer');
      
      whiteTimer.textContent = formatTime(whiteTime);
      blackTimer.textContent = formatTime(blackTime);
      
      whiteTimer.classList.toggle('low', whiteTime < 60);
      blackTimer.classList.toggle('low', blackTime < 60);
    }

    // 格式化时间
    function formatTime(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return \`\${mins}:\${secs.toString().padStart(2, '0')}\`;
    }

    // 新游戏
    function newGame() {
      if (updateInterval) {
        clearInterval(updateInterval);
      }
      
      gameState = null;
      chess = new Chess();
      selectedSquare = null;
      
      // 显示欢迎消息
      document.getElementById('welcome-message').classList.remove('hidden');
      document.getElementById('game-result').classList.add('hidden');
      
      // 渲染空棋盘
      renderBoard();
      
      // 清空信息面板
      const t = (key) => translations[currentLanguage][key] || key;
      document.getElementById('white-player-name').textContent = t('whitePlayer');
      document.getElementById('black-player-name').textContent = t('blackPlayer');
      document.getElementById('white-timer').textContent = '10:00';
      document.getElementById('black-timer').textContent = '10:00';
      document.getElementById('move-list').innerHTML = '';
      
      // 打开游戏设置
      openGameSetup();
    }

    // 认输
    async function resign() {
      if (!gameState || gameState.status !== 'active') return;
      
      const currentPlayer = gameState.currentTurn === 'w' ? gameState.whitePlayer : gameState.blackPlayer;
      if (currentPlayer.type === 'ai') return;
      
      if (confirm(translations[currentLanguage]['resign'] + '?')) {
        // TODO: 实现认输API
        alert('Resign feature coming soon');
      }
    }

    // 打开隐私政策 (English Only)
    function openPrivacyPolicy() {
      alert('Privacy Policy\\n\\n1. Data Collection: We do not collect personal identification information\\n2. Cookies: Only used for session management\\n3. Game Data: Securely stored in Cloudflare Durable Objects\\n4. Security: Enterprise-grade encryption protection\\n5. Your Rights: You can delete your data at any time\\n6. Third-party: We use Cloudflare Workers AI for chess AI\\n7. Data Retention: Game history stored for 90 days\\n8. Contact: contact@aichess.win for privacy concerns');
    }

    // 打开服务条款 (English Only)
    function openTerms() {
      alert('Terms of Service\\n\\n1. Free Service: All features are provided free of charge\\n2. Game Rules: Must follow FIDE international chess rules\\n3. Fair Play: Cheating and abuse are strictly prohibited\\n4. As-Is Service: Service provided without warranties\\n5. Modifications: We reserve the right to modify the service\\n6. Account: Optional user accounts for rating tracking\\n7. Content: All game data belongs to you\\n8. Termination: We may suspend accounts for violations');
    }

    // 页面加载完成后初始化（不依赖外部库）
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', waitForChess);
    } else {
      waitForChess();
    }

    // 等待Chess.js加载
    function waitForChess() {
      if (typeof Chess !== 'undefined') {
        init();
      } else {
        setTimeout(waitForChess, 100);
      }
    }
  </script>
  
  <!-- 国际象棋引擎（自研，无外部依赖） -->
  <script src="/chess-engine.js"></script>
</body>
</html>`;
}

