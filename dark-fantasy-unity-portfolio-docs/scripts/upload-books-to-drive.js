const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BOOK_DIR = path.join(ROOT, 'frontend', 'public', 'books');
const DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || '1v2XRK1AjALAxpOGVX1YiVfSWEcj2a3D5';
const ACCESS_TOKEN = process.env.GOOGLE_DRIVE_ACCESS_TOKEN || '';

const books = [
  { match: 'game programming patterns', file: 'game-programming-patterns.pdf' },
  { match: 'clean code', file: 'clean-code.pdf' },
  { match: 'unity in action', file: 'unity-in-action.pdf' },
  { match: 'game engine architecture', file: 'game-engine-architecture.pdf' },
];

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});

async function main() {
  if (!ACCESS_TOKEN) {
    throw new Error('Missing GOOGLE_DRIVE_ACCESS_TOKEN. Create an OAuth access token, then run this script again.');
  }

  const uploaded = [];

  for (const book of books) {
    const filePath = path.join(BOOK_DIR, book.file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Missing local book: ${path.relative(ROOT, filePath)}`);
    }

    const file = await uploadFile(filePath, book.file);
    await makePublic(file.id);
    uploaded.push({
      match: book.match,
      src: `https://drive.google.com/file/d/${file.id}/preview`,
      name: file.name,
    });
  }

  console.log('Paste this into frontend/src/scripts/site-content.js:');
  console.log('bookDrivePreviews: [');
  uploaded.forEach((book) => {
    console.log(`  { match: '${book.match}', src: '${book.src}' },`);
  });
  console.log('],');
}

async function uploadFile(filePath, name) {
  const metadata = {
    name,
    parents: [DRIVE_FOLDER_ID],
    mimeType: 'application/pdf',
  };
  const boundary = `portfolio_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  const fileBuffer = fs.readFileSync(filePath);
  const body = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`),
    Buffer.from(`--${boundary}\r\nContent-Type: application/pdf\r\n\r\n`),
    fileBuffer,
    Buffer.from(`\r\n--${boundary}--\r\n`),
  ]);

  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
      'Content-Length': String(body.length),
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`Upload failed for ${name}: ${response.status} ${await response.text()}`);
  }

  const file = await response.json();
  console.log(`${name} -> ${file.id}`);
  return file;
}

async function makePublic(fileId) {
  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      role: 'reader',
      type: 'anyone',
    }),
  });

  if (!response.ok) {
    throw new Error(`Permission update failed for ${fileId}: ${response.status} ${await response.text()}`);
  }
}
