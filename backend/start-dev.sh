#!/bin/bash

# 切换到脚本所在目录
cd "$(dirname "$0")"

source env.dev

# 清理端口
kill -9 $(lsof -t -i:${API_PORT:-1666}) 2>/dev/null

# 使用 uv 启动
echo "🚀 Quant API: http://localhost:${API_PORT:-1666}/docs"
uv run python -m app.main