const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const MESSAGES_FILE = path.join(DATA_DIR, 'chat-messages.json');
const EVENTS_FILE = path.join(DATA_DIR, 'visitor-events.json');
const MAX_BODY_BYTES = 16 * 1024;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ogg': 'audio/ogg',
  '.mp3': 'audio/mpeg',
  '.pdf': 'application/pdf',
};

ensureDataFile(MESSAGES_FILE);
ensureDataFile(EVENTS_FILE);

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (req.method === 'GET' && url.pathname === '/api/health') {
      return sendJson(res, 200, {
        ok: true,
        service: 'cursed-biomes-local',
        phase: 4,
        timestamp: new Date().toISOString(),
      });
    }

    if (req.method === 'POST' && url.pathname === '/api/chat/messages') {
      return handleChatMessage(req, res);
    }

    if (req.method === 'POST' && url.pathname === '/api/events') {
      return handleEvent(req, res);
    }

    if (req.method === 'GET' && url.pathname === '/api/admin/messages') {
      return handleAdminMessages(res);
    }

    if (req.method === 'GET') {
      return serveStatic(url.pathname, res);
    }

    sendJson(res, 405, { error: 'Method not allowed' });
  } catch (error) {
    sendJson(res, 500, { error: 'Internal server error', detail: error.message });
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`The Cursed Biomes Portfolio is running at http://127.0.0.1:${PORT}`);
});

async function handleChatMessage(req, res) {
  const payload = await readJsonBody(req);
  const message = normalizeText(payload.message, 1200);
  const contactRaw = normalizeText(payload.contact, 240);

  if (!message) {
    return sendJson(res, 400, { error: 'Message is required' });
  }

  const visitorContact = parseContact(contactRaw);
  const entry = {
    id: `msg_${crypto.randomUUID()}`,
    timestamp: new Date().toISOString(),
    sessionId: normalizeText(payload.sessionId, 120) || `sess_${crypto.randomUUID()}`,
    page: normalizeText(payload.page, 300) || '/',
    language: normalizeText(payload.language, 12) || 'en',
    message,
    visitorContact,
    status: 'unread',
    ip: getClientIp(req),
    userAgent: req.headers['user-agent'] || '',
  };

  appendJsonEntry(MESSAGES_FILE, entry);

  sendJson(res, 201, {
    reply: getBotReply(message, Boolean(visitorContact.email || visitorContact.zalo || visitorContact.raw)),
    saved: true,
    messageId: entry.id,
    actions: getBotActions(message),
  });
}

async function handleEvent(req, res) {
  const payload = await readJsonBody(req);
  const eventType = normalizeText(payload.eventType, 80);

  if (!eventType) {
    return sendJson(res, 400, { error: 'eventType is required' });
  }

  appendJsonEntry(EVENTS_FILE, {
    id: `evt_${crypto.randomUUID()}`,
    timestamp: new Date().toISOString(),
    eventType,
    sessionId: normalizeText(payload.sessionId, 120),
    path: normalizeText(payload.path, 300) || '/',
    referrer: normalizeText(payload.referrer, 500),
    metadata: typeof payload.metadata === 'object' && payload.metadata ? payload.metadata : {},
    ip: getClientIp(req),
    userAgent: req.headers['user-agent'] || '',
  });

  sendJson(res, 201, { ok: true });
}

function handleAdminMessages(res) {
  const messages = readJsonArray(MESSAGES_FILE)
    .slice()
    .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));

  sendJson(res, 200, {
    messages,
    unread: messages.filter((message) => message.status === 'unread').length,
  });
}

function serveStatic(requestPath, res) {
  const cleanPath = decodeURIComponent(requestPath.split('?')[0]);
  const relativePath = cleanPath === '/' ? 'index.html' : cleanPath.replace(/^\/+/, '');
  const absolutePath = path.resolve(ROOT, relativePath);

  if (!absolutePath.startsWith(ROOT)) {
    return sendText(res, 403, 'Forbidden');
  }

  fs.stat(absolutePath, (statError, stats) => {
    if (statError || !stats.isFile()) {
      return sendText(res, 404, 'Not found');
    }

    const ext = path.extname(absolutePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
      'Cache-Control': ext === '.html' ? 'no-store' : 'public, max-age=300',
    });
    fs.createReadStream(absolutePath).pipe(res);
  });
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let total = 0;
    let raw = '';

    req.on('data', (chunk) => {
      total += chunk.length;
      if (total > MAX_BODY_BYTES) {
        reject(new Error('Request body too large'));
        req.destroy();
        return;
      }
      raw += chunk;
    });

    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });

    req.on('error', reject);
  });
}

function getBotReply(message, hasContact) {
  const normalized = message.toLowerCase();

  if (normalized.includes('cv')) {
    return 'I saved your message. You can also use the CV portal while Sang reviews it.';
  }

  if (normalized.includes('zalo') || normalized.includes('contact')) {
    return hasContact
      ? 'Thanks, I saved your contact route for Sang.'
      : 'I saved your message. Add an email or Zalo next time if you want a direct reply path.';
  }

  if (normalized.includes('project') || normalized.includes('github')) {
    return 'Saved. The project relics above sync from GitHub and Sang can follow up from your note.';
  }

  if (normalized.includes('demo') || normalized.includes('webgl') || normalized.includes('unity')) {
    return 'Saved. You can open the Try Now gate for the current WebGL preview while Sang reviews your message.';
  }

  return hasContact
    ? 'Thanks! I saved your message and contact route for Sang.'
    : 'Thanks! I saved your message for Sang. Email or Zalo is optional if you want a reply.';
}

function getBotActions(message) {
  const normalized = message.toLowerCase();
  const actions = [];

  if (normalized.includes('cv')) {
    actions.push({ type: 'open_link', label: 'Download CV', href: 'public/cv/Pham-Minh-Sang-Unity-Developer-CV.pdf' });
  }

  if (normalized.includes('zalo') || normalized.includes('contact')) {
    actions.push({ type: 'open_link', label: 'Open Zalo', href: 'https://zalo.me/0898087507' });
  }

  if (normalized.includes('demo') || normalized.includes('webgl') || normalized.includes('unity')) {
    actions.push({ type: 'open_section', label: 'Try Now', href: '#try-now' });
  }

  if (normalized.includes('project') || normalized.includes('github')) {
    actions.push({ type: 'open_section', label: 'Projects', href: '#projects' });
  }

  return actions;
}

function parseContact(raw) {
  if (!raw) return { email: null, zalo: null, raw: null };

  const email = raw.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || null;
  const zalo = raw.match(/(?:zalo\s*:?\s*)?(\+?\d[\d\s.-]{7,})/i)?.[1]?.replace(/\s+/g, '') || null;

  return { email, zalo, raw };
}

function normalizeText(value, maxLength) {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/\s+/g, ' ').slice(0, maxLength);
}

function ensureDataFile(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '[]\n', 'utf8');
  }
}

function readJsonArray(filePath) {
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function appendJsonEntry(filePath, entry) {
  const data = readJsonArray(filePath);
  data.push(entry);
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || '';
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(payload));
}

function sendText(res, statusCode, text) {
  res.writeHead(statusCode, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(text);
}
