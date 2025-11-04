#!/bin/bash
# 自动化部署脚本

set -e

echo "🚀 开始自动部署流程..."

# 检查是否有变更
if [[ -n $(git status -s) ]]; then
    echo "📝 发现代码变更"
    
    # 添加所有变更
    git add .
    
    # 获取提交信息（如果没有提供则使用默认）
    if [ -z "$1" ]; then
        COMMIT_MSG="更新: 自动提交 $(date '+%Y-%m-%d %H:%M:%S')"
    else
        COMMIT_MSG="$1"
    fi
    
    # 提交
    git commit -m "$COMMIT_MSG"
    echo "✅ Git提交完成: $COMMIT_MSG"
else
    echo "ℹ️  没有代码变更"
fi

# 部署到Cloudflare
echo "🌐 部署到Cloudflare Workers..."
npm run deploy

echo "✅ 部署完成！"
echo "🔗 访问: https://aichess.win"

