// AI处理器
import { Env } from '../types';
import { AI_MODELS } from '../config/constants';
import { CORS_HEADERS } from '../config/headers';

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

