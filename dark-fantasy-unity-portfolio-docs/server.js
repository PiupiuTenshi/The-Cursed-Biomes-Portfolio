const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const net = require('net');
const tls = require('tls');
const { Readable } = require('stream');

const ROOT = __dirname;
const ENV = {
  ...loadEnv(path.join(ROOT, '.env')),
  ...process.env,
};
const PORT = Number(process.env.PORT || ENV.PORT || 3001);
const NODE_ENV = process.env.NODE_ENV || ENV.NODE_ENV || 'development';
const HOST = process.env.HOST || ENV.HOST || (NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1');
const DATA_DIR = path.join(ROOT, 'data');
const MESSAGES_FILE = path.join(DATA_DIR, 'chat-messages.json');
const EVENTS_FILE = path.join(DATA_DIR, 'visitor-events.json');
const AUDIT_FILE = path.join(DATA_DIR, 'admin-audit.json');
const REPO_SETTINGS_FILE = path.join(ROOT, 'src', 'config', 'repo-settings.json');
const MAX_BODY_BYTES = 16 * 1024;
const GATE_TTL_MS = 5 * 60 * 1000;
const SESSION_TTL_MS = 2 * 60 * 60 * 1000;
const ADMIN_GATE_PHRASE =
  process.env.ADMIN_GATE_PHRASE ||
  ENV.ADMIN_GATE_PHRASE ||
  'moonlit-biomes';

const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD ||
  ENV.ADMIN_PASSWORD ||
  'admin123';

const ADMIN_PASSWORD_SHA256 = normalizePasswordHash(
  process.env.ADMIN_PASSWORD_SHA256 ||
  process.env.ADMIN_PASSWORD_HASH ||
  ENV.ADMIN_PASSWORD_SHA256 ||
  ENV.ADMIN_PASSWORD_HASH ||
  ''
);
function envValue(...keys) {
  for (const key of keys) {
    const value = process.env[key] || ENV[key];
    if (value && String(value).trim()) {
      return String(value).trim();
    }
  }
  return '';
}

const NOTIFY_EMAIL_TO = envValue('NOTIFY_EMAIL_TO', 'ADMIN_NOTIFY_EMAIL');
const NOTIFY_EMAIL_FROM = envValue('NOTIFY_EMAIL_FROM', 'SMTP_FROM', 'SMTP_USER');

const SMTP_HOST = envValue('SMTP_HOST');
const SMTP_PORT = Number(envValue('SMTP_PORT') || 587);
const SMTP_SECURE =
  envValue('SMTP_SECURE').toLowerCase() === 'true' || SMTP_PORT === 465;

const SMTP_USER = envValue('SMTP_USER');
const SMTP_PASS = envValue('SMTP_PASS');
const RESEND_API_KEY = ENV.RESEND_API_KEY || '';
const RESEND_FROM = ENV.RESEND_FROM || NOTIFY_EMAIL_FROM || '';
const ZALO_WEBHOOK_URL = ENV.ZALO_WEBHOOK_URL || ENV.ZALO_NOTIFY_WEBHOOK_URL || '';
const FACEBOOK_PROFILE_URL = ENV.NEXT_PUBLIC_FACEBOOK_URL || ENV.FACEBOOK_PROFILE_URL || 'https://www.facebook.com/MahiruShiina.tym.1207';
const MESSENGER_URL = ENV.NEXT_PUBLIC_MESSENGER_URL || ENV.MESSENGER_URL || 'https://m.me/MahiruShiina.tym.1207';
const MESSENGER_WEBHOOK_URL = ENV.MESSENGER_WEBHOOK_URL || ENV.FACEBOOK_MESSENGER_WEBHOOK_URL || '';
const NOTIFICATION_TIMEOUT_MS = Number(ENV.NOTIFICATION_TIMEOUT_MS || 8000);
const MAX_STORED_MESSAGES = Number(ENV.MAX_STORED_MESSAGES || 2000);
const MAX_STORED_EVENTS = Number(ENV.MAX_STORED_EVENTS || 5000);
const MAX_STORED_AUDIT = Number(ENV.MAX_STORED_AUDIT || 2000);

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Content-Security-Policy': [
    "default-src 'self'",
    "connect-src 'self' https://api.github.com",
    "img-src 'self' data:",
    "media-src 'self'",
    "frame-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
};

