// AI棋手实现
import { ChessEngine } from './chess-engine';
import { GameState } from '../types';
import { AI_MODELS } from '../config/constants';

/**
 * 生成AI棋手的系统提示词（优化版：强调战略思考）
 */
export function getSystemPrompt(): string {
  return `You are a professional chess grandmaster AI. Analyze the position carefully and play strategically.

STRATEGIC GUIDELINES:
- Control the center (d4, d5, e4, e5)
- Develop pieces early (knights before bishops)
- Capture opponent's pieces when favorable
- Protect your king
- Look for tactical opportunities (forks, pins, skewers)
- Consider material balance (Queen=9, Rook=5, Bishop/Knight=3, Pawn=1)

RESPONSE FORMAT (STRICT):
Return ONLY a JSON object:
{"from": "e2", "to": "e4"}

For pawn promotion:
{"from": "e7", "to": "e8", "promotion": "q"}

EXAMPLES:
- Normal: {"from": "e2", "to": "e4"}
- Capture: {"from": "d4", "to": "e5"}
- Castle: {"from": "e1", "to": "g1"}
- Promotion: {"from": "a7", "to": "a8", "promotion": "q"}

CRITICAL:
- Return ONLY JSON, NO text
- Move MUST be legal
- Think strategically, not randomly
- Use lowercase (a-h, 1-8)`;
}

/**
 * 生成用户提示词（优化：PGN格式）
 */
export function getUserPrompt(gameState: GameState): string {
  const currentPlayer = gameState.currentTurn === 'w' ? gameState.whitePlayer : gameState.blackPlayer;
  const opponent = gameState.currentTurn === 'w' ? gameState.blackPlayer : gameState.whitePlayer;
  
  // 构建标准PGN格式的移动历史
  let pgnHistory = '';
  if (gameState.moves.length > 0) {
    for (let i = 0; i < gameState.moves.length; i += 2) {
      const moveNum = Math.floor(i / 2) + 1;
      const whiteMove = gameState.moves[i];
      const blackMove = gameState.moves[i + 1];
      
      pgnHistory += moveNum + '.';
      pgnHistory += whiteMove.san;
      if (blackMove) {
        pgnHistory += ' ' + blackMove.san;
      }
      pgnHistory += ' ';
    }
  } else {
    pgnHistory = '(starting position)';
  }

  const colorName = currentPlayer.color === 'w' ? 'White' : 'Black';
  const mins = Math.floor(currentPlayer.timeRemaining / 60);
  const secs = currentPlayer.timeRemaining % 60;

  return `POSITION (FEN):
${gameState.fen}

YOU PLAY: ${colorName}
MOVE HISTORY (PGN):
${pgnHistory.trim()}

YOUR TIME: ${mins}:${secs.toString().padStart(2, '0')}
OPPONENT TIME: ${Math.floor(opponent.timeRemaining / 60)}:${(opponent.timeRemaining % 60).toString().padStart(2, '0')}

Make your move (JSON format only):`;
}

/**
 * 获取AI移动
 */
