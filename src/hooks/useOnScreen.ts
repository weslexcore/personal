"use client";

import { useEffect, useState, type RefObject } from "react";

/** Whether the element is at least partly inside the viewport (and not scrolled out of a container). */
export function useOnScreen(ref: RefObject<Element | null>): boolean {
  const [onScreen, setOnScreen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
  return onScreen;
}
