// API路由
import { Env } from '../types';
import { handleCreateGame, handleMakeMove, handleGameState } from '../handlers/game.handler';
import { handleAIModels, handleAIMove } from '../handlers/ai.handler';
import { CORS_HEADERS } from '../config/headers';

/**
 * API路由处理
 */
export async function apiRoutes(
  request: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  // 路由映射
  const routes: Record<string, (req: Request, env: Env, ctx: ExecutionContext) => Promise<Response>> = {
    '/api/create-game': handleCreateGame,
    '/api/make-move': handleMakeMove,
    '/api/ai-move': handleAIMove,
    '/api/game-state': handleGameState,
    '/api/ai-models': handleAIModels,
    '/api/health': handleHealth
  };

  const handler = routes[path];
  if (handler) {
    return await handler(request, env, ctx);
  }

  return new Response(JSON.stringify({ error: 'API endpoint not found' }), {
    status: 404,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS
    }
  });
}

/**
 * 健康检查
 */
async function handleHealth(): Promise<Response> {
  return new Response(JSON.stringify({
    status: 'ok',
    version: '4.0.0',
    timestamp: Date.now()
  }), {
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS
    }
  });
}

