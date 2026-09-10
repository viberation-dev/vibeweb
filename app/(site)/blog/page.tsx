import type { Metadata } from "next";
import Link from "next/link";

import { DirectoryPager } from "@/components/features/resource/DirectoryPager";
import { ResourceCard } from "@/components/features/resource/ResourceCard";
import { createClient } from "@/lib/integrations/supabase/server";
import { toPageNumber } from "@/lib/pagination";
import { listContent } from "@/lib/queries/content";
import { contentView } from "@/lib/resource-view";
import type { ContentType } from "@/lib/learn";

export const metadata: Metadata = {
  title: "Blog — Viberation",
  description:
    "Everything written on Viberation, newest first — guides, articles, cheatsheets and courses.",
};

/**
 * The blog archive (VIB-104), the utility bar's first destination.
 *
 * A second *view* of `content`, not a second store. The Learn hub browses the
 * same rows by pillar, level and type; this lists them by date and nothing
 * else, which is what an archive is for — "what has been written lately"
 * rather than "find me something on prompt engineering".
 *
 * Worth knowing: §28's feature list has no "Blog" entry. The word arrives
 * from the demo5 utility bar rather than from Viberation's own IA. If Blog
 * should be a distinct stream (company news, say) rather than a dated view of
 * the editorial content, that is a content-model decision and this page is
 * the wrong answer to it.
 */
const BLOG_TYPES: ContentType[] = [
  "article",
  "guide",
  "cheatsheet",
  "course_link",
];

type Props = { searchParams: Promise<{ page?: string }> };

export default async function BlogPage({ searchParams }: Props) {
  const { page } = await searchParams;

  const supabase = await createClient();
  const { items, pageCount, total, page: current } = await listContent(supabase, {
    /*
     * Help articles are excluded: they are product documentation and live in
     * the Docs hub. An archive of "everything we wrote" that includes "How to
     * reset your password" is not an archive anyone wants to read.
     */
    types: BLOG_TYPES,
    sort: "latest",
    page: toPageNumber(page),
  });

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-14">
      <header>
        <p className="text-primary flex items-center gap-2.5 text-xs font-bold tracking-widest uppercase">
          <span aria-hidden className="bg-primary h-0.5 w-5 rounded-full" />
          The archive
        </p>
        <h1 className="font-heading mt-3.5 text-3xl font-bold tracking-[-0.04em] lg:text-4xl">
          Blog
        </h1>
        <p className="text-muted-foreground mt-3.5 max-w-[60ch] text-lg leading-relaxed">
          Everything written, newest first. To browse by topic or level
          instead, the{" "}
          <Link href="/learn" className="text-primary font-semibold hover:underline">
            Learn hub
          </Link>{" "}
          is the same writing, sorted properly.
        </p>
      </header>

      {items.length ? (
        <>
          <ul className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <li key={item.id}>
                <ResourceCard {...contentView(item)} />
              </li>
            ))}
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
        <p className="text-muted-foreground mt-10">
          Nothing published yet.
        </p>
      )}
    </main>
  );
}
