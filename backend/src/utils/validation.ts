// 输入验证工具
import { CreateGameRequest } from '../types';
import { AI_MODELS } from '../config/constants';

interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * 验证创建游戏请求
 */
export function validateCreateGameRequest(body: CreateGameRequest): ValidationResult {
  if (!body.mode || !['human-vs-human', 'human-vs-ai', 'ai-vs-ai'].includes(body.mode)) {
    return { valid: false, error: 'Invalid game mode' };
  }

  if (!body.timeControl || ![300, 600, 900].includes(body.timeControl)) {
    return { valid: false, error: 'Invalid time control' };
  }

  if (!['human', 'ai'].includes(body.whitePlayerType)) {
    return { valid: false, error: 'Invalid white player type' };
  }

  if (!['human', 'ai'].includes(body.blackPlayerType)) {
    return { valid: false, error: 'Invalid black player type' };
  }

  // 验证AI模型
  if (body.whitePlayerType === 'ai') {
    if (!body.whiteAIModel || !AI_MODELS[body.whiteAIModel]) {
      return { valid: false, error: 'Invalid white AI model' };
    }
  }

  if (body.blackPlayerType === 'ai') {
    if (!body.blackAIModel || !AI_MODELS[body.blackAIModel]) {
      return { valid: false, error: 'Invalid black AI model' };
    }
  }

  return { valid: true };
}

/**
 * 验证移动请求
 */
export function validateMakeMoveRequest(body: any): ValidationResult {
  console.log('验证移动请求:', body);
  
  if (!body) {
    return { valid: false, error: 'Request body is empty' };
  }
  
  if (!body.gameId || typeof body.gameId !== 'string') {
    return { valid: false, error: 'Invalid game ID: ' + JSON.stringify(body.gameId) };
  }

  if (!body.from || typeof body.from !== 'string' || body.from.length !== 2) {
    return { valid: false, error: 'Invalid from square: ' + JSON.stringify(body.from) };
  }

  if (!body.to || typeof body.to !== 'string' || body.to.length !== 2) {
    return { valid: false, error: 'Invalid to square: ' + JSON.stringify(body.to) };
  }

  if (body.promotion && !['q', 'r', 'b', 'n'].includes(body.promotion)) {
    return { valid: false, error: 'Invalid promotion piece: ' + JSON.stringify(body.promotion) };
  }

  console.log('验证通过');
  return { valid: true };
}

