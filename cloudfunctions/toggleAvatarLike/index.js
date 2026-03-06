const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const _ = db.command;

exports.main = async (event) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const { avatarId = '' } = event || {};

  if (!avatarId) {
    return { code: -1, msg: '缺少头像ID' };
  }

  const likeDocId = `${avatarId}_${openid}`;

  try {
    let liked = false;
    try {
      await db.collection('avatar_likes').doc(likeDocId).get();
      liked = true;
    } catch (err) {
      liked = false;
    }

    if (liked) {
      await db.collection('avatar_likes').doc(likeDocId).remove();
      await db.collection('shared_avatars').doc(avatarId).update({
        data: {
          likes: _.inc(-1),
          updateTime: Date.now()
        }
      });
      return { code: 0, liked: false, delta: -1, msg: '已取消点赞' };
    }

    await db.collection('avatar_likes').add({
      data: {
        _id: likeDocId,
        avatarId,
        _openid: openid,
        createTime: Date.now()
      }
    });

    await db.collection('shared_avatars').doc(avatarId).update({
      data: {
        likes: _.inc(1),
        updateTime: Date.now()
      }
    });

    return { code: 0, liked: true, delta: 1, msg: '点赞成功' };
  } catch (err) {
    console.error('点赞操作失败', err);
    return { code: -1, msg: '点赞失败，请稍后重试' };
  }
};
