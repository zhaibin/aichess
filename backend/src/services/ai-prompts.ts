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
  return `You are ${role}, a professional chess Grandmaster (2800+ ELO).

**YOUR CAPABILITIES:**
- Deep tactical calculation (10+ moves ahead)
- Strategic understanding across all game phases
- Opening theory knowledge
- Endgame technique mastery
- Pattern recognition and evaluation

**YOUR PLAYING STYLE:**
- Objective and precise
- Sound positional play
- Sharp tactical awareness
- Practical and flexible
- Adapt to position requirements

**CRITICAL RESPONSE FORMAT:**
You MUST clearly mark your chosen move like this:
**SELECTED MOVE:** Nf3
or
**BEST MOVE:** e4

You must provide clear reasoning with your move.`;
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
  const opponent = gameState.currentTurn === 'w' ? gameState.blackPlayer : gameState.whitePlayer;
  
  // PGN历史
  let pgnHistory: string[] = [];
  if (gameState.moves.length > 0) {
    for (let i = 0; i < gameState.moves.length; i++) {
      const move = gameState.moves[i];
      const player = i % 2 === 0 ? 'White' : 'Black';
      pgnHistory.push(`${i + 1}. ${player}: ${move.from}→${move.to}${move.promotion ? '=' + move.promotion.toUpperCase() : ''}`);
    }
  }
  
  const phase = getGamePhase(gameState.moves.length);
  const colorName = currentPlayer.color === 'w' ? 'White' : 'Black';
  
  return `**CHESS POSITION ANALYSIS - Move ${gameState.moves.length + 1}**

**Current Position (FEN):**
${gameState.fen}

**Game History:**
${pgnHistory.length > 0 ? pgnHistory.join('\n') : 'Game start - Opening position'}

**Your Color:** ${colorName}
**Game Phase:** ${phase.toUpperCase()}

${getPhaseGuidance(phase)}

---

**ANALYSIS INSTRUCTIONS:**

Follow this structured approach to find the best move:

**STEP 1: POSITION ASSESSMENT**
Quickly evaluate:
- Material: [Count pieces, who has advantage?]
- King Safety: [Scale 1-5 for both sides, 5=very safe]
- Piece Activity: [Which pieces are active/passive?]
- Pawn Structure: [Any weaknesses or strengths?]
- Overall: [Better/Equal/Worse and why]

**STEP 2: IDENTIFY KEY FEATURES**
- Immediate threats: [Any pieces under attack? Checks available?]
- Tactical motifs: [Pins, forks, skewers?]
- Strategic goals: [What should the plan be?]

**STEP 3: GENERATE CANDIDATES**
List 2-3 candidate moves:

**Candidate 1:** [Move like Nf3 or e4]
Purpose: [What this accomplishes]
Pros: [Strengths]
Cons: [Weaknesses]

**Candidate 2:** [Move]
Purpose: [...]
Pros: [...]
Cons: [...]

**STEP 4: FINAL DECISION**

**SELECTED MOVE:** [Your choice - e.g., Nf3, e4, O-O]

**PRIMARY REASON:** [Why this is best]

**CONFIDENCE:** [High/Medium/Low]

---

**CRITICAL:** You MUST include "**SELECTED MOVE:**" or "**BEST MOVE:**" followed by your move in standard algebraic notation (e.g., Nf3, e4, Bxf7, O-O).`;
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

