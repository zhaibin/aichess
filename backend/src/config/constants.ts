// 常量配置

export const AI_MODELS = {
  'gpt-oss-20b': {
    id: 'gpt-oss-20b',
    name: 'ChatGPT 20B',
    modelId: '@cf/openai/gpt-oss-20b'
  },
  'llama-4-scout-17b': {
    id: 'llama-4-scout-17b',
    name: 'Meta Llama4 17B',
    modelId: '@cf/meta/llama-4-scout-17b-16e-instruct'
  },
  'gemma-3-12b': {
    id: 'gemma-3-12b',
    name: 'Gemma 3 12B',
    modelId: '@cf/google/gemma-3-12b-it'
  },
  'qwq-32b': {
    id: 'qwq-32b',
    name: 'QwQ 32B',
    modelId: '@cf/qwen/qwq-32b'
  },
  'deepseek-32b': {
    id: 'deepseek-32b',
    name: 'Deepseek 32B',
    modelId: '@cf/deepseek-ai/deepseek-r1-distill-qwen-32b'
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

