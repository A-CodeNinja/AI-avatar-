Page({
  data: {
    // 基础风格
    styles: [
      { key: 'anime', name: '动漫', icon: '/images/styles/anime.png', hot: true },
      { key: '3d', name: '3D', icon: '/images/styles/3d.png', hot: false },
      { key: 'sketch', name: '素描', icon: '/images/styles/sketch.png', hot: false },
      { key: 'watercolor', name: '水彩', icon: '/images/styles/watercolor.png', hot: true },
      { key: 'pixel', name: '像素', icon: '/images/styles/pixel.png', hot: false },
      { key: 'cartoon', name: '卡通', icon: '/images/styles/cartoon.png', hot: false },
      { key: 'realistic', name: '写实', icon: '/images/styles/realistic.png', hot: true },
      { key: 'comic', name: '漫画', icon: '/images/styles/comic.png', hot: false }
    ],
    // 民族风格
    ethnicStyles: [
      { key: 'uyghur', name: '维吾尔族', icon: '/images/xj/uyghur.png', desc: '艾德莱斯绸', color: '#E53935' },
      { key: 'kazakh', name: '哈萨克族', icon: '/images/xj/kazakh.png', desc: '羊角纹', color: '#1565C0' },
      { key: 'mongol', name: '蒙古族', icon: '/images/xj/mongol.png', desc: '云纹', color: '#2E7D32' },
      { key: 'kirgiz', name: '柯尔克孜族', icon: '/images/xj/kirgiz.png', desc: '毡绣', color: '#AD1457' },
      { key: 'tajik', name: '塔吉克族', icon: '/images/xj/tajik.png', desc: '刺绣', color: '#E65100' }
    ],
    selectedStyle: 'anime',
    selectedEthnic: null,
    selectedStyleName: '动漫',
    selectedEthnicName: ''
  },

  onLoad() {
    this.updateSelectedNames();
  },

  // 选择基础风格
  selectStyle(e) {
    const style = e.currentTarget.dataset.style;
    this.setData({ selectedStyle: style }, () => {
      this.updateSelectedNames();
    });
  },

  // 选择民族风格
  selectEthnic(e) {
    const ethnic = e.currentTarget.dataset.ethnic;
    const newSelectedEthnic = this.data.selectedEthnic === ethnic ? null : ethnic;
    this.setData({ selectedEthnic: newSelectedEthnic }, () => {
      this.updateSelectedNames();
    });
  },

  // 更新选中的名称
  updateSelectedNames() {
    const styleItem = this.data.styles.find(s => s.key === this.data.selectedStyle);
    const ethnicItem = this.data.ethnicStyles.find(e => e.key === this.data.selectedEthnic);

    this.setData({
      selectedStyleName: styleItem ? styleItem.name : '',
      selectedEthnicName: ethnicItem ? ethnicItem.name : ''
    });
  },

  // 确认选择并返回首页
  goBack() {
    const app = getApp();

    // 保存选择到全局
    app.globalData.selectedStyle = this.data.selectedStyle;
    app.globalData.selectedEthnic = this.data.selectedEthnic;

    // 显示提示
    wx.showToast({
      title: '已选择风格',
      icon: 'success'
    });

    // 返回首页
    setTimeout(() => {
      wx.navigateBack();
    }, 500);
  }
});
