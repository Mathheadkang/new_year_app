"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// index.ts
const storage_1 = require("../../utils/storage");
Page({
    data: {
        name: '',
        position: 'head',
        topCouplet: '',
        bottomCouplet: '',
        horizontalScroll: '',
        loading: false,
        remainingCount: 5,
        positions: [
            { value: 'head', label: '藏头', desc: '名字藏在开头' },
            { value: 'middle', label: '藏中', desc: '名字藏在中间' },
            { value: 'tail', label: '藏尾', desc: '名字藏在末尾' }
        ]
    },
    onLoad() {
        // 获取全局剩余次数
        const app = getApp();
        this.setData({
            remainingCount: app.globalData.dailyLimit
        });
    },
    onShow() {
        // 页面显示时更新剩余次数
        const app = getApp();
        this.setData({
            remainingCount: app.globalData.dailyLimit
        });
    },
    onNameInput(e) {
        let inputValue = e.detail.value;
        // 实时限制：如果超过4个中文字符，只保留前4个
        if (inputValue.length > 4) {
            inputValue = inputValue.slice(0, 4);
            this.setData({
                name: inputValue
            });
        }
        else {
            this.setData({
                name: inputValue
            });
        }
    },
    onNameConfirm(e) {
        // 输入确认时自动截取前4个字符
        let inputValue = e.detail.value.trim();
        if (inputValue.length > 4) {
            inputValue = inputValue.slice(0, 4);
            this.setData({
                name: inputValue
            });
            wx.showToast({
                title: '姓名最多4个字',
                icon: 'none',
                duration: 1500
            });
        }
    },
    selectPosition(e) {
        const { position } = e.currentTarget.dataset;
        this.setData({
            position: position
        });
    },
    async generateCouplet() {
        const name = this.data.name.trim();
        // 检查剩余次数
        const app = getApp();
        if (app.globalData.dailyLimit <= 0) {
            wx.showModal({
                title: '次数用完啦',
                content: '今日生成次数已用完，请明日再访问小程序~',
                showCancel: false,
                confirmText: '知道了'
            });
            return;
        }
        // 验证输入
        if (!name) {
            wx.showToast({
                title: '请输入姓名',
                icon: 'none'
            });
            return;
        }
        if (name.length < 1 || name.length > 4) {
            wx.showToast({
                title: '姓名长度为1-4个字',
                icon: 'none'
            });
            return;
        }
        this.setData({ loading: true });
        try {
            // 获取该名字的历史记录（最近10条）用于去重
            const previousCouplets = (0, storage_1.getRecentHistoryForPrompt)(name, 10);
            // 调用云函数
            console.log('调用云函数，参数:', { name, position: this.data.position, previousCouplets });
            const res = await wx.cloud.callFunction({
                name: 'router',
                data: {
                    name: name,
                    position: this.data.position,
                    previousCouplets: previousCouplets
                }
            });
            console.log('云函数返回结果:', res);
            const result = res.result;
            if (result.error) {
                console.error('云函数返回错误:', result.error);
                throw new Error(result.error);
            }
            console.log('解析结果:', result);
            // 扣除次数
            app.globalData.dailyLimit--;
            this.setData({
                remainingCount: app.globalData.dailyLimit
            });
            // 跳转到结果页面
            wx.navigateTo({
                url: `/pages/result/result?data=${encodeURIComponent(JSON.stringify({
                    name: name,
                    position: this.data.position,
                    upper: result.upper,
                    lower: result.lower,
                    horizontal: result.horizontal
                }))}`
            });
        }
        catch (error) {
            console.error('Generate error:', error);
            wx.showModal({
                title: '生成失败',
                content: error.message || '生成失败，请重试',
                showCancel: false
            });
        }
        finally {
            this.setData({ loading: false });
        }
    },
    regenerate() {
        this.generateCouplet();
    },
    goToHistory() {
        wx.navigateTo({
            url: '/pages/history/history'
        });
    },
    // 分享给好友
    onShareAppMessage() {
        return {
            title: '2026马年春联生成器',
            path: '/pages/index/index',
            imageUrl: '/images/share/share_pic.png' // 可以设置自定义分享图片
        };
    },
    // 分享到朋友圈
    onShareTimeline() {
        return {
            title: '2026马年春联生成器',
            query: '',
            imageUrl: '' // 可以设置自定义分享图片
        };
    }
});
