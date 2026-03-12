const fs = require('fs');
const path = require('path');

let sharp;
try {
  sharp = require('sharp');
} catch (err) {
  console.error('Missing dependency: sharp');
  console.error('Run in project root: npm install --save-dev sharp');
  process.exit(1);
}

const svgFiles = [
  'home.svg',
  'home-active.svg',
  'material.svg',
  'material-active.svg',
  'gallery.svg',
  'gallery-active.svg',
  'points.svg',
  'points-active.svg',
  'mine.svg',
  'mine-active.svg'
];

async function convertAll() {
  const tabbarDir = __dirname;
  for (const svgFile of svgFiles) {
    const svgPath = path.join(tabbarDir, svgFile);
    const pngPath = path.join(tabbarDir, svgFile.replace('.svg', '.png'));

    if (!fs.existsSync(svgPath)) {
      console.warn(`Skip missing file: ${svgFile}`);
      continue;
    }

    const svgBuffer = fs.readFileSync(svgPath);
    await sharp(svgBuffer)
      .resize(81, 81, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9, adaptiveFiltering: true })
      .toFile(pngPath);

    console.log(`Generated: ${path.basename(pngPath)}`);
  }

  console.log('Done: tabbar PNG icons regenerated from SVG sources.');
}

convertAll().catch((err) => {
  console.error('SVG to PNG conversion failed:', err.message);
  process.exit(1);
});
