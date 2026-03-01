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
    pointsLog: [],
    // 签到相关（更大方）
    weekDays: ['日', '一', '二', '三', '四', '五', '六'],
    signDays: [],
    hasSignedToday: false,
    todayPoints: 10,  // 从5改为10
    consecutiveDays: 0,
    // 任务次数（更大方）
    adCount: 5,  // 从3改为5
    shareCount: 5,  // 从3改为5
    groupCount: 5  // 从3改为5
  },

  onLoad() {
    this.loadUserInfo();
    this.loadPointsLog();
    this.initSignData();
  },

  onShow() {
    this.loadUserInfo();
  },

  loadUserInfo() {
    if (app.globalData.userInfo) {
      const user = app.globalData.userInfo;
      // 剩余次数 = 每日上限 - 已使用次数
      const adRemaining   = Math.max(0, 5 - (user.adCount   || 0));
      const shareRemaining = Math.max(0, 5 - (user.shareCount || 0));
      this.setData({
        userInfo: user,
        points: user.points || 100,
        adCount: adRemaining,
        shareCount: shareRemaining,
        groupCount: shareRemaining,
        hasSignedToday: user.dailyCheck && user.dailyCheck.lastDate === new Date().toDateString(),
        consecutiveDays: user.dailyCheck ? user.dailyCheck.streak : 0
      });
    }
  },

  initSignData() {
    // 初始化签到日历
    const today = new Date();
    const weekDay = today.getDay();
    const signDays = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - weekDay + i);
      const isToday = i === weekDay;
      const dayPoints = this.getSignPoints(i + 1);

      signDays.push({
        day: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][i],
        points: i < weekDay ? dayPoints : (isToday ? dayPoints : null),
        signed: i < weekDay,
        today: isToday
      });
    }

    this.setData({
      signDays,
      todayPoints: this.getSignPoints(weekDay + 1)
    });
  },

  getSignPoints(day) {
    // 更大方的签到积分（翻倍）
    const pointsMap = { 1: 10, 2: 20, 3: 30, 4: 40, 5: 50, 6: 60, 7: 100 };
    return pointsMap[day] || 10;
  },

  async loadPointsLog() {
    try {
      // 调用云函数获取积分记录（安全可靠，由云端校验openid）
      const res = await wx.cloud.callFunction({
        name: 'getPointsLog',
        data: { page: 0, pageSize: 20 }
      });

      if (res.result && res.result.code === 0) {
        const logs = (res.result.data || []).map(item => ({
          ...item,
          formatTime: formatTime(item.createTime)
        }));
        this.setData({ pointsLog: logs });
      } else {
        console.warn('积分记录返回异常', res.result);
      }
    } catch (err) {
      console.error('加载积分记录失败', err);
    }
  },

  async handleSignin() {
    if (this.data.hasSignedToday) {
      wx.showToast({
        title: '今日已签到',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({ title: '签到中...' });
    try {
      const res = await wx.cloud.callFunction({
        name: 'updatePoints',
        data: { type: 'signin' }
      });

      wx.hideLoading();

      if (res.result.code === 0) {
        this.setData({
          hasSignedToday: true,
          points: this.data.points + res.result.points
        });
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
    if (this.data.adCount <= 0) {
      wx.showToast({
        title: '今日次数已用完',
        icon: 'none'
      });
      return;
    }

    // 接入激励视频广告 SDK
    if (typeof wx.createRewardedVideoAd === 'function') {
      const rewardedVideoAd = wx.createRewardedVideoAd({ adUnitId: 'your-ad-unit-id' });
      rewardedVideoAd.onClose((status) => {
        if (status && status.isEnded) {
          this._syncWatchAdCloud();
        } else {
          wx.showToast({ title: '请看完广告才能获得积分', icon: 'none' });
        }
      });
      rewardedVideoAd.onError(() => {
        wx.showToast({ title: '广告加载失败', icon: 'none' });
      });
      rewardedVideoAd.show();
    } else {
      // 开发环境模拟
      wx.showModal({
        title: '观看广告',
        content: '观看激励广告可获得20积分（开发环境模拟）',
        confirmText: '开始观看',
        success: (res) => {
          if (res.confirm) {
            this._syncWatchAdCloud();
          }
        }
      });
    }
  },

  async _syncWatchAdCloud() {
    wx.showLoading({ title: '结算积分...' });
    try {
      const res = await wx.cloud.callFunction({
        name: 'updatePoints',
        data: { type: 'watchAd' }
      });
      wx.hideLoading();
      if (res.result && res.result.code === 0) {
        const earned = res.result.points || 20;
        this.setData({
          points: this.data.points + earned,
          adCount: Math.max(0, this.data.adCount - 1)
        });
        if (app.globalData.userInfo) {
          app.globalData.userInfo.points += earned;
          app.globalData.userInfo.adCount = (app.globalData.userInfo.adCount || 0) + 1;
        }
        wx.showToast({ title: `获得${earned}积分`, icon: 'success' });
        this.loadPointsLog();
      } else {
        wx.showToast({ title: res.result ? res.result.msg : '获取积分失败', icon: 'none' });
      }
    } catch (err) {
      wx.hideLoading();
      console.error('观看广告积分失败', err);
      wx.showToast({ title: '网络异常，请稍后再试', icon: 'none' });
    }
  },
  handleShare() {
    if (this.data.shareCount <= 0) {
      wx.showToast({
        title: '今日次数已用完',
        icon: 'none'
      });
      return;
    }
  },

  handleShareGroup() {
    if (this.data.groupCount <= 0) {
      wx.showToast({
        title: '今日次数已用完',
        icon: 'none'
      });
      return;
    }
  },

  goToInvite() {
    wx.navigateTo({
      url: '/pages/invite/invite'
    });
  },

  goToDaily() {
    wx.navigateTo({
      url: '/pages/daily/daily'
    });
  },

  handleFun(e) {
    const type = e.currentTarget.dataset.type;
    const funMap = {
      'ptu': 'P图工具',
      'poster': 'AI海报生成',
      'logo': 'AI Logo生成'
    };
    wx.showToast({
      title: `${funMap[type]} 即将上线`,
      icon: 'none'
    });
  },

  onShareAppMessage() {
    return {
      title: 'AI头像生成神器，快来试试！',
      path: '/pages/index/index',
      imageUrl: '/images/share-bg.png'
    };
  }
});
