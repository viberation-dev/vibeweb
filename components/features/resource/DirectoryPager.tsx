import Link from "next/link";

import { cn } from "@/lib/utils";

type Props = {
  page: number;
  pageCount: number;
  total: number;
  /** Builds the URL for a page number — `toolsHref`, `learnHref`, etc. */
  href: (page: number) => string;
  /** Plural noun for the count, e.g. "tools", "articles". */
  itemLabel: string;
};

const step =
  "rounded-lg border px-3 py-1.5 text-sm transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

/**
 * Prev / next pager for any paginated listing.
 *
 * Links, not buttons, so each page is a real URL: shareable, indexable and
 * correct under the back button. At the ends the step renders as a disabled
 * span rather than a link to nowhere.
 *
 * The caller supplies `href` rather than this knowing about any one route's
 * query string, so the tools directory and the Learn hub share one pager.
 */
export function DirectoryPager({ page, pageCount, total, href, itemLabel }: Props) {
  if (pageCount <= 1) {
    return null;
  }

  const first = page <= 1;
  const last = page >= pageCount;

  return (
    <nav
      aria-label="Pagination"
      className="mt-8 flex items-center justify-between gap-4 border-t pt-6"
    >
      {first ? (
        <span className={cn(step, "cursor-default opacity-40")} aria-disabled="true">
          ← Previous
        </span>
      ) : (
        <Link href={href(page - 1)} rel="prev" className={step}>
          ← Previous
        </Link>
      )}

      <p aria-live="polite" className="text-sm text-muted-foreground">
        Page {page} of {pageCount}
        <span className="hidden sm:inline">
          {" "}
          · {total} {itemLabel}
        </span>
      </p>

      {last ? (
        <span className={cn(step, "cursor-default opacity-40")} aria-disabled="true">
          Next →
        </span>
      ) : (
        <Link href={href(page + 1)} rel="next" className={step}>
          Next →
        </Link>
      )}
    </nav>
  );
}
