CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  session_id TEXT NOT NULL,
  page TEXT NOT NULL,
  language TEXT NOT NULL,
  message TEXT NOT NULL,
  visitor_contact_json TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unread',
  reply_note TEXT,
  ip TEXT,
  user_agent TEXT
);
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY, created_at TEXT NOT NULL, event_type TEXT NOT NULL,
  session_id TEXT, path TEXT, referrer TEXT, metadata_json TEXT NOT NULL,
  ip TEXT, user_agent TEXT
);
CREATE TABLE IF NOT EXISTS admin_audit (
  id TEXT PRIMARY KEY, created_at TEXT NOT NULL, action TEXT NOT NULL,
  session_id TEXT, ip TEXT, user_agent TEXT, metadata_json TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS gate_tokens (
  token_hash TEXT PRIMARY KEY, session_id TEXT NOT NULL, expires_at INTEGER NOT NULL, used_at INTEGER
);
CREATE TABLE IF NOT EXISTS admin_sessions (
  token_hash TEXT PRIMARY KEY, id TEXT NOT NULL, created_at TEXT NOT NULL,
  expires_at INTEGER NOT NULL, ip TEXT
);
CREATE TABLE IF NOT EXISTS site_notice (
  id INTEGER PRIMARY KEY CHECK (id = 1), enabled INTEGER NOT NULL DEFAULT 0,
  message TEXT NOT NULL DEFAULT '', updated_at TEXT, updated_by TEXT
);
INSERT OR IGNORE INTO site_notice (id, enabled, message) VALUES (1, 0, '');
CREATE INDEX IF NOT EXISTS events_created_at ON events(created_at DESC);
CREATE INDEX IF NOT EXISTS messages_created_at ON messages(created_at DESC);
