"use strict";
// app.ts
App({
    globalData: {},
    onLaunch() {
        // 初始化云开发环境
        if (wx.cloud) {
            wx.cloud.init({
                env: 'cloud1-1gu62a2q6e57c2c9',
                traceUser: true,
            });
        }
        // 展示本地存储能力
        const logs = wx.getStorageSync('logs') || [];
        logs.unshift(Date.now());
        wx.setStorageSync('logs', logs);
        // 登录
        wx.login({
            success: res => {
                console.log(res.code);
                // 发送 res.code 到后台换取 openId, sessionKey, unionId
            },
        });
    },
});
