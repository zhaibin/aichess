# 更新日志

## [2.1.4] - 2025-11-04

### 架构重构

#### 多语言架构统一
- ✅ **统一使用i18n.ts管理所有多语言**
  - 所有界面文本集中在i18n.ts
  - 删除内嵌的翻译对象（减少110行代码）
  - 从i18n模块导入getAllTranslations()
  - 更清晰的代码结构

#### 默认语言调整
- ✅ **默认语言改为英语**
  - 全球通用语言优先
  - URL参数未指定时默认en
  - Accept-Language检测回退为en
  - 更国际化的默认体验

#### 法律信息英语化
- ✅ **Footer仅使用英语**
  - 不再多语言翻译
  - 保持专业性和法律准确性
- ✅ **隐私政策（英语）**
  - 数据收集说明
  - Cookie使用说明
  - 数据存储和安全
  - 用户权利
  - 第三方服务
  - 数据保留期限
  - 联系方式
- ✅ **服务条款（英语）**
  - 免费服务声明
  - 游戏规则要求
  - 公平游戏政策
  - 服务免责声明
  - 修改权保留
  - 账户管理
  - 数据所有权
  - 违规处理

#### 代码优化
- ✅ 删除187行冗余代码
- ✅ 代码体积优化：114KB → 119KB
- ✅ 更清晰的关注点分离
- ✅ 更易维护的架构

## [2.1.3] - 2025-11-04

### UI/UX优化与Bug修复

#### 棋盘优化
- ✅ **棋盘尺寸放大**
  - 从600px增加到800px
  - 棋子字体从2.5em增加到3.5em
  - 更好的视觉体验
  - 移动端保持响应式
- ✅ **棋盘样式增强**
  - 边框加粗到3px
  - 添加阴影效果
  - 更专业的外观

#### Footer优化
- ✅ **多语言Footer**（11种语言）
  - 网站标题和描述
  - 核心特性展示
  - 法律信息链接
  - 版权声明
- ✅ **法律信息**
  - 隐私政策（多语言）
  - 服务条款（多语言）
  - GitHub开源链接
  - 联系邮箱
  - MIT许可证
  - 版权所有 © 2025

#### 语言切换优化
- ✅ **即时切换**
  - 不再刷新页面
  - 立即更新所有文本
  - 包含Footer内容
  - URL参数同步更新（SEO友好）
- ✅ **完整覆盖**
  - 欢迎消息
  - 按钮文本
  - 游戏界面
  - Footer所有内容

#### 默认展示优化
- ✅ **打开即显示棋盘**
  - 访问网站立即看到国际象棋盘
  - 无需等待，直观展示
  - 欢迎消息引导用户开始游戏
- ✅ **游戏设置侧边栏**
  - 点击"新游戏"按钮打开设置
  - 右侧滑入式侧边栏
  - 移动端全屏显示
  - 点击遮罩层关闭
- ✅ **固定新游戏按钮**
  - 左上角固定位置
  - 绿色醒目设计
  - 多语言文本支持
- ✅ **欢迎界面**
  - 突出5种AI棋手
  - 强调完全免费
  - 显示11种语言支持
  - 多语言欢迎文本

#### 交互改进
- 关闭按钮（X）在侧边栏右上角
- 点击遮罩层自动关闭设置
- 平滑动画过渡（0.3s）
- 响应式侧边栏（移动端全屏）

#### 视觉优化
- 初始棋盘即展示
- 欢迎消息半透明白色卡片
- 渐变背景始终可见
- 更好的首屏视觉效果

### Bug修复

#### JavaScript加载问题
- ✅ 修复Chess.js库CDN 404错误
  - 更换为unpkg稳定版本0.10.3
  - 添加onerror错误处理
  - 添加onload回调确保库已加载
  - 添加typeof检查防止未定义错误
  - 添加超时重试机制（500ms）
  - Chess未定义错误已彻底解决
  - 代码体积优化：187KB → 102KB (45%减少)

#### PWA配置
- ✅ 更新PWA meta标签
  - 移除已废弃的apple-mobile-web-app-capable
  - 使用标准mobile-web-app-capable
  - 移除不存在的图标引用（404错误已解决）
  - manifest.json图标配置为空数组

