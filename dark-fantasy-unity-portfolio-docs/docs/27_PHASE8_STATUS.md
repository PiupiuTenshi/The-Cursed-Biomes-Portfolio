# 27 - Trạng thái Phase 8

Cập nhật lần cuối: 2026-06-11

## Đã hoàn thành

- Đã mở rộng logging event công khai: `PAGE_VIEW`, `PROJECT_CLICK`, `PROJECT_FILTER_CHANGED`, `TRY_NOW_CLICK`, `CV_DOWNLOAD`, `CHAT_MESSAGE_SENT`, `LANGUAGE_SWITCHED`, các event audio, WebGL và `CLIENT_ERROR`.
- Link action dự án có metadata repo/action để admin lọc theo repo.
- `/api/admin/events` hỗ trợ tìm kiếm text, loại event, khoảng ngày, IP, path, session ID, tên repo, thứ tự mới/cũ và limit.
- API trả về event đã lọc, tổng đã lọc/chưa lọc, loại event, path, tóm tắt theo event/path và số session duy nhất.
- Dashboard có panel lọc event, xoá filter, KPI session, card tóm tắt và event feed có metadata preview.

## Việc còn lại

- Chưa bật bổ sung quốc gia/thành phố vì Phase 8 local không dùng dịch vụ geo-IP ngoài.
- Export CSV là việc tương lai.
- Cần chuyển analytics dài hạn từ JSON sang database trước deploy.
- Dashboard admin vẫn cần i18n.

## Ghi chú QA

- Analytics public là best-effort; lỗi bị bỏ qua để không chặn trải nghiệm visitor.
- Filter event admin chạy phía server và có thể kết hợp.
- Sau khi login, dùng `/api/admin/events?eventType=PAGE_VIEW&sort=newest&limit=50` để xem raw data đã lọc.
