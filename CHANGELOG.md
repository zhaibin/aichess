# 更新日志

## [1.0.0] - 2025-11-04

### 新增
- ✅ 完整的国际象棋游戏引擎（基于chess.js）
- ✅ 三种游戏模式：人人对战、人机对战、AI对AI对战
- ✅ 5个AI模型集成：
  - ChatGPT 20B
  - Meta Llama4 17B
  - Gemma 3 12B
  - QwQ 32B
  - Deepseek 32B
- ✅ 时间控制系统（5/10/15分钟快棋）
- ✅ 11种语言支持：
  - 简体中文、繁体中文
  - English、Français、Español
  - Deutsch、Italiano、Português
  - Русский、日本語、한국어
- ✅ 响应式设计（PC端和移动端）
- ✅ 基于Cloudflare Workers的无服务器架构
- ✅ Durable Objects游戏状态管理
- ✅ 消息队列处理AI对战
- ✅ 实时计时系统
- ✅ 完整的行棋历史记录
- ✅ 游戏状态持久化

### 技术特性
- TypeScript严格模式
- Cloudflare Workers + Durable Objects
- Workers AI集成
- 队列系统（防止AI对战超时）
- 完全遵守FIDE国际象棋规则
- UCI格式移动
- FEN格式棋盘状态
- SAN格式棋谱记录

### 部署
- 一键部署到Cloudflare Workers
- 自定义域名支持
- 全球CDN加速
- 无需服务器维护

### 文档
- README.md - 项目介绍
- QUICKSTART.md - 快速开始
- DEPLOY.md - 部署指南
- DEVELOPMENT.md - 开发文档
- CHANGELOG.md - 更新日志

