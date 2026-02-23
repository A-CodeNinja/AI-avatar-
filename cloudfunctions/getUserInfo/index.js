const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  try {
    const userRes = await db.collection('users').doc(openid).get();
    
    if (userRes.data) {
      return {
        code: 0,
        data: userRes.data
      };
    } else {
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
    console.error(err);
    return {
      code: -1,
      msg: '获取用户信息失败'
    };
  }
};
