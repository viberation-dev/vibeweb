import type { Metadata } from "next";

import { BookmarkButton } from "@/components/features/bookmarks/BookmarkButton";
import { ResourceCard } from "@/components/features/resource/ResourceCard";
import { DirectoryFilters } from "@/components/features/tools/DirectoryFilters";
import { DirectoryPager } from "@/components/features/tools/DirectoryPager";
import { createClient } from "@/lib/integrations/supabase/server";
import { listBookmarks } from "@/lib/queries/bookmarks";
import { listTags } from "@/lib/queries/tags";
import { listTools } from "@/lib/queries/tools";
import { toToolCategory, toolCategoryLabel } from "@/lib/tool-categories";
import { toToolSort } from "@/lib/tool-sorts";
import { toolsHref, toPageNumber } from "@/lib/tools-url";

export const metadata: Metadata = {
  title: "Tools — Viberation",
  description:
    "A curated directory of AI tools for vibe coders — models, agents, IDEs, CLIs, MCP servers and more.",
};

type Props = {
  searchParams: Promise<{ category?: string; tag?: string; sort?: string; page?: string }>;
};

export default async function ToolsPage({ searchParams }: Props) {
  const params = await searchParams;
  // Unknown category values are dropped rather than 404'd: a stale or
  // hand-edited URL should still show the directory, not an error.
  const category = toToolCategory(params.category);
  const tag = params.tag?.trim() || undefined;
  const sort = toToolSort(params.sort);
  const page = toPageNumber(params.page);

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();

  const [{ tools, total, pageCount }, tags, bookmarks] = await Promise.all([
    listTools(supabase, { category, tag, sort, page }),
    listTags(supabase),
    // Signed-out visitors still see Save buttons; pressing one sends them to
    // sign in. Only which ones read as saved needs a user.
    auth.user ? listBookmarks(supabase, auth.user.id, "tool") : [],
  ]);

  const bookmarkedIds = new Set(bookmarks.map((bookmark) => bookmark.target_id));
  // Come back to this exact filtered page after a signed-out visitor logs in.
  const returnTo = toolsHref({ category, tag, sort, page });

  return (
    <main className="mx-auto w-full max-w-6xl p-6">
      <h1 className="font-heading text-2xl font-semibold">Tools</h1>
      <p className="mt-1 text-muted-foreground">
        Curated AI tools for vibe coders, grouped by what they actually are.
      </p>

      <div className="mt-6">
        <DirectoryFilters category={category} tag={tag} sort={sort} tags={tags} />
      </div>

      {tools.length ? (
        <>
          <ul className="mt-8 grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => (
              <li key={tool.id}>
                <ResourceCard
                  href={`/tools/${tool.slug}`}
                  title={tool.name}
                  eyebrow={toolCategoryLabel(tool.category)}
                  description={tool.tagline}
                  badges={tool.pricing_tier ? [tool.pricing_tier] : undefined}
                  action={
                    <BookmarkButton
                      targetType="tool"
                      targetId={tool.id}
                      bookmarked={bookmarkedIds.has(tool.id)}
                      returnTo={returnTo}
                    />
                  }
                />
              </li>
            ))}
          </ul>
          <DirectoryPager
            page={page}
            pageCount={pageCount}
            total={total}
            category={category}
            tag={tag}
            sort={sort}
          />
        </>
      ) : (
        <p className="mt-8 text-muted-foreground">
          {page > 1
            ? "That page is past the end of the results. Try going back to the first page."
            : "Nothing matches that filter yet. Try clearing the tag or picking another category."}
        </p>
      )}
    </main>
  );
}
