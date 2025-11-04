// AI响应解析器 - 针对不同模型的解析策略

/**
 * 从标记之间提取内容
 */
function extractBetween(text: string, start: string, end: string): string | null {
  const startIdx = text.indexOf(start);
  const endIdx = text.indexOf(end);
  if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) return null;
  return text.substring(startIdx + start.length, endIdx).trim();
}

/**
 * 从JSON字符串中提取移动
 */
function extractMoveFromJson(jsonStr: string): { from: string; to: string; reason?: string } | null {
  try {
    const obj = JSON.parse(jsonStr);
    if (obj.from && obj.to && /^[a-h][1-8]$/.test(obj.from) && /^[a-h][1-8]$/.test(obj.to)) {
      return {
        from: obj.from,
        to: obj.to,
        reason: obj.reason || ''
      };
    }
  } catch (e) {
    // Not valid JSON
  }
  return null;
}

/**
 * 解析AI响应 - 根据模型风格
 */
export function parseAIResponseByStyle(
  text: string,
  promptStyle: string
): {
  success: boolean;
  move: { from: string; to: string } | null;
  reasoning: string | null;
  fullText: string;
} {
  console.log('🔍 解析AI响应, 风格:', promptStyle);
  console.log('📝 响应内容:', text.substring(0, 300));
  
  let moveData = null;
  let reasoning = null;
  
  // 策略1: Structured (Llama, DeepSeek) - 标记提取
  if (promptStyle === 'structured' || promptStyle === 'reasoning_structured') {
    const moveText = extractBetween(text, '<<<MOVE_START>>>', '<<<MOVE_END>>>');
    const reasonText = extractBetween(text, '<<<REASON_START>>>', '<<<REASON_END>>>') ||
                       extractBetween(text, '<<<REASONING_START>>>', '<<<REASONING_END>>>');
    
    if (moveText) {
      moveData = extractMoveFromJson(moveText);
      reasoning = reasonText;
      
      if (moveData) {
        console.log('✅ 标记解析成功:', moveData);
        return { success: true, move: moveData, reasoning, fullText: text };
      }
    }
  }
  
  // 策略2: Concise (Gemma) - 关键词提取
  if (promptStyle === 'concise') {
    const moveMatch = text.match(/MOVE:\s*(\{[^}]+\})/i);
    const reasonMatch = text.match(/REASON:\s*([^\n]+)/i);
    
    if (moveMatch) {
      moveData = extractMoveFromJson(moveMatch[1]);
      reasoning = reasonMatch ? reasonMatch[1].trim() : null;
      
      if (moveData) {
        console.log('✅ 关键词解析成功:', moveData);
        return { success: true, move: moveData, reasoning, fullText: text };
      }
    }
  }
  
  // 策略3: Reasoning (QwQ) - FINAL MOVE提取
  if (promptStyle === 'reasoning') {
    const moveMatch = text.match(/FINAL MOVE:\s*(\{[^}]+\})/i);
    const reasonMatch = text.match(/REASONING:\s*([^\n]+)/i);
    
    if (moveMatch) {
      moveData = extractMoveFromJson(moveMatch[1]);
      reasoning = reasonMatch ? reasonMatch[1].trim() : null;
      
      if (moveData) {
        console.log('✅ FINAL MOVE解析成功:', moveData);
        return { success: true, move: moveData, reasoning, fullText: text };
      }
    }
  }
  
  // 通用备用：尝试直接找JSON对象
  const jsonMatch = text.match(/\{[^}]*"from"[^}]*"to"[^}]*\}/);
  if (jsonMatch) {
    moveData = extractMoveFromJson(jsonMatch[0]);
    if (moveData) {
      console.log('✅ 通用JSON提取成功:', moveData);
      return { success: true, move: moveData, reasoning: null, fullText: text };
    }
  }
  
  // 最后尝试：正则直接提取坐标
  const fromMatch = text.match(/"from"[:\s]*"([a-h][1-8])"/i);
  const toMatch = text.match(/"to"[:\s]*"([a-h][1-8])"/i);
  const reasonMatch = text.match(/"reason"[:\s]*"([^"]+)"/i);
  
  if (fromMatch && toMatch) {
    moveData = {
      from: fromMatch[1].toLowerCase(),
      to: toMatch[1].toLowerCase(),
      reason: reasonMatch ? reasonMatch[1] : ''
    };
    console.log('✅ 正则提取成功:', moveData);
    return { success: true, move: moveData, reasoning: reasonMatch ? reasonMatch[1] : null, fullText: text };
  }
  
  console.error('❌ 所有解析策略都失败');
  console.error('📝 完整响应:', text);
  return { success: false, move: null, reasoning: null, fullText: text };
}

