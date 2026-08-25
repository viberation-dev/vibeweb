import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/integrations/supabase/server";
import { getToolBySlug, getToolTags } from "@/lib/queries/tools";
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

      {tool.outbound_url ? (
        <a
          // ponytail: links straight out for now. The tracked /go/[slug]
          // redirect is its own launch-prep slice; swapping the href there is
          // the whole change.
          href={tool.outbound_url}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className={buttonVariants({ size: "lg", className: "mt-6" })}
        >
          Visit {tool.name}
        </a>
      ) : null}

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