export async function getAIMove(
  gameState: GameState,
  aiModel: string,
  env: any
): Promise<{ from: string; to: string; promotion?: string } | null> {
  console.log('🎮 getAIMove被调用, 模型:', aiModel);
  
  // 检查env.AI是否存在
  if (!env || !env.AI) {
    console.error('❌ Workers AI未绑定！env.AI不存在');
    console.log('⚠️ 降级为随机移动');
    return getRandomLegalMove(gameState);
  }
  
  const model = AI_MODELS[aiModel];
  if (!model) {
    console.error('❌ 无效的AI模型:', aiModel);
    console.log('可用模型:', Object.keys(AI_MODELS));
    console.log('⚠️ 降级为随机移动');
    return getRandomLegalMove(gameState);
  }

  console.log('✅ AI绑定检查通过');
  console.log('📋 使用模型:', model.name, '(' + model.modelId + ')');
  console.log('📋 API格式:', model.type);
  console.log('📋 PGN历史:', gameState.moves.length, '步');

  const maxRetries = 2; // 减少重试，失败快速降级
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`🤖 AI调用 (尝试 ${attempt + 1}/${maxRetries})`);
      
      const messages = [
        { role: 'system', content: getSystemPrompt() },
        { role: 'user', content: getUserPrompt(gameState) }
      ];

      console.log('📤 发送到Workers AI, 模型:', model.modelId);
      console.log('📤 API类型:', model.type);
      
      // ✅ 根据模型类型使用正确的API格式
      let response;
      
      if (model.type === 'instructions') {
        // GPT-OSS使用instructions+input格式
        console.log('📤 使用instructions格式');
        const systemPrompt = getSystemPrompt();
        const userPrompt = getUserPrompt(gameState);
        
        response = await env.AI.run(model.modelId, {
          instructions: systemPrompt,
          input: userPrompt
        });
      } else {
        // 其他模型使用messages格式
        console.log('📤 使用messages格式');
        response = await env.AI.run(model.modelId, {
          messages: messages
        });
      }
      
      console.log('📥 Workers AI响应类型:', typeof response);
      console.log('📥 Workers AI响应keys:', Object.keys(response || {}));
      console.log('📥 完整响应:', JSON.stringify(response, null, 2).substring(0, 500));

      // 提取响应（多种可能的格式）
      let aiResponse = '';
      if (response.response) {
        aiResponse = response.response;
      } else if (response.result?.response) {
        aiResponse = response.result.response;
      } else if (response.output) {
        aiResponse = response.output;
      } else if (response.text) {
        aiResponse = response.text;
      } else if (typeof response === 'string') {
        aiResponse = response;
      }

      console.log('AI原始响应:', aiResponse);

      // 多种方式解析JSON
      let moveData = null;
      
      // 方式1: 直接解析
      try {
        moveData = JSON.parse(aiResponse.trim());
      } catch (e) {
        // 方式2: 提取JSON对象
        const jsonMatch = aiResponse.match(/\{[^}]*"from"[^}]*"to"[^}]*\}/);
        if (jsonMatch) {
          try {
            moveData = JSON.parse(jsonMatch[0]);
          } catch (e2) {
            // 方式3: 正则提取
            const fromMatch = aiResponse.match(/"from"[:\s]*"([a-h][1-8])"/i);
            const toMatch = aiResponse.match(/"to"[:\s]*"([a-h][1-8])"/i);
            const promMatch = aiResponse.match(/"promotion"[:\s]*"([qrbn])"/i);
            
            if (fromMatch && toMatch) {
              moveData = {
                from: fromMatch[1].toLowerCase(),
                to: toMatch[1].toLowerCase()
              };
              if (promMatch) {
                moveData.promotion = promMatch[1].toLowerCase();
              }
            }
          }
        }
      }

      if (!moveData || !moveData.from || !moveData.to) {
        console.error('无法解析AI响应');
        continue;
      }

      console.log('✅ AI移动解析:', moveData);

      // 验证移动合法性
      const chess = new ChessEngine(gameState.fen);
      const result = chess.makeMove(moveData.from, moveData.to, moveData.promotion);

      if (result.success) {
        console.log('✅ AI移动合法');
        return moveData;
      } else {
        console.warn('❌ AI移动不合法:', moveData);
      }

    } catch (error) {
      console.error(`❌ AI调用失败 (尝试 ${attempt + 1}/${maxRetries}):`, error);
      console.error('错误类型:', error?.constructor?.name);
      console.error('错误详情:', error instanceof Error ? error.message : String(error));
      console.error('错误堆栈:', error instanceof Error ? error.stack : '无堆栈');
      
      // 继续重试
      console.log('⏳ 等待1秒后重试...');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // 所有尝试失败，降级
  console.log('⚠️ Workers AI所有尝试失败，降级为随机移动');
  console.log('💡 提示：AI会选择随机但合法的移动');
  return getRandomLegalMove(gameState);
}

/**
 * 获取随机合法移动（仅作为降级方案）
 */
function getRandomLegalMove(gameState: GameState): { from: string; to: string } | null {
  try {
    console.log('⚠️ 降级：生成随机移动');
    const chess = new ChessEngine(gameState.fen);
    const allMoves = chess.moves();
    console.log('📋 合法移动数量:', allMoves.length);

    if (allMoves.length === 0) {
      console.error('❌ 没有合法移动（可能是游戏结束）');
      return null;
    }

    const randomMove = allMoves[Math.floor(Math.random() * allMoves.length)];
    console.log('🎯 随机选择:', randomMove.from, '→', randomMove.to);
    return {
      from: randomMove.from,
      to: randomMove.to
    };
  } catch (error) {
    console.error('❌ 随机移动生成失败:', error);
    return null;
  }
}
