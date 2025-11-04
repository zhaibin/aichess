// AI处理器
import { Env } from '../types';
import { AI_MODELS } from '../config/constants';
import { CORS_HEADERS } from '../config/headers';
import { getAIMove } from '../services/ai-player';

/**
 * 获取AI模型列表
 */
export async function handleAIModels(request: Request, env: Env): Promise<Response> {
  const models = Object.values(AI_MODELS).map(model => ({
    id: model.id,
    name: model.name
  }));

  return new Response(JSON.stringify(models), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
      ...CORS_HEADERS
    }
  });
}

/**
 * 获取AI移动（新增：直接调用，不用队列）
 */
export async function handleAIMove(
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
    const { gameId } = await request.json();

    if (!gameId) {
      return new Response(JSON.stringify({ error: 'Missing gameId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
      });
    }

    // 获取游戏状态
    const id = env.GAME_STATE.idFromName(gameId);
    const gameState = env.GAME_STATE.get(id);
    
    const response = await gameState.fetch(new Request('http://do/state'));
    const game = await response.json();

    if (game.status !== 'active') {
      return new Response(JSON.stringify({ error: 'Game is not active' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
      });
    }

    // 获取当前玩家
    const currentPlayer = game.currentTurn === 'w' ? game.whitePlayer : game.blackPlayer;
    
    if (currentPlayer.type !== 'ai') {
      return new Response(JSON.stringify({ error: 'Current player is not AI' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
      });
    }

    // 获取AI移动（2秒思考延迟）
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const aiMove = await getAIMove(game, currentPlayer.aiModel!, env);

    if (!aiMove) {
      return new Response(JSON.stringify({ error: 'AI failed to generate move' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
      });
    }

    // 执行AI移动
    const moveResponse = await gameState.fetch(new Request('http://do/move', {
      method: 'POST',
      body: JSON.stringify({
        from: aiMove.from,
        to: aiMove.to,
        promotion: aiMove.promotion
      })
    }));

    if (!moveResponse.ok) {
      const error = await moveResponse.json();
      return new Response(JSON.stringify(error), {
        status: moveResponse.status,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
      });
    }

    const updatedGame = await moveResponse.json();

    return new Response(JSON.stringify(updatedGame), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        ...CORS_HEADERS
      }
    });

  } catch (error) {
    console.error('AI move error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to get AI move',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
    });
  }
}
