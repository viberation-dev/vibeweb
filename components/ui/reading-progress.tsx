"use client";

import { useEffect, useRef } from "react";

/**
 * A hairline at the top of the viewport showing how far down the page the
 * reader is.
 *
 * Writes the width straight onto the element in a rAF rather than through
 * React state: this updates on every scroll frame, and a setState per frame
 * re-renders the subtree for a number that only ever lands in one style
 * property.
 *
 * Product-agnostic, so it lives in `ui/` — any long page can mount it.
 */
export function ReadingProgress() {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;

    const paint = () => {
      frame = 0;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      const ratio = scrollable > 0 ? doc.scrollTop / scrollable : 0;
      if (bar.current) {
        bar.current.style.transform = `scaleX(${Math.min(1, Math.max(0, ratio))})`;
      }
    };

    const onScroll = () => {
      // Coalesce: several scroll events can fire between two paints.
      if (!frame) frame = requestAnimationFrame(paint);
    };

    paint();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px]"
    >
      <div
        ref={bar}
        className="bg-primary h-full w-full origin-left scale-x-0"
      />
    </div>
  );
}
