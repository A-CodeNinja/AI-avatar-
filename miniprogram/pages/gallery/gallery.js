const app = getApp();

Page({
  data: {
    currentTab: 0,
    tabs: ['精选', '我的作品'],
    officialImages: [
      { id: 1, url: '/images/ai_example1.png' },
      { id: 2, url: '/images/ai_example2.png' },
      { id: 3, url: '/images/ai_example1.png' },
      { id: 4, url: '/images/ai_example2.png' },
      { id: 5, url: '/images/ai_example1.png' },
      { id: 6, url: '/images/ai_example2.png' }
    ],
    myImages: []
  },

  onLoad() {
    this.loadMyImages();
  },

  onShow() {
    if (this.data.currentTab === 1) {
      this.loadMyImages();
    }
  },

  switchTab(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ currentTab: index });
    if (index === 1) {
      this.loadMyImages();
    }
  },

  async loadMyImages() {
    try {
      const res = await wx.cloud.database().collection('images')
        .where({
          _openid: '{openid}'
        })
        .orderBy('createTime', 'desc')
        .limit(20)
        .get();

      this.setData({
        myImages: res.data || []
      });
    } catch (err) {
      console.error(err);
    }
  },

  previewImage(e) {
    const urls = e.currentTarget.dataset.urls;
    const current = e.currentTarget.dataset.current;
    wx.previewImage({
      urls: urls,
      current: current
    });
  }
});
