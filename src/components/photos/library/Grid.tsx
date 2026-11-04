"use client";

import Image from "next/image";
import type { Photo } from "@/lib/photos";

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
          <Image
            src={p.src}
            alt={p.title ?? ""}
            fill
            sizes={sizes}
            placeholder={p.blurDataURL ? "blur" : "empty"}
            blurDataURL={p.blurDataURL}
            className="object-cover select-none"
            draggable={false}
          />
        </button>
      ))}
    </div>
  );
}
