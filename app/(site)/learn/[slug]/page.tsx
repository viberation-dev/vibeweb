import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { after } from "next/server";

import { BookmarkButton } from "@/components/features/bookmarks/BookmarkButton";
import { AppreciateButton } from "@/components/features/discussion/AppreciateButton";
import { ArticleDock } from "@/components/features/discussion/ArticleDock";
import { CommentThread } from "@/components/features/discussion/CommentThread";
import { ArticleBody } from "@/components/features/resource/ArticleBody";
import { ArticleFooter } from "@/components/features/resource/ArticleFooter";
import { ArticleHeader } from "@/components/features/resource/ArticleHeader";
import { ArticleShell } from "@/components/features/resource/ArticleShell";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/features/seo/JsonLd";
import { articleOutline } from "@/lib/article-outline";
import { readingTimeLabel } from "@/lib/reading-time";
import { breadcrumbLd, plainSummary } from "@/lib/structured-data";
import { createClient } from "@/lib/integrations/supabase/server";
import { siteUrl } from "@/lib/site-url";
import { contentPillarLabel, contentTypeLabel, learnHref } from "@/lib/learn";
import { countCommentNodes } from "@/lib/comment-tree";
import { getAppreciationState } from "@/lib/queries/appreciations";
import { isBookmarked } from "@/lib/queries/bookmarks";
import { listComments } from "@/lib/queries/comments";
import {
  getContentBySlug,
  getContentTags,
  incrementContentViews,
} from "@/lib/queries/content";
import { recordVisit } from "@/lib/queries/history";
import { cn } from "@/lib/utils";
import { toGuideBlocks } from "@/lib/validation/guide";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const item = await getContentBySlug(supabase, slug);

  if (!item || item.type === "announcement") {
    return { title: "Not found" };
  }
  return { title: item.title, description: plainSummary(item.body) };
}

/**
 * One route for every content type except announcements.
 *
 * `help_article` and `role_guide` render here alongside the editorial types
 * — migration 03's `content` table is the documentation system, so there is
 * no second set of routes or templates to keep in sync (§34).
 *
 * `announcement` is the exception (VIB-106): it has its own stream at /blog
 * and its own detail route. Slugs are unique across `content`, so without
 * the check below a post would answer at both /learn/x and /blog/x — two
 * URLs for one thing, which is a duplicate rather than a convenience.
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

  if (!item || item.type === "announcement") {
    notFound();
  }

  /*
   * Signed-out visitors still see the button — pressing it sends them to
   * sign in and back. Only the saved/unsaved state needs a user.
   */
  const target = { targetType: "content", targetId: item.id } as const;

  const [tags, bookmarked, appreciation, comments] = await Promise.all([
    getContentTags(supabase, item.id),
    auth.user
      ? isBookmarked(supabase, auth.user.id, target)
      : Promise.resolve(false),
    /*
     * Both discussion reads run in the same wave as the tags. They do not
     * depend on each other and the page cannot render without either, so
     * serialising them would add two round trips to a database that is a
     * continent away (the VIB-56 argument, again).
     */
    getAppreciationState(supabase, target, auth.user?.id),
    listComments(supabase, target, auth.user?.id),
  ]);

  const commentCount = countCommentNodes(comments);

  /*
   * after() runs once the response has been sent, so neither write adds
   * latency to the page the reader is waiting on, and a slow or failed one
   * cannot break the render (the pattern the tool detail view counter
   * established).
   *
   * The counter runs for everyone; the history row only for a signed-in
   * reader. Popularity is a fact about the article, history is a fact about
   * the person — gating the counter on a session would have made "Top" mean
   * "most read by people who happened to be logged in".
   */
  const userId = auth.user?.id;
  const blocks = toGuideBlocks(item.blocks);
  after(async () => {
    await incrementContentViews(supabase, item.slug);
    if (userId) {
      await recordVisit(supabase, userId, {
        targetType: "content",
        targetId: item.id,
      });
    }
  });

  const outline = articleOutline(item.blocks);
  const url = `${siteUrl}/learn/${item.slug}`;

  return (
    <ArticleShell outline={outline}>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: item.title,
            description: plainSummary(item.body),
            datePublished: item.created_at,
            dateModified: item.updated_at,
            publisher: { "@id": `${siteUrl}/#organization` },
          },
          breadcrumbLd([
            { name: "Learn", path: "/learn" },
            { name: item.title, path: `/learn/${item.slug}` },
          ]),
        ]}
      />

      <div className="mx-auto max-w-[68ch] px-6 pt-6">
        <Link
          href="/learn"
          className="text-muted-foreground text-sm hover:underline"
        >
          &larr; All of Learn
        </Link>
      </div>

      <ArticleHeader
        kicker={
          item.pillar ? contentPillarLabel(item.pillar) : contentTypeLabel(item.type)
        }
        title={item.title}
        /*
         * `body` is the standfirst for a structured guide and the whole
         * piece for everything else (VIB-192 keeps a short plain summary
         * beside the blocks). So it is the lede only when blocks exist —
         * otherwise the article would be printed twice, once large and grey.
         *
         * Not the card preview: that truncates at 160 characters, which is
         * right on a card and reads as a broken sentence under a headline.
         */
        lede={blocks ? item.body : null}
        publishedAt={item.created_at}
        updatedAt={item.updated_at}
        readingTime={readingTimeLabel(item.body, item.blocks)}
        viewCount={item.view_count}
        commentCount={commentCount}
        badges={
          <>
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
          </>
        }
      />

      {blocks ? (
        <ArticleBody blocks={blocks} outline={outline} className="mx-auto mt-10 px-6" />
      ) : item.body ? (
        /*
         * ponytail: bodies render as preformatted text, not Markdown — no
         * parser, no sanitiser, no new dependency, and nothing an author can
         * type becomes HTML. Structured guides (VIB-192) take the branch
         * above instead; this is still how every prose row renders.
         *
         * pre-wrap, not pre-line: pre-line collapses runs of spaces, which
         * is exactly what a cheatsheet uses to line its columns up. And
         * columns only line up in a fixed-width font, so cheatsheets get one.
         *
         * A cheatsheet opts out of the reader's text size as well: its
         * columns are laid out in characters, and scaling it up is how a
         * lined-up table becomes a wrapped one.
         */
        <div
          className={cn(
            "mx-auto mt-10 px-6 whitespace-pre-wrap",
            item.type === "cheatsheet"
              ? "max-w-[68ch] font-mono text-sm leading-6"
              : "reading",
          )}
        >
          {item.body}
        </div>
      ) : null}

      <ArticleFooter
        url={url}
        title={item.title}
        tags={tags}
        action={
          <>
            <AppreciateButton
              target={target}
              count={appreciation.count}
              mine={appreciation.mine}
              returnTo={`/learn/${item.slug}`}
            />
            <BookmarkButton
              targetType="content"
              targetId={item.id}
              bookmarked={bookmarked}
              returnTo={`/learn/${item.slug}`}
            />
          </>
        }
      />

      <CommentThread
        target={target}
        returnTo={`/learn/${item.slug}`}
        comments={comments}
        signedIn={Boolean(auth.user)}
      />

      <ArticleDock
        target={target}
        returnTo={`/learn/${item.slug}`}
        appreciations={appreciation.count}
        appreciated={appreciation.mine}
        commentCount={commentCount}
        url={url}
        title={item.title}
      />
    </ArticleShell>
  );
}
