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
- Pages are lazy-rendered near the viewport, so large PDFs do not render every page at once.
- The default local reader does not open a `.pdf` URL. It asks `/api/books/meta?path=...` for size, then streams pages through `/api/books/chunk?path=...&offset=...&length=...` in 256 KB pieces.
- `/api/books/data?path=...` remains as a compatibility source identifier, but `reader.js` converts it into chunked API calls before PDF.js reads the file. This avoids IDM/browser auto-download hooks in most cases and works for the full synced repo.

Google Drive mode:

- Upload a PDF to Drive and use a public preview URL like `https://drive.google.com/file/d/FILE_ID/preview`.
- Add `drivePreviewUrl` to the matching book item in `frontend/src/scripts/site-content.js`.
- Drive preview URLs are kept as source/fallback links. The Read button uses the local chunked reader by default because Drive preview can still trigger IDM through Google's internal PDF requests.

Refresh command:

```bash
npm run books:sync
```

The command downloads PDFs from `PiupiuTenshi/GameProgramBooks` and copies the PDF.js runtime into `public/vendor/pdfjs`.

Google Drive upload helper:

```bash
set GOOGLE_DRIVE_ACCESS_TOKEN=your_oauth_access_token
npm run books:drive:upload
```

The helper uploads the four local PDFs to folder `1v2XRK1AjALAxpOGVX1YiVfSWEcj2a3D5`, makes them public reader files, and prints `bookDrivePreviews` entries for `frontend/src/scripts/site-content.js`.

Google Drive Desktop full repo sync:

```bash
npm run books:drive:sync-all
```

This downloads every supported ebook from `PiupiuTenshi/GameProgramBooks` into:

```txt
H:\My Drive\Program Books\GameProgramBooks
```

It preserves the repo folder structure and skips files that already match the expected size.
