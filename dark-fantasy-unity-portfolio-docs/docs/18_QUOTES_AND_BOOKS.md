# 18 — Quotes & Books

## 1. IT / Game Dev quotes

Dùng quotes ngắn để tạo cảm giác “arcane wisdom” trong section Library.

```txt
"Programs must be written for people to read, and only incidentally for machines to execute." — Harold Abelson
```

```txt
"Simplicity is the soul of efficiency." — Austin Freeman
```

```txt
"First, solve the problem. Then, write the code." — John Johnson
```

```txt
"Premature optimization is the root of all evil." — Donald Knuth
```

```txt
"Make it work, make it right, make it fast." — Kent Beck
```

```txt
"The most disastrous thing that you can ever learn is your first programming language." — Alan Kay
```

```txt
"Code is like humor. When you have to explain it, it’s bad." — commonly attributed to Cory House
```

```txt
"A game is a series of interesting choices." — Sid Meier
```

## 2. Cách render quote

```txt
[Arcane Quote Card]
Quote
Author
Category: Software / Game Design / Clean Code
Language: EN/VI optional
```

## 2.1. Runtime quote data

Quote card now reads from `window.CursedBiomesContent.libraryQuotes` in `src/scripts/site-content.js`.
On every page load, `src/scripts/phase1.js` picks one random quote and renders it into:

```html
[data-random-quote]
[data-random-quote-author]
```

When switching locale, the page keeps the same random quote index and swaps to the matching localized quote.
Add more quotes by appending objects:

```js
{ text: '"Quote text"', author: 'Author or note' }
```

## 3. Recommended books/resources

> Chỉ nên link sách miễn phí/hợp pháp hoặc trang mua chính thức. Không nên đưa link EPUB lậu vào portfolio.

| Book | Why useful | Link type |
|---|---|---|
| Game Programming Patterns — Robert Nystrom | Design patterns áp dụng cho game, object pool, game loop, command, component | Official web + official ebook options |
| Eloquent JavaScript — Marijn Haverbeke | JavaScript nền tảng cho portfolio frontend, async, browser | Official free web + EPUB |
| Pro Git — Scott Chacon & Ben Straub | Git workflow, branch, collaboration, GitHub | Official free ebook |
| The Nature of Code — Daniel Shiffman | Simulation, particles, forces, emergent behavior, rất hợp game/visual effects | Official web / ebook |
| Microsoft C# Documentation | C# nền tảng cho Unity và backend .NET | Official docs |
| Unity Web optimization resources | Tối ưu WebGL/Web build | Official Unity article |

## 4. Legal links to include

```md
- [Game Programming Patterns](https://gameprogrammingpatterns.com/)
- [Game Programming Patterns EPUB option](https://www.smashwords.com/books/view/556826)
- [Eloquent JavaScript](https://eloquentjavascript.net/)
- [Eloquent JavaScript EPUB](https://eloquentjavascript.net/Eloquent_JavaScript.epub)
- [Pro Git](https://git-scm.com/book/en/v2)
- [The Nature of Code](https://natureofcode.com/)
- [C# Guide — Microsoft Learn](https://learn.microsoft.com/en-us/dotnet/csharp/)
- [Unity Web build optimization](https://unity.com/how-to/profile-optimize-web-build)
```

## 5. Book UI

```txt
[Book Card]
Title
Author
Why I recommend it
Tags: C#, Unity, Game Architecture, Git, JS, Simulation
[Read] [EPUB/Buy]
```

## 6. Vietnamese descriptions

### Game Programming Patterns

Sách rất hợp Unity Developer vì giải thích pattern trong bối cảnh game: game loop, command, component, observer, object pool. Dùng để nâng code từ “script chạy được” thành “system dễ mở rộng”.

### Eloquent JavaScript

Hữu ích cho phần web portfolio: async, module, browser, DOM, event handling. Dù bạn theo Unity, biết JS giúp bạn làm tool/web/admin tốt hơn.

### Pro Git

Cần cho làm việc nhóm: branch, merge, rebase, remote, conflict, tag, release. Portfolio có GitHub realtime nên Git càng quan trọng.

### The Nature of Code

Hợp để học particle, force, vector, flocking, emergence. Những thứ này có thể biến thành hiệu ứng trong game hoặc background portfolio.
