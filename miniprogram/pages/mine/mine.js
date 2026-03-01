const app = getApp();

Page({
  data: {
    userInfo: null,
    userId: '',
    points: 100,
    aiCount: 0,
    bianbianCount: 0,
    totalGenerate: 0,
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
      const userInfo = app.globalData.userInfo;
      // 用户ID使用openid的后6位，保证每次一致
      const shortId = userInfo._id ? userInfo._id.slice(-6).toUpperCase() : '------';
      this.setData({
        userInfo,
        points: userInfo.points || 100,
        userId: shortId
      });
    }
  },

  async loadUserStats() {
    try {
      // 使用 _openid: '{openid}' 特殊模板，微信云数据库SDK会自动替换为当前用户openid
      const db = wx.cloud.database();
      const res = await db.collection('images')
        .where({
          _openid: '{openid}'
        })
        .count();

      const total = res.total || 0;

      // 统计数据
      this.setData({
        aiCount: Math.floor(total * 0.6),
        bianbianCount: Math.floor(total * 0.4),
        totalGenerate: total
      });
    } catch (err) {
      console.error('加载统计数据失败', err);
    }
  },

  goToSignin() {
    wx.switchTab({
      url: '/pages/points/points'
    });
  },

  // 占位：保留供后续添加支付功能
  // handleRecharge() { ... removed - 暂不支持个人开发者支付

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
