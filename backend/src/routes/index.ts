// 路由系统
import { Env } from '../types';
import { apiRoutes } from './api.routes';
import { staticRoutes } from './static.routes';
import { seoRoutes } from './seo.routes';
import { CORS_HEADERS, SECURITY_HEADERS } from '../config/headers';

/**
 * 主路由处理器
 */
export const router = {
  async handle(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // 处理OPTIONS预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: { ...CORS_HEADERS, ...SECURITY_HEADERS },
        status: 204
      });
    }

    try {
      // API路由
      if (path.startsWith('/api/')) {
        return await apiRoutes(request, env, ctx);
      }

      // SEO相关路由
      if (path === '/robots.txt' || path === '/sitemap.xml' || path === '/manifest.json') {
        return await seoRoutes(request, env);
      }

      // 静态资源和前端
      return await staticRoutes(request, env);

    } catch (error) {
      console.error('Router error:', error);
      return new Response(JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...CORS_HEADERS
        }
      });
    }
  }
};

