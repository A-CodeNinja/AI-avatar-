const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const cloudRoot = path.join(root, 'cloudfunctions');
const miniRoot = path.join(root, 'miniprogram');

function walk(dir, matcher, files = []) {
  if (!fs.existsSync(dir)) return files;
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of list) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      walk(full, matcher, files);
    } else if (matcher(full)) {
      files.push(full);
    }
  }
  return files;
}

const cloudFunctions = new Set(
  fs.existsSync(cloudRoot)
    ? fs
        .readdirSync(cloudRoot, { withFileTypes: true })
        .filter((d) => d.isDirectory() && fs.existsSync(path.join(cloudRoot, d.name, 'index.js')))
        .map((d) => d.name)
    : []
);

const jsFiles = walk(miniRoot, (f) => f.endsWith('.js'));
const called = new Set();
const matcher = /name\s*:\s*['\"]([a-zA-Z0-9_-]+)['\"]/g;

for (const file of jsFiles) {
  const content = fs.readFileSync(file, 'utf8');
  if (!content.includes('wx.cloud.callFunction')) continue;

  let m;
  while ((m = matcher.exec(content)) !== null) {
    called.add(m[1]);
  }
}

const missing = [...called].filter((name) => !cloudFunctions.has(name));
const unused = [...cloudFunctions].filter((name) => !called.has(name));

console.log('Cloud function call map check');
console.log('--------------------------------');
console.log(`Frontend called: ${called.size}`);
console.log(`Cloud functions existing: ${cloudFunctions.size}`);

if (missing.length) {
  console.log('\nMissing cloud functions (called but not found):');
  missing.forEach((name) => console.log(`- ${name}`));
} else {
  console.log('\nNo missing cloud functions.');
}

if (unused.length) {
  console.log('\nUnused cloud functions (exists but not called from frontend):');
  unused.forEach((name) => console.log(`- ${name}`));
} else {
  console.log('\nNo unused cloud functions.');
}

if (missing.length) {
  process.exit(1);
}