const gateTokens = new Map();
const adminSessions = new Map();

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.otf': 'font/otf',
  '.ttf': 'font/ttf',
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
        phase: 9,
        environment: NODE_ENV,
        timestamp: new Date().toISOString(),
      });
    }

    if (req.method === 'POST' && url.pathname === '/api/chat/messages') {
      return handleChatMessage(req, res);
    }

    if (req.method === 'POST' && url.pathname === '/api/events') {
      return handleEvent(req, res);
    }

    if (req.method === 'GET' && url.pathname === '/api/books/inline') {
      return handleInlineBook(req, res, url);
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
        return handleAdminEvents(res, url);
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

server.listen(PORT, HOST, () => {
  console.log(`The Cursed Biomes Portfolio is running at http://${HOST}:${PORT}`);
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
  const notifications = await notifyNewContact(entry);

  sendJson(res, 201, {
    reply: getBotReply(message, Boolean(visitorContact.email || visitorContact.zalo || visitorContact.raw)),
    saved: true,
    messageId: entry.id,
    notifications,
    actions: getBotActions(message),
  });
}

async function notifyNewContact(entry) {
  const tasks = [];

  if (ZALO_WEBHOOK_URL) {
    tasks.push(sendZaloWebhookNotification(entry));
  }

  if (MESSENGER_WEBHOOK_URL) {
    tasks.push(sendMessengerWebhookNotification(entry));
  }

  if (RESEND_API_KEY && RESEND_FROM && NOTIFY_EMAIL_TO) {
    tasks.push(sendResendEmailNotification(entry));
  } else if (SMTP_HOST && NOTIFY_EMAIL_TO && NOTIFY_EMAIL_FROM) {
    tasks.push(sendEmailNotification(entry));
  }

  if (tasks.length === 0) {
    appendSystemAudit('CONTACT_NOTIFICATION_SKIPPED', {
      messageId: entry.id,
      reason: 'not_configured',
    });
    return { sent: 0, failed: 0, skipped: true };
  }

  const results = await Promise.allSettled(tasks);

  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.error(`[CONTACT_NOTIFICATION_FAILED_${index}]`, result.reason);
    }
  });

  const sent = results.filter((result) => result.status === 'fulfilled').length;
  const failed = results.length - sent;
  const errors = results
    .filter((r) => r.status === 'rejected')
    .map((r) => {
      try {
        return String((r.reason && (r.reason.message || r.reason)) || r.reason);
      } catch (e) {
        return String(r.reason || e.message || 'unknown');
      }
    });

  appendSystemAudit('CONTACT_NOTIFICATION_RESULT', {
    messageId: entry.id,
    sent,
    failed,
    channels: [
      ZALO_WEBHOOK_URL ? 'zalo_webhook' : null,
      MESSENGER_WEBHOOK_URL ? 'messenger_webhook' : null,
      RESEND_API_KEY && RESEND_FROM && NOTIFY_EMAIL_TO ? 'email_resend_api' : null,
      SMTP_HOST && NOTIFY_EMAIL_TO && NOTIFY_EMAIL_FROM ? 'email_smtp' : null,
    ].filter(Boolean),
    errors,
  });

  if (errors.length > 0) {
    try {
      console.error('Notification errors for message', entry.id, errors.join(' | '));
    } catch (e) {
      console.error('Notification errors (unable to stringify)', entry.id, errors);
    }
    try {
      const debugResults = results.map((r) => {
        if (r.status === 'fulfilled') return { status: 'fulfilled' };
        const reason = r.reason instanceof Error ? (r.reason.stack || r.reason.message) : String(r.reason);
        return { status: 'rejected', reason };
      });
      console.error('Notification debug results for', entry.id, JSON.stringify(debugResults, null, 2));
    } catch (e) {
      console.error('Failed to stringify notification results for', entry.id, e && e.message ? e.message : e);
    }
  }

  return { sent, failed, skipped: false, errors };

}

async function sendZaloWebhookNotification(entry) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), NOTIFICATION_TIMEOUT_MS);
  const response = await fetch(ZALO_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(makeNotificationPayload(entry)),
    signal: controller.signal,
  }).finally(() => clearTimeout(timeout));

  if (!response.ok) {
    throw new Error(`Zalo webhook responded with ${response.status}`);
  }
}

