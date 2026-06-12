const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BOOK_DIR = path.join(ROOT, 'public', 'books');
const PDFJS_SOURCE = path.join(ROOT, 'node_modules', 'pdfjs-dist', 'legacy', 'build');
const PDFJS_TARGET = path.join(ROOT, 'public', 'vendor', 'pdfjs');

const books = [
  {
    title: 'Game Programming Patterns',
    file: 'game-programming-patterns.pdf',
    url: 'https://raw.githubusercontent.com/PiupiuTenshi/GameProgramBooks/master/05.Game%20Programming/Intermediate%20Game%20Programming/Game%20Programming%20Patterns.pdf',
  },
  {
    title: 'Clean Code',
    file: 'clean-code.pdf',
    url: 'https://raw.githubusercontent.com/PiupiuTenshi/GameProgramBooks/master/03.Software%20Development/Practice/Clean%20Code.pdf',
  },
  {
    title: 'Unity In Action',
    file: 'unity-in-action.pdf',
    url: 'https://raw.githubusercontent.com/PiupiuTenshi/GameProgramBooks/master/05.Game%20Programming/Beginning%20Game%20Programming/From%20Unity/Unity%20In%20Action.pdf',
  },
  {
    title: 'Game Engine Architecture',
    file: 'game-engine-architecture.pdf',
    url: 'https://raw.githubusercontent.com/PiupiuTenshi/GameProgramBooks/master/06.Game%20Engine%20Development/Game%20Engine%20Architecture.pdf',
  },
];

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

async function main() {
  fs.mkdirSync(BOOK_DIR, { recursive: true });
  copyPdfjsRuntime();

  for (const book of books) {
    await downloadBook(book);
  }
}

function copyPdfjsRuntime() {
  fs.mkdirSync(PDFJS_TARGET, { recursive: true });

  for (const file of ['pdf.mjs', 'pdf.worker.mjs']) {
    const source = path.join(PDFJS_SOURCE, file);
    const target = path.join(PDFJS_TARGET, file);

    if (!fs.existsSync(source)) {
      throw new Error(`Missing PDF.js runtime file: ${source}`);
    }

    fs.copyFileSync(source, target);
    console.log(`PDF.js -> ${path.relative(ROOT, target)}`);
  }
}

async function downloadBook(book) {
  const target = path.join(BOOK_DIR, book.file);

  if (fs.existsSync(target) && fs.statSync(target).size > 1024 * 1024) {
    console.log(`${book.title} already exists -> ${path.relative(ROOT, target)}`);
    return;
  }

  const response = await fetch(book.url);
  if (!response.ok) {
    throw new Error(`${book.title}: PDF responded with ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(target, buffer);
  console.log(`${book.title} -> ${path.relative(ROOT, target)} (${formatBytes(buffer.length)})`);
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;
  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}
