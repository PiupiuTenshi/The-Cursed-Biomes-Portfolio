# 05 — UI/UX Document

## 1. UX Goals

1. Người xem hiểu bạn là Unity Developer trong 5 giây đầu.
2. Có nút **Try Now** demo game thật, không bị giấu quá sâu.
3. Repo tự cập nhật nhưng vẫn có kiểm soát từ admin.
4. Chatbot không phiền, chỉ hỗ trợ điều hướng và liên hệ.
5. Admin mạnh nhưng ẩn khỏi public UI.

## 2. Main navigation

```txt
Home | Projects | Try Now | Skills | Library | Contact
```

Admin không xuất hiện ở nav.

## 3. Page wireframe

```txt
[Loading Gate]

[Hero]
  Title: Unity Developer / Gameplay Programmer
  Subtitle: Dark fantasy portfolio powered by live GitHub repos and WebGL demos
  CTA: [Try Now] [View Projects] [Download CV]

[Featured WebGL]
  Big demo card / iframe

[Projects]
  Filters: All / Unity / C# / AI / Web / Algorithm
  Cards: live GitHub repos

[Skills]
  Unity / C# / Gameplay / Backend / Tools

[Timeline]
  Learning roadmap / project phases

[Arcane Library]
  Quotes + recommended books

[Contact]
  Zalo / GitHub / CV / Chatbot
```

## 4. Interaction details

### Try Now button

States:

```txt
idle -> hover glow -> click -> loading modal -> Unity ready -> fullscreen optional
```

Fallback:

```txt
Nếu WebGL fail:
"Your device may not support this demo. Open fallback build or view gameplay video."
```

### Project card actions

| Button | Action |
|---|---|
| View Code | Open GitHub repo |
| Try Now | Open WebGL demo if configured |
| Docs | Open README/docs route |
| Analyze | Optional project case study |

### Chatbot quick replies

```txt
- Show Unity projects
- Open WebGL demo
- Download CV
- Contact via Zalo
- What tech stack do you use?
```

Admin command không hiện trong suggestions.

## 5. Animation timing

| Animation | Duration | Easing |
|---|---:|---|
| Card reveal | 450ms | easeOut |
| Hero text typing | 20–40ms/char | linear |
| Button hover | 180ms | easeOut |
| Modal open | 300ms | cubic-bezier |
| Morph card | 600–900ms | spring |
| Mouse ghost fade | 600–1200ms | easeOut |

## 6. Accessibility

- Text contrast cao.
- Button có aria-label.
- Chatbot dùng keyboard được.
- Audio mặc định muted cho đến khi user bật.
- Có `prefers-reduced-motion`.
- Không dùng màu đỏ làm tín hiệu duy nhất.

## 7. i18n UX

Language switch:

```txt
[EN] [VI]
```

Rules:

- Lưu lựa chọn vào localStorage/cookie.
- Text trong button không quá dài.
- Nếu thiếu key, fallback sang English.
- Không trộn ngôn ngữ trong cùng section trừ tech term.

## 8. Admin dashboard UX

### Layout

```txt
Sidebar:
- Overview
- Visitor Logs
- Chat Messages
- Repo Visibility
- Content
- Settings

Main:
- KPI cards
- Filter bar
- Data table
- Detail drawer
```

### Filter bar

```txt
Search | Event Type | Date Range | IP | Path | Sort | Export CSV
```

### Repo visibility UI

```txt
[ON] Unity2DTopDown       Featured: Yes   TryNow: /games/unity2dtopdown
[OFF] OldTestRepo         Featured: No    Hidden from public
```

## 9. Empty states

| Case | Message |
|---|---|
| No repos | “No relics found. GitHub may be sleeping.” |
| No messages | “No whispers from visitors yet.” |
| No logs | “The gate has not been crossed.” |
| WebGL fail | “The ritual failed to bind the WebGL spirit.” |

## 10. Microcopy

### CTA

- Try Now — Enter the Demo
- View Source Relic
- Download CV Scroll
- Send a Raven Message
- Open Zalo Portal

### Admin

- Gate accepted.
- Gate denied.
- Repo hidden from public.
- Message marked as read.
- Logs exported.

