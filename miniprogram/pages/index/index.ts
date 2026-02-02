// index.ts
import { API_ENDPOINTS, validateApiConfig } from '../../utils/config';
import { saveToHistory } from '../../utils/storage';

type HidePosition = 'head' | 'middle' | 'tail';

Page({
  data: {
    name: '',
    position: 'head' as HidePosition,
    topCouplet: '',
    bottomCouplet: '',
    horizontalScroll: '',
    loading: false,
    positions: [
      { value: 'head', label: '藏头', desc: '名字藏在开头' },
      { value: 'middle', label: '藏中', desc: '名字藏在中间' },
      { value: 'tail', label: '藏尾', desc: '名字藏在末尾' }
    ]
  },

  onLoad() {
    // 检查 API 配置
    if (!validateApiConfig()) {
      wx.showModal({
        title: '提示',
        content: '请先在 utils/config.ts 中配置 Vercel 部署地址',
        showCancel: false
      });
    }
  },

  onNameInput(e: any) {
    this.setData({
      name: e.detail.value
    })
  },

  selectPosition(e: any) {
    const { position } = e.currentTarget.dataset;
    this.setData({
      position: position as HidePosition
    });
  },

  async generateCouplet() {
    const name = this.data.name.trim();
    
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

    // 验证 API 配置
    if (!validateApiConfig()) {
      wx.showModal({
        title: '配置错误',
        content: '请先在 utils/config.ts 中配置 Vercel 部署地址',
        showCancel: false
      });
      return;
    }

    this.setData({ loading: true });

    try {
      wx.request({
        url: API_ENDPOINTS.generate,
        method: 'POST',
        data: {
          name: name,
          position: this.data.position
        },
        header: {
          'content-type': 'application/json'
        },
        success: (res) => {
          if (res.statusCode === 200) {
            const data = res.data as any;
            
            this.setData({
              topCouplet: data.upper,
              bottomCouplet: data.lower,
              horizontalScroll: data.horizontal
            });

            // 保存到历史记录
            saveToHistory({
              name: name,
              position: this.data.position,
              upper: data.upper,
              lower: data.lower,
              horizontal: data.horizontal
            });

            wx.showToast({
              title: '生成成功',
              icon: 'success'
            });
          } else {
            throw new Error('API returned error status');
          }
        },
        fail: (error) => {
          console.error('Request failed:', error);
          
          let errorMsg = '生成失败，请重试';
          
          // 判断是否是网络错误
          if (error.errMsg && error.errMsg.includes('request:fail')) {
            errorMsg = '网络请求失败，请检查：\n1. 网络连接\n2. 服务器域名是否已配置';
          }
          
          wx.showModal({
            title: '生成失败',
            content: errorMsg,
            showCancel: false
          });
        },
        complete: () => {
          this.setData({ loading: false });
        }
      });
    } catch (error: any) {
      console.error('Generate error:', error);
      wx.showModal({
        title: '生成失败',
        content: '发生未知错误，请重试',
        showCancel: false
      });
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
  }
})
