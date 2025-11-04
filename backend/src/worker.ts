// AIChess Backend - Cloudflare Worker Entry Point
import { Env } from './types';
import { router } from './routes';
import { handleQueue } from './handlers/queue.handler';

// Export Durable Objects
export { GameState } from './services/game-state';
export { WebSocketRoom } from './services/websocket-room';
export { UserStore } from './services/user-system';

/**
 * Cloudflare Workers主入口
 */
export default {
  /**
   * 处理HTTP请求
   */
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return router.handle(request, env, ctx);
  },

  /**
   * 处理队列消息
   */
  async queue(batch: MessageBatch, env: Env): Promise<void> {
    return handleQueue(batch, env);
  }
};

