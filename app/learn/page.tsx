import type { Metadata } from "next";

import { BookmarkButton } from "@/components/features/bookmarks/BookmarkButton";
import { LearnFilters } from "@/components/features/learn/LearnFilters";
import { DirectoryPager } from "@/components/features/resource/DirectoryPager";
import { ResourceCard } from "@/components/features/resource/ResourceCard";
import { createClient } from "@/lib/integrations/supabase/server";
import { LEARN_TYPE_VALUES, learnHref, toContentType, toLearnSort } from "@/lib/learn";
import { toPageNumber } from "@/lib/pagination";
import { listBookmarks } from "@/lib/queries/bookmarks";
import { listContent } from "@/lib/queries/content";
import { getProfile } from "@/lib/queries/profiles";
import { contentView } from "@/lib/resource-view";
import { resolveRoleLevel, toLevelParam } from "@/lib/role-level";

export const metadata: Metadata = {
  title: "Learn — Viberation",
  description:
    "Guides, articles, cheatsheets and help for vibe coders, tuned to the level you are actually at.",
};

type Props = {
  searchParams: Promise<{ type?: string; level?: string; sort?: string; page?: string }>;
};

/** Learn hub (VIB-85, mockup screen 10). */
export default async function LearnPage({ searchParams }: Props) {
  const params = await searchParams;
  // Unknown values are dropped rather than 404'd: a stale or hand-edited URL
  // should still show the hub, not an error.
  const type = toContentType(params.type);
  const level = toLevelParam(params.level);
  const sort = toLearnSort(params.sort);
  const page = toPageNumber(params.page);

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();

  // The signed-in tier is the default filter (VIB-34), so it has to be known
  // before the listing query can run.
  const profile = auth.user ? await getProfile(supabase, auth.user.id) : null;
  const effectiveLevel = resolveRoleLevel(level, profile?.role_level ?? null);

  const [{ items, total, pageCount }, bookmarks] = await Promise.all([
    listContent(supabase, {
      types: type ? [type] : LEARN_TYPE_VALUES,
      roleLevel: effectiveLevel,
      sort,
      page,
    }),
    // Signed-out visitors still see Save buttons; pressing one sends them to
    // sign in. Only which ones read as saved needs a user.
    auth.user ? listBookmarks(supabase, auth.user.id, "content") : [],
  ]);

  const bookmarkedIds = new Set(bookmarks.map((bookmark) => bookmark.target_id));
  // Come back to this exact filtered page after a signed-out visitor logs in.
  const returnTo = learnHref({ type, level, sort, page });

  return (
    <main className="mx-auto w-full max-w-6xl p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="font-heading text-2xl font-semibold">Learn</h1>
        <span className="text-muted-foreground text-xs">
          Role-adaptive · beginner content stays separate
        </span>
      </div>
      <p className="text-muted-foreground mt-1">
        Guides, articles and cheatsheets for getting things actually shipped.
      </p>

      <div className="mt-6">
        <LearnFilters
          type={type}
          level={level}
          effectiveLevel={effectiveLevel}
          hasProfileLevel={Boolean(profile?.role_level)}
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
          <ul className="mt-6 grid items-start gap-4 sm:grid-cols-2">
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
                      bookmarked={bookmarkedIds.has(view.id)}
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
            href={(next) => learnHref({ type, level, sort, page: next })}
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
  );
}
