"use client";

import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { ModeProps } from "../PhotoGallery";
import { IOSLibrary } from "./IOSLibrary";
import { MacLibrary } from "./MacLibrary";

export type LibraryView = "years" | "months" | "days" | "all";
export const VIEWS: { id: LibraryView; label: string }[] = [
  { id: "years", label: "Years" },
  { id: "months", label: "Months" },
  { id: "days", label: "Days" },
  { id: "all", label: "All Photos" },
];

export function LibraryMode(props: ModeProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)", true);
  return isDesktop ? <MacLibrary {...props} /> : <IOSLibrary {...props} />;
}
