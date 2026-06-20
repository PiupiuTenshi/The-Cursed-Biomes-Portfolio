# 23 - Trạng thái Phase 4

Cập nhật lần cuối: 2026-06-11

## Đã hoàn thành

- Đã thêm backend Node cục bộ tại `server.js`.
- Website tĩnh được phục vụ từ cùng server.
- Có endpoint công khai `GET /api/health`, `POST /api/chat/messages` và `POST /api/events`.
- Có endpoint inbox admin phục vụ development: `GET /api/admin/messages`.
- Chatbot hỗ trợ tin nhắn tự do, contact email/Zalo tuỳ chọn, quick replies, trạng thái lưu tin nhắn và phản hồi từ backend.
- Tin nhắn được lưu trong `data/chat-messages.json`; event visitor trong `data/visitor-events.json`.
- Tin nhắn lưu timestamp, sessionId, page, language, contact, IP, user agent và trạng thái chưa đọc.

## Việc còn lại

- Chuyển JSON sang PostgreSQL/Supabase/Neon khi có backend production.
- Bảo vệ `/api/admin/messages` bằng admin auth ẩn ở Phase 5.
- Thêm endpoint cập nhật read/unread ở dashboard admin.
- Bổ sung rate limit mạnh hơn ngoài giới hạn payload.
- Thêm gửi thông báo thật qua Telegram/Zalo/email nếu cần.

## Xem trước cục bộ

```bash
npm start
```

Mở `http://127.0.0.1:3001`; inbox development ở `http://127.0.0.1:3001/api/admin/messages`.
