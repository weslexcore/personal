import type { Photo } from "./photos";

type Parts = { y: number; m: number; d: number; hh: number; mm: number };

function parseTaken(s: string): Parts {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/.exec(s);
  if (!m) return { y: 1970, m: 1, d: 1, hh: 0, mm: 0 };
  return { y: +m[1], m: +m[2], d: +m[3], hh: +(m[4] ?? 0), mm: +(m[5] ?? 0) };
}

// Format as UTC so the naive wall-clock time renders identically everywhere.
const asUTC = (p: Parts) => new Date(Date.UTC(p.y, p.m - 1, p.d, p.hh, p.mm));
const f = (opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-US", { timeZone: "UTC", ...opts });

const FORMATS = {
  year: f({ year: "numeric" }),
  month: f({ month: "long", year: "numeric" }),
  monthShort: f({ month: "short", year: "numeric" }),
  day: f({ month: "short", day: "numeric", year: "numeric" }),
  dayLong: f({ weekday: "long", month: "long", day: "numeric", year: "numeric" }),
  monthDay: f({ month: "long", day: "numeric" }),
  time: f({ hour: "numeric", minute: "2-digit" }),
};

export function fmt(kind: keyof typeof FORMATS, takenAt: string): string {
  return FORMATS[kind].format(asUTC(parseTaken(takenAt)));
}

export type Level = "year" | "month" | "day";
export type Group = {
  key: string;
  label: string;
  sublabel?: string;
  photos: Photo[];
};

export function groupPhotos(photos: Photo[], level: Level): Group[] {
  const sliceLen = level === "year" ? 4 : level === "month" ? 7 : 10;
  const groups = new Map<string, Group>();
  for (const p of photos) {
    const key = p.takenAt.slice(0, sliceLen);
    let g = groups.get(key);
    if (!g) {
      g = { key, label: fmt(level, p.takenAt), sublabel: p.location, photos: [] };
      groups.set(key, g);
    }
    g.photos.push(p);
  }
  return [...groups.values()];
}
