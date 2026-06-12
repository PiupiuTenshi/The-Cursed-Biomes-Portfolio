# 02 — Phase Roadmap

## Tổng quan phase

```txt
Phase 0: Chuẩn bị brand + repo
Phase 1: Static portfolio shell
Phase 2: Dynamic GitHub repos
Phase 3: Unity WebGL Try Now
Phase 4: Chatbot + contact pipeline
Phase 5: Hidden admin + dashboard
Phase 6: Audio + animation + 3D polish
Phase 7: i18n + content system
Phase 8: Logging + analytics + filtering
Phase 9: Deploy + CI/CD + performance
Phase 10: Future expansion
```

---

## Phase 0 — Chuẩn bị

### Việc cần làm

- Chốt tên portfolio: `The Cursed Biomes Portfolio`.
- Chuẩn bị ảnh cá nhân phong cách dark fantasy.
- Chuẩn bị CV PDF.
- Chuẩn bị 5 audio loop hợp pháp.
- Chọn 3–6 repo featured ban đầu.
- Tạo file `.env.local` từ template.

### Output

```txt
/public/cv/Pham-Minh-Sang-Unity-Developer-CV.pdf
/public/images/avatar-dark-fantasy.webp
/public/audio/track-01.ogg ... track-05.ogg
/src/config/site.ts
/src/config/theme.ts
```

### Checklist

- [ ] Có ảnh hero.
- [ ] Có CV.
- [ ] Có danh sách repo ưu tiên.
- [ ] Có màu theme.
- [ ] Có icon/logo.

---

## Phase 1 — Static Portfolio Shell

### Mục tiêu

Làm giao diện nhìn “wow” trước khi có backend.

### Sections

1. Loading Gate.
2. Hero.
3. About / Character Sheet.
4. Featured Projects.
5. Unity Try Now placeholder.
6. Skills.
7. Quotes.
8. Books.
9. Contact.
10. Mini chatbot UI.

### Animation cơ bản

- Fade-in theo từng khung text.
- Stagger card list.
- Hover 3D tilt nhẹ.
- Button glow.
- Section reveal bằng IntersectionObserver.

### Done khi

- Web responsive mobile/desktop.
- Theme dark fantasy đồng bộ.
- Không cần backend vẫn xem được.

---

## Phase 2 — Dynamic GitHub Repos

### Mục tiêu

Repo tự cập nhật theo GitHub public API, không cần sửa tay.

### Luồng

```txt
Frontend request /api/github/repos
  -> Backend check cache
  -> Nếu cache còn hạn: trả data
  -> Nếu hết hạn: gọi GitHub API
  -> Normalize repo
  -> Merge với repo_visibility trong DB
  -> Trả về repo được bật
```

### Data hiển thị

- Name.
- Description.
- Language.
- Stars.
- Forks.
- Last pushed.
- Topics.
- Homepage/demo URL.
- Featured flag.
- Visibility flag từ admin.

### Done khi

- Repo mới trên GitHub tự xuất hiện.
- Admin có thể tắt repo không muốn show.
- Có fallback khi GitHub API rate limit.

---

## Phase 3 — Unity WebGL Try Now

### Mục tiêu

Nhúng demo Unity GL/WebGL vào portfolio.

### Flow

```txt
Project card -> Try Now
  -> Open modal / route /game/[slug]
  -> Load Unity index.html hoặc iframe
  -> Show loading horror progress
  -> Fullscreen option
  -> Track events: start, complete_load, close
```

### Done khi

- Demo chạy được trên Chrome/Edge.
- Có fallback link nếu thiết bị yếu.
- Có warning mobile nếu WebGL nặng.

---

## Phase 4 — Chatbot Contact Pipeline

### Mục tiêu

Visitor hỏi hoặc để lại lời nhắn, admin xem được.

### Chatbot scope

- Trả lời câu hỏi portfolio cơ bản.
- Gợi ý xem project/CV/Zalo.
- Nhận message của visitor.
- Hỏi email/Zalo optional.
- Gửi message vào admin inbox.

### Done khi

- Message lưu DB.
- Admin thấy timestamp + path visitor gửi.
- Có trạng thái read/unread.

---

## Phase 5 — Hidden Admin Dashboard

### Mục tiêu

Admin ẩn, không hiện trong UI công khai.

### Cách mở

Visitor/admin gõ trong chatbot:

```txt
/open gate: moonlit-biomes
```

Backend đọc secret phrase từ server-side plaintext hoặc env:

```txt
/private/admin-command.txt
```

Nếu đúng, backend trả về:

```txt
/admin/login?gateToken=one-time-token
```

### Done khi

- Không thể xem command trong source frontend.
- Admin route protected bằng JWT/session.
- Có logout.
- Có audit log admin action.

---

## Phase 6 — Audio + Animation + 3D Polish

### Mục tiêu

Tạo cảm giác “game menu dark fantasy”.

### Effects

- 5 audio loop vô hạn.
- Volume slider.
- Mute/unmute.
- Mouse ghost trail kiểu tua thời gian.
- Mouse ghost trail kiểu tua thời gian.
- Morph border/rune frames.
- Blur glass cards.
- Floating particles.
- Subtle 3D relic background.

### Done khi

- FPS ổn, không lag mobile.
- Audio không autoplay trái phép; chỉ bật sau user interaction.
- Có setting giảm motion.

---

## Phase 7 — i18n + Content System

### Mục tiêu

Chuyển đổi Anh/Việt không lỗi.

### Done khi

- Mọi text dùng key i18n.
- Có fallback `en` nếu thiếu key.
- Không hardcode text trong component.
- Layout không vỡ khi tiếng Việt dài hơn.

---

## Phase 8 — Logging + Analytics + Filtering

### Mục tiêu

Admin biết visitor làm gì.

### Event nên log

- Page view.
- Project click.
- Try Now click.
- CV download.
- Chat message sent.
- Language switched.
- Audio toggled.
- WebGL load started/completed/failed.

### Filter admin

- Search text.
- Date range.
- Event type.
- IP.
- Country/city optional.
- Path.
- Repo name.
- Sort newest/oldest.

---

## Phase 9 — Deploy + CI/CD

### Mục tiêu

Đẩy online ổn định.

### Done khi

- Frontend deploy Vercel/Netlify.
- Backend deploy Render/Railway/Fly.io.
- DB Supabase/Neon.
- Domain custom.
- HTTPS.
- GitHub Actions chạy lint/test/build.
- Có env production.

---

## Phase 10 — Future Expansion

- Admin content editor cho quotes/books.
- Upload ảnh và crop avatar.
- Heatmap project interest.
- AI chatbot trả lời dựa trên docs/repo README.
- WebGL save demo stats.
- Multiple theme presets.
- Recruiter mode: tắt audio/animation nặng, ưu tiên CV nhanh.

