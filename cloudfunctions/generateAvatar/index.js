const cloud = require('wx-server-sdk');
const axios = require('axios');
const FormData = require('form-data');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

// 从环境变量读取API密钥（安全做法）
const AI_API_KEY = process.env.AI_API_KEY || '你的AI_API_KEY';
const AI_API_URL = process.env.AI_API_URL || 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
const AI_MODEL = process.env.AI_MODEL || 'ep-20241101-xxxxx';
const AI_TYPE = process.env.AI_TYPE || 'doubao';

// 基础风格提示词
const stylePrompts = {
  anime: '动漫风格，色彩鲜艳，线条流畅，大眼睛，可爱',
  '3d': '3D渲染风格，立体感强，真实光影，CG质感',
  sketch: '素描风格，铅笔手绘，黑白灰，艺术感',
  watercolor: '水彩风格，色彩柔和，晕染效果，清新自然',
  pixel: '像素风格，8位像素，复古游戏，方块感',
  cartoon: '卡通风格，圆润可爱，色彩明快，Q版',
  realistic: '写实风格，真实质感，细节丰富，高清',
  comic: '漫画风格，网点纸，对话框，动感线条'
};

// 民族风格提示词（新增）
const ethnicPrompts = {
  uyghur: '维吾尔族风格，艾德莱斯绸花纹图案，红金配色，传统小花帽元素，民族服饰，新疆特色',
  kazakh: '哈萨克族风格，羊角纹几何图案，蓝白配色，毡房元素，刺绣装饰，草原风情',
  mongol: '蒙古族风格，云纹和回纹图案，蓝金配色，蒙古袍元素，马鞍装饰，大漠风情',
  kirgiz: '柯尔克孜族风格，毡绣图案，红白配色，白毡帽元素，高山民族特色',
  tajik: '塔吉克族风格，精美刺绣图案，红绿配色，雄鹰元素，高原民族特色'
};

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const { fileID, styleType, ethnicType, quality } = event;

  try {
    // 1. 验证用户是否存在
    const userRes = await db.collection('users').doc(openid).get();
    if (!userRes.data) {
      return {
        code: -1,
        msg: '用户不存在'
      };
    }

    const user = userRes.data;
    const COST_POINTS = 10; // 生成头像消耗10积分

    // 2. 检查积分是否充足
    if (user.points < COST_POINTS) {
      return {
        code: -2,
        msg: '积分不足'
      };
    }

    // 3. 扣除积分
    await db.collection('users').doc(openid).update({
      data: {
        points: _.inc(-COST_POINTS),
        totalGenerate: _.inc(1),
        updateTime: Date.now()
      }
    });

    // 4. 记录积分变动
    await db.collection('points_log').add({
      data: {
        _openid: openid,
        type: 'generate',
        change: -COST_POINTS,
        balance: user.points - COST_POINTS,
        desc: ethnicType ? `民族风格头像生成 (${ethnicType})` : 'AI头像生成',
        createTime: Date.now()
      }
    });

    // 5. 生成头像
    wx.logger.info('开始生成头像', { openid, styleType, ethnicType });
    const resultFileID = await generateAvatar(fileID, styleType, ethnicType, quality);
    wx.logger.info('头像生成完成', { openid, resultFileID });

    // 6. 保存生成记录
    const imageRecord = {
      _openid: openid,
      originalFileID: fileID,
      resultFileID: resultFileID,
      style: styleType,
      ethnic: ethnicType || 'none',
      quality: quality || 'normal',
      status: 'success',
      createTime: Date.now()
    };

    await db.collection('images').add({
      data: imageRecord
    });

    return {
      code: 0,
      msg: '生成成功',
      fileID: resultFileID
    };

  } catch (err) {
    wx.logger.error('生成头像失败', err);
    return {
      code: -1,
      msg: err.message || '生成头像失败'
    };
  }
};

/**
 * 生成头像 - 接入真实AI API
 * @param {string} fileID - 原始图片文件ID
 * @param {string} styleType - 风格类型
 * @param {string} ethnicType - 民族类型（可选）
 * @param {string} quality - 质量等级（standard/high）
 */
async function generateAvatar(fileID, styleType, ethnicType, quality) {
  try {
    // 1. 下载用户上传的原始图片
    const downloadRes = await cloud.downloadFile({
      fileID: fileID
    });
    const imageBuffer = downloadRes.fileContent;

    // 2. 构建AI提示词
    const basePrompt = stylePrompts[styleType] || stylePrompts.anime;
    let finalPrompt = basePrompt;

    // 如果选择了民族风格，添加民族风格描述
    if (ethnicType && ethnicPrompts[ethnicType]) {
      finalPrompt = `${ethnicPrompts[ethnicType]}，${basePrompt}`;
    }

    finalPrompt += '，高质量头像，适合社交媒体使用，专业摄影';

    // 3. 调用AI API生成图片
    const generatedImage = await callAIAPI(imageBuffer, finalPrompt, quality);

    // 4. 上传生成的图片到云存储
    const uploadRes = await cloud.uploadFile({
      cloudPath: `generated/${openid}_${Date.now()}.png`,
      fileContent: Buffer.from(generatedImage, 'base64')
    });

    return uploadRes.fileID;

  } catch (err) {
    console.error('生成头像失败', err);
    throw new Error('AI生成失败: ' + err.message);
  }
}

