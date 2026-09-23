"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * Three-step text size for long-form reading.
 *
 * The choice sets `data-reading` on <html>, which globals.css turns into the
 * `--reading-size` / `--reading-leading` pair. Nothing downstream re-renders:
 * a preference that only changes two CSS variables should not push a prop
 * through every block component.
 *
 * Stored in localStorage rather than a cookie, so it stays a per-device
 * reading comfort setting and never reaches the server or a cache key. The
 * cost is a flash of the default size on first paint for someone who picked
 * L — one frame, on a preference the reader set themselves, against a cookie
 * on every request for the rest of the site. A theme is worth that trade;
 * this is not.
 */
const SIZES = [
  { key: "s", label: "Small text", type: "text-xs" },
  { key: "m", label: "Medium text", type: "text-sm" },
  { key: "l", label: "Large text", type: "text-base" },
] as const;

type SizeKey = (typeof SIZES)[number]["key"];

const STORAGE_KEY = "viberation:reading-size";

function isSize(value: string | null): value is SizeKey {
  return value === "s" || value === "m" || value === "l";
}

export function TextSize({ className }: { className?: string }) {
  const [size, setSize] = useState<SizeKey>("m");

  useEffect(() => {
    /*
     * localStorage throws outright in some privacy modes rather than
     * returning null, which would take the whole article down over a font
     * size. The default is a perfectly good reading experience.
     */
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (isSize(stored)) setSize(stored);
    } catch {
      /* no stored preference available */
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.reading = size;
  }, [size]);

  const choose = (next: SizeKey) => {
    setSize(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* the size still applies for this visit */
    }
  };

  return (
    <div
      role="group"
      aria-label="Text size"
      className={cn(
        "border-border bg-card inline-flex items-center gap-0.5 rounded-full border p-1",
        className,
      )}
    >
      {SIZES.map((option) => (
        <button
          key={option.key}
          type="button"
          aria-pressed={size === option.key}
          onClick={() => choose(option.key)}
          className={cn(
            "font-heading focus-visible:ring-ring rounded-full px-2.5 py-0.5 leading-snug focus-visible:ring-2 focus-visible:outline-none",
            option.type,
            size === option.key
              ? "bg-primary text-primary-foreground font-semibold"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <span aria-hidden>A</span>
          <span className="sr-only">{option.label}</span>
        </button>
      ))}
    </div>
  );
}
