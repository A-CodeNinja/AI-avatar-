const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const { type } = event;

  try {
    const userRes = await db.collection('users').doc(openid).get();
    if (!userRes.data) {
      return {
        code: -1,
        msg: '用户不存在'
      };
    }

    const user = userRes.data;
    let pointsChange = 0;
    let desc = '';
    const today = new Date().toDateString();

    switch (type) {
      case 'signin':
        if (user.dailyCheck.lastDate === today) {
          return {
            code: -1,
            msg: '今日已签到'
          };
        }
        
        let newStreak = 1;
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        if (user.dailyCheck.lastDate === yesterday) {
          newStreak = Math.min(user.dailyCheck.streak + 1, 7);
        }
        
        pointsChange = Math.min(5 + (newStreak - 1) * 3, 20);
        desc = `每日签到，连续${newStreak}天`;
        
        await db.collection('users').doc(openid).update({
          data: {
            points: _.inc(pointsChange),
            'dailyCheck.lastDate': today,
            'dailyCheck.streak': newStreak,
            updateTime: Date.now()
          }
        });
        break;

      case 'ad':
        if (user.adCount >= 3) {
          return {
            code: -1,
            msg: '今日观看广告次数已达上限'
          };
        }
        pointsChange = 10;
        desc = '观看激励视频广告';
        await db.collection('users').doc(openid).update({
          data: {
            points: _.inc(pointsChange),
            adCount: _.inc(1),
            updateTime: Date.now()
          }
        });
        break;

      case 'share':
        if (user.shareCount >= 3) {
          return {
            code: -1,
            msg: '今日分享次数已达上限'
          };
        }
        pointsChange = 5;
        desc = '分享给好友';
        await db.collection('users').doc(openid).update({
          data: {
            points: _.inc(pointsChange),
            shareCount: _.inc(1),
            updateTime: Date.now()
          }
        });
        break;

      default:
        return {
          code: -1,
          msg: '无效的积分变动类型'
        };
    }

    await db.collection('points_log').add({
      data: {
        _openid: openid,
        type: type,
        change: pointsChange,
        balance: user.points + pointsChange,
        desc: desc,
        createTime: Date.now()
      }
    });

    return {
      code: 0,
      points: pointsChange,
      balance: user.points + pointsChange
    };
  } catch (err) {
    console.error(err);
    return {
      code: -1,
      msg: '更新积分失败'
    };
  }
};
