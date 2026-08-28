import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { after } from "next/server";

import { BookmarkButton } from "@/components/features/bookmarks/BookmarkButton";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/integrations/supabase/server";
import { outboundRel, safeOutboundUrl } from "@/lib/outbound";
import { isBookmarked } from "@/lib/queries/bookmarks";
import { recordVisit } from "@/lib/queries/history";
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

  /*
   * Two waves, not four. The row and the session do not depend on each other,
   * and neither do the tags and the saved state — issuing them serially cost
   * two extra Supabase round trips per view, which is the whole page budget
   * when the database is a continent away (VIB-56).
   */
  const [tool, { data: auth }] = await Promise.all([
    getToolBySlug(supabase, slug),
    supabase.auth.getUser(),
  ]);

  if (!tool) {
    notFound();
  }

  /*
   * Signed-out visitors still see the button — pressing it sends them to
   * sign in and back. Only the saved/unsaved state needs a user.
   */
  const [tags, bookmarked] = await Promise.all([
    getToolTags(supabase, tool.id),
    auth.user
      ? isBookmarked(supabase, auth.user.id, { targetType: "tool", targetId: tool.id })
      : Promise.resolve(false),
  ]);

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
  after(async () => {
    await incrementToolViews(supabase, tool.slug);
    if (auth.user) {
      await recordVisit(supabase, auth.user.id, { targetType: "tool", targetId: tool.id });
    }
  });

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
        {safeOutboundUrl(tool.outbound_url) ? (
          <a
            // Through /go, never straight out — §06: the click has to be
            // logged before the visitor leaves, and a plain href cannot be.
            href={`/go/${tool.slug}`}
            target="_blank"
            rel={outboundRel(tool.is_affiliate)}
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

      {/*
        The disclosure sits next to the link it describes, not only on
        /terms (VIB-57). FTC guidance is that a material connection should be
        disclosed clearly and close to the link, where someone decides whether
        to click — a separate legal page is the backstop, not the disclosure.

        Shown only when the tool actually is an affiliate link. Saying "we may
        earn a commission" under a link that earns nothing is its own kind of
        inaccurate, and it would train readers to ignore the line on the links
        where it counts.
      */}
      {tool.is_affiliate && safeOutboundUrl(tool.outbound_url) ? (
        <p className="mt-3 text-sm text-muted-foreground">
          We may earn a commission if you sign up through this link, at no extra cost to
          you. It never affects whether or how a tool is listed —{" "}
          <Link className="underline underline-offset-4" href="/terms#affiliate-disclosure">
            how this works
          </Link>
          .
        </p>
      ) : null}

      {tags.length ? (
        <div className="mt-8 flex flex-wrap items-center gap-2 border-t pt-6">
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
