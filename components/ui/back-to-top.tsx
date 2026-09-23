"use client";

import { IconArrowUp } from "@tabler/icons-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * A floating "back to top" control that appears once the page has scrolled.
 *
 * Knows nothing about what it is scrolling — it is in `ui/` because any long
 * page wants it, and the site layout mounts one for every route.
 *
 * Hidden until `after` pixels because a button that is always there is one
 * more thing overlapping the content of pages that never needed it, and at
 * the top of the page it does nothing.
 */
export function BackToTop({
  after = 700,
  className,
}: {
  after?: number;
  className?: string;
}) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > after);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [after]);

  return (
    <button
      type="button"
      // Always rendered, never unmounted: fading it out lets it leave
      // gracefully, and toggling the element would fight the transition.
      aria-hidden={!shown}
      tabIndex={shown ? 0 : -1}
      onClick={() =>
        window.scrollTo({
          top: 0,
          /*
           * Honouring the OS setting here, not just in CSS: scrollTo's own
           * behaviour is a JS argument, so a media query cannot reach it.
           */
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "auto"
            : "smooth",
        })
      }
      className={cn(
        "border-border bg-card text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary focus-visible:ring-ring fixed right-5 bottom-5 z-50 flex size-11 items-center justify-center rounded-full border shadow-lg transition-all focus-visible:ring-3",
        shown ? "opacity-100" : "pointer-events-none translate-y-2 opacity-0",
        className,
      )}
    >
      <IconArrowUp aria-hidden className="size-5" />
      <span className="sr-only">Back to top</span>
    </button>
  );
}
