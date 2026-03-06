const app = getApp();

Page({
  data: {
    isSubmitting: false,
    redirect: '/pages/index/index'
  },

  onLoad(options) {
    if (options && options.redirect) {
      this.setData({ redirect: decodeURIComponent(options.redirect) });
    }
  },

  jumpToRedirect() {
    const tabPages = [
      '/pages/index/index',
      '/pages/material/material',
      '/pages/gallery/gallery',
      '/pages/points/points',
      '/pages/mine/mine'
    ];

    const redirect = this.data.redirect || '/pages/index/index';
    if (tabPages.includes(redirect)) {
      wx.switchTab({ url: redirect });
      return;
    }
    wx.navigateTo({
      url: redirect,
      fail: () => wx.switchTab({ url: '/pages/index/index' })
    });
  },

  async handleWechatLogin() {
    if (this.data.isSubmitting) return;

    this.setData({ isSubmitting: true });
    try {
      const profile = await wx.getUserProfile({
        desc: '用于完善头像制作账户信息'
      });

      const userInfo = profile.userInfo || {};
      const res = await wx.cloud.callFunction({
        name: 'updateUserProfile',
        data: {
          nickName: userInfo.nickName || '',
          avatarUrl: userInfo.avatarUrl || '',
          gender: userInfo.gender || 0,
          city: userInfo.city || '',
          province: userInfo.province || '',
          country: userInfo.country || ''
        }
      });

      if (!res.result || res.result.code !== 0) {
        throw new Error((res.result && res.result.msg) || '登录失败');
      }

      app.getUserInfo((freshUser) => {
        app.globalData.userInfo = freshUser;
      });

      wx.showToast({ title: '登录成功', icon: 'success' });
      setTimeout(() => {
        wx.navigateBack({
          fail: () => {
            this.jumpToRedirect();
          }
        });
      }, 500);
    } catch (err) {
      wx.showToast({
        title: err.message || '登录失败，请重试',
        icon: 'none'
      });
    } finally {
      this.setData({ isSubmitting: false });
    }
  }
});
