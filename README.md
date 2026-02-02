# 春联生成器 Monorepo

一个跨平台的春联生成应用，支持 Web 端和微信小程序。

## 项目结构

```
new_year_app/
├── web/              # Next.js Web 应用
├── miniprogram/      # 微信小程序
├── shared/           # 共享代码（类型定义、提示词等）
└── package.json      # 根目录 workspace 配置
```

## 快速开始

### 安装依赖

```bash
# 安装所有项目的依赖
npm run install:all
```

### 开发

```bash
# Web 端开发
npm run dev:web

# 小程序开发
npm run dev:miniprogram

# 构建共享代码
npm run build:shared
```

## 子项目说明

### Web 端 (web/)
- 技术栈：Next.js 16 + React 19 + TypeScript + Tailwind CSS
- 访问地址：http://localhost:3000
- API 接口：使用 Anthropic Claude API 生成对联

### 微信小程序 (miniprogram/)
- 技术栈：原生微信小程序 + TypeScript
- 开发工具：微信开发者工具
- 功能：生成对联、查看历史、分享

### 共享代码 (shared/)
- 类型定义：`types.ts`
- AI 提示词：`prompts.ts`
- 两端共用，保持逻辑一致

## 开发指南

### Web 端开发

```bash
cd web
npm run dev
```

在浏览器打开 http://localhost:3000

### 小程序开发

1. 安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 打开微信开发者工具
3. 导入项目，选择 `miniprogram/` 目录
4. 安装依赖并编译 TypeScript

```bash
cd miniprogram
npm install
npx tsc  # 首次编译
```

**重要提示：** 微信小程序需要 `.js` 文件，而我们使用 TypeScript 开发。每次修改 `.ts` 文件后，需要重新编译：

```bash
# 单次编译
npx tsc

# 或启动监听模式（推荐，自动编译）
npm run compile
```

编译成功后，在微信开发者工具中点击"编译"按钮即可运行小程序。

### 使用共享代码

在 web 或 miniprogram 项目中：

```typescript
// 引用共享类型和工具
import { Couplet, HidePosition, buildSystemPrompt } from '../shared';
```

## API 配置

### Web 端
在 `web/.env.local` 中配置：

```
ANTHROPIC_API_KEY=your_api_key_here
```

### 小程序
需要配置服务器域名或使用云开发：

1. 方式一：配置自己的服务器
   - 在微信小程序后台配置服务器域名
   - 修改 `miniprogram/pages/index/index.ts` 中的 API 地址

2. 方式二：使用云开发
   - 开通微信云开发
   - 创建云函数处理对联生成

## 功能特性

- ✅ 三种藏字方式：藏头、藏中、藏尾
- ✅ AI 智能生成春联
- ✅ 本地历史记录
- ✅ 一键分享功能
- ✅ 响应式设计
- ✅ 跨平台支持

## 技术栈

- **Web**: Next.js, React, TypeScript, Tailwind CSS
- **小程序**: 微信小程序原生框架, TypeScript
- **AI**: Anthropic Claude API
- **工具**: pnpm workspace / npm workspace

## 许可证

MIT
