# 春联生成器共享代码

这个目录包含了 web 端和小程序端共享的代码。

## 内容

- `types.ts` - 类型定义
- `prompts.ts` - AI 提示词配置
- `index.ts` - 统一导出

## 使用

在 web 或 miniprogram 项目中引用：

```typescript
import { Couplet, HidePosition, buildSystemPrompt } from '../shared';
```
