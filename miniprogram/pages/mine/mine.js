const app = getApp();

Page({
  data: {
    userInfo: null,
    userId: '',
    points: 100,
    aiCount: 0,
    bianbianCount: 0,
    totalGenerate: 0,
    selectedRecharge: null,
    rechargeOptions: [
      { id: 1, points: 50, price: '4.9', recommend: false },
      { id: 2, points: 150, price: '9.9', recommend: true },
      { id: 3, points: 600, price: '29.9', recommend: false },
      { id: 4, points: 1500, price: '49.9', recommend: true }
    ],
    menuList: [
      { icon: '/images/icons/history.png', title: '生成记录', url: '/pages/history/history', desc: '', color: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)' },
      { icon: '/images/icons/ai.png', title: 'AI头像记录', url: '/pages/history/history?type=ai', desc: '', color: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)' },
      { icon: '/images/icons/bianbian.png', title: '百变头像记录', url: '/pages/history/history?type=bianbian', desc: '', color: 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)' },
      { icon: '/images/icons/favorite.png', title: '我的收藏', url: '', desc: '', color: 'linear-gradient(135deg, #FFA751 0%, #FFE259 100%)' },
      { icon: '/images/icons/points.png', title: '积分明细', url: '/pages/points/points', desc: '', color: 'linear-gradient(135deg, #2196F3 0%, #03A9F4 100%)' }
    ]
  },

  onLoad() {
    this.loadUserInfo();
    this.loadUserStats();
  },

  onShow() {
    this.loadUserInfo();
  },

  loadUserInfo() {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        points: app.globalData.userInfo.points || 100,
        userId: this.generateUserId()
      });
    }
  },

  generateUserId() {
    return Math.floor(Math.random() * 900000 + 100000).toString();
  },

  async loadUserStats() {
    try {
      const openid = await wx.cloud.getOpenId();

      const res = await wx.cloud.database().collection('images')
        .where({
          _openid: openid
        })
        .count();

      const total = res.total || 0;

      // 模拟统计数据
      this.setData({
        aiCount: Math.floor(total * 0.6),
        bianbianCount: Math.floor(total * 0.4),
        totalGenerate: total
      });
    } catch (err) {
      console.error('加载统计数据失败', err);
    }
  },

  selectRecharge(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({
      selectedRecharge: id
    });
  },

  handleRecharge() {
    if (!this.data.selectedRecharge) {
      wx.showToast({
        title: '请选择充值套餐',
        icon: 'none'
      });
      return;
    }

    const selected = this.data.rechargeOptions.find(item => item.id === this.data.selectedRecharge);

    wx.showModal({
      title: '充值确认',
      content: `确认充值 ${selected.points} 积分，金额 ¥${selected.price}`,
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '充值中...' });
          // 实际项目中需要接入支付
          setTimeout(() => {
            wx.hideLoading();
            this.setData({
              points: this.data.points + selected.points
            });
            wx.showToast({
              title: '充值成功',
              icon: 'success'
            });
          }, 2000);
        }
      }
    });
  },

  handleMenu(e) {
    const url = e.currentTarget.dataset.url;
    if (!url) {
      wx.showToast({
        title: '功能开发中',
        icon: 'none'
      });
      return;
    }
    wx.navigateTo({
      url: url
    });
  },

  goToHistory(e) {
    const type = e.currentTarget.dataset.type;
    let url = '/pages/history/history';
    if (type && type !== 'all') {
      url += `?type=${type}`;
    }
    wx.navigateTo({ url });
  },

  goToTools() {
    wx.navigateTo({
      url: '/pages/tools/tools'
    });
  },

  goToInvite() {
    wx.navigateTo({
      url: '/pages/invite/invite'
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
