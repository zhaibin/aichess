# AIChess v4.0 架构文档

## 🏗️ 项目结构

```
AiChess/
├── backend/                 # 后端 (Cloudflare Workers)
│   ├── src/
│   │   ├── worker.ts       # Worker入口 (<30行)
│   │   ├── types.ts        # TypeScript类型定义
│   │   ├── routes/         # 路由层
│   │   │   ├── index.ts    # 主路由
│   │   │   ├── api.routes.ts
│   │   │   ├── static.routes.ts
│   │   │   └── seo.routes.ts
│   │   ├── handlers/       # 业务处理层
│   │   │   ├── game.handler.ts
│   │   │   ├── ai.handler.ts
│   │   │   └── queue.handler.ts
│   │   ├── services/       # 核心服务
│   │   │   ├── chess-engine.ts
│   │   │   ├── ai-player.ts
│   │   │   ├── game-state.ts
│   │   │   ├── websocket-room.ts
│   │   │   ├── user-system.ts
│   │   │   └── i18n.ts
│   │   ├── templates/      # HTML/JS模板
│   │   │   ├── html.template.ts
│   │   │   ├── chess-engine.template.ts
│   │   │   └── seo.template.ts
│   │   ├── utils/          # 工具函数
│   │   │   ├── validation.ts
│   │   │   ├── rate-limit.ts
│   │   │   └── language.ts
│   │   └── config/         # 配置
│   │       ├── constants.ts
│   │       └── headers.ts
│   ├── wrangler.toml
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/               # 前端 (独立构建)
│   ├── src/
│   │   ├── index.html
│   │   ├── main.ts
│   │   ├── components/
│   │   ├── styles/
│   │   └── utils/
│   ├── vite.config.ts
│   ├── package.json
│   └── tsconfig.json
│
└── docs/                   # 文档
    ├── README.md
    ├── ARCHITECTURE.md
    └── API.md
```

## 🎯 架构特点

### 1. **前后端分离**
- **Backend**: Cloudflare Workers + Durable Objects
- **Frontend**: Vite + TypeScript (独立构建)
- 清晰的职责划分

### 2. **分层架构**
```
┌─────────────────────┐
│   Worker Entry     │  worker.ts
├─────────────────────┤
│   Routes Layer     │  路由分发
├─────────────────────┤
│   Handlers Layer   │  业务逻辑
├─────────────────────┤
│   Services Layer   │  核心服务
├─────────────────────┤
│   Utils & Config   │  工具和配置
└─────────────────────┘
```

### 3. **核心优势**

#### ✅ **可维护性**
- 单一文件职责
- 清晰的依赖关系
- 易于定位问题

#### ✅ **可测试性**
- 独立的handlers可单元测试
- Mock services轻松
- 集成测试简单

#### ✅ **可扩展性**
- 新增路由：添加到routes/
- 新增功能：添加handler
- 新增服务：添加到services/

#### ✅ **性能**
- 按需加载
- 模块化打包
- 最小化传输

## 📋 文件说明

### Backend核心文件

| 文件 | 职责 | 行数 |
|------|------|------|
| `worker.ts` | Worker入口 | ~30 |
| `routes/index.ts` | 路由分发 | ~50 |
| `handlers/game.handler.ts` | 游戏逻辑处理 | ~150 |
| `services/chess-engine.ts` | 国际象棋引擎 | ~512 |
| `templates/html.template.ts` | HTML生成 | ~100 |

### 对比旧架构

| 指标 | v3.0 | v4.0 |
|------|------|------|
| index.ts行数 | 1876 | ~30 |
| 模块数 | 12 | 30+ |
| 可维护性 | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| 可测试性 | ⭐ | ⭐⭐⭐⭐⭐ |
| 开发效率 | ⭐⭐ | ⭐⭐⭐⭐⭐ |

## 🚀 开发流程

### Backend开发
```bash
cd backend
npm install
npm run dev  # 启动本地开发
npm run deploy  # 部署到Cloudflare
```

### Frontend开发
```bash
cd frontend
npm install
npm run dev  # 启动Vite开发服务器
npm run build  # 构建生产版本
```

## 📝 添加新功能示例

### 添加新API端点

1. 在`handlers/`创建新handler:
```typescript
// handlers/stats.handler.ts
export async function handleStats(req, env) {
  return new Response(JSON.stringify({...}));
}
```

2. 在`routes/api.routes.ts`注册:
```typescript
const routes = {
  '/api/stats': handleStats,
  // ...
};
```

### 添加新服务

1. 在`services/`创建服务:
```typescript
// services/analytics.ts
export class Analytics {
  static async track(event) {...}
}
```

2. 在handler中使用:
```typescript
import { Analytics } from '../services/analytics';
```

## 🔒 安全性

- 输入验证在`utils/validation.ts`统一处理
- 速率限制在`utils/rate-limit.ts`
- 安全头在`config/headers.ts`配置
- CORS在路由层统一处理

## 📊 监控和日志

- 所有错误统一catch并记录
- 队列处理错误有重试机制
- 可以在Cloudflare Dashboard查看实时日志

## 🎯 下一步优化

- [ ] 添加单元测试
- [ ] 添加E2E测试
- [ ] 性能监控集成
- [ ] 错误追踪系统
- [ ] CI/CD流水线

