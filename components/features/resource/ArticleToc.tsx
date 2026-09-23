"use client";

import { useEffect, useState } from "react";

import type { OutlineEntry } from "@/lib/article-outline";
import { cn } from "@/lib/utils";

/**
 * "On this page", collapsed to a rail of ticks that opens on hover (VIB-198).
 *
 * Sticky inside the article's right column rather than fixed to the
 * viewport: the visitor chrome already owns both screen edges at xl
 * (ThemeRail left, SocialRail right), and a second fixed rail would land on
 * top of one of them.
 *
 * The outline arrives from the server, built from the same heading blocks
 * that render the headings themselves, so the rail is complete on first
 * paint and its links match the anchors exactly. Only the active-section
 * highlight needs the client.
 */
export function ArticleToc({ entries }: { entries: OutlineEntry[] }) {
  const [activeId, setActiveId] = useState<string | null>(entries[0]?.id ?? null);

  useEffect(() => {
    const headings = entries
      .map((entry) => document.getElementById(entry.id))
      .filter((el): el is HTMLElement => el !== null);
    if (!headings.length) return;

    /*
     * Track which headings are on screen and light the first of them, rather
     * than lighting whichever heading fired the last event. With plain
     * "isIntersecting wins", scrolling up past a heading hands the highlight
     * to the section *below* the one now filling the screen.
     *
     * The bottom margin keeps a heading from claiming the highlight while it
     * is still down in the last third of the viewport.
     */
    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (records) => {
        for (const record of records) {
          if (record.isIntersecting) visible.add(record.target.id);
          else visible.delete(record.target.id);
        }
        const first = headings.find((heading) => visible.has(heading.id));
        if (first) setActiveId(first.id);
      },
      { rootMargin: "-88px 0px -55% 0px" },
    );

    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [entries]);

  return (
    <nav
      aria-label="On this page"
      /*
       * `group` drives the whole collapse: the ticks fade and the panel fades
       * in on hover or on focus reaching anything inside, so the rail is
       * usable by keyboard and not only by mouse.
       */
      className="group sticky top-24 hidden justify-end xl:flex"
    >
      <ul aria-hidden className="flex flex-col items-end gap-2.5 p-2 transition-opacity group-hover:opacity-0 group-focus-within:opacity-0">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className={cn(
              "h-0.5 rounded-full transition-all",
              entry.id === activeId ? "bg-primary w-8" : "bg-border w-4",
              entry.level === 3 && "w-3",
            )}
          />
        ))}
      </ul>

      <div className="border-border bg-card pointer-events-none absolute top-0 right-0 w-64 translate-x-2 rounded-2xl border p-4 opacity-0 shadow-xl transition-all group-hover:pointer-events-auto group-hover:translate-x-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-x-0 group-focus-within:opacity-100">
        <h2 className="text-muted-foreground mb-2 text-[0.6875rem] font-bold tracking-widest uppercase">
          On this page
        </h2>
        <ul className="max-h-[60vh] overflow-auto">
          {entries.map((entry) => (
            <li key={entry.id}>
              <a
                href={`#${entry.id}`}
                aria-current={entry.id === activeId ? "location" : undefined}
                className={cn(
                  "hover:bg-secondary hover:text-foreground hover:border-l-foreground block border-l-2 py-1.5 pr-2 text-sm leading-snug transition-colors",
                  entry.level === 3 ? "pl-6" : "pl-3",
                  entry.id === activeId
                    ? "border-l-primary text-primary font-semibold"
                    : "border-l-border text-muted-foreground",
                )}
              >
                {entry.title}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
