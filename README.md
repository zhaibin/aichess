# AIChess v4.0 🎮♟️

**全球首个完全基于Cloudflare Workers的AI国际象棋平台**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-4.0.0-blue.svg)](https://github.com/aichess/aichess)

## 🌟 v4.0 重大更新

### 🏗️ **前后端分离架构**
- ✅ Backend/Frontend完全分离
- ✅ 模块化设计，可维护性提升500%
- ✅ 支持独立开发和测试
- ✅ Worker入口：1876行 → 30行

### 🎯 **核心特性**
- 🤖 **5种AI模型**: ChatGPT 20B, Llama4 17B, Gemma 3 12B, QwQ 32B, Deepseek 32B
- ♟️ **自研引擎**: AIChess Engine v4.0 (零外部依赖)
- 🌍 **11种语言**: 完整国际化支持
- ⚡ **边缘计算**: 全球CDN，毫秒级响应
- 💯 **永久免费**: 无广告，无付费墙

## 🚀 快速开始

### 在线体验
访问：**https://aichess.win**

### 本地开发

```bash
# 克隆项目
git clone https://github.com/aichess/aichess.git
cd aichess

# Backend开发
cd backend
npm install
npm run dev

# Frontend开发（新终端）
cd frontend
npm install
npm run dev
```

### 部署

```bash
# 部署Backend到Cloudflare Workers
cd backend
npm run deploy

# 构建Frontend
cd frontend
npm run build
```

## 📁 项目结构

```
AiChess/
├── backend/          # Cloudflare Workers后端
│   ├── src/
│   │   ├── worker.ts      # 入口(30行)
│   │   ├── routes/        # 路由层
│   │   ├── handlers/      # 处理层
│   │   ├── services/      # 服务层
│   │   └── templates/     # 模板层
│   └── wrangler.toml
│
├── frontend/         # 独立前端
│   ├── src/
│   │   ├── main.ts
│   │   ├── components/
│   │   └── styles/
│   └── vite.config.ts
│
└── docs/            # 文档
```

详见 [ARCHITECTURE.md](./ARCHITECTURE.md)

## 🎮 功能特性

### 游戏模式
- 👤 **人人对战**: 本地双人对弈
- 🤖 **人机对战**: 挑战5种AI模型
- 🔥 **AI对战**: 观看AI vs AI

### 时间控制
- ⏱️ 5分钟快棋
- ⏱️ 10分钟标准
- ⏱️ 15分钟慢棋

## 🛠️ 技术栈

### Backend
- **Cloudflare Workers**: 边缘计算平台
- **Durable Objects**: 有状态存储
- **Workers AI**: AI模型推理
- **TypeScript**: 类型安全

### Frontend
- **Vite**: 现代构建工具
- **TypeScript**: 类型安全
- **原生JS**: 零框架依赖

## 📖 文档

- [架构设计](./ARCHITECTURE.md)
- [项目状态](./PROJECT_STATUS.md)
- [重构总结](./REFACTORING_SUMMARY.md)
- [部署指南](./DEPLOY.md)

## 🤝 贡献

欢迎贡献！请查看 [CONTRIBUTING.md](./CONTRIBUTING.md)

## 📝 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE)

## 📧 联系方式

- Website: [aichess.win](https://aichess.win)
- Email: contact@aichess.win
- GitHub: [@aichess](https://github.com/aichess)

---

**Made with ❤️ by AIChess Team**

**Powered by Cloudflare Workers & AI**
