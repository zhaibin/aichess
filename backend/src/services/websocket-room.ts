// WebSocket实时对战房间
import { DurableObject } from 'cloudflare:workers';
import { GameState, Env, WebSocketMessage } from './types';

/**
 * WebSocket对战房间（Durable Object）
 */
export class WebSocketRoom extends DurableObject {
  private state: DurableObjectState;
  private sessions: Map<WebSocket, { userId: string; role: 'white' | 'black' | 'spectator' }>;
  private gameState: GameState | null;

  constructor(state: DurableObjectState, env: Env) {
    super(state, env);
    this.state = state;
    this.sessions = new Map();
    this.gameState = null;
  }

  /**
   * 处理HTTP请求（用于WebSocket升级）
   */
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // WebSocket升级
    if (request.headers.get('Upgrade') === 'websocket') {
      return this.handleWebSocket(request);
    }

    // REST API
    if (url.pathname === '/state') {
      return this.handleGetState();
    }

    if (url.pathname === '/join') {
      return this.handleJoinRoom(request);
    }

    return new Response('Not found', { status: 404 });
  }

  /**
   * 处理WebSocket连接
   */
  private async handleWebSocket(request: Request): Promise<Response> {
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    // 接受WebSocket连接
    this.state.acceptWebSocket(server);

    // 从URL获取用户信息
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId') || 'guest';
    const role = (url.searchParams.get('role') || 'spectator') as 'white' | 'black' | 'spectator';

    // 存储会话
    this.sessions.set(server, { userId, role });

    // 发送当前游戏状态
    if (this.gameState) {
      this.send(server, {
        type: 'state',
        data: this.gameState
      });
    }

    // 通知其他用户有新用户加入
    this.broadcast({
      type: 'join',
      data: { userId, role }
    }, server);

    return new Response(null, {
      status: 101,
      webSocket: client
    });
  }

  /**
   * WebSocket消息处理
   */
  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
    try {
      if (typeof message !== 'string') return;

      const msg: WebSocketMessage = JSON.parse(message);
      const session = this.sessions.get(ws);
      if (!session) return;

      switch (msg.type) {
        case 'move':
          await this.handleMove(ws, msg.data);
          break;

        case 'chat':
          this.handleChat(ws, msg.data);
          break;

        case 'state':
          this.send(ws, {
            type: 'state',
            data: this.gameState
          });
          break;
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  }

  /**
   * WebSocket关闭处理
   */
  async webSocketClose(ws: WebSocket) {
    const session = this.sessions.get(ws);
    if (session) {
      // 通知其他用户
      this.broadcast({
        type: 'leave',
        data: { userId: session.userId, role: session.role }
      }, ws);

      this.sessions.delete(ws);
    }

    ws.close();
  }

  /**
   * WebSocket错误处理
   */
  async webSocketError(ws: WebSocket, error: any) {
    console.error('WebSocket error:', error);
    ws.close();
    this.sessions.delete(ws);
  }

  /**
   * 处理移动
   */
  private async handleMove(ws: WebSocket, moveData: { from: string; to: string; promotion?: string }) {
    const session = this.sessions.get(ws);
    if (!session || !this.gameState) return;

    // 验证是否轮到该玩家
    const currentPlayer = this.gameState.currentTurn === 'w' ? 'white' : 'black';
    if (session.role !== currentPlayer) {
      this.send(ws, {
        type: 'error',
        data: { message: 'Not your turn' }
      });
      return;
    }

    // 广播移动给所有连接
    this.broadcast({
      type: 'move',
      data: {
        from: moveData.from,
        to: moveData.to,
        promotion: moveData.promotion,
        player: session.userId
      }
    });
  }

  /**
   * 处理聊天
   */
  private handleChat(ws: WebSocket, message: string) {
    const session = this.sessions.get(ws);
    if (!session) return;

    this.broadcast({
      type: 'chat',
      data: {
        userId: session.userId,
        message,
        timestamp: Date.now()
      }
    }, ws);
  }

  /**
   * 获取房间状态
   */
  private async handleGetState(): Promise<Response> {
    const players = Array.from(this.sessions.values());
    
    return new Response(JSON.stringify({
      gameState: this.gameState,
      players: players.map(p => ({ userId: p.userId, role: p.role })),
      spectatorCount: players.filter(p => p.role === 'spectator').length
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /**
   * 加入房间
   */
  private async handleJoinRoom(request: Request): Promise<Response> {
    const { userId, role } = await request.json();

    // 检查位置是否可用
    const existingPlayer = Array.from(this.sessions.values()).find(s => s.role === role);
    if (existingPlayer && role !== 'spectator') {
      return new Response(JSON.stringify({ error: 'Position taken' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /**
   * 发送消息给单个客户端
   */
  private send(ws: WebSocket, message: any) {
    try {
      ws.send(JSON.stringify(message));
    } catch (error) {
      console.error('Send error:', error);
    }
  }

  /**
   * 广播消息给所有客户端
   */
  private broadcast(message: any, exclude?: WebSocket) {
    const messageStr = JSON.stringify(message);
    
    for (const [ws] of this.sessions) {
      if (ws !== exclude) {
        try {
          ws.send(messageStr);
        } catch (error) {
          console.error('Broadcast error:', error);
        }
      }
    }
  }

  /**
   * 设置游戏状态
   */
  async setGameState(gameState: GameState) {
    this.gameState = gameState;
    await this.state.storage.put('gameState', gameState);

    // 广播新状态
    this.broadcast({
      type: 'state',
      data: gameState
    });
  }
}

