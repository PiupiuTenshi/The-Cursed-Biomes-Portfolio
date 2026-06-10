# Dark Fantasy Unity Developer Portfolio — Documentation Pack

> Portfolio website mang chủ đề **Dark Fantasy / Biomes / Game Dev**, tập trung showcase năng lực **Unity Developer**, dự án GitHub, demo Unity WebGL, chatbot liên hệ, hidden admin và trải nghiệm UI động.

## 1. Mục tiêu

Website này không chỉ là trang giới thiệu cá nhân, mà là một **interactive game-like portfolio** để nhà tuyển dụng nhìn thấy:

- Bạn có tư duy Unity/gameplay: animation, WebGL demo, game feel, UI flow.
- Bạn biết làm sản phẩm web động: fetch GitHub repo realtime, i18n Anh/Việt, admin dashboard, log visitor.
- Bạn biết thiết kế hệ thống: frontend, backend, database, pipeline, bảo mật, deploy.
- Bạn có cá tính riêng: dark fantasy, Biomes-inspired, âm thanh loop, loading ghê rợn, hiệu ứng morph/blur/3D.

## 2. Persona / Brand

```yaml
name: "Phạm Minh Sáng"
handle: "PiupiuTenshi"
role: "Intern / Fresher Unity Developer"
focus:
  - Unity / C# Gameplay Programming
  - WebGL Demo Showcase
  - Game Systems & UI/UX
  - Backend API / Admin Dashboard
  - Automation / AI Chatbot
mood: "Dark fantasy, cursed forest, biomes, ritual UI, glowing runes"
contact:
  zalo: "0898087507"
  github: "https://github.com/PiupiuTenshi"
  cv: "/cv/Pham-Minh-Sang-Unity-Developer-CV.pdf"
```

## 3. Tính năng chính

| Nhóm | Tính năng |
|---|---|
| Home | Hero dark fantasy, typewriter text, loading horror, quote IT, CTA “Try Now” |
| Projects | Tự động cập nhật repo GitHub theo thời gian thật, lọc repo được bật/tắt từ admin |
| Unity WebGL | Demo game GL Unity nhúng trực tiếp, nút Try Now, fullscreen, fallback link |
| Chatbot | Mini chatbot nhận câu hỏi visitor, gửi tin nhắn về admin dashboard |
| Hidden Admin | Không hiện nút admin; mở bằng lệnh bí mật trong chatbot, kiểm tra ở backend |
| Admin | Log visitor, message inbox, filter/sort/search, repo visibility control, export CSV |
| UI/Animation | Glassmorphism blur, morph cards, smooth transitions, 3D tilt, mouse ghost trail |
| Audio | 5 bài loop vô hạn, volume slider, mute, next/previous, lưu setting localStorage |
| i18n | Chuyển đổi Anh/Việt qua file JSON, fallback không lỗi |
| Content | CV, Zalo contact, quote IT, sách recommend kèm link hợp pháp |

## 4. Cấu trúc tài liệu

```txt
README.md
/docs
  01_PRODUCT_BRIEF.md
  02_PHASE_ROADMAP.md
  03_ARCHITECTURE.md
  04_DESIGN_DOCUMENT.md
  05_UI_UX_DOCUMENT.md
  06_FRONTEND_IMPLEMENTATION.md
  07_BACKEND_API_ADMIN_CHATBOT.md
  08_GITHUB_DYNAMIC_REPOS.md
  09_UNITY_WEBGL_TRY_NOW.md
  10_CONTENT_I18N_SEO.md
  11_SECURITY_PRIVACY_LIMITS.md
  12_AUDIO_ANIMATION_EFFECTS.md
  13_DATA_SCHEMA.md
  14_DEPLOYMENT_PIPELINE.md
  15_ADMIN_USER_GUIDE.md
  16_FUTURE_ROADMAP.md
  17_ASSET_GUIDE.md
  18_QUOTES_AND_BOOKS.md
/templates
  env.example
  repo-config.example.json
  i18n.en.example.json
  i18n.vi.example.json
  admin-command.example.txt
```

## 5. Gợi ý tech stack

```yaml
frontend:
  framework: "Next.js / React + TypeScript"
  animation: "Framer Motion + GSAP optional"
  style: "Tailwind CSS + CSS variables + backdrop-filter"
  i18n: "next-intl hoặc react-i18next"
  3d: "Three.js / React Three Fiber optional"

backend:
  runtime: "Node.js / NestJS hoặc Express"
  database: "PostgreSQL / Supabase / Neon"
  cache: "Redis optional hoặc in-memory TTL cache"
  auth: "Admin JWT + hidden chatbot gate"
  logging: "Winston/Pino + DB visitor_events"

deploy:
  frontend: "Vercel / Netlify"
  backend: "Render / Railway / Fly.io"
  database: "Supabase / Neon"
  static_webgl: "Vercel public folder hoặc itch.io embed"
```

## 6. Ghi chú quan trọng

- **Không thể lấy MAC address visitor bằng website thông thường.** Browser không cung cấp MAC vì lý do riêng tư. Tài liệu này thay bằng `ip`, `userAgent`, `sessionId`, `fingerprintHash` có consent.
- **Plaintext admin command không được đặt ở frontend.** Đặt trong backend/private file hoặc biến môi trường, có thể chỉnh sửa nhưng không bundle ra client.
- **Không dùng link EPUB lậu.** Chỉ dùng link sách miễn phí/hợp pháp hoặc link mua chính thức.

## 7. Cách dùng nhanh

1. Copy thư mục `docs/` vào repo portfolio.
2. Dùng `README.md` này làm overview cho repo.
3. Dùng `templates/env.example` để tạo `.env.local`.
4. Dùng `templates/repo-config.example.json` làm dữ liệu seed cho admin repo visibility.
5. Khi build web, bám theo thứ tự phase trong `02_PHASE_ROADMAP.md`.

