# AIChess v4.0 游戏模式使用指南

## 🎮 四种游戏模式

### 1. 练习模式（默认）⚡

**触发方式**: 打开页面即可

**特点**:
- ✅ 无需点击"新游戏"
- ✅ 本地自由移动
- ✅ 即时响应
- ✅ 适合学习规则

**使用场景**:
- 学习国际象棋规则
- 练习开局
- 测试战术

**技术实现**:
- 纯前端逻辑
- 无API调用
- 无倒计时

---

### 2. 人人对战（本地离线）👥

**触发方式**: 新游戏 → 选择"人人对战"

**特点**:
- ✅ 同一设备轮流下棋
- ✅ 本地处理，无网络延迟
- ✅ 即时响应
- ✅ 可选倒计时（创建时配置）

**工作流程**:
```
1. 点击"新游戏" → "人人对战" → "开始游戏"
2. 白方移动棋子（本地验证）
3. 黑方移动棋子（本地验证）
4. 轮流进行
5. 无API调用，纯离线
```

**控制台日志**:
```javascript
游戏模式: human-vs-human
本地移动成功: {from: "e2", to: "e4", ...}
```

**技术实现**:
```javascript
if (gameState.mode === 'human-vs-human') {
  // 本地移动，不调用API
  const result = chess.move({ from, to });
  if (result) {
    renderBoard();
    gameState.currentTurn = chess.turn;
  }
  return; // 不执行API逻辑
}
```

**优势**:
- 🚀 超快响应（0延迟）
- 💰 不消耗API配额
- 📶 无需网络
- 🎯 简单直接

---

### 3. 人机对战（在线，直接调用AI）🤖

**触发方式**: 新游戏 → 选择"人机对战" → 选择AI

**特点**:
- ✅ 玩家（白方）vs AI（黑方）
- ✅ 直接调用AI API
- ✅ 无队列延迟
- ✅ 2秒AI思考时间
- ✅ 完整倒计时

**工作流程**:
```
1. 点击"新游戏" → "人机对战" → 选择AI → "开始游戏"
2. 白方（你）移动棋子
   → 调用 /api/make-move
3. 自动触发AI移动
   → 调用 /api/ai-move（等待2秒）
4. AI移动完成，显示结果
5. 回到步骤2
```

**控制台日志**:
```javascript
执行移动: {gameId: "...", from: "e2", to: "e4"}
移动成功
等待AI思考...
请求AI移动...
AI移动完成
```

**API调用链**:
```
人类移动: POST /api/make-move
    ↓
AI移动: POST /api/ai-move
    ↓
更新状态: GET /api/game-state
```

**技术实现**:
```javascript
// 人类移动后
if (gameState.mode === 'human-vs-ai' && nextPlayer.type === 'ai') {
  console.log('等待AI思考...');
  await getAIMove(); // 直接调用，不用队列
}

async function getAIMove() {
  const response = await fetch('/api/ai-move', {
    method: 'POST',
    body: JSON.stringify({ gameId })
  });
  // 2秒后返回AI移动
}
```

**优势**:
- 🎯 即时响应（无队列延迟）
- 🤖 真实AI对手
- ⏱️ 可控的思考时间
- 📊 完整游戏体验

---

### 4. AI对战（队列后台运行）🔥

**触发方式**: 新游戏 → 选择"AI对战" → 选择两个AI

**特点**:
- ✅ AI vs AI自动对战
- ✅ 后台队列处理
- ✅ 前端轮询查看进展
- ✅ 人类观战模式

**工作流程**:
```
1. 点击"新游戏" → "AI对战" → 选择两个AI → "开始游戏"
2. 创建游戏，发送到队列
   → 发送消息到 ai-game-queue
3. 后台Worker处理队列
   → 白方AI移动（2秒）
   → 发送下一步到队列
   → 黑方AI移动（2秒）
   → 循环直到游戏结束
4. 前端每秒轮询查看状态
   → GET /api/game-state
   → 更新棋盘显示
```

