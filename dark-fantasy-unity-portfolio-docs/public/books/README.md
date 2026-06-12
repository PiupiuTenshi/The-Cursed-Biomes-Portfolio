# Local Book Reader Assets

This folder stores the local PDF copies used by the portfolio book reader.

Current recommended books:

- `game-programming-patterns.pdf`
- `clean-code.pdf`
- `unity-in-action.pdf`
- `game-engine-architecture.pdf`

Reader files:

- `reader.html` hosts the in-site PDF reader modal content.
- `reader.js` renders pages with PDF.js canvas instead of relying on the browser native PDF viewer.

Refresh command:

```bash
npm run books:sync
```

The command downloads PDFs from `PiupiuTenshi/GameProgramBooks` and copies the PDF.js runtime into `public/vendor/pdfjs`.
