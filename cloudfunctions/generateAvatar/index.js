const cloud = require('wx-server-sdk');
const axios = require('axios');
const FormData = require('form-data');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

// 从环境变量读取API密钥（安全做法）
const AI_API_KEY = process.env.AI_API_KEY || '';
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

// 百变头像风格提示词
const bianbianPrompts = {
  wedding: '婚纱风格，唯美浪漫，白色婚纱，头纱，花卉装饰，柔和光线，梦幻气息，高贵典雅',
  retro: '复古港风，旗袍，复古妆容，胶片质感，港式美人，迷离眼神，怀旧色调',
  barbie: '芭比粉色风格，芭比娃娃，粉色系，亮片闪耀，时尚甜美，卡通感',
  rich: '暴富财神风，闪亮金光，金色元素，财神爷，笑开颜，金币背景，喜庆大气',
  crystal: '夏日水晶风，透明感，清凉蓝绿，水晶质感，清澈灵动，夏日光晕',
  hkcomic: '复古港漫风，粗线条轮廓，网点纸效果，黑白色调，古早漫画感，香港老漫画',
  astronaut: '宇航员风格，太空头盔，星空背景，宇宙感，科幻未来，银色太空服',
  leisure: '休闲时刻风，慵懒午后，咖啡馆，自然光线，温暖氛围，生活感，文艺气息',
  dopamine: '多巴胺撞色风，高饱和色彩，大胆配色，活力四射，元气满满，霓虹风格',
  summer: '心动初夏风，阳光海滩，清新绿植，夏天氛围，透明感，青春少女',
  seaside: '海边写真风，大海背景，海风，蓝天白云，金色阳光，清爽自然',
  anime: '二次元动漫风，大眼睛，精致五官，二次元角色，华丽服装，细腻画风',
  fantasy: '奇幻风格，精灵，魔法，森林仙境，发光特效，梦幻唯美',
  sweet: '甜心少女风，粉嫩色系，可爱心形，草莓奶油，少女心，软萌',
  cool: '酷炫先锋风，暗黑色调，赛博朋克，霓虹灯光，机械感，冷酷个性',
  dreamy: '梦幻星空风，紫蓝色调，星光闪烁，银河背景，柔和发光，仙气飘飘'
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
  const { fileID, styleType, ethnicType, quality, generationType } = event;

  // 根据生成类型确定消耗积分：AI头像=10分，百变头像=15分
  const COST_POINTS = generationType === 'bianbian' ? 15 : 10;
  const DESC_PREFIX = generationType === 'bianbian' ? '百变头像生成' : (ethnicType ? `民族风格头像生成 (${ethnicType})` : 'AI头像生成');

  try {
    if (!AI_API_KEY) {
      return {
        code: -1,
        msg: 'AI服务未配置：缺少 AI_API_KEY 环境变量'
      };
    }

    // 1. 获取用户信息（兼容文档不存在的情况）
    let user;
    try {
      const userRes = await db.collection('users').doc(openid).get();
      user = userRes.data;
    } catch (getErr) {
      // 用户文档不存在，自动初始化
      if (getErr.errCode === -502001 || (getErr.errMsg && getErr.errMsg.includes('not exist'))) {
        const newUser = {
          _id: openid,
          points: 100,
          totalGenerate: 0,
          dailyCheck: { lastDate: '', streak: 0 },
          shareCount: 0,
          adCount: 0,
          lastActiveDate: new Date().toDateString(),
          createTime: Date.now(),
          updateTime: Date.now()
        };
        await db.collection('users').add({ data: newUser });
        user = newUser;
      } else {
        throw getErr;
      }
    }

    if (!user) {
      return { code: -1, msg: '用户信息获取失败' };
    }

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
        desc: DESC_PREFIX,
        createTime: Date.now()
      }
    });

    // 5. 生成头像
    console.log('开始生成头像', { openid, styleType, ethnicType });
    const resultFileID = await generateAvatar(fileID, styleType, ethnicType, quality, openid);
    console.log('头像生成完成', { openid, resultFileID });

    // 6. 保存生成记录
    const imageRecord = {
      _openid: openid,
      originalFileID: fileID,
      resultFileID: resultFileID,
      style: styleType,
      type: generationType || 'ai',
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
    console.error('生成头像失败', err);
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
 * @param {string} openid - 用户openid，用于云存储路径
 */
async function generateAvatar(fileID, styleType, ethnicType, quality, openid) {
  try {
    // 1. 下载用户上传的原始图片
    const downloadRes = await cloud.downloadFile({
      fileID: fileID
    });
    const imageBuffer = downloadRes.fileContent;

    // 2. 构建AI提示词（基础风格 / 百变风格 均可查找）
    const basePrompt = stylePrompts[styleType] || bianbianPrompts[styleType] || stylePrompts.anime;
    let finalPrompt = basePrompt;

    // 如果选择了民族风格，添加民族风格描述
    if (ethnicType && ethnicPrompts[ethnicType]) {
      finalPrompt = `${ethnicPrompts[ethnicType]}，${basePrompt}`;
    }

    finalPrompt += '，高质量头像，适合社交媒体使用，专业摄影';

    // 3. 调用AI API生成图片（返回 base64 字符串 或 URL）
    const generatedImage = await callAIAPI(imageBuffer, finalPrompt, quality);

    // 4. 上传生成的图片到云存储（兼容 base64 和 URL 两种返回格式）
    const cloudPath = `generated/${openid}_${Date.now()}.png`;
    let fileContent;

    if (generatedImage.startsWith('http://') || generatedImage.startsWith('https://')) {
      // AI 返回的是 URL，先下载再上传到云存储
      const imgRes = await axios.get(generatedImage, { responseType: 'arraybuffer', timeout: 30000 });
      fileContent = Buffer.from(imgRes.data);
    } else {
      // AI 返回的是 base64 字符串（可能带 data URI 前缀）
      const b64 = generatedImage.replace(/^data:image\/[^;]+;base64,/, '');
      fileContent = Buffer.from(b64, 'base64');
    }

    const uploadRes = await cloud.uploadFile({
      cloudPath,
      fileContent
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
 * 豆包AI（火山引擎 Ark）- 图像生成
 * 
 * 🔑 重要说明：
 * 豆包支持两种图像API：
 *  - 文生图（T2I）: POST /api/v3/images/generations  模型: doubao-seedream-3-0-t2i-250415
 *  - 图生图（I2I）: POST /api/v3/images/edits         模型: doubao-seedream-3-0-i2i-250328
 * 
 * AI_TYPE=doubao 时会走此函数；
 * AI_API_URL 应设为图生图端点: https://ark.cn-beijing.volces.com/api/v3/images/edits
 */
async function callDoubaoAPI(imageBuffer, prompt, quality) {
  try {
    // 图生图 API 使用 multipart/form-data
    // 注意：Ark image edits 接口要求 image 字段为二进制文件，不能是 base64 字符串
    const formData = new FormData();
    formData.append('model', AI_MODEL);
    // 使用 Buffer + filename 元信息，确保以 multipart file 方式上传
    formData.append('image', imageBuffer, {
      filename: 'image.png',
      contentType: 'image/png'
    });
    formData.append('prompt', prompt);
    formData.append('n', '1');
    formData.append('size', quality === 'high' ? '1024x1024' : '512x512');
    formData.append('response_format', 'b64_json'); // 以 base64 返回，避免临时 URL 过期

    const imageEditUrl = AI_API_URL.includes('/images/')
      ? AI_API_URL
      : AI_API_URL.replace('/chat/completions', '/images/edits');

    console.log('调用豆包图生图API:', imageEditUrl, '模型:', AI_MODEL);

    const response = await axios.post(
      imageEditUrl,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${AI_API_KEY}`,
          ...formData.getHeaders()
        },
        timeout: 120000 // 图像生成给足 120s
      }
    );

    console.log('豆包AI响应状态:', response.status);

    if (response.data && response.data.data && response.data.data[0]) {
      // 优先取 b64_json，其次取 url
      const result = response.data.data[0].b64_json || response.data.data[0].url;
      if (!result) throw new Error('返回数据中无图像内容');
      return result;
    } else {
      console.error('豆包AI返回数据:', JSON.stringify(response.data));
      throw new Error('豆包AI返回格式错误: ' + JSON.stringify(response.data));
    }
  } catch (err) {
    if (err.response) {
      console.error('豆包AI HTTP错误:', err.response.status, JSON.stringify(err.response.data));
      throw new Error('豆包AI调用失败(' + err.response.status + '): ' + JSON.stringify(err.response.data));
    }
    console.error('豆包AI调用失败:', err.message);
    throw new Error('豆包AI调用失败: ' + err.message);
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
