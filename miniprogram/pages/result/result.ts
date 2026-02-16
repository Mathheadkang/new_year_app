// pages/result/result.ts
import { saveToHistory } from '../../utils/storage';

type HidePosition = 'head' | 'middle' | 'tail';

interface CoupletData {
  name: string;
  position: HidePosition;
  upper: string;
  lower: string;
  horizontal: string;
}

Page({
  data: {
    name: '',
    position: 'head' as HidePosition,
    upper: '',
    lower: '',
    horizontal: '',
    loading: false,
    showShare: false,
    isShared: false  // 是否是分享页面
  },

  onLoad(options: any) {
    // 检测是否是分享页面
    const isShared = options.shared === 'true';
    this.setData({ isShared });

    // 从页面参数获取数据
    if (options.data) {
      try {
        const data: CoupletData = JSON.parse(decodeURIComponent(options.data));
        this.setData({
          name: data.name,
          position: data.position,
          upper: data.upper,
          lower: data.lower,
          horizontal: data.horizontal
        });
        
        // 只有不是分享页面且不是从历史记录打开的才保存到历史
        if (!isShared && !options.fromHistory) {
          saveToHistory({
            name: data.name,
            position: data.position,
            upper: data.upper,
            lower: data.lower,
            horizontal: data.horizontal
          });
        }
      } catch (error) {
        console.error('解析数据失败:', error);
        wx.showToast({
          title: '数据加载失败',
          icon: 'none'
        });
      }
    }
  },

  // 返回首页
  goBack() {
    // 计算需要回退的层数（回到页面栈的第一个页面）
    const pages = getCurrentPages();
    const delta = pages.length - 1;
    
    if (delta > 0) {
      wx.navigateBack({
        delta: delta
      });
    } else {
      // 如果是从分享打开的，页面栈只有当前页面，使用reLaunch跳转到首页
      wx.reLaunch({
        url: '/pages/index/index'
      });
    }
  },

  // 重新生成（回到首页）
  regenerate() {
    const pages = getCurrentPages();
    const delta = pages.length - 1;
    
    if (delta > 0) {
      wx.navigateBack({
        delta: delta
      });
    } else {
      // 如果是从分享打开的，页面栈只有当前页面，使用reLaunch跳转到首页
      wx.reLaunch({
        url: '/pages/index/index'
      });
    }
  },

  // 分享页面：跳转到首页生成春联
  goToGenerate() {
    wx.reLaunch({
      url: '/pages/index/index'
    });
  },

  // 查看历史
  goToHistory() {
    wx.navigateTo({
      url: '/pages/history/history'
    });
  },

  // 显示分享菜单
  showShareMenu() {
    this.setData({ showShare: true });
  },

  // 隐藏分享菜单
  hideShareMenu() {
    this.setData({ showShare: false });
  },

  // 阻止冒泡
  stopPropagation() {},

  // 保存到相册
  async saveToAlbum() {
    wx.showToast({
      title: '生成中...',
      icon: 'loading',
      duration: 10000
    });

    try {
      // TODO: 这里可以添加小程序码到图片中
      const imagePath = await this.generateCoupletImage();
      
      await wx.saveImageToPhotosAlbum({
        filePath: imagePath
      });

      wx.hideToast();
      wx.showModal({
        title: '保存成功',
        content: '图片已保存到相册，可以分享到朋友圈了',
        confirmText: '知道了',
        showCancel: false
      });

      this.hideShareMenu();
    } catch (error: any) {
      wx.hideToast();
      console.error('保存失败:', error);
      if (error.errMsg && error.errMsg.includes('auth deny')) {
        wx.showModal({
          title: '需要相册权限',
          content: '请在设置中开启相册权限',
          confirmText: '去设置',
          success: (res) => {
            if (res.confirm) {
              wx.openSetting();
            }
          }
        });
      } else {
        wx.showToast({
          title: '保存失败',
          icon: 'none'
        });
      }
    }
  },

  // 生成春联图片
  generateCoupletImage(): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        // 先获取小程序码
        console.log('开始获取小程序码...');
        const qrCodePath = await this.getQRCode();
        console.log('小程序码路径:', qrCodePath);
        
        const query = wx.createSelectorQuery();
        query.select('#coupletCanvas')
          .fields({ node: true, size: true })
          .exec((res) => {
            if (!res || !res[0]) {
              reject(new Error('Canvas not found'));
              return;
            }

            const canvas = res[0].node;
            const ctx = canvas.getContext('2d');
            const dpr = wx.getSystemInfoSync().pixelRatio;
            
            // 设置画布尺寸
            canvas.width = 375 * dpr;
            canvas.height = 600 * dpr;
            ctx.scale(dpr, dpr);

            // 绘制背景渐变
            const gradient = ctx.createLinearGradient(0, 0, 375, 600);
            gradient.addColorStop(0, '#ff6b6b');
            gradient.addColorStop(1, '#feca57');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 375, 600);

            // 绘制横批背景（红色渐变，圆角）
            const horizontalWidth = 200;
            const horizontalX = (375 - horizontalWidth) / 2;
            const horizontalGradient = ctx.createLinearGradient(horizontalX, 75, horizontalX + horizontalWidth, 135);
            horizontalGradient.addColorStop(0, '#c41d1d');
            horizontalGradient.addColorStop(1, '#ff5252');
            ctx.fillStyle = horizontalGradient;
            this.drawRoundRect(ctx, horizontalX, 75, horizontalWidth, 60, 8);
            
            // 绘制横批文字（金色，带字间距）
            ctx.fillStyle = '#ffd700';
            ctx.font = 'bold 30px sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            
            // 手动绘制每个字符以实现 letter-spacing
            const horizontalChars = this.data.horizontal.split('');
            const letterSpacing = 8; // 16rpx 转换为约 8px
            const totalWidth = horizontalChars.reduce((sum, char) => {
              return sum + ctx.measureText(char).width + letterSpacing;
            }, -letterSpacing); // 最后一个字符后不需要间距
            
            let startX = (375 - totalWidth) / 2;
            horizontalChars.forEach(char => {
              ctx.fillText(char, startX, 105);
              startX += ctx.measureText(char).width + letterSpacing;
            });

            // 绘制对联背景（右侧 - 上联，带渐变和圆角）
            const upperGradient = ctx.createLinearGradient(250, 160, 325, 510);
            upperGradient.addColorStop(0, '#c41d1d');
            upperGradient.addColorStop(1, '#ff5252');
            ctx.fillStyle = upperGradient;
            // 绘制圆角矩形
            this.drawRoundRect(ctx, 250, 160, 75, 350, 8);
            
            // 绘制对联背景（左侧 - 下联，带渐变和圆角）
            const lowerGradient = ctx.createLinearGradient(50, 160, 125, 510);
            lowerGradient.addColorStop(0, '#c41d1d');
            lowerGradient.addColorStop(1, '#ff5252');
            ctx.fillStyle = lowerGradient;
            // 绘制圆角矩形
            this.drawRoundRect(ctx, 50, 160, 75, 350, 8);

            // 绘制上联文字（竖排，从右到左，金色）
            ctx.fillStyle = '#ffd700';
            ctx.font = 'bold 24px sans-serif';
            ctx.textAlign = 'center';
            const upperChars = this.data.upper.split('');
            upperChars.forEach((char, index) => {
              ctx.fillText(char, 287.5, 190 + index * 45);
            });

            // 绘制下联文字（竖排，金色）
            const lowerChars = this.data.lower.split('');
            lowerChars.forEach((char, index) => {
              ctx.fillText(char, 87.5, 190 + index * 45);
            });

            // 绘制小程序码
            if (qrCodePath) {
              console.log('开始绘制小程序码...');
              const qrCode = canvas.createImage();
              qrCode.onload = () => {
                console.log('小程序码图片加载成功');
                // 直接绘制小程序码（透明背景）
                const qrSize = 60;
                const qrX = 375 - qrSize - 15;
                const qrY = 600 - qrSize - 15;
                
                ctx.drawImage(qrCode, qrX, qrY, qrSize, qrSize);
                console.log('小程序码绘制完成');
                
                // 导出图片
                this.exportCanvasImage(canvas, resolve, reject);
              };
              qrCode.onerror = (err: any) => {
                console.error('小程序码加载失败:', err);
                // 即使小程序码加载失败，也导出图片
                this.exportCanvasImage(canvas, resolve, reject);
              };
              qrCode.src = qrCodePath;
            } else {
              console.log('没有获取到小程序码，直接导出图片');
              // 没有小程序码，直接导出
              this.exportCanvasImage(canvas, resolve, reject);
            }
          });
      } catch (error) {
        reject(error);
      }
    });
  },

  // 绘制圆角矩形
  drawRoundRect(ctx: any, x: number, y: number, width: number, height: number, radius: number) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
  },

  // 导出 Canvas 图片
  exportCanvasImage(canvas: any, resolve: Function, reject: Function) {
    setTimeout(() => {
      wx.canvasToTempFilePath({
        canvas,
        success: (res) => {
          resolve(res.tempFilePath);
        },
        fail: (err) => {
          reject(err);
        }
      });
    }, 100);
  },

  // 获取小程序码
  async getQRCode(): Promise<string> {
    try {
      console.log('开始调用云函数生成小程序码...');
      const result: any = await wx.cloud.callFunction({
        name: 'router',
        data: {
          action: 'getQRCode',
          page: 'pages/index/index',
          scene: 'share'
        }
      });

      console.log('云函数返回结果:', result);

      if (result.result?.success && result.result?.buffer) {
        console.log('获取到buffer，大小:', result.result.buffer.byteLength || result.result.buffer.length);
        // 将 buffer 转为临时文件
        const fs = wx.getFileSystemManager();
        const filePath = `${wx.env.USER_DATA_PATH}/qrcode_${Date.now()}.png`;
        
        fs.writeFileSync(filePath, result.result.buffer, 'binary');
        console.log('小程序码保存成功:', filePath);
        return filePath;
      }
      
      console.log('云函数返回数据不完整');
      return '';
    } catch (error) {
      console.error('获取小程序码失败:', error);
      return '';
    }
  },

  // 分享给好友（微信原生分享）
  onShareAppMessage() {
    // 如果是分享页面，分享主页而不是当前页面
    if (this.data.isShared) {
      return {
        title: '2026马年春联生成器',
        path: '/pages/index/index',
        imageUrl: '/images/share/share_pic.png'
      };
    }
    
    // 正常页面，分享当前春联
    return {
      title: `「${this.data.name}」的2026马年专属春联`,
      path: `/pages/result/result?shared=true&data=${encodeURIComponent(JSON.stringify({
        name: this.data.name,
        position: this.data.position,
        upper: this.data.upper,
        lower: this.data.lower,
        horizontal: this.data.horizontal
      }))}`,
      imageUrl: '' // 可以设置自定义分享图片
    };
  }
})
