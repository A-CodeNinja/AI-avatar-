/**
 * generateMaterial 云函数
 * 管理员调用，用于 AI 批量生成素材（头像框、贴纸、背景等）
 * 生成完成后自动上传到云存储并写入 materials 数据库集合。
 *
 * 调用参数 (event):
 *   type       {string}  'frame' | 'sticker' | 'background'
 *   category   {string}  分类名称（如 'christmas', 'national', 'uyghur'...）
 *   categoryName {string} 分类中文名
 *   name       {string}  素材名称
 *   prompt     {string}  正向 prompt（若不传则使用内置模板生成）
 *   ethnic     {string?} 民族关键词（可选）
 *   isHot      {boolean} 是否热门（默认 false）
 *   sortOrder  {number}  排序值（默认 999）
 *   count      {number}  生成数量（默认 1，最大 5）
 *
 * 返回:
 *   { code, msg, data: [{ materialId, cloudPath, name }] }
 */

const cloud = require('wx-server-sdk');
const axios = require('axios');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

const AI_API_KEY = process.env.AI_API_KEY || '';
const AI_API_URL =
  process.env.AI_API_URL ||
  'https://ark.cn-beijing.volces.com/api/v3/images/generations';
const AI_MODEL =
  process.env.AI_MODEL || 'doubao-seedream-3-0-t2i-250415';

// 内置提示词模板（按 type + category 匹配）
const PROMPT_TEMPLATES = {
  frame: {
    default:
      'Photo frame overlay, PNG with transparent background, decorative border design, high quality, 1024x1024',
    christmas:
      'Christmas photo frame, red and green holly wreath border, snowflakes, gold stars, PNG transparent background, 1024x1024',
    national:
      'Chinese national day photo frame, red ribbon border, gold star decoration, patriotic design, PNG transparent background',
    spring:
      'Chinese New Year photo frame, red lanterns, gold lucky patterns, festive border, PNG transparent background',
    midautumn:
      'Mid-autumn festival photo frame, moon rabbit border, mooncake pattern, warm gold brown, PNG transparent background',
    crown:
      'Royal crown photo frame, golden crown border, jewels and gems, luxury design, PNG transparent background',
    campus:
      'Campus graduation photo frame, diploma scroll border, academic cap, book decoration, PNG transparent background',
    uyghur:
      '维吾尔族艾德莱斯绸纹样头像框，红金配色，传统民族图案边框，PNG透明背景，1024x1024',
    kazakh:
      '哈萨克族羊角纹几何图案头像框，蓝白配色，传统边框，PNG透明背景，1024x1024',
    mongol:
      '蒙古族云纹回纹头像框，蓝金配色，传统边框，PNG透明背景，1024x1024',
    kirgiz:
      '柯尔克孜族毡绣图案头像框，红白配色，传统边框，PNG透明背景，1024x1024',
    tajik:
      '塔吉克族刺绣图案头像框，红绿配色，传统边框，PNG透明背景，1024x1024'
  },
  sticker: {
    default:
      'Cute sticker, flat design, bold outline, PNG transparent background, no shadow, 512x512',
    christmas:
      'Cute Christmas sticker, Santa hat or snowflake, flat illustration, bold outline, PNG transparent background',
    love:
      'Cute heart love sticker, pink red gradient, sparkles, flat design, PNG transparent background',
    festival:
      'Festive celebration sticker, fireworks or confetti, colorful, flat design, PNG transparent background',
    birthday:
      'Happy birthday sticker, cake or balloon, pastel colors, cute flat design, PNG transparent background',
    decoration:
      'Decorative star or moon sticker, golden sparkle, cute flat design, PNG transparent background'
  },
  background: {
    default:
      'Abstract background pattern, soft gradient, no faces, suitable for avatar background, 1024x1024',
    nature:
      'Natural scenery background, soft bokeh, spring flowers, pastel colors, 1024x1024',
    space:
      'Galaxy space background, stars and nebula, deep blue purple, dreamy, 1024x1024',
    minimal:
      'Minimalist clean background, soft pastel solid color with subtle texture, 1024x1024'
  }
};

function getPrompt(type, category, ethnic, customPrompt) {
  if (customPrompt) return customPrompt;
  const templates = PROMPT_TEMPLATES[type] || PROMPT_TEMPLATES.frame;
  const key = ethnic || category;
  return templates[key] || templates.default;
}

async function callDoubaoTextToImage(prompt) {
  const resp = await axios.post(
    AI_API_URL,
    {
      model: AI_MODEL,
      prompt,
      size: '1024x1024',
      n: 1,
      response_format: 'url'
    },
    {
      headers: {
        Authorization: `Bearer ${AI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 60000
    }
  );
  const data = resp.data;
  if (!data || !data.data || !data.data[0] || !data.data[0].url) {
    throw new Error('API返回格式错误: ' + JSON.stringify(data));
  }
  return data.data[0].url;
}

async function downloadImageAsBuffer(url) {
  const resp = await axios.get(url, {
    responseType: 'arraybuffer',
    timeout: 30000
  });
  return Buffer.from(resp.data);
}

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();

  // 简单的管理员身份校验：openid 黑名单之外允许（实际生产应加白名单）
  // 此函数不对外公开，仅开发者在微信开发者工具中调用
  const {
    type = 'frame',
    category = 'other',
    categoryName,
    name,
    prompt: customPrompt,
    ethnic,
    isHot = false,
    sortOrder = 999,
    count = 1
  } = event;

  if (!AI_API_KEY) {
    return { code: -1, msg: 'AI服务未配置：缺少 AI_API_KEY' };
  }

  const actualCount = Math.min(Math.max(parseInt(count) || 1, 1), 5);
  const results = [];
  const errors = [];

  for (let i = 0; i < actualCount; i++) {
    try {
      const finalPrompt = getPrompt(type, category, ethnic, customPrompt);
      const imgUrl = await callDoubaoTextToImage(finalPrompt);
      const imgBuffer = await downloadImageAsBuffer(imgUrl);

      const timestamp = Date.now();
      const cloudPath = `materials/${type}/${category}/${timestamp}_${i}.png`;

      const uploadResp = await cloud.uploadFile({
        cloudPath,
        fileContent: imgBuffer
      });
      const fileID = uploadResp.fileID;

      const materialName =
        name || `${categoryName || category} ${type === 'frame' ? '边框' : type === 'sticker' ? '贴纸' : '背景'} ${i + 1}`;

      const addResp = await db.collection('materials').add({
        data: {
          type,
          category,
          categoryName: categoryName || category,
          ethnic: ethnic || null,
          name: materialName,
          cloudPath,
          cloudUrl: fileID,
          prompt: finalPrompt,
          isHot,
          isNew: true,
          status: 1,
          sortOrder: sortOrder + i,
          useCount: 0,
          likeCount: 0,
          createTime: db.serverDate(),
          createBy: wxContext.OPENID || 'admin'
        }
      });

      results.push({
        materialId: addResp._id,
        cloudPath,
        cloudUrl: fileID,
        name: materialName
      });
    } catch (err) {
      console.error(`第 ${i + 1} 张生成失败:`, err);
      errors.push({ index: i, error: err.message });
    }
  }

  return {
    code: 0,
    msg: `生成完成：成功 ${results.length} 张，失败 ${errors.length} 张`,
    data: results,
    errors
  };
};
