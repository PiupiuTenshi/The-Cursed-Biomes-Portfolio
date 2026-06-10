# 14 — Deployment & CI/CD Pipeline

## 1. Environments

```txt
local       -> dev trên máy cá nhân
preview     -> mỗi pull request / branch
production  -> domain chính
```

## 2. Environment variables

```txt
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_GITHUB_USERNAME=PiupiuTenshi
DATABASE_URL=
GITHUB_TOKEN=
ADMIN_GATE_PHRASE=
ADMIN_JWT_SECRET=
ADMIN_PASSWORD_HASH=
IP_GEO_PROVIDER_KEY=
ZALO_CONTACT_URL=
```

Không commit `.env`.

## 3. Frontend deploy

Recommended:

```txt
Vercel hoặc Netlify
```

Build command:

```bash
npm run build
```

Output:

```txt
.next hoặc dist tùy framework
```

## 4. Backend deploy

Recommended:

```txt
Render / Railway / Fly.io
```

Commands:

```bash
npm install
npx prisma migrate deploy
npm run build
npm run start:prod
```

## 5. Database deploy

Recommended:

```txt
Supabase / Neon PostgreSQL
```

Migration:

```bash
npx prisma migrate dev --name init
npx prisma migrate deploy
```

## 6. Unity WebGL deploy

Option A — Static public folder:

```txt
public/games/biomes-demo/index.html
```

Option B — Separate host:

```txt
itch.io / Cloudflare Pages / Netlify static
```

Option C — CDN:

```txt
Upload Build folder to object storage/CDN
```

## 7. GitHub Actions

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run build
```

## 8. Quality gates

Before production:

- [ ] Build pass.
- [ ] Lint pass.
- [ ] Typecheck pass.
- [ ] No env leaked.
- [ ] Admin route protected.
- [ ] GitHub API fallback works.
- [ ] WebGL demo loads.
- [ ] Mobile responsive.
- [ ] Audio starts only after click.
- [ ] i18n keys complete.

## 9. Performance checklist

- [ ] Images `.webp`/`.avif`.
- [ ] Lazy load WebGL.
- [ ] Lazy load 3D model.
- [ ] Compress audio `.ogg`/`.mp3`.
- [ ] Avoid huge GIFs; prefer video/webp/lottie.
- [ ] Cache GitHub repos.
- [ ] Use CDN for static assets.

## 10. Monitoring

Basic:

```txt
/admin/dashboard logs
server logs
Vercel/Render logs
DB dashboard
```

Advanced:

```txt
Sentry for frontend/backend errors
PostHog/Plausible for analytics if needed
UptimeRobot for uptime
```

