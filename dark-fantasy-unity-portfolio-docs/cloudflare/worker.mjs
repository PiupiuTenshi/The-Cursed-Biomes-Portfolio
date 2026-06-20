const SESSION_TTL_MS = 2 * 60 * 60 * 1000;
const GATE_TTL_MS = 5 * 60 * 1000;
const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' };
const SECURITY_HEADERS = {
  'x-content-type-options': 'nosniff', 'x-frame-options': 'SAMEORIGIN',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'permissions-policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'content-security-policy': "default-src 'self'; connect-src 'self' https://api.github.com; img-src 'self' data:; media-src 'self'; frame-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; base-uri 'self'; form-action 'self'",
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);
    try {
      return await route(request, env, url);
    } catch (error) {
      console.error(error);
      return json({ error: 'Internal server error' }, 500);
    }
  },
};

async function route(request, env, url) {
  const { pathname } = url;
  if (request.method === 'GET' && pathname === '/api/health') return json({ ok: true, service: 'cursed-biomes-cloudflare', timestamp: new Date().toISOString() });
  if (request.method === 'GET' && pathname === '/api/notice') return publicNotice(env);
  if (request.method === 'POST' && pathname === '/api/chat/messages') return chat(request, env);
  if (request.method === 'POST' && pathname === '/api/events') return event(request, env);
  if (request.method === 'POST' && pathname === '/api/admin/login') return login(request, env);
  if (request.method === 'POST' && pathname === '/api/admin/logout') return logout(request, env);
  if (!pathname.startsWith('/api/admin/')) return json({ error: 'Not found' }, 404);
  const session = await adminSession(request, env);
  if (!session) return json({ error: 'Admin session required' }, 401);
  if (request.method !== 'GET' && !sameOrigin(request, env)) return json({ error: 'Invalid request origin' }, 403);
  if (request.method === 'GET' && pathname === '/api/admin/session') return json({ ok: true, session: { id: session.id, createdAt: session.created_at, expiresAt: session.expires_at } });
  if (request.method === 'GET' && pathname === '/api/admin/messages') return adminMessages(env);
  if (request.method === 'PATCH' && pathname.startsWith('/api/admin/messages/')) return patchMessage(request, env, pathname.split('/').pop(), session);
  if (request.method === 'GET' && pathname === '/api/admin/events') return adminEvents(env, url);
  if (request.method === 'GET' && pathname === '/api/admin/audit') return adminAudit(env);
  if (request.method === 'GET' && pathname === '/api/admin/notice') return notice(env);
  if (request.method === 'PUT' && pathname === '/api/admin/notice') return updateNotice(request, env, session);
  return json({ error: 'Admin endpoint not found' }, 404);
}

async function chat(request, env) {
  const body = await bodyJson(request); const message = text(body.message, 1200); const sessionId = text(body.sessionId, 120) || `sess_${crypto.randomUUID()}`;
  if (!message) return json({ error: 'Message is required' }, 400);
  const gate = message.match(/^\/open\s+gate\s*:\s*(.+)$/i);
  if (gate) return openGate(gate[1], sessionId, request, env);
  const contact = parseContact(text(body.contact, 240)); const entry = { id: `msg_${crypto.randomUUID()}`, createdAt: new Date().toISOString(), sessionId, page: text(body.page, 300) || '/', language: text(body.language, 12) || 'en', message, contact, ip: clientIp(request), userAgent: request.headers.get('user-agent') || '' };
  await env.DB.prepare('INSERT INTO messages (id,created_at,session_id,page,language,message,visitor_contact_json,ip,user_agent) VALUES (?,?,?,?,?,?,?,?,?)').bind(entry.id, entry.createdAt, entry.sessionId, entry.page, entry.language, entry.message, JSON.stringify(contact), entry.ip, entry.userAgent).run();
  await notify(entry, env);
  return json({ reply: contact.email || contact.zalo || contact.raw ? 'Cảm ơn, tin nhắn và thông tin liên hệ của bạn đã được lưu.' : 'Cảm ơn, tin nhắn của bạn đã được lưu.', saved: true, messageId: entry.id });
}

async function openGate(phrase, sessionId, request, env) {
  const accepted = text(phrase, 160) === String(env.ADMIN_GATE_PHRASE || '');
  await audit(env, accepted ? 'ADMIN_GATE_ACCEPTED' : 'ADMIN_GATE_DENIED', request, sessionId, { command: '/open gate: ***' });
  if (!accepted) return json({ reply: 'Gate denied.', saved: false }, 403);
  const token = `gate_${crypto.randomUUID()}`;
  await env.DB.prepare('INSERT INTO gate_tokens (token_hash,session_id,expires_at) VALUES (?,?,?)').bind(await hash(token), sessionId, Date.now() + GATE_TTL_MS).run();
  return json({ reply: 'Gate accepted.', saved: false, adminUrl: `/admin/login.html?gateToken=${encodeURIComponent(token)}` }, 202);
}

