// index.ts
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
    // 云函数方式不需要检查 API 配置
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

    this.setData({ loading: true });

    try {
      // 调用云函数
      console.log('调用云函数，参数:', { name, position: this.data.position });
      
      const res = await wx.cloud.callFunction({
        name: 'router',
        data: {
          name: name,
          position: this.data.position
        }
      });

      console.log('云函数返回结果:', res);
      const result = res.result as any;

      if (result.error) {
        console.error('云函数返回错误:', result.error);
        throw new Error(result.error);
      }

      console.log('解析结果:', result);

      this.setData({
        topCouplet: result.upper,
        bottomCouplet: result.lower,
        horizontalScroll: result.horizontal
      });

      console.log('设置数据完成:', this.data);

      // 保存到历史记录
      saveToHistory({
        name: name,
        position: this.data.position,
        upper: result.upper,
        lower: result.lower,
        horizontal: result.horizontal
      });

      wx.showToast({
        title: '生成成功',
        icon: 'success'
      });

    } catch (error: any) {
      console.error('Generate error:', error);
      
      wx.showModal({
        title: '生成失败',
        content: error.message || '生成失败，请重试',
        showCancel: false
      });
    } finally {
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
