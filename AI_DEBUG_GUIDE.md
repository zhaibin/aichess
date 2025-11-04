# 🤖 Workers AI调试指南

## 问题现状

**症状**: `/api/ai-move` 返回 500错误  
**版本**: v4.1  
**时间**: 2025-11-04

---

## 🔍 调试检查清单

### 1. Workers AI绑定检查

**检查wrangler.toml配置**:
```toml
[ai]
binding = "AI"
```

**新增日志**:
```typescript
if (!env || !env.AI) {
  console.error('❌ Workers AI未绑定！env.AI不存在');
  console.error('环境变量:', Object.keys(env || {}));
  throw new Error('Workers AI binding not found');
}
```

---

### 2. AI模型验证

**可用模型** (来自`AI_MODELS`):
```typescript
'gpt-oss-20b'         → @cf/openai/gpt-oss-20b
'llama-4-scout-17b'   → @cf/meta/llama-4-scout-17b-16e-instruct
'gemma-3-12b'         → @cf/google/gemma-3-12b-it
'qwq-32b'             → @cf/qwen/qwq-32b
'deepseek-32b'        → @cf/deepseek-ai/deepseek-r1-distill-qwen-32b
```

**检查日志**:
```
✅ AI绑定检查通过
📋 使用模型: ChatGPT 20B (@cf/openai/gpt-oss-20b)
```

---

### 3. AI调用流程

**完整流程**:
```
1. 用户移动 → makeMove成功
2. 检测到AI回合 → 调用getAIMove()
3. 发送到/api/ai-move
4. handleAIMove收到请求
5. 检查env.AI绑定 ✅
6. 调用env.AI.run(modelId, {...})
7. 解析响应
8. 验证移动合法性
9. 执行移动
10. 返回更新的游戏状态
```

**期待日志**:
```
🧠 调用AI生成移动, 模型: gpt-oss-20b
🎮 getAIMove被调用, 模型: gpt-oss-20b
✅ AI绑定检查通过
📋 使用模型: ChatGPT 20B (@cf/openai/gpt-oss-20b)
🤖 AI调用 (尝试 1/3)
📤 发送到Workers AI, 模型: @cf/openai/gpt-oss-20b
📥 Workers AI响应类型: object
📥 Workers AI响应: {"response":"..."}
AI原始响应: {"from":"e7","to":"e5"}
✅ AI移动解析: {from: "e7", to: "e5"}
✅ AI移动合法
✅ AI生成移动成功
```

---

### 4. 可能的错误原因

#### 错误A: Workers AI未启用
```
❌ Workers AI未绑定！env.AI不存在
环境变量: [GAME_STATE, WEBSOCKET_ROOM, USER_STORE, AI_GAME_QUEUE]
```

**解决**: 检查Cloudflare Dashboard → Workers AI是否启用

#### 错误B: 模型ID不正确
```
❌ AI调用失败: Model not found: @cf/openai/gpt-oss-20b
```

**解决**: 更新模型ID，使用Cloudflare支持的模型

#### 错误C: Workers AI限额
```
❌ AI调用失败: Rate limit exceeded
```

**解决**: 等待限额重置，或升级账户

#### 错误D: AI响应格式错误
```
无法解析AI响应
AI原始响应: "I suggest moving the pawn..."
```

**解决**: AI提示词已优化，应该返回JSON

---

## 🛠️ 解决方案

### 方案A: 检查wrangler.toml

```bash
cd backend
cat wrangler.toml | grep -A 5 "ai"
```

应该看到:
```toml
[ai]
binding = "AI"
```

### 方案B: 测试AI绑定

创建测试端点:
```typescript
// test-ai.ts
export async function testAI(env: Env) {
  if (!env.AI) {
    return { error: 'AI not bound' };
  }
  
  try {
    const response = await env.AI.run('@cf/meta/llama-2-7b-chat-int8', {
      messages: [{ role: 'user', content: 'Hello' }]
    });
    return { success: true, response };
  } catch (error) {
    return { error: error.message };
  }
}
```

### 方案C: 降级方案（已实现）

如果Workers AI持续失败，使用随机合法移动:
```typescript
// 当前实现
if (attempt === maxRetries - 1) {
  throw new Error('Workers AI调用失败');
}
// 前端可以捕获并显示错误
```

---

## 📊 测试步骤

### 步骤1: 测试人机对战

1. 刷新浏览器
2. 选择Human vs AI
3. 移动一步
4. 观察控制台

**期待看到**:
```
🧠 调用AI生成移动, 模型: gpt-oss-20b
✅ AI绑定检查通过
📤 发送到Workers AI
📥 Workers AI响应: {...}
```

**如果失败看到**:
```
❌ Workers AI未绑定！
或
❌ AI调用失败 (尝试 1/3): Model not found
```

### 步骤2: 查看后端日志

```bash
cd /Users/zhaibin/Dev/AiChess/backend
npx wrangler tail --format pretty
```

同时在浏览器操作，实时看日志

---

## 🎯 下一步

### 如果env.AI不存在
1. 检查wrangler.toml
2. 重新部署
3. 检查Cloudflare Dashboard

### 如果模型调用失败
1. 尝试不同模型
2. 检查模型ID
3. 查看Cloudflare文档

### 如果响应格式错误
1. 优化提示词
2. 改进解析逻辑
3. 添加更多fallback

---

## 📝 当前实现

**已添加**:
- ✅ env.AI存在性检查
- ✅ 详细错误日志
- ✅ 明确错误抛出（不降级）
- ✅ 3次重试机制
- ✅ 完整调用链日志

**待验证**:
- ⚠️ Workers AI是否正确绑定
- ⚠️ 模型ID是否有效
- ⚠️ 响应格式是否正确

---

**请测试并告诉我后端日志的完整输出！** 🔍

