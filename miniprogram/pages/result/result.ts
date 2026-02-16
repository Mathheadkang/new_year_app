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
          .exec(async (res) => {
            if (!res || !res[0]) {
              reject(new Error('Canvas not found'));
              return;
            }

            const canvas = res[0].node;
            const ctx = canvas.getContext('2d');
            const dpr = wx.getSystemInfoSync().pixelRatio;
            
            // 设置画布尺寸（调整为更宽、更矮的比例）
            const canvasWidth = 500;
            const canvasHeight = 700;
            canvas.width = canvasWidth * dpr;
            canvas.height = canvasHeight * dpr;
            ctx.scale(dpr, dpr);

            // 绘制渐变红色背景
            const gradient = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
            gradient.addColorStop(0, '#ff6b6b');
            gradient.addColorStop(1, '#feca57');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);

            try {
              // 加载并绘制背景图片和文字
              await this.drawBackgroundImages(canvas, ctx, canvasWidth, canvasHeight);
              
              // 绘制文字
              this.drawCoupletText(ctx);
              
              // 绘制小程序码
              if (qrCodePath) {
                await this.drawQRCode(canvas, ctx, qrCodePath, canvasWidth, canvasHeight);
              }
              
              // 导出图片
              this.exportCanvasImage(canvas, resolve, reject);
            } catch (error) {
              console.error('绘制图片失败:', error);
              reject(error);
            }
          });
      } catch (error) {
        reject(error);
      }
    });
  },

  // 绘制背景图片
  drawBackgroundImages(canvas: any, ctx: any, _canvasWidth: number, _canvasHeight: number): Promise<void> {
    return new Promise((resolve) => {
      let loadedCount = 0;
      const totalImages = 3;
      
      const checkAllLoaded = () => {
        loadedCount++;
        if (loadedCount === totalImages) {
          resolve();
        }
      };

      // Canvas图片尺寸（与页面显示独立）
      // 调整为更宽、更矮的比例：500x700
      
      const screenWidth = 500;
      
      // 横批：居中显示，根据top.png原图比例(647x166≈3.9:1)调整
      // 高度86px，宽度335px
      const horizontalWidth = 335;
      const horizontalHeight = 86;
      const horizontalX = (screenWidth - horizontalWidth) / 2;
      const horizontalY = 40; // 标题下方
      
      // 春联：宽150px，高度530px，gap 60px
      const coupletWidth = 160;
      const coupletHeight = 530;
      const coupletGap = 60;
      const coupletY = horizontalY + horizontalHeight + 15; // 横批下方15px
      
      // 计算春联X位置（两个春联居中）
      const totalCoupletWidth = coupletWidth * 2 + coupletGap;
      const coupletStartX = (screenWidth - totalCoupletWidth) / 2;
      const leftCoupletX = coupletStartX;
      const rightCoupletX = coupletStartX + coupletWidth + coupletGap;
      
      // 加载横批背景（top.png）
      const topImage = canvas.createImage();
      topImage.onload = () => {
        ctx.drawImage(topImage, horizontalX, horizontalY, horizontalWidth, horizontalHeight);
        checkAllLoaded();
      };
      topImage.onerror = () => {
        console.error('横批背景加载失败');
        checkAllLoaded();
      };
      topImage.src = '/images/top.png';

      // 加载左春联背景（left.png）- 下联
      const leftImage = canvas.createImage();
      leftImage.onload = () => {
        ctx.drawImage(leftImage, leftCoupletX, coupletY, coupletWidth, coupletHeight);
        checkAllLoaded();
      };
      leftImage.onerror = () => {
        console.error('左春联背景加载失败');
        checkAllLoaded();
      };
      leftImage.src = '/images/left.png';

      // 加载右春联背景（right.png）- 上联
      const rightImage = canvas.createImage();
      rightImage.onload = () => {
        ctx.drawImage(rightImage, rightCoupletX, coupletY, coupletWidth, coupletHeight);
        checkAllLoaded();
      };
      rightImage.onerror = () => {
        console.error('右春联背景加载失败');
        checkAllLoaded();
      };
      rightImage.src = '/images/right.png';
    });
  },

  // 绘制春联文字
  drawCoupletText(ctx: any) {
    const screenWidth = 500;
    
    // 横批尺寸和位置
    // horizontalWidth = 335px, 由背景图片决定
    const horizontalHeight = 86;
    const horizontalY = 40;
    
    // 春联尺寸和位置
    const coupletWidth = 160;
    // coupletHeight = 530px
    const coupletGap = 60;
    const coupletY = horizontalY + horizontalHeight + 15;
    
    const totalCoupletWidth = coupletWidth * 2 + coupletGap;
    const coupletStartX = (screenWidth - totalCoupletWidth) / 2;
    const leftCoupletX = coupletStartX;
    const rightCoupletX = coupletStartX + coupletWidth + coupletGap;
    
    // 横批文字（64rpx = 32px, letter-spacing 24rpx = 12px）
    // 直接在页面宽度上居中，不考虑背景图片位置
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const horizontalChars = this.data.horizontal.split('');
    const letterSpacing = 12;
    const totalWidth = horizontalChars.reduce((sum, char) => {
      return sum + ctx.measureText(char).width + letterSpacing;
    }, -letterSpacing);
    
    // 在页面宽度上居中，手动向右偏移8px以修正视觉居中
    let startX = (screenWidth - totalWidth) / 2 + 15;
    const horizontalCenterY = horizontalY + horizontalHeight / 2;
    
    horizontalChars.forEach(char => {
      ctx.fillText(char, startX, horizontalCenterY);
      startX += ctx.measureText(char).width + letterSpacing;
    });

    // 春联文字（64rpx = 32px, letter-spacing 24rpx = 12px, line-height 1.7）
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const lineHeight = 32 * 1.7; // font-size * line-height
    const textPaddingTop = 50; // 增加上方padding，让文字起始位置更低
    
    // 下联文字（左侧）
    const lowerChars = this.data.lower.split('');
    const leftCenterX = leftCoupletX + coupletWidth / 2;
    const textStartY = coupletY + textPaddingTop;
    
    lowerChars.forEach((char, index) => {
      ctx.fillText(char, leftCenterX, textStartY + index * lineHeight);
    });

    // 上联文字（右侧）
    const upperChars = this.data.upper.split('');
    const rightCenterX = rightCoupletX + coupletWidth / 2;
    
    upperChars.forEach((char, index) => {
      ctx.fillText(char, rightCenterX, textStartY + index * lineHeight);
    });
  },

  // 绘制小程序码
  drawQRCode(canvas: any, ctx: any, qrCodePath: string, canvasWidth: number, canvasHeight: number): Promise<void> {
    return new Promise((resolve) => {
      const qrCode = canvas.createImage();
      qrCode.onload = () => {
        const qrSize = 60;
        const qrX = canvasWidth - qrSize - 15;
        const qrY = canvasHeight - qrSize - 15;
        
        ctx.drawImage(qrCode, qrX, qrY, qrSize, qrSize);
        resolve();
      };
      qrCode.onerror = () => {
        console.error('小程序码加载失败');
        resolve(); // 即使失败也继续
      };
      qrCode.src = qrCodePath;
    });
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
  },

  // 分享到朋友圈
  onShareTimeline() {
    // 无论是自己的还是别人分享的，都分享当前页面的春联
    return {
      title: `看看我的马年春联`,
      query: `shared=true&data=${encodeURIComponent(JSON.stringify({
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
