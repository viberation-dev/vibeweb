import type { ReactNode } from "react";

import { ArticleToc } from "@/components/features/resource/ArticleToc";
import { ReadingProgress } from "@/components/ui/reading-progress";
import { hasOutline, type OutlineEntry } from "@/lib/article-outline";

/**
 * The page frame every long-form route shares (VIB-198, VIB-200, VIB-201).
 *
 * The article is a plain centred 70% column and nothing shares that space.
 * It was a grid of `[content][rail]` inside a shell of `70% + rail`, which
 * put the *shell* at 70%-and-a-bit and the text somewhere left of it — so
 * the column the reader sees started to the left of the site header's
 * container and stopped well short of its right edge. A column whose
 * position depends on whether the page happens to have an outline is not a
 * column, it is a coincidence.
 *
 * The rail now lives in the right-hand gutter, outside the column: absolute
 * beside it, sticky within that. Its layout footprint is only the ticks —
 * the panel it opens is an overlay — so the gutter that 70% leaves over is
 * wide enough from xl up.
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
      <div className="relative mx-auto w-full px-6 pb-20 xl:w-[70%] xl:px-0">
        <main className="min-w-0">{children}</main>

        {showRail ? (
          /*
           * inset-y-0 so the rail's sticky range is the article's height: it
           * follows the reader down the piece and stops at the end of it,
           * rather than floating over the footer of the page.
           */
          <div className="absolute inset-y-0 left-full hidden pl-8 xl:block">
            <ArticleToc entries={outline} />
          </div>
        ) : null}
      </div>
    </>
  );
}
