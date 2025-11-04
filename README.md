# AIChess - AI国际象棋

基于Cloudflare Workers的在线国际象棋对战平台，支持人人对战、人机对战和AI对AI对战。

## 功能特性

### 核心功能

- **多种对战模式**
  - 人人对战
  - 人机对战
  - AI vs AI对战
  - **实时在线对战（WebSocket）** ⚡ NEW

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
  - **完整SEO多语言优化** 🆕
    - 每种语言独立的meta标签
    - hreflang标签支持
    - 智能语言检测（URL参数/浏览器偏好）
    - 多语言sitemap

- **响应式设计**
  - PC端：左侧棋盘，右侧信息面板
  - 移动端：上下布局

### 高级功能 🆕

- **用户系统**
  - 用户注册和登录
  - 会话管理
  - 个人资料

- **ELO评分系统**
  - 标准ELO算法（K=32）
  - 自动评分更新
  - 胜/负/平统计
  - 初始评分1200

- **游戏回放**
  - 完整回放控制
  - PGN导入/导出
  - 棋谱分析
  - 回放速度调节

- **实时对战**
  - WebSocket连接
  - 实时移动同步
  - 聊天功能
  - 观战模式

- **游戏分析**
  - 位置评估
  - 最佳移动建议
  - 失误检测
  - 准确率计算
  - 关键时刻标记

- **开局库**
  - 15+经典开局
  - ECO编码
  - 自动识别
  - 移动建议

## 技术栈

- **后端**: Cloudflare Workers
- **存储**: Durable Objects
- **队列**: Cloudflare Queues
- **AI**: Cloudflare Workers AI (5个模型)
- **前端**: 原生HTML/CSS/JavaScript
- **棋规**: chess.js
- **安全**: CSP、XSS保护、输入验证
- **性能**: HTTP缓存、Gzip压缩、CDN优化
- **SEO**: 结构化数据、sitemap、meta标签
- **PWA**: manifest.json、离线支持

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

**aichess.win**

### 多语言访问
- 默认：https://aichess.win （自动检测浏览器语言）
- 简体中文：https://aichess.win/?lang=zh-CN
- 繁体中文：https://aichess.win/?lang=zh-TW
- English：https://aichess.win/?lang=en
- Français：https://aichess.win/?lang=fr
- Español：https://aichess.win/?lang=es
- Deutsch：https://aichess.win/?lang=de
- Italiano：https://aichess.win/?lang=it
- Português：https://aichess.win/?lang=pt
- Русский：https://aichess.win/?lang=ru
- 日本語：https://aichess.win/?lang=ja
- 한국어：https://aichess.win/?lang=ko

## 自动化工作流程

### 日常开发
```bash
# 修改代码后自动提交并部署
npm run auto-deploy "提交: 描述信息"

# 本地测试
npm run dev

# 查看日志
npm run tail
```

### 提交规范
- `功能: 描述` - 新功能
- `修复: 描述` - Bug修复
- `优化: 描述` - 性能优化
- `样式: 描述` - UI调整
- `文档: 描述` - 文档更新

### 重大变更推送GitHub
需手动确认后执行：
```bash
git push origin main
```

详见 `.cursorrules` 文件

## 许可

MIT License

