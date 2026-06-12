# 28 - Phase 9 Status

Last updated: 2026-06-11

## Completed

- Added production-ready server behavior:
  - `NODE_ENV=production` binds to `0.0.0.0`
  - local development keeps `127.0.0.1`
  - `/api/health` now reports Phase 9 and environment
- Added security headers to static, API, and text responses:
  - `Content-Security-Policy`
  - `X-Content-Type-Options`
  - `X-Frame-Options`
  - `Referrer-Policy`
  - `Permissions-Policy`
  - `Cross-Origin-Opener-Policy`
- Added production cache policy:
  - HTML/API: no-store
  - JS/CSS/JSON: short revalidation
  - images/audio/PDF: long immutable cache
- Added CI/CD files:
  - `.github/workflows/ci.yml`
  - `render.yaml`
  - `railway.json`
  - `netlify.toml`
- Added release/deploy scripts:
  - `npm run check`
  - `npm run build`
  - `npm run release:check`
  - `npm run test:smoke`
- Added static deployment bundle generation to `dist/`.
- Added production env template:
  - `.env.production.example`
- Added SEO/deploy support files:
  - `robots.txt`
  - `sitemap.xml`
- Added deployment guide:
  - `docs/29_DEPLOYMENT_GUIDE.md`
- Package version updated to `0.9.0`.

## Still Pending

- Real online deployment still needs account credentials/tokens for Netlify/Vercel, Render/Railway, and a custom domain.
- Database is still JSON-file based locally. `DATABASE_URL` is documented for future Supabase/Neon migration, but the app does not yet write to Postgres.
- Static frontend deployment cannot save chat/admin analytics unless it points to a deployed backend or the full Node server is deployed.
- `robots.txt` and `sitemap.xml` still use `https://your-domain.com`; replace this with the real domain before production launch.

## QA Notes

- Run `npm run release:check` before pushing.
- Run `npm run build` to create the `dist/` frontend bundle.
- Run the server, then `npm run test:smoke` to check local health and critical static routes.
