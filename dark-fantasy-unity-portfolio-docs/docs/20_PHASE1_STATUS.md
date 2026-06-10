# 20 - Phase 1 Status

Last updated: 2026-06-11

## Completed

- Static portfolio shell added at `index.html`.
- Project section was upgraded in Phase 2 to render dynamic GitHub repos while keeping the Phase 1 shell.
- Responsive dark fantasy styling added at `src/styles/phase1.css`.
- Basic interactions added at `src/scripts/phase1.js`.
- Phase 1 sections are present:
  - Loading Gate
  - Hero
  - About / Character Sheet
  - Featured Projects
  - Unity Try Now placeholder
  - Skills
  - Quotes
  - Books
  - Contact
  - Mini chatbot UI
- Animation basics are present:
  - Loading gate progress
  - Section reveal with IntersectionObserver
  - Light 3D hover tilt
  - Button and card glow states
- Audio is user-gesture gated through the header sound button.

## Still Pending

- Replace the static project copy with live GitHub API data in Phase 2. Completed in `docs/21_PHASE2_STATUS.md`.
- Replace the Try Now placeholder with a real Unity WebGL build in Phase 3.
- Add real chatbot persistence and backend contact pipeline in Phase 4.
- Add final CV PDF at `public/cv/Pham-Minh-Sang-Unity-Developer-CV.pdf`.
- Add production hero/background variants if the avatar-led hero needs a wider first-viewport image.

## How To Preview

Open `index.html` directly in a browser. No backend or build step is required for Phase 1.
