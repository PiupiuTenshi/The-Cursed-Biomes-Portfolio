# 21 - Trạng thái Phase 2

Cập nhật lần cuối: 2026-06-11

## Đã hoàn thành

- Card dự án tải động từ GitHub API công khai:
  - `https://api.github.com/users/PiupiuTenshi/repos?sort=updated&direction=desc&per_page=100`
- Repo được chuẩn hoá trong `src/scripts/phase1.js` sang model hiển thị của Phase 2.
- Đã áp dụng setting overlay kiểu admin cho `TechWeb-2026`, `Privacy-Preserving-Vertical-Fragmentation-PII-Shield` và `Academic-performance-management`.
- Đã có thứ tự công khai: featured trước, priority tăng dần, ngày push giảm dần, stars giảm dần, rồi theo tên.
- Đã có cache local bằng `localStorage`, TTL 10 phút.
- Hiển thị dữ liệu fallback khi GitHub API lỗi hoặc bị rate limit.
- Có bộ lọc Tất cả, Nổi bật, Web, Security và Quản lý.
- Cấu hình overlay seed được phản chiếu tại `src/config/repo-settings.json` để chuẩn bị chuyển sang backend/admin.

## Việc còn lại

- Thay GitHub fetch phía client bằng backend proxy `/api/github/repos` khi backend phù hợp.
- Chuyển `repoSettings` từ JavaScript tĩnh sang setting admin có DB.
- Thêm tracking cho lượt xem dự án, click code, Try Now, docs và thay đổi bộ lọc.
- Thêm cover/ảnh chụp dự án phong phú hơn.
- Thêm route admin để ẩn/hiện repo ở Phase 5.

## Ghi chú xem trước

Mở trực tiếp `index.html` vẫn hoạt động. Trình duyệt cần Internet để fetch GitHub; nếu không sẽ hiện dữ liệu fallback.
