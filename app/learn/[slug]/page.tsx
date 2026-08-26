import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { after } from "next/server";

import { BookmarkButton } from "@/components/features/bookmarks/BookmarkButton";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/integrations/supabase/server";
import { contentTypeLabel, learnHref } from "@/lib/learn";
import { isBookmarked } from "@/lib/queries/bookmarks";
import { getContentBySlug, getContentTags } from "@/lib/queries/content";
import { recordVisit } from "@/lib/queries/history";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const item = await getContentBySlug(supabase, slug);

  if (!item) {
    return { title: "Not found — Viberation" };
  }
  return { title: `${item.title} — Viberation` };
}

/**
 * One route for every content type.
 *
 * `help_article` and `role_guide` render here alongside the editorial types
 * — migration 03's `content` table is the documentation system, so there is
 * no second set of routes or templates to keep in sync (§34).
 */
export default async function ContentPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  /*
   * Two waves, not four. The row and the session do not depend on each other,
   * and neither do the tags and the saved state — issuing them serially cost
   * two extra Supabase round trips per view, which is the whole page budget
   * when the database is a continent away (VIB-56).
   */
  const [item, { data: auth }] = await Promise.all([
    getContentBySlug(supabase, slug),
    supabase.auth.getUser(),
  ]);

  if (!item) {
    notFound();
  }

  /*
   * Signed-out visitors still see the button — pressing it sends them to
   * sign in and back. Only the saved/unsaved state needs a user.
   */
  const [tags, bookmarked] = await Promise.all([
    getContentTags(supabase, item.id),
    auth.user
      ? isBookmarked(supabase, auth.user.id, { targetType: "content", targetId: item.id })
      : Promise.resolve(false),
  ]);

  /*
   * after() runs once the response has been sent, so the history write never
   * adds latency to the page the reader is waiting on (the pattern the tool
   * detail view counter established).
   */
  if (auth.user) {
    const userId = auth.user.id;
    after(() => recordVisit(supabase, userId, { targetType: "content", targetId: item.id }));
  }

  return (
    <main className="mx-auto w-full max-w-3xl p-6">
      <Link href="/learn" className="text-sm text-muted-foreground hover:underline">
        ← All of Learn
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Link href={learnHref({ type: item.type })}>
          <Badge variant="secondary">{contentTypeLabel(item.type)}</Badge>
        </Link>
        {item.role_level ? (
          <Link href={learnHref({ level: item.role_level })}>
            <Badge variant="outline">{item.role_level}</Badge>
          </Link>
        ) : null}
        {/* Only role_guide rows carry an audience; it is null on everything else. */}
        {item.audience ? <Badge variant="outline">{item.audience}</Badge> : null}
      </div>

      <h1 className="mt-3 font-heading text-3xl font-semibold">{item.title}</h1>

      {item.body ? (
        /*
         * ponytail: bodies render as preformatted text, not Markdown — no
         * parser, no sanitiser, no new dependency, and nothing an author can
         * type becomes HTML. Swap in a Markdown renderer when authored
         * content actually needs headings and links, and sanitise it then.
         *
         * pre-wrap, not pre-line: pre-line collapses runs of spaces, which
         * is exactly what a cheatsheet uses to line its columns up. And
         * columns only line up in a fixed-width font, so cheatsheets get one.
         */
        <div
          className={cn(
            "mt-6 whitespace-pre-wrap",
            item.type === "cheatsheet" ? "font-mono text-sm leading-6" : "leading-relaxed",
          )}
        >
          {item.body}
        </div>
      ) : null}

      <div className="mt-8 flex flex-wrap items-center gap-3 border-t pt-6">
        <BookmarkButton
          targetType="content"
          targetId={item.id}
          bookmarked={bookmarked}
          returnTo={`/learn/${item.slug}`}
        />
      </div>

      {tags.length ? (
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Tagged</span>
          {tags.map((tag) => (
            <Link key={tag.id} href={`/tags/${tag.slug}`}>
              <Badge variant="outline">{tag.name}</Badge>
            </Link>
          ))}
        </div>
      ) : null}
    </main>
  );
}
