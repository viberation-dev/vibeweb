import { IconSearch } from "@tabler/icons-react";
import type { Metadata } from "next";

import { BookmarkButton } from "@/components/features/bookmarks/BookmarkButton";
import { DirectoryPager } from "@/components/features/resource/DirectoryPager";
import { ResourceCard } from "@/components/features/resource/ResourceCard";
import { CategoryIcon } from "@/components/features/tools/CategoryIcon";
import { DirectoryFilters } from "@/components/features/tools/DirectoryFilters";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/integrations/supabase/server";
import { toPageNumber } from "@/lib/pagination";
import { listBookmarks } from "@/lib/queries/bookmarks";
import { listTags } from "@/lib/queries/tags";
import { getToolTagsByIds, listTools } from "@/lib/queries/tools";
import { normaliseQuery } from "@/lib/search-query";
import { toPricingFilter } from "@/lib/tool-facts";
import {
  TOOL_CATEGORIES,
  toToolCategory,
  toolCategoryLabel,
} from "@/lib/tool-categories";
import { toToolSort } from "@/lib/tool-sorts";
import { toolsHref } from "@/lib/tools-url";

export const metadata: Metadata = {
  title: "Tools — Viberation",
  description:
    "A curated directory of AI tools for vibe coders — models, agents, IDEs, CLIs, MCP servers and more.",
};

type Props = {
  searchParams: Promise<{
    category?: string;
    tag?: string;
    sort?: string;
    q?: string;
    pricing?: string;
    page?: string;
  }>;
};

/** Tools directory (VIB-80, mockup screen 3). */
export default async function ToolsPage({ searchParams }: Props) {
  const params = await searchParams;
  // Unknown category values are dropped rather than 404'd: a stale or
  // hand-edited URL should still show the directory, not an error.
  const category = toToolCategory(params.category);
  const tag = params.tag?.trim() || undefined;
  const sort = toToolSort(params.sort);
  // Shares the site-wide trim-and-cap so a pasted essay cannot become
  // database work here either.
  const q = normaliseQuery(params.q) || undefined;
  const pricing = toPricingFilter(params.pricing);
  const page = toPageNumber(params.page);

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();

  const [{ tools, total, pageCount }, tags, bookmarks] = await Promise.all([
    listTools(supabase, { category, tag, sort, q, pricing, page }),
    listTags(supabase),
    // Signed-out visitors still see Save buttons; pressing one sends them to
    // sign in. Only which ones read as saved needs a user.
    auth.user ? listBookmarks(supabase, auth.user.id, "tool") : [],
  ]);

  // One round trip for the whole grid's tag pills rather than one per card.
  const toolTags = await getToolTagsByIds(
    supabase,
    tools.map((tool) => tool.id),
  );

  const bookmarkedIds = new Set(
    bookmarks.map((bookmark) => bookmark.target_id),
  );
  // Come back to this exact filtered page after a signed-out visitor logs in.
  const returnTo = toolsHref({ category, tag, sort, q, pricing, page });

  return (
    <main className="mx-auto w-full max-w-6xl p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold">
            {category ? toolCategoryLabel(category) : "Explore tools"}
          </h1>
          {/*
            Real counts, queried — not the mockup's "46 tools", which predates
            the seed. A hero stat that contradicts the grid underneath it is
            worse than no stat.

            The "across N categories" half only holds for the unfiltered
            directory: with any filter applied the number describes a subset,
            and "1 tool across 13 categories" is a sentence that is not true.
          */}
          <p className="text-muted-foreground mt-1 text-sm">
            {total} {total === 1 ? "tool" : "tools"}
            {category || tag || q || pricing
              ? ""
              : ` across ${TOOL_CATEGORIES.length} categories`}
          </p>
        </div>

        {/*
          Scoped to this table, unlike the header's site-wide search. A GET
          form so it needs no JavaScript, and the hidden inputs carry the
          active filters through rather than silently clearing them.
        */}
        <form
          method="get"
          action="/tools"
          role="search"
          className="w-full sm:w-72"
        >
          <label htmlFor="filter-tools" className="sr-only">
            Filter within tools
          </label>
          <div className="focus-within:border-ring flex items-center gap-2 rounded-md border px-3 py-1.5">
            <IconSearch
              aria-hidden
              className="text-muted-foreground size-4 shrink-0"
            />
            <input
              id="filter-tools"
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Filter within tools…"
              className="placeholder:text-muted-foreground w-full bg-transparent text-sm outline-none"
            />
          </div>
          {category ? (
            <input type="hidden" name="category" value={category} />
          ) : null}
          {tag ? <input type="hidden" name="tag" value={tag} /> : null}
          {sort ? <input type="hidden" name="sort" value={sort} /> : null}
          {pricing ? (
            <input type="hidden" name="pricing" value={pricing} />
          ) : null}
        </form>
      </div>

      <div className="mt-6">
        <DirectoryFilters
          category={category}
          tag={tag}
          sort={sort}
          q={q}
          pricing={pricing}
          tags={tags}
        />
      </div>

      {tools.length ? (
        <>
          <ul className="mt-6 grid items-start gap-4 sm:grid-cols-2">
            {tools.map((tool) => (
              <li key={tool.id}>
                <ResourceCard
                  href={`/tools/${tool.slug}`}
                  title={tool.name}
                  icon={
                    <CategoryIcon
                      category={tool.category}
                      className="text-primary size-4"
                    />
                  }
                  description={tool.tagline}
                  badges={[
                    toolCategoryLabel(tool.category),
                    ...(toolTags.get(tool.id) ?? [])
                      .slice(0, 1)
                      .map((t) => `#${t.slug}`),
                  ]}
                  action={
                    <>
                      <BookmarkButton
                        targetType="tool"
                        targetId={tool.id}
                        bookmarked={bookmarkedIds.has(tool.id)}
                        returnTo={returnTo}
                      />
                      {/*
                        Through /go/[slug] (VIB-52), never straight to the
                        vendor — a direct link loses the click and the
                        affiliate attribution with it. The outbound variant
                        keeps it visually distinct from in-product actions.
                      */}
                      <a
                        href={`/go/${tool.slug}`}
                        rel="sponsored noopener"
                        target="_blank"
                        className={buttonVariants({
                          variant: "outbound",
                          size: "sm",
                        })}
                      >
                        Visit ↗
                      </a>
                    </>
                  }
                />
              </li>
            ))}
          </ul>
          <DirectoryPager
            page={page}
            pageCount={pageCount}
            total={total}
            itemLabel="tools"
            href={(next) =>
              toolsHref({ category, tag, sort, q, pricing, page: next })
            }
          />
        </>
      ) : (
        <p className="text-muted-foreground mt-8">
          {page > 1
            ? "That page is past the end of the results. Try going back to the first page."
            : q
              ? `Nothing matches “${q}”. Try a different word, or clear the filter.`
              : "Nothing matches that filter yet. Try clearing the tag or picking another category."}
        </p>
      )}
    </main>
  );
}
