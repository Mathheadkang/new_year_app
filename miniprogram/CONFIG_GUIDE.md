# 微信小程序配置指南

## 📋 配置步骤

### 1. 配置 API 地址

编辑 `utils/config.ts`，填入你的 Vercel 部署地址：

```typescript
export const API_BASE_URL = 'https://your-app.vercel.app';  // 👈 改成你的地址
```

### 2. 配置服务器域名白名单

1. 登录 [微信公众平台](https://mp.weixin.qq.com/)
2. 进入：开发 → 开发管理 → 开发设置 → 服务器域名
3. 添加 **request 合法域名**：`https://your-app.vercel.app`

**注意事项：**
- 必须是 HTTPS
- 需要完整域名（包括子域名）
- 每月最多修改 5 次
- 配置后需等待几分钟生效

### 3. Web 端部署到 Vercel

```bash
cd web
vercel deploy --prod
```

记下部署的域名，例如：`https://spring-couplet.vercel.app`

### 4. 配置 API Key

在 Vercel 项目设置中添加环境变量：
- 进入 Vercel Dashboard → 你的项目 → Settings → Environment Variables
- 添加：`DEEPSEEK_API_KEY` = `你的API密钥`

### 5. 编译小程序

```bash
cd miniprogram
npm install
npx tsc
```

### 6. 在微信开发者工具中测试

1. 打开微信开发者工具
2. 导入项目，选择 `miniprogram/` 目录
3. 点击"编译"
4. 测试生成春联功能

## 🔧 故障排查

### 问题1: request:fail url not in domain list

**原因**：域名未配置到白名单

**解决**：
1. 检查 `utils/config.ts` 中的域名是否正确
2. 确认该域名已添加到微信公众平台的服务器域名白名单
3. 等待几分钟让配置生效

### 问题2: 生成失败

**检查清单**：
- [ ] Vercel 环境变量 `DEEPSEEK_API_KEY` 是否配置
- [ ] Web API 是否正常工作（在浏览器测试）
- [ ] 小程序 `utils/config.ts` 中的域名是否正确
- [ ] 网络连接是否正常

### 问题3: 找不到 .js 文件

**原因**：TypeScript 未编译

**解决**：
```bash
cd miniprogram
npx tsc
```

## 📱 本地开发测试

开发阶段可以临时关闭域名检查：

1. 微信开发者工具：详情 → 本地设置
2. 勾选"不校验合法域名、web-view(业务域名)、TLS 版本以及 HTTPS 证书"
3. 将 `utils/config.ts` 改为本地地址：`http://localhost:3000`

**注意**：上线前必须使用 HTTPS 域名并配置白名单！

## 📝 API 接口说明

**端点**：`POST /api/generate`

**请求**：
```json
{
  "name": "张三",
  "position": "head"  // head | middle | tail
}
```

**响应**：
```json
{
  "upper": "张灯结彩迎新岁",
  "lower": "三阳开泰庆丰年",
  "horizontal": "春回大地",
  "position": "head"
}
```

## 🎉 完成

配置完成后，小程序就能正常调用 Web 端的 API 生成春联了！
