// 静态资源路由
import { Env } from '../types';
import { getHTMLTemplate } from '../templates/html.template';
import { getChessEngineScript } from '../templates/chess-engine.template';
import { getLanguageFromURL } from '../utils/language';
import { getResponseHeaders } from '../config/headers';
import { CACHE_CONTROL } from '../config/constants';

/**
 * 静态资源路由处理
 */
export async function staticRoutes(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  // 首页HTML
  if (path === '/' || path === '/index.html') {
    const lang = getLanguageFromURL(url);
    const html = getHTMLTemplate(lang);
    
    return new Response(html, {
      headers: {
        ...getResponseHeaders('text/html; charset=utf-8', CACHE_CONTROL.HTML),
        'Content-Language': lang,
        'Vary': 'Accept-Language'
      }
    });
  }

  // Chess引擎脚本
  if (path === '/chess-engine.js') {
    return new Response(getChessEngineScript(), {
      headers: getResponseHeaders(
        'application/javascript; charset=utf-8',
        CACHE_CONTROL.STATIC
      )
    });
  }

  // 前端构建产物（从frontend/dist）
  // 这里需要配置Workers Assets或R2存储
  // 暂时返回404
  return new Response(JSON.stringify({ error: 'Not found' }), {
    status: 404,
    headers: getResponseHeaders('application/json')
  });
}

