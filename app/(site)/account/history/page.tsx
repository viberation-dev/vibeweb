import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { BookmarkButton } from "@/components/features/bookmarks/BookmarkButton";
import { ResourceCard } from "@/components/features/resource/ResourceCard";
import { createClient } from "@/lib/integrations/supabase/server";
import { listBookmarks } from "@/lib/queries/bookmarks";
import { listHistory } from "@/lib/queries/history";
import { resolveTargetViews } from "@/lib/queries/resources";

export const metadata: Metadata = {
  title: "History — Viberation",
  description: "The tools and guides you have looked at recently.",
};

/**
 * Recently viewed (§31, VIB-51).
 *
 * Reverse-chronological, one card per item, deduped by recordVisit rather
 * than here — the list is already one row per thing.
 */
export default async function HistoryPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    // The middleware already gates /account/history; this is the belt to its braces
    // and gives TypeScript a non-null user.
    redirect("/login?redirectTo=/account/history");
  }

  const [items, bookmarks] = await Promise.all([
    listHistory(supabase, data.user.id),
    listBookmarks(supabase, data.user.id),
  ]);

  const viewed = await resolveTargetViews(supabase, items);

  const bookmarkedIds = new Set(bookmarks.map((bookmark) => bookmark.target_id));

  /*
   * Nothing deletes a history row when its tool goes away — no foreign key
   * can span a polymorphic target — so entries whose target has vanished are
   * dropped here rather than rendered as holes, the same as bookmarks.
   */
  const entries = items.flatMap((item) => {
    const target = viewed.get(item.target_id);
    return target ? [{ id: item.id, target }] : [];
  });

  return (
    <>
      <h1 className="font-heading text-2xl font-semibold">History</h1>
      <p className="mt-1 text-muted-foreground">
        {entries.length
          ? "The tools and guides you have looked at recently, newest first."
          : "Nothing viewed yet."}
      </p>

      {entries.length ? (
        <ul className="mt-6 grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map(({ id, target }) => (
            <li key={id}>
              <ResourceCard
                href={target.href}
                title={target.title}
                eyebrow={target.eyebrow}
                description={target.description}
                badges={target.badges}
                action={
                  <BookmarkButton
                    targetType={target.targetType}
                    targetId={target.id}
                    bookmarked={bookmarkedIds.has(target.id)}
                    returnTo="/account/history"
                  />
                }
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-8 text-muted-foreground">
          Open something in the{" "}
          <Link href="/tools" className="underline">
            directory
          </Link>{" "}
          or{" "}
          <Link href="/learn" className="underline">
            Learn
          </Link>{" "}
          and it will show up here.
        </p>
      )}
    </>
  );
}
