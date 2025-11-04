// AI提示词系统 - 结构化分析
import { GameState } from '../types';

/**
 * 判断游戏阶段
 */
export function getGamePhase(moveCount: number): 'opening' | 'middlegame' | 'endgame' {
  if (moveCount <= 12) return 'opening';
  if (moveCount >= 40) return 'endgame';
  return 'middlegame';
}

/**
 * 生成全局系统提示词（大师级）
 */
export function getGrandmasterSystemPrompt(role: string): string {
  return `You are ${role}, a chess Grandmaster.

Play strong, tactical chess. Always respond with:
**SELECTED MOVE:** [move in algebraic notation like e4, Nf3, O-O]
**PRIMARY REASON:** [brief reason]
**CONFIDENCE:** High/Medium/Low

Be concise and decisive.`;
}

/**
 * 阶段特定指导
 */
function getPhaseGuidance(phase: string): string {
  const guidance = {
    opening: `**OPENING PHASE PRIORITIES (Moves 1-12):**
1. Control the center (e4, d4, e5, d5) with pawns
2. Develop pieces efficiently (knights before bishops)
3. Ensure king safety (prepare to castle by move 8-10)
4. Avoid moving the same piece twice
5. Don't bring queen out too early
6. Connect rooks after castling
7. Follow opening principles unless theory suggests otherwise`,

    middlegame: `**MIDDLEGAME PRIORITIES (Moves 13-40):**
1. Create and execute concrete plans
2. Identify tactical opportunities (pins, forks, skewers)
3. Improve worst-placed pieces
4. Control key squares and files
5. Create threats while defending
6. Calculate forcing sequences deeply
7. Convert advantages into winning positions`,

    endgame: `**ENDGAME PRIORITIES (Moves 40+):**
1. Activate the king (most important piece in endgame)
2. Create and push passed pawns
3. Coordinate pieces precisely
4. Apply endgame principles (opposition, zugzwang)
5. Calculate accurately to conclusion
6. Use precise technique to convert/hold
7. Know theoretical endgame positions`
  };

  return guidance[phase as keyof typeof guidance] || guidance.opening;
}

/**
 * 生成结构化用户提示词
 */
export function getStructuredUserPrompt(gameState: GameState, role: string): string {
  const currentPlayer = gameState.currentTurn === 'w' ? gameState.whitePlayer : gameState.blackPlayer;
  
  // 简化历史（最多最近5步）
  let recentMoves = '';
  if (gameState.moves.length > 0) {
    const start = Math.max(0, gameState.moves.length - 5);
    for (let i = start; i < gameState.moves.length; i++) {
      const move = gameState.moves[i];
      recentMoves += `${i + 1}. ${move.from}→${move.to} `;
    }
  }
  
  const phase = getGamePhase(gameState.moves.length);
  const colorName = currentPlayer.color === 'w' ? 'White' : 'Black';
  
  // ✅ 大幅简化提示词，减少token消耗
  return `Position (FEN): ${gameState.fen}

Your Color: ${colorName}
Phase: ${phase.toUpperCase()}
Recent Moves: ${recentMoves || 'Game start'}

${phase === 'opening' ? 'Opening: Control center (e4/d4), develop pieces, castle early.' : ''}
${phase === 'middlegame' ? 'Middlegame: Find tactics, improve pieces, create threats.' : ''}
${phase === 'endgame' ? 'Endgame: Activate king, push pawns, precise calculation.' : ''}

Your task:
1. Analyze position quickly
2. Find best move
3. Return in format: **SELECTED MOVE:** e4

You MUST respond with:
**SELECTED MOVE:** [your move]
**PRIMARY REASON:** [one sentence why]
**CONFIDENCE:** High/Medium/Low`;
}

/**
 * 解析AI响应 - 提取移动和分析
 */
export function parseAIResponse(response: any): {
  move: string | null;
  from: string | null;
  to: string | null;
  evaluation: string | null;
  reasoning: string | null;
  confidence: string | null;
  fullAnalysis: string;
} {
  const text = response.response || response.output || response.text || JSON.stringify(response);
  
  // 多种移动格式匹配
  const movePatterns = [
    /\*\*SELECTED MOVE:\*\*\s*([a-h][1-8](?:[a-h][1-8])?[qrbn]?|[NBRQK][a-h]?[1-8]?x?[a-h][1-8](?:=[QRBN])?[+#]?|O-O-O|O-O)/i,
    /SELECTED MOVE:\s*([a-h][1-8](?:[a-h][1-8])?[qrbn]?|[NBRQK][a-h]?[1-8]?x?[a-h][1-8](?:=[QRBN])?[+#]?|O-O-O|O-O)/i,
    /\*\*BEST MOVE:\*\*\s*([a-h][1-8](?:[a-h][1-8])?[qrbn]?|[NBRQK][a-h]?[1-8]?x?[a-h][1-8](?:=[QRBN])?[+#]?|O-O-O|O-O)/i,
    /BEST MOVE:\s*([a-h][1-8](?:[a-h][1-8])?[qrbn]?|[NBRQK][a-h]?[1-8]?x?[a-h][1-8](?:=[QRBN])?[+#]?|O-O-O|O-O)/i,
    /Candidate\s+1:\s*([a-h][1-8](?:[a-h][1-8])?[qrbn]?|[NBRQK][a-h]?[1-8]?x?[a-h][1-8](?:=[QRBN])?[+#]?|O-O-O|O-O)/i
  ];
  
  let moveNotation = null;
  for (const pattern of movePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      moveNotation = match[1].trim();
      break;
    }
  }
  
  // 提取推理
  const reasonMatch = text.match(/\*\*PRIMARY REASON:\*\*\s*([^\n]+)/i) ||
                      text.match(/PRIMARY REASON:\s*([^\n]+)/i);
  const reasoning = reasonMatch ? reasonMatch[1].trim() : null;
  
  // 提取评估
  const evalMatch = text.match(/Overall:\s*([^\n]+)/i);
  const evaluation = evalMatch ? evalMatch[1].trim() : null;
  
  // 提取信心度
  const confMatch = text.match(/\*\*CONFIDENCE:\*\*\s*(High|Medium|Low)/i) ||
                    text.match(/CONFIDENCE:\s*(High|Medium|Low)/i);
  const confidence = confMatch ? confMatch[1] : null;
  
  return {
    move: moveNotation,
    from: null, // 需要转换SAN到坐标
    to: null,
    evaluation,
    reasoning,
    confidence,
    fullAnalysis: text
  };
}

/**
 * 转换SAN到坐标格式（简化版）
 */
export function sanToCoordinates(san: string, chess: any): { from: string; to: string; promotion?: string } | null {
  try {
    // 尝试所有合法移动，找到匹配的SAN
    const allMoves = chess.moves({ verbose: true });
    
    for (const move of allMoves) {
      if (move.san === san || move.san === san.replace(/[+#]/, '')) {
        return {
          from: move.from,
          to: move.to,
          promotion: move.promotion
        };
      }
    }
    
    // 如果没找到，尝试解析简单格式（e4, Nf3等）
    // 这需要更复杂的解析逻辑
    
    return null;
  } catch (error) {
    console.error('SAN转换失败:', error);
    return null;
  }
}

