# 13 — Data Schema

## 1. ERD overview

```txt
admin_users 1---n admin_audit_logs
repo_settings 1---n visitor_events optional by repoName
visitor_sessions 1---n visitor_events
visitor_sessions 1---n chat_messages
content_blocks
```

## 2. Tables

### `visitor_sessions`

```sql
CREATE TABLE visitor_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  first_ip TEXT,
  first_user_agent TEXT,
  first_referrer TEXT,
  first_path TEXT,
  language TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `visitor_events`

```sql
CREATE TABLE visitor_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  path TEXT,
  referrer TEXT,
  ip_address TEXT,
  user_agent TEXT,
  country TEXT,
  city TEXT,
  repo_name TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_visitor_events_created_at ON visitor_events(created_at DESC);
CREATE INDEX idx_visitor_events_event_type ON visitor_events(event_type);
CREATE INDEX idx_visitor_events_ip ON visitor_events(ip_address);
CREATE INDEX idx_visitor_events_repo_name ON visitor_events(repo_name);
```

### `chat_messages`

```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT,
  visitor_name TEXT,
  visitor_email TEXT,
  visitor_zalo TEXT,
  message TEXT NOT NULL,
  page_path TEXT,
  language TEXT,
  status TEXT DEFAULT 'unread',
  admin_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

CREATE INDEX idx_chat_messages_status ON chat_messages(status);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at DESC);
```

### `repo_settings`

```sql
CREATE TABLE repo_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  github_id BIGINT UNIQUE,
  repo_name TEXT UNIQUE NOT NULL,
  visible BOOLEAN DEFAULT TRUE,
  featured BOOLEAN DEFAULT FALSE,
  priority INT DEFAULT 999,
  category TEXT DEFAULT 'other',
  try_now_url TEXT,
  fallback_video_url TEXT,
  case_study_url TEXT,
  custom_title TEXT,
  custom_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_repo_settings_visible ON repo_settings(visible);
CREATE INDEX idx_repo_settings_featured ON repo_settings(featured);
```

### `admin_users`

```sql
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'owner',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);
```

### `admin_audit_logs`

```sql
CREATE TABLE admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES admin_users(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  before_data JSONB,
  after_data JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `content_blocks`

```sql
CREATE TABLE content_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  locale TEXT DEFAULT 'en',
  value JSONB NOT NULL,
  visible BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 3. Event types

```txt
PAGE_VIEW
SECTION_VIEW
PROJECT_VIEW
PROJECT_CLICK_CODE
PROJECT_CLICK_TRY_NOW
PROJECT_CLICK_DOCS
CV_DOWNLOAD
ZALO_CLICK
CHAT_OPEN
CHAT_MESSAGE_SENT
LANGUAGE_SWITCH
AUDIO_ENABLE
AUDIO_MUTE
WEBGL_LOAD_START
WEBGL_LOAD_READY
WEBGL_LOAD_ERROR
ADMIN_GATE_ACCEPTED
ADMIN_GATE_DENIED
```

## 4. Admin filters query model

```ts
type LogFilter = {
  q?: string;
  eventType?: string;
  ipAddress?: string;
  repoName?: string;
  path?: string;
  dateFrom?: string;
  dateTo?: string;
  sort?: "newest" | "oldest";
  page?: number;
  pageSize?: number;
};
```

## 5. Privacy field note

Không có `mac_address` thật. Nếu muốn giữ field vì UI đã yêu cầu, để nullable và ghi rõ:

```sql
mac_address TEXT DEFAULT NULL
```

Nhưng khuyến nghị không thêm field này để tránh hiểu nhầm.

