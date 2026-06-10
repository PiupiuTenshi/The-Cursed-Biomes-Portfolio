# 06 — Frontend Implementation Guide

## 1. Recommended structure

```txt
src/
  app/
    page.tsx
    game/[slug]/page.tsx
    admin/login/page.tsx
    admin/dashboard/page.tsx
  components/
    layout/
    hero/
    projects/
    webgl/
    chatbot/
    audio/
    effects/
    ui/
  features/
    github/
    admin/
    i18n/
    analytics/
  styles/
    globals.css
    theme.css
```

## 2. Core components

### HeroSection

Responsibilities:

- Render title/subtitle.
- Typewriter text.
- CTA buttons.
- Avatar/3D relic.
- Track CTA clicks.

Props:

```ts
type HeroSectionProps = {
  title: string;
  subtitle: string;
  cvUrl: string;
  zaloUrl: string;
};
```

### ProjectGrid

Responsibilities:

- Fetch visible repos.
- Filter by language/topic.
- Render cards.
- Handle Try Now.

```ts
type ProjectCard = {
  id: number;
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  pushedAt: string;
  htmlUrl: string;
  homepage?: string;
  topics: string[];
  visible: boolean;
  featured: boolean;
  tryNowUrl?: string;
};
```

### WebGLDemoFrame

Responsibilities:

- Load iframe or Unity build route.
- Show loading horror bar.
- Fullscreen.
- Log load/error events.

```tsx
<WebGLDemoFrame
  slug="biomes-demo"
  src="/games/biomes/index.html"
  title="Biomes WebGL Demo"
/>
```

### ChatbotMini

Responsibilities:

- Toggle panel.
- Show bot messages.
- Send visitor message to backend.
- Detect admin gate response returned by backend.

Important:

- Không kiểm tra admin secret ở client.
- Client chỉ gửi text.
- Backend mới quyết định có trả admin URL không.

## 3. CSS effects

### Glass panel

```css
.glass-panel {
  background: rgba(15, 16, 25, 0.62);
  border: 1px solid rgba(232, 220, 198, 0.14);
  backdrop-filter: blur(18px);
  border-radius: 24px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.45);
}
```

### Rune glow button

```css
.rune-button {
  position: relative;
  border-radius: 999px;
  border: 1px solid rgba(240, 90, 40, 0.45);
  background: linear-gradient(135deg, rgba(177, 18, 38, .24), rgba(138, 92, 246, .18));
  transition: transform 180ms ease, box-shadow 180ms ease;
}

.rune-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 24px rgba(240, 90, 40, .38);
}
```

### Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
  }
}
```

## 4. Animation with Framer Motion

```tsx
const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1 }
};
```

```tsx
<motion.article
  variants={cardVariants}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, amount: 0.2 }}
  transition={{ duration: 0.45, ease: "easeOut" }}
  className="glass-panel"
>
  ...
</motion.article>
```

## 5. Mouse ghost trail effect

Ý tưởng giống `LateUpdate`: render ghost theo vị trí chuột cũ, tạo cảm giác tua thời gian.

```ts
type GhostPoint = {
  x: number;
  y: number;
  createdAt: number;
};
```

Flow:

```txt
pointermove -> push current point
requestAnimationFrame -> remove old points -> render ghost sprites with opacity by age
```

Nên giới hạn:

```txt
maxPoints = 24
lifetime = 900ms
onlyDesktop = true
reducedMotion = false
```

## 6. Audio manager

Browser thường chặn autoplay audio. Vì vậy:

```txt
Page load: audio paused
User click Enable Sound: start track
Loop forever: audio.loop = true
Volume: slider 0..1
Persist: localStorage
```

Data:

```ts
type AudioTrack = {
  id: string;
  title: string;
  src: string;
  mood: "forest" | "ruins" | "combat" | "library" | "graveyard";
};
```

## 7. Text loading từng khung

Dùng `IntersectionObserver` hoặc Framer Motion `whileInView`:

```txt
Section vào viewport -> reveal title -> reveal paragraph -> reveal buttons -> reveal cards
```

Không render toàn bộ animation cùng lúc để tránh lag.

## 8. Error handling

| Error | UI fallback |
|---|---|
| GitHub API fail | Hiển thị cached/static featured projects |
| WebGL fail | Button fallback đến video/GitHub release |
| Chatbot API fail | “Message saved locally, please contact Zalo.” |
| i18n missing key | Fallback English |
| Audio blocked | Show “Click to enable sound” |

