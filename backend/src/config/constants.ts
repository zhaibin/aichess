// 常量配置

// 根据Cloudflare Workers AI文档优化的模型配置
export const AI_MODELS = {
  'llama-4-scout-17b': {
    id: 'llama-4-scout-17b',
    name: 'Meta Llama4 17B',
    modelId: '@cf/meta/llama-4-scout-17b-16e-instruct',
    type: 'messages',
    temperature: 0.15, // 文档推荐默认值
    maxTokens: 150,
    topP: 0.9,
    topK: 40,
    repetitionPenalty: 1.1,
    frequencyPenalty: 0.5,
    presencePenalty: 0.3,
    role: 'Magnus Carlsen',
    supportsGuidedJson: true
  },
  'gemma-3-12b': {
    id: 'gemma-3-12b',
    name: 'Gemma 3 12B',
    modelId: '@cf/google/gemma-3-12b-it',
    type: 'messages',
    temperature: 0.4, // Gemma适合稍高温度
    maxTokens: 150,
    topP: 0.85,
    topK: 35,
    repetitionPenalty: 1.15,
    frequencyPenalty: 0.6,
    presencePenalty: 0.4,
    role: 'Garry Kasparov',
    supportsGuidedJson: true
  },
  'qwq-32b': {
    id: 'qwq-32b',
    name: 'QwQ 32B',
    modelId: '@cf/qwen/qwq-32b',
    type: 'messages',
    temperature: 0.25, // 推理模型,低温度
    maxTokens: 150,
    topP: 0.8,
    topK: 30,
    repetitionPenalty: 1.2,
    frequencyPenalty: 0.7,
    presencePenalty: 0.5,
    role: 'Bobby Fischer',
    supportsGuidedJson: true
  },
  'deepseek-32b': {
    id: 'deepseek-32b',
    name: 'Deepseek 32B',
    modelId: '@cf/deepseek-ai/deepseek-r1-distill-qwen-32b',
    type: 'messages',
    temperature: 0.2, // Deepseek R1推理模型,极低温度
    maxTokens: 150,
    topP: 0.75,
    topK: 25,
    repetitionPenalty: 1.25,
    frequencyPenalty: 0.8,
    presencePenalty: 0.6,
    role: 'Mikhail Tal',
    supportsGuidedJson: true
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

