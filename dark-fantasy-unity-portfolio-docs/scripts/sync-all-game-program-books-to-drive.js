const fs = require('fs');
const path = require('path');

const REPO_OWNER = 'PiupiuTenshi';
const REPO_NAME = 'GameProgramBooks';
const BRANCH = process.env.GAME_PROGRAM_BOOKS_BRANCH || 'master';
const DRIVE_ROOT = process.env.GAME_PROGRAM_BOOKS_DRIVE_DIR || 'H:\\My Drive\\Program Books\\GameProgramBooks';
const EXTENSIONS = new Set(['.pdf', '.epub', '.mobi', '.azw3', '.djvu', '.chm']);
const MAX_CONCURRENT = Number(process.env.GAME_PROGRAM_BOOKS_CONCURRENCY || 2);

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

async function main() {
  fs.mkdirSync(DRIVE_ROOT, { recursive: true });

  const books = await listBookFiles();
  const totalBytes = books.reduce((sum, book) => sum + (book.size || 0), 0);
  console.log(`Found ${books.length} book files (${formatBytes(totalBytes)}) in ${REPO_OWNER}/${REPO_NAME}.`);
  console.log(`Target: ${DRIVE_ROOT}`);

  let completed = 0;
  let skipped = 0;
  let downloaded = 0;
  let failed = 0;
  let index = 0;

  async function worker() {
    while (index < books.length) {
      const book = books[index];
      index += 1;

      try {
        const result = await downloadBook(book);
        completed += 1;
        if (result === 'skipped') skipped += 1;
        if (result === 'downloaded') downloaded += 1;
        console.log(`[${completed}/${books.length}] ${result}: ${book.path}`);
      } catch (error) {
        completed += 1;
        failed += 1;
        console.error(`[${completed}/${books.length}] failed: ${book.path}`);
        console.error(`  ${error.message}`);
      }
    }
  }

  await Promise.all(Array.from({ length: Math.max(1, MAX_CONCURRENT) }, worker));
  console.log(`Done. Downloaded: ${downloaded}. Skipped: ${skipped}. Failed: ${failed}.`);
}

async function listBookFiles() {
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/git/trees/${BRANCH}?recursive=1`;
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'CursedBiomesPortfolioBookSync/1.0',
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub tree responded with ${response.status}: ${await response.text()}`);
  }

  const payload = await response.json();
  if (payload.truncated) {
    console.warn('Warning: GitHub tree response is truncated; some files may be missing.');
  }

  return (payload.tree || [])
    .filter((item) => item.type === 'blob' && EXTENSIONS.has(path.extname(item.path).toLowerCase()))
    .sort((a, b) => a.path.localeCompare(b.path));
}

async function downloadBook(book) {
  const target = path.join(DRIVE_ROOT, ...book.path.split('/').map(sanitizeSegment));
  fs.mkdirSync(path.dirname(target), { recursive: true });

  if (fs.existsSync(target)) {
    const stats = fs.statSync(target);
    if (!book.size || stats.size === book.size) return 'skipped';
  }

  const temp = `${target}.download`;
  const rawUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/${book.path.split('/').map(encodeURIComponent).join('/')}`;
  const response = await fetch(rawUrl, {
    headers: { 'User-Agent': 'CursedBiomesPortfolioBookSync/1.0' },
  });

  if (!response.ok) {
    throw new Error(`raw responded with ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(temp, buffer);

  if (book.size && buffer.length !== book.size) {
    throw new Error(`size mismatch, expected ${book.size}, got ${buffer.length}`);
  }

  fs.renameSync(temp, target);
  return 'downloaded';
}

function sanitizeSegment(segment) {
  return segment.replace(/[<>:"\\|?*\u0000-\u001f]/g, '-').trim() || '_';
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;
  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}
