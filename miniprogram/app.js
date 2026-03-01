App({
  onLaunch: function () {
    this.globalData = {
      env: "cloud1-6g0jewt1e646e21b",
      userInfo: null,
      points: 100,
      isCloudReady: false,
      userInfoReadyCallbacks: [] // 等待用户信息就绪的回调队列
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

  /**
   * 获取用户信息，支持回调（页面可传入 cb 等待数据就绪）
   * 用法：app.getUserInfo(userInfo => { ... })
   */
  getUserInfo: function(cb) {
    const that = this;

    // 如果已有数据，直接回调
    if (this.globalData.userInfo) {
      cb && cb(this.globalData.userInfo);
      return;
    }

    // 有回调则加入等待队列
    if (cb) {
      this.globalData.userInfoReadyCallbacks.push(cb);
    }

    // 避免重复请求
    if (this._gettingUserInfo) return;
    this._gettingUserInfo = true;

    if (!this.globalData.isCloudReady) {
      console.log("云开发环境未就绪，跳过获取用户信息");
      this._gettingUserInfo = false;
      return;
    }

    wx.cloud.callFunction({
      name: 'getUserInfo',
      success: res => {
        that._gettingUserInfo = false;
        if (res.result && res.result.code === 0) {
          that.globalData.userInfo = res.result.data;
          that.globalData.points = res.result.data.points;
          console.log("用户信息获取成功");
          // 执行所有等待中的回调
          that.globalData.userInfoReadyCallbacks.forEach(fn => fn(res.result.data));
          that.globalData.userInfoReadyCallbacks = [];
        }
      },
      fail: err => {
        that._gettingUserInfo = false;
        console.warn('获取用户信息失败（云函数可能未部署）', err);
      }
    });
  }
});
