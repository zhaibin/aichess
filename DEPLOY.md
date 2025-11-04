# 部署说明

## 前置要求

1. Cloudflare账号
2. Node.js 18+
3. Wrangler CLI

## 部署步骤

### 1. 安装依赖

\`\`\`bash
npm install
\`\`\`

### 2. 登录Cloudflare

\`\`\`bash
npx wrangler login
\`\`\`

### 3. 创建队列

在Cloudflare Dashboard中创建两个队列：
- `ai-game-queue`
- `ai-game-queue-dlq` (死信队列)

或使用命令行：

\`\`\`bash
npx wrangler queues create ai-game-queue
npx wrangler queues create ai-game-queue-dlq
\`\`\`

### 4. 部署Workers

\`\`\`bash
npm run deploy
\`\`\`

### 5. 配置自定义域名

1. 登录Cloudflare Dashboard
2. 进入Workers & Pages
3. 选择 `aichess` worker
4. 点击 "Settings" -> "Triggers"
5. 添加自定义域名：`aichess.win`

## 本地开发

\`\`\`bash
npm run dev
\`\`\`

访问：http://localhost:8787

## 查看日志

\`\`\`bash
npm run tail
\`\`\`

## 注意事项

1. **Workers AI配额**：每个账号有免费额度限制，超出需付费
2. **Durable Objects**：需要在Cloudflare账号中启用
3. **队列**：确保队列已创建并正确配置
4. **chess.js兼容性**：chess.js库在Workers环境中运行，已测试兼容

## 环境变量

无需配置环境变量，所有配置都在 `wrangler.toml` 中。

## 故障排除

### 队列错误

如果遇到队列相关错误：
1. 检查队列是否已创建
2. 检查 `wrangler.toml` 中的队列配置
3. 确保队列名称匹配

### AI模型错误

如果AI模型调用失败：
1. 检查模型ID是否正确
2. 检查账号是否有Workers AI权限
3. 查看日志确认具体错误

### Durable Objects错误

如果遇到Durable Objects错误：
1. 确保账号已启用Durable Objects
2. 检查migration配置
3. 如需重置，删除并重新部署

## 监控

在Cloudflare Dashboard中可以查看：
- Workers请求量
- 错误率
- Durable Objects使用情况
- 队列消息数量
- AI模型调用次数

## 成本估算

基于免费套餐：
- Workers：每天100,000次请求（免费）
- Durable Objects：每月1,000,000次请求（免费）
- Workers AI：有限免费额度
- 队列：每天1,000,000条消息（免费）

超出免费额度后按实际使用付费。

## 更新部署

代码更新后重新部署：

\`\`\`bash
npm run deploy
\`\`\`

Durable Objects会自动迁移，游戏状态会保留。

