const http = require('http');

const BASE_URL = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:3001';
const CHECKS = [
  { path: '/', expectStatus: 200 },
  { path: '/api/health', expectStatus: 200, expectBody: '"phase":9' },
  { path: '/robots.txt', expectStatus: 200 },
  { path: '/sitemap.xml', expectStatus: 200 },
  { path: '/src/scripts/phase1.js', expectStatus: 200 },
];

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

async function run() {
  for (const check of CHECKS) {
    const response = await request(check.path);
    if (response.statusCode !== check.expectStatus) {
      throw new Error(`${check.path} returned ${response.statusCode}, expected ${check.expectStatus}`);
    }
    if (check.expectBody && !response.body.includes(check.expectBody)) {
      throw new Error(`${check.path} did not include ${check.expectBody}`);
    }
  }

  console.log(`Smoke checks passed against ${BASE_URL}`);
}

function request(requestPath) {
  return new Promise((resolve, reject) => {
    const url = new URL(requestPath, BASE_URL);
    const req = http.get(url, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => resolve({ statusCode: res.statusCode, body }));
    });

    req.setTimeout(5000, () => {
      req.destroy(new Error(`${requestPath} timed out`));
    });
    req.on('error', reject);
  });
}
