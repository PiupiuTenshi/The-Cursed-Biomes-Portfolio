# 04 — Design Document

## 1. Creative Direction

### Theme

**Dark Fantasy / Cursed Biomes / Haunted Game Menu**

Visual cảm giác như người xem mở một cánh cổng bị nguyền rủa, bước qua các biome khác nhau:

1. **Abyss Forest** — Home/Hero.
2. **Blood Moon Ruins** — Projects.
3. **Obsidian Forge** — Skills/Tech stack.
4. **Arcane Library** — Books/Quotes.
5. **Silent Graveyard** — Contact/Chatbot.
6. **Hidden Sanctum** — Admin dashboard.

## 2. Tone & Message

| Section | Tone | Message |
|---|---|---|
| Hero | Cinematic, confident | “I build game systems, not just scripts.” |
| Projects | Practical, technical | “Here are real repos and demos.” |
| WebGL | Interactive, action | “Try my game now.” |
| Skills | Structured | “Unity/C#/backend/tools.” |
| Books | Growth mindset | “I learn from strong sources.” |
| Contact | Direct | “Contact me via Zalo/CV.” |

## 3. Color palette

```css
:root {
  --bg-abyss: #05060a;
  --bg-panel: rgba(15, 16, 25, 0.62);
  --blood: #b11226;
  --ember: #f05a28;
  --rune-violet: #8a5cf6;
  --ghost-blue: #72e7ff;
  --bone: #e8dcc6;
  --muted: #9b93a7;
  --border: rgba(232, 220, 198, 0.14);
}
```

## 4. Typography

| Use | Font style | Gợi ý |
|---|---|---|
| Title | Serif fantasy | Cinzel / Cormorant Garamond |
| Body | Clean sans | Inter / Geist / Be Vietnam Pro |
| Code | Monospace | JetBrains Mono |
| Rune accent | Decorative | UnifrakturCook optional, dùng ít |

## 5. Layout

### Desktop

```txt
[Left vertical rune nav] [Main content 12-column grid]
Hero: 2 columns, text left, 3D/avatar right
Projects: masonry/grid cards
WebGL: large ritual frame
Admin: dense dashboard tables
```

### Mobile

```txt
Top compact nav
Hero stacked
Cards single column
Audio mini bar collapse
Chatbot floating button
```

## 6. Component design

### Project Card

```txt
+------------------------------------------------+
| Repo name                         Language tag |
| Description                                    |
| Stars / forks / updated                       |
| Tags: Unity, C#, AI, Web                      |
| [View Code] [Try Now] [Docs]                  |
+------------------------------------------------+
```

Effects:

- Hover: card tilt 3D 4–8 độ.
- Border: glowing rune border.
- Background: glass blur.
- On appear: fade + y -20 -> 0.

### WebGL Frame

```txt
+------------------------------------------------+
| Loading cursed bar / Unity Canvas              |
|                                                |
|       [Unity WebGL Game]                       |
|                                                |
| [Fullscreen] [Reload] [Open fallback]          |
+------------------------------------------------+
```

### Chatbot Mini

```txt
Floating orb -> click mở panel
Panel gồm:
- Bot intro
- Suggested prompts
- Input
- Send button
- Contact handoff
```

Suggested prompts:

```txt
Show me your Unity projects
Open CV
Contact via Zalo
Try WebGL demo
/open gate: ********
```

Không show admin prompt thật cho visitor.

## 7. Motion principles

1. **Motion có mục đích**: dẫn mắt đến CTA, không làm rối.
2. **Mượt nhưng nhẹ**: ưu tiên transform/opacity, hạn chế layout animation nặng.
3. **Respect reduced motion**: nếu user bật giảm motion, tắt particles/tilt/trail.
4. **Dark fantasy không đồng nghĩa khó đọc**: text contrast cao.

## 8. Loading horror design

### Concept

Thanh loading là một “blood ritual bar”:

```txt
[ skull icon ] ███████▒▒▒▒▒  66%  “Summoning repositories...”
```

### Loading stages

| Progress | Text EN | Text VI |
|---:|---|---|
| 0–20% | Opening the cursed gate... | Đang mở cổng nguyền rủa... |
| 20–45% | Awakening forgotten biomes... | Đang đánh thức các biome bị lãng quên... |
| 45–70% | Summoning GitHub relics... | Đang triệu hồi di vật GitHub... |
| 70–90% | Binding WebGL spirits... | Đang ràng buộc linh hồn WebGL... |
| 90–100% | Enter the sanctum. | Bước vào thánh điện. |

## 9. Avatar / personal image direction

Bạn có thể thêm ảnh cá nhân theo phong cách:

```txt
Dark fantasy Unity developer portrait,
black cloak, subtle glowing C# rune,
cursed forest background,
cinematic rim light,
not too scary,
professional recruiter-friendly
```

Không nên:

- Quá máu me.
- Quá anime nếu muốn apply công ty chuyên nghiệp.
- Che mặt quá nhiều.

## 10. Recruiter mode

Nên có toggle nhỏ:

```txt
Recruiter Mode: ON
```

Khi bật:

- Tắt audio.
- Giảm particles.
- Ưu tiên CV, projects, skills.
- Giữ theme nhưng bớt hiệu ứng nặng.

