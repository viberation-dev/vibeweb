import { contentPreview, contentTypeLabel } from "@/lib/learn";
import type { Content } from "@/lib/queries/content";
import type { Tool } from "@/lib/queries/tools";
import { toolCategoryLabel } from "@/lib/tool-categories";
import type { Enums } from "@/types/supabase";

/**
 * A tool or a content row flattened to what `ResourceCard` needs.
 *
 * The directory, Learn, collections, the home feed and the bookmarks page
 * all list the same two kinds of thing. Without this each surface grows its
 * own copy of "a tool's eyebrow is its category, an article's is its type",
 * and they drift. One card component (§24) deserves one mapping.
 *
 * `targetType` rides along because every surface that renders a card also
 * renders a bookmark toggle, which needs the polymorphic pair.
 */
export type ResourceView = {
  targetType: Enums<"target_kind">;
  /** The row's own id — the other half of the bookmark's polymorphic pair. */
  id: string;
  href: string;
  title: string;
  eyebrow: string;
  description: string | null;
  badges?: string[];
};

export function toolView(tool: Tool): ResourceView {
  return {
    targetType: "tool",
    id: tool.id,
    href: `/tools/${tool.slug}`,
    title: tool.name,
    eyebrow: toolCategoryLabel(tool.category),
    description: tool.tagline,
    badges: tool.pricing_tier ? [tool.pricing_tier] : undefined,
  };
}

export function contentView(item: Content): ResourceView {
  return {
    targetType: "content",
    id: item.id,
    href: `/learn/${item.slug}`,
    title: item.title,
    eyebrow: contentTypeLabel(item.type),
    // `content` has no tagline column, so the preview is drawn from the body
    // rather than a second stored field.
    description: contentPreview(item.type, item.body),
    badges: item.role_level ? [item.role_level] : undefined,
  };
}
