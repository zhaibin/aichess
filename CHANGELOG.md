# 更新日志

## [2.0.0] - 2025-11-04

### 新增功能

#### 1. 用户系统和认证
- ✅ 用户注册和登录
- ✅ 会话管理（7天有效期）
- ✅ 密码哈希存储（SHA-256）
- ✅ 用户信息存储（Durable Objects）

#### 2. ELO评分系统
- ✅ 完整的ELO评分计算
- ✅ K因子=32的标准算法
- ✅ 自动更新胜/负/平记录
- ✅ 初始评分1200分
- ✅ 对战后双方评分更新

#### 3. 游戏回放功能
- ✅ 完整的回放控制器
- ✅ 前进/后退/跳转功能
- ✅ PGN格式导出
- ✅ PGN格式导入
- ✅ 回放速度控制
- ✅ 棋谱分析

#### 4. WebSocket实时对战
- ✅ WebSocket连接支持
- ✅ 实时对战房间（Durable Objects）
- ✅ 玩家角色管理（白/黑/观战）
- ✅ 实时移动同步
- ✅ 聊天功能
- ✅ 观战模式
- ✅ 自动断线重连

#### 5. 游戏分析和提示
- ✅ 位置评估（材料平衡）
- ✅ 最佳移动建议
- ✅ 多个候选移动评分
- ✅ 整局游戏分析
- ✅ 准确率计算
- ✅ 失误检测
- ✅ 关键时刻标记
- ✅ 战术位置识别

#### 6. 开局库集成
- ✅ 15+常见开局定义
- ✅ ECO编码系统
- ✅ 开局自动识别
- ✅ 开局移动建议
- ✅ 按名称/ECO搜索
- ✅ 随机开局生成
- ✅ 开局描述和策略

### 技术改进
- ✅ 新增3个Durable Objects类
- ✅ WebSocket协议支持
- ✅ 模块化代码结构
- ✅ 完整的TypeScript类型

### 新增文件
- `src/user-system.ts` - 用户系统和ELO评分
- `src/game-replay.ts` - 游戏回放功能
- `src/game-analysis.ts` - 游戏分析引擎
- `src/opening-book.ts` - 开局库
- `src/websocket-room.ts` - WebSocket实时对战

### 破坏性变更
- Durable Objects迁移到v2版本
- 需要重新部署和迁移

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

