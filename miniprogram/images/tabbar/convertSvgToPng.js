const fs = require('fs');
const path = require('path');

// Simple SVG to PNG conversion using canvas (if available) or create placeholder PNGs
const svgFiles = ['home.svg', 'home-active.svg', 'material.svg', 'material-active.svg', 'gallery.svg', 'gallery-active.svg', 'points.svg', 'points-active.svg', 'mine.svg', 'mine-active.svg'];

// Since we don't have canvas library, we'll create simple colored PNG placeholders
// The PNG format requires specific headers - we'll create minimal valid PNGs

function createSimplePNG(r, g, b, alpha = 255) {
  // Create a minimal 32x32 PNG with the specified color
  const width = 32;
  const height = 32;
  
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8);  // bit depth
  ihdr.writeUInt8(2, 9);  // color type (RGB)
  ihdr.writeUInt8(0, 10); // compression
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace
  
  const ihdrChunk = createChunk('IHDR', ihdr);
  
  // IDAT chunk with raw scanlines (no compression)
  const scanlineSize = width * 3 + 1; // 3 bytes per pixel + 1 filter byte
  const data = Buffer.alloc(height * scanlineSize);
  
  for (let y = 0; y < height; y++) {
    let offset = y * scanlineSize;
    data[offset] = 0; // filter type 0 (none)
    offset++;
    
    for (let x = 0; x < width; x++) {
      data[offset++] = r;
      data[offset++] = g;
      data[offset++] = b;
    }
  }
  
  const idatChunk = createChunk('IDAT', data);
  
  // IEND chunk
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

// Color mapping for different icons
const colors = {
  'home': { r: 156, g: 163, b: 175 },      // #9CA3AF (gray)
  'home-active': { r: 102, g: 126, b: 234 }, // #667EEA (purple)
  'material': { r: 156, g: 163, b: 175 },
  'material-active': { r: 102, g: 126, b: 234 },
  'gallery': { r: 156, g: 163, b: 175 },
  'gallery-active': { r: 102, g: 126, b: 234 },
  'points': { r: 156, g: 163, b: 175 },
  'points-active': { r: 102, g: 126, b: 234 },
  'mine': { r: 156, g: 163, b: 175 },
  'mine-active': { r: 102, g: 126, b: 234 }
};

// Create PNG files
const tabbarDir = __dirname;

svgFiles.forEach(svgFile => {
  const baseName = svgFile.replace('.svg', '');
  const color = colors[baseName];
  
  if (color) {
    const pngData = createSimplePNG(color.r, color.g, color.b);
    const pngPath = path.join(tabbarDir, `${baseName}.png`);
    fs.writeFileSync(pngPath, pngData);
    console.log(`Created: ${pngPath}`);
  }
});

console.log('Done! All PNG files created.');
