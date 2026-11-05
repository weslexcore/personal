"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { groupPhotos } from "@/lib/dates";
import type { ModeProps } from "../PhotoGallery";
import { ModeMenu } from "../ModeMenu";
import { ChevronLeft, Ellipsis } from "../Icons";
import { Grid } from "./Grid";
import { CollectionCards } from "./CollectionCards";
import { VIEWS, type LibraryView } from "./LibraryMode";

export function IOSLibrary({ photos, onOpen, mode, onModeChange }: ModeProps) {
  const [view, setView] = useState<LibraryView>("all");
  const scroller = useRef<HTMLDivElement>(null);

  const years = useMemo(() => groupPhotos(photos, "year"), [photos]);
  const months = useMemo(() => groupPhotos(photos, "month"), [photos]);
  const days = useMemo(() => groupPhotos(photos, "day"), [photos]);

  // Photos.app keeps the newest at the bottom and starts you there.
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [view]);

  return (
    <div className="fixed inset-0 flex flex-col bg-white font-system text-black dark:bg-black dark:text-white">
      {/* Top chrome */}
      <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between gap-2 bg-white/75 px-4 pb-2 pt-[calc(env(safe-area-inset-top)+8px)] backdrop-blur-xl dark:bg-black/70">
        <Link
          href="/"
          className="-ml-2 flex h-8 items-center pr-2 text-[17px] text-ios-blue dark:text-ios-blue-dark"
        >
          <ChevronLeft width={24} height={24} strokeWidth={2.4} />
          Home
        </Link>
        <span className="flex-1" />
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
              aria-label="More options"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-200/80 dark:bg-neutral-800"
            >
              <Ellipsis />
            </button>
          )}
        />
      </header>

      {/* Content */}
      <div
        ref={scroller}
        className="no-scrollbar flex-1 overflow-y-auto overscroll-contain pb-[calc(96px+env(safe-area-inset-bottom))] pt-[calc(env(safe-area-inset-top)+52px)]"
      >
        {view === "all" && (
          <Grid photos={photos} columns={3} gap={1} onOpen={onOpen} sizes="34vw" />
        )}
        {view === "days" && (
          <div className="px-4 pt-3">
            <CollectionCards
              groups={days}
              columns={1}
              aspect="4 / 3"
              sizes="100vw"
              rotate
              onSelect={(_, photo) => onOpen(photo)}
            />
          </div>
        )}
        {view === "months" && (
          <div className="px-4 pt-3">
            <CollectionCards
              groups={months}
              columns={1}
              aspect="4 / 4.6"
              sizes="100vw"
              rotate
              onSelect={() => setView("days")}
            />
          </div>
        )}
        {view === "years" && (
          <div className="px-4 pt-3">
            <CollectionCards
              groups={years}
              columns={1}
              aspect="4 / 4.6"
              sizes="100vw"
              big
              onSelect={() => setView("months")}
            />
          </div>
        )}
      </div>

      {/* Segmented control */}
      <div className="pointer-events-none absolute inset-x-0 bottom-[calc(20px+env(safe-area-inset-bottom))] z-20 flex justify-center">
        <div
          role="tablist"
          aria-label="Library view"
          className="pointer-events-auto flex rounded-full bg-neutral-200/80 p-[3px] shadow-lg shadow-black/10 backdrop-blur-xl dark:bg-neutral-800/80"
        >
          {VIEWS.map((v) => (
            <button
              key={v.id}
              role="tab"
              aria-selected={view === v.id}
              onClick={() => setView(v.id)}
              className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition ${
                view === v.id
                  ? "bg-white shadow-sm dark:bg-neutral-600"
                  : "text-neutral-600 dark:text-neutral-300"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
