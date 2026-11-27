import type { Metadata } from "next";

import { BookmarkButton } from "@/components/features/bookmarks/BookmarkButton";
import { BookmarksProvider } from "@/components/features/bookmarks/BookmarksProvider";
import { LevelDefault } from "@/components/features/learn/LevelDefault";
import { LearnFilters } from "@/components/features/learn/LearnFilters";
import { DirectoryPager } from "@/components/features/resource/DirectoryPager";
import { ResourceCard } from "@/components/features/resource/ResourceCard";
import {
  LEARN_TYPE_VALUES,
  learnHref,
  toContentPillar,
  toContentType,
  toLearnSort,
} from "@/lib/learn";
import { toPageNumber } from "@/lib/pagination";
import {
  countContentByPillarCached,
  listContentCached,
} from "@/lib/queries/content";
import { contentView } from "@/lib/resource-view";
import { ROLE_LEVELS, resolveRoleLevel, toLevelParam } from "@/lib/role-level";

type Props = {
  searchParams: Promise<{
    type?: string;
    pillar?: string;
    level?: string;
    sort?: string;
    page?: string;
  }>;
};

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const { page } = await searchParams;
  return {
    title: "Learn",
    description:
      "Plain-English guides, articles and cheatsheets for building with AI, matched to the level you are actually at.",
    // Later pages list articles page one does not, so each is its own
    // canonical; the filters and sorts fold into it (VIB-245).
    alternates: { canonical: learnHref({ page: toPageNumber(page) }) },
  };
}

/** Learn hub (VIB-85, mockup screen 10). */
export default async function LearnPage({ searchParams }: Props) {
  const params = await searchParams;
  // Unknown values are dropped rather than 404'd: a stale or hand-edited URL
  // should still show the hub, not an error.
  const type = toContentType(params.type);
  const pillar = toContentPillar(params.pillar);
  const level = toLevelParam(params.level);
  const sort = toLearnSort(params.sort);
  const page = toPageNumber(params.page);

  /*
   * Cached and the same for every reader (see publicCached). A member's own
   * tier is still the default filter (VIB-34), but LevelDefault applies it in
   * the browser by setting ?level=, and saved state comes from
   * BookmarksProvider.
   */
  const effectiveLevel = resolveRoleLevel(level, null);

  const [{ items, total, pageCount }, pillarCounts] = await Promise.all([
    listContentCached({
      types: type ? [type] : LEARN_TYPE_VALUES,
      roleLevel: effectiveLevel,
      pillar,
      sort,
      page,
    }),
    /*
     * Counts ignore the active filters on purpose: a chip row that renumbers
     * itself as you filter cannot be read as "what is in this section", and
     * picking one pillar would zero the other five.
     */
    countContentByPillarCached(LEARN_TYPE_VALUES),
  ]);

  // Come back to this exact filtered page after a signed-out visitor logs in.
  const returnTo = learnHref({ type, pillar, level, sort, page });

  return (
    <BookmarksProvider targetType="content">
      {level ? null : (
        <LevelDefault
          hrefFor={Object.fromEntries(
            ROLE_LEVELS.map(({ value }) => [
              value,
              learnHref({ type, pillar, level: value, sort, page }),
            ]),
          )}
        />
      )}
      <main className="mx-auto w-full max-w-6xl p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="font-heading text-2xl font-semibold">Learn</h1>
          <span className="text-muted-foreground text-xs">
            Tuned to your level. Beginner guides stay beginner.
          </span>
        </div>
        <p className="text-muted-foreground mt-1">
          Guides that do not skip the step you are stuck on, written in plain
          English, with prompts you can copy.
        </p>

        <div className="mt-6">
          <LearnFilters
            type={type}
            pillar={pillar}
            pillarCounts={pillarCounts}
            level={level}
            effectiveLevel={effectiveLevel}
            hasProfileLevel={false}
            sort={sort}
          />
        </div>

        {items.length ? (
          <>
            {/*
            Two columns, matching the mockup — Learn cards carry a preview
            paragraph and read wider than a tool tile.

            motion-lift / motion-reveal are opt-in here because this screen
            and the marketing homepage are the only two that get motion
            (handoff §4). Both are pure CSS, so the grid stays a server
            component.
          */}
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {items.map(contentView).map((view) => (
                <li key={view.id}>
                  <ResourceCard
                    className="motion-lift motion-reveal"
                    href={view.href}
                    title={view.title}
                    eyebrow={view.eyebrow}
                    description={view.description}
                    badges={view.badges}
                    difficulty={view.difficulty}
                    meta={view.meta}
                    action={
                      <BookmarkButton
                        targetType={view.targetType}
                        targetId={view.id}
                        returnTo={returnTo}
                      />
                    }
                  />
                </li>
              ))}
            </ul>
            <DirectoryPager
              page={page}
              pageCount={pageCount}
              total={total}
              itemLabel="pieces"
              href={(next) =>
                learnHref({ type, pillar, level, sort, page: next })
              }
            />
          </>
        ) : (
          <p className="mt-8 text-muted-foreground">
            {page > 1
              ? "That page is past the end of the results. Try going back to the first page."
              : "Nothing here yet at this level. Try another type, or widen it to all levels."}
          </p>
        )}
      </main>
    </BookmarksProvider>
  );
}
