# 12 — Audio, Animation & Effects Document

## 1. Audio concept

Portfolio có 5 bài loop vô hạn tương ứng với các biome.

| Track | Mood | Section |
|---|---|---|
| `track-01-abyss-forest.ogg` | Ambient forest dark | Home |
| `track-02-blood-ruins.ogg` | Low drums, ritual | Projects |
| `track-03-obsidian-forge.ogg` | Metallic, intense | Skills |
| `track-04-arcane-library.ogg` | Soft mystery | Books/Quotes |
| `track-05-silent-graveyard.ogg` | Cold, minimal | Contact |

## 2. Audio rules

- Không autoplay khi page load.
- Chỉ bật sau khi visitor click “Enable Sound”.
- Volume mặc định 30–40%.
- Có mute ngay trên UI.
- Khi Unity WebGL chạy, tự giảm/mute portfolio audio để không xung đột.
- Lưu setting vào localStorage.

## 3. Audio state machine

```txt
idle
  -> user_enable_sound
playing
  -> mute
muted
  -> unmute
playing
  -> next_track
playing_next
  -> webgl_start
ducked_or_muted
  -> webgl_close
playing
```

## 4. Animation list

| Effect | Use | Implementation |
|---|---|---|
| Typewriter | Hero text | JS/Framer Motion |
| Section reveal | Load từng khung | IntersectionObserver |
| Glass blur | Cards/panels | CSS backdrop-filter |
| Morph card | Hover/active | border-radius + clip-path |
| Rune glow | CTA/buttons | CSS box-shadow |
| Particle fog | Background | Canvas/Three.js light |
| 3D tilt | Project cards | pointer transform |
| Mouse ghost trail | Cursor old positions | requestAnimationFrame |
| Loading horror | Entry/WebGL | Progress state + CSS |

## 5. Mouse ghost trail “LateUpdate”

### Concept

Trong Unity, `LateUpdate` thường chạy sau `Update`, phù hợp để camera/visual follow logic. Trên web, ta mô phỏng bằng cách lưu vị trí chuột cũ rồi render sau frame hiện tại.

### Pseudocode

```ts
const points: GhostPoint[] = [];

window.addEventListener("pointermove", (e) => {
  points.push({ x: e.clientX, y: e.clientY, createdAt: performance.now() });
  if (points.length > 24) points.shift();
});

function renderGhosts(now: number) {
  remove points older than 900ms;
  draw each point with opacity based on age;
  requestAnimationFrame(renderGhosts);
}
```

### Visual

- Sprite: small ghost raven / dark cursor shadow.
- Opacity giảm theo thời gian.
- Scale nhỏ dần.
- Blur nhẹ.
- Chỉ desktop.

## 6. 3D effects

Dùng ít để tránh nặng:

- Hero floating relic.
- Project card tilt.
- Background parallax layers.
- Optional Three.js skull/rune model low-poly.

Performance rules:

```txt
- Không render 3D model quá nặng.
- Pause animation khi tab hidden.
- Tắt particles trên mobile yếu.
- Respect prefers-reduced-motion.
```

## 7. Morph effect

CSS idea:

```css
.morph-card {
  border-radius: 28px 16px 32px 18px;
  transition: border-radius 700ms ease, transform 300ms ease;
}

.morph-card:hover {
  border-radius: 16px 32px 18px 28px;
  transform: translateY(-4px) rotateX(2deg);
}
```

## 8. Loading horror bar

```css
.cursed-progress {
  height: 12px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(255,255,255,.08);
}

.cursed-progress__fill {
  height: 100%;
  background: linear-gradient(90deg, #3b0610, #b11226, #f05a28);
  box-shadow: 0 0 24px rgba(177, 18, 38, .65);
}
```

## 9. Animation QA checklist

- [ ] Không giật trên mobile.
- [ ] Không scroll jank.
- [ ] WebGL load không bị animation ngoài làm chậm.
- [ ] Audio UI rõ mute/unmute.
- [ ] Reduced motion hoạt động.
- [ ] Theme vẫn đọc được khi tắt effects.

