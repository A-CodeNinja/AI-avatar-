const app = getApp();

Page({
  data: {
    userInfo: null,
    points: 100,
    selectedStyle: 'anime',
    selectedEthnic: null,
    selectedFrame: null,
    selectedSticker: null,
    selectedImage: '',
    // 基础风格
    styles: [
      { key: 'anime', name: '动漫', icon: '/images/styles/anime.png', hot: true },
      { key: '3d', name: '3D', icon: '/images/styles/3d.png', hot: false },
      { key: 'sketch', name: '素描', icon: '/images/styles/sketch.png', hot: false },
      { key: 'watercolor', name: '水彩', icon: '/images/styles/watercolor.png', hot: true },
      { key: 'pixel', name: '像素', icon: '/images/styles/pixel.png', hot: false },
      { key: 'cartoon', name: '卡通', icon: '/images/styles/cartoon.png', hot: false },
      { key: 'realistic', name: '写实', icon: '/images/styles/realistic.png', hot: true },
      { key: 'comic', name: '漫画', icon: '/images/styles/comic.png', hot: false }
    ],
    // 民族风格（新增）
    ethnicStyles: [
      { key: 'uyghur', name: '维吾尔族', icon: '/images/xj/uyghur.png', desc: '艾德莱斯绸' },
      { key: 'kazakh', name: '哈萨克族', icon: '/images/xj/kazakh.png', desc: '羊角纹' },
      { key: 'mongol', name: '蒙古族', icon: '/images/xj/mongol.png', desc: '云纹' },
      { key: 'kirgiz', name: '柯尔克孜族', icon: '/images/xj/kirgiz.png', desc: '毡绣' },
      { key: 'tajik', name: '塔吉克族', icon: '/images/xj/tajik.png', desc: '刺绣' }
    ],
    // 热门头像框
    hotFrames: [
      { id: 1, name: '圣诞帽', image: '/images/frames/christmas.png', category: 'christmas' },
      { id: 2, name: '皇冠', image: '/images/frames/crown.png', category: 'crown' },
      { id: 3, name: '国旗框', image: '/images/frames/flag.png', category: 'national' },
      { id: 4, name: '中秋', image: '/images/frames/midautumn.png', category: 'festival' },
      { id: 5, name: '游戏', image: '/images/frames/game.png', category: 'game' },
      { id: 6, name: '眼镜', image: '/images/frames/glasses.png', category: 'glasses' }
    ],
    // 热门贴纸
    hotStickers: [
      { id: 1, name: '圣诞树', image: '/images/stickers/christmas_tree.png', category: 'christmas' },
      { id: 2, name: '国旗', image: '/images/stickers/flag.png', category: 'national' },
      { id: 3, name: '爱心', image: '/images/stickers/heart.png', category: 'love' },
      { id: 4, name: '烟花', image: '/images/stickers/firework.png', category: 'festival' },
      { id: 5, name: '蛋糕', image: '/images/stickers/cake.png', category: 'birthday' },
      { id: 6, name: '星星', image: '/images/stickers/star.png', category: 'decoration' }
    ],
    isGenerating: false,
    // 生成选项
    quality: 'standard'
  },

  onLoad() {
    this.loadUserInfo();
    this.getRandomItems();
  },

  onShow() {
    this.loadUserInfo();
  },

  loadUserInfo() {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        points: app.globalData.userInfo.points || 100
      });
    }
  },

  getRandomItems() {
    // 随机选择热门头像框和贴纸
    const allFrames = [
      { id: 1, name: '圣诞帽', image: '/images/frames/christmas.png', category: 'christmas' },
      { id: 2, name: '皇冠', image: '/images/frames/crown.png', category: 'crown' },
      { id: 3, name: '国旗框', image: '/images/frames/flag.png', category: 'national' },
      { id: 4, name: '中秋', image: '/images/frames/midautumn.png', category: 'festival' },
      { id: 5, name: '游戏', image: '/images/frames/game.png', category: 'game' },
      { id: 6, name: '眼镜', image: '/images/frames/glasses.png', category: 'glasses' },
      { id: 7, name: '帽子', image: '/images/frames/hat.png', category: 'hat' },
      { id: 8, name: '夹子', image: '/images/frames/clip.png', category: 'clip' }
    ];

    const allStickers = [
      { id: 1, name: '圣诞树', image: '/images/stickers/christmas_tree.png', category: 'christmas' },
      { id: 2, name: '国旗', image: '/images/stickers/flag.png', category: 'national' },
      { id: 3, name: '爱心', image: '/images/stickers/heart.png', category: 'love' },
      { id: 4, name: '烟花', image: '/images/stickers/firework.png', category: 'festival' },
      { id: 5, name: '蛋糕', image: '/images/stickers/cake.png', category: 'birthday' },
      { id: 6, name: '星星', image: '/images/stickers/star.png', category: 'decoration' },
      { id: 7, name: '花朵', image: '/images/stickers/flower.png', category: 'decoration' },
      { id: 8, name: '彩虹', image: '/images/stickers/rainbow.png', category: 'weather' }
    ];

    // 随机选择6个
    this.setData({
      hotFrames: this.shuffleArray(allFrames).slice(0, 6),
      hotStickers: this.shuffleArray(allStickers).slice(0, 6)
    });
  },

  shuffleArray(array) {
    let currentIndex = array.length;
    let randomIndex;
    while (currentIndex != 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
  },

  selectStyle(e) {
    const style = e.currentTarget.dataset.style;
    this.setData({
      selectedStyle: style
    });
  },

  selectEthnic(e) {
    const ethnic = e.currentTarget.dataset.ethnic;
    // 取消选择或切换选择
    this.setData({
      selectedEthnic: this.data.selectedEthnic === ethnic ? null : ethnic
    });
  },

  selectFrame(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({
      selectedFrame: this.data.selectedFrame === id ? null : id
    });
  },

  selectSticker(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({
      selectedSticker: this.data.selectedSticker === id ? null : id
    });
  },

  chooseImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        this.setData({
          selectedImage: tempFilePath
        });
      }
    });
  },

  goToPoints() {
    wx.switchTab({
      url: '/pages/points/points'
    });
  },

  goToInvite() {
    wx.navigateTo({
      url: '/pages/invite/invite'
    });
  },

  goToFrames() {
    wx.navigateTo({
      url: '/pages/material/material?type=frame'
    });
  },

  goToStickers() {
    wx.navigateTo({
      url: '/pages/material/material?type=sticker'
    });
  },

  goToBianbian() {
    wx.navigateTo({
      url: '/pages/bianbian/bianbian'
    });
  },

  watchAd() {
    wx.showModal({
      title: '观看广告',
      content: '观看激励广告可获得10积分',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '广告加载中...',
            icon: 'loading'
          });
          // 实际项目中需要接入广告SDK
          setTimeout(() => {
            this.setData({
              points: this.data.points + 10
            });
            wx.showToast({
              title: '获得10积分',
              icon: 'success'
            });
          }, 2000);
        }
      }
    });
  },

  async generateAvatar() {
    if (!this.data.selectedImage) {
      wx.showToast({
        title: '请先选择图片',
        icon: 'none'
      });
      return;
    }

    if (this.data.points < 10) {
      wx.showModal({
        title: '积分不足',
        content: '生成头像需要10积分，去获取更多积分？',
        confirmText: '去获取',
        success: (res) => {
          if (res.confirm) {
            this.goToPoints();
          }
        }
      });
      return;
    }

    this.setData({ isGenerating: true });
    wx.showLoading({
      title: 'AI生成中...',
      mask: true
    });

    try {
      // 上传原始图片
      const uploadRes = await wx.cloud.uploadFile({
        cloudPath: `original/${Date.now()}.png`,
        filePath: this.data.selectedImage
      });

      // 调用云函数生成头像
      const generateRes = await wx.cloud.callFunction({
        name: 'generateAvatar',
        data: {
          fileID: uploadRes.fileID,
          styleType: this.data.selectedStyle,
          ethnicType: this.data.selectedEthnic,
          quality: this.data.quality
        }
      });

      wx.hideLoading();

      if (generateRes.result.code === 0) {
        // 扣除积分并更新显示
        this.setData({
          points: this.data.points - 10
        });

        // 跳转到结果页
        wx.navigateTo({
          url: `/pages/result/result?fileID=${generateRes.result.fileID}&type=ai&style=${this.data.selectedStyle}&ethnic=${this.data.selectedEthnic || 'none'}`
        });
      } else if (generateRes.result.code === -2) {
        wx.showModal({
          title: '积分不足',
          content: '生成头像需要10积分',
          showCancel: false
        });
      } else {
        wx.showToast({
          title: generateRes.result.msg || '生成失败',
          icon: 'none',
          duration: 3000
        });
      }
    } catch (err) {
      wx.hideLoading();
      console.error('生成失败', err);
      wx.showModal({
        title: '生成失败',
        content: 'AI服务暂时不可用，请稍后重试',
        showCancel: false
      });
    } finally {
      this.setData({ isGenerating: false });
    }
  }
});
