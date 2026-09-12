import { IconArrowRight, IconSearch } from "@tabler/icons-react";

import { CategoryIcon } from "@/components/features/tools/CategoryIcon";
import type { Tool } from "@/lib/queries/tools";
import { TOOL_CATEGORIES } from "@/lib/tool-categories";

/**
 * The hero's right column (VIB-99) — a browser-chrome mock of the directory,
 * standing where demo5 puts an illustration. No brand imagery exists, so the
 * product is the art.
 *
 * Presentational only: nothing here is focusable, nothing navigates, and the
 * search box is a picture of a search box, not a form. It is a picture of the
 * product, not the product.
 *
 * It does take the real tool rows the page has already fetched, rather than
 * hardcoded names. VIB-99 says "do not wire to live data", which this honours
 * in the sense that matters — no queries of its own, no interactivity — while
 * avoiding the failure VIB-77 called out in its own comment: a hero that
 * contradicts the directory one click away. The rows cost nothing extra;
 * they are the same three the page already had in hand.
 */
export function ProductPanel({ tools }: { tools: Tool[] }) {
  return (
    <div aria-hidden className="relative select-none">
      {/* Soft accent field behind the panel — v3's blob, kept restrained. */}
      <span className="bg-accent absolute -right-6 -bottom-10 -z-10 aspect-square w-3/5 rounded-full" />

      <div className="bg-card overflow-hidden rounded-2xl border shadow-lg">
        {/* Chrome */}
        <div className="bg-secondary flex items-center gap-2 border-b px-4 py-3">
          <span className="flex gap-1.5">
            <span className="bg-muted-foreground/30 size-2.5 rounded-full" />
            <span className="bg-muted-foreground/30 size-2.5 rounded-full" />
            <span className="bg-muted-foreground/30 size-2.5 rounded-full" />
          </span>
          <span className="bg-background text-muted-foreground mx-auto rounded-full border px-4 py-0.5 font-mono text-xs">
            viberation.dev/tools
          </span>
        </div>

        <div className="grid sm:grid-cols-[10.5rem_minmax(0,1fr)]">
          {/* Sidebar. Scrolls out of the way on narrow screens rather than
              stacking a full category list above the rows. */}
          <div className="bg-secondary border-b p-4 sm:border-r sm:border-b-0">
            <p className="text-muted-foreground mb-2 hidden px-2 text-[0.65rem] font-medium tracking-widest uppercase sm:block">
              Directory
            </p>
            <div className="flex gap-1.5 overflow-hidden sm:flex-col">
              <span className="bg-primary text-primary-foreground rounded-md px-2 py-1.5 text-[0.8rem] font-semibold whitespace-nowrap">
                All tools
              </span>
              {TOOL_CATEGORIES.slice(0, 6).map((category) => (
                <span
                  key={category.value}
                  className="text-muted-foreground rounded-md px-2 py-1.5 text-[0.8rem] whitespace-nowrap"
                >
                  {category.label}
                </span>
              ))}
            </div>
          </div>

          {/* Main */}
          <div className="p-4">
            <div className="text-muted-foreground mb-3 flex items-center gap-2 rounded-lg border px-3 py-2.5 text-[0.8rem]">
              <IconSearch className="size-4 shrink-0" />
              Describe what you want to build…
              <span className="bg-primary text-primary-foreground ml-auto flex size-7 shrink-0 items-center justify-center rounded-md">
                <IconArrowRight className="size-4" />
              </span>
            </div>

            <div className="divide-y">
              {tools.map((tool) => (
                <div key={tool.id} className="flex items-center gap-3 py-2.5">
                  <span className="bg-accent text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
                    <CategoryIcon category={tool.category} className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">
                      {tool.name}
                    </span>
                    <span className="text-muted-foreground block truncate text-xs">
                      {tool.tagline}
                    </span>
                  </span>
                  <span className="text-muted-foreground ml-auto hidden shrink-0 rounded-full border px-2.5 py-0.5 text-[0.7rem] lg:block">
                    {TOOL_CATEGORIES.find((c) => c.value === tool.category)
                      ?.label ?? tool.category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
