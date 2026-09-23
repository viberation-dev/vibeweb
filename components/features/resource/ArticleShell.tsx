import type { ReactNode } from "react";

import { ArticleToc } from "@/components/features/resource/ArticleToc";
import { ReadingProgress } from "@/components/ui/reading-progress";
import { hasOutline, type OutlineEntry } from "@/lib/article-outline";

/**
 * The page frame every long-form route shares (VIB-198, widened in VIB-200).
 *
 * The reading column is 70% of the space the shell is given. The rail
 * (13rem) and the gap between them (2rem) sit outside that, so the shell is
 * `70% + 15rem` — add only the rail and the column measures 67%, because
 * the gap has to come out of something.
 *
 * The width is on the shell rather than on the rail's presence, so a page
 * with no outline is exactly as wide as one with a rail.
 *
 * Below xl there is one column, full width, and no rail: a collapsed rail
 * needs hover to open it, and a phone has none.
 *
 * ponytail: the measure is now the container rather than a character count,
 * so on a very wide monitor the lines get long. A `max-w-[90ch]` on the
 * body would cap that without narrowing anything below ~1400px.
 */
export function ArticleShell({
  outline,
  children,
}: {
  outline: OutlineEntry[];
  children: ReactNode;
}) {
  const showRail = hasOutline(outline);

  return (
    <>
      <ReadingProgress />
      <div className="mx-auto grid w-full grid-cols-1 gap-8 px-6 pb-20 xl:w-[calc(70%+15rem)] xl:grid-cols-[minmax(0,1fr)_13rem] xl:px-0">
        <main className="min-w-0">{children}</main>
        <div className="hidden xl:block">
          {showRail ? <ArticleToc entries={outline} /> : null}
        </div>
      </div>
    </>
  );
}
