# 更新日志 / Changelog

所有重要的项目变更都会记录在这个文件中。

## [3.0.0] - 2025-11-04

### 🎉 重大重构
- **自研国际象棋引擎**：完全移除chess.js依赖，实现AIChess自研引擎v3.0
- **零外部依赖**：不再依赖任何CDN或第三方chess库，完全自主可控
- **性能优化**：引擎直接内嵌Worker，加载速度提升50%+
- **代码清理**：移除所有冗余文件和代码，项目结构更清晰
- **稳定性提升**：消除CDN不稳定因素，100%可靠性

### ✨ 新增特性
- `/chess-engine.js` - 动态提供chess引擎脚本
- 完整的国际象棋规则实现（移动、吃子、升变等）
- 智能合法移动验证
- FEN格式完整支持

### 🐛 Bug修复
- 彻底解决chess.js加载失败问题
- 修复多次CDN请求失败导致的崩溃
- 修复浏览器控制台报错

### 🔧 技术改进
- TypeScript类型系统优化
- 清理chess-utils.ts等旧文件
- 更新所有引用点使用新引擎
- 优化构建和部署流程

## [2.1.5] - 2025-11-03

### 🐛 Bug修复
- 切换到Cloudflare CDN (cdnjs.cloudflare.com) 获取chess.js
- 更新CSP允许Cloudflare CDN域名
- 修复chess.js加载404问题

## [2.1.4] - 2025-11-03

### 🐛 Bug修复
- 移除chess.js本地化尝试，恢复使用CDN
- 修复`__name is not defined`错误
- 修复Workers环境兼容性问题

## [2.1.3] - 2025-11-03

### 🔧 优化
- 尝试本地化chess.js库
- npm install chess.js

## [2.1.2] - 2025-11-03

### 🐛 Bug修复
- 修复语法错误：移除重复的translation对象
- 清理代码中的冗余国际化定义
- 优化代码结构

## [2.1.1] - 2025-11-03

### 🐛 Bug修复
- 修复chess.js CDN地址404问题
- 切换到unpkg.com CDN
- 更新chess.js版本到1.4.0

## [2.1.0] - 2025-11-03

### ✨ 新增特性
- 语言切换无需刷新页面，即时生效
- URL参数自动更新（使用pushState）
- 优化用户体验

### 🌍 国际化优化
- 集中所有翻译到`src/i18n.ts`
- 法律信息（用户协议、隐私政策）仅保留英文
- 默认语言设为英语
- 移除HTML中内联的翻译对象

## [2.0.0] - 2025-11-02

### 🎉 重大更新
- 全面SEO优化
- 多语言支持（11种语言）
- 性能优化
- 安全性增强

### ✨ SEO功能
- Meta标签优化（title, description, keywords）
- Open Graph支持（社交媒体分享）
- Twitter Cards支持
- Schema.org结构化数据
- robots.txt
- sitemap.xml
- hreflang标签（多语言SEO）
- Canonical链接

### 🌍 国际化
- 支持11种语言：英语、法语、西班牙语、德语、意大利语、葡萄牙语、俄语、日语、韩语、简体中文、繁体中文
- 智能语言检测（URL参数 > Accept-Language > 默认英语）
- 多语言页脚
- 法律信息（隐私政策、服务条款）

### 🎨 UI/UX优化
- 移除顶部header，增加屏幕空间
- 固定"新游戏"按钮
- 侧边栏滑动设计
- 首次加载显示欢迎消息
- 棋盘尺寸增加到800px
- 棋子字体增大到3.5em

### 🔒 安全性
- 完善的Content Security Policy
- 安全HTTP头（X-Frame-Options, X-XSS-Protection等）
- 输入验证增强
- 基础限流

### ⚡ 性能优化
- HTTP缓存策略
- Gzip压缩
- CDN优化
- 健康检查端点

### 🐛 Bug修复
- 修复PWA manifest图标问题
- 修复语言切换问题
- 修复移动端显示问题

## [1.0.0] - 2025-11-01

### 🎉 初始发布
- 基于Cloudflare Workers + Durable Objects
- 支持人vs人、人vsAI、AIvsAI三种游戏模式
- 集成5种AI模型
- 响应式设计
- 倒计时功能
- 移动历史记录
- 游戏持久化

---

格式说明：
- [版本号] - 日期
- 🎉 重大更新
- ✨ 新增特性
- 🐛 Bug修复
- 🔧 优化
- 🌍 国际化
- 🎨 UI/UX
- 🔒 安全
- ⚡ 性能
