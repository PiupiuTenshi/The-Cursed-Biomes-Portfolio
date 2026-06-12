# 26 - Phase 7 Status

Last updated: 2026-06-11

## Completed

- Added a lightweight i18n/content system in `src/scripts/site-content.js`.
- Added English and Vietnamese dictionaries with English fallback behavior.
- Added a header language switcher with persisted locale:
  - `en`
  - `vi`
- Converted public portfolio UI copy to i18n keys:
  - loading gate
  - header navigation
  - hero
  - character sheet
  - project filters and repo states
  - WebGL demo copy
  - skills
  - library
  - contact
  - chatbot
  - WebGL modal
- Moved content-like runtime data out of the main frontend logic:
  - audio track labels
  - WebGL loading lines
  - WebGL demo metadata
  - repo visibility settings
  - fallback repo data
- Runtime strings now use `t(key)` with fallback to `en`.
- Language switch re-renders repo cards, status text, audio labels, motion labels, placeholders, aria labels, alt text, and page metadata.
- Language switches emit a best-effort `LANGUAGE_SWITCHED` visitor event for Phase 8 analytics.
- Header CSS was adjusted so longer Vietnamese labels do not crush the audio console on tablet/mobile.
- Local health endpoint now reports Phase 7.

## Still Pending

- Admin dashboard remains English-only for now; this phase focused on the public portfolio surface.
- GitHub API descriptions are external content and are shown as returned by GitHub.
- Deeper CMS/editor support is still future work.
- A full visual browser pass should be done before deployment to catch any copy wrapping edge cases.

## QA Notes

- Use the `EN` / `VI` segmented control in the header to switch locale.
- Refresh should preserve the selected language through `localStorage`.
- If a Vietnamese key is missing, the English value should render instead of breaking the layout.
