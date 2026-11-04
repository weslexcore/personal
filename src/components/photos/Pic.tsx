"use client";

import { useEffect, useRef, useState } from "react";
import type { Photo } from "@/lib/photos";

type Props = {
  photo: Photo;
  /** Standard `sizes` attribute; the browser picks the smallest derivative that covers it. */
  sizes: string;
  fit?: "cover" | "contain";
  /** Load immediately (e.g. the photo open in the viewer and its neighbours). */
  priority?: boolean;
  className?: string;
};

/**
 * How far outside the scroll container's viewport an image may be before we
 * start fetching it, as a fraction of that viewport. Native `loading="lazy"`
 * uses a margin of several screens; this keeps it to less than one.
 */
const LOAD_MARGIN = "40%";

/**
 * Renders a photo from its pre-sized WebP derivatives with a native srcset.
 * Nothing goes through an image optimizer: every file is a static asset on
 * the CDN. Fills its positioned parent, like next/image's `fill`.
 *
 * Until the image is near the visible area of its scroll container only the
 * blur placeholder is rendered, so grids, the viewer's slide strip and the
 * museum hall fetch just what's on or next to the screen.
 */
export function Pic({ photo, sizes, fit = "cover", priority = false, className = "" }: Props) {
  const ref = useRef<HTMLElement>(null);
  const [near, setNear] = useState(priority);

  useEffect(() => {
    if (near) return;
    const el = ref.current;
    if (!el) return;
    return observeNear(el, () => setNear(true));
  }, [near]);

  const blur = photo.blurDataURL
    ? {
        backgroundImage: `url(${photo.blurDataURL})`,
        backgroundSize: fit,
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }
    : undefined;
  const classes = `absolute inset-0 h-full w-full select-none ${
    fit === "cover" ? "object-cover" : "object-contain"
  } ${className}`;

  if (!near) {
    return (
      <div
        ref={ref as React.RefObject<HTMLDivElement>}
        role="img"
        aria-label={photo.title ?? ""}
        style={blur}
        className={classes}
      />
    );
  }

  const srcSet = photo.srcset.map((s) => `${s.src} ${s.w}w`).join(", ");
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
      className={classes}
    />
  );
}

// One IntersectionObserver per scroll container, shared by every image in it.
const observers = new Map<Element | null, IntersectionObserver>();
const callbacks = new WeakMap<Element, () => void>();

function scrollContainer(el: Element): Element | null {
  for (let p = el.parentElement; p; p = p.parentElement) {
    const { overflowX, overflowY } = getComputedStyle(p);
    if (/(auto|scroll)/.test(overflowX + overflowY)) return p;
  }
  return null; // the window
}

function observeNear(el: Element, onNear: () => void): () => void {
  const root = scrollContainer(el);
  let io = observers.get(root);
  if (!io) {
    io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          io!.unobserve(e.target);
          callbacks.get(e.target)?.();
          callbacks.delete(e.target);
        }
      },
      { root, rootMargin: LOAD_MARGIN },
    );
    observers.set(root, io);
  }
  callbacks.set(el, onNear);
  io.observe(el);
  return () => {
    io.unobserve(el);
    callbacks.delete(el);
  };
}
