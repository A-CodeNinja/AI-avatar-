Page({
  data: {
    // 基础风格
    styles: [
      { key: 'anime', name: '动漫', icon: '', hot: true },
      { key: '3d', name: '3D', icon: '', hot: false },
      { key: 'sketch', name: '素描', icon: '', hot: false },
      { key: 'watercolor', name: '水彩', icon: '', hot: true },
      { key: 'pixel', name: '像素', icon: '', hot: false },
      { key: 'cartoon', name: '卡通', icon: '', hot: false },
      { key: 'realistic', name: '写实', icon: '', hot: true },
      { key: 'comic', name: '漫画', icon: '', hot: false }
    ],
    // 民族风格
    ethnicStyles: [
      { key: 'uyghur', name: '维吾尔族', icon: '', desc: '艾德莱斯绸', color: '#E63946' },
      { key: 'kazakh', name: '哈萨克族', icon: '', desc: '羊角纹', color: '#457B9D' },
      { key: 'mongol', name: '蒙古族', icon: '', desc: '云纹', color: '#2D6A4F' },
      { key: 'kirgiz', name: '柯尔克孜族', icon: '', desc: '毡绣', color: '#D62828' },
      { key: 'tajik', name: '塔吉克族', icon: '', desc: '刺绣', color: '#9B2222' }
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
