const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'public', 'images', 'books');

const covers = [
  {
    title: 'Game Programming Patterns',
    isbn: '9780990582908',
    file: 'game-programming-patterns.jpg',
  },
  {
    title: 'Clean Code',
    isbn: '9780132350884',
    file: 'clean-code.jpg',
  },
  {
    title: 'Unity in Action',
    isbn: '9781617294969',
    file: 'unity-in-action.jpg',
  },
  {
    title: 'Game Engine Architecture',
    isbn: '9781138035454',
    author: 'Jason Gregory',
    file: 'game-engine-architecture.jpg',
  },
];

fs.mkdirSync(OUT_DIR, { recursive: true });

async function downloadCover(cover) {
  const url = await resolveCoverUrl(cover);
  if (!url) {
    throw new Error(`${cover.title}: no OpenLibrary cover found`);
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${cover.title}: OpenLibrary responded with ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length < 2048) {
    throw new Error(`${cover.title}: cover response was too small`);
  }

  fs.writeFileSync(path.join(OUT_DIR, cover.file), buffer);
  console.log(`${cover.title} -> public/images/books/${cover.file}`);
}

async function resolveCoverUrl(cover) {
  const isbnUrl = `https://covers.openlibrary.org/b/isbn/${cover.isbn}-L.jpg?default=false`;
  const isbnResponse = await fetch(isbnUrl, { method: 'HEAD' });
  if (isbnResponse.ok) return isbnUrl;

  const params = new URLSearchParams({ title: cover.title, limit: '5' });
  if (cover.author) params.set('author', cover.author);

  const searchResponse = await fetch(`https://openlibrary.org/search.json?${params.toString()}`, {
    headers: { Accept: 'application/json' },
  });
  if (!searchResponse.ok) return null;

  const payload = await searchResponse.json();
  const doc = payload.docs?.find((item) => item.cover_i || item.isbn?.length > 0);
  if (doc?.cover_i) return `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg?default=false`;
  if (doc?.isbn?.[0]) return `https://covers.openlibrary.org/b/isbn/${doc.isbn[0]}-L.jpg?default=false`;
  return null;
}

(async () => {
  for (const cover of covers) {
    try {
      await downloadCover(cover);
    } catch (error) {
      console.warn(error.message);
    }
  }
})();
