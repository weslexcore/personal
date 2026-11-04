import manifest from "../../content/photos.json";

export type Photo = {
  id: string;
  /** Public path ("/photos/x.jpg") or remote URL. */
  src: string;
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
