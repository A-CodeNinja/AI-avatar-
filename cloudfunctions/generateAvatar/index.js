const cloud = require('wx-server-sdk');
const axios = require('axios');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

const DEEPSEEK_API_KEY = '你的DeepSeek API Key';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

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

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const { fileID, styleType } = event;

  try {
    const userRes = await db.collection('users').doc(openid).get();
    if (!userRes.data) {
      return {
        code: -1,
        msg: '用户不存在'
      };
    }

    const user = userRes.data;
    const COST_POINTS = 10;
    
    if (user.points < COST_POINTS) {
      return {
        code: -1,
        msg: '积分不足'
      };
    }

    await db.collection('users').doc(openid).update({
      data: {
        points: _.inc(-COST_POINTS),
        totalGenerate: _.inc(1),
        updateTime: Date.now()
      }
    });

    await db.collection('points_log').add({
      data: {
        _openid: openid,
        type: 'generate',
        change: -COST_POINTS,
        balance: user.points - COST_POINTS,
        desc: 'AI头像生成',
        createTime: Date.now()
      }
    });

    const aiPrompt = await generateAIPrompt(styleType);

    const resultFileID = await mockGenerateAvatar(fileID);

    const imageRecord = {
      _openid: openid,
      originalFileID: fileID,
      resultFileID: resultFileID,
      style: styleType,
      status: 'success',
      createTime: Date.now()
    };

    await db.collection('images').add({
      data: imageRecord
    });

    return {
      code: 0,
      fileID: resultFileID
    };

  } catch (err) {
    console.error(err);
    return {
      code: -1,
      msg: '生成头像失败'
    };
  }
};

async function generateAIPrompt(styleType) {
  const styleDesc = stylePrompts[styleType] || stylePrompts.anime;
  
  try {
    const response = await axios.post(
      DEEPSEEK_API_URL,
      {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的AI绘画提示词专家，为用户生成高质量的头像绘画提示词。'
          },
          {
            role: 'user',
            content: `请生成一个${styleDesc}的头像绘画提示词，要求：高质量、细节丰富、适合社交媒体使用。只返回提示词，不要其他内容。`
          }
        ],
        max_tokens: 200,
        temperature: 0.7
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        }
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (err) {
    console.error('DeepSeek API调用失败', err);
    return `${styleDesc}，高质量头像`;
  }
}

async function mockGenerateAvatar(fileID) {
  return fileID;
}