**控制台日志**:
```javascript
游戏已创建: {mode: "ai-vs-ai", ...}
AI vs AI模式，开始轮询
触发AI vs AI对战...
Poll: 检查游戏状态...
棋盘更新: {fen: "..."}
```

**队列处理流程**:
```
创建游戏
    ↓
发送到队列 {gameId, currentPlayer: 'w'}
    ↓
Queue Handler处理
    ↓
获取AI移动（2秒思考）
    ↓
执行移动
    ↓
发送下一步到队列 {gameId, currentPlayer: 'b'}
    ↓
循环...直到游戏结束
```

**前端轮询**:
```javascript
if (gameState.mode === 'ai-vs-ai') {
  updateInterval = setInterval(pollGameState, 1000);
}

async function pollGameState() {
  const response = await fetch('/api/game-state?gameId=' + gameState.id);
  const newState = await response.json();
  
  if (newState.fen !== gameState.fen) {
    // 棋盘变化，更新显示
    gameState = newState;
    chess = new Chess(gameState.fen);
    renderBoard();
  }
}
```

**优势**:
- 🔄 不阻塞Workers
- ⏰ 防止超时
- 👀 可以观战
- 🎬 实时更新

---

## 📊 模式对比

| 模式 | 网络 | API调用 | 延迟 | 倒计时 | 适用场景 |
|------|------|---------|------|--------|----------|
| **练习模式** | 无需 | 无 | 0ms | 无 | 学习、练习 |
| **人人对战** | 无需 | 无 | 0ms | 可选 | 本地双人 |
| **人机对战** | 需要 | 是 | ~2秒 | 是 | 挑战AI |
| **AI对战** | 需要 | 是(队列) | ~3秒/步 | 是 | 观战AI |

---

## 🔧 技术实现对比

### 练习模式
```javascript
// 本地自由移动
chess.move({ from, to });
renderBoard();
```

### 人人对战
```javascript
// 本地轮流移动
if (gameState.mode === 'human-vs-human') {
  chess.move({ from, to });
  renderBoard();
  gameState.currentTurn = chess.turn;
}
```

### 人机对战
```javascript
// 人类移动 → 直接调用AI
await fetch('/api/make-move', {...});  // 人类移动
await fetch('/api/ai-move', {...});    // AI响应（2秒）
```

### AI对战
```javascript
// 队列自动处理 + 前端轮询
// Backend: Queue处理每一步
// Frontend: 每秒轮询查看更新
setInterval(pollGameState, 1000);
```

---

## 🎯 使用建议

### 新手
→ 使用**练习模式**学习规则

### 本地双人
→ 使用**人人对战**（快速、离线）

### 挑战AI
→ 使用**人机对战**（有趣、有挑战）

### 观赏AI
→ 使用**AI对战**（学习、娱乐）

---

## 🐛 常见问题

### Q: 为什么白棋不能移动？
A: 
1. 检查控制台：`gameState.currentTurn` 应该是 `'w'`
2. 检查游戏模式：确认是 `'human-vs-ai'` 或 `'human-vs-human'`
3. 人机对战中，确保当前是人类回合（不是AI回合）

### Q: AI vs AI为什么看不到进展？
A: 
1. 确认队列已启用（Cloudflare Dashboard）
2. 检查控制台：应该看到轮询日志
3. 队列处理有延迟（每步~3秒）

### Q: 人人对战为什么这么快？
A: 
- 这是设计如此！本地处理，0延迟

---

## 📝 调试技巧

### 打开F12控制台查看：

**练习模式**:
- 应该看到：`Chess引擎已加载`
- 无其他日志

**人人对战**:
- 应该看到：`游戏模式: human-vs-human`
- 应该看到：`本地移动成功`
- 不应该看到：API调用

**人机对战**:
- 应该看到：`执行移动: {...}`
- 应该看到：`等待AI思考...`
- 应该看到：`AI移动完成`

**AI对战**:
- 应该看到：`AI vs AI模式，开始轮询`
- 应该看到：`触发AI vs AI对战...`
- 应该看到：定期的轮询日志

---

**更新时间**: 2025-11-04  
**版本**: v4.0.0

