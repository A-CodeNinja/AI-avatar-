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
      this.setData({
        userInfo: app.globalData.userInfo,
        points: app.globalData.userInfo.points || 100
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
      // 修复openid bug - 使用真实openid
      const wxContext = await wx.cloud.getWXContext();
      const openid = wxContext.OPENID || app.globalData.userInfo.openid;

      const res = await wx.cloud.database().collection('points_log')
        .where({
          _openid: openid
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

    wx.showModal({
      title: '观看广告',
      content: '观看激励广告可获得20积分（更慷慨！）',
      confirmText: '开始观看',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '加载广告中...' });

          // TODO: 实际项目中需要接入广告SDK
          // wx.createRewardedVideoAd({ adUnitId: 'your-ad-unit-id' })

          setTimeout(() => {
            wx.hideLoading();

            // 模拟广告观看完成
            this.setData({
              points: this.data.points + 20,  // 从10改为20
              adCount: this.data.adCount - 1
            });

            // 调用云函数记录积分
            wx.cloud.callFunction({
              name: 'updatePoints',
              data: {
                type: 'watchAd',
                points: 20
              }
            }).catch(err => {
              console.error('记录积分失败', err);
            });

            wx.showToast({
              title: '获得20积分',
              icon: 'success'
            });
          }, 2000);
        }
      }
    });
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
