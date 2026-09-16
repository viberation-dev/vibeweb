"use client";

import { useEffect, useId, useState } from "react";

import { cn } from "@/lib/utils";
import { osFromPlatform } from "@/lib/walkthroughs";

type Props = {
  label: string;
  detect?: "os";
  /** Panels arrive already rendered on the server; this only picks one. */
  tabs: { key: string; title: string; content: React.ReactNode }[];
};

/**
 * Alternatives the reader picks one of (VIB-162), such as their operating
 * system or a host. Every panel is in the HTML and inactive ones are
 * `hidden`, so switching is instant and nothing refetches.
 */
export function TabsBlock({ label, detect, tabs }: Props) {
  const [active, setActive] = useState(0);
  const id = useId();

  useEffect(() => {
    if (detect !== "os") return;
    const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
    const os = osFromPlatform(nav.userAgentData?.platform || nav.platform || nav.userAgent);
    const index = tabs.findIndex((tab) => tab.key === os);
    // After hydration: the server cannot know the visitor's OS.
    if (index > 0) setActive(index);
  }, [detect, tabs]);

  return (
    <div className="rounded-lg border">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b px-4 py-2">
        <p className="text-sm font-medium">{label}</p>
        <div role="tablist" aria-label={label} className="flex flex-wrap gap-2">
          {tabs.map((tab, i) => (
            <button
              key={tab.key}
              id={`${id}-tab-${tab.key}`}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-controls={`${id}-panel-${tab.key}`}
              onClick={() => setActive(i)}
              className={cn(
                "cursor-pointer rounded-full border px-3 py-1 text-sm transition-colors hover:bg-muted",
                i === active && "border-transparent bg-primary text-primary-foreground hover:bg-primary",
              )}
            >
              {tab.title}
            </button>
          ))}
        </div>
      </div>
      {tabs.map((tab, i) => (
        <div
          key={tab.key}
          id={`${id}-panel-${tab.key}`}
          role="tabpanel"
          aria-labelledby={`${id}-tab-${tab.key}`}
          hidden={i !== active}
          className="flex flex-col gap-4 p-4"
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
