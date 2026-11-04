# Personal site

Photography first; writing and resume to follow. Next.js 16 (App Router, Cache Components), Tailwind v4, Yarn 4.

```bash
yarn dev     # http://localhost:3000
yarn build && yarn start
yarn photos  # rebuild content/photos.json from public/photos
```

## Photography (`/photos`)

Three viewing modes, switchable from the button in each mode (the `…` button on phones, the toolbar menu on desktop). The choice is kept in `localStorage` and in the URL as `?mode=library|museum|contact`.

- **Library** (default): mirrors iOS Photos on phones and macOS Photos on desktop, with Years / Months / Days / All Photos views and a full-screen viewer.
- **Museum**: each photo framed and matted on a gallery wall, one room per month. Scroll, drag, swipe, or use arrow keys to walk the hall.
- **Contact Sheet**: 35mm proof strips, one roll per month.

### Adding your photos

1. Drop JPEG/PNG/WebP files into `public/photos/`.
2. Run `yarn photos`. It reads dimensions and EXIF (date taken, camera) with `sharp` and `exifr`, generates blur placeholders, and writes `content/photos.json`.
3. Optionally edit `title` and `location` per photo in `content/photos.json`. Re-running `yarn photos` keeps those edits (matched by filename).
4. Delete the `picsum.photos` entry from `images.remotePatterns` in `next.config.ts` once no placeholders remain.

`takenAt` is wall-clock time with no timezone, as EXIF records it. Grouping and display use it as-is.

Set your name and tagline in `src/lib/site.ts`.
