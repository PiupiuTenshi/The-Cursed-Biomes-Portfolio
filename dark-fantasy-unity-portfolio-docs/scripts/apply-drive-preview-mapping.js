const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DRIVE_LIST_FILE = path.join(ROOT, 'data', 'drive-books.json');
const SITE_CONTENT_FILE = path.join(ROOT, 'frontend', 'src', 'scripts', 'site-content.js');
const BOOK_EXTENSIONS = /\.(pdf|epub|mobi|azw3|djvu|chm)$/i;

const list = JSON.parse(fs.readFileSync(DRIVE_LIST_FILE, 'utf8').replace(/^\uFEFF/, ''));
const entries = list
  .map((item) => {
    const repoPath = item.path.replace(/^GameProgramBooks\//, '');
    const id = new URL(item.url).searchParams.get('id');
    const match = repoPath
      .split('/')
      .pop()
      .replace(BOOK_EXTENSIONS, '')
      .replace(/[-_]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return {
      match,
      path: repoPath,
      src: `https://drive.google.com/file/d/${id}/preview`,
    };
  })
  .sort((a, b) => a.path.localeCompare(b.path));

const block = [
  '  bookDrivePreviews: [',
  ...entries.map((entry) => (
    `    { match: ${JSON.stringify(entry.match)}, path: ${JSON.stringify(entry.path)}, src: ${JSON.stringify(entry.src)} },`
  )),
  '  ],',
].join('\n');

let source = fs.readFileSync(SITE_CONTENT_FILE, 'utf8');
source = source.replace(
  /  bookDrivePreviews: \[[\s\S]*?\n  \],\n(?=  bookDriveFolderUrl:)/,
  `${block}\n`,
);
fs.writeFileSync(SITE_CONTENT_FILE, source, 'utf8');

console.log(`Updated ${entries.length} Drive preview mappings.`);
