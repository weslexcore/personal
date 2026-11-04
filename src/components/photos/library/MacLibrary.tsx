"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { groupPhotos } from "@/lib/dates";
import { site } from "@/lib/site";
import type { ModeProps } from "../PhotoGallery";
import { ModeMenu } from "../ModeMenu";
import { ChevronDown, Film, Frame, Grid as GridIcon, Photo } from "../Icons";
import { Grid } from "./Grid";
import { CollectionCards } from "./CollectionCards";
import { VIEWS, type LibraryView } from "./LibraryMode";

const MODE_ICON = { library: GridIcon, museum: Frame, contact: Film };

export function MacLibrary({ photos, onOpen, mode, onModeChange }: ModeProps) {
  const [view, setView] = useState<LibraryView>("all");
  const [columns, setColumns] = useState(7);
  const scroller = useRef<HTMLDivElement>(null);

  const years = useMemo(() => groupPhotos(photos, "year"), [photos]);
  const months = useMemo(() => groupPhotos(photos, "month"), [photos]);
  const days = useMemo(() => groupPhotos(photos, "day"), [photos]);

  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [view]);

  const sizes = `${Math.ceil(100 / columns)}vw`;
  const ModeIcon = MODE_ICON[mode];
  const modeLabel = mode === "library" ? "Library" : mode === "museum" ? "Museum" : "Contact Sheet";

  return (
    <div className="fixed inset-0 flex bg-[#f6f6f6] font-system text-[13px] text-neutral-900 dark:bg-[#1e1e1e] dark:text-neutral-100">

      {/* Main */}
      <section className="flex min-w-0 flex-1 flex-col">
        <header className="relative z-30 flex h-[52px] shrink-0 items-center gap-3 border-b border-black/10 bg-white/80 px-4 backdrop-blur-xl dark:border-white/10 dark:bg-[#2b2b2d]/90">
          <Link
            href="/"
            aria-label="Close and return to the home page"
            title="Close"
            className="group flex h-3 w-3 items-center justify-center rounded-full bg-[#ff5f57] text-[#4d0000] ring-1 ring-black/10 outline-none focus-visible:ring-2 focus-visible:ring-ios-blue"
          >
            <svg viewBox="0 0 12 12" className="h-2 w-2 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden>
              <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </Link>
          <h1 className="ml-2 text-[15px] font-bold">Library</h1>
          <div className="flex-1" />

          <div
            role="tablist"
            aria-label="Library view"
            className="flex rounded-lg bg-black/5 p-[2px] dark:bg-white/10"
          >
            {VIEWS.map((v) => (
              <button
                key={v.id}
                role="tab"
                aria-selected={view === v.id}
                onClick={() => setView(v.id)}
                className={`rounded-md px-3 py-[3px] font-medium transition ${
                  view === v.id
                    ? "bg-white shadow-sm dark:bg-neutral-600"
                    : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>

          <div className="flex-1" />

          <label className="flex items-center gap-2 text-neutral-500" title="Zoom">
            <GridIcon width={14} height={14} />
            <input
              type="range"
              min={3}
              max={12}
              value={15 - columns}
              onChange={(e) => setColumns(15 - Number(e.target.value))}
              aria-label="Thumbnail size"
              className="h-1 w-24 accent-neutral-500"
            />
            <Photo width={18} height={18} />
          </label>

          <ModeMenu
            mode={mode}
            onChange={onModeChange}
            align="right"
            trigger={({ toggle, open, id }) => (
              <button
                onClick={toggle}
                aria-haspopup="menu"
                aria-expanded={open}
                aria-controls={id}
                className={`flex h-7 items-center gap-1.5 rounded-md px-2.5 font-medium ring-1 ring-black/10 transition dark:ring-white/15 ${
                  open ? "bg-black/10 dark:bg-white/15" : "bg-white hover:bg-neutral-50 dark:bg-white/10 dark:hover:bg-white/15"
                }`}
              >
                <ModeIcon width={15} height={15} />
                {modeLabel}
                <ChevronDown width={12} height={12} className="opacity-60" />
              </button>
            )}
          />

        </header>

        <div ref={scroller} className="flex-1 overflow-y-auto p-1">
          {view === "all" && (
            <Grid photos={photos} columns={columns} gap={2} onOpen={onOpen} sizes={sizes} />
          )}
          {view === "days" &&
            days.map((g) => (
              <section key={g.key} className="mb-6">
                <h2 className="flex items-baseline gap-2 px-2 pb-2 pt-4">
                  <span className="text-[15px] font-bold">{g.label}</span>
                  {g.sublabel && <span className="text-neutral-500">{g.sublabel}</span>}
                </h2>
                <Grid photos={g.photos} columns={columns} gap={2} onOpen={onOpen} sizes={sizes} />
              </section>
            ))}
          {view === "months" && (
            <div className="p-4">
              <CollectionCards
                groups={months}
                columns={Math.max(2, Math.round(columns / 2))}
                aspect="4 / 3"
                sizes="40vw"
                onSelect={() => setView("days")}
              />
            </div>
          )}
          {view === "years" && (
            <div className="p-4">
              <CollectionCards
                groups={years}
                columns={Math.max(1, Math.round(columns / 3))}
                aspect="16 / 9"
                sizes="60vw"
                big
                onSelect={() => setView("months")}
              />
            </div>
          )}
        </div>

        <footer className="flex h-7 shrink-0 items-center justify-center border-t border-black/10 text-[11px] text-neutral-500 dark:border-white/10">
          {site.name} · {photos.length} items
        </footer>
      </section>
    </div>
  );
}
