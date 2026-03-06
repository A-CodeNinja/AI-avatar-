const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  const {
    nickName = '',
    avatarUrl = '',
    gender = 0,
    city = '',
    province = '',
    country = ''
  } = event || {};

  if (!nickName) {
    return { code: -1, msg: '昵称不能为空' };
  }

  const profilePatch = {
    nickName,
    avatarUrl,
    gender,
    city,
    province,
    country,
    updateTime: Date.now()
  };

  try {
    let userExists = true;
    try {
      await db.collection('users').doc(openid).get();
    } catch (err) {
      userExists = false;
    }

    if (userExists) {
      await db.collection('users').doc(openid).update({ data: profilePatch });
    } else {
      await db.collection('users').add({
        data: {
          _id: openid,
          points: 100,
          totalGenerate: 0,
          dailyCheck: { lastDate: '', streak: 0 },
          shareCount: 0,
          adCount: 0,
          lastActiveDate: new Date().toDateString(),
          createTime: Date.now(),
          ...profilePatch
        }
      });
    }

    return { code: 0, msg: '更新成功' };
  } catch (err) {
    console.error('更新用户资料失败', err);
    return { code: -1, msg: '更新用户资料失败' };
  }
};
