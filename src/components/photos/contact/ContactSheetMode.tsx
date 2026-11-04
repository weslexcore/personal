"use client";

import { useMemo } from "react";
import { fmt, groupPhotos } from "@/lib/dates";
import { site } from "@/lib/site";
import type { ModeProps } from "../PhotoGallery";
import { ModeMenu } from "../ModeMenu";
import { Pic } from "../Pic";
import { ArrowsUpDown, ChevronDown, Film } from "../Icons";

export function ContactSheetMode({
  photos,
  onOpen,
  mode,
  onModeChange,
  sort,
  onSortChange,
}: ModeProps) {
  const rolls = useMemo(() => groupPhotos(photos, "month"), [photos]);
  const indexById = useMemo(
    () => new Map(photos.map((p, i) => [p.id, i])),
    [photos],
  );

  return (
    <div className="fixed inset-0 overflow-y-auto bg-[#151515] font-mono text-neutral-300">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-[#151515]/90 px-4 py-3 backdrop-blur md:px-8">
        <div className="text-[11px] uppercase tracking-[0.25em]">
          <span className="text-neutral-100">Contact sheet</span>
          <span className="text-neutral-500">
            {" "}
            · {site.photographer} · {photos.length} frames
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              onSortChange(sort === "newest" ? "oldest" : "newest")
            }
            aria-label={
              sort === "newest"
                ? "Sorted newest first. Switch to oldest first"
                : "Sorted oldest first. Switch to newest first"
            }
            title="Change sort order"
            className="flex h-8 items-center gap-2 rounded-md border border-white/15 px-3 text-[12px] uppercase tracking-wider hover:bg-white/5"
          >
            <ArrowsUpDown width={14} height={14} />
            <span className="hidden sm:inline">
              {sort === "newest" ? "Newest" : "Oldest"}
            </span>
          </button>
          <ModeMenu
            mode={mode}
            onChange={onModeChange}
            align="right"
            theme="dark"
            trigger={({ toggle, open, id }) => (
              <button
                onClick={toggle}
                aria-haspopup="menu"
                aria-expanded={open}
                aria-controls={id}
                className="flex h-8 items-center gap-2 rounded-md border border-white/15 px-3 text-[12px] uppercase tracking-wider hover:bg-white/5"
              >
                <Film width={14} height={14} />
                Contact
                <ChevronDown width={12} height={12} className="opacity-60" />
              </button>
            )}
          />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-3 pb-24 pt-6 md:px-8">
        {rolls.map((roll, r) => (
          <section key={roll.key} className="mb-10">
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-[11px] uppercase tracking-[0.2em] text-neutral-500">
              <span>
                Roll {String(r + 1).padStart(2, "0")} · {roll.label}
                {roll.sublabel ? ` · ${roll.sublabel}` : ""}
              </span>
              <span className="grease whitespace-nowrap text-[#e8a33d]">
                {roll.photos.length} exp
              </span>
            </div>
            <div className="grid grid-cols-3 gap-y-3 sm:grid-cols-4 md:grid-cols-6">
              {roll.photos.map((p) => {
                const n = (indexById.get(p.id) ?? 0) + 1;
                return (
                  <button
                    key={p.id}
                    onClick={() => onOpen(p)}
                    aria-label={p.title ?? `Frame ${n}`}
                    className="film-cell group relative px-1 pb-[18px] pt-[18px] outline-none"
                  >
                    <div className="relative aspect-[3/2] overflow-hidden bg-neutral-900 ring-1 ring-white/5 transition group-hover:ring-[#e8a33d]/70 group-focus-visible:ring-[#e8a33d]">
                      <Pic
                        photo={p}
                        sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 180px"
                        className="opacity-90 transition group-hover:opacity-100"
                      />
                    </div>
                    <span className="grease absolute bottom-[3px] left-2 text-[9px] font-bold tracking-wider text-[#e8a33d]">
                      ▸{n}A
                    </span>
                    <span className="absolute bottom-[3px] right-2 text-[8px] uppercase tracking-widest text-[#e8a33d]/70">
                      {fmt("monthShort", p.takenAt)}
                    </span>
                    <span className="absolute left-2 top-[4px] text-[8px] uppercase tracking-[0.3em] text-[#e8a33d]/60">
                      {n % 2 ? "SAFETY FILM" : "400TX"}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
