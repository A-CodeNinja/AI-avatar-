App({
  onLaunch: function () {
    this.globalData = {
      env: "cloud1-6g0jewt1e646e21b",
      userInfo: null,
      points: 100,
      isCloudReady: false
    };

    if (!wx.cloud) {
      console.error("请使用 2.2.3 或以上的基础库以使用云能力");
    } else {
      if (this.globalData.env) {
        wx.cloud.init({
          env: this.globalData.env,
          traceUser: true,
        });
        this.globalData.isCloudReady = true;
        this.getUserInfo();
      } else {
        console.warn("云环境ID未配置，请先在 app.js 中配置 env");
      }
    }
  },

  getUserInfo: function() {
    const that = this;
    
    if (!this.globalData.isCloudReady) {
      console.log("云开发环境未就绪，跳过获取用户信息");
      return;
    }
    
    wx.cloud.callFunction({
      name: 'getUserInfo',
      success: res => {
        if (res.result && res.result.code === 0) {
          that.globalData.userInfo = res.result.data;
          that.globalData.points = res.result.data.points;
          console.log("用户信息获取成功");
        }
      },
      fail: err => {
        console.warn('获取用户信息失败（云函数可能未部署）', err);
      }
    });
  }
});
