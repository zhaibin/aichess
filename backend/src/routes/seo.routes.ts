// SEO路由
import { Env } from '../types';
import { getRobotsTxt, getSitemap, getManifest } from '../templates/seo.template';
import { getResponseHeaders } from '../config/headers';
import { CACHE_CONTROL } from '../config/constants';

/**
 * SEO相关路由处理
 */
export async function seoRoutes(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  switch (path) {
    case '/robots.txt':
      return new Response(getRobotsTxt(), {
        headers: getResponseHeaders('text/plain', CACHE_CONTROL.STATIC)
      });

    case '/sitemap.xml':
      return new Response(getSitemap(), {
        headers: getResponseHeaders('application/xml', CACHE_CONTROL.STATIC)
      });

    case '/manifest.json':
      return new Response(getManifest(), {
        headers: getResponseHeaders('application/json', CACHE_CONTROL.STATIC)
      });

    default:
      return new Response('Not found', { status: 404 });
  }
}

