const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = __dirname;
const ENV = loadEnv(path.join(ROOT, '.env.local'));
const PORT = Number(process.env.PORT || ENV.PORT || 3000);
const DATA_DIR = path.join(ROOT, 'data');
const MESSAGES_FILE = path.join(DATA_DIR, 'chat-messages.json');
const EVENTS_FILE = path.join(DATA_DIR, 'visitor-events.json');
const AUDIT_FILE = path.join(DATA_DIR, 'admin-audit.json');
const REPO_SETTINGS_FILE = path.join(ROOT, 'src', 'config', 'repo-settings.json');
const MAX_BODY_BYTES = 16 * 1024;
const GATE_TTL_MS = 5 * 60 * 1000;
const SESSION_TTL_MS = 2 * 60 * 60 * 1000;
const ADMIN_GATE_PHRASE = ENV.ADMIN_GATE_PHRASE || 'moonlit-biomes';
const ADMIN_PASSWORD = ENV.ADMIN_PASSWORD || 'admin123';
const ADMIN_PASSWORD_SHA256 = ENV.ADMIN_PASSWORD_SHA256 || '';

const gateTokens = new Map();
const adminSessions = new Map();

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
ensureDataFile(AUDIT_FILE);

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (req.method === 'GET' && url.pathname === '/api/health') {
      return sendJson(res, 200, {
        ok: true,
        service: 'cursed-biomes-local',
        phase: 6,
        timestamp: new Date().toISOString(),
      });
    }

    if (req.method === 'POST' && url.pathname === '/api/chat/messages') {
      return handleChatMessage(req, res);
    }

    if (req.method === 'POST' && url.pathname === '/api/events') {
      return handleEvent(req, res);
    }

    if (req.method === 'POST' && url.pathname === '/api/admin/login') {
      return handleAdminLogin(req, res);
    }

    if (req.method === 'POST' && url.pathname === '/api/admin/logout') {
      return handleAdminLogout(req, res);
    }

    if (url.pathname.startsWith('/api/admin/')) {
      const session = getAdminSession(req);
      if (!session) {
        return sendJson(res, 401, { error: 'Admin session required' });
      }

      if (req.method === 'GET' && url.pathname === '/api/admin/session') {
        return sendJson(res, 200, { ok: true, session });
      }

      if (req.method === 'GET' && url.pathname === '/api/admin/messages') {
        return handleAdminMessages(res);
      }

      if (req.method === 'PATCH' && url.pathname.startsWith('/api/admin/messages/')) {
        return handleAdminMessagePatch(req, res, url.pathname.split('/').pop(), session);
      }

      if (req.method === 'GET' && url.pathname === '/api/admin/events') {
        return handleAdminEvents(res);
      }

      if (req.method === 'GET' && url.pathname === '/api/admin/repos') {
        return handleAdminRepos(res);
      }

      if (req.method === 'GET' && url.pathname === '/api/admin/audit') {
        return handleAdminAudit(res);
      }

      return sendJson(res, 404, { error: 'Admin endpoint not found' });
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
  const sessionId = normalizeText(payload.sessionId, 120) || `sess_${crypto.randomUUID()}`;

  if (!message) {
    return sendJson(res, 400, { error: 'Message is required' });
  }

  const gateResult = handleGateCommand(message, req, sessionId);
  if (gateResult) {
    return sendJson(res, gateResult.accepted ? 202 : 403, gateResult.body);
  }

  const visitorContact = parseContact(contactRaw);
  const entry = {
    id: `msg_${crypto.randomUUID()}`,
    timestamp: new Date().toISOString(),
    sessionId,
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

function handleGateCommand(message, req, sessionId) {
  const match = message.match(/^\/open\s+gate\s*:\s*(.+)$/i);
  if (!match) return null;

  const phrase = normalizeText(match[1], 160);
  const accepted = timingSafeEqualText(phrase, ADMIN_GATE_PHRASE);

  appendJsonEntry(AUDIT_FILE, {
    id: `aud_${crypto.randomUUID()}`,
    timestamp: new Date().toISOString(),
    action: accepted ? 'ADMIN_GATE_ACCEPTED' : 'ADMIN_GATE_DENIED',
    sessionId,
    ip: getClientIp(req),
    userAgent: req.headers['user-agent'] || '',
    metadata: { command: '/open gate: ***' },
  });

  if (!accepted) {
    return {
      accepted: false,
      body: {
        reply: 'Gate denied. The phrase did not match.',
        saved: false,
      },
    };
  }

  const token = `gate_${crypto.randomUUID()}`;
  gateTokens.set(token, {
    createdAt: Date.now(),
    expiresAt: Date.now() + GATE_TTL_MS,
    sessionId,
    used: false,
  });

  return {
    accepted: true,
    body: {
      reply: 'Gate accepted. Continue to the hidden sanctum.',
      saved: false,
      adminUrl: `/admin/login.html?gateToken=${encodeURIComponent(token)}`,
      actions: [
        {
          type: 'open_link',
          label: 'Open Admin Gate',
          href: `/admin/login.html?gateToken=${encodeURIComponent(token)}`,
        },
      ],
    },
  };
}

async function handleAdminLogin(req, res) {
  const payload = await readJsonBody(req);
  const gateToken = normalizeText(payload.gateToken, 120);
  const password = typeof payload.password === 'string' ? payload.password : '';
  const tokenState = gateTokens.get(gateToken);

  if (!tokenState || tokenState.used || tokenState.expiresAt < Date.now()) {
    appendAudit(req, 'ADMIN_LOGIN_DENIED', { reason: 'invalid_gate_token' });
    return sendJson(res, 401, { error: 'Invalid or expired gate token' });
  }

  if (!verifyAdminPassword(password)) {
    appendAudit(req, 'ADMIN_LOGIN_DENIED', { reason: 'invalid_password' });
    return sendJson(res, 401, { error: 'Invalid password' });
  }

  tokenState.used = true;
  const sessionToken = `adm_${crypto.randomUUID()}`;
  const session = {
    id: `admin_${crypto.randomUUID()}`,
    createdAt: new Date().toISOString(),
    expiresAt: Date.now() + SESSION_TTL_MS,
    ip: getClientIp(req),
  };

  adminSessions.set(sessionToken, session);
  appendAudit(req, 'ADMIN_LOGIN_SUCCESS', { sessionId: session.id });

  res.writeHead(200, {
    'Content-Type': 'application/json; charset=utf-8',
    'Set-Cookie': makeCookie('admin_session', sessionToken, SESSION_TTL_MS),
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify({ ok: true, redirectTo: '/admin/dashboard.html' }));
}

function handleAdminLogout(req, res) {
  const token = parseCookies(req).admin_session;
  if (token) {
    adminSessions.delete(token);
  }

  appendAudit(req, 'ADMIN_LOGOUT', {});
  res.writeHead(200, {
    'Content-Type': 'application/json; charset=utf-8',
    'Set-Cookie': makeCookie('admin_session', '', 0),
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify({ ok: true }));
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

async function handleAdminMessagePatch(req, res, messageId, session) {
  const payload = await readJsonBody(req);
  const messages = readJsonArray(MESSAGES_FILE);
  const message = messages.find((item) => item.id === messageId);

  if (!message) {
    return sendJson(res, 404, { error: 'Message not found' });
  }

  if (payload.status === 'read' || payload.status === 'unread') {
    message.status = payload.status;
  }

  if (typeof payload.replyNote === 'string') {
    message.replyNote = normalizeText(payload.replyNote, 600);
  }

  message.updatedAt = new Date().toISOString();
  fs.writeFileSync(MESSAGES_FILE, `${JSON.stringify(messages, null, 2)}\n`, 'utf8');
  appendJsonEntry(AUDIT_FILE, {
    id: `aud_${crypto.randomUUID()}`,
    timestamp: new Date().toISOString(),
    action: 'ADMIN_MESSAGE_UPDATED',
    sessionId: session.id,
    ip: session.ip,
    metadata: { messageId, status: message.status },
  });

  sendJson(res, 200, { ok: true, message });
}

function handleAdminEvents(res) {
  const events = readJsonArray(EVENTS_FILE)
    .slice()
    .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));

  sendJson(res, 200, {
    events,
    total: events.length,
  });
}

function handleAdminRepos(res) {
  sendJson(res, 200, {
    repos: readJsonArray(REPO_SETTINGS_FILE),
  });
}

function handleAdminAudit(res) {
  const audit = readJsonArray(AUDIT_FILE)
    .slice()
    .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));

  sendJson(res, 200, {
    audit,
    total: audit.length,
  });
}

function getAdminSession(req) {
  const token = parseCookies(req).admin_session;
  if (!token) return null;

  const session = adminSessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    adminSessions.delete(token);
    return null;
  }

  return session;
}

