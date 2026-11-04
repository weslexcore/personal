// Builds web-sized derivatives and the photo manifest.
//
//   yarn photos            incremental: only re-encodes changed originals
//   yarn photos --force    re-encode everything
//
// Reads originals from photos-original/ (gitignored; override with PHOTOS_SRC),
// writes WebP derivatives to public/photos/<id>-<longEdge>.webp and the
// manifest to content/photos.json. Keeps any title/location you've hand-edited
// in the manifest for a photo with the same id.
import { mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import exifr from "exifr";

const SRC_DIR = process.env.PHOTOS_SRC ?? "photos-original";
const OUT_DIR = "public/photos";
const MANIFEST = "content/photos.json";
const LONG_EDGES = [480, 960, 1600, 2400];
const WEBP = { quality: 80, effort: 4 };
const EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".tif", ".tiff", ".heic"]);
const FORCE = process.argv.includes("--force");
const CONCURRENCY = Math.max(2, Math.min(6, Math.floor(os.cpus().length / 3)));

const pad = (n) => String(n).padStart(2, "0");
const naive = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
const slug = (name) => name.replace(/[^A-Za-z0-9._-]+/g, "-");

let existing = [];
try {
  existing = JSON.parse(await readFile(MANIFEST, "utf8"));
} catch {}
const prior = new Map(existing.map((p) => [p.id, p]));

let files;
try {
  files = (await readdir(SRC_DIR)).filter((f) => EXT.has(path.extname(f).toLowerCase())).sort();
} catch {
  console.error(`Cannot read ${SRC_DIR}. Put your originals there (or set PHOTOS_SRC).`);
  process.exit(1);
}
if (files.length === 0) {
  console.error(`No images found in ${SRC_DIR}. Manifest left untouched.`);
  process.exit(1);
}
await mkdir(OUT_DIR, { recursive: true });

const producedFiles = new Set();
let encoded = 0;
let reused = 0;

async function isFresh(outPath, srcMtimeMs) {
  if (FORCE) return false;
  try {
    return (await stat(outPath)).mtimeMs >= srcMtimeMs;
  } catch {
    return false;
  }
}

async function processOne(file) {
  const abs = path.join(SRC_DIR, file);
  const id = slug(path.parse(file).name);
  const srcStat = await stat(abs);
  const buf = await readFile(abs);
  const base = sharp(buf, { failOn: "none" }).rotate(); // apply EXIF orientation
  const meta = await base.metadata();
  const rotated = (meta.orientation ?? 1) >= 5;
  const width = rotated ? meta.height : meta.width;
  const height = rotated ? meta.width : meta.height;
  const longEdge = Math.max(width, height);
  const landscape = width >= height;

  let exif = {};
  try {
    exif =
      (await exifr.parse(buf, {
        pick: ["DateTimeOriginal", "CreateDate", "Make", "Model", "ImageDescription"],
      })) ?? {};
  } catch {}
  const taken = exif.DateTimeOriginal ?? exif.CreateDate ?? srcStat.mtime;
  const dateSource = exif.DateTimeOriginal ?? exif.CreateDate ? "exif" : "file mtime";
  const camera = [exif.Make, exif.Model].filter(Boolean).join(" ").trim() || undefined;

  // Never upscale: drop target sizes above the original, but always keep at
  // least one derivative (the original's own long edge, re-encoded as WebP).
  const edges = LONG_EDGES.filter((e) => e < longEdge);
  if (edges.length < LONG_EDGES.length) edges.push(Math.min(longEdge, LONG_EDGES.at(-1)));

  const srcset = [];
  for (const edge of edges) {
    const name = `${id}-${edge}.webp`;
    const outPath = path.join(OUT_DIR, name);
    producedFiles.add(name);
    const w = landscape ? edge : Math.round((edge * width) / height);
    const h = landscape ? Math.round((edge * height) / width) : edge;
    if (await isFresh(outPath, srcStat.mtimeMs)) {
      reused++;
    } else {
      const resize = landscape ? { width: edge } : { height: edge };
      await base.clone().resize({ ...resize, withoutEnlargement: true }).webp(WEBP).toFile(outPath);
      encoded++;
    }
    srcset.push({ src: `/${path.posix.join("photos", name)}`, w, h });
  }

  const smallest = srcset[0];
  const blur = await sharp(path.join(OUT_DIR, path.basename(smallest.src)))
    .resize(12)
    .webp({ quality: 40 })
    .toBuffer();
  const old = prior.get(id) ?? {};

  console.log(`${file}  ${width}x${height}  ${naive(taken)}  (${dateSource})  ${srcset.map((s) => s.w).join("/")}w`);
  return {
    id,
    src: srcset.at(-1).src,
    srcset,
    width,
    height,
    takenAt: naive(taken),
    title: old.title ?? exif.ImageDescription ?? undefined,
    location: old.location,
    camera: old.camera ?? camera,
    blurDataURL: `data:image/webp;base64,${blur.toString("base64")}`,
  };
}

// Small worker pool so a 200+ photo run keeps all cores busy without
// holding every decoded original in memory at once.
const results = new Array(files.length);
let next = 0;
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (next < files.length) {
      const i = next++;
      results[i] = await processOne(files[i]);
    }
  }),
);

// Remove derivatives whose original is gone.
let removed = 0;
for (const f of await readdir(OUT_DIR)) {
  if (!producedFiles.has(f)) {
    await rm(path.join(OUT_DIR, f));
    removed++;
  }
}

results.sort((a, b) => a.takenAt.localeCompare(b.takenAt));
await writeFile(MANIFEST, JSON.stringify(results, null, 2) + "\n");
console.log(
  `\n${results.length} photos → ${MANIFEST}. Encoded ${encoded}, reused ${reused}, removed ${removed} stale files.`,
);
