const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event) => {
  const keepCount = Number(event && event.keepCount) > 0 ? Number(event.keepCount) : 60;

  try {
    const res = await db.collection('shared_avatars')
      .where({ status: 1 })
      .orderBy('likes', 'desc')
      .orderBy('createTime', 'desc')
      .get();

    const activeList = res.data || [];
    if (activeList.length <= keepCount) {
      return {
        code: 0,
        msg: '无需清理',
        total: activeList.length,
        removed: 0,
        keepCount
      };
    }

    const removeList = activeList.slice(keepCount);
    let removed = 0;

    for (const item of removeList) {
      await db.collection('shared_avatars').doc(item._id).update({
        data: {
          status: 0,
          removedReason: 'weekly_cleanup',
          updateTime: Date.now()
        }
      });
      removed += 1;
    }

    return {
      code: 0,
      msg: '清理完成',
      total: activeList.length,
      removed,
      keepCount
    };
  } catch (err) {
    console.error('每周清理失败', err);
    return { code: -1, msg: '每周清理失败' };
  }
};
