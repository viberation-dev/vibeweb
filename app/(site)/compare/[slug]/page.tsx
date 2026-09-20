import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/features/seo/JsonLd";
import { ToolIcon } from "@/components/features/tools/ToolIcon";
import { buttonVariants } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { compareRows } from "@/lib/compare";
import {
  getOpenRouterModels,
  type OpenRouterModel,
} from "@/lib/integrations/openrouter";
import { createClient } from "@/lib/integrations/supabase/server";
import {
  contextInPages,
  formatTokens,
  formatUsd,
  modelDisplayName,
} from "@/lib/model-facts";
import { outboundRel, safeOutboundUrl } from "@/lib/outbound";
import { getComparisonBySlug } from "@/lib/queries/comparisons";
import type { Tool } from "@/lib/queries/tools";
import {
  breadcrumbLd,
  plainSummary,
  softwareApplicationLd,
} from "@/lib/structured-data";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const page = await getComparisonBySlug(supabase, slug);

  if (!page) {
    return { title: "Comparison not found" };
  }
  return {
    title: `${page.tool_a.name} vs ${page.tool_b.name}`,
    description: plainSummary(page.intro),
  };
}

/** A curated "A vs B" page (VIB-184): editorial verdict over live directory facts. */
export default async function ComparePage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const page = await getComparisonBySlug(supabase, slug);

  if (!page) {
    notFound();
  }

  const { tool_a: a, tool_b: b } = page;
  const hasModels = page.models_a.length > 0 || page.models_b.length > 0;
  // Cached for an hour and empty rather than throwing (VIB-107): OpenRouter
  // being down costs the models table, never the page.
  const live = hasModels ? await getOpenRouterModels() : null;
  const pick = (ids: string[]) =>
    ids.flatMap((id) => (live?.get(id) ? [live.get(id)!] : []));
  const modelsA = pick(page.models_a);
  const modelsB = pick(page.models_b);
  const rows = compareRows(a, b);
  const updated = new Date(
    Math.max(Date.parse(page.updated_at), Date.parse(a.updated_at), Date.parse(b.updated_at)),
  );

  return (
    <main className="mx-auto w-full max-w-5xl p-6">
      <JsonLd
        data={[
          ...[a, b].map(softwareApplicationLd),
          breadcrumbLd([
            { name: "Compare", path: "/compare" },
            { name: `${a.name} vs ${b.name}`, path: `/compare/${page.slug}` },
          ]),
        ]}
      />

      <nav aria-label="Breadcrumb" className="text-muted-foreground text-sm">
        <Link href="/compare" className="hover:underline">
          Compare
        </Link>
      </nav>

      <h1 className="font-heading mt-3 text-3xl font-semibold tracking-tight">
        {a.name} vs {b.name}
      </h1>
      <p className="mt-4 max-w-3xl text-lg leading-relaxed">{page.intro}</p>
      <p className="text-muted-foreground mt-2 text-sm">
        Updated{" "}
        {updated.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Verdict tool={a} text={page.pick_a} />
        <Verdict tool={b} text={page.pick_b} />
      </div>

      <h2 className="font-heading mt-10 text-xl font-medium">Side by side</h2>
      {/* Columns wrap rather than scroll: a phone must see both sides at once. */}
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b">
              <th scope="col" className="w-1/4 py-2 pr-4 font-normal">
                <span className="sr-only">Fact</span>
              </th>
              <th scope="col" className="py-2 pr-4 font-heading font-semibold">
                <Link href={`/tools/${a.slug}`} className="hover:underline">
                  {a.name}
                </Link>
              </th>
              <th scope="col" className="py-2 font-heading font-semibold">
                <Link href={`/tools/${b.slug}`} className="hover:underline">
                  {b.name}
                </Link>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b last:border-b-0">
                <th scope="row" className="text-muted-foreground py-2 pr-4 align-top font-normal">
                  {row.label}
                </th>
                <td className="py-2 pr-4 align-top">{row.a}</td>
                <td className="py-2 align-top">{row.b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modelsA.length || modelsB.length ? (
        <>
          <h2 className="font-heading mt-10 text-xl font-medium">Top models</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Prices per 1M tokens through the API, live from OpenRouter. Chat
            app subscriptions are in the table above.
          </p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <ModelList tool={a} models={modelsA} />
            <ModelList tool={b} models={modelsB} />
          </div>
        </>
      ) : null}

      <div className="mt-10 flex flex-wrap gap-3">
        {[a, b].map((tool) =>
          safeOutboundUrl(tool.outbound_url) ? (
            <a
              key={tool.id}
              // Through /go, never straight out (§06): the click is logged first.
              href={`/go/${tool.slug}`}
              target="_blank"
              rel={outboundRel(tool.is_affiliate)}
              className={buttonVariants({ variant: "outbound", size: "lg" })}
            >
              Visit {tool.name} ↗
            </a>
          ) : null,
        )}
      </div>
      {a.is_affiliate || b.is_affiliate ? (
        <p className="text-muted-foreground mt-3 max-w-2xl text-xs">
          We may earn a commission if you sign up through one of these links, at
          no extra cost to you. It never affects the verdict.{" "}
          <Link className="underline underline-offset-4" href="/terms#affiliate-disclosure">
            How this works
          </Link>
          .
        </p>
      ) : null}
    </main>
  );
}

function Verdict({ tool, text }: { tool: Tool; text: string }) {
  return (
    <Panel className="h-full">
      <div className="flex items-center gap-3">
        <span className="bg-background text-primary flex size-10 shrink-0 items-center justify-center rounded-xl has-[img]:bg-white">
          <ToolIcon tool={tool} className="size-5" />
        </span>
        <h2 className="font-heading text-lg font-semibold">Pick {tool.name} if</h2>
      </div>
      <p className="mt-3 leading-relaxed">{text}</p>
      <Link href={`/tools/${tool.slug}`} className="mt-3 inline-block text-sm underline underline-offset-4">
        More about {tool.name}
      </Link>
    </Panel>
  );
}

function ModelList({ tool, models }: { tool: Tool; models: OpenRouterModel[] }) {
  return (
    <section aria-label={`${tool.name} models`} className="rounded-xl border p-4">
      <h3 className="font-heading font-semibold">{tool.name}</h3>
      {models.length ? (
        <ul className="mt-2 divide-y">
          {models.map((model) => (
            <li key={model.id} className="py-2">
              <Link
                href={`/tools/${tool.slug}?model=${model.id}`}
                className="text-sm font-medium hover:underline"
              >
                {modelDisplayName(model.name)}
              </Link>
              <p className="text-muted-foreground text-sm">
                {model.price.input !== null && model.price.output !== null
                  ? `${formatUsd(model.price.input)} in · ${formatUsd(model.price.output)} out`
                  : "Price not listed"}
                {model.contextLength
                  ? ` · ${formatTokens(model.contextLength)} memory, ${contextInPages(model.contextLength)}`
                  : ""}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground mt-2 text-sm">Model details are unavailable right now.</p>
      )}
    </section>
  );
}
