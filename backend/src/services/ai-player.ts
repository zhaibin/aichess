// AI棋手实现
import { ChessEngine } from './chess-engine';
import { GameState } from '../types';
import { AI_MODELS } from '../config/constants';
import { getGrandmasterSystemPrompt, getStructuredUserPrompt, parseAIResponse, getGamePhase } from './ai-prompts';

/**
 * 生成AI棋手的系统提示词（角色预设版）
 */
export function getSystemPrompt(playerName?: string, difficulty?: string): string {
  // 角色预设
  const rolePlay = playerName?.includes('Llama') ? 'You are Magnus Carlsen, the world chess champion.' :
                   playerName?.includes('Gemma') ? 'You are Garry Kasparov, legendary chess master.' :
                   playerName?.includes('QwQ') ? 'You are Bobby Fischer, tactical genius.' :
                   playerName?.includes('Deepseek') ? 'You are Mikhail Tal, the "Magician from Riga".' :
                   'You are a professional chess grandmaster.';
  
  return `${rolePlay}

ROLE: You are playing a serious, competitive chess game. Your reputation is on the line.

YOUR ULTIMATE GOAL: CHECKMATE the opponent's king (make it unable to escape from check).

OPENING PRINCIPLES (First 10 moves):
1. Control CENTER (e4, d4, e5, d5) with pawns
2. Develop KNIGHTS before bishops (Nf3, Nc3 for White; Nf6, Nc6 for Black)
3. Develop BISHOPS to active squares (Bc4, Bb5 for White; Bc5, Bb4 for Black)
4. CASTLE early (O-O or O-O-O) to protect your king
5. Don't move the same piece twice unless necessary
6. Don't bring out the QUEEN too early

MIDDLEGAME TACTICS:
1. Look for FORKS (knight attacks two pieces)
2. Look for PINS (piece can't move without exposing king/queen)
3. Look for SKEWERS (force piece to move, exposing another)
4. Look for DISCOVERED ATTACKS
5. CAPTURE enemy pieces when safe (calculate exchanges)
6. Create PASSED PAWNS (pawns with no enemy pawns blocking)

ENDGAME STRATEGY:
1. Activate your KING (move it to the center)
2. Push PASSED PAWNS to promotion (8th rank)
3. If you have material advantage, TRADE pieces
4. If behind in material, avoid trades

SPECIAL MOVES YOU MUST KNOW:
- Castling kingside: {"from": "e1", "to": "g1"} or {"from": "e8", "to": "g8"}
- Castling queenside: {"from": "e1", "to": "c1"} or {"from": "e8", "to": "c1"}
- Pawn promotion: {"from": "a7", "to": "a8", "promotion": "q"}

TIME MANAGEMENT:
- You have LIMITED time
- If time < 3 min: play FASTER, choose simpler moves
- Don't waste time on obvious moves

RESPONSE FORMAT (ABSOLUTELY CRITICAL):
Return ONLY a valid JSON object with your move:
{"from": "e2", "to": "e4"}

DO NOT include any text, explanation, or commentary. ONLY JSON.

Examples of CORRECT responses:
{"from": "e2", "to": "e4"}
{"from": "g1", "to": "f3"}
{"from": "e1", "to": "g1"}
{"from": "e7", "to": "e8", "promotion": "q"}

RULES:
- Move MUST be legal in the current position
- Use lowercase letters (a-h for files, 1-8 for ranks)
- Think like a grandmaster, play to WIN`;
}

/**
 * 生成用户提示词（优化：PGN格式）
 */
