# 22 - Phase 3 Status

Last updated: 2026-06-11

## Completed

- Try Now section now opens a lazy-loaded WebGL modal.
- Modal includes:
  - horror loading lines
  - iframe WebGL stage
  - mobile warning
  - fullscreen button
  - open separate button
  - fallback GitHub link
  - close handling and Escape key handling
- Portfolio audio is ducked/paused while the WebGL modal is open.
- A lightweight browser demo placeholder exists at `public/games/biome-gate/index.html`.
- WebGL demo config is mirrored in `src/config/webgl-demos.json`.

## Still Pending

- Replace `public/games/biome-gate` with a real Unity WebGL export when available.
- Add a real fallback gameplay video if the Unity build is too heavy for mobile.
- Add backend analytics events for:
  - `TRY_NOW_CLICK`
  - `WEBGL_LOAD_START`
  - `WEBGL_LOAD_READY`
  - `WEBGL_LOAD_ERROR`
  - `WEBGL_FULLSCREEN`
  - `WEBGL_CLOSE`
- Connect project cards with `tryNowUrl` once a Unity repo/build is chosen.

## Unity Build Drop-In Notes

Copy Unity WebGL output into:

```txt
public/games/biome-gate/
  index.html
  Build/
  TemplateData/
```

Keep the same URL, or update `src/config/webgl-demos.json` and the `webglDemo` constant in `src/scripts/phase1.js`.
