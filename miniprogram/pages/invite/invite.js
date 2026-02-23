function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return '今天';
  if (days === 1) return '昨天';
  if (days < 7) return `${days}天前`;
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

Page({
  data: {
    inviteCount: 0,
    rewardPoints: 0,
    inviteList: []
  },

  onLoad() {
    this.loadInviteData();
  },

  onShow() {
    this.loadInviteData();
  },

  async loadInviteData() {
    try {
      // 获取邀请统计
      const statsRes = await wx.cloud.database().collection('invite_records')
        .where({
          inviterId: '{openid}'
        })
        .count();

      // 获取邀请列表
      const listRes = await wx.cloud.database().collection('invite_records')
        .where({
          inviterId: '{openid}'
        })
        .orderBy('createTime', 'desc')
        .limit(20)
        .get();

      const inviteList = (listRes.data || []).map(item => ({
        ...item,
        formatTime: formatTime(item.createTime)
      }));

      this.setData({
        inviteCount: statsRes.total || 0,
        rewardPoints: (statsRes.total || 0) * 20,
        inviteList
      });
    } catch (err) {
      console.error('加载邀请数据失败', err);
    }
  },

  shareToGroup() {
    wx.showToast({
      title: '点击右上角分享',
      icon: 'none'
    });
  },

  copyLink() {
    const inviteCode = this.generateInviteCode();
    const link = `https://your-domain.com/invite?code=${inviteCode}`;
    
    wx.setClipboardData({
      data: link,
      success: () => {
        wx.showToast({
          title: '链接已复制',
          icon: 'success'
        });
      }
    });
  },

  generateInviteCode() {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  },

  onShareAppMessage() {
    const inviteCode = this.generateInviteCode();
    return {
      title: 'AI头像生成神器，快来试试！',
      path: `/pages/index/index?inviteCode=${inviteCode}`,
      imageUrl: '/images/share-bg.png'
    };
  }
});
