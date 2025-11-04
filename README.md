# AIChess - AI国际象棋

基于Cloudflare Workers的在线国际象棋对战平台，支持人人对战、人机对战和AI对AI对战。

## 功能特性

- **多种对战模式**
  - 人人对战
  - 人机对战
  - AI vs AI对战

- **AI棋手**（5种模型）
  - ChatGPT 20B
  - Meta Llama4 17B
  - Gemma 3 12B
  - QwQ 32B
  - Deepseek 32B

- **时间控制**
  - 5分钟快棋
  - 10分钟快棋（默认）
  - 15分钟快棋

- **多语言支持**（11种语言）
  - 简体中文、繁体中文
  - English、Français、Español
  - Deutsch、Italiano、Português
  - Русский、日本語、한국어

- **响应式设计**
  - PC端：左侧棋盘，右侧信息面板
  - 移动端：上下布局

## 技术栈

- **后端**: Cloudflare Workers
- **存储**: Durable Objects
- **队列**: Cloudflare Queues
- **AI**: Cloudflare Workers AI
- **前端**: 原生HTML/CSS/JavaScript
- **棋规**: chess.js

## 快速开始

### 1. 安装依赖

\`\`\`bash
npm install
\`\`\`

### 2. 本地开发

\`\`\`bash
npm run dev
\`\`\`

### 3. 部署到Cloudflare

\`\`\`bash
npm run deploy
\`\`\`

## 项目结构

\`\`\`
AiChess/
├── src/
│   ├── index.ts          # Workers主入口
│   ├── game-state.ts     # Durable Objects游戏状态
│   ├── chess-utils.ts    # 国际象棋工具类
│   ├── ai-player.ts      # AI棋手实现
│   ├── i18n.ts           # 多语言支持
│   └── types.ts          # 类型定义
├── wrangler.toml         # Cloudflare配置
├── package.json
└── README.md
\`\`\`

## API说明

### 创建游戏

\`\`\`http
POST /api/create-game
Content-Type: application/json

{
  "mode": "human-vs-ai",
  "timeControl": 600,
  "whitePlayerType": "human",
  "blackPlayerType": "ai",
  "blackAIModel": "deepseek-32b"
}
\`\`\`

### 执行移动

\`\`\`http
POST /api/make-move
Content-Type: application/json

{
  "gameId": "xxx",
  "from": "e2",
  "to": "e4"
}
\`\`\`

### 获取游戏状态

\`\`\`http
GET /api/game-state?gameId=xxx
\`\`\`

## 对局规则

1. 完全遵守国际象棋FIDE规则
2. 采用快棋时间控制（5/10/15分钟）
3. 行棋必须符合国际象棋规则
4. AI落子不合规则需重新思考，计入用时
5. 求和需双方同意
6. AI对AI对战间隔2秒行棋

## 域名

aichess.win

## 许可

MIT License

