import { IconChevronDown } from "@tabler/icons-react";
import Link from "next/link";

import type { Tag } from "@/lib/queries/tags";
import type { ToolCategory } from "@/lib/tool-categories";
import { DEFAULT_TOOL_SORT, TOOL_SORTS, toolSortOrder, type ToolSort } from "@/lib/tool-sorts";
import { toolsHref } from "@/lib/tools-url";
import { cn } from "@/lib/utils";

type Props = {
  category?: ToolCategory;
  tag?: string;
  sort?: ToolSort;
  q?: string;
  tags: Tag[];
};

const chip =
  "rounded-full border px-3 py-1 text-xs transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
const chipActive = "border-transparent bg-primary text-primary-foreground hover:bg-primary/80";

/**
 * Tag pills and the sort control (VIB-80, mockup screen 3).
 *
 * **No category chips here.** Categories live in the sidebar, and the
 * mockup's own caption says so — two controls for one axis is exactly the
 * confusion the split IA exists to avoid.
 *
 * Plain links, no client component: filter state lives entirely in the URL,
 * so it is shareable, back-button-correct and works without JavaScript.
 * Each control keeps the *other* axes intact, and clicking an active tag
 * clears it. Nothing carries `page`, so changing a filter resets to page 1 —
 * the only sane destination when the result set just changed under you.
 */
export function DirectoryFilters({ category, tag, sort, q, tags }: Props) {
  const activeSort = sort ?? DEFAULT_TOOL_SORT;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {tags.length ? (
        <>
          <span className="text-muted-foreground text-xs">Tags:</span>
          {tags.map((t) => {
            const active = tag === t.slug;
            return (
              <Link
                key={t.id}
                href={toolsHref({ category, tag: active ? undefined : t.slug, sort, q })}
                aria-current={active ? "page" : undefined}
                className={cn(chip, active && chipActive)}
              >
                #{t.slug}
              </Link>
            );
          })}
        </>
      ) : null}

      {/*
        Native <details> rather than a select or a menu library: it needs no
        JavaScript, no client component, and each option stays a real link
        with a shareable URL behind it.
      */}
      <details className="relative ml-auto">
        <summary className="text-muted-foreground hover:text-foreground flex cursor-pointer list-none items-center gap-1 text-sm">
          Sort: {toolSortOrder(activeSort).label}
          <IconChevronDown aria-hidden className="size-3.5" />
        </summary>
        <div className="bg-background absolute right-0 z-20 mt-2 w-40 rounded-md border p-1 shadow-md">
          <ul>
            {TOOL_SORTS.map(({ value, label }) => (
              <li key={value}>
                <Link
                  /*
                   * The default sort is expressed by *omitting* ?sort=, so the
                   * plain /tools URL stays canonical instead of gaining a param
                   * that means what no param already meant.
                   */
                  href={toolsHref({
                    category,
                    tag,
                    q,
                    sort: value === DEFAULT_TOOL_SORT ? undefined : value,
                  })}
                  aria-current={activeSort === value ? "page" : undefined}
                  className={cn(
                    "hover:bg-accent block rounded px-2 py-1 text-sm",
                    activeSort === value && "font-medium",
                  )}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </details>
    </div>
  );
}
