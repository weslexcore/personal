"use client";

import { useCallback, useMemo, useState } from "react";
import type { Photo } from "@/lib/photos";
import { readMode, readPhotoParam, setMode, setPhotoParam, useMode, type ModeId } from "./modes";
import { Viewer } from "./Viewer";
import { LibraryMode } from "./library/LibraryMode";
import { MuseumMode } from "./museum/MuseumMode";
import { ContactSheetMode } from "./contact/ContactSheetMode";

export type ModeProps = {
  photos: Photo[];
  onOpen: (photo: Photo) => void;
  mode: ModeId;
  onModeChange: (mode: ModeId) => void;
  /** Photo id from a shared link, for modes that position themselves rather than open the viewer. */
  initialPhotoId: string | null;
};

export function PhotoGallery({ photos }: { photos: Photo[] }) {
  const mode = useMode();
  const indexById = useMemo(
    () => new Map(photos.map((p, i) => [p.id, i])),
    [photos],
  );

  // A shared link may name a photo. The museum walks to it; other modes open the viewer.
  const [initialPhotoId] = useState(readPhotoParam);
  const [viewerIndex, setViewerIndex] = useState<number | null>(() => {
    if (!initialPhotoId || typeof window === "undefined") return null;
    if (readMode() === "museum") return null;
    return indexById.get(initialPhotoId) ?? null;
  });

  const onOpen = useCallback(
    (photo: Photo) => {
      setViewerIndex(indexById.get(photo.id) ?? 0);
      setPhotoParam(photo.id);
    },
    [indexById],
  );
  const onClose = useCallback(() => {
    setViewerIndex(null);
    setPhotoParam(null);
  }, []);
  const onViewerIndexChange = useCallback(
    (i: number) => setPhotoParam(photos[i]?.id ?? null),
    [photos],
  );
  const onModeChange = useCallback(
    (m: ModeId) => {
      setMode(m);
      if (viewerIndex === null) setPhotoParam(null);
    },
    [viewerIndex],
  );

  // Before hydration we don't know the mode or viewport; paint a blank surface.
  if (!mode) return <div className="fixed inset-0 bg-white dark:bg-black" />;

  const props: ModeProps = { photos, onOpen, mode, onModeChange, initialPhotoId };
  return (
    <>
      <div key={mode} className="fade-in">
        {mode === "library" && <LibraryMode {...props} />}
        {mode === "museum" && <MuseumMode {...props} />}
        {mode === "contact" && <ContactSheetMode {...props} />}
      </div>
      {viewerIndex !== null && (
        <Viewer
          photos={photos}
          initialIndex={viewerIndex}
          onClose={onClose}
          onIndexChange={onViewerIndexChange}
        />
      )}
    </>
  );
}
