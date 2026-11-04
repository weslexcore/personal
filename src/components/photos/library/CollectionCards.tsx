"use client";

import type { Group } from "@/lib/dates";
import { Pic } from "../Pic";

type Props = {
  groups: Group[];
  columns: number;
  onSelect: (group: Group) => void;
  aspect?: string;
  sizes: string;
  big?: boolean;
};

export function CollectionCards({ groups, columns, onSelect, aspect = "4 / 5", sizes, big }: Props) {
  return (
    <div
      className="grid gap-3 md:gap-4"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {groups.map((g) => {
        const cover = g.photos[Math.floor(g.photos.length / 2)];
        return (
          <button
            key={g.key}
            onClick={() => onSelect(g)}
            className="relative overflow-hidden rounded-xl bg-neutral-200 text-left text-white outline-none focus-visible:ring-2 focus-visible:ring-ios-blue dark:bg-neutral-800"
            style={{ aspectRatio: aspect }}
          >
            <Pic
              photo={cover}
              sizes={sizes}
              className="transition-transform duration-500 hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-black/20" />
            <div className="absolute left-4 top-4 drop-shadow-md">
              <div className={`font-bold leading-none ${big ? "text-3xl" : "text-xl"}`}>{g.label}</div>
              {g.sublabel && <div className="mt-1 text-sm font-medium opacity-90">{g.sublabel}</div>}
            </div>
            <div className="absolute bottom-3 right-4 text-xs font-medium opacity-80">
              {g.photos.length} {g.photos.length === 1 ? "photo" : "photos"}
            </div>
          </button>
        );
      })}
    </div>
  );
}
