"use client";

import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandPinterest,
  IconBrandThreads,
  IconBrandX,
  IconCheck,
  IconLink,
  IconShare2,
} from "@tabler/icons-react";
import { useEffect, useRef, useState, type ComponentType } from "react";

import { SHARE_NETWORKS } from "@/lib/share";

const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  x: IconBrandX,
  facebook: IconBrandFacebook,
  linkedin: IconBrandLinkedin,
  threads: IconBrandThreads,
  pinterest: IconBrandPinterest,
};

const itemClass =
  "hover:bg-secondary flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[0.9375rem] text-left transition-colors";

/**
 * The dock's share control: one button that opens the same networks the
 * chips at the end of the article offer (VIB-199).
 *
 * A menu rather than seven chips, because the dock floats over the text and
 * a row of seven would cover the line you were reading.
 *
 * Click to open, not hover: the dock sits over content on a phone, where
 * there is no hover, and a menu that only opens on hover is a menu half the
 * readers never see.
 */
export function ShareMenu({ url, title }: { url: string; title: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!wrapper.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* Clipboard access can be refused outright; the URL is in the bar. */
    }
  };

  return (
    <div ref={wrapper} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
        className="text-muted-foreground hover:bg-secondary hover:text-foreground inline-flex items-center gap-2 rounded-full px-4 py-2 text-[0.9375rem] transition-colors"
      >
        <IconShare2 aria-hidden className="size-[1.1875rem]" />
        <span className="max-sm:sr-only">Share</span>
      </button>

      {open ? (
        <div
          role="menu"
          className="border-border bg-card absolute right-0 bottom-[calc(100%+0.75rem)] min-w-48 rounded-2xl border p-2 shadow-xl"
        >
          {SHARE_NETWORKS.map((network) => {
            const Icon = ICONS[network.key];
            return (
              <a
                key={network.key}
                role="menuitem"
                href={network.href(url, title)}
                target="_blank"
                rel="noopener noreferrer"
                className={itemClass}
              >
                <Icon className="size-[1.1875rem]" />
                {network.label}
              </a>
            );
          })}

          {/* Instagram has no web share intent — see lib/share.ts. */}
          <button type="button" role="menuitem" onClick={copy} className={itemClass}>
            <IconBrandInstagram className="size-[1.1875rem]" />
            Instagram
          </button>

          <button type="button" role="menuitem" onClick={copy} className={itemClass}>
            {copied ? (
              <IconCheck className="size-[1.1875rem]" />
            ) : (
              <IconLink className="size-[1.1875rem]" />
            )}
            {copied ? "Copied" : "Copy link"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