export function getUserPrompt(gameState: GameState): string {
  const currentPlayer = gameState.currentTurn === 'w' ? gameState.whitePlayer : gameState.blackPlayer;
  const opponent = gameState.currentTurn === 'w' ? gameState.blackPlayer : gameState.whitePlayer;
  
  // 构建标准PGN格式的移动历史（详细版，包含每步）
  let pgnHistory = '';
  let moveDetails = '';
  
  if (gameState.moves.length > 0) {
    // PGN格式
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
    
    // 详细每步（用于AI理解）
    moveDetails = '\n\nDETAILED MOVES:\n';
    for (let i = 0; i < gameState.moves.length; i++) {
      const move = gameState.moves[i];
      const player = i % 2 === 0 ? 'White' : 'Black';
      moveDetails += `${i + 1}. ${player}: ${move.from}→${move.to}`;
      if (move.promotion) moveDetails += ` (promoted to ${move.promotion})`;
      moveDetails += '\n';
    }
  } else {
    pgnHistory = '(starting position - no moves yet)';
    moveDetails = '';
  }

  const colorName = currentPlayer.color === 'w' ? 'White' : 'Black';
  const yourMins = Math.floor(currentPlayer.timeRemaining / 60);
  const yourSecs = currentPlayer.timeRemaining % 60;
  const oppMins = Math.floor(opponent.timeRemaining / 60);
  const oppSecs = opponent.timeRemaining % 60;
  
  // 时间压力提示
  let timePressure = '';
  if (currentPlayer.timeRemaining < 180) {
    timePressure = '\n⚠️ TIME PRESSURE! You have less than 3 minutes - play faster!';
  } else if (currentPlayer.timeRemaining < 300) {
    timePressure = '\n⏰ Time is running low - be efficient!';
  }

  return `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CHESS GAME - MOVE ${gameState.moves.length + 1}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CURRENT POSITION (FEN):
${gameState.fen}

YOU ARE: ${colorName} (${currentPlayer.color === 'w' ? 'White plays from bottom (ranks 1-2)' : 'Black plays from top (ranks 7-8)'})

COMPLETE GAME HISTORY (PGN):
${pgnHistory.trim()}${moveDetails}

BOARD ANALYSIS:
- Total moves so far: ${gameState.moves.length}
- ${gameState.moves.length < 10 ? 'OPENING PHASE' : gameState.moves.length < 30 ? 'MIDDLEGAME' : 'ENDGAME'}
- Last move: ${gameState.moves.length > 0 ? gameState.moves[gameState.moves.length - 1].san : 'none'}

TIME CONTROL:
━━━━━━━━━━━━━━━━━━━━━━━━
YOUR TIME:      ${yourMins}:${yourSecs.toString().padStart(2, '0')} ⏱️${timePressure}
OPPONENT TIME:  ${oppMins}:${oppSecs.toString().padStart(2, '0')}
━━━━━━━━━━━━━━━━━━━━━━━━

YOUR TASK:
1. Analyze the position carefully
2. Consider ALL tactical and strategic factors
3. Find the BEST move (not random!)
4. Aim for CHECKMATE or material advantage
5. Manage your time wisely

RESPOND WITH YOUR MOVE (JSON format ONLY):`;
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
      
      // ✅ 使用新的结构化提示词
      const phase = getGamePhase(gameState.moves.length);
      const systemPrompt = getGrandmasterSystemPrompt(model.role || 'a chess Grandmaster');
      const userPrompt = getStructuredUserPrompt(gameState, model.role || 'Grandmaster');
      
      console.log('📋 游戏阶段:', phase);
      console.log('📋 AI角色:', model.role);
      console.log('📤 提示词长度:', systemPrompt.length + userPrompt.length, '字符');
      
      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ];

      console.log('📤 发送到Workers AI, 模型:', model.modelId);
      console.log('📤 配置: temp=' + model.temperature + ', maxTokens=' + model.maxTokens);
      
      // ✅ 使用模型配置的参数
      let response;
      response = await env.AI.run(model.modelId, {
        messages: messages,
        temperature: model.temperature,
        max_tokens: model.maxTokens
      });
      
      console.log('📥 Workers AI响应类型:', typeof response);
      console.log('📥 Workers AI响应keys:', Object.keys(response || {}));

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

      console.log('AI原始响应长度:', aiResponse.length);
      console.log('AI响应片段:', aiResponse.substring(0, 500));

      // ✅ 使用新的结构化解析
      const parsed = parseAIResponse(response);
      console.log('📊 解析结果:', {
        move: parsed.move,
        reasoning: parsed.reasoning?.substring(0, 100),
        confidence: parsed.confidence
      });

      let moveData = null;
      
      // ✅ 优先使用结构化解析（SAN格式）
      if (parsed.move) {
        console.log('📝 AI返回SAN格式:', parsed.move);
        
        // 转换SAN到坐标（e4 → e2e4, Nf3 → g1f3）
        const chess = new ChessEngine(gameState.fen);
        const allMoves = chess.moves();
        
        // 尝试匹配SAN
        const san = parsed.move.replace(/[+#]/g, ''); // 移除将军符号
        
        // 简单SAN匹配（兵移动：e4, d5等）
        if (/^[a-h][1-8]$/.test(san)) {
          // 这是兵移动，找到对应的from
          const toFile = san[0];
          const toRank = san[1];
          const to = toFile + toRank;
          
          for (const move of allMoves) {
            if (move.to === to) {
              const piece = chess.get(move.from);
              if (piece && piece.type === 'p') {
                moveData = { from: move.from, to: move.to };
                break;
              }
            }
          }
        } else {
          // 棋子移动（Nf3, Bc4等），更复杂，暂时用JSON兜底
        }
      }
      
      // 兜底：尝试JSON格式
      if (!moveData) {
        try {
          moveData = JSON.parse(aiResponse.trim());
        } catch (e) {
          const jsonMatch = aiResponse.match(/\{[^}]*"from"[^}]*"to"[^}]*\}/);
          if (jsonMatch) {
            try {
              moveData = JSON.parse(jsonMatch[0]);
            } catch (e2) {
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
      }

      if (!moveData || !moveData.from || !moveData.to) {
        console.error('无法解析AI响应，尝试下一次');
        continue;
      }

      console.log('✅ AI移动解析:', moveData);
      console.log('💭 AI推理:', parsed.reasoning);
      console.log('📊 AI评估:', parsed.evaluation);
      console.log('🎯 AI信心:', parsed.confidence);

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
