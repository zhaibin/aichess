// 类型定义

export type PlayerType = 'human' | 'ai';
export type GameMode = 'human-vs-human' | 'human-vs-ai' | 'ai-vs-ai';
export type TimeControl = 300 | 600 | 900; // 5, 10, 15 minutes in seconds
export type GameStatus = 'waiting' | 'active' | 'completed' | 'draw' | 'timeout';
export type Language = 'zh-CN' | 'zh-TW' | 'en' | 'fr' | 'es' | 'de' | 'it' | 'pt' | 'ru' | 'ja' | 'ko';

export interface AIModel {
  id: string;
  name: string;
  modelId: string;
}

export const AI_MODELS: Record<string, AIModel> = {
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
};

export interface Player {
  type: PlayerType;
  aiModel?: string;
  name: string;
  color: 'w' | 'b';
  timeRemaining: number; // seconds
}

export interface Move {
  from: string;
  to: string;
  promotion?: string;
  san: string; // Standard Algebraic Notation
  timestamp: number;
  timeRemaining: number;
}

export interface GameState {
  id: string;
  mode: GameMode;
  status: GameStatus;
  timeControl: TimeControl;
  whitePlayer: Player;
  blackPlayer: Player;
  currentTurn: 'w' | 'b';
  fen: string; // Forsyth-Edwards Notation
  moves: Move[];
  winner?: 'w' | 'b' | 'draw';
  createdAt: number;
  lastMoveAt: number;
}

export interface CreateGameRequest {
  mode: GameMode;
  timeControl: TimeControl;
  whitePlayerType: PlayerType;
  blackPlayerType: PlayerType;
  whiteAIModel?: string;
  blackAIModel?: string;
  whiteName?: string;
  blackName?: string;
}

export interface MakeMoveRequest {
  gameId: string;
  from: string;
  to: string;
  promotion?: string;
}

export interface AIGameQueueMessage {
  gameId: string;
  currentPlayer: 'w' | 'b';
}

export interface Env {
  AI: any;
  GAME_STATE: DurableObjectNamespace;
  AI_GAME_QUEUE: Queue<AIGameQueueMessage>;
}

