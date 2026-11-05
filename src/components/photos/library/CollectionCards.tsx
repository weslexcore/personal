"use client";

import { useEffect, useRef, useState } from "react";
import type { Group } from "@/lib/dates";
import type { Photo } from "@/lib/photos";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useOnScreen } from "@/hooks/useOnScreen";
import { Pic } from "../Pic";

type Props = {
  groups: Group[];
  columns: number;
  /** `photo` is the one the card was showing when it was chosen. */
  onSelect: (group: Group, photo: Photo) => void;
  aspect?: string;
  sizes: string;
  big?: boolean;
  /** Cycle through the group's photos, each fading into the next. */
  rotate?: boolean;
};

/** How long each photo is shown before the next one fades in. */
const HOLD_MS = 4000;

export function CollectionCards({ groups, columns, onSelect, aspect = "4 / 5", sizes, big, rotate }: Props) {
  return (
    <div
      className="grid gap-3 md:gap-4"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {groups.map((g) => (
        <Card
          key={g.key}
          group={g}
          aspect={aspect}
          sizes={sizes}
          big={big}
          rotate={rotate}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

type CardProps = Omit<Props, "groups" | "columns"> & { group: Group };

function Card({ group: g, aspect, sizes, big, rotate, onSelect }: CardProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const onScreen = useOnScreen(ref);
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const { photos } = g;

  // Rotate only while the card can be seen: a library has far more cards than fit on screen.
  const running = !!rotate && onScreen && !reduceMotion && photos.length > 1;
  const tick = useTicker(running, HOLD_MS, HOLD_MS / 2 + stagger(g.key, HOLD_MS));

  // The first photo shown is the middle one, as before; each tick moves one forward.
  const start = Math.floor(photos.length / 2);
  const photoAt = (t: number) => photos[(start + t) % photos.length];
  const current = photoAt(tick);

  // Three layers, bottom to top: the photo fading out, the one fading in, and the
  // next one, loading unseen so it is ready when its turn comes. Keyed by tick so
  // the window only ever drops its oldest layer and appends a new one; the fading
  // layer is never re-created, which is what lets its opacity transition run.
  const layers = running || tick > 0 ? [tick - 1, tick, running ? tick + 1 : -1] : [0];

  return (
    <button
      ref={ref}
      onClick={() => onSelect(g, current)}
      className="group relative overflow-hidden rounded-xl bg-neutral-200 text-left text-white outline-none focus-visible:ring-2 focus-visible:ring-ios-blue dark:bg-neutral-800"
      style={{ aspectRatio: aspect }}
    >
      <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.03]">
        {layers
          .filter((t) => t >= 0)
          .map((t) => (
            <div
              key={t}
              aria-hidden={t !== tick}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                t > tick ? "opacity-0" : "opacity-100"
              }`}
            >
              <Pic photo={photoAt(t)} sizes={sizes} />
            </div>
          ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-black/20" />
      <div className="absolute left-4 top-4 drop-shadow-md">
        <div className={`font-bold leading-none ${big ? "text-3xl" : "text-xl"}`}>{g.label}</div>
        {g.sublabel && <div className="mt-1 text-sm font-medium opacity-90">{g.sublabel}</div>}
      </div>
      <div className="absolute bottom-3 right-4 text-xs font-medium opacity-80">
        {photos.length} {photos.length === 1 ? "photo" : "photos"}
      </div>
    </button>
  );
}

/** Counts up by one every `every` ms while `running`, starting `firstAfter` ms after it starts. */
function useTicker(running: boolean, every: number, firstAfter: number): number {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!running) return;
    let timer = window.setTimeout(function advance() {
      setTick((t) => t + 1);
      timer = window.setTimeout(advance, every);
    }, firstAfter);
    return () => window.clearTimeout(timer);
  }, [running, every, firstAfter]);
  return tick;
}

/** A stable per-card delay in [0, range) so neighbouring cards don't all change at once. */
function stagger(key: string, range: number): number {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return h % range;
}
