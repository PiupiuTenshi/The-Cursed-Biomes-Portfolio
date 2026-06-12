import * as pdfjsLib from '../vendor/pdfjs/pdf.mjs';

pdfjsLib.GlobalWorkerOptions.workerSrc = '../vendor/pdfjs/pdf.worker.mjs';

const statusEl = document.querySelector('[data-status]');
const pagesEl = document.querySelector('[data-pages]');
const titleEl = document.querySelector('[data-title]');
const zoomIn = document.querySelector('[data-zoom-in]');
const zoomOut = document.querySelector('[data-zoom-out]');
const fit = document.querySelector('[data-fit]');
const reload = document.querySelector('[data-reload]');

const params = new URLSearchParams(window.location.search);
const rawFile = params.get('file') || '';
const title = params.get('title') || rawFile.split('/').pop() || 'Book';
let pdfDoc = null;
let scale = 1.15;
let renderToken = 0;

titleEl.textContent = title;
setControls(false);
loadPdf();

zoomIn.addEventListener('click', () => {
  scale = Math.min(scale + 0.15, 2);
  renderPages();
});

zoomOut.addEventListener('click', () => {
  scale = Math.max(scale - 0.15, 0.65);
  renderPages();
});

fit.addEventListener('click', () => {
  scale = window.innerWidth < 720 ? 0.92 : 1.15;
  renderPages();
});

reload.addEventListener('click', loadPdf);

async function loadPdf() {
  try {
    const file = normalizeFile(rawFile);
    if (!file) throw new Error('File PDF khong hop le.');

    setControls(false);
    pagesEl.hidden = true;
    statusEl.hidden = false;
    statusEl.textContent = 'Dang tai PDF...';

    pdfDoc = await pdfjsLib.getDocument({ url: file, useWorkerFetch: false }).promise;
    statusEl.hidden = true;
    pagesEl.hidden = false;
    setControls(true);
    await renderPages();
  } catch (error) {
    statusEl.hidden = false;
    pagesEl.hidden = true;
    statusEl.textContent = `Khong mo duoc sach: ${error.message}`;
    setControls(true);
  }
}

async function renderPages() {
  if (!pdfDoc) return;

  const token = ++renderToken;
  pagesEl.innerHTML = '';

  for (let pageNumber = 1; pageNumber <= pdfDoc.numPages; pageNumber += 1) {
    if (token !== renderToken) return;

    const page = await pdfDoc.getPage(pageNumber);
    const viewport = page.getViewport({ scale });
    const pageWrap = document.createElement('section');
    const label = document.createElement('div');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { alpha: false });
    const outputScale = Math.min(window.devicePixelRatio || 1, 2);

    label.className = 'page-label';
    label.textContent = `Trang ${pageNumber} / ${pdfDoc.numPages}`;
    canvas.width = Math.floor(viewport.width * outputScale);
    canvas.height = Math.floor(viewport.height * outputScale);
    canvas.style.width = `${Math.floor(viewport.width)}px`;
    canvas.style.maxWidth = '100%';
    context.setTransform(outputScale, 0, 0, outputScale, 0, 0);

    pageWrap.className = 'page';
    pageWrap.append(label, canvas);
    pagesEl.append(pageWrap);

    await page.render({ canvasContext: context, viewport }).promise;
  }
}

function normalizeFile(file) {
  if (file.startsWith('public/books/') && file.endsWith('.pdf')) return `../../${file}`;
  if (file.startsWith('/public/books/') && file.endsWith('.pdf')) return file;
  if (file.startsWith('/api/books/inline?')) return file;
  return '';
}

function setControls(enabled) {
  [zoomIn, zoomOut, fit, reload].forEach((button) => {
    button.disabled = !enabled;
  });
}
