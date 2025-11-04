// 常量配置

/**
 * 严格按照Cloudflare Workers AI官方文档配置
 * 
 * 参考文档:
 * - Llama 4: https://developers.cloudflare.com/workers-ai/models/llama-4-scout-17b-16e-instruct/
 *   默认: temperature=0.15, top_p范围0-2, supports response_format
 * 
 * - Gemma 3: https://developers.cloudflare.com/workers-ai/models/gemma-3-12b-it/
 *   默认: temperature=0.6, context=80K, supports guided_json
 * 
 * - QwQ 32B: https://developers.cloudflare.com/workers-ai/models/qwq-32b/
 *   推理模型，适合复杂计算任务
 * 
 * - Deepseek R1: https://developers.cloudflare.com/workers-ai/models/deepseek-r1-distill-qwen-32b/
 *   默认: temperature=0.6, top_p范围0.001-1, frequency/presence_penalty范围-2到2
 *   supports response_format with json_object and json_schema
 */
export const AI_MODELS = {
  'llama-4-scout-17b': {
    id: 'llama-4-scout-17b',
    name: 'Meta Llama4 17B',
    modelId: '@cf/meta/llama-4-scout-17b-16e-instruct',
    type: 'messages',
    temperature: 0.15, // 文档默认值
    maxTokens: 150,
    topP: 0.9,  // 范围 0-2
    topK: 40,   // 范围 1-50
    repetitionPenalty: 1.1,  // 范围 0-2
    frequencyPenalty: 0.5,   // 范围 0-2
    presencePenalty: 0.3,    // 范围 0-2
    role: 'Magnus Carlsen',
    description: '均衡型，适合通用对局'
  },
  'gemma-3-12b': {
    id: 'gemma-3-12b',
    name: 'Gemma 3 12B',
    modelId: '@cf/google/gemma-3-12b-it',
    type: 'messages',
    temperature: 0.5, // 文档默认0.6，略低以提高稳定性
    maxTokens: 150,
    topP: 0.9,  // 范围 0-2
    topK: 40,   // 范围 1-50
    repetitionPenalty: 1.15,  // 范围 0-2
    frequencyPenalty: 0.6,    // 范围 0-2
    presencePenalty: 0.4,     // 范围 0-2
    role: 'Garry Kasparov',
    description: '创造型，80K上下文，适合复杂战术'
  },
  'qwq-32b': {
    id: 'qwq-32b',
    name: 'QwQ 32B',
    modelId: '@cf/qwen/qwq-32b',
    type: 'messages',
    temperature: 0.3,  // 推理模型，低温度
    maxTokens: 150,
    topP: 0.85,  // 范围 0-2
    topK: 35,    // 范围 1-50
    repetitionPenalty: 1.2,   // 范围 0-2
    frequencyPenalty: 0.7,    // 范围 0-2
    presencePenalty: 0.5,     // 范围 0-2
    role: 'Bobby Fischer',
    description: '推理型，深度计算，适合复杂局面'
  },
  'deepseek-32b': {
    id: 'deepseek-32b',
    name: 'Deepseek 32B',
    modelId: '@cf/deepseek-ai/deepseek-r1-distill-qwen-32b',
    type: 'messages',
    temperature: 0.4,  // 文档默认0.6，降低以提高稳定性
    maxTokens: 150,
    topP: 0.9,  // ✅ 文档范围0.001-1，使用0.9
    topK: 35,   // 范围 1-50
    repetitionPenalty: 1.15,  // 范围 0-2
    frequencyPenalty: 0.6,    // ✅ 文档范围-2到2，使用正值
    presencePenalty: 0.4,     // ✅ 文档范围-2到2，使用正值
    role: 'Mikhail Tal',
    description: '推理型，R1蒸馏模型，超越o1-mini性能'
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

