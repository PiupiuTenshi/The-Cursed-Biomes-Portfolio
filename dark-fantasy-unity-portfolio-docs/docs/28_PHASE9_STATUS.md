# 28 - Trạng thái Phase 9

Cập nhật lần cuối: 2026-06-20

## Đã hoàn thành

- Đã thêm hành vi server production: `NODE_ENV=production` bind `0.0.0.0`, local dùng `127.0.0.1`, `/api/health` trả environment.
- Response static/API/text có CSP, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`; production có HSTS.
- Cache production: HTML/API không cache, JS/CSS/JSON revalidate ngắn, ảnh/audio/PDF cache immutable dài.
- Có file CI/CD: `.github/workflows/ci.yml`, `render.yaml`, `railway.json`, `netlify.toml`.
- Có các script `npm run check`, `npm run build`, `npm run release:check`, `npm run test:smoke` và bundle static `dist/`.
- Có template production `.env.production.example`, `robots.txt`, `sitemap.xml` và deployment guide.
- Đã bổ sung hardening theo `docs/32_SECURITY_AUDIT_AND_HARDENING.md`.

## Việc còn lại

- Deploy online vẫn cần credential tài khoản host và custom domain.
- Database hiện là JSON local; `DATABASE_URL` mới là hướng migration sau này.
- Static frontend không thể lưu chat/admin analytics nếu không có backend deploy.
- Phải thay `https://your-domain.com` trong robots/sitemap trước production.

## Ghi chú QA

- Chạy `npm run release:check` trước khi push.
- Chạy `npm run build` để tạo `dist/`.
- Chạy server rồi `npm run test:smoke` để kiểm tra health và static route cốt lõi.
