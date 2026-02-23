Page({
  data: {
    currentTab: 0,
    tabs: ['头像框', '民族图标', 'Emoji'],
    frames: [
      { id: 1, path: '/images/frames/xj_frame_1.png', name: '新疆风格1' },
      { id: 2, path: '/images/frames/xj_frame_2.png', name: '新疆风格2' },
      { id: 3, path: '/images/frames/xj_frame_3.png', name: '新疆风格3' },
      { id: 4, path: '/images/frames/xj_frame_4.png', name: '新疆风格4' },
      { id: 5, path: '/images/frames/xj_frame_5.png', name: '新疆风格5' }
    ],
    icons: [
      { id: 1, path: '/images/icons/xj/xj_icon_1.png', name: '民族特色1' },
      { id: 2, path: '/images/icons/xj/xj_icon_2.png', name: '民族特色2' },
      { id: 3, path: '/images/icons/xj/xj_icon_3.png', name: '民族特色3' },
      { id: 4, path: '/images/icons/xj/xj_icon_4.png', name: '民族特色4' },
      { id: 5, path: '/images/icons/xj/xj_icon_5.png', name: '民族特色5' },
      { id: 6, path: '/images/icons/xj/xj_icon_6.png', name: '民族特色6' },
      { id: 7, path: '/images/icons/xj/xj_icon_7.png', name: '民族特色7' },
      { id: 8, path: '/images/icons/xj/xj_icon_8.png', name: '民族特色8' },
      { id: 9, path: '/images/icons/xj/xj_icon_9.png', name: '民族特色9' },
      { id: 10, path: '/images/icons/xj/xj_icon_10.png', name: '民族特色10' }
    ],
    emojis: []
  },

  onLoad() {
    this.generateEmojis();
  },

  generateEmojis() {
    const emojis = [];
    for (let i = 1; i <= 20; i++) {
      emojis.push({
        id: i, emoji: String.fromCodePoint(0x1F600 + i - 1)
      });
    }
    this.setData({ emojis });
  },

  switchTab(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ currentTab: index });
  },

  previewImage(e) {
    const url = e.currentTarget.dataset.url;
    wx.previewImage({
      urls: [url]
    });
  }
});