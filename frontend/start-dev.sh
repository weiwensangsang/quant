#!/bin/bash

# 读取环境配置
source env.dev

# 使用环境变量中的端口，如果没有则默认3668
PORT=${PORT:-3668}

# 检查并安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 检测到依赖未安装，正在安装..."
    npm install
elif [ "package.json" -nt "node_modules" ] || [ "package-lock.json" -nt "node_modules" ]; then
    echo "📦 检测到依赖有更新，正在重新安装..."
    npm install
fi

# 清理端口
for port in $PORT; do
    PID=$(lsof -ti :$port)

    if [ ! -z "$PID" ]; then
        kill -9 $PID
        sleep 1
    fi
done

echo "🚀 启动新的前端服务 (端口: $PORT)..."
npx next dev -p $PORT
