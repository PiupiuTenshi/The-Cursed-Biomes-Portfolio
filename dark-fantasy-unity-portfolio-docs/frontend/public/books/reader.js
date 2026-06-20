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
let pageObserver = null;
const renderedPages = new Map();
const DEFAULT_CHUNK_SIZE = 256 * 1024;

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

    pdfDoc = await loadPdfDocument(file);
    statusEl.hidden = true;
    pagesEl.hidden = false;
    setControls(true);
    buildPageShells();
  } catch (error) {
    statusEl.hidden = false;
    pagesEl.hidden = true;
    statusEl.textContent = `Khong mo duoc sach: ${error.message}`;
    setControls(true);
  }
}

async function renderPages() {
  if (!pdfDoc) return;

  renderToken += 1;
  renderedPages.clear();

  pagesEl.querySelectorAll('.page').forEach((pageWrap) => {
    const canvas = pageWrap.querySelector('canvas');
    const label = pageWrap.querySelector('.page-label');
    canvas.removeAttribute('width');
    canvas.removeAttribute('height');
    canvas.style.removeProperty('width');
    label.textContent = `Trang ${pageWrap.dataset.pageNumber} / ${pdfDoc.numPages}`;
  });

  renderVisiblePages();
}

function buildPageShells() {
  if (!pdfDoc) return;

  pageObserver?.disconnect();
  renderedPages.clear();
  pagesEl.innerHTML = '';

  pageObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) renderPage(entry.target);
      });
    },
    { rootMargin: '900px 0px', threshold: 0.01 },
  );

  for (let pageNumber = 1; pageNumber <= pdfDoc.numPages; pageNumber += 1) {
    const pageWrap = document.createElement('section');
    const label = document.createElement('div');
    const canvas = document.createElement('canvas');

    pageWrap.className = 'page';
    pageWrap.dataset.pageNumber = String(pageNumber);
    pageWrap.style.minHeight = '72vh';
    label.className = 'page-label';
    label.textContent = `Trang ${pageNumber} / ${pdfDoc.numPages}`;

    pageWrap.append(label, canvas);
    pagesEl.append(pageWrap);
    pageObserver.observe(pageWrap);
  }

  renderVisiblePages();
}

function renderVisiblePages() {
  pagesEl.querySelectorAll('.page').forEach((pageWrap) => {
    const rect = pageWrap.getBoundingClientRect();
    if (rect.top < window.innerHeight + 900 && rect.bottom > -900) {
      renderPage(pageWrap);
    }
  });
}

async function renderPage(pageWrap) {
  if (!pdfDoc) return;

  const pageNumber = Number(pageWrap.dataset.pageNumber);
  if (!Number.isFinite(pageNumber) || renderedPages.get(pageNumber) === scale) return;

  const token = renderToken;
  const label = pageWrap.querySelector('.page-label');
  const canvas = pageWrap.querySelector('canvas');
  const context = canvas.getContext('2d', { alpha: false });

  renderedPages.set(pageNumber, scale);
  label.textContent = `Dang ve trang ${pageNumber} / ${pdfDoc.numPages}`;

  const page = await pdfDoc.getPage(pageNumber);
  if (token !== renderToken) return;

  const viewport = page.getViewport({ scale });
  const outputScale = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = Math.floor(viewport.width * outputScale);
  canvas.height = Math.floor(viewport.height * outputScale);
  canvas.style.width = `${Math.floor(viewport.width)}px`;
  canvas.style.maxWidth = '100%';
  context.setTransform(outputScale, 0, 0, outputScale, 0, 0);

  await page.render({ canvasContext: context, viewport }).promise;
  pageWrap.style.minHeight = '';
  label.textContent = `Trang ${pageNumber} / ${pdfDoc.numPages}`;
}

function normalizeFile(file) {
  if (file.startsWith('public/books/') && file.endsWith('.pdf')) return `../../${file}`;
  if (file.startsWith('/public/books/') && file.endsWith('.pdf')) return file;
  if (file.startsWith('/api/books/data?')) return file;
  if (file.startsWith('/api/books/inline?')) return file;
  return '';
}

async function loadPdfDocument(file) {
  if (file.startsWith('/api/books/data?')) {
    return loadChunkedPdfDocument(file);
  }

  return pdfjsLib.getDocument({ url: file, useWorkerFetch: false }).promise;
}

async function loadChunkedPdfDocument(dataUrl) {
  const query = dataUrl.slice(dataUrl.indexOf('?'));
  const metaResponse = await fetch(`/api/books/meta${query}`, { credentials: 'same-origin' });
  if (!metaResponse.ok) throw new Error(`Book meta responded with ${metaResponse.status}`);

  const meta = await metaResponse.json();
  const length = Number(meta.size);
  if (!Number.isSafeInteger(length) || length <= 0) {
    throw new Error('Book size is invalid.');
  }

  const chunkSize = Number(meta.chunkSize) || DEFAULT_CHUNK_SIZE;
  const transport = new ChunkedBookTransport(length, query, chunkSize);
  return pdfjsLib.getDocument({
    range: transport,
    disableAutoFetch: true,
    disableStream: true,
  }).promise;
}

class ChunkedBookTransport extends pdfjsLib.PDFDataRangeTransport {
  constructor(length, query, chunkSize) {
    super(length, null);
    this.query = query;
    this.chunkSize = Math.max(64 * 1024, Math.min(chunkSize, 512 * 1024));
    this.pending = new Map();
  }

  requestDataRange(begin, end) {
    const start = Math.max(0, begin);
    const safeEnd = Math.max(start, end);
    this.fetchRange(start, safeEnd).catch((error) => {
      console.error(error);
    });
  }

  async fetchRange(begin, end) {
    let offset = begin;

    while (offset < end) {
      const length = Math.min(this.chunkSize, end - offset);
      const key = `${offset}:${length}`;

      if (!this.pending.has(key)) {
        this.pending.set(key, this.fetchChunk(offset, length));
      }

      const chunk = await this.pending.get(key);
      this.onDataRange(offset, chunk);
      offset += chunk.length;

      if (chunk.length < length) break;
    }
  }

  async fetchChunk(offset, length) {
    const separator = this.query.includes('?') ? '&' : '?';
    const response = await fetch(`/api/books/chunk${this.query}${separator}offset=${offset}&length=${length}`, {
      credentials: 'same-origin',
    });

    if (!response.ok) {
      throw new Error(`Book chunk responded with ${response.status}`);
    }

    return new Uint8Array(await response.arrayBuffer());
  }
}

function setControls(enabled) {
  [zoomIn, zoomOut, fit, reload].forEach((button) => {
    button.disabled = !enabled;
  });
}
