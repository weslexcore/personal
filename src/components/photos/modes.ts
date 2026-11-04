"use client";

import { useSyncExternalStore } from "react";

export const MODES = [
  { id: "library", label: "Library", description: "Like the Photos app" },
  { id: "museum", label: "Museum", description: "Framed, on a wall" },
  { id: "contact", label: "Contact Sheet", description: "35mm proof strips" },
] as const;

export type ModeId = (typeof MODES)[number]["id"];

const KEY = "photo-mode";
const DEFAULT: ModeId = "library";
const listeners = new Set<() => void>();

function isMode(v: unknown): v is ModeId {
  return MODES.some((m) => m.id === v);
}

export function readMode(): ModeId {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get("mode");
    if (isMode(fromUrl)) return fromUrl;
    const stored = window.localStorage.getItem(KEY);
    if (isMode(stored)) return stored;
  } catch {}
  return DEFAULT;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("popstate", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("popstate", cb);
  };
}

export function setMode(mode: ModeId) {
  try {
    window.localStorage.setItem(KEY, mode);
    const url = new URL(window.location.href);
    if (mode === DEFAULT) url.searchParams.delete("mode");
    else url.searchParams.set("mode", mode);
    window.history.replaceState(window.history.state, "", url);
  } catch {}
  listeners.forEach((l) => l());
}

/** Current mode, or null during server render / before hydration. */
export function useMode(): ModeId | null {
  return useSyncExternalStore(subscribe, readMode, () => null);
}

const PHOTO_KEY = "photo";

/** Photo id from the URL (?photo=...), or null. Client only. */
export function readPhotoParam(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return new URLSearchParams(window.location.search).get(PHOTO_KEY);
  } catch {
    return null;
  }
}

/** Write (or clear) ?photo=... without adding history entries. */
export function setPhotoParam(id: string | null) {
  try {
    const url = new URL(window.location.href);
    if (url.searchParams.get(PHOTO_KEY) === id) return;
    if (id) url.searchParams.set(PHOTO_KEY, id);
    else url.searchParams.delete(PHOTO_KEY);
    window.history.replaceState(window.history.state, "", url);
  } catch {}
}

const WINDOW_KEY = "window";

/** Whether the desktop Library should open as a floating window (?window=1). Client only. */
export function readWindowParam(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return new URLSearchParams(window.location.search).get(WINDOW_KEY) === "1";
  } catch {
    return false;
  }
}

/** Write (or clear) ?window=1 without adding history entries. */
export function setWindowParam(windowed: boolean) {
  try {
    const url = new URL(window.location.href);
    if ((url.searchParams.get(WINDOW_KEY) === "1") === windowed) return;
    if (windowed) url.searchParams.set(WINDOW_KEY, "1");
    else url.searchParams.delete(WINDOW_KEY);
    window.history.replaceState(window.history.state, "", url);
  } catch {}
}

export type Sort = "newest" | "oldest";
const SORT_KEY = "sort";
const DEFAULT_SORT: Sort = "newest";

/** Sort order for the Museum and Contact Sheet (?sort=oldest). Newest first by default. */
export function readSortParam(): Sort {
  if (typeof window === "undefined") return DEFAULT_SORT;
  try {
    return new URLSearchParams(window.location.search).get(SORT_KEY) === "oldest" ? "oldest" : DEFAULT_SORT;
  } catch {
    return DEFAULT_SORT;
  }
}

/** Write (or clear) ?sort=... without adding history entries. */
export function setSortParam(sort: Sort) {
  try {
    const url = new URL(window.location.href);
    if (sort === DEFAULT_SORT) url.searchParams.delete(SORT_KEY);
    else url.searchParams.set(SORT_KEY, sort);
    window.history.replaceState(window.history.state, "", url);
  } catch {}
}
