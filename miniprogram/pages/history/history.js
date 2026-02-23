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

const styleTextMap = {
  'anime': '动漫风格',
  '3d': '3D风格',
  'sketch': '素描风格',
  'watercolor': '水彩风格',
  'pixel': '像素风格',
  'cartoon': '卡通风格',
  'realistic': '写实风格',
  'comic': '漫画风格',
  'wedding': '婚纱日记',
  'retro': '复古繁华',
  'barbie': '芭比风',
  'rich': '我要暴富',
  'crystal': '夏日水晶',
  'hkcomic': '复古港漫',
  'astronaut': '宇航员',
  'leisure': '休闲时刻',
  'dopamine': '多巴胺',
  'summer': '心动初夏',
  'seaside': '海边',
  'anime_bb': '二次元',
  'fantasy': '幻想风',
  'sweet': '甜心',
  'cool': '酷炫',
  'dreamy': '梦幻'
};

Page({
  data: {
    currentType: 'all',
    historyList: [],
    filteredHistory: []
  },

  onLoad(options) {
    if (options.type) {
      this.setData({ currentType: options.type });
    }
    this.loadHistory();
  },

  onShow() {
    this.loadHistory();
  },

  async loadHistory() {
    try {
      const res = await wx.cloud.database().collection('images')
        .where({
          _openid: '{openid}'
        })
        .orderBy('createTime', 'desc')
        .limit(50)
        .get();

      const historyList = (res.data || []).map(item => ({
        ...item,
        type: item.type || 'ai',
        typeText: item.type === 'bianbian' ? '百变' : 'AI',
        styleText: styleTextMap[item.styleType] || item.styleType,
        formatTime: formatTime(item.createTime)
      }));

      this.setData({ historyList });
      this.filterHistory();
    } catch (err) {
      console.error('加载历史记录失败', err);
    }
  },

  switchType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ currentType: type });
    this.filterHistory();
  },

  filterHistory() {
    const { currentType, historyList } = this.data;
    let filtered = historyList;

    if (currentType !== 'all') {
      filtered = historyList.filter(item => item.type === currentType);
    }

    this.setData({ filteredHistory: filtered });
  },

  viewDetail(e) {
    const item = e.currentTarget.dataset.item;
    wx.previewImage({
      urls: [item.resultFileID],
      current: item.resultFileID
    });
  },

  downloadImage(e) {
    const url = e.currentTarget.dataset.url;
    wx.showLoading({ title: '下载中...' });

    wx.downloadFile({
      url: url,
      success: (res) => {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: () => {
            wx.hideLoading();
            wx.showToast({
              title: '保存成功',
              icon: 'success'
            });
          },
          fail: () => {
            wx.hideLoading();
            wx.showToast({
              title: '保存失败',
              icon: 'none'
            });
          }
        });
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({
          title: '下载失败',
          icon: 'none'
        });
      }
    });
  },

  shareImage(e) {
    const item = e.currentTarget.dataset.item;
    wx.showToast({
      title: '点击右上角分享',
      icon: 'none'
    });
  },

  goToGenerate() {
    wx.navigateBack();
  },

  onShareAppMessage(e) {
    const item = e.target.dataset.item;
    return {
      title: '看看我生成的AI头像',
      path: '/pages/index/index',
      imageUrl: item ? item.resultFileID : '/images/share-bg.png'
    };
  }
});
