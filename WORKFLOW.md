# 自动化工作流程

## 快速命令

### 自动部署（推荐）
```bash
npm run auto-deploy "提交: 描述信息"
```
自动执行：Git提交 + Cloudflare部署

### 手动Git提交
```bash
npm run git-commit "提交: 描述信息"
```

### 手动部署
```bash
npm run deploy
```

### 本地开发
```bash
npm run dev
```

### 查看日志
```bash
npm run tail
```

## 工作流程

### 日常开发
1. 修改代码
2. 运行 `npm run auto-deploy "描述"`
3. 完成！

### GitHub推送（重大变更）
```bash
git push origin main
```
**注意：需手动确认**

## 提交信息规范

- `功能: 添加xxx功能`
- `修复: 修复xxx问题`
- `优化: 优化xxx性能`
- `样式: 调整xxx样式`
- `文档: 更新xxx文档`
- `重构: 重构xxx代码`

## 示例

```bash
# 修复bug后
npm run auto-deploy "修复: AI超时问题"

# 添加新功能后
npm run auto-deploy "功能: 添加悔棋功能"

# 样式调整后
npm run auto-deploy "样式: 调整移动端布局"
```

## GitHub Actions

推送到main分支后，GitHub Actions会自动部署（需配置secrets）：
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

## 规则参考

详见 `.cursorrules` 文件