async function login(request, env) {
  if (!sameOrigin(request, env)) return json({ error: 'Invalid request origin' }, 403);
  const body = await bodyJson(request); const token = text(body.gateToken, 120); const tokenHash = await hash(token);
  const gate = await env.DB.prepare('SELECT * FROM gate_tokens WHERE token_hash=?').bind(tokenHash).first();
  if (!gate || gate.used_at || gate.expires_at < Date.now()) return json({ error: 'Invalid or expired gate token' }, 401);
  if (!await passwordMatches(String(body.password || ''), env.ADMIN_PASSWORD_SHA256)) return json({ error: 'Invalid credentials' }, 401);
  await env.DB.prepare('UPDATE gate_tokens SET used_at=? WHERE token_hash=?').bind(Date.now(), tokenHash).run();
  const tokenValue = `adm_${crypto.randomUUID()}`, id = `admin_${crypto.randomUUID()}`;
  await env.DB.prepare('INSERT INTO admin_sessions (token_hash,id,created_at,expires_at,ip) VALUES (?,?,?,?,?)').bind(await hash(tokenValue), id, new Date().toISOString(), Date.now() + SESSION_TTL_MS, clientIp(request)).run();
  await audit(env, 'ADMIN_LOGIN_SUCCESS', request, id, {});
  const redirectTo = body.returnTo === '/?admin=1' ? '/?admin=1' : '/admin/dashboard.html';
  return json({ ok: true, redirectTo }, 200, { 'set-cookie': cookie('admin_session', tokenValue, SESSION_TTL_MS) });
}