#### 多语言完善
- ✅ 欢迎消息11种语言完整翻译
  - 每种语言独立的欢迎文本
  - 特性展示本地化（AI数量、免费、语言）
  - 示例：
    - 中文："🤖 5种AI棋手 | 💯 完全免费 | 🌍 11种语言"
    - English: "🤖 5 AI Players | 💯 Free | 🌍 11 Languages"
    - 日本語: "🤖 5つのAI | 💯 無料 | 🌍 11言語"

## [2.1.2] - 2025-11-04

### SEO内容优化

#### SEO策略调整
- ✅ **突出AI优势**
  - 强调5种强大AI棋手
  - 从入门到大师级难度
  - 不同风格的AI对手
- ✅ **用户价值优先**
  - 完全免费使用
  - 全球11种语言支持
  - 实时在线对战
  - 游戏分析和回放
- ✅ **去除技术描述**
  - 移除Cloudflare Workers提及
  - 移除底层技术栈介绍
  - 聚焦用户体验和功能

#### 11种语言全部更新
每种语言的SEO内容都已优化：
- Title突出"5种AI棋手"、"免费"
- Description强调AI挑战、免费使用、全球访问
- Keywords增加"智能象棋"、"AI对手"等

#### 优化示例
**简体中文**：
- 旧：基于Cloudflare Workers的在线国际象棋...
- 新：提供5种强大AI棋手在线对弈，从入门到大师级...

**English**：
- 旧：powered by Cloudflare Workers...
- 新：Challenge 5 unique AI chess opponents from beginner to grandmaster...

## [2.1.1] - 2025-11-04

### SEO多语言增强

#### 新增功能
- ✅ **完整的多语言SEO支持**（11种语言）
  - 每种语言独立的title、description、keywords
  - 本地化的Open Graph标签
  - 本地化的Twitter Card标签
- ✅ **hreflang标签**
  - 为所有11种语言添加hreflang链接
  - x-default回退支持
  - 正确的语言代码（zh-CN, zh-TW等）
- ✅ **智能语言检测**
  - URL参数优先（?lang=en）
  - Accept-Language头自动检测
  - 支持语言变体映射（en-US -> en）
- ✅ **多语言sitemap**
  - 为每种语言生成独立URL
  - 添加xhtml:link alternate标签
  - SEO友好的URL结构
- ✅ **域名统一**
  - 所有链接使用aichess.win
  - Canonical链接正确设置
  - OG和Twitter链接一致

#### 技术改进
- 新增 `seo-i18n.ts` 模块
- Content-Language响应头
- Vary: Accept-Language缓存优化
- 语言切换自动刷新页面

#### SEO覆盖语言
- 简体中文 (zh-CN)
- 繁体中文 (zh-TW)
- English (en)
- Français (fr)
- Español (es)
- Deutsch (de)
- Italiano (it)
- Português (pt)
- Русский (ru)
- 日本語 (ja)
- 한국어 (ko)

## [2.1.0] - 2025-11-04

### 优化改进

#### 性能优化
- ✅ 添加HTTP缓存控制（静态资源、API响应）
- ✅ CDN缓存优化（浏览器5分钟，CDN 10分钟）
- ✅ AI模型列表缓存1小时
- ✅ Gzip压缩支持

#### 安全增强
- ✅ 完整的安全响应头（CSP, X-Frame-Options等）
- ✅ Content Security Policy强化
- ✅ XSS保护和MIME类型嗅探防护
- ✅ CORS配置优化（24小时预检缓存）
- ✅ 输入验证增强（游戏模式、时间控制、移动格式）
- ✅ API速率限制准备（每分钟100请求）
- ✅ 错误信息脱敏（生产环境）

#### 稳定性提升
- ✅ 完整的错误处理和try-catch包装
- ✅ AI调用超时控制（30秒）
- ✅ 指数退避重试机制
- ✅ 速率限制错误特殊处理
- ✅ 结构化错误响应
- ✅ 健康检查端点 /health

#### SEO优化
- ✅ 完整的meta标签（标题、描述、关键词）
- ✅ Open Graph社交媒体标签
- ✅ Twitter Card标签
- ✅ 结构化数据（Schema.org WebApplication）
- ✅ robots.txt支持
- ✅ sitemap.xml自动生成
- ✅ Canonical链接

#### PWA支持
- ✅ manifest.json配置
- ✅ 主题颜色设置
- ✅ Apple Touch Icon支持
- ✅ 离线准备就绪

### 技术改进
- 输入验证正则表达式
- 响应头标准化
- 日志结构化
- 错误追踪时间戳

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

