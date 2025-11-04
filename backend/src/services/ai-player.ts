// AI棋手实现
import { ChessEngine } from './chess-engine';
import { GameState } from '../types';
import { AI_MODELS } from '../config/constants';
import { getGamePhase } from './ai-prompts';

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

  // ✅ 确定当前玩家
  const currentPlayer = gameState.currentTurn === 'w' ? gameState.whitePlayer : gameState.blackPlayer;
  const colorName = currentPlayer.color === 'w' ? 'White' : 'Black';
  console.log('📋 当前玩家:', colorName);

  const maxRetries = 2; // 减少重试，失败快速降级
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`🤖 AI调用 (尝试 ${attempt + 1}/${maxRetries})`);
      
      // ✅ 获取所有合法移动
      const chess = new ChessEngine(gameState.fen);
      const legalMoves = chess.moves();
      console.log('📋 合法移动数:', legalMoves.length);
      
      // 转换为编号列表
      const moveList = legalMoves.slice(0, 25).map((m, i) => `${i+1}.${m.from}→${m.to}`).join(' ');
      
      // 游戏阶段判断
      const phase = getGamePhase(gameState.moves.length);
      
      // 阶段指导
      const phaseGuidance = {
        opening: 'Opening: Control center (e4,d4), develop pieces, castle early',
        middlegame: 'Middlegame: Find tactics (pins/forks), improve pieces, create threats',
        endgame: 'Endgame: Activate king, push pawns, precise calculation'
      };
      
      // 完整历史（PGN格式）
      let pgnHistory = '';
      if (gameState.moves.length > 0) {
        for (let i = 0; i < gameState.moves.length; i++) {
          const moveNum = Math.floor(i / 2) + 1;
          const color = i % 2 === 0 ? 'White' : 'Black';
          pgnHistory += `${moveNum}.${color[0]} ${gameState.moves[i].from}${gameState.moves[i].to} `;
        }
      }
      
      // 时间信息
      const yourTime = currentPlayer.timeRemaining || 600;
      const oppTime = (gameState.currentTurn === 'w' ? gameState.blackPlayer : gameState.whitePlayer).timeRemaining || 600;
      const yourMins = Math.floor(yourTime / 60);
      const yourSecs = yourTime % 60;
      const oppMins = Math.floor(oppTime / 60);
      const oppSecs = oppTime % 60;
      const timePressure = yourTime < 60 ? ' ⚠️TIME PRESSURE!' : yourTime < 180 ? ' ⏰' : '';
      
      // ✅ 战略提示（极简化）
      const hints = {
        opening: 'Control center, develop, castle',
        middlegame: 'Tactics: forks/pins/skewers',
        endgame: 'King+pawns, push to promote'
      };
      
      // ✅ 超级简洁 - 完全避免"分析"关键词
      const comprehensivePrompt = `${model.role}, ${colorName}, move ${gameState.moves.length + 1}, ${phase}
Moves: ${pgnHistory || 'start'}
Time: ${yourMins}:${yourSecs.toString().padStart(2,'0')}${timePressure}
${hints[phase as keyof typeof hints]}

Legal: ${moveList}${legalMoves.length > 25 ? '...' : ''}

JSON only:
{"from":"e2","to":"e4","reason":"brief"}`;



      console.log('📋 阶段:', phase, '角色:', model.role);
      console.log('📤 提示词长度:', comprehensivePrompt.length, '字符');
      console.log('📤 提示词内容:\n', comprehensivePrompt);
      
      const messages = [
        { role: 'user', content: comprehensivePrompt }
      ];

      console.log('📤 发送到Workers AI, 模型:', model.modelId);
      
      // ✅ 使用最简配置
      let response;
      
      try {
        console.log('📤 调用env.AI.run...');
        
        // ✅ 使用response_format（所有模型都支持）
        // 参考: https://developers.cloudflare.com/workers-ai/models/
        const aiParams: any = {
          messages: messages,
          response_format: { type: "json_object" },
          max_tokens: 60 // ✅ 极小token，只够一个JSON对象
        };
        
        // 根据官方文档范围添加参数
        if (model.temperature !== undefined) {
          aiParams.temperature = model.temperature; // 0-5
        }
        if (model.topP !== undefined) {
          // top_p范围: Deepseek是0.001-1, 其他是0-2
          aiParams.top_p = Math.max(0.001, Math.min(1, model.topP));
        }
        if (model.topK !== undefined) {
          aiParams.top_k = model.topK; // 1-50
        }
        if (model.repetitionPenalty !== undefined) {
          aiParams.repetition_penalty = model.repetitionPenalty; // 0-2
        }
        if (model.frequencyPenalty !== undefined) {
          // frequency/presence_penalty范围: Deepseek是-2到2
          aiParams.frequency_penalty = model.frequencyPenalty;
        }
        if (model.presencePenalty !== undefined) {
          aiParams.presence_penalty = model.presencePenalty;
        }
        
        console.log('📤 AI参数:', JSON.stringify(aiParams, null, 2));
        response = await env.AI.run(model.modelId, aiParams);
        console.log('📥 Workers AI响应成功');
        console.log('📥 完整响应:', JSON.stringify(response, null, 2));
      } catch (aiError: any) {
        console.error('❌ Workers AI调用异常:', aiError);
        console.error('错误消息:', aiError?.message);
        console.error('错误代码:', aiError?.code);
        console.error('错误详情:', JSON.stringify(aiError, null, 2));
        throw aiError; // 重新抛出，让外层重试
      }
      
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

      console.log('AI原始响应类型:', typeof aiResponse);
      console.log('AI响应内容:', aiResponse);

      let moveData = null;
      let reasonText = '';
      
      // ✅ 检查aiResponse是对象还是字符串
      if (typeof aiResponse === 'object' && aiResponse !== null) {
        // 已经是对象，直接使用
        moveData = aiResponse;
        reasonText = moveData.reason || '';
        console.log('✅ AI响应已是对象:', moveData);
      } else if (typeof aiResponse === 'string') {
        // 是字符串，尝试解析
        try {
          moveData = JSON.parse(aiResponse.trim());
          reasonText = moveData.reason || '';
          console.log('✅ JSON解析成功:', moveData);
        } catch (e) {
          console.log('❌ 不是纯JSON，尝试提取...');
          
          // 尝试从文本中提取JSON
          const jsonMatch = aiResponse.match(/\{[^}]*"from"[^}]*"to"[^}]*\}/);
          if (jsonMatch) {
            try {
              moveData = JSON.parse(jsonMatch[0]);
              reasonText = moveData.reason || '';
              console.log('✅ 提取JSON成功:', moveData);
            } catch (e2) {
              console.log('❌ 提取JSON失败');
            }
          }
          
          // 正则提取
          if (!moveData) {
            const fromMatch = aiResponse.match(/"from"[:\s]*"([a-h][1-8])"/i);
            const toMatch = aiResponse.match(/"to"[:\s]*"([a-h][1-8])"/i);
            const reasonMatch = aiResponse.match(/"reason"[:\s]*"([^"]+)"/i);
            
            if (fromMatch && toMatch) {
              moveData = {
                from: fromMatch[1].toLowerCase(),
                to: toMatch[1].toLowerCase()
              };
              reasonText = reasonMatch ? reasonMatch[1] : '';
              console.log('✅ 正则提取成功:', moveData);
            }
          }
        }
      } else {
        console.error('❌ AI响应格式未知:', typeof aiResponse);
      }

      if (!moveData || !moveData.from || !moveData.to) {
        console.error('无法解析AI响应，尝试下一次');
        console.error('AI返回内容:', aiResponse.substring(0, 200));
        continue;
      }

      console.log('✅ AI移动解析:', moveData);
      console.log('💭 AI推理:', reasonText);

      // 验证移动合法性
      const chessValidator = new ChessEngine(gameState.fen);
      const result = chessValidator.makeMove(moveData.from, moveData.to, moveData.promotion);

      if (result.success) {
        console.log('✅ AI移动合法');
        
        // ✅ 附加分析信息
        const phase = getGamePhase(gameState.moves.length);
        moveData.analysis = {
          phase: phase.toUpperCase(),
          reasoning: reasonText || '移动完成',
          evaluation: 'AI决策',
          confidence: 'High'
        };
        console.log('📊 附加AI分析:', moveData.analysis);
        
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
    
    // ✅ 附加随机移动标记
    const result = {
      from: randomMove.from,
      to: randomMove.to,
      analysis: {
        phase: 'RANDOM',
        reasoning: '使用随机合法移动（Workers AI降级）',
        evaluation: '-',
        confidence: 'N/A'
      }
    };
    console.log('📊 随机移动分析:', result.analysis);
    return result;
  } catch (error) {
    console.error('❌ 随机移动生成失败:', error);
    return null;
  }
}
