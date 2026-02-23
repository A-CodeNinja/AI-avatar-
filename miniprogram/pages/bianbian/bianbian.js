const app = getApp();

Page({
  data: {
    selectedImage: '',
    selectedStyle: 'wedding',
    isGenerating: false,
    styles: [
      { key: 'wedding', name: '婚纱日记', image: '/images/styles/wedding.png', hot: true },
      { key: 'retro', name: '复古繁华', image: '/images/styles/retro.png', hot: false },
      { key: 'barbie', name: '芭比风', image: '/images/styles/barbie.png', hot: true },
      { key: 'rich', name: '我要暴富', image: '/images/styles/rich.png', hot: false },
      { key: 'crystal', name: '夏日水晶', image: '/images/styles/crystal.png', hot: false },
      { key: 'hkcomic', name: '复古港漫', image: '/images/styles/hkcomic.png', hot: true },
      { key: 'astronaut', name: '宇航员', image: '/images/styles/astronaut.png', hot: false },
      { key: 'leisure', name: '休闲时刻', image: '/images/styles/leisure.png', hot: false },
      { key: 'dopamine', name: '多巴胺', image: '/images/styles/dopamine.png', hot: true },
      { key: 'summer', name: '心动初夏', image: '/images/styles/summer.png', hot: false },
      { key: 'seaside', name: '海边', image: '/images/styles/seaside.png', hot: false },
      { key: 'anime', name: '二次元', image: '/images/styles/anime_bb.png', hot: true },
      { key: 'fantasy', name: '幻想风', image: '/images/styles/fantasy.png', hot: false },
      { key: 'sweet', name: '甜心', image: '/images/styles/sweet.png', hot: false },
      { key: 'cool', name: '酷炫', image: '/images/styles/cool.png', hot: false },
      { key: 'dreamy', name: '梦幻', image: '/images/styles/dreamy.png', hot: true }
    ]
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

  async generateBianbian() {
    if (!this.data.selectedImage) {
      wx.showToast({
        title: '请先选择图片',
        icon: 'none'
      });
      return;
    }

    const points = 15;
    if (app.globalData.userInfo && app.globalData.userInfo.points < points) {
      wx.showModal({
        title: '积分不足',
        content: `生成百变头像需要${points}积分，去获取更多积分？`,
        confirmText: '去获取',
        success: (res) => {
          if (res.confirm) {
            wx.switchTab({
              url: '/pages/points/points'
            });
          }
        }
      });
      return;
    }

    this.setData({ isGenerating: true });
    wx.showLoading({ title: 'AI生成中...' });

    try {
      const uploadRes = await wx.cloud.uploadFile({
        cloudPath: `bianbian/${Date.now()}.png`,
        filePath: this.data.selectedImage
      });

      const generateRes = await wx.cloud.callFunction({
        name: 'generateBianbian',
        data: {
          fileID: uploadRes.fileID,
          styleType: this.data.selectedStyle
        }
      });

      wx.hideLoading();

      if (generateRes.result.code === 0) {
        // 扣除积分
        if (app.globalData.userInfo) {
          app.globalData.userInfo.points -= points;
        }

        wx.navigateTo({
          url: `/pages/result/result?fileID=${generateRes.result.fileID}&type=bianbian`
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
        title: '生成失败，请重试',
        icon: 'none'
      });
    } finally {
      this.setData({ isGenerating: false });
    }
  }
});
