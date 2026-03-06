const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const { content = '', contact = '' } = event || {};

  const trimmed = String(content).trim();
  if (trimmed.length < 5) {
    return { code: -1, msg: '反馈内容至少5个字' };
  }

  try {
    await db.collection('feedbacks').add({
      data: {
        _openid: openid,
        content: trimmed,
        contact: String(contact).trim(),
        status: 0,
        createTime: Date.now(),
        updateTime: Date.now()
      }
    });

    return { code: 0, msg: '提交成功' };
  } catch (err) {
    console.error('提交反馈失败', err);
    return { code: -1, msg: '提交反馈失败' };
  }
};
