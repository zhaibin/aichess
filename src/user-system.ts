// 用户系统和认证

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  rating: number; // ELO评分
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  createdAt: number;
  lastLoginAt: number;
}

export interface Session {
  sessionId: string;
  userId: string;
  expiresAt: number;
}

import { DurableObject } from 'cloudflare:workers';
import { Env } from './types';

/**
 * 用户Durable Object
 */
export class UserStore extends DurableObject {
  private state: DurableObjectState;

  constructor(state: DurableObjectState, env: Env) {
    super(state, env);
    this.state = state;
  }

  /**
   * 创建新用户
   */
  async createUser(username: string, email: string, password: string): Promise<User | null> {
    // 检查用户名是否存在
    const existingUser = await this.state.storage.get<User>(`user:${username}`);
    if (existingUser) {
      return null;
    }

    const userId = crypto.randomUUID();
    const passwordHash = await this.hashPassword(password);

    const user: User = {
      id: userId,
      username,
      email,
      passwordHash,
      rating: 1200, // 初始ELO评分
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      createdAt: Date.now(),
      lastLoginAt: Date.now()
    };

    await this.state.storage.put(`user:${username}`, user);
    await this.state.storage.put(`userid:${userId}`, username);

    return user;
  }

  /**
   * 用户登录验证
   */
  async login(username: string, password: string): Promise<Session | null> {
    const user = await this.state.storage.get<User>(`user:${username}`);
    if (!user) {
      return null;
    }

    const isValid = await this.verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return null;
    }

    // 更新最后登录时间
    user.lastLoginAt = Date.now();
    await this.state.storage.put(`user:${username}`, user);

    // 创建会话
    const sessionId = crypto.randomUUID();
    const session: Session = {
      sessionId,
      userId: user.id,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7天
    };

    await this.state.storage.put(`session:${sessionId}`, session);

    return session;
  }

  /**
   * 验证会话
   */
  async validateSession(sessionId: string): Promise<User | null> {
    const session = await this.state.storage.get<Session>(`session:${sessionId}`);
    if (!session || session.expiresAt < Date.now()) {
      return null;
    }

    const username = await this.state.storage.get<string>(`userid:${session.userId}`);
    if (!username) {
      return null;
    }

    return await this.state.storage.get<User>(`user:${username}`);
  }

  /**
   * 获取用户信息
   */
  async getUser(username: string): Promise<User | null> {
    return await this.state.storage.get<User>(`user:${username}`);
  }

  /**
   * 更新用户评分
   */
  async updateRating(userId: string, newRating: number, result: 'win' | 'loss' | 'draw'): Promise<void> {
    const username = await this.state.storage.get<string>(`userid:${userId}`);
    if (!username) return;

    const user = await this.state.storage.get<User>(`user:${username}`);
    if (!user) return;

    user.rating = newRating;
    user.gamesPlayed++;
    
    if (result === 'win') user.wins++;
    else if (result === 'loss') user.losses++;
    else user.draws++;

    await this.state.storage.put(`user:${username}`, user);
  }

  /**
   * 密码哈希
   */
  private async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * 验证密码
   */
  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    const passwordHash = await this.hashPassword(password);
    return passwordHash === hash;
  }

  /**
   * 登出
   */
  async logout(sessionId: string): Promise<void> {
    await this.state.storage.delete(`session:${sessionId}`);
  }
}

/**
 * ELO评分计算
 */
export class EloRating {
  private static K_FACTOR = 32; // K因子，影响评分变化幅度

  /**
   * 计算期望得分
   */
  private static getExpectedScore(rating1: number, rating2: number): number {
    return 1 / (1 + Math.pow(10, (rating2 - rating1) / 400));
  }

  /**
   * 计算新评分
   * @param currentRating 当前评分
   * @param opponentRating 对手评分
   * @param score 实际得分：1=胜，0.5=平，0=负
   */
  static calculateNewRating(
    currentRating: number,
    opponentRating: number,
    score: number
  ): number {
    const expectedScore = this.getExpectedScore(currentRating, opponentRating);
    const newRating = currentRating + this.K_FACTOR * (score - expectedScore);
    return Math.round(newRating);
  }

  /**
   * 批量计算双方新评分
   */
  static calculateBothRatings(
    player1Rating: number,
    player2Rating: number,
    result: 'player1' | 'player2' | 'draw'
  ): { player1NewRating: number; player2NewRating: number } {
    let player1Score = 0.5;
    let player2Score = 0.5;

    if (result === 'player1') {
      player1Score = 1;
      player2Score = 0;
    } else if (result === 'player2') {
      player1Score = 0;
      player2Score = 1;
    }

    return {
      player1NewRating: this.calculateNewRating(player1Rating, player2Rating, player1Score),
      player2NewRating: this.calculateNewRating(player2Rating, player1Rating, player2Score)
    };
  }
}

