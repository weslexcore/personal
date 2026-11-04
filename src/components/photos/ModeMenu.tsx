"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { MODES, type ModeId } from "./modes";
import { Check, Film, Frame, Grid, House } from "./Icons";

const ICONS: Record<ModeId, typeof Grid> = { library: Grid, museum: Frame, contact: Film };

type Props = {
  mode: ModeId;
  onChange: (mode: ModeId) => void;
  /** Which corner of the trigger the menu grows from. */
  align?: "left" | "right";
  direction?: "down" | "up";
  /** Force a theme regardless of system setting (museum wall is always light). */
  theme?: "auto" | "light" | "dark";
  trigger: (api: { open: boolean; toggle: () => void; id: string }) => ReactNode;
  className?: string;
};

export function ModeMenu({
  mode,
  onChange,
  align = "right",
  direction = "down",
  theme = "auto",
  trigger,
  className = "",
}: Props) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const themed =
    theme === "light"
      ? "bg-white/90 text-neutral-900 ring-black/10"
      : theme === "dark"
        ? "bg-neutral-800/90 text-neutral-50 ring-white/10"
        : "bg-white/90 text-neutral-900 ring-black/10 dark:bg-neutral-800/90 dark:text-neutral-50 dark:ring-white/10";
  const hover =
    theme === "light"
      ? "hover:bg-black/5"
      : theme === "dark"
        ? "hover:bg-white/10"
        : "hover:bg-black/5 dark:hover:bg-white/10";
  const divider =
    theme === "light"
      ? "divide-black/10"
      : theme === "dark"
        ? "divide-white/10"
        : "divide-black/10 dark:divide-white/10";
  const muted =
    theme === "light"
      ? "text-neutral-500"
      : theme === "dark"
        ? "text-neutral-400"
        : "text-neutral-500 dark:text-neutral-400";

  return (
    <div ref={root} className={`relative ${className}`}>
      {trigger({ open, toggle: () => setOpen((o) => !o), id })}
      {open && (
        <div
          id={id}
          role="menu"
          aria-label="Gallery mode"
          style={{ ["--pop-origin" as string]: `${direction === "up" ? "bottom" : "top"} ${align}` }}
          className={`pop-in absolute z-50 w-60 overflow-hidden rounded-2xl shadow-2xl ring-1 backdrop-blur-xl divide-y ${themed} ${divider} ${
            align === "right" ? "right-0" : "left-0"
          } ${direction === "up" ? "bottom-full mb-2" : "top-full mt-2"}`}
        >
          {MODES.map((m) => {
            const Icon = ICONS[m.id];
            const active = m.id === mode;
            return (
              <button
                key={m.id}
                role="menuitemradio"
                aria-checked={active}
                onClick={() => {
                  onChange(m.id);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-[15px] ${hover}`}
              >
                <span className="w-5 shrink-0">
                  {active && <Check width={18} height={18} />}
                </span>
                <span className="flex-1">
                  <span className="block font-medium leading-tight">{m.label}</span>
                  <span className={`block text-xs ${muted}`}>{m.description}</span>
                </span>
                <Icon className="shrink-0 opacity-70" />
              </button>
            );
          })}
          <Link
            href="/"
            role="menuitem"
            className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-[15px] ${hover}`}
          >
            <span className="w-5 shrink-0" />
            <span className="flex-1 font-medium">Home</span>
            <House className="shrink-0 opacity-70" />
          </Link>
        </div>
      )}
    </div>
  );
}
