import type { Photo } from "@/lib/photos";

type Props = {
  photo: Photo;
  /** Standard `sizes` attribute; the browser picks the smallest derivative that covers it. */
  sizes: string;
  fit?: "cover" | "contain";
  priority?: boolean;
  className?: string;
};

/**
 * Renders a photo from its pre-sized WebP derivatives with a native srcset.
 * Nothing goes through an image optimizer: every file is a static asset on
 * the CDN. Fills its positioned parent, like next/image's `fill`.
 */
export function Pic({ photo, sizes, fit = "cover", priority, className = "" }: Props) {
  const srcSet = photo.srcset.map((s) => `${s.src} ${s.w}w`).join(", ");
  const blur = photo.blurDataURL
    ? {
        backgroundImage: `url(${photo.blurDataURL})`,
        backgroundSize: fit,
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }
    : undefined;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- derivatives are pre-sized; see scripts/build-photo-manifest.mjs
    <img
      src={photo.src}
      srcSet={srcSet}
      sizes={sizes}
      alt={photo.title ?? ""}
      width={photo.width}
      height={photo.height}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      draggable={false}
      style={blur}
      className={`absolute inset-0 h-full w-full select-none ${
        fit === "cover" ? "object-cover" : "object-contain"
      } ${className}`}
    />
  );
}
