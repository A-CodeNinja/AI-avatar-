Page({
  data: {
    currentCategory: 'quote',
    categoryTabs: [
      { id: 'quote', name: '每日一言' },
      { id: 'english', name: '每日英语' },
      { id: 'joke', name: '每日一笑' },
      { id: 'love', name: '每日情话' }
    ],
    dailyContent: {
      text: '努力不一定成功，但放弃一定失败。',
      author: '佚名'
    },
    dateText: '',
    historyList: [
      { text: '生活不是等待风暴过去，而是学会在雨中翩翩起舞。', date: '2024-02-22', id: 1 },
      { text: '每一个不曾起舞的日子，都是对生命的辜负。', date: '2024-02-21', id: 2 },
      { text: '人生没有白走的路，每一步都算数。', date: '2024-02-20', id: 3 },
      { text: '相信自己的直觉，它不会欺骗你。', date: '2024-02-19', id: 4 },
      { text: '今天的努力，是明天的礼物。', date: '2024-02-18', id: 5 }
    ]
  },

  onLoad() {
    this.updateDateText();
    this.refreshContent();
  },

  updateDateText() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    const weekDay = weekDays[now.getDay()];
    
    this.setData({
      dateText: `${year}年${month}月${day}日 星期${weekDay}`
    });
  },

  switchCategory(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({ currentCategory: id });
    this.refreshContent();
  },

  refreshContent() {
    const contents = {
      quote: [
        { text: '努力不一定成功，但放弃一定失败。', author: '佚名' },
        { text: '生活不是等待风暴过去，而是学会在雨中翩翩起舞。', author: '佚名' },
        { text: '每一个不曾起舞的日子，都是对生命的辜负。', author: '佚名' }
      ],
      english: [
        { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
        { text: 'Believe you can and you\'re halfway there.', author: 'Theodore Roosevelt' },
        { text: 'Success is not final, failure is not fatal.', author: 'Winston Churchill' }
      ],
      joke: [
        { text: '为什么程序员总是分不清万圣节和圣诞节？因为 Oct 31 == Dec 25。', author: '程序员的笑话' },
        { text: '老师问：你最喜欢的科目是什么？我：下课。', author: '学生' }
      ],
      love: [
        { text: '遇见你是我生命中最美丽的意外。', author: '情话' },
        { text: '我想把所有的好运气都给你，让你每天都开心。', author: '情话' }
      ]
    };

    const categoryContents = contents[this.data.currentCategory] || contents.quote;
    const randomContent = categoryContents[Math.floor(Math.random() * categoryContents.length)];

    this.setData({
      dailyContent: randomContent
    });
  },

  copyContent() {
    const text = `"${this.data.dailyContent.text}" —— ${this.data.dailyContent.author}`;
    wx.setClipboardData({
      data: text,
      success: () => {
        wx.showToast({
          title: '已复制',
          icon: 'success'
        });
      }
    });
  },

  shareContent() {
    wx.showToast({
      title: '点击右上角分享',
      icon: 'none'
    });
  },

  viewHistory(e) {
    const index = e.currentTarget.dataset.index;
    const item = this.data.historyList[index];
    
    wx.showModal({
      title: '往期内容',
      content: `"${item.text}"`,
      showCancel: false
    });
  },

  onShareAppMessage() {
    return {
      title: `"${this.data.dailyContent.text}"`,
      path: '/pages/daily/daily',
      imageUrl: '/images/share-bg.png'
    };
  }
});
