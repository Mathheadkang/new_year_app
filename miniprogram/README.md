# 微信小程序开发说明

## 项目配置

1. **AppID 配置**
   - 打开 `project.config.json`
   - 将 `appid` 字段改为你的小程序 AppID
   - 或使用测试号："touristappid"

2. **TypeScript 编译**
   ```bash
   npm install
   npm run compile  # 启动 TypeScript 监听编译
   ```

3. **微信开发者工具**
   - 下载并安装微信开发者工具
   - 导入项目，选择 `miniprogram/` 目录
   - 开始预览和调试

## 页面说明

- `pages/index/` - 主页，输入主题生成对联
- `pages/history/` - 历史记录页面

## API 配置

目前代码中 API 调用部分需要配置：

### 方式一：使用自己的服务器

修改 `pages/index/index.ts` 中的 API 地址：

```typescript
const res = await wx.request({
  url: 'https://your-domain.com/api/generate',
  method: 'POST',
  data: { theme: this.data.theme }
})
```

需要在微信小程序后台配置服务器域名（request 合法域名）。

### 方式二：使用微信云开发（推荐）

1. 在微信开发者工具中开通云开发
2. 创建云函数 `generateCouplet`
3. 修改代码调用云函数：

```typescript
wx.cloud.callFunction({
  name: 'generateCouplet',
  data: { theme: this.data.theme }
})
```

## 本地存储

历史记录使用 `wx.getStorageSync` 和 `wx.setStorageSync` 存储在本地。

## 下一步

- [ ] 配置 API 接口
- [ ] 完善对联生成逻辑
- [ ] 添加更多字体样式
- [ ] 实现分享功能
- [ ] 优化 UI 设计
