Page({
  data: {
    fileID: '',
    tempFilePath: '',
    selectedFrame: '',
    frames: [
      { id: 1, name: '新疆风格1', path: '/images/frames/xj_frame_1.png' },
      { id: 2, name: '新疆风格2', path: '/images/frames/xj_frame_2.png' },
      { id: 3, name: '新疆风格3', path: '/images/frames/xj_frame_3.png' },
      { id: 4, name: '新疆风格4', path: '/images/frames/xj_frame_4.png' },
      { id: 5, name: '新疆风格5', path: '/images/frames/xj_frame_5.png' }
    ]
  },

  onLoad(options) {
    if (options.fileID) {
      this.setData({ fileID: options.fileID });
      this.downloadImage();
    }
  },

  async downloadImage() {
    wx.showLoading({ title: '加载中...' });
    try {
      const res = await wx.cloud.downloadFile({
        fileID: this.data.fileID
      });
      this.setData({
        tempFilePath: res.tempFilePath
      });
    } catch (err) {
      console.error(err);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  },

  selectFrame(e) {
    const frame = e.currentTarget.dataset.frame;
    this.setData({
      selectedFrame: frame === this.data.selectedFrame ? '' : frame
    });
  },

  saveImage() {
    if (!this.data.tempFilePath) {
      wx.showToast({
        title: '请等待图片加载',
        icon: 'none'
      });
      return;
    }

    wx.saveImageToPhotosAlbum({
      filePath: this.data.tempFilePath,
      success: () => {
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        });
      },
      fail: (err) => {
        console.error(err);
        wx.showToast({
          title: '保存失败',
          icon: 'none'
        });
      }
    });
  },

  shareImage() {
    wx.showToast({
      title: '请截图分享',
      icon: 'none'
    });
  },

  regenerate() {
    wx.navigateBack();
  },

  onShareAppMessage() {
    return {
      title: 'AI头像生成',
      path: '/pages/index/index'
    };
  }
});
