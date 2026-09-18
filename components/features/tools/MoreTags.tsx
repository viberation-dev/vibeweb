"use client";

import { useState, type ReactNode } from "react";

/**
 * The directory's overflow tags (VIB-179): hidden behind "+N more" so the
 * chip row stays one line. The chips themselves are server-rendered links
 * passed in as children; this only decides whether they are shown.
 */
export function MoreTags({
  count,
  children,
}: {
  count: number;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open ? children : null}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="text-primary rounded-full px-2 py-1 text-xs font-semibold hover:underline"
      >
        {open ? "Fewer tags" : `+${count} more`}
      </button>
    </>
  );
}
