export const AD_CONFIG = {
  // 你的 AdSense Publisher ID
  publisherId: "ca-pub-6838916324119792",

  // 广告单元 ID（需要在 AdSense 后台创建广告单元后填入）
  slots: {
    // 激励广告（用户看完获得奖励）- 需要在 AdSense 创建后填入
    rewarded: "",
    // 横幅广告
    banner: "",
  },

  // 是否启用测试模式（开发时设为 true）
  testMode: process.env.NODE_ENV === "development",
};
