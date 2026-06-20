# 25 - Trạng thái Phase 6

Cập nhật lần cuối: 2026-06-11

## Đã hoàn thành

- Điều khiển ambient audio đã mở rộng thành mini console: bật/tắt tiếng, bài trước/sau, volume và nhãn track/biome.
- Đã nối đủ 5 loop OGG: Abyss Forest, Blood Ruins, Obsidian Forge, Arcane Library và Silent Graveyard.
- Audio chỉ chạy sau thao tác người dùng, setting được lưu trong `localStorage`.
- WebGL modal dừng âm thanh portfolio và khôi phục lại khi có thể.
- Có particle/fog canvas toàn trang, ghost trail chuột desktop, hover morph/glow và shimmer rune cho panel/demo shell.
- Có nút Reduce Motion lưu setting; hiệu ứng dừng khi tab ẩn và tôn trọng `prefers-reduced-motion`.
- Action audio/motion gửi event best-effort qua `/api/events`.

## Việc còn lại

- Thêm relic 3D thật bằng Three.js hoặc React Three Fiber nếu chuyển sang framework.
- Thêm lấy mẫu FPS/telemetry hiệu năng ở Phase 8.
- Thêm icon audio phong phú hơn nếu dùng thư viện icon.
- Có thể tự chuyển track theo section.

## Ghi chú QA

- Chỉ kiểm tra audio sau khi bấm `Enable Sound`.
- Dùng `Reduce Motion` để tắt canvas và hiệu ứng nặng.
- Trên mobile số particle được giảm, ghost trail bị bỏ qua.
