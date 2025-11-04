// 速率限制工具
import { Env } from '../types';

/**
 * 检查速率限制
 */
export async function checkRateLimit(
  env: Env,
  key: string,
  maxRequests: number,
  windowSeconds: number
): Promise<boolean> {
  // 简化版本：总是返回true
  // 在生产环境中，可以使用Durable Objects或KV存储实现
  return true;
}

