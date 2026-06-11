# 27 - Phase 8 Status

Last updated: 2026-06-11

## Completed

- Expanded public event logging:
  - `PAGE_VIEW`
  - `PROJECT_CLICK`
  - `PROJECT_FILTER_CHANGED`
  - `TRY_NOW_CLICK`
  - `CV_DOWNLOAD`
  - `CHAT_MESSAGE_SENT`
  - `LANGUAGE_SWITCHED`
  - `AUDIO_TOGGLED`
  - `AUDIO_PLAY`
  - `AUDIO_PAUSE`
  - `AUDIO_TRACK_CHANGE`
  - `AUDIO_VOLUME_CHANGED`
  - `WEBGL_LOAD_START`
  - `WEBGL_LOAD_COMPLETE`
  - `WEBGL_LOAD_FAILED`
  - `WEBGL_CLOSE`
  - `WEBGL_FULLSCREEN`
  - `CLIENT_ERROR`
- Project action links now include repo/action metadata so admin can filter by repo.
- `/api/admin/events` now supports filtering and sorting:
  - text search
  - event type
  - date from / date to
  - IP
  - path
  - session ID
  - repo name
  - newest / oldest
  - limit
- Admin events endpoint now returns:
  - filtered events
  - filtered total
  - unfiltered total
  - unique event types
  - unique paths
  - summary by event type
  - summary by path
  - unique session count
- Admin dashboard now includes:
  - event filter panel
  - clear filters action
  - sessions KPI
  - event summary cards
  - richer event feed with metadata preview
- Local health endpoint now reports Phase 8.

## Still Pending

- Country/city enrichment is not enabled yet because local-only Phase 8 avoids external geo-IP services.
- Event export CSV is still future work.
- Long-term analytics storage should move from JSON files to a database before deploy.
- Admin dashboard is still English-only.

## QA Notes

- Public analytics are best-effort; failures are intentionally swallowed so visitor UX is not blocked.
- Admin event filters are server-side and can be combined.
- Use `/api/admin/events?eventType=PAGE_VIEW&sort=newest&limit=50` after login to inspect filtered raw data.
