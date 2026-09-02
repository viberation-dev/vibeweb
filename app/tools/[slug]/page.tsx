import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { after } from "next/server";

import { BookmarkButton } from "@/components/features/bookmarks/BookmarkButton";
import { CategoryIcon } from "@/components/features/tools/CategoryIcon";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/integrations/supabase/server";
import { outboundRel, safeOutboundUrl } from "@/lib/outbound";
import { isBookmarked } from "@/lib/queries/bookmarks";
import { countCollectionsContaining } from "@/lib/queries/collections";
import { recordVisit } from "@/lib/queries/history";
import {
  getToolBySlug,
  getToolTags,
  incrementToolViews,
  listTools,
  type Tool,
} from "@/lib/queries/tools";
import { toolCategoryLabel } from "@/lib/tool-categories";
import { hasFreeTier, isOpenSource } from "@/lib/tool-facts";
import { toolsHref } from "@/lib/tools-url";

type Props = { params: Promise<{ slug: string }> };

/** Related tools shown under the overview. Four fills two rows of two. */
const RELATED_LIMIT = 4;

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

/** Tool detail (VIB-81, mockup screen 4). */
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
  const [tags, bookmarked, collectionCount, { tools: sameCategory }] = await Promise.all([
    getToolTags(supabase, tool.id),
    auth.user
      ? isBookmarked(supabase, auth.user.id, { targetType: "tool", targetId: tool.id })
      : Promise.resolve(false),
    countCollectionsContaining(supabase, { targetType: "tool", targetId: tool.id }),
    // One extra so removing this tool from its own related list still fills it.
    listTools(supabase, { category: tool.category, pageSize: RELATED_LIMIT + 1 }),
  ]);

  const related = sameCategory.filter((other) => other.id !== tool.id).slice(0, RELATED_LIMIT);
  const tagSlugs = new Set(tags.map((tag) => tag.slug));
  const outbound = safeOutboundUrl(tool.outbound_url);

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
    <main className="mx-auto w-full max-w-6xl p-6">
      <nav aria-label="Breadcrumb" className="text-muted-foreground text-sm">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/tools" className="hover:underline">
              Tools
            </Link>
          </li>
          <li aria-hidden className="opacity-50">
            ›
          </li>
          <li>
            <Link href={toolsHref({ category: tool.category })} className="hover:underline">
              {toolCategoryLabel(tool.category)}
            </Link>
          </li>
          <li aria-hidden className="opacity-50">
            ›
          </li>
          <li aria-current="page" className="text-foreground">
            {tool.name}
          </li>
        </ol>
      </nav>

      <div className="mt-4 flex items-center gap-3">
        <span className="bg-muted flex size-11 shrink-0 items-center justify-center rounded-xl">
          <CategoryIcon category={tool.category} className="text-primary size-6" />
        </span>
        <div>
          <h1 className="font-heading text-2xl font-semibold">{tool.name}</h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <Link href={toolsHref({ category: tool.category })}>
              <Badge variant="secondary">{toolCategoryLabel(tool.category)}</Badge>
            </Link>
            {tags.map((tag) => (
              <Link key={tag.id} href={`/tags/${tag.slug}`}>
                <Badge variant="outline">#{tag.slug}</Badge>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div>
          {tool.tagline ? (
            <p className="text-muted-foreground text-lg">{tool.tagline}</p>
          ) : null}
          {tool.description ? (
            <p className="mt-3 leading-relaxed whitespace-pre-line">{tool.description}</p>
          ) : null}

          <h2 className="font-heading mt-8 text-lg font-medium">Key info</h2>
          {/*
            Pricing and Category only. The mockup also lists Platform and
            "Best for", and `tools` has no column for either — inventing
            "macOS · Windows · Linux" from nothing would be worse than
            leaving the row out. Tracked separately.
          */}
          <dl className="mt-3">
            {tool.pricing_tier ? <Fact label="Pricing" value={tool.pricing_tier} /> : null}
            <Fact label="Category" value={toolCategoryLabel(tool.category)} />
          </dl>

          {related.length ? (
            <>
              <h2 className="font-heading mt-8 text-lg font-medium">
                More in {toolCategoryLabel(tool.category)}
              </h2>
              <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                {related.map((other) => (
                  <li key={other.id}>
                    <RelatedCard tool={other} />
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>

        {/* Action rail — affiliate CTA + bookmark. */}
        <aside aria-label="Actions" className="bg-muted/40 h-fit rounded-xl border p-4">
          {outbound ? (
            <>
              <a
                // Through /go, never straight out — §06: the click has to be
                // logged before the visitor leaves, and a plain href cannot be.
                href={`/go/${tool.slug}`}
                target="_blank"
                rel={outboundRel(tool.is_affiliate)}
                className={buttonVariants({ variant: "outbound", size: "lg", className: "w-full" })}
              >
                Visit {tool.name} ↗
              </a>
              <p className="text-muted-foreground mt-1.5 text-center text-xs">
                Tracked link · /go/{tool.slug}
              </p>
            </>
          ) : null}

          <div className="mt-3">
            <BookmarkButton
              targetType="tool"
              targetId={tool.id}
              bookmarked={bookmarked}
              returnTo={`/tools/${tool.slug}`}
            />
          </div>
          {auth.user ? null : (
            <p className="text-muted-foreground mt-1.5 text-center text-xs">
              Sign in to save this for later.
            </p>
          )}

          <dl className="mt-4 border-t pt-3">
            {/*
              Derived from pricing_tier, not from the free-tier/open-source
              tags. The tags are partial curation: 13 of 26 tools would have
              claimed "Free tier: No" incorrectly. See lib/tool-facts.ts.
            */}
            <Fact label="Free tier" value={hasFreeTier(tool.pricing_tier) ? "Yes" : "No"} />
            <Fact
              label="Open source"
              value={isOpenSource(tool.pricing_tier, tagSlugs) ? "Yes" : "No"}
            />
            <Fact label="In collections" value={String(collectionCount)} />
          </dl>

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
          {tool.is_affiliate && outbound ? (
            <p className="text-muted-foreground mt-4 border-t pt-3 text-xs">
              We may earn a commission if you sign up through this link, at no extra cost to you. It
              never affects whether or how a tool is listed —{" "}
              <Link className="underline underline-offset-4" href="/terms#affiliate-disclosure">
                how this works
              </Link>
              .
            </p>
          ) : null}
        </aside>
      </div>
    </main>
  );
}

/** One label/value row in the key-info and rail lists. */
function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b py-2 last:border-b-0">
      <dt className="text-muted-foreground text-sm">{label}</dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  );
}

function RelatedCard({ tool }: { tool: Tool }) {
  return (
    <Card className="hover:bg-muted/40 relative h-full transition-colors">
      <CardHeader>
        <CardTitle className="text-base">
          <Link href={`/tools/${tool.slug}`} className="outline-none after:absolute after:inset-0">
            {tool.name}
          </Link>
        </CardTitle>
        {tool.tagline ? (
          <p className="text-muted-foreground mt-1 text-sm">{tool.tagline}</p>
        ) : null}
        <Badge variant="secondary" className="mt-2 w-fit">
          {toolCategoryLabel(tool.category)}
        </Badge>
      </CardHeader>
    </Card>
  );
}
