import type { Metadata } from "next";
import Link from "next/link";

import { ResourceCard } from "@/components/features/resource/ResourceCard";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/integrations/supabase/server";
import { listContent } from "@/lib/queries/content";
import { contentView } from "@/lib/resource-view";

export const metadata: Metadata = {
  title: "Docs",
  description:
    "How Viberation itself works: help for visitors and members, and guides for contributors and partners as they arrive.",
};

/**
 * The documentation hub (VIB-104), the utility bar's second destination.
 *
 * §28 defines this precisely, and it is not a new system: user-facing docs
 * are the `content` table's `help_article` and `role_guide` rows, surfaced in
 * their own IA section, "distinct from Learn (which teaches vibe-coding, not
 * the platform)". CLAUDE.md and lib/learn.ts say "no separate docs system" —
 * still true. There is no second store, no Nextra, no second editor. This is
 * a view.
 *
 * Phasing, also from §28: end-user help at MVP, author and admin guides at
 * Phase 1.5, seller docs at v2.0. The later audiences are signposted rather
 * than hidden, the same way the app shell signposts its Phase 1.5 hubs —
 * absent reads as a broken taxonomy, "coming with contributors" reads as a
 * plan.
 */
const AUDIENCE_SECTIONS = [
  {
    key: "enduser",
    title: "For visitors and members",
    blurb:
      "Using the site: accounts, bookmarks, the directory, the wizard, and what a free account changes.",
    live: true,
  },
  {
    key: "author",
    title: "For contributors",
    blurb:
      "Writing and publishing on Viberation. Arrives when contributor accounts do.",
    live: false,
  },
  {
    key: "seller",
    title: "For partners",
    blurb:
      "Listing and selling through Viberation. Arrives with the marketplace.",
    live: false,
  },
] as const;

export default async function DocsPage() {
  const supabase = await createClient();

  /*
   * Only `help_article` here. `role_guide` rows exist in the schema for the
   * later audiences, and there are none yet — querying for them would return
   * an empty list and say nothing that the signpost below does not say
   * better.
   */
  const { items } = await listContent(supabase, {
    types: ["help_article"],
    sort: "title",
    pageSize: 100,
  });

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-14">
      <header>
        <p className="text-primary flex items-center gap-2.5 text-xs font-bold tracking-widest uppercase">
          <span aria-hidden className="bg-primary h-0.5 w-5 rounded-full" />
          Documentation
        </p>
        <h1 className="font-heading mt-3.5 text-3xl font-bold tracking-[-0.04em] lg:text-4xl">
          Docs
        </h1>
        <p className="text-muted-foreground mt-3.5 max-w-[60ch] text-lg leading-relaxed">
          How Viberation itself works. If you are looking for how to{" "}
          <em>build</em> things rather than how to use this site, that is the{" "}
          <Link
            href="/learn"
            className="text-primary font-semibold hover:underline"
          >
            Learn hub
          </Link>
          .
        </p>
      </header>

      <div className="mt-12 space-y-14">
        {AUDIENCE_SECTIONS.map((section) => (
          <section key={section.key}>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-heading text-xl font-bold tracking-tight">
                {section.title}
              </h2>
              {section.live ? (
                <Badge variant="secondary">{items.length}</Badge>
              ) : (
                <Badge variant="outline">Coming later</Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-2 max-w-[60ch]">
              {section.blurb}
            </p>

            {section.live ? (
              items.length ? (
                <ul className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {items.map((item) => (
                    <li key={item.id}>
                      <ResourceCard {...contentView(item)} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground mt-6 text-sm">
                  Nothing written yet.
                </p>
              )
            ) : null}
          </section>
        ))}
      </div>

      <section className="bg-secondary mt-16 rounded-2xl p-8">
        <h2 className="font-heading text-lg font-bold tracking-tight">
          Cannot find what you need?
        </h2>
        <p className="text-muted-foreground mt-2 max-w-[60ch]">
          Email{" "}
          <a
            href="mailto:hello@viberation.dev"
            className="text-primary font-semibold hover:underline"
          >
            hello@viberation.dev
          </a>{" "}
          and the answer will usually end up on this page afterwards.
        </p>
      </section>
    </main>
  );
}
