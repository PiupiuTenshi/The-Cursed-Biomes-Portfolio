const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { createCanvas } = require('@napi-rs/canvas');

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'public', 'images', 'books');

const books = [
  {
    title: 'Game Programming Patterns',
    url: 'https://raw.githubusercontent.com/PiupiuTenshi/GameProgramBooks/master/05.Game%20Programming/Intermediate%20Game%20Programming/Game%20Programming%20Patterns.pdf',
    file: 'game-programming-patterns-page1.png',
  },
  {
    title: 'Clean Code',
    url: 'https://raw.githubusercontent.com/PiupiuTenshi/GameProgramBooks/master/03.Software%20Development/Practice/Clean%20Code.pdf',
    file: 'clean-code-page1.png',
  },
  {
    title: 'Unity in Action',
    url: 'https://raw.githubusercontent.com/PiupiuTenshi/GameProgramBooks/master/05.Game%20Programming/Beginning%20Game%20Programming/From%20Unity/Unity%20In%20Action.pdf',
    file: 'unity-in-action-page1.png',
  },
  {
    title: 'Game Engine Architecture',
    url: 'https://raw.githubusercontent.com/PiupiuTenshi/GameProgramBooks/master/06.Game%20Engine%20Development/Game%20Engine%20Architecture.pdf',
    file: 'game-engine-architecture-page1.png',
  },
];

fs.mkdirSync(OUT_DIR, { recursive: true });

(async () => {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(
    path.join(ROOT, 'node_modules', 'pdfjs-dist', 'legacy', 'build', 'pdf.worker.mjs'),
  ).href;

  for (const book of books) {
    await renderFirstPage(pdfjs, book);
  }
})();

async function renderFirstPage(pdfjs, book) {
  const response = await fetch(book.url);
  if (!response.ok) {
    throw new Error(`${book.title}: PDF responded with ${response.status}`);
  }

  const data = new Uint8Array(await response.arrayBuffer());
  const pdf = await pdfjs.getDocument({
    data,
    disableFontFace: true,
    disableWorker: true,
  }).promise;
  const page = await pdf.getPage(1);
  const initialViewport = page.getViewport({ scale: 1 });
  const scale = Math.min(1.6, Math.max(1.05, 680 / initialViewport.width));
  const viewport = page.getViewport({ scale });
  const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
  const context = canvas.getContext('2d');

  context.fillStyle = '#f6f3eb';
  context.fillRect(0, 0, canvas.width, canvas.height);

  await page.render({
    canvasContext: context,
    viewport,
  }).promise;

  const output = path.join(OUT_DIR, book.file);
  fs.writeFileSync(output, canvas.toBuffer('image/png'));
  console.log(`${book.title} -> public/images/books/${book.file}`);
}
