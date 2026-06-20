const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const REQUIRED_FILES = [
  'frontend/index.html',
  'backend/server.js',
  'package.json',
  'frontend/src/scripts/site-content.js',
  'frontend/src/scripts/phase1.js',
  'frontend/admin/dashboard.js',
  'frontend/admin/dashboard.html',
  'frontend/public/images/avatar-dark-fantasy-v2.png',
  'frontend/public/audio/track-01.ogg',
  'frontend/public/audio/track-02.ogg',
  'frontend/public/audio/track-03.ogg',
  'frontend/public/audio/track-04.ogg',
  'frontend/public/audio/track-05.ogg',
  'frontend/robots.txt',
  'frontend/sitemap.xml',
  '.env.production.example',
];
const JS_CHECKS = [
  'backend/server.js',
  'frontend/src/scripts/site-content.js',
  'frontend/src/scripts/phase1.js',
  'frontend/admin/dashboard.js',
  'frontend/public/books/reader.js',
  'scripts/build-static.js',
  'scripts/smoke-test.js',
];

const failures = [];

REQUIRED_FILES.forEach((file) => {
  if (!fs.existsSync(path.join(ROOT, file))) failures.push(`Missing required file: ${file}`);
});

JS_CHECKS.forEach((file) => {
  const result = spawnSync(process.execPath, ['--check', file], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    failures.push(`Syntax check failed for ${file}\n${result.stderr || result.stdout}`);
  }
});

const productionEnv = fs.existsSync(path.join(ROOT, '.env.production.example'))
  ? fs.readFileSync(path.join(ROOT, '.env.production.example'), 'utf8')
  : '';

[
  'NODE_ENV=production',
  'ADMIN_GATE_PHRASE=',
  'ADMIN_PASSWORD_SHA256=',
  'NEXT_PUBLIC_SITE_URL=',
].forEach((needle) => {
  if (!productionEnv.includes(needle)) {
    failures.push(`Production env template should include ${needle}`);
  }
});

if (failures.length > 0) {
  console.error('Release check failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Release check passed.');
