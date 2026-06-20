# 29 - Hướng dẫn triển khai

Cập nhật lần cuối: 2026-06-20

## Hướng triển khai khuyến nghị

Deploy full Node server trước. Nó phục vụ portfolio public, admin ẩn, API, audio, ảnh và WebGL từ cùng một origin.

- Render: dùng `render.yaml`.
- Railway: dùng `railway.json`.

`netlify.toml` đã sẵn cho frontend tĩnh, nhưng lưu chat, inbox admin và analytics cần backend server.

## Biến môi trường production bắt buộc

Đặt các giá trị trong secret manager của host; không commit file env thật.

```txt
NODE_ENV=production
HOST=0.0.0.0
NEXT_PUBLIC_SITE_URL=https://your-domain.com
ADMIN_GATE_PHRASE=<gate-phrase-rieng>
ADMIN_PASSWORD_SHA256=<sha256-password-hash>
TRUST_PROXY=true
```

Xem cách tạo hash và xử lý secret tại `docs/33_HUONG_DAN_XU_LY_SECRET_LO_DU_LIEU.md`.

## Render

1. Tạo Blueprint hoặc Web Service mới từ repository.
2. Dùng `render.yaml`.
3. Đặt các secret: `ADMIN_GATE_PHRASE`, `ADMIN_PASSWORD_SHA256`, `NEXT_PUBLIC_SITE_URL` và cấu hình SMTP nếu dùng thông báo.
4. Lệnh chạy là `npm start`; health check là `/api/health`.

## Railway

1. Tạo Railway project từ repository.
2. Railway đọc `railway.json`.
3. Đặt các secret như Render và xác nhận health check `/api/health`.

## Frontend tĩnh Netlify

1. Chạy hoặc để Netlify chạy `npm run build`.
2. Publish thư mục `dist`.
3. Chỉ dùng cho public browsing trừ khi đã có URL backend deploy.

## Checklist trước khi mở site

- Thay domain mẫu trong `.env.production.example`, `robots.txt`, `sitemap.xml`.
- Chạy `npm run check`, `npm run build`, `npm run release:check`.
- Chạy local server rồi `npm run test:smoke`.
- Xác nhận HTTPS, `/api/health`, robots/sitemap, admin không lộ trên UI, chat và analytics hoạt động trên server deploy.
