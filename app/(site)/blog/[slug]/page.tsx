import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { after } from "next/server";

import { BookmarkButton } from "@/components/features/bookmarks/BookmarkButton";
import { AppreciateButton } from "@/components/features/discussion/AppreciateButton";
import { ArticleDock } from "@/components/features/discussion/ArticleDock";
import { CommentThread } from "@/components/features/discussion/CommentThread";
import { ArticleFooter } from "@/components/features/resource/ArticleFooter";
import { Breadcrumb } from "@/components/features/resource/Breadcrumb";
import { ArticleHeader } from "@/components/features/resource/ArticleHeader";
import { ArticleShell } from "@/components/features/resource/ArticleShell";
import { JsonLd } from "@/components/features/seo/JsonLd";
import { readingTimeLabel } from "@/lib/reading-time";
import { breadcrumbLd, plainSummary } from "@/lib/structured-data";
import { createClient } from "@/lib/integrations/supabase/server";
import { siteUrl } from "@/lib/site-url";
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

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const item = await getContentBySlug(supabase, slug);

  if (!item || item.type !== "announcement") {
    return { title: "Not found" };
  }
  return { title: item.title, description: plainSummary(item.body) };
}

/**
 * One announcement (VIB-106).
 *
 * Its own route rather than another branch inside `/learn/[slug]`, because
 * announcements are their own stream now — and a slug is unique across
 * `content`, so without the type check below the same post would answer at
 * two addresses. Each piece gets exactly one canonical URL: this route 404s
 * for anything that is not an announcement, and `/learn/[slug]` 404s for
 * anything that is.
 */
export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const [item, { data: auth }] = await Promise.all([
    getContentBySlug(supabase, slug),
    supabase.auth.getUser(),
  ]);

  if (!item || item.type !== "announcement") {
    notFound();
  }

  const target = { targetType: "content", targetId: item.id } as const;

  // One wave — see /learn/[slug] for why the discussion reads join it.
  const [tags, bookmarked, appreciation, comments] = await Promise.all([
    getContentTags(supabase, item.id),
    auth.user
      ? isBookmarked(supabase, auth.user.id, target)
      : Promise.resolve(false),
    getAppreciationState(supabase, target, auth.user?.id),
    listComments(supabase, target, auth.user?.id),
  ]);

  const commentCount = countCommentNodes(comments);

  // after() runs once the response is sent, so neither write adds latency to
  // the page the reader is waiting on — same pattern as /learn/[slug].
  const userId = auth.user?.id;
  after(async () => {
    await incrementContentViews(supabase, item.slug);
    if (userId) {
      await recordVisit(supabase, userId, {
        targetType: "content",
        targetId: item.id,
      });
    }
  });

  return (
    /*
     * No outline: an announcement is one short piece of prose with no
     * heading blocks, so the rail has nothing to list. ArticleShell hides it
     * on its own rather than each page deciding.
     */
    <ArticleShell outline={[]}>
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
            { name: "Blog", path: "/blog" },
            { name: item.title, path: `/blog/${item.slug}` },
          ]),
        ]}
      />

      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog" },
          { label: item.title },
        ]}
      />

      <ArticleHeader
        kicker="Announcement"
        title={item.title}
        publishedAt={item.created_at}
        updatedAt={item.updated_at}
        readingTime={readingTimeLabel(item.body, item.blocks)}
        viewCount={item.view_count}
        commentCount={commentCount}
      />

      {item.body ? (
        /*
         * Preformatted text, not Markdown — the same call /learn/[slug]
         * makes, for the same reason: no parser, no sanitiser, no new
         * dependency, and nothing an author types becomes HTML. Both swap
         * together when authored content needs headings and links.
         */
        <div className="reading mt-10 whitespace-pre-wrap">
          {item.body}
        </div>
      ) : null}

      <ArticleFooter
        url={`${siteUrl}/blog/${item.slug}`}
        title={item.title}
        tags={tags}
        action={
          <>
            <AppreciateButton
              target={target}
              count={appreciation.count}
              mine={appreciation.mine}
              returnTo={`/blog/${item.slug}`}
            />
            <BookmarkButton
              targetType="content"
              targetId={item.id}
              bookmarked={bookmarked}
              returnTo={`/blog/${item.slug}`}
            />
          </>
        }
      />

      <CommentThread
        target={target}
        returnTo={`/blog/${item.slug}`}
        comments={comments}
        signedIn={Boolean(auth.user)}
      />

      <ArticleDock
        target={target}
        returnTo={`/blog/${item.slug}`}
        appreciations={appreciation.count}
        appreciated={appreciation.mine}
        commentCount={commentCount}
        url={`${siteUrl}/blog/${item.slug}`}
        title={item.title}
      />
    </ArticleShell>
  );
}
