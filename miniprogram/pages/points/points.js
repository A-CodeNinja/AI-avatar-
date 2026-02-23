const app = getApp();

function formatTime(timestamp) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hour}:${minute}`;
}

Page({
  data: {
    userInfo: null,
    points: 100,
    pointsLog: []
  },

  onLoad() {
    this.loadUserInfo();
    this.loadPointsLog();
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

  async loadPointsLog() {
    try {
      const res = await wx.cloud.database().collection('points_log')
        .where({
          _openid: '{openid}'
        })
        .orderBy('createTime', 'desc')
        .limit(20)
        .get();

      const logs = (res.data || []).map(item => ({
        ...item,
        formatTime: formatTime(item.createTime)
      }));

      this.setData({
        pointsLog: logs
      });
    } catch (err) {
      console.error('加载积分记录失败', err);
    }
  },

  async handleSignin() {
    wx.showLoading({ title: '签到中...' });
    try {
      const res = await wx.cloud.callFunction({
        name: 'updatePoints',
        data: { type: 'signin' }
      });

      wx.hideLoading();

      if (res.result.code === 0) {
        wx.showToast({
          title: `签到成功，+${res.result.points}积分`,
          icon: 'success'
        });
        app.getUserInfo();
        this.loadUserInfo();
        this.loadPointsLog();
      } else {
        wx.showToast({
          title: res.result.msg || '签到失败',
          icon: 'none'
        });
      }
    } catch (err) {
      wx.hideLoading();
      console.error(err);
      wx.showToast({
        title: '签到失败',
        icon: 'none'
      });
    }
  },

  handleWatchAd() {
    wx.showToast({
      title: '请在微信开发者工具中测试广告',
      icon: 'none'
    });
  },

  handleShare() {
    wx.showToast({
      title: '请点击右上角分享',
      icon: 'none'
    });
  },

  onShareAppMessage() {
    return {
      title: 'AI头像生成',
      path: '/pages/index/index'
    };
  }
});
