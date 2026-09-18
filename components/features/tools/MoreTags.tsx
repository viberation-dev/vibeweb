"use client";

import { useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * The directory's overflow tags (VIB-179): hidden behind "+N more" so the
 * chip row stays one line. The chips themselves are server-rendered links
 * passed in; this only decides whether they are shown.
 *
 * `wideOnly` are chips with room on a wider screen but not on a phone
 * (VIB-181). Always shown from `sm` up, and folded into "more" below it, so
 * the count differs by breakpoint too.
 */
export function MoreTags({
  count,
  wideOnlyCount,
  wideOnly,
  children,
}: {
  count: number;
  wideOnlyCount: number;
  wideOnly: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <span className={cn("contents", !open && "max-sm:hidden")}>
        {wideOnly}
      </span>
      {open ? children : null}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className={cn(
          "text-primary rounded-full px-2 py-1 text-xs font-semibold hover:underline",
          // Nothing extra to show on a wide screen: the button is phone-only.
          count === 0 && "sm:hidden",
        )}
      >
        {open ? (
          "Fewer tags"
        ) : (
          <>
            <span className="sm:hidden">+{count + wideOnlyCount} more</span>
            <span className="max-sm:hidden">+{count} more</span>
          </>
        )}
      </button>
    </>
  );
}
