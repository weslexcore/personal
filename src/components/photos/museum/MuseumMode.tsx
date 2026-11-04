"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fmt, groupPhotos } from "@/lib/dates";
import type { Photo } from "@/lib/photos";
import { site } from "@/lib/site";
import type { ModeProps } from "../PhotoGallery";
import { setPhotoParam } from "../modes";
import { ModeMenu } from "../ModeMenu";
import { ChevronDown, ChevronLeft, ChevronRight, Frame } from "../Icons";

export function MuseumMode({ photos, onOpen, mode, onModeChange, initialPhotoId }: ModeProps) {
  const scroller = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const rooms = useMemo(() => groupPhotos(photos, "month"), [photos]);

  // A shared link lands you in front of that photo.
  useEffect(() => {
    if (!initialPhotoId) return;
    const el = scroller.current;
    const target = el?.querySelector<HTMLElement>(`[data-frame="${CSS.escape(initialPhotoId)}"]`);
    if (!el || !target) return;
    el.scrollLeft = target.offsetLeft + target.offsetWidth / 2 - el.clientWidth / 2;
  }, [initialPhotoId]);

  // Vertical wheel walks you down the hall; drag to pan with a mouse.
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });

    let dragging = false;
    let startX = 0;
    let startLeft = 0;
    let moved = false;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      dragging = true;
      moved = false;
      startX = e.clientX;
      startLeft = el.scrollLeft;
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      el.scrollLeft = startLeft - dx;
    };
    const onUp = () => (dragging = false);
    const onClick = (e: MouseEvent) => {
      if (moved) {
        e.stopPropagation();
        e.preventDefault();
        moved = false;
      }
    };
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    el.addEventListener("click", onClick, true);
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      el.removeEventListener("click", onClick, true);
    };
  }, []);

  // Track which frame is nearest the center + drive floor parallax.
  const onScroll = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    el.style.setProperty("--walk", String(el.scrollLeft));
    const mid = el.scrollLeft + el.clientWidth / 2;
    const frames = el.querySelectorAll<HTMLElement>("[data-frame]");
    let best = 0;
    let bestDist = Infinity;
    frames.forEach((f, i) => {
      const c = f.offsetLeft + f.offsetWidth / 2;
      const d = Math.abs(c - mid);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    setCurrent(best);
    // Only claim a photo in the URL when you're actually standing in front of it.
    const standing = bestDist < el.clientWidth * 0.45;
    setPhotoParam(standing ? (frames[best]?.dataset.frame ?? null) : null);
  }, []);

  const walkTo = useCallback((i: number) => {
    const el = scroller.current;
    if (!el) return;
    const frames = el.querySelectorAll<HTMLElement>("[data-frame]");
    const f = frames[Math.max(0, Math.min(frames.length - 1, i))];
    f?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") walkTo(current + 1);
      else if (e.key === "ArrowLeft") walkTo(current - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, walkTo]);

  const photo = photos[current];

  return (
    <div className="wall fixed inset-0 select-none overflow-hidden font-serif text-[#ece7d9]">
      {/* Hall */}
      <div
        ref={scroller}
        onScroll={onScroll}
        className="no-scrollbar relative flex h-full w-full cursor-grab items-stretch overflow-x-auto overflow-y-hidden active:cursor-grabbing"
      >
        {/* Entrance */}
        <section className="flex h-full w-[88vw] shrink-0 flex-col justify-center pl-[8vw] pr-[6vw] md:w-[60vw] md:pl-[7vw]">
          <p className="text-[11px] uppercase tracking-[0.35em] text-[#9fb3a4]">Exhibition</p>
          <h1 className="mt-3 text-[clamp(2.4rem,7vw,5.5rem)] font-medium leading-[0.95] tracking-tight">
            {site.photographer}
          </h1>
          <p className="mt-5 max-w-sm text-lg italic text-[#c3cdbf]">
            {photos.length} photographs in {rooms.length} rooms, {fmt("year", photos[0].takenAt)}–
            {fmt("year", photos[photos.length - 1].takenAt)}.
          </p>
          <p className="mt-10 flex items-center gap-2 text-sm text-[#9fb3a4]">
            Scroll, drag, or use the arrow keys to walk <ChevronRight width={16} height={16} />
          </p>
        </section>

        {rooms.map((room, r) => (
          <div key={room.key} className="flex h-full shrink-0 items-stretch">
            {/* Room label on the wall */}
            <section className="flex h-full w-[46vw] shrink-0 flex-col justify-center px-[4vw] md:w-[30vw]">
              <p className="text-[11px] uppercase tracking-[0.35em] text-[#9fb3a4]">Room {r + 1}</p>
              <h2 className="mt-2 text-[clamp(1.6rem,3.2vw,2.6rem)] font-medium leading-tight">{room.label}</h2>
              {room.sublabel && <p className="mt-1 text-base italic text-[#c3cdbf]">{room.sublabel}</p>}
              <p className="mt-3 text-sm text-[#9fb3a4]">{room.photos.length} works</p>
            </section>

            {room.photos.map((p) => (
              <FramedPhoto key={p.id} photo={p} onOpen={onOpen} />
            ))}

            {/* Doorway to the next room */}
            {r < rooms.length - 1 && (
              <div className="relative mx-[6vw] h-full w-[18vw] shrink-0 md:w-[12vw]">
                <div className="absolute inset-x-0 bottom-[22vh] top-[14vh] bg-[#0f1f18] shadow-[inset_0_0_80px_rgba(0,0,0,.85)]">
                  <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />
                </div>
                <div className="absolute inset-x-[-10px] bottom-[22vh] top-[14vh] border-x-[10px] border-t-[10px] border-[#e9e3d4] shadow-[0_10px_20px_-10px_rgba(0,0,0,.6)]" />
              </div>
            )}
          </div>
        ))}

        {/* Exit */}
        <section className="flex h-full w-[70vw] shrink-0 flex-col justify-center px-[8vw] md:w-[40vw]">
          <p className="text-[11px] uppercase tracking-[0.35em] text-[#9fb3a4]">Exit</p>
          <p className="mt-3 text-2xl italic text-[#c3cdbf]">Thank you for visiting.</p>
          <button
            onClick={() => walkTo(0)}
            className="mt-6 flex w-fit items-center gap-1 text-sm text-[#9fb3a4] underline-offset-4 hover:underline"
          >
            <ChevronLeft width={16} height={16} /> Back to the entrance
          </button>
        </section>
      </div>

      {/* Floor and baseboard, fixed over the hall */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[22vh]">
        <div className="baseboard absolute inset-x-0 top-0 h-3" />
        <div className="floor absolute inset-x-0 bottom-0 top-3" style={{ ["--walk" as string]: "inherit" }} />
      </div>

      {/* HUD */}
      <div className="absolute left-4 top-4 z-30 flex items-center gap-2 md:left-6 md:top-6">
        <ModeMenu
          mode={mode}
          onChange={onModeChange}
          align="left"
          theme="light"
          trigger={({ toggle, open, id }) => (
            <button
              onClick={toggle}
              aria-haspopup="menu"
              aria-expanded={open}
              aria-controls={id}
              className="placard flex h-9 items-center gap-2 rounded-full px-3.5 font-sans text-[13px] font-medium text-neutral-900"
            >
              <Frame width={15} height={15} />
              Museum
              <ChevronDown width={12} height={12} className="opacity-60" />
            </button>
          )}
        />
      </div>

      <div className="absolute bottom-4 right-4 z-30 flex items-center gap-2 md:bottom-6 md:right-6">
        <div className="placard flex items-center gap-3 rounded-full py-1.5 pl-4 pr-1.5 font-sans text-[13px] text-neutral-900">
          <span className="tabular-nums text-neutral-700">
            {photo ? `${current + 1} / ${photos.length}` : ""}
          </span>
          <span className="flex">
            <button
              onClick={() => walkTo(current - 1)}
              aria-label="Previous work"
              className="rounded-full p-1.5 hover:bg-black/5"
            >
              <ChevronLeft width={16} height={16} />
            </button>
            <button
              onClick={() => walkTo(current + 1)}
              aria-label="Next work"
              className="rounded-full p-1.5 hover:bg-black/5"
            >
              <ChevronRight width={16} height={16} />
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}

function FramedPhoto({ photo, onOpen }: { photo: Photo; onOpen: (p: Photo) => void }) {
  const ratio = photo.width / photo.height;
  const landscape = ratio >= 1;
  // Size the print from its known dimensions so the hall's layout never
  // depends on whether an image has loaded (deep links and walking rely on it).
  // Height is the binding constraint; width-caps are folded in via the ratio.
  const height = landscape
    ? `min(48vh, 36vw, ${(72 / ratio).toFixed(2)}vw, ${(72 / ratio).toFixed(2)}vh)`
    : `min(52vh, 60vw, ${(56 / ratio).toFixed(2)}vw, ${(40 / ratio).toFixed(2)}vh)`;
  return (
    <section
      data-frame={photo.id}
      className="relative flex h-full shrink-0 items-end justify-center px-[9vw] pb-[28vh] md:px-[7vw]"
    >
      <div className="uplight pointer-events-none absolute inset-x-[-15%] bottom-[22vh] h-[62vh]" />
      <button
        onClick={() => onOpen(photo)}
        aria-label={`View ${photo.title ?? "photo"}`}
        className="frame relative outline-none focus-visible:ring-4 focus-visible:ring-amber-300/70"
      >
        <div className="mat">
          <div
            className="relative"
            style={{ aspectRatio: `${photo.width} / ${photo.height}`, height }}
          >
            <Image
              src={photo.src}
              alt={photo.title ?? ""}
              fill
              sizes={landscape ? "(max-width: 768px) 72vw, 50vw" : "(max-width: 768px) 56vw, 32vw"}
              placeholder={photo.blurDataURL ? "blur" : "empty"}
              blurDataURL={photo.blurDataURL}
              draggable={false}
              className="object-cover select-none"
            />
          </div>
        </div>
      </button>
    </section>
  );
}
