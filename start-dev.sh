#!/bin/bash

source env.dev

# 清理端口
kill -9 $(lsof -t -i:${API_PORT:-1666}) 2>/dev/null

# 启动
echo "🚀 Quant API: http://localhost:${API_PORT:-1666}/docs"
python -m app.main