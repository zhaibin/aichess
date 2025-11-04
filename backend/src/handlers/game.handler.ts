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
    const id = env.GAME_STATE.idFromName(gameId);
    const gameState = env.GAME_STATE.get(id);

    // 调用Durable Object创建游戏
    const response = await gameState.fetch(new Request('http://do/create', {
      method: 'POST',
      body: JSON.stringify(body)
    }));

    const game = await response.json();

    // AI vs AI游戏，发送到队列启动
    if (body.mode === 'ai-vs-ai' && body.whitePlayerType === 'ai') {
      console.log('AI vs AI游戏，发送首步到队列');
      await env.AI_GAME_QUEUE.send({
        gameId,
        currentPlayer: 'w'
      });
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
    const id = env.GAME_STATE.idFromName(gameId);
    const gameState = env.GAME_STATE.get(id);

    const response = await gameState.fetch(new Request('http://do/state'));
    const game = await response.json();

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

