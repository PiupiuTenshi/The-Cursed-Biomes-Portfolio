# 07 — Backend API, Admin & Chatbot Document

## 1. Backend responsibilities

Backend không chỉ làm API, mà còn bảo vệ các phần không được lộ ở client:

- GitHub repo sync + cache.
- Repo visibility settings.
- Chatbot messages.
- Hidden admin gate phrase.
- Admin login/session.
- Visitor event logging.
- Export logs.
- Audit admin actions.

## 2. API endpoints

### Public endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/github/repos` | Get visible repos |
| POST | `/api/events` | Log visitor event |
| POST | `/api/chat/messages` | Send visitor chatbot message |
| GET | `/api/content/public` | Quotes/books/site content |

### Admin endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/admin/login` | Login admin |
| POST | `/api/admin/logout` | Logout |
| GET | `/api/admin/logs` | Query visitor logs |
| GET | `/api/admin/messages` | Query chat messages |
| PATCH | `/api/admin/messages/:id` | Mark read/reply note |
| GET | `/api/admin/repos` | All repos + visibility |
| PATCH | `/api/admin/repos/:repoId` | Toggle visibility/featured/TryNow |
| GET | `/api/admin/export/logs.csv` | Export logs |
| GET | `/api/admin/audit` | Admin action history |

## 3. Hidden admin gate

### Requirement

Admin không có button công khai. Bạn mở admin bằng cách gõ lệnh trong chatbot.

Ví dụ:

```txt
/open gate: moonlit-biomes
```

### Cách triển khai đúng

- Command phrase nằm ở backend `.env` hoặc file server-side plaintext.
- Frontend không biết phrase.
- Backend so sánh phrase.
- Nếu đúng, tạo one-time gate token hết hạn nhanh.
- Sau đó admin vẫn cần password/JWT để vào dashboard.

### Vì sao không chỉ dùng plaintext?

Plaintext dễ chỉnh sửa nhưng không đủ bảo mật nếu bị lộ server/file. Vì vậy nên dùng 2 lớp:

```txt
Layer 1: hidden gate phrase
Layer 2: admin password / OAuth / JWT session
```

## 4. Chatbot logic

### Bot capabilities

```txt
- Navigate to CV
- Navigate to Try Now WebGL
- Show projects by category
- Save visitor message
- Capture contact info optional
- Detect hidden admin command
```

### Message payload

```json
{
  "sessionId": "sess_abc123",
  "message": "I want to contact you about Unity internship",
  "page": "/",
  "language": "en",
  "visitorContact": {
    "email": "optional@example.com",
    "zalo": "optional"
  }
}
```

### Response example

```json
{
  "reply": "Thanks! I saved your message for Sáng.",
  "actions": [
    { "type": "open_link", "label": "Download CV", "href": "/cv" }
  ]
}
```

### Admin gate response example

```json
{
  "reply": "Gate accepted. Continue to the hidden sanctum.",
  "adminUrl": "/admin/login?gateToken=one_time_token"
}
```

## 5. Visitor log fields

```json
{
  "eventType": "PROJECT_CLICK",
  "timestamp": "2026-06-10T16:00:00.000Z",
  "ip": "203.0.113.10",
  "userAgent": "Mozilla/5.0...",
  "sessionId": "sess_xxx",
  "path": "/",
  "referrer": "https://google.com",
  "metadata": {
    "repoName": "Unity2DTopDown",
    "button": "try_now"
  }
}
```

## 6. MAC address note

Không có endpoint hợp lệ nào trong web browser để lấy MAC address visitor. Trường thay thế:

```txt
macAddress: null
fingerprintHash: optional, only if consent
```

Nếu cần xác định thiết bị trong mạng LAN của chính bạn thì phải dùng app native/agent cài local, không phải website public.

## 7. Admin dashboard features

### Overview

- Total visitors.
- Total page views.
- CV downloads.
- Try Now clicks.
- Chat messages unread.
- Top repo clicks.

### Logs table

Columns:

```txt
Timestamp | Event | IP | Country | Path | Repo | User Agent | Session | Actions
```

Filters:

```txt
Date range | Event type | Search | IP | Path | Repo | Sort
```

### Messages table

Columns:

```txt
Timestamp | Visitor Contact | Message | Page | Status | Actions
```

### Repo settings table

Columns:

```txt
Repo | Visible | Featured | Category | TryNow URL | Priority | Updated At
```

## 8. Security checklist

- [ ] Rate limit `/api/chat/messages`.
- [ ] Rate limit `/api/events`.
- [ ] Validate payload bằng Zod/class-validator.
- [ ] Sanitize message text khi render admin.
- [ ] HttpOnly cookie cho admin JWT.
- [ ] CSRF protection nếu dùng cookie auth.
- [ ] One-time gate token hết hạn 2–5 phút.
- [ ] Audit log mọi thay đổi admin.
- [ ] Không log thông tin nhạy cảm không cần thiết.