/**
 * 调用AI图像生成API
 * 支持多种AI服务商（豆包、通义千问、智谱AI、Stability AI）
 */
async function callAIAPI(imageBuffer, prompt, quality) {
  const apiType = process.env.AI_TYPE || 'doubao';

  switch (apiType) {
    case 'doubao':
      return await callDoubaoAPI(imageBuffer, prompt, quality);
    case 'qianwen':
      return await callQianwenAPI(imageBuffer, prompt, quality);
    case 'zhipu':
      return await callZhipuAPI(imageBuffer, prompt, quality);
    case 'stability':
      return await callStabilityAPI(imageBuffer, prompt, quality);
    default:
      return await callDoubaoAPI(imageBuffer, prompt, quality);
  }
}

/**
 * 豆包AI - 图像生成
 */
async function callDoubaoAPI(imageBuffer, prompt, quality) {
  try {
    const formData = new FormData();
    formData.append('model', AI_MODEL || 'ep-20241101-xxxxx');
    formData.append('image', imageBuffer.toString('base64'));
    formData.append('prompt', prompt);
    formData.append('size', quality === 'high' ? '1024x1024' : '512x512');
    formData.append('strength', '0.35'); // 风格迁移强度

    const response = await axios.post(
      AI_API_URL,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${AI_API_KEY}`,
          ...formData.getHeaders()
        },
        timeout: 30000 // 30秒超时
      }
    );

    if (response.data && response.data.data && response.data.data[0]) {
      return response.data.data[0].b64_json;
    } else {
      throw new Error('豆包AI返回格式错误');
    }
  } catch (err) {
    console.error('豆包AI调用失败', err);
    throw new Error('豆包AI调用失败');
  }
}

/**
 * 通义千问 - 图像生成
 */
async function callQianwenAPI(imageBuffer, prompt, quality) {
  try {
    const response = await axios.post(
      'https://dashscope.aliyuncs.com/api/v1/services/aigc/image-generation/generation',
      {
        model: 'wanx-v1',
        input: {
          prompt: prompt,
          ref_mode: 'repaint', // 重绘模式
          image: imageBuffer.toString('base64'),
          strength: 0.35
        },
        parameters: {
          size: quality === 'high' ? '1024*1024' : '512*512'
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${AI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    if (response.data && response.data.output && response.data.output.results) {
      return response.data.output.results[0].url;
    } else {
      throw new Error('通义千问返回格式错误');
    }
  } catch (err) {
    console.error('通义千问调用失败', err);
    throw new Error('通义千问调用失败');
  }
}

/**
 * 智谱AI - 图像生成
 */
async function callZhipuAPI(imageBuffer, prompt, quality) {
  try {
    const response = await axios.post(
      'https://open.bigmodel.cn/api/paas/v4/images/generations',
      {
        model: 'cogview-3',
        input: {
          prompt: prompt,
          ref_mode: 'image_to_image', // 图生图
          image: imageBuffer.toString('base64')
        },
        parameters: {
          size: quality === 'high' ? '1024x1024' : '512*512'
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${AI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    if (response.data && response.data.data && response.data.data[0]) {
      return response.data.data[0].b64_json;
    } else {
      throw new Error('智谱AI返回格式错误');
    }
  } catch (err) {
    console.error('智谱AI调用失败', err);
    throw new Error('智谱AI调用失败');
  }
}

/**
 * Stability AI - 备用方案
 */
async function callStabilityAPI(imageBuffer, prompt, quality) {
  try {
    const response = await axios.post(
      'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/image-to-image',
      {
        text_prompts: [{
          text: prompt,
          weight: 1
        }],
        init_image: imageBuffer.toString('base64'),
        init_image_mode: 'IMAGE_STRENGTH',
        image_strength: 0.35,
        cfg_scale: 7,
        samples: 1,
        steps: quality === 'high' ? 40 : 30,
        width: quality === 'high' ? 1024 : 512,
        height: quality === 'high' ? 1024 : 512
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AI_API_KEY}`,
          'Accept': 'application/json'
        },
        timeout: 60000
      }
    );

    if (response.data && response.data.artifacts && response.data.artifacts[0]) {
      return response.data.artifacts[0].base64;
    } else {
      throw new Error('Stability AI返回格式错误');
    }
  } catch (err) {
    console.error('Stability AI调用失败', err);
    throw new Error('Stability AI调用失败');
  }
}
