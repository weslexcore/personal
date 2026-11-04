"use client";

import { useCallback, useMemo, useState } from "react";
import type { Photo } from "@/lib/photos";
import {
  readMode,
  readPhotoParam,
  readSortParam,
  setMode,
  setPhotoParam,
  setSortParam,
  setWindowParam,
  useMode,
  type ModeId,
  type Sort,
} from "./modes";
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
  /** Display order. The Library ignores it and always runs oldest to newest, like the Photos app. */
  sort: Sort;
  onSortChange: (sort: Sort) => void;
};

/** The order a mode shows photos in. `photos` is chronological. */
function orderFor(photos: Photo[], mode: ModeId | null, sort: Sort): Photo[] {
  if (mode === "library" || sort === "oldest") return photos;
  return [...photos].reverse();
}

export function PhotoGallery({ photos }: { photos: Photo[] }) {
  const mode = useMode();
  const [sort, setSort] = useState<Sort>(readSortParam);
  const ordered = useMemo(() => orderFor(photos, mode, sort), [photos, mode, sort]);
  const indexById = useMemo(
    () => new Map(ordered.map((p, i) => [p.id, i])),
    [ordered],
  );

  // A shared link may name a photo. The museum walks to it; other modes open the viewer.
  const [initialPhotoId] = useState(readPhotoParam);
  // The viewer tracks a photo id, so its index follows whatever order the current mode uses.
  const [viewerId, setViewerId] = useState<string | null>(() => {
    if (!initialPhotoId || typeof window === "undefined") return null;
    if (readMode() === "museum") return null;
    return photos.some((p) => p.id === initialPhotoId) ? initialPhotoId : null;
  });
  const viewerIndex = viewerId === null ? null : (indexById.get(viewerId) ?? null);

  const onOpen = useCallback((photo: Photo) => {
    setViewerId(photo.id);
    setPhotoParam(photo.id);
  }, []);
  const onClose = useCallback(() => {
    setViewerId(null);
    setPhotoParam(null);
  }, []);
  const onViewerIndexChange = useCallback(
    (i: number) => setPhotoParam(ordered[i]?.id ?? null),
    [ordered],
  );
  const onSortChange = useCallback((s: Sort) => {
    setSort(s);
    setSortParam(s);
  }, []);
  const onModeChange = useCallback(
    (m: ModeId) => {
      setMode(m);
      if (viewerId === null) setPhotoParam(null);
      // The floating window only exists in the desktop Library.
      if (m !== "library") setWindowParam(false);
    },
    [viewerId],
  );

  // Before hydration we don't know the mode or viewport; paint a blank surface.
  if (!mode) return <div className="fixed inset-0 bg-white dark:bg-black" />;

  const props: ModeProps = {
    photos: ordered,
    onOpen,
    mode,
    onModeChange,
    initialPhotoId,
    sort,
    onSortChange,
  };
  return (
    <>
      <div key={mode} className="fade-in">
        {mode === "library" && <LibraryMode {...props} />}
        {mode === "museum" && <MuseumMode {...props} />}
        {mode === "contact" && <ContactSheetMode {...props} />}
      </div>
      {viewerIndex !== null && (
        <Viewer
          photos={ordered}
          initialIndex={viewerIndex}
          onClose={onClose}
          onIndexChange={onViewerIndexChange}
        />
      )}
    </>
  );
}
