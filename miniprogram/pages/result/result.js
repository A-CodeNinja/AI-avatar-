const app = getApp();

const typeTextMap = {
  'ai': 'AI头像',
  'bianbian': '百变头像'
};

const styleTextMap = {
  anime: '动漫', '3d': '3D', sketch: '素描', watercolor: '水彩',
  pixel: '像素', cartoon: '卡通', realistic: '写实', comic: '漫画',
  wedding: '婚纱日记', retro: '复古繁华', barbie: '芭比风', rich: '我要暴富',
  crystal: '夏日水晶', hkcomic: '复古港漫', astronaut: '宇航员', leisure: '休闲时刻',
  dopamine: '多巴胺', summer: '心动初夏', seaside: '海边', anime_bb: '二次元',
  fantasy: '幻想风', sweet: '甜心', cool: '酷炫', dreamy: '梦幻'
};

const ethnicNameMap = {
  uyghur: '维吾尔族',
  kazakh: '哈萨克族',
  mongol: '蒙古族',
  kirgiz: '柯尔克孜族',
  tajik: '塔吉克族'
};

Page({
  data: {
    fileID: '',
    tempFilePath: '',
    type: 'ai',
    typeText: 'AI头像',
    style: '',
    styleText: '',
    ethnic: 'none',
    selectedFrame: '',
    frameSectionTitle: '热门头像框',
    isSaved: false,
    isSharedToGallery: false,
    frames: [
      { id: 1, name: '新疆框 1', path: '/images/frames/xj_frame_1.png' },
      { id: 2, name: '新疆框 2', path: '/images/frames/xj_frame_2.png' },
      { id: 3, name: '新疆框 3', path: '/images/frames/xj_frame_3.png' },
      { id: 4, name: '新疆框 4', path: '/images/frames/xj_frame_4.png' },
      { id: 5, name: '新疆框 5', path: '/images/frames/xj_frame_5.png' }
    ]
  },

  onLoad(options) {
    const { fileID = '', type = 'ai', style = '', ethnic = 'none' } = options;
    const ethnicName = ethnicNameMap[ethnic];
    const frameSectionTitle = ethnicName ? `${ethnicName}特色边框` : '热门头像框';
    this.setData({
      fileID,
      type,
      ethnic,
      style,
      typeText: typeTextMap[type] || 'AI头像',
      styleText: styleTextMap[style] || style || '',
      frameSectionTitle
    });
    if (fileID) {
      this.downloadImage();
    }
    this.loadFramesFromCloud(ethnic);
  },

  async downloadImage() {
    wx.showLoading({ title: '加载中...' });
    try {
      const res = await wx.cloud.downloadFile({ fileID: this.data.fileID });
      this.setData({ tempFilePath: res.tempFilePath });
    } catch (err) {
      console.error(err);
      wx.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  async loadFramesFromCloud(ethnic) {
    try {
      const db = wx.cloud.database();
      const query = ethnic && ethnic !== 'none'
        ? db.collection('materials').where({ type: 'frame', ethnic, status: 1 })
        : db.collection('materials').where({ type: 'frame', isHot: true, status: 1 });
      const res = await query.orderBy('sortOrder', 'asc').limit(8).get();
      if (res.data && res.data.length > 0) {
        this.setData({
          frames: res.data.map((m, idx) => ({
            id: m._id || idx + 1,
            name: m.name,
            path: m.cloudUrl || m.image
          }))
        });
      }
    } catch (err) {
      // 静默失败，保留默认帧数组
      console.warn('从云端加载边框失败，使用默认数据', err);
    }
  },

  selectFrame(e) {
    const frame = e.currentTarget.dataset.frame;
    this.setData({ selectedFrame: frame === this.data.selectedFrame ? '' : frame });
  },

  saveImage() {
    if (!this.data.tempFilePath) {
      wx.showToast({ title: '请等待图片加载', icon: 'none' });
      return;
    }
    wx.showLoading({ title: '保存中...' });
    wx.saveImageToPhotosAlbum({
      filePath: this.data.tempFilePath,
      success: () => {
        wx.hideLoading();
        this.setData({ isSaved: true });
        wx.showToast({ title: '已保存到相册', icon: 'success' });
      },
      fail: (err) => {
        wx.hideLoading();
        console.error(err);
        if (err.errMsg && err.errMsg.includes('auth')) {
          wx.showModal({
            title: '需要相册权限',
            content: '请在设置中开启照片访问权限',
            showCancel: false
          });
        } else {
          wx.showToast({ title: '保存失败', icon: 'none' });
        }
      }
    });
  },

  shareImage() {
    wx.showToast({ title: '点击右上角分享', icon: 'none' });
  },

  async shareToGallery() {
    if (!this.data.fileID) {
      wx.showToast({ title: '头像不存在', icon: 'none' });
      return;
    }
    if (this.data.isSharedToGallery) {
      wx.showToast({ title: '已分享到头像墙', icon: 'none' });
      return;
    }
    wx.showLoading({ title: '分享中...' });
    try {
      const db = wx.cloud.database();
      const user = app.globalData.userInfo;
      await db.collection('shared_avatars').add({
        data: {
          avatarUrl: this.data.fileID,
          nickname: user ? user.nickName : '全屏用户',
          style: this.data.style,
          type: this.data.type,
          likes: 0,
          status: 1,
          createTime: Date.now()
        }
      });
      wx.hideLoading();
      this.setData({ isSharedToGallery: true });
      wx.showToast({ title: '已分享到头像墙✨', icon: 'success' });
    } catch (err) {
      wx.hideLoading();
      console.error(err);
      wx.showToast({ title: '分享失败', icon: 'none' });
    }
  },

  regenerate() {
    wx.navigateBack();
  },

  onShareAppMessage() {
    return {
      title: '我用AI生成了一张漫畫风头像，快来看看！',
      path: '/pages/index/index',
      imageUrl: this.data.tempFilePath || '/images/share-bg.png'
    };
  }
});

