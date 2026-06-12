# 29 - Deployment Guide

Last updated: 2026-06-11

## Recommended Path

Deploy the full Node server first. It serves the public portfolio, hidden admin, APIs, audio, images, and WebGL placeholder from one origin.

Good targets:

- Render: use `render.yaml`.
- Railway: use `railway.json`.

Static-only frontend hosting is also prepared with `netlify.toml`, but chat saving, admin inbox, and analytics require the backend server.

## Required Production Env

Copy `.env.production.example` into the host environment variables. Do not commit a real production env file.

Minimum required values:

```txt
NODE_ENV=production
HOST=0.0.0.0
NEXT_PUBLIC_SITE_URL=https://your-domain.com
ADMIN_GATE_PHRASE=replace-with-private-gate-phrase
ADMIN_PASSWORD_SHA256=replace-with-sha256-password-hash
```

Generate a SHA-256 password hash locally:

```powershell
node -e "const crypto=require('crypto'); console.log(crypto.createHash('sha256').update('your-password').digest('hex'))"
```

## Render

1. Create a new Blueprint or Web Service from the repository.
2. Use `render.yaml`.
3. Set secret env vars in Render:
   - `ADMIN_GATE_PHRASE`
   - `ADMIN_PASSWORD_SHA256`
   - `NEXT_PUBLIC_SITE_URL`
4. Start command is `npm start`.
5. Health check path is `/api/health`.

## Railway

1. Create a new Railway project from the repository.
2. Railway reads `railway.json`.
3. Set the same secret env vars.
4. Confirm health check path `/api/health`.

## Netlify Static Frontend

1. Run or let Netlify run `npm run build`.
2. Publish `dist`.
3. Use this only for public browsing unless a deployed backend URL is introduced.

## Pre-Launch Checklist

- Replace `https://your-domain.com` in:
  - `.env.production.example`
  - `robots.txt`
  - `sitemap.xml`
- Run:

```powershell
npm run check
npm run build
npm run release:check
```

- Start local server and run:

```powershell
npm run test:smoke
```

- Verify:
  - HTTPS is enabled by the platform.
  - `/api/health` returns `phase: 9`.
  - `/robots.txt` and `/sitemap.xml` load.
  - Admin command is not visible in public UI.
  - Chat messages and analytics write successfully on the deployed server.
