// 常量配置

export const AI_MODELS = {
  'llama-4-scout-17b': {
    id: 'llama-4-scout-17b',
    name: 'Meta Llama4 17B',
    modelId: '@cf/meta/llama-4-scout-17b-16e-instruct',
    type: 'messages',
    temperature: 0.3, // 降低以减少随机性
    maxTokens: 150, // 只需要JSON，不需要长文本
    topP: 0.9,
    repetitionPenalty: 1.1,
    frequencyPenalty: 0.5,
    role: 'Magnus Carlsen',
    supportsJsonMode: true // ✅ 支持JSON Mode
  },
  'gemma-3-12b': {
    id: 'gemma-3-12b',
    name: 'Gemma 3 12B',
    modelId: '@cf/google/gemma-3-12b-it',
    type: 'messages',
    temperature: 0.35,
    maxTokens: 150,
    role: 'Garry Kasparov',
    supportsJsonMode: true
  },
  'qwq-32b': {
    id: 'qwq-32b',
    name: 'QwQ 32B',
    modelId: '@cf/qwen/qwq-32b',
    type: 'messages',
    temperature: 0.3,
    maxTokens: 150,
    role: 'Bobby Fischer',
    supportsJsonMode: true
  },
  'deepseek-32b': {
    id: 'deepseek-32b',
    name: 'Deepseek 32B',
    modelId: '@cf/deepseek-ai/deepseek-r1-distill-qwen-32b',
    type: 'messages',
    temperature: 0.3,
    maxTokens: 150,
    role: 'Mikhail Tal',
    supportsJsonMode: true
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

