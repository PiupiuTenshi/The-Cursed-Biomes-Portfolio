# 09 — Unity WebGL Try Now Guide

## 1. Mục tiêu

Mỗi game Unity có thể có nút **Try Now** để recruiter chơi demo ngay trong browser.

## 2. Unity build setup

Trong Unity:

```txt
File > Build Settings > WebGL/Web > Switch Platform
Player Settings:
  Compression Format: Brotli hoặc Gzip
  Decompression Fallback: bật nếu host không setup header chuẩn
  Data Caching: bật nếu demo lớn
  Resolution: responsive canvas
Build
```

## 3. Folder structure

Sau khi build, copy vào frontend:

```txt
public/
  games/
    biomes-demo/
      index.html
      Build/
      TemplateData/
```

Try Now URL:

```txt
/games/biomes-demo/index.html
```

Hoặc tạo route wrapper:

```txt
/game/biomes-demo
```

## 4. Portfolio integration

### Project config

```json
{
  "repoName": "Unity2DTopDown",
  "tryNowUrl": "/games/unity2dtopdown/index.html",
  "webglEnabled": true,
  "fallbackVideoUrl": "/videos/unity2dtopdown-demo.mp4"
}
```

### UI states

```txt
Idle card
  -> User clicks Try Now
  -> Ritual loading overlay
  -> iframe/WebGL route loads
  -> Fullscreen optional
  -> Log TRY_NOW_START and WEBGL_READY
```

## 5. Loading horror text

```ts
const loadingLines = [
  "Opening the cursed gate...",
  "Awakening forgotten biomes...",
  "Binding WebGL spirits...",
  "Summoning gameplay loop...",
  "Enter the demo."
];
```

Tiếng Việt:

```ts
const loadingLinesVi = [
  "Đang mở cổng nguyền rủa...",
  "Đang đánh thức các biome bị lãng quên...",
  "Đang ràng buộc linh hồn WebGL...",
  "Đang triệu hồi gameplay loop...",
  "Bước vào demo."
];
```

## 6. Performance optimization

### Unity side

- Dùng URP nếu cần scale tốt.
- Giảm texture size.
- Dùng compressed audio.
- Dùng object pooling trong game.
- Tránh shader quá nặng.
- Tắt Development Build ở bản public.
- Test trên Chrome/Edge.

### Web side

- Lazy load WebGL iframe.
- Chỉ load khi user click Try Now.
- Không preload toàn bộ Build folder ở landing.
- Có fallback video/screenshot.
- Log lỗi để biết thiết bị nào fail.

## 7. Event tracking

```txt
TRY_NOW_CLICK
WEBGL_LOAD_START
WEBGL_LOAD_READY
WEBGL_LOAD_ERROR
WEBGL_FULLSCREEN
WEBGL_CLOSE
```

Payload:

```json
{
  "gameSlug": "biomes-demo",
  "repoName": "Unity2DTopDown",
  "device": "desktop",
  "language": "vi"
}
```

## 8. Fallback strategy

| Problem | Fallback |
|---|---|
| Mobile yếu | Show gameplay video |
| WebGL unsupported | Link GitHub release hoặc itch.io |
| Load quá lâu | Button “Open lightweight version” |
| Audio conflict | Mute portfolio audio khi WebGL chạy |

## 9. UX recommendation

Nên có 2 chế độ:

```txt
Quick Preview: 30–60 giây, nhẹ, chơi ngay.
Full Demo: mở trang riêng, loading đầy đủ.
```

## 10. Admin config

Admin có thể chỉnh:

```txt
webglEnabled: true/false
tryNowUrl
fallbackVideoUrl
demoLabel
priority
featured
```

