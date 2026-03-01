/**
 * getPointsLog - 获取用户积分明细云函数
 * 从 points_log 集合中查询当前登录用户的积分变动记录
 */
const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  // 支持分页：page 从 0 开始，pageSize 默认 20
  const { page = 0, pageSize = 20 } = event;
  const skip = page * pageSize;

  try {
    // 查询积分记录总数
    const countRes = await db.collection('points_log')
      .where({ _openid: openid })
      .count();

    // 查询积分记录列表（按时间降序）
    const listRes = await db.collection('points_log')
      .where({ _openid: openid })
      .orderBy('createTime', 'desc')
      .skip(skip)
      .limit(pageSize)
      .get();

    return {
      code: 0,
      data: listRes.data || [],
      total: countRes.total || 0,
      page,
      pageSize
    };
  } catch (err) {
    console.error('获取积分记录失败', err);
    return {
      code: -1,
      msg: '获取积分记录失败: ' + (err.message || err.errMsg || '未知错误'),
      data: [],
      total: 0
    };
  }
};
