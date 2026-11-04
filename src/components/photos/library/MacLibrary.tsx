"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { groupPhotos } from "@/lib/dates";
import { site } from "@/lib/site";
import type { ModeProps } from "../PhotoGallery";
import { ModeMenu } from "../ModeMenu";
import { ChevronDown, Film, Frame, Grid as GridIcon, Photo } from "../Icons";
import { HomeContent } from "@/components/HomeContent";
import { Grid } from "./Grid";
import { CollectionCards } from "./CollectionCards";
import { VIEWS, type LibraryView } from "./LibraryMode";

const MODE_ICON = { library: GridIcon, museum: Frame, contact: Film };

const light =
  "flex h-3 w-3 items-center justify-center rounded-full ring-1 ring-black/10 outline-none focus-visible:ring-2 focus-visible:ring-ios-blue";
const glyph = "h-2 w-2 opacity-0 transition-opacity group-hover:opacity-100";

export function MacLibrary({ photos, onOpen, mode, onModeChange }: ModeProps) {
  const [view, setView] = useState<LibraryView>("all");
  const [columns, setColumns] = useState(7);
  // Green light toggles between full screen and a floating window over the home page.
  const [windowed, setWindowed] = useState(false);
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
    <div className="fixed inset-0 font-system text-[13px] text-neutral-900 dark:text-neutral-100">
      {/* The home page, visible behind the window when it isn't full screen */}
      <div
        aria-hidden={!windowed}
        className={`absolute inset-0 bg-white font-sans transition-opacity duration-300 dark:bg-black ${
          windowed ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="flex h-full w-[30vw] min-w-[340px] flex-col">
          <HomeContent />
        </div>
      </div>

      {/* The Photos window */}
      <section
        className={`absolute flex min-w-0 flex-col overflow-hidden bg-[#f6f6f6] transition-[inset,border-radius] duration-300 ease-[cubic-bezier(.2,.8,.2,1)] dark:bg-[#1e1e1e] ${
          windowed
            ? "bottom-[6vh] left-[max(30vw,340px)] right-[4vw] top-[7vh] rounded-xl shadow-[0_30px_80px_-20px_rgba(0,0,0,.6)] ring-1 ring-black/20 dark:ring-white/15"
            : "inset-0"
        }`}
      >
        <header className="relative z-30 flex h-[52px] shrink-0 items-center gap-3 border-b border-black/10 bg-white/80 px-4 backdrop-blur-xl dark:border-white/10 dark:bg-[#2b2b2d]/90">
          <div className="group flex items-center gap-2">
            <Link
              href="/"
              aria-label="Close and return to the home page"
              title="Close"
              className={`${light} bg-[#ff5f57] text-[#4d0000]`}
            >
              <svg viewBox="0 0 12 12" className={glyph} aria-hidden>
                <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </Link>
            <Link
              href="/"
              aria-label="Minimize and return to the home page"
              title="Minimize"
              className={`${light} bg-[#febc2e] text-[#5a3b00]`}
            >
              <svg viewBox="0 0 12 12" className={glyph} aria-hidden>
                <path d="M2.5 6h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </Link>
            <button
              onClick={() => setWindowed((w) => !w)}
              aria-label={windowed ? "Enter full screen" : "Exit full screen"}
              aria-pressed={windowed}
              title={windowed ? "Enter Full Screen" : "Exit Full Screen"}
              className={`${light} bg-[#28c840] text-[#0a4a14]`}
            >
              <svg viewBox="0 0 12 12" className={glyph} aria-hidden>
                {windowed ? (
                  <path d="M2.5 6.5v3h3zM9.5 5.5v-3h-3z" fill="currentColor" />
                ) : (
                  <path d="M6.5 2.5h3v3zM5.5 9.5h-3v-3z" fill="currentColor" />
                )}
              </svg>
            </button>
          </div>
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
