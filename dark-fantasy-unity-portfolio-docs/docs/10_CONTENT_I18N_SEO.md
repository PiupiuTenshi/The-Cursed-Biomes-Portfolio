# 10 — Content, i18n & SEO Document

## 1. Content model

Website nên tách content khỏi component.

```txt
src/content/en.json
src/content/vi.json
src/content/projects.ts
src/content/books.ts
src/content/quotes.ts
```

## 2. i18n principles

- Không hardcode text trong component.
- Mỗi text có key rõ ràng.
- Có fallback English.
- Không dịch tên công nghệ: Unity, C#, WebGL, GitHub, API.
- Text dài cần responsive wrapping.

## 3. Namespace structure

```json
{
  "nav": {},
  "hero": {},
  "projects": {},
  "webgl": {},
  "skills": {},
  "chatbot": {},
  "admin": {},
  "errors": {}
}
```

## 4. Example EN

```json
{
  "hero": {
    "title": "Unity Developer crafting gameplay systems from cursed biomes.",
    "subtitle": "A dark fantasy portfolio powered by live GitHub repositories, WebGL demos, and interactive UI.",
    "tryNow": "Try Now",
    "downloadCv": "Download CV"
  }
}
```

## 5. Example VI

```json
{
  "hero": {
    "title": "Unity Developer xây dựng gameplay system từ những biome bị nguyền rủa.",
    "subtitle": "Portfolio dark fantasy với GitHub repo cập nhật realtime, demo WebGL và UI tương tác.",
    "tryNow": "Chơi thử",
    "downloadCv": "Tải CV"
  }
}
```

## 6. SEO title/meta

### English

```txt
Title: Phạm Minh Sáng — Unity Developer Portfolio
Description: Dark fantasy Unity developer portfolio featuring live GitHub repositories, WebGL game demos, C# gameplay systems, and interactive UI.
```

### Vietnamese

```txt
Title: Phạm Minh Sáng — Portfolio Unity Developer
Description: Portfolio Unity Developer phong cách dark fantasy, có repo GitHub tự cập nhật, demo game WebGL, C# gameplay systems và UI tương tác.
```

## 7. Open Graph

```yaml
og:title: "Phạm Minh Sáng — Unity Developer Portfolio"
og:description: "Live GitHub repos, Unity WebGL demos, dark fantasy UI."
og:image: "/og/dark-fantasy-portfolio-cover.png"
og:type: "website"
```

## 8. Content blocks

### Hero tagline options

```txt
- I build game systems, not just scripts.
- Code is my spellbook. Unity is my forge.
- From gameplay loops to cursed biomes.
- Turning mechanics into memorable game feel.
```

### Vietnamese tagline

```txt
- Tôi xây gameplay system, không chỉ viết script.
- Code là spellbook, Unity là lò rèn.
- Từ gameplay loop đến những biome bị nguyền rủa.
- Biến cơ chế thành cảm giác chơi đáng nhớ.
```

## 9. Contact content

```txt
Zalo: 0898087507
GitHub: https://github.com/PiupiuTenshi
CV: /cv/Pham-Minh-Sang-Unity-Developer-CV.pdf
```

CTA:

```txt
EN: Contact me via Zalo
VI: Liên hệ tôi qua Zalo
```

## 10. No-bug i18n checklist

- [ ] Tất cả key EN/VI có cùng cấu trúc.
- [ ] Có script check missing keys.
- [ ] Không concat string thủ công kiểu `Hello ${name}` nếu ngôn ngữ cần đảo trật tự.
- [ ] Format date theo locale.
- [ ] Font hỗ trợ tiếng Việt đầy đủ.
- [ ] Admin dashboard cũng có i18n hoặc ít nhất không vỡ layout.