async function sendMessengerWebhookNotification(entry) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), NOTIFICATION_TIMEOUT_MS);
  const response = await fetch(MESSENGER_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(makeNotificationPayload(entry, 'messenger')),
    signal: controller.signal,
  });
  clearTimeout(timeout);

  if (!response.ok) {
    throw new Error(`Messenger webhook responded with ${response.status}`);
  }
}

async function sendResendEmailNotification(entry) {
  const recipients = NOTIFY_EMAIL_TO
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  if (recipients.length === 0) return;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: RESEND_FROM,
      to: recipients,
      subject: `New portfolio contact - ${entry.visitorContact.email || entry.visitorContact.zalo || entry.id}`,
      text: formatNotificationText(entry),
      html: formatNotificationHtml(entry),
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Resend email failed ${response.status}: ${detail}`);
  }

  return response.json();
}

async function sendEmailNotification(entry) {
  const recipients = NOTIFY_EMAIL_TO.split(',').map((item) => item.trim()).filter(Boolean);
  if (recipients.length === 0) return;

  const message = buildEmailMessage({
    from: NOTIFY_EMAIL_FROM,
    to: recipients,
    subject: `New portfolio contact - ${entry.visitorContact.email || entry.visitorContact.zalo || entry.id}`,
    text: formatNotificationText(entry),
    html: formatNotificationHtml(entry),
  });

  await sendSmtpMail({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    user: SMTP_USER,
    pass: SMTP_PASS,
    from: NOTIFY_EMAIL_FROM,
    to: recipients,
    message,
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
    ...SECURITY_HEADERS,
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
    ...SECURITY_HEADERS,
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

function handleAdminEvents(res, url) {
  const filters = getEventFilters(url.searchParams);
  const allEvents = readJsonArray(EVENTS_FILE).slice();
  const filteredEvents = allEvents
    .filter((event) => matchesEventFilters(event, filters))
    .sort((a, b) => {
      const delta = Date.parse(a.timestamp) - Date.parse(b.timestamp);
      return filters.sort === 'oldest' ? delta : -delta;
    });
  const limitedEvents = filteredEvents.slice(0, filters.limit);

  sendJson(res, 200, {
    events: limitedEvents,
    total: filteredEvents.length,
    totalUnfiltered: allEvents.length,
    filters,
    eventTypes: getUniqueValues(allEvents, 'eventType'),
    paths: getUniqueValues(allEvents, 'path'),
    summary: summarizeEvents(filteredEvents),
  });
}

function getEventFilters(searchParams) {
  return {
    q: normalizeText(searchParams.get('q') || '', 120).toLowerCase(),
    eventType: normalizeText(searchParams.get('eventType') || '', 80),
    dateFrom: normalizeText(searchParams.get('dateFrom') || '', 32),
    dateTo: normalizeText(searchParams.get('dateTo') || '', 32),
    ip: normalizeText(searchParams.get('ip') || '', 80).toLowerCase(),
    path: normalizeText(searchParams.get('path') || '', 160).toLowerCase(),
    sessionId: normalizeText(searchParams.get('sessionId') || '', 120).toLowerCase(),
    repoName: normalizeText(searchParams.get('repoName') || '', 160).toLowerCase(),
    sort: searchParams.get('sort') === 'oldest' ? 'oldest' : 'newest',
    limit: clampNumber(Number(searchParams.get('limit') || 100), 1, 500),
  };
}

function matchesEventFilters(event, filters) {
  const timestamp = Date.parse(event.timestamp || '');
  const from = filters.dateFrom ? Date.parse(filters.dateFrom) : null;
  const to = filters.dateTo ? Date.parse(`${filters.dateTo}T23:59:59.999`) : null;

  if (filters.eventType && event.eventType !== filters.eventType) return false;
  if (from && timestamp < from) return false;
  if (to && timestamp > to) return false;
  if (filters.ip && !String(event.ip || '').toLowerCase().includes(filters.ip)) return false;
  if (filters.path && !String(event.path || '').toLowerCase().includes(filters.path)) return false;
  if (filters.sessionId && !String(event.sessionId || '').toLowerCase().includes(filters.sessionId)) return false;
  if (filters.repoName && !String(event.metadata?.repoName || '').toLowerCase().includes(filters.repoName)) return false;
  if (filters.q && !eventSearchText(event).includes(filters.q)) return false;

  return true;
}

function eventSearchText(event) {
  return [
    event.eventType,
    event.sessionId,
    event.path,
    event.referrer,
    event.ip,
    event.userAgent,
    JSON.stringify(event.metadata || {}),
  ].join(' ').toLowerCase();
}

function summarizeEvents(events) {
  const byType = {};
  const byPath = {};
  const uniqueSessions = new Set();

  events.forEach((event) => {
    byType[event.eventType || 'UNKNOWN'] = (byType[event.eventType || 'UNKNOWN'] || 0) + 1;
    byPath[event.path || '/'] = (byPath[event.path || '/'] || 0) + 1;
    if (event.sessionId) uniqueSessions.add(event.sessionId);
  });

  return {
    uniqueSessions: uniqueSessions.size,
    byType: topEntries(byType, 8),
    byPath: topEntries(byPath, 8),
  };
}

function topEntries(source, limit) {
  return Object.entries(source)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
}

function getUniqueValues(items, key) {
  return [...new Set(items.map((item) => item[key]).filter(Boolean))]
    .sort((a, b) => String(a).localeCompare(String(b)));
}

function clampNumber(value, min, max) {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, Math.floor(value)));
}

function handleAdminRepos(res) {
  sendJson(res, 200, {
    repos: readJsonArray(REPO_SETTINGS_FILE),
  });
}

async function handleInlineBook(req, res, url) {
  const rawUrl = normalizeText(url.searchParams.get('url') || '', 1200);
  const parsed = parseAllowedBookUrl(rawUrl);

  if (!parsed) {
    return sendJson(res, 400, { error: 'Invalid book URL' });
  }

  const headers = {
    Accept: 'application/pdf',
    'User-Agent': 'CursedBiomesPortfolio/1.0',
  };
  if (req.headers.range) {
    headers.Range = req.headers.range;
  }

  const upstream = await fetch(parsed.href, { headers });
  if (!upstream.ok && upstream.status !== 206) {
    return sendJson(res, 502, { error: `Book upstream responded with ${upstream.status}` });
  }

  const fileName = decodeURIComponent(parsed.pathname.split('/').pop() || 'book.pdf').replace(/[^\w .()-]+/g, '-');
  const responseHeaders = {
    ...SECURITY_HEADERS,
    'Content-Type': upstream.headers.get('content-type') || 'application/pdf',
    'Content-Disposition': `inline; filename="${fileName}"`,
    'Accept-Ranges': upstream.headers.get('accept-ranges') || 'bytes',
    'Cache-Control': 'public, max-age=3600',
  };

  copyHeader(upstream, responseHeaders, 'content-length');
  copyHeader(upstream, responseHeaders, 'content-range');
  copyHeader(upstream, responseHeaders, 'etag');
  copyHeader(upstream, responseHeaders, 'last-modified');

  res.writeHead(upstream.status, responseHeaders);

  if (!upstream.body) {
    return res.end();
  }

  Readable.fromWeb(upstream.body).on('error', () => {
    if (!res.headersSent) res.writeHead(502, SECURITY_HEADERS);
    res.end();
  }).pipe(res);
}

function parseAllowedBookUrl(rawUrl) {
  try {
    const parsed = new URL(rawUrl);
    const allowedPath = /^\/PiupiuTenshi\/GameProgramBooks\/[^/]+\/.+\.pdf$/i;
    if (parsed.protocol !== 'https:' || parsed.hostname !== 'raw.githubusercontent.com') return null;
    if (!allowedPath.test(parsed.pathname)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function copyHeader(upstream, target, headerName) {
  const value = upstream.headers.get(headerName);
  if (value) target[headerName.replace(/\b\w/g, (char) => char.toUpperCase())] = value;
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

function normalizePasswordHash(value) {
  const hash = String(value || '').trim();
  return /^[a-f0-9]{64}$/i.test(hash) ? hash : '';
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
      ...SECURITY_HEADERS,
      'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
      'Cache-Control': getStaticCacheControl(ext),
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

  if (normalized.includes('messenger') || normalized.includes('facebook') || normalized.includes('zalo') || normalized.includes('contact')) {
    return hasContact
      ? 'Thanks, I saved your contact route for Sang.'
      : 'I saved your message. Add an email, Messenger, or Zalo next time if you want a direct reply path.';
  }

  if (normalized.includes('project') || normalized.includes('github')) {
    return 'Saved. The project relics above sync from GitHub and Sang can follow up from your note.';
  }

  if (normalized.includes('demo') || normalized.includes('webgl') || normalized.includes('unity')) {
    return 'Saved. You can open the Try Now gate for the current WebGL preview while Sang reviews your message.';
  }

  return hasContact
    ? 'Thanks! I saved your message and contact route for Sang.'
    : 'Thanks! I saved your message for Sang. Email, Messenger, or Zalo is optional if you want a reply.';
}

function getBotActions(message) {
  const normalized = message.toLowerCase();
  const actions = [];

  if (normalized.includes('cv')) {
    actions.push({ type: 'open_link', label: 'Download CV', href: 'public/cv/Pham-Minh-Sang-Unity-Developer-CV.pdf' });
  }

  if (normalized.includes('messenger') || normalized.includes('facebook') || normalized.includes('zalo') || normalized.includes('contact')) {
    actions.push({ type: 'open_link', label: 'Open Messenger', href: MESSENGER_URL });
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
  if (!raw) return { email: null, zalo: null, facebook: null, raw: null };

  const email = raw.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || null;
  const zalo = raw.match(/(?:zalo\s*:?\s*)?(\+?\d[\d\s.-]{7,})/i)?.[1]?.replace(/\s+/g, '') || null;
  const facebook = raw.match(/https?:\/\/(?:www\.)?facebook\.com\/[^\s]+/i)?.[0] || null;

  return { email, zalo, facebook, raw };
}

function makeNotificationPayload(entry, channel = 'webhook') {
  return {
    type: 'portfolio_contact',
    title: 'New portfolio contact',
    channel,
    messageId: entry.id,
    timestamp: entry.timestamp,
    page: entry.page,
    language: entry.language,
    contact: entry.visitorContact,
    message: entry.message,
    ip: entry.ip,
    adminUrl: makeAbsoluteUrl('/admin/dashboard.html#messages'),
    messengerUrl: MESSENGER_URL,
    facebookProfileUrl: FACEBOOK_PROFILE_URL,
  };
}

function formatNotificationText(entry) {
  const contact = entry.visitorContact || {};
  const zaloUrl = makeZaloUrl(contact.zalo);

  return [
    'New portfolio contact',
    '',
    `Time: ${entry.timestamp}`,
    `Message ID: ${entry.id}`,
    `Page: ${entry.page || '/'}`,
    `Language: ${entry.language || 'unknown'}`,
    `Email: ${contact.email || '-'}`,
    `Zalo: ${zaloUrl || contact.zalo || '-'}`,
    `Facebook: ${contact.facebook || '-'}`,
    `-------------------------------------------`,
    `Raw contact: ${contact.raw || '-'}`,
    `IP: ${entry.ip || '-'}`,
    '',
    'Message:',
    entry.message,
    '',
    `Open admin: ${makeAbsoluteUrl('/admin/dashboard.html#messages')}`,
  ].join('\n');
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function normalizeZaloPhone(phone = '') {
  const digits = String(phone || '').replace(/\D/g, '');

  if (!digits) return '';

  // 0898087507 -> 84898087507
  if (digits.startsWith('0')) {
    return `84${digits.slice(1)}`;
  }

  // 84898087507 -> giữ nguyên
  if (digits.startsWith('84')) {
    return digits;
  }

  return digits;
}

function makeZaloUrl(phone = '') {
  const normalizedPhone = normalizeZaloPhone(phone);
  return normalizedPhone ? `https://zalo.me/${normalizedPhone}` : '';
}

