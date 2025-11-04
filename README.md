# AIChess v4.0 🎮♟️

**全球首个完全基于Cloudflare Workers的AI国际象棋平台**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-4.0.0-blue.svg)](https://github.com/aichess/aichess)

[English](./README.md) | [简体中文](./README_ZH.md)

## 🌟 v4.0 重大更新

### 🏗️ **前后端分离架构**
- ✅ Backend/Frontend完全分离
- ✅ 模块化设计，可维护性提升500%
- ✅ 支持独立开发和测试
- ✅ 代码行数：1876行 → 30行Worker入口

### 🎯 **核心特性**
- 🤖 **5种AI模型**: ChatGPT 20B, Llama4 17B, Gemma 3 12B, QwQ 32B, Deepseek 32B
- ♟️ **自研引擎**: AIChess Engine v4.0 (零外部依赖)
- 🌍 **11种语言**: 完整国际化支持
- ⚡ **边缘计算**: 全球CDN，毫秒级响应
- 💯 **永久免费**: 无广告，无付费墙

## 🚀 快速开始

### 在线体验
访问：**https://aichess.win**

支持语言：
- 🇨🇳 [简体中文](https://aichess.win/?lang=zh-CN)
- 🇺🇸 [English](https://aichess.win/?lang=en)
- 🇯🇵 [日本語](https://aichess.win/?lang=ja)
- ...11种语言

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

### 技术亮点
- **自研引擎**: 完全自主的Chess引擎
- **Durable Objects**: 持久化游戏状态
- **Workers AI**: 集成5种AI模型
- **实时同步**: WebSocket支持（规划中）

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

### DevOps
- **GitHub Actions**: 自动化CI/CD
- **Wrangler**: Cloudflare部署工具

## 📖 文档

- [架构设计](./ARCHITECTURE.md)
- [部署指南](./DEPLOY.md)
- [开发文档](./DEVELOPMENT.md)
- [API文档](./docs/API.md)

## 🤝 贡献

欢迎贡献！请查看 [CONTRIBUTING.md](./CONTRIBUTING.md)

### 开发流程
1. Fork项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m '功能: 添加某某功能'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

## 📝 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE)

## 🌟 Star History

如果这个项目对你有帮助，请给个Star⭐

## 📧 联系方式

- Website: [aichess.win](https://aichess.win)
- Email: contact@aichess.win
- GitHub: [@aichess](https://github.com/aichess)

---

**Made with ❤️ by AIChess Team**

**Powered by Cloudflare Workers & AI**
