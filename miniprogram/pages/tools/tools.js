Page({
  data: {
    toolsList: [
      { id: 1, name: 'P图工具', desc: '一键美化照片', icon: '/images/fun/ptu.png', color: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)', comingSoon: false },
      { id: 2, name: 'AI海报', desc: '智能生成海报', icon: '/images/fun/poster.png', color: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)', comingSoon: true },
      { id: 3, name: 'AI Logo', desc: '专业Logo设计', icon: '/images/fun/logo.png', color: 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)', comingSoon: true },
      { id: 4, name: '每日一言', desc: '每日正能量', icon: '/images/fun/quote.png', color: 'linear-gradient(135deg, #FFA751 0%, #FFE259 100%)', comingSoon: false },
      { id: 5, name: '每日英语', desc: '学习英语', icon: '/images/fun/english.png', color: 'linear-gradient(135deg, #2196F3 0%, #03A9F4 100%)', comingSoon: true },
      { id: 6, name: '每日一笑', desc: '开心每一天', icon: '/images/fun/laugh.png', color: 'linear-gradient(135deg, #E91E63 0%, #F48FB1 100%)', comingSoon: true },
      { id: 7, name: '每日情话', desc: '浪漫情话', icon: '/images/fun/love.png', color: 'linear-gradient(135deg, #F44336 0%, #E57373 100%)', comingSoon: true },
      { id: 8, name: '更多功能', desc: '敬请期待', icon: '/images/fun/more.png', color: 'linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%)', comingSoon: true }
    ]
  },

  handleTool(e) {
    const id = e.currentTarget.dataset.id;
    const tool = this.data.toolsList.find(t => t.id === id);

    if (tool.comingSoon) {
      wx.showToast({
        title: '功能即将上线',
        icon: 'none'
      });
      return;
    }

    if (id === 1) {
      wx.showToast({
        title: '功能即将上线',
        icon: 'none'
      });
    } else if (id === 4) {
      wx.navigateTo({
        url: '/pages/daily/daily'
      });
    }
  }
});
