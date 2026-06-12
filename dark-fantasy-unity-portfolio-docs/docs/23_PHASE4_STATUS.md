# 23 - Phase 4 Status

Last updated: 2026-06-11

## Completed

- Local Node backend added at `server.js`.
- Static site is served from the same local server.
- Public endpoints are available:
  - `GET /api/health`
  - `POST /api/chat/messages`
  - `POST /api/events`
- Development admin inbox endpoint is available:
  - `GET /api/admin/messages`
- Chatbot UI now supports:
  - free-text visitor message
  - optional email/Zalo contact
  - quick replies
  - saved-message status
  - bot reply from backend
- Messages are persisted to `data/chat-messages.json`.
- Visitor events are persisted to `data/visitor-events.json`.
- Saved messages include timestamp, sessionId, page, language, contact, IP, user agent, and unread status.

## Still Pending

- Replace JSON files with PostgreSQL/Supabase/Neon when the production backend is introduced.
- Protect `/api/admin/messages` behind hidden admin auth in Phase 5.
- Add message read/unread update endpoint in the Phase 5 admin dashboard.
- Add rate limiting stronger than the current payload-size validation.
- Add real notification delivery to Telegram/Zalo/email if desired.

## Local Preview

Run:

```bash
npm start
```

Then open:

```txt
http://127.0.0.1:3001
```

Admin inbox JSON for development:

```txt
http://127.0.0.1:3001/api/admin/messages
```
