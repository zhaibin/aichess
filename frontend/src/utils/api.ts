// API工具类

const API_BASE = '/api';

interface CreateGameRequest {
  mode: string;
  timeControl: number;
  whitePlayerType: string;
  blackPlayerType: string;
  whiteAIModel?: string;
  blackAIModel?: string;
}

class API {
  async createGame(req: CreateGameRequest): Promise<any> {
    const response = await fetch(`${API_BASE}/create-game`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req)
    });

    if (!response.ok) {
      throw new Error('Failed to create game');
    }

    return response.json();
  }

  async getGameState(gameId: string): Promise<any> {
    const response = await fetch(`${API_BASE}/game-state?gameId=${gameId}`);
    
    if (!response.ok) {
      throw new Error('Failed to get game state');
    }

    return response.json();
  }

  async makeMove(gameId: string, from: string, to: string, promotion?: string): Promise<any> {
    const response = await fetch(`${API_BASE}/make-move`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ gameId, from, to, promotion })
    });

    if (!response.ok) {
      throw new Error('Failed to make move');
    }

    return response.json();
  }

  async getAIModels(): Promise<any[]> {
    const response = await fetch(`${API_BASE}/ai-models`);
    
    if (!response.ok) {
      throw new Error('Failed to get AI models');
    }

    return response.json();
  }
}

export const api = new API();

