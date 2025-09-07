# 前端代码规范配置

## ✅ 已配置的 Lint 规则

### ESLint 规则

#### TypeScript 规则
- `@typescript-eslint/no-explicit-any`: 禁止使用 any 类型
- `@typescript-eslint/no-unused-vars`: 禁止未使用的变量
- `@typescript-eslint/no-non-null-assertion`: 禁止非空断言
- `@typescript-eslint/no-empty-function`: 禁止空函数
- `@typescript-eslint/consistent-type-definitions`: 强制使用 interface 而非 type
- `@typescript-eslint/naming-convention`: 命名规范
  - interface: PascalCase
  - typeAlias: PascalCase
  - enum: PascalCase
  - variable: camelCase, UPPER_CASE, PascalCase
  - function: camelCase, PascalCase

#### 通用规则
- `no-console`: 关闭（允许 console）
- `no-debugger`: 错误
- `no-alert`: 错误
- `no-var`: 错误（使用 let/const）
- `prefer-const`: 优先使用 const
- `prefer-template`: 优先使用模板字符串

#### 代码风格
- `indent`: 2 空格缩进
- `quotes`: 双引号
- `semi`: 必须分号
- `comma-dangle`: 多行时末尾逗号
- `object-curly-spacing`: 对象花括号内有空格
- `arrow-spacing`: 箭头函数空格
- `no-trailing-spaces`: 禁止尾随空格

### Prettier 配置
- 分号：必须
- 引号：双引号
- Tab 宽度：2 空格
- 尾逗号：所有多行
- 打印宽度：80 字符
- 括号空格：有
- 箭头函数括号：总是

## 📝 使用方法

### 检查代码
```bash
# 类型检查
npm run type-check

# ESLint 检查
npm run lint:check

# Prettier 格式检查
npm run format:check

# 一键检查所有
npm run check-all
```

### 修复代码
```bash
# ESLint 自动修复
npm run lint:fix

# Prettier 格式化
npm run format

# 开发时实时检查
npm run dev  # Next.js 会自动运行 ESLint
```

## 🔧 VS Code 集成

建议安装以下插件：
- ESLint
- Prettier - Code formatter
- TypeScript and JavaScript Language Features

创建 `.vscode/settings.json`：
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## 🚀 Git Hooks（可选）

使用 husky + lint-staged 在提交前自动检查：

```bash
npm install --save-dev husky lint-staged
npx husky init
```

配置 `.husky/pre-commit`：
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

配置 `package.json`：
```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{js,jsx,json,css,md}": [
      "prettier --write"
    ]
  }
}
```

## 📋 规则说明

### 为什么这些规则？

1. **类型安全**：禁止 any，强制使用 TypeScript 的类型系统
2. **代码一致性**：统一的命名规范和格式
3. **错误预防**：禁止 debugger、alert 等生产环境不应出现的代码
4. **现代语法**：使用 const/let、模板字符串等现代 JavaScript 特性
5. **可读性**：合理的缩进、空格、换行规则

### 特殊说明

- `no-console` 设为 off：开发时需要调试
- 允许 PascalCase 变量名：用于 React 组件
- 数组解构不强制：有时下标访问更清晰

## 🎯 最佳实践

1. 保存文件时自动格式化（配置编辑器）
2. 提交代码前运行 `npm run check-all`
3. CI/CD 中集成 lint 检查
4. 团队统一使用相同的编辑器配置
