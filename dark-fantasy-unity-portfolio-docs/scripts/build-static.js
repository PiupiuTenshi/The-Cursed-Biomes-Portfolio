const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const COPY_TARGETS = [
  'index.html',
  'admin',
  'public',
  'src',
  'robots.txt',
  'sitemap.xml',
];

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });

COPY_TARGETS.forEach((target) => {
  const source = path.join(ROOT, target);
  if (!fs.existsSync(source)) return;

  const destination = path.join(DIST, target);
  const stats = fs.statSync(source);
  if (stats.isDirectory()) {
    fs.cpSync(source, destination, { recursive: true });
    return;
  }

  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
});

console.log(`Static deploy bundle created at ${path.relative(ROOT, DIST)}`);
