"use client";

import type { Photo } from "@/lib/photos";
import { Pic } from "../Pic";

type Props = {
  photos: Photo[];
  columns: number;
  gap: number;
  onOpen: (photo: Photo) => void;
  sizes: string;
  rounded?: boolean;
};

export function Grid({ photos, columns, gap, onOpen, sizes, rounded }: Props) {
  return (
    <div
      className="grid"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap }}
    >
      {photos.map((p) => (
        <button
          key={p.id}
          onClick={() => onOpen(p)}
          aria-label={p.title ?? "Photo"}
          className={`relative aspect-square overflow-hidden bg-neutral-200 outline-none focus-visible:ring-2 focus-visible:ring-ios-blue dark:bg-neutral-800 ${
            rounded ? "rounded-[3px]" : ""
          }`}
        >
          <Pic photo={p} sizes={sizes} />
        </button>
      ))}
    </div>
  );
}
