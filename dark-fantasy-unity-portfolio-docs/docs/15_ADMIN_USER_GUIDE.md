# 15 — Admin User Guide

## 1. Mở admin

Admin không có nút trên UI công khai.

Mở chatbot và gõ command bí mật, ví dụ:

```txt
/open gate: moonlit-biomes
```

Nếu đúng, chatbot trả về link login admin.

## 2. Đăng nhập

```txt
/admin/login?gateToken=...
```

Nhập password admin. Sau khi login, bạn vào:

```txt
/admin/dashboard
```

## 3. Dashboard overview

Bạn sẽ thấy:

- Tổng lượt truy cập.
- Tổng lượt click Try Now.
- Tổng lượt tải CV.
- Tin nhắn chưa đọc.
- Top repo được click.
- Biểu đồ visitor theo ngày.

## 4. Quản lý visitor logs

### Filter

```txt
Date range
Event type
IP
Path
Repo name
Search text
Sort newest/oldest
```

### Actions

- View detail.
- Copy IP/session.
- Export CSV.
- Delete old logs nếu cần.

## 5. Quản lý chatbot messages

Message có trạng thái:

```txt
unread -> read -> archived
```

Bạn có thể:

- Đọc message.
- Ghi admin note.
- Đánh dấu đã xử lý.
- Mở Zalo contact nếu visitor để lại.

## 6. Quản lý repo hiển thị

Mỗi repo có toggle:

```txt
Visible: ON/OFF
Featured: ON/OFF
Priority: number
Category: unity/backend/ai/web/algorithm/database/other
Try Now URL
Case Study URL
Custom Title
Custom Description
```

### Khi nào tắt repo?

- Repo test/lỗi.
- Repo chưa có README.
- Repo không liên quan Unity/career.
- Repo cũ làm giảm chất lượng portfolio.

### Khi nào bật featured?

- Có demo.
- Có README tốt.
- Có screenshot/video.
- Có liên quan Unity/game/backend/AI.

## 7. Quản lý content

Có thể mở rộng admin để chỉnh:

- Quote.
- Books.
- Hero tagline.
- Contact links.
- Audio track list.
- Theme preset.

## 8. Export CSV

Các bảng nên export được:

```txt
visitor_events.csv
chat_messages.csv
repo_clicks.csv
```

CSV columns example:

```txt
timestamp,eventType,ip,path,repoName,userAgent,sessionId
```

## 9. Admin safety

- Không share admin command.
- Đổi command định kỳ.
- Đổi password nếu nghi ngờ bị lộ.
- Không commit file command lên GitHub.
- Logout sau khi dùng máy lạ.

