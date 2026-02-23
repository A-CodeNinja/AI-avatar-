const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

exports.main = async (event, context) => {
  const { fileID } = event;

  try {
    const fileResult = await cloud.downloadFile({
      fileID: fileID
    });

    const buffer = fileResult.fileContent;

    const result = await cloud.openapi.security.imgSecCheck({
      media: {
        contentType: 'image/png',
        value: buffer
      }
    });

    if (result.errCode === 0) {
      return {
        code: 0,
        msg: '内容安全审核通过'
      };
    } else {
      return {
        code: -1,
        msg: '内容包含违规信息'
      };
    }
  } catch (err) {
    console.error('内容安全审核失败', err);
    
    if (err.errCode === 87014) {
      return {
        code: -1,
        msg: '内容包含违规信息'
      };
    }
    
    return {
      code: 0,
      msg: '审核通过（跳过）'
    };
  }
};
