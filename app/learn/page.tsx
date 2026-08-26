import type { Metadata } from "next";

import { BookmarkButton } from "@/components/features/bookmarks/BookmarkButton";
import { LearnFilters } from "@/components/features/learn/LearnFilters";
import { DirectoryPager } from "@/components/features/resource/DirectoryPager";
import { ResourceCard } from "@/components/features/resource/ResourceCard";
import { createClient } from "@/lib/integrations/supabase/server";
import { LEARN_TYPE_VALUES, learnHref, toContentType } from "@/lib/learn";
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
  searchParams: Promise<{ type?: string; level?: string; page?: string }>;
};

export default async function LearnPage({ searchParams }: Props) {
  const params = await searchParams;
  // Unknown values are dropped rather than 404'd: a stale or hand-edited URL
  // should still show the hub, not an error.
  const type = toContentType(params.type);
  const level = toLevelParam(params.level);
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
      page,
    }),
    // Signed-out visitors still see Save buttons; pressing one sends them to
    // sign in. Only which ones read as saved needs a user.
    auth.user ? listBookmarks(supabase, auth.user.id, "content") : [],
  ]);

  const bookmarkedIds = new Set(bookmarks.map((bookmark) => bookmark.target_id));
  // Come back to this exact filtered page after a signed-out visitor logs in.
  const returnTo = learnHref({ type, level, page });

  return (
    <main className="mx-auto w-full max-w-6xl p-6">
      <h1 className="font-heading text-2xl font-semibold">Learn</h1>
      <p className="mt-1 text-muted-foreground">
        Guides, articles and cheatsheets for getting things actually shipped.
      </p>

      <div className="mt-6">
        <LearnFilters
          type={type}
          level={level}
          effectiveLevel={effectiveLevel}
          hasProfileLevel={Boolean(profile?.role_level)}
        />
      </div>

      {items.length ? (
        <>
          <ul className="mt-8 grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map(contentView).map((view) => (
              <li key={view.id}>
                <ResourceCard
                  href={view.href}
                  title={view.title}
                  eyebrow={view.eyebrow}
                  description={view.description}
                  badges={view.badges}
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
            href={(next) => learnHref({ type, level, page: next })}
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
