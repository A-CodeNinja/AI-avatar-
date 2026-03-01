const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  try {
    // 先尝试获取用户，doc().get() 在文档不存在时会抛出错误
    let userRes;
    try {
      userRes = await db.collection('users').doc(openid).get();
    } catch (getErr) {
      // 文档不存在（errCode: -502001），创建新用户
      if (getErr.errCode === -502001 || getErr.errMsg && getErr.errMsg.includes('not exist')) {
        userRes = null;
      } else {
        throw getErr; // 其他错误继续抛出
      }
    }

    if (userRes && userRes.data) {
      // 用户已存在，重置每日广告/分享计数（如果是新的一天）
      const user = userRes.data;
      const today = new Date().toDateString();
      if (user.lastActiveDate !== today) {
        await db.collection('users').doc(openid).update({
          data: {
            adCount: 0,
            shareCount: 0,
            lastActiveDate: today,
            updateTime: Date.now()
          }
        });
        user.adCount = 0;
        user.shareCount = 0;
        user.lastActiveDate = today;
      }
      return {
        code: 0,
        data: user
      };
    } else {
      // 新用户，初始化数据
      const newUser = {
        _id: openid,
        points: 100,
        totalGenerate: 0,
        dailyCheck: {
          lastDate: '',
          streak: 0
        },
        shareCount: 0,
        adCount: 0,
        lastActiveDate: new Date().toDateString(),
        createTime: Date.now(),
        updateTime: Date.now()
      };

      await db.collection('users').add({
        data: newUser
      });

      return {
        code: 0,
        data: newUser
      };
    }
  } catch (err) {
    console.error('获取用户信息失败', err);
    return {
      code: -1,
      msg: '获取用户信息失败: ' + (err.message || err.errMsg || '未知错误')
    };
  }
};

