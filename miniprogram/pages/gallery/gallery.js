const app = getApp();

Page({
  data: {
    currentCategory: 'all',
    categoryTabs: [
      { id: 'all', name: '全部' },
      { id: 'couple', name: '情侣' },
      { id: 'male', name: '男生' },
      { id: 'female', name: '女生' },
      { id: 'anime', name: '动漫' },
      { id: 'nezha', name: '哪吒' },
      { id: 'christmas', name: '圣诞头像' },
      { id: 'shared', name: '共享' }
    ],
    officialImages: [
      // 全部头像
      { id: 1, url: '/images/ai_example1.png', name: '动漫头像1', likes: 128, category: 'anime' },
      { id: 2, url: '/images/ai_example2.png', name: '写实头像1', likes: 89, category: 'realistic' },
      { id: 3, url: '/images/ai_example1.png', name: '3D头像1', likes: 256, category: '3d' },
      { id: 4, url: '/images/ai_example2.png', name: '卡通头像1', likes: 67, category: 'cartoon' },
      { id: 5, url: '/images/ai_example1.png', name: '水彩头像1', likes: 145, category: 'anime' },
      { id: 6, url: '/images/ai_example2.png', name: '像素头像1', likes: 92, category: 'pixel' },
      // 情侣头像
      { id: 7, url: '/images/ai_example1.png', name: '情侣头像1', likes: 389, category: 'couple' },
      { id: 8, url: '/images/ai_example2.png', name: '情侣头像2', likes: 421, category: 'couple' },
      // 男生头像
      { id: 9, url: '/images/ai_example1.png', name: '男生头像1', likes: 156, category: 'male' },
      { id: 10, url: '/images/ai_example2.png', name: '男生头像2', likes: 198, category: 'male' },
      // 女生头像
      { id: 11, url: '/images/ai_example1.png', name: '女生头像1', likes: 267, category: 'female' },
      { id: 12, url: '/images/ai_example2.png', name: '女生头像2', likes: 312, category: 'female' },
      // 哪吒头像
      { id: 13, url: '/images/ai_example1.png', name: '哪吒头像1', likes: 445, category: 'nezha' },
      { id: 14, url: '/images/ai_example2.png', name: '哪吒头像2', likes: 389, category: 'nezha' },
      // 圣诞头像
      { id: 15, url: '/images/ai_example1.png', name: '圣诞头像1', likes: 567, category: 'christmas' },
      { id: 16, url: '/images/ai_example2.png', name: '圣诞头像2', likes: 489, category: 'christmas' }
    ],
    sharedImages: [],
    filteredImages: []
  },

  onLoad() {
    this.filterImages();
    this.loadSharedImages();
  },

  switchCategory(e) {
    const categoryId = e.currentTarget.dataset.id;
    this.setData({ currentCategory: categoryId });
    this.filterImages();
  },

  filterImages() {
    const { currentCategory, officialImages, sharedImages } = this.data;

    if (currentCategory === 'shared') {
      this.setData({ filteredImages: sharedImages });
      return;
    }

    let filtered = officialImages.filter(img => {
      return currentCategory === 'all' || img.category === currentCategory;
    });

    this.setData({ filteredImages: filtered });
  },

  async loadSharedImages() {
    try {
      const res = await wx.cloud.database().collection('shared_avatars')
        .where({ status: 1 })
        .orderBy('createTime', 'desc')
        .limit(50)
        .get();

      const sharedImages = (res.data || []).map(item => ({
        id: item._id,
        url: item.avatarUrl,
        name: item.nickname || '用户作品',
        likes: item.likes || 0,
        category: 'shared',
        isShared: true
      }));

      this.setData({ sharedImages });
      if (this.data.currentCategory === 'shared') {
        this.setData({ filteredImages: sharedImages });
      }
    } catch (err) {
      console.error('加载共享头像失败', err);
    }
  },

  previewImage(e) {
    const url = e.currentTarget.dataset.url;
    wx.previewImage({
      urls: this.data.filteredImages.map(img => img.url),
      current: url
    });
  },

  onShareAppMessage() {
    return {
      title: '来看看这些超酷的AI头像',
      path: '/pages/gallery/gallery',
      imageUrl: '/images/share-bg.png'
    };
  }
});
