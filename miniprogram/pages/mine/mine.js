const app = getApp();

Page({
  data: {
    userInfo: null,
    totalGenerate: 0,
    menuList: [
      { icon: '/images/icons/info.png', title: '关于我们', path: '' },
      { icon: '/images/icons/info.png', title: '常见问题', path: '' },
      { icon: '/images/icons/feedback.png', title: '意见反馈', path: '' },
      { icon: '/images/icons/privacy.png', title: '隐私政策', path: '' },
      { icon: '/images/icons/setting.svg', title: '设置', path: '' }
    ]
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
        totalGenerate: app.globalData.userInfo.totalGenerate || 0
      });
    }
  },

  handleMenu(e) {
    const index = e.currentTarget.dataset.index;
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  }
});
