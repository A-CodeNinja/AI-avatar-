const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const cloudRoot = path.join(root, 'cloudfunctions');

if (!fs.existsSync(cloudRoot)) {
  console.error('cloudfunctions directory not found');
  process.exit(1);
}

const functionDirs = fs
  .readdirSync(cloudRoot)
  .map((name) => path.join(cloudRoot, name))
  .filter((dir) => fs.existsSync(path.join(dir, 'package.json')));

if (!functionDirs.length) {
  console.log('No cloud function package.json files found.');
  process.exit(0);
}

let failed = 0;

for (const dir of functionDirs) {
  const fnName = path.basename(dir);
  console.log(`\n>>> Installing deps for ${fnName}`);

  const result = spawnSync('npm', ['install', '--no-audit', '--no-fund'], {
    cwd: dir,
    stdio: 'inherit',
    shell: true
  });

  if (result.status !== 0) {
    failed += 1;
    console.error(`Failed: ${fnName}`);
  } else {
    console.log(`Success: ${fnName}`);
  }
}

if (failed > 0) {
  console.error(`\nDone with ${failed} failed function(s).`);
  process.exit(1);
}

console.log('\nDone: all cloud function dependencies installed successfully.');
