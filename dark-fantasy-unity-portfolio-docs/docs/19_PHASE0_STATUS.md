# 19 - Trạng thái Phase 0

Cập nhật lần cuối: 2026-06-10

## Đã hoàn thành

- Đã chốt tên portfolio: `The Cursed Biomes Portfolio`.
- Đã tạo `.env.local` theo định hướng cấu hình môi trường của Phase 0.
- Đã thêm avatar nguồn từ `assets/avata.png` vào `public/images/avatar-dark-fantasy.png`.
- Đã tạo avatar dark fantasy tại `public/images/avatar-dark-fantasy-v2.png` và đặt làm avatar đang dùng.
- Đã chép ảnh tham chiếu UI/UX từ `assets/UI-UX complete.png` vào `public/images/ui-ux-complete.png`.
- Đã thêm năm track âm thanh OGG hợp lệ từ `public/audio/track-01.ogg` đến `track-05.ogg`.
- Đã thêm ghi chú nguồn/licence âm thanh trong `public/audio/README.md`.
- Đã cấu hình các repository nổi bật:
  - `PiupiuTenshi/TechWeb-2026`
  - `PiupiuTenshi/Privacy-Preserving-Vertical-Fragmentation-PII-Shield`
  - `PiupiuTenshi/Academic-performance-management`
- Đã cập nhật cấu hình site trong `src/config/site.ts`.
- Đã cập nhật token giao diện trong `src/config/theme.ts`.
- Đã thêm manifest âm thanh trong `src/config/audio.ts`.
- Đã thêm manifest repository nổi bật trong `src/config/repositories.ts`.
- Đã cập nhật template seed repo tại `templates/repo-config.example.json`.

## Việc còn lại

- Thêm CV PDF cuối cùng tại `public/cv/Pham-Minh-Sang-Unity-Developer-CV.pdf`.
- Chuyển `public/images/avatar-dark-fantasy-v2.png` sang WebP tối ưu tại `public/images/avatar-dark-fantasy-v2.webp`.
- Thêm ảnh hero/nền cho màn hình đầu tiên.
- Thêm icon/logo cho thương hiệu portfolio.
- Điều chỉnh URL case study sau khi app routes được triển khai.
- Thêm ảnh chụp/cover khi từng repo có hình ảnh hoàn thiện.
- Xác nhận các giá trị production trong secret manager: URL database, secret admin, password hash và URL deploy. Không commit `.env.local`.

## Ghi chú cho Phase 1

- Hiện dùng `/images/avatar-dark-fantasy-v2.png`; đổi sang `/images/avatar-dark-fantasy-v2.webp` sau khi chuyển đổi xong.
- Âm thanh phải chỉ phát sau thao tác của người dùng; không tự phát khi tải trang.
- Giữ cấu hình ẩn/hiện repo cho phase backend/admin.
