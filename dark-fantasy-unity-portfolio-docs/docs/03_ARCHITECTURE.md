# 03 — Architecture Document

## 1. Kiến trúc tổng thể

```txt
[Visitor Browser]
  | Next.js/React UI
  | Chatbot Widget
  | WebGL Embed
  v
[Frontend App]
  | REST/JSON
  v
[Backend API]
  |-- GitHub Repo Sync Service
  |-- Chat Message Service
  |-- Visitor Event Logger
  |-- Admin Auth / Hidden Gate Service
  |-- Repo Visibility Service
  v
[Database]
  | visitor_events
  | chat_messages
  | repo_settings
  | admin_sessions
  | content_blocks

[External]
  | GitHub API
  | Zalo contact link / optional Zalo OA
  | Unity WebGL static files
```

## 2. Recommended stack

### Frontend

```yaml
framework: Next.js + TypeScript
style: Tailwind CSS
animation: Framer Motion
3d: React Three Fiber optional
state: Zustand hoặc React Query
forms: React Hook Form + Zod
i18n: next-intl hoặc react-i18next
```

### Backend

```yaml
runtime: Node.js 20+
framework: NestJS hoặc Express
validation: Zod / class-validator
orm: Prisma
api: REST first, WebSocket optional
logging: Pino / Winston
```

### Database

```yaml
main: PostgreSQL
hosting: Supabase / Neon / Railway Postgres
cache: Redis optional
file_storage: Supabase Storage hoặc public/static
```

## 3. Module decomposition

```txt
src/
  app/
    page.tsx
    admin/
    api/
  components/
    hero/
    project/
    chatbot/
    webgl/
    audio/
    animation/
  features/
    github/
    admin/
    visitor-log/
    i18n/
  lib/
    api-client.ts
    analytics.ts
    github.ts
    security.ts
  config/
    site.ts
    theme.ts
```

## 4. Frontend routes

| Route | Public? | Purpose |
|---|---:|---|
| `/` | Yes | Main portfolio |
| `/game/[slug]` | Yes | Unity WebGL demo detail |
| `/cv` | Yes | CV download/preview |
| `/api/*` | Mixed | Next API proxy nếu dùng fullstack Next |
| `/admin/login` | Hidden | Admin login sau hidden gate |
| `/admin/dashboard` | Protected | Logs/messages/repos |

## 5. Backend services

### GitHubRepoService

```txt
fetchPublicRepos(username)
normalizeRepo(rawRepo)
mergeRepoSettings(repos, settings)
getVisibleRepos()
refreshCache()
```

### ChatbotService

```txt
receiveVisitorMessage(payload)
detectAdminGateCommand(text)
createAdminGateToken()
storeMessage()
markMessageRead()
```

### VisitorLogService

```txt
logEvent(event)
getEvents(filter)
exportEventsCsv(filter)
anonymizeIpIfNeeded(ip)
```

### AdminService

```txt
validateGatePhrase(text)
login(password)
issueJwt()
checkPermission()
auditAction()
```

## 6. Data flow: visitor logs

```txt
Visitor action
  -> frontend analytics.track(eventName, metadata)
  -> POST /api/events
  -> backend enrich: ip, userAgent, timestamp
  -> database visitor_events
  -> admin dashboard query with filters
```

## 7. Data flow: GitHub realtime repos

```txt
Admin config repo visibility
  -> repo_settings table
Visitor loads Projects
  -> GET /api/github/repos
  -> backend calls GitHub API or cache
  -> merge visible flag
  -> frontend renders cards
```

## 8. Data flow: hidden admin

```txt
Chatbot message: "/open gate: moonlit-biomes"
  -> POST /api/chat/message
  -> backend detects command
  -> compare with server-side secret phrase
  -> create one-time gate token
  -> return hidden admin login URL
```

## 9. Không nên làm

### Không đặt secret ở frontend

Sai:

```ts
const ADMIN_SECRET = "moonlit-biomes"; // lộ ngay trong browser bundle
```

Đúng:

```txt
/private/admin-command.txt
.env ADMIN_GATE_PHRASE=moonlit-biomes
```

Frontend chỉ gửi text lên backend, backend mới kiểm tra.

### Không cố lấy MAC address

Website công khai không thể lấy MAC address visitor qua browser. Thay bằng:

```txt
ip
userAgent
sessionId
fingerprintHash optional + consent
```

## 10. Deployment architecture

```txt
Vercel / Netlify
  -> Next.js frontend + static assets
Render / Railway / Fly.io
  -> Backend API
Supabase / Neon
  -> PostgreSQL
GitHub Actions
  -> lint + test + build + deploy
```

