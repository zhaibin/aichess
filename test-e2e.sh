#!/bin/bash

# AIChess v4.0 端到端测试脚本

BASE_URL="https://aichess.xants.workers.dev"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORT_FILE="test-report-${TIMESTAMP}.txt"

echo "🧪 AIChess v4.0 端到端测试" | tee $REPORT_FILE
echo "================================" | tee -a $REPORT_FILE
echo "测试时间: $(date)" | tee -a $REPORT_FILE
echo "BASE_URL: $BASE_URL" | tee -a $REPORT_FILE
echo "" | tee -a $REPORT_FILE

PASSED=0
FAILED=0

# 测试函数
test_endpoint() {
  local name="$1"
  local method="$2"
  local url="$3"
  local data="$4"
  local expected_code="$5"
  
  echo "📋 测试: $name" | tee -a $REPORT_FILE
  
  if [ "$method" = "POST" ]; then
    response=$(curl -s -w "\n%{http_code}\n%{time_total}" -X POST "$url" \
      -H "Content-Type: application/json" \
      -d "$data" 2>&1)
  else
    response=$(curl -s -w "\n%{http_code}\n%{time_total}" "$url" 2>&1)
  fi
  
  http_code=$(echo "$response" | tail -n 2 | head -n 1)
  time_total=$(echo "$response" | tail -n 1)
  body=$(echo "$response" | head -n -2)
  
  if [ "$http_code" = "$expected_code" ]; then
    echo "   ✅ HTTP状态: $http_code" | tee -a $REPORT_FILE
    echo "   ⏱️  响应时间: ${time_total}s" | tee -a $REPORT_FILE
    PASSED=$((PASSED + 1))
  else
    echo "   ❌ HTTP状态: $http_code (期望: $expected_code)" | tee -a $REPORT_FILE
    FAILED=$((FAILED + 1))
  fi
  echo "" | tee -a $REPORT_FILE
}

# 执行测试
echo "开始测试..." | tee -a $REPORT_FILE
echo "" | tee -a $REPORT_FILE

# 1. 健康检查
test_endpoint "健康检查" "GET" "$BASE_URL/api/health" "" "200"

# 2. AI模型列表
test_endpoint "AI模型列表" "GET" "$BASE_URL/api/ai-models" "" "200"

# 3. robots.txt
test_endpoint "robots.txt" "GET" "$BASE_URL/robots.txt" "" "200"

# 4. sitemap.xml
test_endpoint "sitemap.xml" "GET" "$BASE_URL/sitemap.xml" "" "200"

# 5. manifest.json
test_endpoint "manifest.json" "GET" "$BASE_URL/manifest.json" "" "200"

# 6. Chess引擎
test_endpoint "Chess引擎" "GET" "$BASE_URL/chess-engine.js" "" "200"

# 7. 首页（默认语言）
test_endpoint "首页(默认)" "GET" "$BASE_URL/" "" "200"

# 8. 首页（中文）
test_endpoint "首页(中文)" "GET" "$BASE_URL/?lang=zh-CN" "" "200"

# 9. 首页（英文）
test_endpoint "首页(英文)" "GET" "$BASE_URL/?lang=en" "" "200"

# 10. 创建游戏
test_endpoint "创建游戏" "POST" "$BASE_URL/api/create-game" \
  '{"mode":"human-vs-ai","timeControl":600,"whitePlayerType":"human","blackPlayerType":"ai","blackAIModel":"gpt-oss-20b"}' \
  "200"

# 11. 错误处理测试
test_endpoint "错误处理(无效API)" "GET" "$BASE_URL/api/invalid" "" "404"

# 12. 验证测试(无效游戏数据)
test_endpoint "输入验证" "POST" "$BASE_URL/api/create-game" \
  '{"mode":"invalid"}' \
  "400"

# 总结
echo "================================" | tee -a $REPORT_FILE
echo "测试总结:" | tee -a $REPORT_FILE
echo "   ✅ 通过: $PASSED" | tee -a $REPORT_FILE
echo "   ❌ 失败: $FAILED" | tee -a $REPORT_FILE
echo "   📊 成功率: $((PASSED * 100 / (PASSED + FAILED)))%" | tee -a $REPORT_FILE
echo "" | tee -a $REPORT_FILE

if [ $FAILED -eq 0 ]; then
  echo "🎉 所有测试通过！" | tee -a $REPORT_FILE
  exit 0
else
  echo "⚠️  存在失败的测试" | tee -a $REPORT_FILE
  exit 1
fi

