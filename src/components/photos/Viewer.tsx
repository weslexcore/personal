"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Photo } from "@/lib/photos";
import { fmt } from "@/lib/dates";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { ChevronLeft, ChevronRight, Close, Heart, Info, Share } from "./Icons";
import { Pic } from "./Pic";

type Props = {
  photos: Photo[];
  initialIndex: number;
  onClose: () => void;
  onIndexChange?: (index: number) => void;
};

export function Viewer({ photos, initialIndex, onClose, onIndexChange }: Props) {
  const isDesktop = useMediaQuery("(min-width: 768px)", true);
  const scroller = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(initialIndex);
  const indexRef = useRef(initialIndex);
  const [showInfo, setShowInfo] = useState(false);
  const [liked, setLiked] = useState<Set<string>>(() => new Set());

  const go = useCallback(
    (i: number, behavior: ScrollBehavior = "smooth") => {
      const el = scroller.current;
      if (!el) return;
      const next = Math.max(0, Math.min(photos.length - 1, i));
      el.scrollTo({ left: next * el.clientWidth, behavior });
    },
    [photos.length],
  );

  useEffect(() => go(initialIndex, "instant"), [go, initialIndex]);

  useEffect(() => {
    const onResize = () => go(indexRef.current, "instant");
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [go]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(indexRef.current + 1);
      else if (e.key === "ArrowLeft") go(indexRef.current - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose]);

  const onScroll = () => {
    const el = scroller.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== indexRef.current) {
      indexRef.current = i;
      setIndex(i);
      onIndexChange?.(i);
    }
  };

  const photo = photos[index];
  const isLiked = liked.has(photo.id);
  const toggleLike = () =>
    setLiked((s) => {
      const n = new Set(s);
      if (n.has(photo.id)) n.delete(photo.id);
      else n.add(photo.id);
      return n;
    });
  const share = async () => {
    const url = new URL(window.location.href);
    url.searchParams.set("photo", photo.id);
    try {
      if (navigator.share) await navigator.share({ title: photo.title, url: url.toString() });
      else await navigator.clipboard.writeText(url.toString());
    } catch {}
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      className={`fade-in fixed inset-0 z-[60] flex flex-col font-system ${
        isDesktop ? "bg-[#1c1c1e] text-neutral-100" : "bg-black text-white"
      }`}
    >
      {/* Top bar */}
      <header
        className={`absolute inset-x-0 top-0 z-10 flex items-center justify-between pt-[env(safe-area-inset-top)] ${
          isDesktop ? "h-[52px] bg-[#2a2a2c]/90 px-3 backdrop-blur-xl" : "bg-black/55 px-2 backdrop-blur-md"
        }`}
      >
        {isDesktop ? (
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1.5 text-neutral-300 hover:bg-white/10"
          >
            <Close />
          </button>
        ) : (
          <button
            onClick={onClose}
            aria-label="Back to library"
            className="flex h-11 items-center pr-3 text-ios-blue-dark"
          >
            <ChevronLeft width={26} height={26} strokeWidth={2.4} />
          </button>
        )}

        <div className="pointer-events-none absolute inset-x-0 text-center">
          <div className="text-[15px] font-semibold leading-tight">
            {isDesktop ? (photo.title ?? fmt("day", photo.takenAt)) : fmt("monthDay", photo.takenAt)}
          </div>
          <div className="text-[12px] text-neutral-400">
            {isDesktop ? fmt("dayLong", photo.takenAt) : fmt("time", photo.takenAt)}
          </div>
        </div>

        {isDesktop ? (
          <div className="flex items-center gap-1">
            <button
              onClick={toggleLike}
              aria-label="Favorite"
              aria-pressed={isLiked}
              className={`rounded-md p-1.5 hover:bg-white/10 ${isLiked ? "text-red-500" : "text-neutral-300"}`}
            >
              <Heart filled={isLiked} />
            </button>
            <button
              onClick={() => setShowInfo((v) => !v)}
              aria-label="Info"
              aria-pressed={showInfo}
              className={`rounded-md p-1.5 hover:bg-white/10 ${showInfo ? "bg-white/15 text-white" : "text-neutral-300"}`}
            >
              <Info />
            </button>
          </div>
        ) : (
          <span className="w-11" />
        )}
      </header>

      {/* Pages */}
      <div
        ref={scroller}
        onScroll={onScroll}
        className="no-scrollbar flex h-full w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden"
      >
        {photos.map((p, i) => (
          <div
            key={p.id}
            className={`relative h-full w-full shrink-0 snap-center ${
              isDesktop ? "py-[52px] pb-[88px]" : "py-[env(safe-area-inset-top)]"
            }`}
          >
            <div className="relative h-full w-full">
              <Pic photo={p} sizes="100vw" fit="contain" priority={Math.abs(i - index) <= 1} />
            </div>
          </div>
        ))}
      </div>

      {/* Desktop arrows */}
      {isDesktop && (
        <>
          <button
            onClick={() => go(index - 1)}
            disabled={index === 0}
            aria-label="Previous"
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white opacity-60 transition hover:opacity-100 disabled:opacity-0"
          >
            <ChevronLeft width={26} height={26} />
          </button>
          <button
            onClick={() => go(index + 1)}
            disabled={index === photos.length - 1}
            aria-label="Next"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white opacity-60 transition hover:opacity-100 disabled:opacity-0"
          >
            <ChevronRight width={26} height={26} />
          </button>
        </>
      )}

      {/* Bottom bar */}
      {isDesktop ? (
        <footer className="absolute inset-x-0 bottom-0 flex h-[88px] items-center justify-center gap-[3px] overflow-x-auto bg-[#2a2a2c]/90 px-4 backdrop-blur-xl no-scrollbar">
          {photos.map((p, i) => (
            <button
              key={p.id}
              onClick={() => go(i)}
              aria-label={`Photo ${i + 1}`}
              aria-current={i === index}
              className={`relative h-12 shrink-0 overflow-hidden rounded-[3px] transition-all ${
                i === index ? "w-16 ring-2 ring-white" : "w-8 opacity-70 hover:opacity-100"
              }`}
            >
              <Pic photo={p} sizes="64px" />
            </button>
          ))}
        </footer>
      ) : (
        <footer className="absolute inset-x-0 bottom-0 flex h-[calc(50px+env(safe-area-inset-bottom))] items-start justify-between bg-black/55 px-6 pt-2 text-ios-blue-dark backdrop-blur-md">
          <button onClick={share} aria-label="Share" className="p-2">
            <Share width={24} height={24} />
          </button>
          <button
            onClick={toggleLike}
            aria-label="Favorite"
            aria-pressed={isLiked}
            className={`p-2 ${isLiked ? "text-red-500" : ""}`}
          >
            <Heart width={24} height={24} filled={isLiked} />
          </button>
          <button
            onClick={() => setShowInfo((v) => !v)}
            aria-label="Info"
            aria-pressed={showInfo}
            className="p-2"
          >
            <Info width={24} height={24} />
          </button>
          <span className="w-10" />
        </footer>
      )}

      {showInfo && (
        <aside
          className={`pop-in absolute z-20 rounded-2xl bg-[#2a2a2c]/95 p-4 text-[13px] shadow-2xl ring-1 ring-white/10 backdrop-blur-xl ${
            isDesktop ? "right-3 top-[60px] w-72" : "inset-x-4 bottom-[calc(60px+env(safe-area-inset-bottom))]"
          }`}
          style={{ ["--pop-origin" as string]: "top right" }}
        >
          <div className="text-[15px] font-semibold">{photo.title ?? "Untitled"}</div>
          <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-neutral-300">
            <dt className="text-neutral-500">Taken</dt>
            <dd>
              {fmt("dayLong", photo.takenAt)} · {fmt("time", photo.takenAt)}
            </dd>
            {photo.location && (
              <>
                <dt className="text-neutral-500">Place</dt>
                <dd>{photo.location}</dd>
              </>
            )}
            {photo.camera && (
              <>
                <dt className="text-neutral-500">Camera</dt>
                <dd>{photo.camera}</dd>
              </>
            )}
            <dt className="text-neutral-500">Size</dt>
            <dd>
              {photo.width} × {photo.height}
            </dd>
          </dl>
        </aside>
      )}
    </div>
  );
}
