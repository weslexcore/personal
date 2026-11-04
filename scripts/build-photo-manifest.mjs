// Scans public/photos and (re)writes content/photos.json.
// Keeps any title/location you've hand-edited for a photo with the same id.
//   pnpm photos
import { readdir, readFile, writeFile, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import exifr from "exifr";

const PHOTOS_DIR = "public/photos";
const MANIFEST = "content/photos.json";
const EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".tif", ".tiff"]);

const pad = (n) => String(n).padStart(2, "0");
const naive = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

let existing = [];
try {
  existing = JSON.parse(await readFile(MANIFEST, "utf8"));
} catch {}
const prior = new Map(existing.map((p) => [p.id, p]));

const files = (await readdir(PHOTOS_DIR))
  .filter((f) => EXT.has(path.extname(f).toLowerCase()))
  .sort();

if (files.length === 0) {
  console.error(`No images found in ${PHOTOS_DIR}. Manifest left untouched.`);
  process.exit(1);
}

const out = [];
for (const file of files) {
  const abs = path.join(PHOTOS_DIR, file);
  const id = path.parse(file).name;
  // Read once into memory; passing a path to exifr leaves a FileHandle open,
  // which Node 26 treats as an error at garbage collection.
  const buf = await readFile(abs);
  const meta = await sharp(buf).metadata();
  const rotated = (meta.orientation ?? 1) >= 5;
  const width = rotated ? meta.height : meta.width;
  const height = rotated ? meta.width : meta.height;

  let exif = {};
  try {
    exif =
      (await exifr.parse(buf, {
        pick: ["DateTimeOriginal", "CreateDate", "Make", "Model", "LensModel", "ImageDescription"],
      })) ?? {};
  } catch {}
  const taken = exif.DateTimeOriginal ?? exif.CreateDate ?? (await stat(abs)).mtime;
  const camera = [exif.Make, exif.Model].filter(Boolean).join(" ").trim() || undefined;

  const blur = await sharp(buf).rotate().resize(12).webp({ quality: 40 }).toBuffer();
  const old = prior.get(id) ?? {};

  out.push({
    id,
    src: `/photos/${file}`,
    width,
    height,
    takenAt: naive(taken),
    title: old.title ?? exif.ImageDescription ?? undefined,
    location: old.location,
    camera: old.camera ?? camera,
    blurDataURL: `data:image/webp;base64,${blur.toString("base64")}`,
  });
  const dateSource = exif.DateTimeOriginal ?? exif.CreateDate ? "exif" : "file mtime, no EXIF date";
  console.log(`${file}  ${width}x${height}  ${naive(taken)}  (${dateSource})`);
}

out.sort((a, b) => a.takenAt.localeCompare(b.takenAt));
await writeFile(MANIFEST, JSON.stringify(out, null, 2) + "\n");
console.log(`Wrote ${out.length} photos to ${MANIFEST}`);