function formatZaloHtml(phone = '') {
  const zaloUrl = makeZaloUrl(phone);

  if (!zaloUrl) return '-';

  return `
    <a href="${escapeHtml(zaloUrl)}" target="_blank" rel="noopener" style="
      color:#b7ffca;
      text-decoration:underline;
      font-weight:700;
    ">
      ${escapeHtml(phone)} → OPEN_ZALO
    </a>
  `;
}

function nl2br(value = '') {
  return escapeHtml(value).replace(/\n/g, '<br>');
}

function formatNotificationHtml(entry) {
  const contact = entry.visitorContact || {};
  const adminUrl = makeAbsoluteUrl('/admin/dashboard.html#messages');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>

<body style="margin:0; padding:0; background:#05070a;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="
    background:#05070a;
    padding:32px 0;
  ">
    <tr>
      <td align="center">

        <table width="680" cellpadding="0" cellspacing="0" border="0" style="
          width:680px;
          max-width:94%;
          background:#080c10;
          border:1px solid #1f8f4d;
          border-radius:12px;
          font-family:Consolas, Monaco, 'Courier New', monospace;
          color:#d6ffe3;
        ">

          <tr>
            <td style="
              padding:22px 26px;
              border-bottom:1px solid #1f8f4d;
              background:#07110b;
            ">
              <div style="
                font-size:13px;
                color:#7cff9b;
                letter-spacing:1px;
              ">
                &gt; PORTFOLIO_CONTACT_SYSTEM
              </div>

              <div style="
                margin-top:10px;
                font-size:26px;
                line-height:1.3;
                font-weight:700;
                color:#ffffff;
              ">
                NEW MESSAGE RECEIVED<span style="color:#7cff9b;">_</span>
              </div>

              <div style="
                margin-top:8px;
                font-size:13px;
                color:#6ee7b7;
              ">
                STATUS: <span style="color:#facc15;">PENDING_ADMIN_REVIEW</span>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:26px;">

              <div style="
                color:#7cff9b;
                font-size:13px;
                margin-bottom:10px;
              ">
                ┌─ MESSAGE_PAYLOAD ───────────────────────────────
              </div>

              <div style="
                background:#020403;
                border:1px solid #244f35;
                border-radius:8px;
                padding:18px;
                margin-bottom:22px;
                color:#ffffff;
                font-family:Consolas, Monaco, 'Courier New', monospace;
                font-size:21px;
                line-height:1.55;
                font-weight:700;
              ">
                ${nl2br(entry.message || '-')}
              </div>

              <div style="
                color:#7cff9b;
                font-size:13px;
                margin-bottom:14px;
              ">
                └────────────────────────────────────────────────
              </div>

              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="
                font-family:Consolas, Monaco, 'Courier New', monospace;
                font-size:14px;
                line-height:1.8;
                color:#d6ffe3;
                background:#050806;
                border:1px solid #183926;
                border-radius:8px;
              ">
                <tr>
                  <td style="padding:14px 16px; color:#7cff9b; width:36%;">
                    &gt; TIME
                  </td>
                  <td style="padding:14px 16px; color:#ffffff;">
                    ${escapeHtml(entry.timestamp || '-')}
                  </td>
                </tr>

                <tr>
                  <td style="padding:8px 16px; color:#7cff9b;">
                    &gt; MESSAGE_ID
                  </td>
                  <td style="padding:8px 16px; color:#ffffff;">
                    ${escapeHtml(entry.id || '-')}
                  </td>
                </tr>

                <tr>
                  <td style="padding:8px 16px; color:#7cff9b;">
                    &gt; PAGE
                  </td>
                  <td style="padding:8px 16px; color:#ffffff;">
                    ${escapeHtml(entry.page || '/')}
                  </td>
                </tr>

                <tr>
                  <td style="padding:8px 16px; color:#7cff9b;">
                    &gt; LANGUAGE
                  </td>
                  <td style="padding:8px 16px; color:#ffffff;">
                    ${escapeHtml(entry.language || 'unknown')}
                  </td>
                </tr>

                <tr>
                  <td style="padding:8px 16px; color:#7cff9b;">
                    &gt; EMAIL
                  </td>
                  <td style="padding:8px 16px; color:#ffffff;">
                    ${escapeHtml(contact.email || '-')}
                  </td>
                </tr>

                <tr>
                  <td style="padding:8px 16px; color:#7cff9b;">
                    &gt; ZALO
                  </td>
                  <td style="padding:8px 16px; color:#ffffff;">
                    ${formatZaloHtml(contact.zalo || '-')}
                  </td>
                </tr>

                <tr>
                  <td style="padding:8px 16px; color:#7cff9b;">
                    &gt; FACEBOOK
                  </td>
                  <td style="padding:8px 16px; color:#ffffff;">
                    ${escapeHtml(contact.facebook || '-')}
                  </td>
                </tr>

                <tr>
                  <td style="padding:8px 16px; color:#7cff9b;">
                    &gt; RAW_CONTACT
                  </td>
                  <td style="padding:8px 16px; color:#ffffff;">
                    ${escapeHtml(contact.raw || '-')}
                  </td>
                </tr>

                <tr>
                  <td style="padding:8px 16px 14px 16px; color:#7cff9b;">
                    &gt; IP
                  </td>
                  <td style="padding:8px 16px 14px 16px; color:#ffffff;">
                    ${escapeHtml(entry.ip || '-')}
                  </td>
                </tr>
              </table>

              <div style="
                margin-top:26px;
                text-align:center;
              ">
                <a href="${escapeHtml(adminUrl)}" style="
                  display:inline-block;
                  background:#0f2f1c;
                  border:1px solid #35ff73;
                  color:#b7ffca;
                  text-decoration:none;
                  font-family:Consolas, Monaco, 'Courier New', monospace;
                  font-size:15px;
                  font-weight:700;
                  padding:14px 22px;
                  border-radius:6px;
                  letter-spacing:1px;
                ">
                  &gt; OPEN_ADMIN_DASHBOARD
                </a>
              </div>

            </td>
          </tr>

          <tr>
            <td style="
              padding:16px 26px;
              border-top:1px solid #1f8f4d;
              background:#07110b;
              color:#6ee7b7;
              font-size:12px;
              text-align:center;
              font-family:Consolas, Monaco, 'Courier New', monospace;
            ">
              SYSTEM_LOG :: Portfolio contact notification generated successfully.
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

function makeAbsoluteUrl(pathname) {
  const base = ENV.NEXT_PUBLIC_SITE_URL || `http://${HOST}:${PORT}`;
  return new URL(pathname, base.endsWith('/') ? base : `${base}/`).toString();
}

function buildEmailMessage({ from, to, subject, text, html }) {
  const boundary = `boundary_${crypto.randomUUID()}`;

  return [
    `From: ${sanitizeMailHeader(from)}`,
    `To: ${to.map(sanitizeMailHeader).join(', ')}`,
    `Subject: ${encodeMailHeader(subject)}`,
    `Date: ${new Date().toUTCString()}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    text || '',
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    html || '',
    '',
    `--${boundary}--`,
    '',
  ].join('\r\n');
}

async function sendSmtpMail({ host, port, secure, user, pass, from, to, message }) {
  let socket = await connectSmtpSocket({ host, port, secure });
  let reader = createSmtpReader(socket);

  await readSmtpResponse(reader, [220]);
  await sendSmtpCommand(socket, reader, `EHLO ${sanitizeSmtpToken(HOST || 'localhost')}`, [250]);

  if (!secure) {
    await sendSmtpCommand(socket, reader, 'STARTTLS', [220]);
    socket = tls.connect({ socket, servername: host });
    reader = createSmtpReader(socket);
    await onceEvent(socket, 'secureConnect');
    await sendSmtpCommand(socket, reader, `EHLO ${sanitizeSmtpToken(HOST || 'localhost')}`, [250]);
  }

  if (user && pass) {
    await sendSmtpCommand(socket, reader, 'AUTH LOGIN', [334]);
    await sendSmtpCommand(socket, reader, Buffer.from(user).toString('base64'), [334]);
    await sendSmtpCommand(socket, reader, Buffer.from(pass).toString('base64'), [235]);
  }

  await sendSmtpCommand(socket, reader, `MAIL FROM:<${sanitizeSmtpAddress(from)}>`, [250]);
  for (const recipient of to) {
    await sendSmtpCommand(socket, reader, `RCPT TO:<${sanitizeSmtpAddress(recipient)}>`, [250, 251]);
  }
  await sendSmtpCommand(socket, reader, 'DATA', [354]);
  socket.write(`${dotStuffSmtpMessage(message)}\r\n.\r\n`);
  await readSmtpResponse(reader, [250]);
  await sendSmtpCommand(socket, reader, 'QUIT', [221]);
  socket.end();
}

function connectSmtpSocket({ host, port, secure }) {
  return new Promise((resolve, reject) => {
    const socket = secure
      ? tls.connect({ host, port, servername: host })
      : net.connect({ host, port });
    const timer = setTimeout(() => {
      socket.destroy(new Error('SMTP connection timed out'));
    }, NOTIFICATION_TIMEOUT_MS);

    socket.once(secure ? 'secureConnect' : 'connect', () => {
      clearTimeout(timer);
      resolve(socket);
    });
    socket.once('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
  });
}

function createSmtpReader(socket) {
  let buffer = '';
  const waiters = [];

  socket.on('data', (chunk) => {
    buffer += chunk.toString('utf8');
    flush();
  });

  socket.on('error', (error) => {
    while (waiters.length > 0) waiters.shift().reject(error);
  });

  function flush() {
    let response = extractSmtpResponse();
    while (response && waiters.length > 0) {
      waiters.shift().resolve(response);
      response = extractSmtpResponse();
    }
  }

  function extractSmtpResponse() {
    const match = buffer.match(/(?:^|\r\n)(\d{3}) [^\r\n]*(?:\r\n|$)/);
    if (!match) return null;
    const end = match.index + match[0].length;
    const raw = buffer.slice(0, end);
    buffer = buffer.slice(end);
    return { code: Number(match[1]), raw };
  }

  return {
    read() {
      const response = extractSmtpResponse();
      if (response) return Promise.resolve(response);
      return new Promise((resolve, reject) => waiters.push({ resolve, reject }));
    },
  };
}

async function sendSmtpCommand(socket, reader, command, expectedCodes) {
  socket.write(`${command}\r\n`);
  return readSmtpResponse(reader, expectedCodes);
}

async function readSmtpResponse(reader, expectedCodes) {
  const response = await withTimeout(reader.read(), NOTIFICATION_TIMEOUT_MS, 'SMTP response timed out');
  if (!expectedCodes.includes(response.code)) {
    throw new Error(`SMTP expected ${expectedCodes.join('/')} but got ${response.code}: ${response.raw.trim()}`);
  }
  return response;
}

function onceEvent(target, eventName) {
  return new Promise((resolve, reject) => {
    target.once(eventName, resolve);
    target.once('error', reject);
  });
}

function withTimeout(promise, timeoutMs, message) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), timeoutMs);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function sanitizeMailHeader(value) {
  return String(value || '').replace(/[\r\n]+/g, ' ').trim();
}

function encodeMailHeader(value) {
  return `=?UTF-8?B?${Buffer.from(sanitizeMailHeader(value), 'utf8').toString('base64')}?=`;
}

function sanitizeSmtpToken(value) {
  return String(value || 'localhost').replace(/[^a-zA-Z0-9.-]/g, '-');
}

function sanitizeSmtpAddress(value) {
  return String(value || '').replace(/[<>\r\n]/g, '').trim();
}

function dotStuffSmtpMessage(message) {
  return String(message).replace(/^\./gm, '..');
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
  const limit = getJsonFileLimit(filePath);
  if (limit > 0 && data.length > limit) {
    data.splice(0, data.length - limit);
  }
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function getJsonFileLimit(filePath) {
  if (filePath === MESSAGES_FILE) return MAX_STORED_MESSAGES;
  if (filePath === EVENTS_FILE) return MAX_STORED_EVENTS;
  if (filePath === AUDIT_FILE) return MAX_STORED_AUDIT;
  return 0;
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

function appendSystemAudit(action, metadata) {
  appendJsonEntry(AUDIT_FILE, {
    id: `aud_${crypto.randomUUID()}`,
    timestamp: new Date().toISOString(),
    action,
    ip: 'server',
    userAgent: 'notification-worker',
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
    ...SECURITY_HEADERS,
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(payload));
}

function sendText(res, statusCode, text) {
  res.writeHead(statusCode, {
    ...SECURITY_HEADERS,
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(text);
}

function getStaticCacheControl(ext) {
  if (ext === '.html') return 'no-store';
  if (ext === '.js' || ext === '.css' || ext === '.json') return 'public, max-age=300, must-revalidate';
  if (['.png', '.jpg', '.jpeg', '.webp', '.svg', '.woff2', '.woff', '.otf', '.ttf', '.ogg', '.mp3', '.pdf'].includes(ext)) {
    return 'public, max-age=31536000, immutable';
  }
  return 'public, max-age=300';
}
