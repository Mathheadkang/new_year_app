// pages/history/history.ts
import { getHistory, clearHistory, formatTime, CoupletHistory } from '../../utils/storage';

Page({
  data: {
    historyList: [] as CoupletHistory[]
  },

  onLoad() {
    this.loadHistory();
  },

  onShow() {
    // 从其他页面返回时重新加载历史
    this.loadHistory();
  },

  loadHistory() {
    const history = getHistory();
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
          clearHistory();
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

  shareItem(e: any) {
    const { index } = e.currentTarget.dataset;
    // TODO: 实现分享功能
    console.log('分享对联', index);
    
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

  formatTime(timestamp: number): string {
    return formatTime(timestamp);
  }
})
