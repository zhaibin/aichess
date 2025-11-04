// AI棋手实现
import { ChessEngine } from './chess-engine';
import { GameState } from '../types';
import { AI_MODELS } from '../config/constants';

/**
 * 生成AI棋手的系统提示词
 */
export function getSystemPrompt(): string {
  return `You are a professional chess player participating in an international chess tournament.

RULES:
1. You must follow FIDE (International Chess Federation) rules strictly
2. Time control: Each player has limited time (5, 10, or 15 minutes total)
3. Invalid moves will cost you time and you must reconsider
4. You can offer a draw, but both players must agree

INPUT FORMAT:
- Current board position (FEN notation)
- Move history in Standard Algebraic Notation (SAN)
- Your color (white/black)
- Your remaining time
- Opponent's remaining time
- Last move made

OUTPUT FORMAT:
You must respond with ONLY a JSON object in this exact format:
{
  "move": "e2e4" // UCI format: from-square + to-square + promotion(if any)
}

OR to offer a draw:
{
  "draw": true
}

MOVE FORMAT EXAMPLES:
- Normal move: "e2e4" (pawn from e2 to e4)
- Capture: "e5d6" (piece from e5 captures on d6)
- Castling: "e1g1" (king-side castling for white)
- Promotion: "e7e8q" (pawn promotes to queen)

IMPORTANT:
- Only output valid JSON, no explanation
- Moves must be in UCI format (e.g., "e2e4", not "e4")
- Invalid moves waste your time
- Think strategically about time management
- Consider opening theory, tactics, and endgames`;
}

/**
 * 生成AI棋手的用户提示词
 */
export function getUserPrompt(gameState: GameState, aiColor: 'w' | 'b'): string {
  const opponentColor = aiColor === 'w' ? 'b' : 'w';
  const aiPlayer = aiColor === 'w' ? gameState.whitePlayer : gameState.blackPlayer;
  const opponentPlayer = aiColor === 'w' ? gameState.blackPlayer : gameState.whitePlayer;

  const moveHistory = gameState.moves.map(m => m.san).join(' ');
  const lastMove = gameState.moves.length > 0 ? gameState.moves[gameState.moves.length - 1].san : 'none';

  return `GAME STATE:
FEN: ${gameState.fen}
Your Color: ${aiColor === 'w' ? 'white' : 'black'}
Move History: ${moveHistory || 'Game just started'}
Last Move: ${lastMove}
Your Time Remaining: ${formatTime(aiPlayer.timeRemaining)}
Opponent Time Remaining: ${formatTime(opponentPlayer.timeRemaining)}
Move Number: ${gameState.moves.length + 1}

Make your move now. Respond with JSON only.`;
}

/**
 * 调用AI模型获取移动
 */
export async function getAIMove(
  ai: any,
  gameState: GameState,
  aiColor: 'w' | 'b',
  modelId: string
): Promise<{ from: string; to: string; promotion?: string } | { draw: boolean } | null> {
  const maxRetries = 3;
  let retryCount = 0;
  const retryDelay = 1000; // 1秒重试延迟

  while (retryCount < maxRetries) {
    try {
      // 指数退避重试
      if (retryCount > 0) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, retryCount - 1)));
      }
      const messages = [
        { role: 'system', content: getSystemPrompt() },
        { role: 'user', content: getUserPrompt(gameState, aiColor) }
      ];

      // 添加超时控制
      const timeout = 30000; // 30秒超时
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await ai.run(modelId, {
          messages,
          temperature: 0.7,
          max_tokens: 150
        });
        
        clearTimeout(timeoutId);

      // 提取响应文本
      let responseText = '';
      if (response.response) {
        responseText = response.response;
      } else if (response.result && response.result.response) {
        responseText = response.result.response;
      } else if (typeof response === 'string') {
        responseText = response;
      }

      console.log(`AI Response (${modelId}):`, responseText);

      // 尝试解析JSON
      const jsonMatch = responseText.match(/\{[^}]+\}/);
      if (!jsonMatch) {
        console.error('No JSON found in response');
        retryCount++;
        continue;
      }

      const result = JSON.parse(jsonMatch[0]);

      // 检查是否提和
      if (result.draw === true) {
        return { draw: true };
      }

      // 验证移动格式
      if (result.move && typeof result.move === 'string' && result.move.length >= 4) {
        const move = result.move.toLowerCase();
        const from = move.substring(0, 2);
        const to = move.substring(2, 4);
        const promotion = move.length > 4 ? move.substring(4, 5) : undefined;

        // 验证移动是否合法
        const chess = new ChessEngine(gameState.fen);
        const moveResult = chess.makeMove(from, to, promotion);

        if (moveResult.success) {
          return { from, to, promotion };
        } else {
          console.error(`Invalid move: ${move}`);
          retryCount++;
        }
      } else {
        console.error('Invalid move format in response');
        retryCount++;
      }
      } catch (timeoutError) {
        clearTimeout(timeoutId);
        console.error('AI request timeout:', timeoutError);
        retryCount++;
      }
    } catch (error) {
      console.error(`AI move error (attempt ${retryCount + 1}/${maxRetries}):`, error);
      retryCount++;
      
      // 对于某些错误类型，不重试
      if (error instanceof Error && error.message.includes('rate limit')) {
        console.log('Rate limit hit, using fallback');
        break;
      }
    }
  }

  // 所有重试失败，返回随机合法移动
  console.log('AI failed to provide valid move, selecting random legal move');
  return getRandomLegalMove(gameState.fen);
}

/**
 * 获取随机合法移动（备用方案）
 */
function getRandomLegalMove(fen: string): { from: string; to: string; promotion?: string } | null {
  try {
    const chess = new ChessEngine(fen);
    const legalMoves = chess.getLegalMoves();

    if (legalMoves.length === 0) {
      return null;
    }

    const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
    return {
      from: randomMove.substring(0, 2),
      to: randomMove.substring(2, 4),
      promotion: randomMove.length > 4 ? randomMove.substring(4) : undefined
    };
  } catch (error) {
    console.error('Error getting random legal move:', error);
    return null;
  }
}

/**
 * 格式化时间显示
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

