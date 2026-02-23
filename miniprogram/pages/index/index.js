const app = getApp();

Page({
  data: {
    userInfo: null,
    points: 100,
    selectedStyle: 'anime',
    selectedImage: '',
    styles: [
      { key: 'anime', name: '动漫', icon: '/images/styles/anime.png' },
      { key: '3d', name: '3D', icon: '/images/styles/3d.png' },
      { key: 'sketch', name: '素描', icon: '/images/styles/sketch.png' },
      { key: 'watercolor', name: '水彩', icon: '/images/styles/watercolor.png' },
      { key: 'pixel', name: '像素', icon: '/images/styles/pixel.png' },
      { key: 'cartoon', name: '卡通', icon: '/images/styles/cartoon.png' },
      { key: 'realistic', name: '写实', icon: '/images/styles/realistic.png' },
      { key: 'comic', name: '漫画', icon: '/images/styles/comic.png' }
    ],
    isGenerating: false
  },

  onLoad() {
    this.loadUserInfo();
  },

  onShow() {
    this.loadUserInfo();
  },

  loadUserInfo() {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        points: app.globalData.userInfo.points
      });
    }
  },

  selectStyle(e) {
    const style = e.currentTarget.dataset.style;
    this.setData({
      selectedStyle: style
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

  async generateAvatar() {
    if (!this.data.selectedImage) {
      wx.showToast({
        title: '请先选择图片',
        icon: 'none'
      });
      return;
    }

    if (this.data.points < 10) {
      wx.showToast({
        title: '积分不足',
        icon: 'none'
      });
      return;
    }

    this.setData({ isGenerating: true });
    wx.showLoading({ title: '生成中...' });

    try {
      const uploadRes = await wx.cloud.uploadFile({
        cloudPath: `original/${Date.now()}.png`,
        filePath: this.data.selectedImage
      });

      const generateRes = await wx.cloud.callFunction({
        name: 'generateAvatar',
        data: {
          fileID: uploadRes.fileID,
          styleType: this.data.selectedStyle
        }
      });

      wx.hideLoading();

      if (generateRes.result.code === 0) {
        app.getUserInfo();
        wx.navigateTo({
          url: `/pages/result/result?fileID=${generateRes.result.fileID}`
        });
      } else {
        wx.showToast({
          title: generateRes.result.msg || '生成失败',
          icon: 'none'
        });
      }
    } catch (err) {
      wx.hideLoading();
      console.error(err);
      wx.showToast({
        title: '生成失败',
        icon: 'none'
      });
    } finally {
      this.setData({ isGenerating: false });
    }
  }
});
