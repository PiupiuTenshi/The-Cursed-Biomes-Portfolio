const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const FRONTEND = path.join(ROOT, 'frontend');
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
  const source = path.join(FRONTEND, target);
  if (!fs.existsSync(source)) return;

  const destination = path.join(DIST, target);
  const stats = fs.statSync(source);
  if (stats.isDirectory()) {
    fs.cpSync(source, destination, {
      recursive: true,
      filter: (candidate) => {
        const relative = path.relative(FRONTEND, candidate);
        // Cloudflare Workers Assets limits each file to 25 MiB. Books remain
        // available in local Node development and use Drive/GitHub fallbacks
        // after the Cloudflare deploy.
        return !relative.startsWith(`public${path.sep}books${path.sep}`) || !/\.pdf$/i.test(candidate);
      },
    });
    return;
  }

  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
});

console.log(`Static deploy bundle created at ${path.relative(ROOT, DIST)}`);