function verifyAdminPassword(password) {
  if (ADMIN_PASSWORD_SHA256) {
    return timingSafeEqualText(sha256(password), ADMIN_PASSWORD_SHA256);
  }
  return timingSafeEqualText(password, ADMIN_PASSWORD);
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
      'Cache-Control': ['.html', '.css', '.js'].includes(ext) ? 'no-store' : 'public, max-age=300',
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

function appendAudit(req, action, metadata) {
  appendJsonEntry(AUDIT_FILE, {
    id: `aud_${crypto.randomUUID()}`,
    timestamp: new Date().toISOString(),
    action,
    ip: getClientIp(req),
    userAgent: req.headers['user-agent'] || '',
    metadata,
  });
}

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || '';
}

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const env = {};
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const index = trimmed.indexOf('=');
    if (index === -1) return;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim();
    env[key] = value;
  });

  return env;
}

function parseCookies(req) {
  const cookie = req.headers.cookie || '';
  return Object.fromEntries(
    cookie.split(';').map((part) => {
      const [key, ...rest] = part.trim().split('=');
      return [key, decodeURIComponent(rest.join('='))];
    }).filter(([key]) => key),
  );
}

function makeCookie(name, value, maxAgeMs) {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${Math.floor(maxAgeMs / 1000)}`,
  ];
  return parts.join('; ');
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function timingSafeEqualText(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
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
