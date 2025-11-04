// Durable Object实现 - 游戏状态管理
import { DurableObject } from 'cloudflare:workers';
import { ChessEngine } from './chess-engine';
import { GameState, Move, Player, Env, CreateGameRequest } from '../types';

export class GameState extends DurableObject {
  private state: DurableObjectState;
  private game: any = null;
  private timers: Map<string, number> = new Map();

  constructor(state: DurableObjectState, env: Env) {
    super(state, env);
    this.state = state;
    console.log('🔧 GameState DO构造函数');
  }

  /**
   * 处理HTTP请求
   */
  async fetch(request: Request): Promise<Response> {
    // 每次请求前尝试恢复状态
    if (!this.game) {
      this.game = await this.state.storage.get('game');
      console.log('🔄 DO恢复状态:', this.game ? this.game.id : 'null');
    }
    
    const url = new URL(request.url);
    const path = url.pathname;
    console.log('📨 DO收到请求:', path, '游戏存在:', !!this.game);

    try {
      // 加载游戏状态
      if (!this.game) {
        const stored = await this.state.storage.get<GameState>('game');
        if (stored) {
          this.game = stored;
        }
      }

      switch (path) {
        case '/create':
          return this.handleCreate(request);
        case '/move':
          return this.handleMove(request);
        case '/state':
          return this.handleGetState();
        case '/draw':
          return this.handleDraw(request);
        case '/resign':
          return this.handleResign(request);
        default:
          return new Response('Not found', { status: 404 });
      }
    } catch (error: any) {
      console.error('Game state error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  /**
   * 创建新游戏
   */
  private async handleCreate(request: Request): Promise<Response> {
    const data: CreateGameRequest = await request.json();
    console.log('🎮 DO handleCreate被调用, mode:', data.mode);

    // ✅ 使用Worker传递的gameId，不再生成新的
    const gameId = (data as any).gameId;
    console.log('📥 使用Worker传递的gameId:', gameId);
    const now = Date.now();

    const whitePlayer: Player = {
      type: data.whitePlayerType,
      aiModel: data.whiteAIModel,
      name: data.whiteName || (data.whitePlayerType === 'ai' ? `AI (${data.whiteAIModel})` : 'White Player'),
      color: 'w',
      timeRemaining: data.timeControl
    };

    const blackPlayer: Player = {
      type: data.blackPlayerType,
      aiModel: data.blackAIModel,
      name: data.blackName || (data.blackPlayerType === 'ai' ? `AI (${data.blackAIModel})` : 'Black Player'),
      color: 'b',
      timeRemaining: data.timeControl
    };

    this.game = {
      id: gameId,
      mode: data.mode,
      status: 'active',
      timeControl: data.timeControl,
      whitePlayer,
      blackPlayer,
      currentTurn: 'w',
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', // 初始位置
      moves: [],
      createdAt: now,
      lastMoveAt: now
    };

    console.log('💾 保存到storage, key="game"');
    await this.state.storage.put('game', this.game);
    
    // 验证保存
    const saved = await this.state.storage.get('game');
    console.log('✅ Storage验证:', saved ? 'OK (id: ' + saved.id + ')' : '❌ FAILED');
    
    // 列出所有keys
    const allKeys = await this.state.storage.list();
    console.log('📋 Storage所有keys:', Array.from(allKeys.keys()));

    console.log('✅ 游戏创建完成，返回响应');
    return new Response(JSON.stringify(this.game), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /**
   * 执行移动
   */
  private async handleMove(request: Request): Promise<Response> {
    console.log('🎯 Durable Object handleMove 被调用');
    console.log('this.game 存在?', !!this.game);
    if (this.game) {
      console.log('this.game.status:', this.game.status);
      console.log('this.game.id:', this.game.id);
    }
    
    if (!this.game) {
      console.error('❌ this.game 是 null/undefined');
      // 尝试从storage恢复
      const stored = await this.state.storage.get('game');
      console.log('从storage恢复:', stored);
      if (stored) {
        this.game = stored as any;
        console.log('✅ 从storage恢复成功');
      }
    }
    
    if (!this.game) {
      console.error('❌ Game not found even after storage check');
      return new Response(JSON.stringify({ error: 'Game not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (this.game.status !== 'active') {
      console.error('❌ Game status is not active:', this.game.status);
      return new Response(JSON.stringify({ error: 'Game not active', status: this.game.status }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    console.log('✅ 游戏状态检查通过');

    const { from, to, promotion } = await request.json();
    console.log('移动请求:', { from, to, promotion });

    // 验证移动
    const chess = new ChessEngine(this.game.fen);
    const moveResult = chess.makeMove(from, to, promotion);

    if (!moveResult.success) {
      return new Response(JSON.stringify({ error: 'Invalid move' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const now = Date.now();
    const timeSinceLastMove = Math.floor((now - this.game.lastMoveAt) / 1000);

    // 更新时间
    const currentPlayer = this.game.currentTurn === 'w' ? this.game.whitePlayer : this.game.blackPlayer;
    currentPlayer.timeRemaining = Math.max(0, currentPlayer.timeRemaining - timeSinceLastMove);

    // 记录移动
    const move: Move = {
      from,
      to,
      promotion,
      san: moveResult.san!,
      timestamp: now,
      timeRemaining: currentPlayer.timeRemaining
    };

    this.game.moves.push(move);
    this.game.fen = moveResult.fen!;
    this.game.currentTurn = this.game.currentTurn === 'w' ? 'b' : 'w';
    this.game.lastMoveAt = now;

    // 检查游戏是否结束
    if (currentPlayer.timeRemaining <= 0) {
      this.game.status = 'timeout';
      this.game.winner = this.game.currentTurn; // 对手获胜
    } else if (chess.isCheckmate()) {
      this.game.status = 'completed';
      this.game.winner = currentPlayer.color; // 执行将死的一方获胜
    } else if (chess.isDraw()) {
      this.game.status = 'draw';
      this.game.winner = 'draw';
    }

    await this.state.storage.put('game', this.game);

    return new Response(JSON.stringify(this.game), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /**
   * 获取游戏状态
   */
  private async handleGetState(): Promise<Response> {
    console.log('📊 DO handleGetState 被调用');
    console.log('📊 this.game 存在?', !!this.game);
    
    if (!this.game) {
      console.log('⚠️ this.game为null，尝试从storage恢复');
      this.game = await this.state.storage.get('game');
      console.log('📦 storage返回:', this.game ? 'has data (id: ' + this.game.id + ')' : 'null');
    }
    
    if (!this.game) {
      console.error('❌ storage中也没有数据');
      // 列出所有storage的keys
      const keys = await this.state.storage.list();
      console.log('📋 Storage所有keys:', Array.from(keys.keys()));
      
      return new Response(JSON.stringify({ error: 'Game not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ 返回游戏状态:', this.game.id);
    return new Response(JSON.stringify(this.game), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /**
   * 处理和棋请求
   */
  private async handleDraw(request: Request): Promise<Response> {
    if (!this.game || this.game.status !== 'active') {
      return new Response(JSON.stringify({ error: 'Game not active' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { accept } = await request.json();

    if (accept) {
      this.game.status = 'draw';
      this.game.winner = 'draw';
      await this.state.storage.put('game', this.game);
    }

    return new Response(JSON.stringify(this.game), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /**
   * 处理认输
   */
  private async handleResign(request: Request): Promise<Response> {
    if (!this.game || this.game.status !== 'active') {
      return new Response(JSON.stringify({ error: 'Game not active' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { color } = await request.json();

    this.game.status = 'completed';
    this.game.winner = color === 'w' ? 'b' : 'w';

    await this.state.storage.put('game', this.game);

    return new Response(JSON.stringify(this.game), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

