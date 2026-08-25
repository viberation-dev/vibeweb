import Link from "next/link";

import type { Tag } from "@/lib/queries/tags";
import { TOOL_CATEGORIES, type ToolCategory } from "@/lib/tool-categories";
import { cn } from "@/lib/utils";

type Props = {
  category?: ToolCategory;
  tag?: string;
  tags: Tag[];
};

/** Builds `/tools?...`, dropping empty params so the base URL stays clean. */
function toolsHref(params: { category?: string; tag?: string }): string {
  const search = new URLSearchParams();

  if (params.category) search.set("category", params.category);
  if (params.tag) search.set("tag", params.tag);

  const query = search.toString();
  return query ? `/tools?${query}` : "/tools";
}

const chip =
  "rounded-full border px-3 py-1 text-sm transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
const chipActive = "border-transparent bg-primary text-primary-foreground hover:bg-primary/80";

/**
 * Category nav + tag filter.
 *
 * Plain links, no client component: the filter state lives entirely in the
 * URL, so it is shareable, back-button-correct and works without JS. Each
 * chip keeps the *other* axis intact, and clicking an active chip clears it.
 */
export function DirectoryFilters({ category, tag, tags }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <nav aria-label="Tool categories" className="flex flex-wrap gap-2">
        <Link
          href={toolsHref({ tag })}
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
              href={toolsHref({ category: active ? undefined : value, tag })}
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
                href={toolsHref({ category, tag: active ? undefined : t.slug })}
                aria-current={active ? "page" : undefined}
                className={cn(chip, "text-xs", active && chipActive)}
              >
                {t.name}
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
