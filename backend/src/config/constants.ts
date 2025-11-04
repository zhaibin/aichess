// 常量配置

/**
 * 根据Cloudflare Workers AI官方文档配置
 * 
 * 参考文档:
 * - Llama 4: https://developers.cloudflare.com/workers-ai/models/llama-4-scout-17b-16e-instruct/
 * - Gemma 3: https://developers.cloudflare.com/workers-ai/models/gemma-3-12b-it/
 * - QwQ 32B: https://developers.cloudflare.com/workers-ai/models/qwq-32b/
 * - Deepseek R1: https://developers.cloudflare.com/workers-ai/models/deepseek-r1-distill-qwen-32b/
 */
export const AI_MODELS = {
  'llama-4-scout-17b': {
    id: 'llama-4-scout-17b',
    name: 'Meta Llama4 17B',
    modelId: '@cf/meta/llama-4-scout-17b-16e-instruct',
    type: 'messages',
    // Llama 4文档默认值: temperature=0.15, max_tokens=256
    temperature: 0.15,
    maxTokens: 150,
    topP: 0.9,
    topK: 40,
    repetitionPenalty: 1.1,
    frequencyPenalty: 0.5,
    presencePenalty: 0.3,
    role: 'Magnus Carlsen',
    description: '均衡型，适合通用对局'
  },
  'gemma-3-12b': {
    id: 'gemma-3-12b',
    name: 'Gemma 3 12B',
    modelId: '@cf/google/gemma-3-12b-it',
    type: 'messages',
    // Gemma 3文档默认值: temperature=0.6, max_tokens=256
    temperature: 0.5, // 略低于默认，保持创造性但更稳定
    maxTokens: 150,
    topP: 0.9,
    topK: 40,
    repetitionPenalty: 1.15,
    frequencyPenalty: 0.6,
    presencePenalty: 0.4,
    role: 'Garry Kasparov',
    description: '创造型，适合复杂战术'
  },
  'qwq-32b': {
    id: 'qwq-32b',
    name: 'QwQ 32B',
    modelId: '@cf/qwen/qwq-32b',
    type: 'messages',
    // QwQ是推理模型，需要低温度保证精确性
    temperature: 0.3,
    maxTokens: 150,
    topP: 0.85,
    topK: 35,
    repetitionPenalty: 1.2,
    frequencyPenalty: 0.7,
    presencePenalty: 0.5,
    role: 'Bobby Fischer',
    description: '推理型，深度计算'
  },
  'deepseek-32b': {
    id: 'deepseek-32b',
    name: 'Deepseek 32B',
    modelId: '@cf/deepseek-ai/deepseek-r1-distill-qwen-32b',
    type: 'messages',
    // Deepseek R1是推理模型，极低温度
    temperature: 0.25,
    maxTokens: 150,
    topP: 0.8,
    topK: 30,
    repetitionPenalty: 1.2,
    frequencyPenalty: 0.75,
    presencePenalty: 0.55,
    role: 'Mikhail Tal',
    description: '精确型，计算导向'
  }
} as const;

export const PIECE_SYMBOLS = {
  'wp': '♙', 'wn': '♘', 'wb': '♗', 'wr': '♖', 'wq': '♕', 'wk': '♔',
  'bp': '♟', 'bn': '♞', 'bb': '♝', 'br': '♜', 'bq': '♛', 'bk': '♚'
} as const;

export const SUPPORTED_LANGUAGES = [
  'zh-CN', 'zh-TW', 'en', 'fr', 'es', 'de', 'it', 'pt', 'ru', 'ja', 'ko'
] as const;

export const RATE_LIMIT = {
  MAX_REQUESTS: 100,
  WINDOW_SECONDS: 60
} as const;

export const CACHE_CONTROL = {
  HTML: 'public, max-age=300, s-maxage=600',
  STATIC: 'public, max-age=86400',
  API: 'no-cache'
} as const;

