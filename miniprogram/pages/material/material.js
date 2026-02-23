Page({
  data: {
    currentType: 'frame',
    currentCategory: 'all',
    searchKeyword: '',
    categoryTabs: [
      { id: 'all', name: '全部' },
      { id: 'christmas', name: '圣诞' },
      { id: 'midautumn', name: '中秋' },
      { id: 'national', name: '国庆' },
      { id: 'spring', name: '春节' },
      { id: 'game', name: '游戏' },
      { id: 'glasses', name: '眼镜' },
      { id: 'crown', name: '皇冠' },
      { id: 'hat', name: '帽子' },
      { id: 'clip', name: '夹子' },
      { id: 'campus', name: '校园' }
    ],
    frames: [
      // 圣诞分类
      { id: 1, name: '圣诞帽红', image: '/images/frames/christmas_hat_red.png', category: 'christmas', categoryName: '圣诞', tag: '热门' },
      { id: 2, name: '圣诞帽绿', image: '/images/frames/christmas_hat_green.png', category: 'christmas', categoryName: '圣诞' },
      { id: 3, name: '圣诞树框', image: '/images/frames/christmas_tree.png', category: 'christmas', categoryName: '圣诞', tag: '热门' },
      { id: 4, name: '雪花边框', image: '/images/frames/snowflake.png', category: 'christmas', categoryName: '圣诞' },
      // 中秋分类
      { id: 5, name: '月亮框', image: '/images/frames/moon.png', category: 'midautumn', categoryName: '中秋', tag: '热门' },
      { id: 6, name: '兔子框', image: '/images/frames/rabbit.png', category: 'midautumn', categoryName: '中秋' },
      // 国庆分类
      { id: 7, name: '国旗框', image: '/images/frames/flag_china.png', category: 'national', categoryName: '国庆', tag: '热门' },
      { id: 8, name: '五角星框', image: '/images/frames/star.png', category: 'national', categoryName: '国庆' },
      // 春节分类
      { id: 9, name: '福字框', image: '/images/frames/fu.png', category: 'spring', categoryName: '春节', tag: '热门' },
      { id: 10, name: '灯笼框', image: '/images/frames/lantern.png', category: 'spring', categoryName: '春节' },
      // 游戏分类
      { id: 11, name: '电竞框', image: '/images/frames/esport.png', category: 'game', categoryName: '游戏', tag: '热门' },
      { id: 12, name: '像素框', image: '/images/frames/pixel.png', category: 'game', categoryName: '游戏' },
      // 眼镜分类
      { id: 13, name: '墨镜', image: '/images/frames/sunglasses.png', category: 'glasses', categoryName: '眼镜' },
      { id: 14, name: '游戏眼镜', image: '/images/frames/game_glasses.png', category: 'glasses', categoryName: '眼镜' },
      // 皇冠分类
      { id: 15, name: '金色皇冠', image: '/images/frames/crown_gold.png', category: 'crown', categoryName: '皇冠', tag: '热门' },
      { id: 16, name: '银色皇冠', image: '/images/frames/crown_silver.png', category: 'crown', categoryName: '皇冠' },
      // 帽子分类
      { id: 17, name: '棒球帽', image: '/images/frames/baseball_cap.png', category: 'hat', categoryName: '帽子' },
      { id: 18, name: '鸭舌帽', image: '/images/frames/cap.png', category: 'hat', categoryName: '帽子' },
      // 夹子分类
      { id: 19, name: '星星夹', image: '/images/frames/star_clip.png', category: 'clip', categoryName: '夹子' },
      { id: 20, name: '爱心夹', image: '/images/frames/heart_clip.png', category: 'clip', categoryName: '夹子' },
      // 校园分类
      { id: 21, name: '学士帽', image: '/images/frames/graduation_cap.png', category: 'campus', categoryName: '校园', tag: '热门' },
      { id: 22, name: '校徽框', image: '/images/frames/school_badge.png', category: 'campus', categoryName: '校园' }
    ],
    stickers: [
      // 圣诞贴纸
      { id: 1, name: '圣诞树', image: '/images/stickers/christmas_tree.png', category: 'christmas', categoryName: '圣诞' },
      { id: 2, name: '圣诞老人', image: '/images/stickers/santa.png', category: 'christmas', categoryName: '圣诞' },
      { id: 3, name: '礼物盒', image: '/images/stickers/gift.png', category: 'christmas', categoryName: '圣诞' },
      { id: 4, name: '雪花', image: '/images/stickers/snow.png', category: 'christmas', categoryName: '圣诞' },
      // 国庆贴纸
      { id: 5, name: '国旗', image: '/images/stickers/flag_china.png', category: 'national', categoryName: '国庆', tag: '热门' },
      { id: 6, name: '中国心', image: '/images/stickers/china_heart.png', category: 'national', categoryName: '国庆' },
      { id: 7, name: '国徽', image: '/images/stickers/emblem.png', category: 'national', categoryName: '国庆' },
      // 爱心贴纸
      { id: 8, name: '红色爱心', image: '/images/stickers/heart_red.png', category: 'love', categoryName: '爱心' },
      { id: 9, name: '粉色爱心', image: '/images/stickers/heart_pink.png', category: 'love', categoryName: '爱心' },
      { id: 10, name: '彩虹爱心', image: '/images/stickers/heart_rainbow.png', category: 'love', categoryName: '爱心' },
      // 装饰贴纸
      { id: 11, name: '星星', image: '/images/stickers/star.png', category: 'decoration', categoryName: '装饰', tag: '热门' },
      { id: 12, name: '月亮', image: '/images/stickers/moon.png', category: 'decoration', categoryName: '装饰' },
      { id: 13, name: '花朵', image: '/images/stickers/flower.png', category: 'decoration', categoryName: '装饰' },
      { id: 14, name: '彩虹', image: '/images/stickers/rainbow.png', category: 'decoration', categoryName: '装饰' },
      // 节日贴纸
      { id: 15, name: '烟花', image: '/images/stickers/firework.png', category: 'festival', categoryName: '节日', tag: '热门' },
      { id: 16, name: '灯笼', image: '/images/stickers/lantern.png', category: 'festival', categoryName: '节日' },
      { id: 17, name: '蛋糕', image: '/images/stickers/cake.png', category: 'birthday', categoryName: '生日' },
      { id: 18, name: '气球', image: '/images/stickers/balloon.png', category: 'birthday', categoryName: '生日' },
      // 其他贴纸
      { id: 19, name: '眼镜贴', image: '/images/stickers/glasses_sticker.png', category: 'accessory', categoryName: '配饰' },
      { id: 20, name: '蝴蝶结', image: '/images/stickers/bow.png', category: 'accessory', categoryName: '配饰' }
    ],
    filteredFrames: [],
    filteredStickers: []
  },

  onLoad() {
    this.filterMaterials();
  },

  switchType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      currentType: type,
      currentCategory: 'all',
      searchKeyword: ''
    });
    this.filterMaterials();
  },

  switchCategory(e) {
    const categoryId = e.currentTarget.dataset.id;
    this.setData({
      currentCategory: categoryId
    });
    this.filterMaterials();
  },

  onSearch(e) {
    const keyword = e.detail.value;
    this.setData({
      searchKeyword: keyword
    });
    this.filterMaterials();
  },

  filterMaterials() {
    const { currentCategory, searchKeyword, frames, stickers } = this.data;

    // 过滤头像框
    let filteredFrames = frames.filter(frame => {
      const matchCategory = currentCategory === 'all' || frame.category === currentCategory;
      const matchSearch = !searchKeyword || frame.name.includes(searchKeyword);
      return matchCategory && matchSearch;
    });

    // 过滤贴纸
    let filteredStickers = stickers.filter(sticker => {
      const matchCategory = currentCategory === 'all' || sticker.category === currentCategory;
      const matchSearch = !searchKeyword || sticker.name.includes(searchKeyword);
      return matchCategory && matchSearch;
    });

    this.setData({
      filteredFrames,
      filteredStickers
    });
  },

  selectMaterial(e) {
    const item = e.currentTarget.dataset.item;
    const type = this.data.currentType;

    // 保存选中的素材到全局
    const app = getApp();
    app.globalData.selectedMaterial = {
      type,
      ...item
    };

    wx.showToast({
      title: '已选择素材',
      icon: 'success'
    });

    // 返回首页
    setTimeout(() => {
      wx.navigateBack();
    }, 500);
  },

  previewImage(e) {
    const url = e.currentTarget.dataset.url;
    wx.previewImage({
      urls: [url]
    });
  }
});
