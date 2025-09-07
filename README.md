# Quant System

基于 Python + Next.js 的量化交易系统 - FastAPI 后端 + Next.js 前端

## 🚀 快速开始

### 后端启动

```bash
# 进入后端目录
cd backend

# 安装依赖
uv sync

# 启动后端服务
./start-dev.sh
```

### 前端启动

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 启动前端服务
./start-dev.sh
```

## 📊 项目结构

```
quant/
├── backend/              # 后端服务
│   ├── app/             # 应用主目录
│   ├── test/            # 测试文件
│   ├── env.dev          # 开发环境配置
│   ├── env.test         # 测试环境配置
│   ├── env.prod         # 生产环境配置
│   └── start-dev.sh     # 启动脚本
└── frontend/            # 前端服务
    ├── src/             # 源代码
    ├── package.json     # 依赖配置
    └── start-dev.sh     # 启动脚本
```

## 🔧 技术栈

### 后端
- **FastAPI** - 高性能 Web 框架
- **Tortoise ORM** - 异步 ORM
- **PostgreSQL** - 数据库
- **Pandas/NumPy** - 数据处理
- **uv** - 快速的 Python 包管理器

### 前端
- **Next.js 15** - React 框架
- **TypeScript** - 类型安全
- **Tailwind CSS v4** - 样式框架
- **Axios** - HTTP 客户端

## 📖 API 文档

后端启动后访问：
- http://localhost:1666/docs - Swagger UI
- http://localhost:1666/redoc - ReDoc

前端启动后访问：
- http://localhost:3668 - 前端界面