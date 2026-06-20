# Book Cover Assets

Book recommendation images are stored locally so the portfolio can render stable thumbnails without runtime cover-search requests.

Active UI thumbnails are generated from the first page of each PDF:

- `game-programming-patterns-page1.png` - Game Programming Patterns
- `clean-code-page1.png` - Clean Code
- `unity-in-action-page1.png` - Unity in Action
- `game-engine-architecture-page1.png` - Game Engine Architecture

Refresh active thumbnails with:

```bash
npm run books:covers
```

The older OpenLibrary cover downloads are kept as fallback/reference assets:

- `game-programming-patterns.jpg` - Game Programming Patterns
- `clean-code.jpg` - Clean Code
- `unity-in-action.jpg` - Unity in Action
- `game-engine-architecture.jpg` - Game Engine Architecture

Refresh OpenLibrary fallback covers with:

```bash
node scripts/download-book-covers.js
```
