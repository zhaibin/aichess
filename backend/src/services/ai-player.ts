// AI棋手实现
import { ChessEngine } from './chess-engine';
import { GameState } from '../types';
import { AI_MODELS } from '../config/constants';

/**
 * 生成AI棋手的系统提示词（优化版：更清晰）
 */
export function getSystemPrompt(): string {
  return `You are a professional chess grandmaster AI.

RESPONSE FORMAT (STRICT):
Return ONLY a JSON object with your move in UCI format:
{"from": "e2", "to": "e4"}

For pawn promotion, add the piece:
{"from": "e7", "to": "e8", "promotion": "q"}

MOVE EXAMPLES:
- Opening: {"from": "e2", "to": "e4"}
- Capture: {"from": "d4", "to": "e5"}
- Castle kingside: {"from": "e1", "to": "g1"}
- Promotion: {"from": "a7", "to": "a8", "promotion": "q"}

PROMOTION OPTIONS:
- "q" = Queen (best)
- "r" = Rook
- "b" = Bishop  
- "n" = Knight

CRITICAL:
- Return ONLY JSON
- NO explanations
- Move MUST be legal
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
    console.error('环境变量:', Object.keys(env || {}));
    throw new Error('Workers AI binding not found. Please check wrangler.toml configuration.');
  }
  
  const model = AI_MODELS[aiModel];
  if (!model) {
    console.error('❌ 无效的AI模型:', aiModel);
    console.log('可用模型:', Object.keys(AI_MODELS));
    throw new Error(`Invalid AI model: ${aiModel}. Available models: ${Object.keys(AI_MODELS).join(', ')}`);
  }

  console.log('✅ AI绑定检查通过');
  console.log('📋 使用模型:', model.name, '(' + model.modelId + ')');

  const maxRetries = 3;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`🤖 AI调用 (尝试 ${attempt + 1}/${maxRetries})`);
      
      const messages = [
        { role: 'system', content: getSystemPrompt() },
        { role: 'user', content: getUserPrompt(gameState) }
      ];

      console.log('📤 发送到Workers AI, 模型:', model.modelId);
      console.log('📤 消息数量:', messages.length);
      
      // ✅ 尝试不同的API格式
      let response;
      let successFormat = null;
      
      // 格式1: Text Generation格式
      try {
        console.log('📤 尝试格式1: Text Generation {prompt}');
        const promptText = `${getSystemPrompt()}\n\n${getUserPrompt(gameState)}`;
        response = await env.AI.run(model.modelId, {
          prompt: promptText,
          max_tokens: 100
        });
        console.log('✅ 格式1成功');
        successFormat = 1;
      } catch (e1) {
        console.log('❌ 格式1失败:', String(e1).substring(0, 200));
        
        // 格式2: Chat格式
        try {
          console.log('📤 尝试格式2: Chat {messages}');
          response = await env.AI.run(model.modelId, {
            messages: messages
          });
          console.log('✅ 格式2成功');
          successFormat = 2;
        } catch (e2) {
          console.log('❌ 格式2失败:', String(e2).substring(0, 200));
          
          // 格式3: 直接调用（最简单）
          try {
            console.log('📤 尝试格式3: Direct prompt');
            const promptText = `${getSystemPrompt()}\n\n${getUserPrompt(gameState)}`;
            response = await env.AI.run(model.modelId, promptText);
            console.log('✅ 格式3成功');
            successFormat = 3;
          } catch (e3) {
            console.log('❌ 格式3失败:', String(e3).substring(0, 200));
            throw new Error('所有API格式都失败: ' + String(e3));
          }
        }
      }
      
      console.log('✅ 成功使用格式', successFormat);
      
      console.log('📥 Workers AI响应类型:', typeof response);
      console.log('📥 Workers AI响应keys:', Object.keys(response || {}));
      console.log('📥 完整响应:', JSON.stringify(response, null, 2).substring(0, 500));

      // 提取响应
      let aiResponse = '';
      if (response.response) {
        aiResponse = response.response;
      } else if (response.result?.response) {
        aiResponse = response.result.response;
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
      
      // 最后一次尝试才抛出错误
      if (attempt === maxRetries - 1) {
        throw new Error(`Workers AI调用失败 (${maxRetries}次尝试): ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  // 不应该到这里
  throw new Error('AI调用逻辑错误');
}

/**
 * 获取随机合法移动
 */
function getRandomLegalMove(gameState: GameState): { from: string; to: string } | null {
  try {
    console.log('🎲 生成随机合法移动, FEN:', gameState.fen);
    const chess = new ChessEngine(gameState.fen);
    const allMoves = chess.moves();
    console.log('📋 合法移动数量:', allMoves.length);

    if (allMoves.length === 0) {
      console.error('❌ 没有合法移动（可能是游戏结束）');
      return null;
    }

    const randomMove = allMoves[Math.floor(Math.random() * allMoves.length)];
    console.log('🎯 随机选择:', randomMove);
    return {
      from: randomMove.from,
      to: randomMove.to
    };
  } catch (error) {
    console.error('❌ 随机移动生成失败:', error);
    console.error('错误详情:', error instanceof Error ? error.message : String(error));
    return null;
  }
}
