import Link from "next/link";

import { toolsHref } from "@/lib/tools-url";
import { cn } from "@/lib/utils";

type Props = {
  page: number;
  pageCount: number;
  total: number;
  category?: string;
  tag?: string;
  sort?: string;
};

const step =
  "rounded-lg border px-3 py-1.5 text-sm transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

/**
 * Prev / next pager for the directory.
 *
 * Links, not buttons, so each page is a real URL: shareable, indexable and
 * correct under the back button. At the ends the step renders as a disabled
 * span rather than a link to nowhere.
 */
export function DirectoryPager({ page, pageCount, total, category, tag, sort }: Props) {
  if (pageCount <= 1) {
    return null;
  }

  const first = page <= 1;
  const last = page >= pageCount;

  return (
    <nav aria-label="Pagination" className="mt-8 flex items-center justify-between gap-4 border-t pt-6">
      {first ? (
        <span className={cn(step, "cursor-default opacity-40")} aria-disabled="true">
          ← Previous
        </span>
      ) : (
        <Link href={toolsHref({ category, tag, sort, page: page - 1 })} rel="prev" className={step}>
          ← Previous
        </Link>
      )}

      <p aria-live="polite" className="text-sm text-muted-foreground">
        Page {page} of {pageCount}
        <span className="hidden sm:inline"> · {total} tools</span>
      </p>

      {last ? (
        <span className={cn(step, "cursor-default opacity-40")} aria-disabled="true">
          Next →
        </span>
      ) : (
        <Link href={toolsHref({ category, tag, sort, page: page + 1 })} rel="next" className={step}>
          Next →
        </Link>
      )}
    </nav>
  );
}
