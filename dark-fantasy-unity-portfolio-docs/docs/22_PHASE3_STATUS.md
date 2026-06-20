# 22 - Trạng thái Phase 3

Cập nhật lần cuối: 2026-06-11

## Đã hoàn thành

- Khu vực Try Now mở modal WebGL tải lười.
- Modal có các dòng loading horror, iframe WebGL, cảnh báo mobile, fullscreen, nút mở riêng, link GitHub fallback và xử lý đóng/Escape.
- Âm thanh portfolio được giảm âm hoặc dừng khi mở WebGL modal.
- Có demo trình duyệt nhẹ tại `public/games/biome-gate/index.html`.
- Cấu hình demo WebGL được phản chiếu trong `src/config/webgl-demos.json`.

## Việc còn lại

- Thay `public/games/biome-gate` bằng Unity WebGL export thật khi sẵn sàng.
- Thêm video gameplay fallback nếu bản Unity quá nặng trên mobile.
- Thêm analytics backend cho `TRY_NOW_CLICK`, `WEBGL_LOAD_START`, `WEBGL_LOAD_READY`, `WEBGL_LOAD_ERROR`, `WEBGL_FULLSCREEN` và `WEBGL_CLOSE`.
- Nối card dự án với `tryNowUrl` khi đã chọn repo/bản build Unity.

## Ghi chú đưa Unity build vào dự án

Chép output Unity WebGL vào:

```txt
public/games/biome-gate/
  index.html
  Build/
  TemplateData/
```

Giữ nguyên URL, hoặc cập nhật `src/config/webgl-demos.json` và hằng `webglDemo` trong `src/scripts/phase1.js`.
