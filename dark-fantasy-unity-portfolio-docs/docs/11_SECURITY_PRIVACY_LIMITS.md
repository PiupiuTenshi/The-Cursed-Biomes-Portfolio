# 11 — Security, Privacy & Technical Limits

## 1. Nguyên tắc

Portfolio có thể đẹp và thông minh, nhưng không nên thu thập dữ liệu quá mức hoặc làm sai giới hạn browser.

## 2. MAC address visitor

### Kết luận

Website public chạy trong browser **không thể lấy MAC address thật của visitor** bằng JavaScript/HTML thông thường.

### Vì sao?

MAC address là thông tin tầng mạng cục bộ, không được browser expose cho website vì riêng tư và bảo mật.

### Thay thế hợp lý

```txt
ipAddress
userAgent
sessionId
referrer
path
language
timezone optional
screen size optional
fingerprintHash optional + consent
```

### Schema đề xuất

```ts
type VisitorIdentity = {
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  fingerprintHash?: string;
  macAddress: null;
};
```

## 3. Hidden admin security

### Không an toàn

```txt
Admin command đặt trong JavaScript frontend
Admin route chỉ bị ẩn bằng CSS
Admin không cần login sau khi gõ command
```

### An toàn hơn

```txt
Admin command nằm server-side
One-time gate token
Admin password/JWT
HttpOnly cookie
Rate limit
Audit log
```

## 4. Plaintext command file

User yêu cầu plaintext có thể chỉnh sửa. Cách làm hợp lý:

```txt
/private/admin-command.txt
```

File này:

- Không commit lên GitHub.
- Không nằm trong `/public`.
- Server đọc lúc start hoặc theo interval.
- Có permission hạn chế.

`.gitignore`:

```gitignore
/private/admin-command.txt
.env
.env.local
```

## 5. Rate limit

Endpoints cần rate limit:

| Endpoint | Limit gợi ý |
|---|---:|
| `/api/chat/messages` | 5–10 req/phút/IP |
| `/api/events` | 60 req/phút/IP |
| `/api/admin/login` | 5 req/15 phút/IP |
| `/api/admin/gate` | 5 req/15 phút/IP |

## 6. Data retention

Nên có chính sách xoá log:

```txt
visitor_events: giữ 30–90 ngày
chat_messages: giữ đến khi xử lý, tối đa 180 ngày
admin_audit_logs: giữ 180–365 ngày
```

## 7. Privacy notice ngắn

Có thể đặt ở footer:

```txt
This site logs basic technical data such as IP address, browser user-agent, visited page and timestamp for security and portfolio analytics. No MAC address is collected.
```

Tiếng Việt:

```txt
Website có lưu dữ liệu kỹ thuật cơ bản như IP, trình duyệt, trang đã xem và thời gian truy cập để bảo mật và thống kê portfolio. Website không thu thập MAC address.
```

## 8. XSS prevention

Chatbot message là input của visitor nên phải sanitize khi render admin.

Rules:

- Không render raw HTML.
- Escape text.
- Giới hạn length.
- Chặn script tags.
- Validate payload.

## 9. Secrets checklist

- [ ] GitHub token nếu có phải ở server env.
- [ ] Admin phrase không commit.
- [ ] DB URL không commit.
- [ ] Zalo/Telegram webhook token không commit.
- [ ] Không expose `.env` trong frontend.

## 10. Admin audit log

Mỗi action admin nên lưu:

```txt
adminId
action
entityType
entityId
before
after
ipAddress
createdAt
```

Ví dụ:

```txt
TOGGLE_REPO_VISIBLE Unity2DTopDown true -> false
MARK_MESSAGE_READ message_123
EXPORT_LOGS dateRange=last_7_days
```

