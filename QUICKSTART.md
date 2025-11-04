# 快速开始指南

## 5分钟快速部署

### 1. 克隆项目（如果还没有）

\`\`\`bash
cd /Users/zhaibin/Dev/AiChess
\`\`\`

### 2. 安装依赖

\`\`\`bash
npm install
\`\`\`

### 3. 登录Cloudflare

\`\`\`bash
npx wrangler login
\`\`\`

### 4. 创建队列

\`\`\`bash
npx wrangler queues create ai-game-queue
npx wrangler queues create ai-game-queue-dlq
\`\`\`

### 5. 部署

\`\`\`bash
npm run deploy
\`\`\`

### 6. 访问

部署成功后，访问提供的URL，例如：
\`\`\`
https://aichess.你的worker名称.workers.dev
\`\`\`

## 本地测试

\`\`\`bash
npm run dev
\`\`\`

访问：http://localhost:8787

## 快速测试游戏

### 测试人人对战
1. 选择"人人对战"
2. 选择10分钟
3. 点击"开始游戏"
4. 轮流点击棋子进行移动

### 测试人机对战
1. 选择"人机对战"
2. 选择AI模型（推荐Deepseek 32B）
3. 选择10分钟
4. 点击"开始游戏"
5. 作为白方先行

### 测试AI对战
1. 选择"AI对战"
2. 为白方和黑方选择不同的AI模型
3. 选择5分钟（快速观看）
4. 点击"开始游戏"
5. 观看AI对弈

## 常见问题

### Q: 队列创建失败？
A: 确保你的Cloudflare账号已启用Queues功能。可能需要在Dashboard手动创建。

### Q: Durable Objects错误？
A: 确保账号已启用Durable Objects。免费账号可能需要绑定支付方式。

### Q: AI不下棋？
A: 检查Workers AI是否可用。查看日志：\`npx wrangler tail\`

### Q: 如何自定义域名？
A: 在Cloudflare Dashboard的Workers设置中添加自定义域名。

### Q: 如何查看日志？
A: 运行 \`npm run tail\` 实时查看日志。

## 下一步

- 查看 [README.md](README.md) 了解功能特性
- 查看 [DEPLOY.md](DEPLOY.md) 了解详细部署
- 查看 [DEVELOPMENT.md](DEVELOPMENT.md) 了解开发细节

## 支持

遇到问题？
1. 检查日志：\`npx wrangler tail\`
2. 查看Cloudflare Dashboard的Workers Analytics
3. 检查Queues和Durable Objects状态

## 完成！

现在你有一个运行中的AI国际象棋平台，支持：
- ✅ 人人对战
- ✅ 人机对战
- ✅ AI对AI对战
- ✅ 11种语言
- ✅ 响应式设计
- ✅ 5个AI模型

