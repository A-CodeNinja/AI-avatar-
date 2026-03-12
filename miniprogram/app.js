App({
  onLaunch: function () {
    this.globalData = {
      env: "cloud1-6g0jewt1e646e21b",
      userInfo: null,
      points: 100,
      isCloudReady: false,
      userInfoReadyCallbacks: []
    };

    this.initCloud();
  },

  initCloud: function() {
    const that = this;
    
    if (!wx.cloud) {
      console.error("请使用 2.2.3 或以上的基础库以使用云能力");
      return;
    }

    if (!this.globalData.env) {
      console.warn("云环境ID未配置，请先在 app.js 中配置 env");
      return;
    }

    try {
      wx.cloud.init({
        env: this.globalData.env,
        traceUser: true,
      });
      
      this.globalData.isCloudReady = true;
      console.log("云开发初始化成功，环境:", this.globalData.env);
      
      this.getUserInfo();
    } catch (err) {
      console.error("云开发初始化失败:", err);
    }
  },

  getUserInfo: function(cb) {
    const that = this;

    if (this.globalData.userInfo) {
      cb && cb(this.globalData.userInfo);
      return;
    }

    if (cb) {
      this.globalData.userInfoReadyCallbacks.push(cb);
    }

    if (this._gettingUserInfo) return;
    this._gettingUserInfo = true;

    if (!this.globalData.isCloudReady) {
      console.log("云开发环境未就绪，跳过获取用户信息");
      this._gettingUserInfo = false;
      return;
    }

    wx.cloud.callFunction({
      name: 'getUserInfo',
      data: {},
      success: res => {
        that._gettingUserInfo = false;
        console.log("getUserInfo云函数返回:", res);
        
        if (res.result && res.result.code === 0) {
          that.globalData.userInfo = res.result.data;
          that.globalData.points = res.result.data.points || 100;
          console.log("用户信息获取成功，积分:", that.globalData.points);
          
          that.globalData.userInfoReadyCallbacks.forEach(fn => fn(res.result.data));
          that.globalData.userInfoReadyCallbacks = [];
        } else {
          console.warn("获取用户信息返回异常:", res.result);
        }
      },
      fail: err => {
        that._gettingUserInfo = false;
        console.warn("获取用户信息失败，可能原因:");
        console.warn("1. 云函数 getUserInfo 未部署");
        console.warn("2. 云环境ID配置错误");
        console.warn("3. 数据库集合 users 未创建");
        console.warn("错误详情:", err);
      }
    });
  },

  updateUserInfo: function(userInfo) {
    this.globalData.userInfo = userInfo;
    if (userInfo.points !== undefined) {
      this.globalData.points = userInfo.points;
    }
  }
});