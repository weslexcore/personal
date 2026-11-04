import manifest from "../../content/photos.json";

export type PhotoSource = {
  /** Public path of a WebP derivative, e.g. "/photos/DSCF7963-1600.webp". */
  src: string;
  w: number;
  h: number;
};

export type Photo = {
  id: string;
  /** Largest derivative; used as the fallback src and for sharing. */
  src: string;
  /** Derivatives, smallest first. */
  srcset: PhotoSource[];
  /** Original pixel dimensions (after EXIF rotation). */
  width: number;
  height: number;
  /**
   * Wall-clock time the photo was taken, as "YYYY-MM-DDTHH:mm:ss" with no
   * timezone. EXIF stores local time, and we group/display it as such.
   */
  takenAt: string;
  title?: string;
  location?: string;
  camera?: string;
  blurDataURL?: string;
};

/** All photos, oldest first (Photos.app order: newest at the bottom). */
export function getPhotos(): Photo[] {
  return [...(manifest as Photo[])].sort((a, b) =>
    a.takenAt.localeCompare(b.takenAt),
  );
}
