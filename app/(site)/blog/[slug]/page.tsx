import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { after } from "next/server";

import { BookmarkButton } from "@/components/features/bookmarks/BookmarkButton";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/integrations/supabase/server";
import { isBookmarked } from "@/lib/queries/bookmarks";
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
  return { title: item.title };
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

  const [tags, bookmarked] = await Promise.all([
    getContentTags(supabase, item.id),
    auth.user
      ? isBookmarked(supabase, auth.user.id, {
          targetType: "content",
          targetId: item.id,
        })
      : Promise.resolve(false),
  ]);

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
    <main className="mx-auto w-full max-w-3xl px-6 py-14">
      <Link
        href="/blog"
        className="text-muted-foreground text-sm hover:underline"
      >
        &larr; All announcements
      </Link>

      <p className="text-muted-foreground mt-6 font-mono text-sm">
        <time dateTime={item.created_at}>
          {new Intl.DateTimeFormat("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
            timeZone: "UTC",
          }).format(new Date(item.created_at))}
        </time>
      </p>

      <h1 className="font-heading mt-3 text-3xl font-bold tracking-[-0.04em] lg:text-4xl">
        {item.title}
      </h1>

      {item.body ? (
        /*
         * Preformatted text, not Markdown — the same call /learn/[slug]
         * makes, for the same reason: no parser, no sanitiser, no new
         * dependency, and nothing an author types becomes HTML. Both swap
         * together when authored content needs headings and links.
         */
        <div className="mt-8 leading-relaxed whitespace-pre-wrap">
          {item.body}
        </div>
      ) : null}

      <div className="mt-10 flex flex-wrap items-center gap-3 border-t pt-6">
        <BookmarkButton
          targetType="content"
          targetId={item.id}
          bookmarked={bookmarked}
          returnTo={`/blog/${item.slug}`}
        />
      </div>

      {tags.length ? (
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground text-sm">Tagged</span>
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
