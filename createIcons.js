const fs = require('fs');
const path = require('path');

// 创建简单PNG函数
function createSimplePNG(r, g, b, alpha = 255) {
  const width = 64;
  const height = 64;
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8);
  ihdr.writeUInt8(2, 9);
  ihdr.writeUInt8(0, 10);
  ihdr.writeUInt8(0, 11);
  ihdr.writeUInt8(0, 12);
  const ihdrChunk = createChunk('IHDR', ihdr);
  
  const scanlineSize = width * 3 + 1;
  const data = Buffer.alloc(height * scanlineSize);
  
  for (let y = 0; y < height; y++) {
    let offset = y * scanlineSize;
    data[offset] = 0;
    offset++;
    
    for (let x = 0; x < width; x++) {
      data[offset++] = r;
      data[offset++] = g;
      data[offset++] = b;
    }
  }
  
  const idatChunk = createChunk('IDAT', data);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));
  
  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = calculateCRC(Buffer.concat([typeBuf, data]));
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc, 0);
  return Buffer.concat([length, typeBuf, data, crcBuf]);
}

function calculateCRC(data) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) {
    crc = crc ^ data[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// 需要创建的缺失图标
const missingIcons = [
  { path: 'images/icons/ad.png', r: 102, g: 126, b: 234 },
  { path: 'images/icons/group.png', r: 76, g: 175, b: 80 },
  { path: 'images/icons/tools.png', r: 255, g: 152, b: 0 },
  { path: 'images/icons/contact.png', r: 33, g: 150, b: 243 },
  { path: 'images/icons/frame.png', r: 156, g: 39, b: 176 },
  { path: 'images/icons/sticker.png', r: 255, g: 87, b: 34 },
  { path: 'images/icons/search.png', r: 117, g: 117, b: 117 },
  { path: 'images/icons/empty.png', r: 204, g: 204, b: 204 },
  { path: 'images/icons/invite.png', r: 76, g: 175, b: 80 },
  { path: 'images/icons/coin.png', r: 255, g: 193, b: 7 },
  { path: 'images/icons/wechat.png', r: 7, g: 193, b: 96 },
  { path: 'images/icons/link.png', r: 96, g: 125, b: 139 },
  { path: 'images/icons/download.png', r: 33, g: 150, b: 243 },
  { path: 'images/icons/shared.png', r: 33, g: 150, b: 243 },
  { path: 'images/icons/like.png', r: 244, g: 67, b: 54 },
  { path: 'images/icons/upload.png', r: 156, g: 39, b: 176 },
  { path: 'images/icons/ai.png', r: 156, g: 39, b: 176 },
  { path: 'images/icons/bianbian.png', r: 76, g: 175, b: 80 },
  { path: 'images/icons/favorite.png', r: 255, g: 152, b: 0 },
  { path: 'images/icons/history.png', r: 117, g: 117, b: 117 },
  // Fun icons
  { path: 'images/fun/ptu.png', r: 156, g: 39, b: 176 },
  { path: 'images/fun/poster.png', r: 255, g: 87, b: 34 },
  { path: 'images/fun/logo.png', r: 33, g: 150, b: 243 },
  { path: 'images/fun/daily.png', r: 76, g: 175, b: 80 },
  // 其他缺失文件
  { path: 'images/invite-bg.png', r: 102, g: 126, b: 234 },
  { path: 'images/share-bg.png', r: 102, g: 126, b: 234 },
  { path: 'images/arrow.png', r: 204, g: 204, b: 204 },
  // 修复0字节文件
  { path: 'images/icons/feedback.png', r: 117, g: 117, b: 117 },
  { path: 'images/icons/info.png', r: 33, g: 150, b: 243 },
  { path: 'images/icons/material.png', r: 156, g: 39, b: 176 },
  { path: 'images/icons/privacy.png', r: 33, g: 150, b: 243 },
  { path: 'images/icons/refresh.png', r: 117, g: 117, b: 117 },
  { path: 'images/icons/share.png', r: 33, g: 150, b: 243 },
  // Styles
  { path: 'images/styles/3d.png', r: 156, g: 39, b: 176 },
  { path: 'images/styles/anime.png', r: 255, g: 152, b: 0 },
  { path: 'images/styles/cartoon.png', r: 255, g: 87, b: 34 },
  { path: 'images/styles/comic.png', r: 76, g: 175, b: 80 },
  { path: 'images/styles/pixel.png', r: 117, g: 117, b: 117 },
  { path: 'images/styles/realistic.png', r: 33, g: 150, b: 243 },
  { path: 'images/styles/sketch.png', r: 96, g: 125, b: 139 },
  { path: 'images/styles/watercolor.png', r: 244, g: 67, b: 54 },
];

const baseDir = __dirname.replace(/\\miniprogram\\images.*/, '') + '/miniprogram';

missingIcons.forEach(icon => {
  const fullPath = path.join(baseDir, icon.path);
  const dir = path.dirname(fullPath);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  const pngData = createSimplePNG(icon.r, icon.g, icon.b);
  fs.writeFileSync(fullPath, pngData);
  console.log(`Created: ${icon.path}`);
});

console.log('Done! All missing icons created.');
