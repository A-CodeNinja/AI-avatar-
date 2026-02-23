/**
 * 数据库初始化脚本
 * 使用方法：在微信开发者工具 -> 云开发 -> 数据库 -> 高级功能 -> JavaScript 脚本 中运行
 */

const db = cloud.database();
const _ = db.command;

// 初始化数据库集合
async function initDatabase() {
  try {
    console.log('开始初始化数据库...');

    // 1. users 集合 - 用户数据
    // 无需手动创建集合，首次添加文档时会自动创建
    console.log('✓ users 集合准备就绪');

    // 2. points_log 集合 - 积分变动记录
    // 无需手动创建集合，首次添加文档时会自动创建
    console.log('✓ points_log 集合准备就绪');

    // 3. images 集合 - 生成的图片记录
    // 无需手动创建集合，首次添加文档时会自动创建
    console.log('✓ images 集合准备就绪');

    // 4. materials 集合 - 头像框和贴纸素材
    // 初始化新疆民族头像框
    const frames = [
      { id: 'xj_1', name: '艾德莱斯框', category: 'xj', image: '/images/frames/xj_frame_1.png', hot: true },
      { id: 'xj_2', name: '羊角纹框', category: 'xj', image: '/images/frames/xj_frame_2.png', hot: true },
      { id: 'xj_3', name: '云纹框', category: 'xj', image: '/images/frames/xj_frame_3.png', hot: false },
      { id: 'xj_4', name: '毡绣框', category: 'xj', image: '/images/frames/xj_frame_4.png', hot: false },
      { id: 'xj_5', name: '刺绣框', category: 'xj', image: '/images/frames/xj_frame_5.png', hot: true }
    ];

    for (const frame of frames) {
      try {
        await db.collection('materials').doc(frame.id).get();
        // 如果已存在则跳过
      } catch (err) {
        // 不存在则添加
        await db.collection('materials').add({
          data: {
            ...frame,
            type: 'frame',
            createTime: Date.now()
          }
        });
      }
    }
    console.log('✓ materials 集合初始化完成');

    // 5. invites 集合 - 邀请记录
    // 无需手动创建集合
    console.log('✓ invites 集合准备就绪');

    console.log('数据库初始化完成！');
    return {
      code: 0,
      msg: '数据库初始化成功'
    };
  } catch (err) {
    console.error('数据库初始化失败', err);
    return {
      code: -1,
      msg: '数据库初始化失败: ' + err.message
    };
  }
}

// 导出给云函数调用
exports.initDatabase = initDatabase;
