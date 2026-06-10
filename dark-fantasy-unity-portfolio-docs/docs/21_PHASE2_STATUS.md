# 21 - Phase 2 Status

Last updated: 2026-06-11

## Completed

- Project cards now load dynamically from the public GitHub API:
  - `https://api.github.com/users/PiupiuTenshi/repos?sort=updated&direction=desc&per_page=100`
- Repos are normalized in `src/scripts/phase1.js` into the Phase 2 display model.
- Admin-style overlay settings are applied for:
  - `TechWeb-2026`
  - `Privacy-Preserving-Vertical-Fragmentation-PII-Shield`
  - `Academic-performance-management`
- Public sorting is implemented:
  - featured first
  - priority ascending
  - pushed date descending
  - stars descending
  - name ascending
- Local cache is implemented with `localStorage` and a 10 minute TTL.
- Fallback repo data is rendered if GitHub API fails or rate limits.
- Project filters are available for All, Featured, Web, Security, and Management.
- Seed overlay config is mirrored in `src/config/repo-settings.json` for future backend/admin migration.

## Still Pending

- Replace client-side GitHub fetch with `/api/github/repos` backend proxy when the backend exists.
- Move `repoSettings` from static JS into DB-backed admin visibility settings.
- Add event tracking payloads for project views, code clicks, Try Now clicks, docs clicks, and filter changes.
- Add richer project screenshots/covers when available.
- Add admin route for hiding/showing repos in Phase 5.

## Preview Notes

Opening `index.html` directly still works. GitHub fetching requires internet access in the browser; otherwise fallback data appears.
