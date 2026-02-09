"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// pages/history/history.ts
const storage_1 = require("../../utils/storage");
Page({
    data: {
        historyList: [],
        groupedHistory: [],
        useGroupView: false,
        touchStartX: 0,
        touchStartY: 0,
        slideIndex: -1 // 当前滑动的项索引
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
        const useGroupView = history.length >= 6;
        if (useGroupView) {
            // 按名字分组
            const grouped = this.groupByName(history);
            this.setData({
                historyList: history,
                groupedHistory: grouped,
                useGroupView: true
            });
        }
        else {
            this.setData({
                historyList: history,
                groupedHistory: [],
                useGroupView: false
            });
        }
    },
    groupByName(history) {
        const map = new Map();
        history.forEach(item => {
            if (!map.has(item.name)) {
                map.set(item.name, []);
            }
            map.get(item.name).push(item);
        });
        const groups = [];
        map.forEach((items, name) => {
            groups.push({
                name,
                count: items.length,
                items,
                expanded: false
            });
        });
        // 按最新记录的时间排序
        groups.sort((a, b) => b.items[0].timestamp - a.items[0].timestamp);
        return groups;
    },
    toggleGroup(e) {
        const { index } = e.currentTarget.dataset;
        const groupedHistory = this.data.groupedHistory;
        groupedHistory[index].expanded = !groupedHistory[index].expanded;
        this.setData({
            groupedHistory
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
                        historyList: [],
                        groupedHistory: [],
                        useGroupView: false
                    });
                    wx.showToast({
                        title: '已清空',
                        icon: 'success'
                    });
                }
            }
        });
    },
    viewItem(e) {
        const { groupindex, itemindex } = e.currentTarget.dataset;
        let item;
        if (this.data.useGroupView) {
            // 分组视图
            item = this.data.groupedHistory[groupindex].items[itemindex];
        }
        else {
            // 普通视图
            item = this.data.historyList[itemindex];
        }
        // 跳转到结果页面，传递春联数据，并标记为从历史打开
        wx.navigateTo({
            url: `/pages/result/result?fromHistory=true&data=${encodeURIComponent(JSON.stringify({
                name: item.name,
                position: item.position,
                upper: item.upper,
                lower: item.lower,
                horizontal: item.horizontal
            }))}`
        });
    },
    // 触摸开始
    touchStart(e) {
        this.setData({
            touchStartX: e.touches[0].clientX,
            touchStartY: e.touches[0].clientY
        });
    },
    // 触摸移动
    touchMove(e) {
        const moveX = e.touches[0].clientX - this.data.touchStartX;
        const moveY = e.touches[0].clientY - this.data.touchStartY;
        // 判断是否为水平滑动（水平滑动距离大于垂直滑动距离）
        if (Math.abs(moveX) > Math.abs(moveY)) {
            const { groupindex, itemindex } = e.currentTarget.dataset;
            const index = this.data.useGroupView ? `${groupindex}-${itemindex}` : itemindex;
            // 左滑：显示删除按钮
            if (moveX < -30) {
                this.setData({
                    slideIndex: index
                });
            }
            // 右滑：关闭删除按钮
            else if (moveX > 30 && this.data.slideIndex !== -1) {
                this.setData({
                    slideIndex: -1
                });
            }
        }
    },
    // 触摸结束
    touchEnd() {
        // 可以在这里添加回弹逻辑，但我们保持简单，点击删除后再关闭
    },
    // 删除单条记录
    deleteItem(e) {
        const { groupindex, itemindex } = e.currentTarget.dataset;
        wx.showModal({
            title: '确认删除',
            content: '确定要删除这条记录吗？',
            success: (res) => {
                if (res.confirm) {
                    const history = this.data.historyList;
                    let actualIndex = itemindex;
                    if (this.data.useGroupView) {
                        // 分组视图：找到实际的历史记录索引
                        const item = this.data.groupedHistory[groupindex].items[itemindex];
                        actualIndex = history.findIndex(h => h.id === item.id);
                    }
                    // 删除记录
                    history.splice(actualIndex, 1);
                    wx.setStorageSync('couplet_history', history);
                    // 重置滑动状态
                    this.setData({
                        slideIndex: -1
                    });
                    // 重新加载
                    this.loadHistory();
                    wx.showToast({
                        title: '已删除',
                        icon: 'success'
                    });
                }
            }
        });
    },
    // 关闭滑动
    closeSlide() {
        this.setData({
            slideIndex: -1
        });
    },
    formatTime(timestamp) {
        return (0, storage_1.formatTime)(timestamp);
    }
});
