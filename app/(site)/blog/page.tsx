import type { Metadata } from "next";
import Link from "next/link";

import { DirectoryPager } from "@/components/features/resource/DirectoryPager";
import { readingMinutes } from "@/lib/home-feed";
import { createClient } from "@/lib/integrations/supabase/server";
import { toPageNumber } from "@/lib/pagination";
import { listContent } from "@/lib/queries/content";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Product news from Viberation. What shipped, what changed, and what is coming next.",
};

/**
 * The announcements stream (VIB-106), the utility bar's first destination.
 *
 * VIB-104 shipped this as a dated view of the editorial rows and flagged the
 * guess: §28 has no "Blog" entry, and the word came from the demo5 utility
 * bar. Ali settled it — Blog is announcements, news about the product, and
 * the teaching material stays in the Learn hub where it belongs.
 *
 * Same `content` table, its own type. See lib/learn.ts for why announcements
 * are not a second store.
 */
type Props = { searchParams: Promise<{ page?: string }> };

export default async function BlogPage({ searchParams }: Props) {
  const { page } = await searchParams;

  const supabase = await createClient();
  const {
    items,
    pageCount,
    total,
    page: current,
  } = await listContent(supabase, {
    types: ["announcement"],
    sort: "latest",
    page: toPageNumber(page),
  });

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-14">
      <header>
        <p className="text-primary flex items-center gap-2.5 text-xs font-bold tracking-widest uppercase">
          <span aria-hidden className="bg-primary h-0.5 w-5 rounded-full" />
          Announcements
        </p>
        <h1 className="font-heading mt-3.5 text-3xl font-bold tracking-[-0.04em] lg:text-4xl">
          Blog
        </h1>
        <p className="text-muted-foreground mt-3.5 text-lg leading-relaxed">
          What shipped, what changed, and what is coming next. Short posts, only
          when there is something to say.
        </p>
      </header>

      {items.length ? (
        <>
          <ul className="mt-12 space-y-10">
            {items.map((item) => {
              const minutes = readingMinutes(item.body);
              return (
                <li key={item.id} className="border-border border-b pb-10">
                  <p className="text-muted-foreground font-mono text-sm">
                    <time dateTime={item.created_at}>
                      {formatPostDate(item.created_at)}
                    </time>
                    {minutes ? ` · ${minutes} min read` : ""}
                  </p>
                  <h2 className="font-heading mt-3 text-2xl font-bold tracking-tight">
                    <Link
                      href={`/blog/${item.slug}`}
                      className="hover:text-primary transition-colors"
                    >
                      {item.title}
                    </Link>
                  </h2>
                  {item.body ? (
                    <p className="text-muted-foreground mt-3 leading-relaxed">
                      {excerpt(item.body)}
                    </p>
                  ) : null}
                  <Link
                    href={`/blog/${item.slug}`}
                    className="text-primary mt-4 inline-block text-sm font-bold hover:underline"
                  >
                    Read it &rarr;
                  </Link>
                </li>
              );
            })}
          </ul>
          <DirectoryPager
            page={current}
            pageCount={pageCount}
            total={total}
            itemLabel="posts"
            href={(next) => (next === 1 ? "/blog" : `/blog?page=${next}`)}
          />
        </>
      ) : (
        /*
          Empty is the honest state today, and stays that way until the first
          announcement is written. Before VIB-106 this page listed thirteen
          articles, but they were never announcements — pointing at where they
          actually live beats padding this out with them.
        */
        <div className="bg-secondary mt-12 rounded-2xl p-8">
          <h2 className="font-heading text-lg font-bold tracking-tight">
            Nothing announced yet
          </h2>
          <p className="text-muted-foreground mt-2 leading-relaxed">
            Product news lands here as it happens. In the meantime,{" "}
            <Link
              href="/changelog"
              className="text-primary font-semibold hover:underline"
            >
              the changelog
            </Link>{" "}
            lists everything that has shipped, and{" "}
            <Link
              href="/learn"
              className="text-primary font-semibold hover:underline"
            >
              the Learn hub
            </Link>{" "}
            has the guides and articles.
          </p>
        </div>
      )}
    </main>
  );
}

/** "11 September 2026" in UTC, so the date cannot slip a day between readers. */
function formatPostDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

/** First paragraph, trimmed. `content` has no summary column to read. */
function excerpt(body: string): string {
  const first = body
    .trim()
    .split(/\n\s*\n/)[0]
    .replace(/[#*_>`]/g, "")
    .trim();
  return first.length > 220 ? `${first.slice(0, 217).trimEnd()}…` : first;
}
