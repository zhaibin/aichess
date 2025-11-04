// 游戏处理器
import { Env, CreateGameRequest } from '../types';
import { validateCreateGameRequest, validateMakeMoveRequest } from '../utils/validation';
import { checkRateLimit } from '../utils/rate-limit';
import { CORS_HEADERS } from '../config/headers';

/**
 * 创建游戏
 */
export async function handleCreateGame(
  request: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
    });
  }

  try {
    const body: CreateGameRequest = await request.json();
    
    // 验证输入
    const validation = validateCreateGameRequest(body);
    if (!validation.valid) {
      return new Response(JSON.stringify({ error: validation.error }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
      });
    }

    // 创建游戏ID
    const gameId = crypto.randomUUID();
    console.log('🎮 创建游戏，ID:', gameId);
    
    const id = env.GAME_STATE.idFromName(gameId);
    console.log('📍 DO ID:', id.toString());
    
    const gameState = env.GAME_STATE.get(id);
    console.log('✅ 获取DO实例');

    // 调用Durable Object创建游戏
    console.log('📨 调用DO /create');
    const response = await gameState.fetch(new Request('http://do/create', {
      method: 'POST',
      body: JSON.stringify({ ...body, gameId }) // ✅ 传递gameId
    }));
    
    console.log('📥 DO响应状态:', response.status);

    const game = await response.json();

    // AI vs AI游戏，发送到队列启动
    if (game.mode === 'ai-vs-ai') {
      console.log('═══════════════════════════════════════');
      console.log('🤖 AI vs AI游戏，准备发送到队列');
      console.log('📋 游戏ID:', game.id);
      console.log('📋 白方:', game.whitePlayer.name, '(', game.whitePlayer.aiModel, ')');
      console.log('📋 黑方:', game.blackPlayer.name, '(', game.blackPlayer.aiModel, ')');
      console.log('═══════════════════════════════════════');
      
      try {
        const queueMessage = {
          gameId: game.id,
          currentPlayer: 'w'
        };
        console.log('📤 发送队列消息:', JSON.stringify(queueMessage));
        
        await env.AI_GAME_QUEUE.send(queueMessage);
        
        console.log('✅ 队列消息已成功发送！');
        console.log('💡 队列应该会在几秒内开始处理...');
      } catch (error) {
        console.error('❌ 发送队列消息失败:', error);
        console.error('错误详情:', error instanceof Error ? error.message : String(error));
      }
    }

    return new Response(JSON.stringify(game), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        ...CORS_HEADERS
      }
    });

  } catch (error) {
    console.error('Create game error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to create game',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
    });
  }
}

/**
 * 执行移动
 */
export async function handleMakeMove(
  request: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
    });
  }

  try {
    const body = await request.json();
    
    // 验证输入
    const validation = validateMakeMoveRequest(body);
    if (!validation.valid) {
      return new Response(JSON.stringify({ error: validation.error }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
      });
    }

    const { gameId, from, to, promotion } = body;
    const id = env.GAME_STATE.idFromName(gameId);
    const gameState = env.GAME_STATE.get(id);

    // 调用Durable Object执行移动
    const response = await gameState.fetch(new Request('http://do/move', {
      method: 'POST',
      body: JSON.stringify({ from, to, promotion })
    }));

    if (!response.ok) {
      const error = await response.json();
      return new Response(JSON.stringify(error), {
        status: response.status,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
      });
    }

    const game = await response.json();

    // 不再自动发送到队列，由前端控制
    // 人机对战：前端调用 /api/ai-move
    // AI vs AI：前端轮询，后端队列自动处理

    return new Response(JSON.stringify(game), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        ...CORS_HEADERS
      }
    });

  } catch (error) {
    console.error('Make move error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to make move',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
    });
  }
}

/**
 * 获取游戏状态
 */
export async function handleGameState(
  request: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  const url = new URL(request.url);
  const gameId = url.searchParams.get('gameId');

  if (!gameId) {
    return new Response(JSON.stringify({ error: 'Missing gameId parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
    });
  }

  try {
    console.log('📊 获取游戏状态，gameId:', gameId);
    const id = env.GAME_STATE.idFromName(gameId);
    console.log('📍 DO ID:', id.toString());
    
    const gameState = env.GAME_STATE.get(id);
    console.log('📨 调用DO /state');

    const response = await gameState.fetch(new Request('http://do/state'));
    console.log('📥 DO响应:', response.status);
    
    const game = await response.json();
    console.log('📦 响应内容:', game.error ? 'ERROR: ' + game.error : 'OK');

    return new Response(JSON.stringify(game), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        ...CORS_HEADERS
      }
    });

  } catch (error) {
    console.error('Get game state error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to get game state',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
    });
  }
}

