# Personal site

Photography first; writing and resume to follow. Next.js 16 (App Router, Cache Components), Tailwind v4, Yarn 4.

```bash
yarn dev     # http://localhost:3000
yarn build && yarn start
yarn photos  # encode photos-original/ → public/photos/ and rebuild content/photos.json
```

## Photography (`/photos`)

Three viewing modes, switchable from the button in each mode (the `…` button on phones, the toolbar menu on desktop). The choice is kept in `localStorage` and in the URL as `?mode=library|museum|contact`.

- **Library** (default): mirrors iOS Photos on phones and macOS Photos on desktop, with Years / Months / Days / All Photos views and a full-screen viewer.
- **Museum**: each photo framed and matted on a gallery wall, one room per month. Scroll, drag, swipe, or use arrow keys to walk the hall.
- **Contact Sheet**: 35mm proof strips, one roll per month.

### Adding your photos

1. Put your originals (full-size JPEG/PNG/HEIC/etc.) in `photos-original/`. That folder is gitignored; keep it backed up elsewhere.
2. Run `yarn photos`. For each original it writes WebP derivatives at 480, 960, 1600 and 2400px on the long edge to `public/photos/`, reads EXIF (date taken, camera), generates a blur placeholder, and writes `content/photos.json`. Re-runs are incremental; `yarn photos --force` re-encodes everything. Derivatives whose original has been removed are deleted.
3. Commit `public/photos/` and `content/photos.json`. They are plain static files, so Vercel serves them from the CDN with no image transformations.
4. Optionally edit `title` and `location` per photo in `content/photos.json`. Re-running `yarn photos` keeps those edits (matched by filename).

Images are rendered by `src/components/photos/Pic.tsx` with a native `srcset`, so the browser picks the smallest derivative that covers the slot. `next/image` is not used.

`takenAt` is wall-clock time with no timezone, as EXIF records it. Grouping and display use it as-is.

Set your name and tagline in `src/lib/site.ts`.
