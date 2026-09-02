import { IconSearch } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Props = {
  /** Prefills the box on the results page. */
  defaultValue?: string;
  /** Compact variant for the header. */
  compact?: boolean;
  className?: string;
};

/**
 * The search box.
 *
 * A plain GET form pointing at /search, so submitting produces a real,
 * shareable URL and the whole thing works without JavaScript. No client
 * component, no debounced fetching, no results dropdown — those are UX
 * ambitions for a site that has more than a few dozen rows to search.
 */
export function SearchInput({ defaultValue, compact, className }: Props) {
  return (
    <form
      method="get"
      action="/search"
      role="search"
      className={cn("flex items-center gap-2", className)}
    >
      <label htmlFor={compact ? "search-compact" : "search"} className="sr-only">
        Search tools and Learn
      </label>
      <Input
        id={compact ? "search-compact" : "search"}
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder="Search tools and guides"
        className={cn(compact && "h-9 w-44 lg:w-64")}
      />
      <Button type="submit" variant={compact ? "ghost" : "default"} size={compact ? "icon" : "default"}>
        <IconSearch aria-hidden />
        <span className={cn(compact && "sr-only")}>Search</span>
      </Button>
    </form>
  );
}
