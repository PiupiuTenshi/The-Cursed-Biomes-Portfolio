# 19 - Phase 0 Status

Last updated: 2026-06-10

## Completed

- Portfolio name locked: `The Cursed Biomes Portfolio`.
- `.env.local` exists and matches the phase 0 environment direction.
- Avatar source added from `assets/avata.png` to `public/images/avatar-dark-fantasy.png`.
- Dark fantasy avatar generated at `public/images/avatar-dark-fantasy-v2.png` and configured as the active avatar.
- UI/UX reference copied from `assets/UI-UX complete.png` to `public/images/ui-ux-complete.png`.
- Five legal OGG audio tracks added to `public/audio/track-01.ogg` through `track-05.ogg`.
- Audio source/license notes added to `public/audio/README.md`.
- Featured repositories configured:
  - `PiupiuTenshi/TechWeb-2026`
  - `PiupiuTenshi/Privacy-Preserving-Vertical-Fragmentation-PII-Shield`
  - `PiupiuTenshi/Academic-performance-management`
- Site config updated in `src/config/site.ts`.
- Theme tokens updated in `src/config/theme.ts`.
- Audio manifest added in `src/config/audio.ts`.
- Featured repository manifest added in `src/config/repositories.ts`.
- Repo seed template updated in `templates/repo-config.example.json`.

## Still Pending

- Add final CV PDF at `public/cv/Pham-Minh-Sang-Unity-Developer-CV.pdf`.
- Convert `public/images/avatar-dark-fantasy-v2.png` to optimized WebP at `public/images/avatar-dark-fantasy-v2.webp`.
- Add hero/background image assets for the first viewport.
- Add icon/logo asset for the portfolio brand.
- Replace or refine project case-study URLs after the app routes are implemented.
- Add project screenshots/covers when each repo has final visuals.
- Confirm production values for `.env.local`, especially database URL, admin JWT secret, admin password hash, and deployment URL.

## Notes For Phase 1

- Use `/images/avatar-dark-fantasy-v2.png` now; switch to `/images/avatar-dark-fantasy-v2.webp` once converted.
- Audio must remain user-gesture gated. Do not autoplay on page load.
- Keep repo visibility configurable when the backend/admin phase arrives.
