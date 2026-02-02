"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// pages/history/history.ts
const storage_1 = require("../../utils/storage");
Page({
    data: {
        historyList: []
    },
    onLoad() {
        this.loadHistory();
    },
    onShow() {
        // 从其他页面返回时重新加载历史
        this.loadHistory();
    },
    loadHistory() {
        const history = (0, storage_1.getHistory)();
        this.setData({
            historyList: history
        });
    },
    clearHistory() {
        wx.showModal({
            title: '确认清空',
            content: '确定要清空所有历史记录吗？',
            success: (res) => {
                if (res.confirm) {
                    (0, storage_1.clearHistory)();
                    this.setData({
                        historyList: []
                    });
                    wx.showToast({
                        title: '已清空',
                        icon: 'success'
                    });
                }
            }
        });
    },
    shareItem(e) {
        const { index } = e.currentTarget.dataset;
        // TODO: 实现分享功能
        console.log('分享对联', index);
        wx.showShareMenu({
            withShareTicket: true,
            menus: ['shareAppMessage', 'shareTimeline']
        });
    },
    formatTime(timestamp) {
        return (0, storage_1.formatTime)(timestamp);
    }
});
