import Link from "next/link";

import type { Tag } from "@/lib/queries/tags";
import { TOOL_CATEGORIES, type ToolCategory } from "@/lib/tool-categories";
import { DEFAULT_TOOL_SORT, TOOL_SORTS, type ToolSort } from "@/lib/tool-sorts";
import { toolsHref } from "@/lib/tools-url";
import { cn } from "@/lib/utils";

type Props = {
  category?: ToolCategory;
  tag?: string;
  sort?: ToolSort;
  tags: Tag[];
};

const chip =
  "rounded-full border px-3 py-1 text-sm transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
const chipActive = "border-transparent bg-primary text-primary-foreground hover:bg-primary/80";

/**
 * Category nav + tag filter.
 *
 * Plain links, no client component: the filter state lives entirely in the
 * URL, so it is shareable, back-button-correct and works without JS. Each
 * chip keeps the *other* axis intact, and clicking an active chip clears it.
 *
 * No chip ever carries `page`, so changing a filter or the sort resets to
 * page 1 — the only sane destination when the result set just changed under
 * you. Sort chips do carry the active filters, and vice versa.
 */
export function DirectoryFilters({ category, tag, sort, tags }: Props) {
  const activeSort = sort ?? DEFAULT_TOOL_SORT;

  return (
    <div className="flex flex-col gap-4">
      <nav aria-label="Tool categories" className="flex flex-wrap gap-2">
        <Link
          href={toolsHref({ tag, sort })}
          aria-current={category ? undefined : "page"}
          className={cn(chip, !category && chipActive)}
        >
          All
        </Link>
        {TOOL_CATEGORIES.map(({ value, label }) => {
          const active = category === value;
          return (
            <Link
              key={value}
              href={toolsHref({ category: active ? undefined : value, tag, sort })}
              aria-current={active ? "page" : undefined}
              className={cn(chip, active && chipActive)}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      {tags.length ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Tags</span>
          {tags.map((t) => {
            const active = tag === t.slug;
            return (
              <Link
                key={t.id}
                href={toolsHref({ category, tag: active ? undefined : t.slug, sort })}
                aria-current={active ? "page" : undefined}
                className={cn(chip, "text-xs", active && chipActive)}
              >
                {t.name}
              </Link>
            );
          })}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Sort</span>
        {TOOL_SORTS.map(({ value, label }) => {
          const active = activeSort === value;
          return (
            <Link
              key={value}
              /*
               * The default sort is expressed by *omitting* ?sort=, so the
               * plain /tools URL stays canonical instead of gaining a param
               * that means what no param already meant.
               */
              href={toolsHref({
                category,
                tag,
                sort: value === DEFAULT_TOOL_SORT ? undefined : value,
              })}
              aria-current={active ? "page" : undefined}
              className={cn(chip, "text-xs", active && chipActive)}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