async function logout(request, env) { if (!sameOrigin(request, env)) return json({ error: 'Invalid request origin' }, 403); const token = cookies(request).admin_session; if (token) await env.DB.prepare('DELETE FROM admin_sessions WHERE token_hash=?').bind(await hash(token)).run(); return json({ ok: true }, 200, { 'set-cookie': cookie('admin_session', '', 0) }); }
async function event(request, env) { const body = await bodyJson(request); const type = text(body.eventType, 80); if (!type) return json({ error: 'eventType is required' }, 400); await env.DB.prepare('INSERT INTO events (id,created_at,event_type,session_id,path,referrer,metadata_json,ip,user_agent) VALUES (?,?,?,?,?,?,?,?,?)').bind(`evt_${crypto.randomUUID()}`,new Date().toISOString(),type,text(body.sessionId,120),text(body.path,300)||'/',text(body.referrer,500),JSON.stringify(body.metadata && typeof body.metadata === 'object' ? body.metadata : {}),clientIp(request),request.headers.get('user-agent')||'').run(); return json({ ok: true }, 201); }
async function publicNotice(env) { const row = await env.DB.prepare('SELECT * FROM site_notice WHERE id=1').first(); return json({ enabled: Boolean(row?.enabled && row?.message), message: row?.enabled ? row.message : '', updatedAt: row?.updated_at || null }); }
async function notice(env) { return json({ notice: await env.DB.prepare('SELECT * FROM site_notice WHERE id=1').first() }); }
async function updateNotice(request, env, session) { const body = await bodyJson(request); const message = text(body.message,180), enabled = Boolean(body.enabled && message); const updatedAt = new Date().toISOString(); await env.DB.prepare('UPDATE site_notice SET enabled=?,message=?,updated_at=?,updated_by=? WHERE id=1').bind(enabled?1:0,message,updatedAt,session.id).run(); await audit(env,'ADMIN_NOTICE_UPDATED',request,session.id,{enabled,messageLength:message.length}); return json({ ok:true, notice:{enabled,message,updatedAt,updatedBy:session.id} }); }
async function adminMessages(env) { const rows = await env.DB.prepare('SELECT * FROM messages ORDER BY created_at DESC LIMIT 2000').all(); const messages = rows.results.map(messageRow); return json({ messages, unread: messages.filter((item) => item.status === 'unread').length }); }
async function patchMessage(request, env, id, session) { const body=await bodyJson(request); const found=await env.DB.prepare('SELECT * FROM messages WHERE id=?').bind(id).first(); if(!found) return json({error:'Message not found'},404); const status=['read','unread'].includes(body.status)?body.status:found.status; const replyNote=typeof body.replyNote==='string'?text(body.replyNote,600):found.reply_note; await env.DB.prepare('UPDATE messages SET status=?,reply_note=? WHERE id=?').bind(status,replyNote,id).run(); await audit(env,'ADMIN_MESSAGE_UPDATED',request,session.id,{messageId:id,status}); return json({ok:true,message:messageRow({...found,status,reply_note:replyNote})}); }
async function adminEvents(env, url) { const rows=await env.DB.prepare('SELECT * FROM events ORDER BY created_at DESC LIMIT 500').all(); const events=rows.results.map(eventRow); return json({events,total:events.length,totalUnfiltered:events.length,filters:{},eventTypes:[...new Set(events.map(x=>x.eventType))],paths:[...new Set(events.map(x=>x.path))],summary:{uniqueSessions:new Set(events.map(x=>x.sessionId).filter(Boolean)).size,byType:[],byPath:[],daily:[]}}); }
async function adminAudit(env) { const rows=await env.DB.prepare('SELECT * FROM admin_audit ORDER BY created_at DESC LIMIT 2000').all(); return json({audit:rows.results.map(auditRow),total:rows.results.length}); }
async function adminSession(request,env) { const token=cookies(request).admin_session; if(!token) return null; const row=await env.DB.prepare('SELECT * FROM admin_sessions WHERE token_hash=?').bind(await hash(token)).first(); if(!row || row.expires_at < Date.now()) return null; return row; }
async function audit(env,action,request,sessionId,metadata) { await env.DB.prepare('INSERT INTO admin_audit (id,created_at,action,session_id,ip,user_agent,metadata_json) VALUES (?,?,?,?,?,?,?)').bind(`aud_${crypto.randomUUID()}`,new Date().toISOString(),action,sessionId,clientIp(request),request.headers.get('user-agent')||'',JSON.stringify(metadata)).run(); }
async function notify(entry,env) { if (!env.RESEND_API_KEY || !env.RESEND_FROM || !env.NOTIFY_EMAIL_TO) return; await fetch('https://api.resend.com/emails',{method:'POST',headers:{authorization:`Bearer ${env.RESEND_API_KEY}`,'content-type':'application/json'},body:JSON.stringify({from:env.RESEND_FROM,to:[env.NOTIFY_EMAIL_TO],subject:`Portfolio contact - ${entry.id}`,text:`Message: ${entry.message}\nContact: ${entry.contact.raw||'-'}`})}); }
function sameOrigin(request,env) { const origin=request.headers.get('origin'); return origin === new URL(env.SITE_URL).origin; }
function cookies(request) { return Object.fromEntries((request.headers.get('cookie')||'').split(';').map(x=>x.trim().split('=').map(decodeURIComponent)).filter(x=>x[0])); }
function cookie(name,value,maxAge) { return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${Math.floor(maxAge/1000)}`; }
function clientIp(request) { return request.headers.get('CF-Connecting-IP') || ''; }
function text(value,max) { return typeof value==='string'?value.trim().replace(/\s+/g,' ').slice(0,max):''; }
function parseContact(raw) { return {email:raw.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0]||null,zalo:raw.match(/(?:zalo\s*:?\s*)?(\+?\d[\d\s.-]{7,})/i)?.[1]?.replace(/\s+/g,'')||null,facebook:raw.match(/https?:\/\/(?:www\.)?facebook\.com\/[^\s]+/i)?.[0]||null,raw:raw||null}; }
async function bodyJson(request) { try { return await request.json(); } catch { return {}; } }
async function hash(value) { const bytes=new TextEncoder().encode(value); const digest=await crypto.subtle.digest('SHA-256',bytes); return [...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join(''); }
async function passwordMatches(password,expected) { return Boolean(expected) && await hash(password) === expected.toLowerCase(); }
function messageRow(row) { return {id:row.id,timestamp:row.created_at,sessionId:row.session_id,page:row.page,language:row.language,message:row.message,visitorContact:JSON.parse(row.visitor_contact_json||'{}'),status:row.status,replyNote:row.reply_note||'',ip:row.ip,userAgent:row.user_agent}; }
function eventRow(row) { return {id:row.id,timestamp:row.created_at,eventType:row.event_type,sessionId:row.session_id,path:row.path,referrer:row.referrer,metadata:JSON.parse(row.metadata_json||'{}'),ip:row.ip,userAgent:row.user_agent}; }
function auditRow(row) { return {id:row.id,timestamp:row.created_at,action:row.action,sessionId:row.session_id,ip:row.ip,userAgent:row.user_agent,metadata:JSON.parse(row.metadata_json||'{}')}; }
function json(data,status=200,headers={}) { return new Response(JSON.stringify(data),{status,headers:{...SECURITY_HEADERS,...JSON_HEADERS,...headers}}); }
