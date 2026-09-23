import type { ReactNode } from "react";

import { ArticleToc } from "@/components/features/resource/ArticleToc";
import { ReadingProgress } from "@/components/ui/reading-progress";
import { hasOutline, type OutlineEntry } from "@/lib/article-outline";

/**
 * The page frame every long-form route shares (VIB-198 → VIB-202).
 *
 * Two constraints, and the bug was keeping only one of them:
 *
 *   - 70% of the window, so the column grows with the screen;
 *   - never wider than the site's own container, so it stays inside the box
 *     the header and every other page already draw.
 *
 * `w-[70%] max-w-7xl` is min() of the two. Past about 1830px the 70% would
 * overshoot `max-w-7xl`, and the article was sticking out past the header's
 * left and right edges on exactly the screens Ali reviews on — the column
 * read as off-centre because it *was*, relative to everything else on the
 * page.
 *
 * `max-w-7xl px-6` is copied from the site header on purpose: the two
 * containers have to agree, and the way to make them agree is to give them
 * the same numbers rather than numbers that happen to match today.
 *
 * The rail is a column inside the container, not a float in the gutter
 * beside it (VIB-202). Its footprint is the ticks — the panel it opens is
 * an overlay — so 3rem is the whole cost of keeping it inside the box.
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
      <div className="mx-auto w-full max-w-7xl px-6 pb-20 xl:w-[70%]">
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_3rem]">
          <main className="min-w-0">{children}</main>
          {showRail ? (
            <div className="hidden xl:block">
              <ArticleToc entries={outline} />
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
