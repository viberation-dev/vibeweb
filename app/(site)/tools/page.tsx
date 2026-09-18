import { IconSearch } from "@tabler/icons-react";
import type { Metadata } from "next";
import Link from "next/link";

import { BookmarkButton } from "@/components/features/bookmarks/BookmarkButton";
import { DirectoryPager } from "@/components/features/resource/DirectoryPager";
import { ResourceCard } from "@/components/features/resource/ResourceCard";
import { CategoryGuide } from "@/components/features/tools/CategoryGuide";
import { CategoryIcon } from "@/components/features/tools/CategoryIcon";
import { ToolIcon } from "@/components/features/tools/ToolIcon";
import { DirectoryFilters } from "@/components/features/tools/DirectoryFilters";
import { buttonVariants } from "@/components/ui/button";
import { getOpenRouterModels } from "@/lib/integrations/openrouter";
import { createClient } from "@/lib/integrations/supabase/server";
import { CATEGORY_GUIDES } from "@/lib/category-guides";
import { familyLine, familyMembers } from "@/lib/model-facts";
import { toPageNumber } from "@/lib/pagination";
import { listBookmarks } from "@/lib/queries/bookmarks";
import { cardBadges } from "@/lib/card-badges";
import { listCategoryTags } from "@/lib/queries/tags";
import { getToolTagsByIds, listTools, type Tool } from "@/lib/queries/tools";
import { normaliseQuery } from "@/lib/search-query";
import { toPricingFilter } from "@/lib/tool-facts";
import {
  CATEGORY_BLURBS,
  CATEGORY_GROUPS,
  TOOL_CATEGORIES,
  toToolCategory,
  toolCategoryLabel,
} from "@/lib/tool-categories";
import { getSkillCardLines } from "@/lib/skill-live";
import { skillCardExtras } from "@/lib/skill-taxonomy";
import { toToolSort } from "@/lib/tool-sorts";
import { toolsHref } from "@/lib/tools-url";

export const metadata: Metadata = {
  title: "Tools",
  description:
    "Find the AI tool that fits what you are building. Models, agents, IDEs, CLIs and MCP servers, with honest tradeoffs and labelled affiliate links.",
};

/** Tools per category row: one line of the three-column grid. */
const ROW_SIZE = 3;

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

  /*
   * Unfiltered, the directory is one row per category rather than one long
   * grid (VIB-179): a reader starts from what kind of thing they need, and
   * each row's "See all" is the filtered grid. Any filter drops back to the
   * grid and pager.
   */
  const browsing = !category && !tag && !q && !pricing;

  const [result, tags, bookmarks] = await Promise.all([
    listTools(
      supabase,
      browsing
        ? // ponytail: fetches every tool to fill the rows and count each
          // category in one round trip. Fine at a few hundred rows; switch
          // to a per-category query or a counts view past a few thousand.
          { sort, pageSize: 1000 }
        : { category, tag, sort, q, pricing, page },
    ),
    listCategoryTags(supabase, category),
    // Signed-out visitors still see Save buttons; pressing one sends them to
    // sign in. Only which ones read as saved needs a user.
    auth.user ? listBookmarks(supabase, auth.user.id, "tool") : [],
  ]);

  const { total, pageCount } = result;

  const rows = browsing
    ? CATEGORY_GROUPS.map((group) => ({
        label: group.label,
        categories: group.categories
          .map((value) => {
            const all = result.tools.filter((t) => t.category === value);
            return { value, count: all.length, tools: all.slice(0, ROW_SIZE) };
          })
          .filter((row) => row.count),
      })).filter((group) => group.categories.length)
    : [];

  // Only the cards actually on screen need their tags, specs and install counts.
  const tools = browsing
    ? rows.flatMap((g) => g.categories.flatMap((row) => row.tools))
    : result.tools;

  const [toolTags, liveModels, skillLines] = await Promise.all([
    // One round trip for the whole grid's tag pills rather than one per card.
    getToolTagsByIds(
      supabase,
      tools.map((tool) => tool.id),
    ),
    // Only when this page shows a model with live specs; cached for an hour
    // and empty rather than throwing when OpenRouter is down (VIB-107).
    tools.some((tool) => tool.openrouter_family) ? getOpenRouterModels() : null,
    // "881K installs · 176K stars" for skill cards (VIB-130); empty map when
    // this page has no skills, and missing lines rather than errors.
    getSkillCardLines(tools),
  ]);

  /** "15 models · from $0.25 per 1M" for a model family's card; undefined otherwise. */
  const familyFor = (family: string | null) =>
    family && liveModels
      ? familyLine(
          familyMembers(liveModels.values(), family).map((m) => m.price.input),
        ) || undefined
      : undefined;

  const bookmarkedIds = new Set(
    bookmarks.map((bookmark) => bookmark.target_id),
  );
  // Come back to this exact filtered page after a signed-out visitor logs in.
  const returnTo = toolsHref({ category, tag, sort, q, pricing, page });

  const card = (tool: Tool) => (
    <ResourceCard
      href={`/tools/${tool.slug}`}
      title={tool.name}
      icon={<ToolIcon tool={tool} className="size-4" />}
      description={tool.tagline}
      meta={familyFor(tool.openrouter_family) ?? skillLines.get(tool.id)}
      badges={
        // Hosts and app builders are chosen by price, trial and
        // what they do (VIB-141, VIB-142), so their cards carry
        // those instead.
        cardBadges(
          tool.category,
          tool.pricing_tier,
          toolTags.get(tool.id) ?? [],
          tool.category === "skills" ? skillCardExtras(tool) : [],
        ) ?? [
          toolCategoryLabel(tool.category),
          ...(toolTags.get(tool.id) ?? []).slice(0, 1).map((t) => `#${t.slug}`),
        ]
      }
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
  );

  return (
    <main className="mx-auto w-full max-w-6xl p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold">
            {category ? toolCategoryLabel(category) : "Find the right AI tool"}
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

      {/* First page only: a reader paging through already has the answer. */}
      {category && CATEGORY_GUIDES[category] && page === 1 ? (
        <CategoryGuide guide={CATEGORY_GUIDES[category]} />
      ) : null}

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

      {browsing ? (
        <div className="mt-8 space-y-12">
          {rows.map((group) => (
            <section key={group.label} aria-labelledby={`group-${group.label}`}>
              <h2
                id={`group-${group.label}`}
                className="text-muted-foreground text-xs font-bold tracking-widest uppercase"
              >
                {group.label}
              </h2>
              <div className="mt-4 space-y-8">
                {group.categories.map((row) => (
                  <div key={row.value}>
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <h3 className="font-heading flex items-center gap-2 text-lg font-semibold">
                          <CategoryIcon
                            category={row.value}
                            className="text-primary size-5"
                          />
                          {toolCategoryLabel(row.value)}
                        </h3>
                        <p className="text-muted-foreground mt-1 text-sm">
                          {CATEGORY_BLURBS[row.value]}
                        </p>
                      </div>
                      <Link
                        href={toolsHref({ category: row.value, sort })}
                        className="text-primary shrink-0 text-sm font-semibold hover:underline"
                      >
                        See all {row.count}
                        <span className="sr-only">
                          {" "}
                          {toolCategoryLabel(row.value)}
                        </span>{" "}
                        →
                      </Link>
                    </div>
                    <ul className="mt-4 grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {row.tools.map((tool) => (
                        <li key={tool.id}>{card(tool)}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : tools.length ? (
        <>
          <ul className="mt-6 grid items-start gap-4 sm:grid-cols-2">
            {tools.map((tool) => (
              <li key={tool.id}>{card(tool)}</li>
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
