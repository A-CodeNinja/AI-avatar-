const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

exports.main = async (event, context) => {
  try {
    console.log('开始初始化数据库...');

    // 初始化新疆民族头像框素材
    const frames = [
      { _id: 'xj_1', name: '艾德莱斯框', category: 'xj', type: 'frame', image: '/images/frames/xj_frame_1.png', hot: true, createTime: Date.now() },
      { _id: 'xj_2', name: '羊角纹框', category: 'xj', type: 'frame', image: '/images/frames/xj_frame_2.png', hot: true, createTime: Date.now() },
      { _id: 'xj_3', name: '云纹框', category: 'xj', type: 'frame', image: '/images/frames/xj_frame_3.png', hot: false, createTime: Date.now() },
      { _id: 'xj_4', name: '毡绣框', category: 'xj', type: 'frame', image: '/images/frames/xj_frame_4.png', hot: false, createTime: Date.now() },
      { _id: 'xj_5', name: '刺绣框', category: 'xj', type: 'frame', image: '/images/frames/xj_frame_5.png', hot: true, createTime: Date.now() }
    ];

    for (const frame of frames) {
      try {
        await db.collection('materials').doc(frame._id).get();
        console.log(`素材已存在: ${frame.name}`);
      } catch (err) {
        // 不存在则添加
        await db.collection('materials').add({
          data: frame
        });
        console.log(`添加素材: ${frame.name}`);
      }
    }

    return {
      code: 0,
      msg: '数据库初始化成功',
      data: {
        collections: ['users', 'points_log', 'images', 'materials', 'invites'],
        materialsAdded: frames.length
      }
    };
  } catch (err) {
    console.error('数据库初始化失败', err);
    return {
      code: -1,
      msg: '数据库初始化失败: ' + err.message
    };
  }
};
