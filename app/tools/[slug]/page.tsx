import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { after } from "next/server";

import { BookmarkButton } from "@/components/features/bookmarks/BookmarkButton";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/integrations/supabase/server";
import { isBookmarked } from "@/lib/queries/bookmarks";
import { getToolBySlug, getToolTags, incrementToolViews } from "@/lib/queries/tools";
import { toolCategoryLabel } from "@/lib/tool-categories";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const tool = await getToolBySlug(supabase, slug);

  if (!tool) {
    return { title: "Tool not found — Viberation" };
  }
  return {
    title: `${tool.name} — Viberation`,
    description: tool.tagline ?? undefined,
  };
}

export default async function ToolPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const tool = await getToolBySlug(supabase, slug);

  if (!tool) {
    notFound();
  }

  const tags = await getToolTags(supabase, tool.id);

  /*
   * Signed-out visitors still see the button — pressing it sends them to
   * sign in and back. Only the saved/unsaved state needs a user.
   */
  const { data: auth } = await supabase.auth.getUser();
  const bookmarked = auth.user
    ? await isBookmarked(supabase, auth.user.id, { targetType: "tool", targetId: tool.id })
    : false;

  /*
   * after() runs once the response has been sent, so the counter never adds
   * latency to the page the visitor is waiting on, and a slow or failed
   * write cannot break the render.
   *
   * ponytail: this counts prefetches and crawlers as views. Fine for a
   * directory popularity signal; if view_count ever drives something that
   * matters, dedupe it against history_items (VIB-51) instead of guessing
   * at bot filtering here.
   */
  after(() => incrementToolViews(supabase, tool.slug));

  return (
    <main className="mx-auto w-full max-w-3xl p-6">
      <Link href="/tools" className="text-sm text-muted-foreground hover:underline">
        ← All tools
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Link href={`/tools?category=${tool.category}`}>
          <Badge variant="secondary">{toolCategoryLabel(tool.category)}</Badge>
        </Link>
        {tool.pricing_tier ? <Badge variant="outline">{tool.pricing_tier}</Badge> : null}
      </div>

      <h1 className="mt-3 font-heading text-3xl font-semibold">{tool.name}</h1>
      {tool.tagline ? <p className="mt-2 text-lg text-muted-foreground">{tool.tagline}</p> : null}

      {tool.description ? (
        <p className="mt-6 leading-relaxed whitespace-pre-line">{tool.description}</p>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {tool.outbound_url ? (
          <a
            // ponytail: links straight out for now. The tracked /go/[slug]
            // redirect is its own launch-prep slice; swapping the href there is
            // the whole change.
            href={tool.outbound_url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className={buttonVariants({ size: "lg" })}
          >
            Visit {tool.name}
          </a>
        ) : null}
        <BookmarkButton
          targetType="tool"
          targetId={tool.id}
          bookmarked={bookmarked}
          returnTo={`/tools/${tool.slug}`}
        />
      </div>

      {tags.length ? (
        <div className="mt-8 flex flex-wrap items-center gap-2 border-t pt-6">
          <span className="text-sm text-muted-foreground">Tagged</span>
          {tags.map((tag) => (
            <Link key={tag.id} href={`/tools?tag=${tag.slug}`}>
              <Badge variant="outline">{tag.name}</Badge>
            </Link>
          ))}
        </div>
      ) : null}
    </main>
  );
}
