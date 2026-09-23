import type { ReactNode } from "react";

import { ArticleToc } from "@/components/features/resource/ArticleToc";
import { ReadingProgress } from "@/components/ui/reading-progress";
import { hasOutline, type OutlineEntry } from "@/lib/article-outline";

/**
 * The page frame every long-form route shares (VIB-198).
 *
 * Three columns at xl, and the first is an empty spacer on purpose: it
 * mirrors the rail's width so the reading column stays on the page's centre
 * line. A two-column grid would shift the article left of centre the moment
 * a piece gained a second heading, which is a layout that moves depending on
 * its content.
 *
 * Below xl there is one column and no rail. A collapsed rail needs hover to
 * open, and a phone has none.
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
      <div className="mx-auto grid w-full max-w-[calc(68ch+28rem)] grid-cols-1 gap-8 pb-20 xl:grid-cols-[13rem_minmax(0,68ch)_13rem]">
        <div aria-hidden className="hidden xl:block" />
        <main className="min-w-0">{children}</main>
        <div className="hidden xl:block">
          {showRail ? <ArticleToc entries={outline} /> : null}
        </div>
      </div>
    </>
  );
}
