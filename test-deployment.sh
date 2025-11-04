#!/bin/bash

# AIChess v4.0 部署测试脚本

BASE_URL="https://aichess.xants.workers.dev"

echo "🚀 AIChess v4.0 部署测试开始"
echo "================================"
echo ""

# 测试1: 健康检查
echo "📋 测试1: 健康检查"
curl -s -w "\nHTTP状态: %{http_code}\n响应时间: %{time_total}s\n" \
  "$BASE_URL/api/health"
echo ""

# 测试2: AI模型列表
echo "📋 测试2: AI模型列表"
curl -s -w "\nHTTP状态: %{http_code}\n响应时间: %{time_total}s\n" \
  "$BASE_URL/api/ai-models"
echo ""

# 测试3: robots.txt
echo "📋 测试3: robots.txt"
curl -s -w "\nHTTP状态: %{http_code}\n响应时间: %{time_total}s\n" \
  "$BASE_URL/robots.txt"
echo ""

# 测试4: manifest.json
echo "📋 测试4: manifest.json"
curl -s -w "\nHTTP状态: %{http_code}\n响应时间: %{time_total}s\n" \
  "$BASE_URL/manifest.json"
echo ""

# 测试5: sitemap.xml
echo "📋 测试5: sitemap.xml"
curl -s -w "\nHTTP状态: %{http_code}\n响应时间: %{time_total}s\n" \
  "$BASE_URL/sitemap.xml" | head -20
echo ""

# 测试6: Chess引擎JS
echo "📋 测试6: Chess引擎JS"
curl -s -w "\nHTTP状态: %{http_code}\n响应时间: %{time_total}s\n" \
  "$BASE_URL/chess-engine.js" | head -5
echo ""

# 测试7: 首页
echo "📋 测试7: 首页HTML"
curl -s -w "\nHTTP状态: %{http_code}\n响应时间: %{time_total}s\n" \
  "$BASE_URL/" | head -10
echo ""

# 测试8: 创建游戏
echo "📋 测试8: 创建游戏API"
curl -s -X POST "$BASE_URL/api/create-game" \
  -H "Content-Type: application/json" \
  -d '{"mode":"human-vs-ai","timeControl":600,"whitePlayerType":"human","blackPlayerType":"ai","blackAIModel":"gpt-oss-20b"}' \
  -w "\nHTTP状态: %{http_code}\n响应时间: %{time_total}s\n"
echo ""

# 测试9: HTTP头部检查
echo "📋 测试9: 安全头部检查"
curl -s -I "$BASE_URL/" | grep -E "(Content-Security-Policy|X-Frame-Options|X-Content-Type-Options)"
echo ""

echo "================================"
echo "✅ 测试完成"

