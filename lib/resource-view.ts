import { contentPillarLabel, contentPreview, contentTypeLabel } from "@/lib/learn";
import type { Content } from "@/lib/queries/content";
import type { Tool } from "@/lib/queries/tools";
import type { RoleLevel } from "@/lib/role-level";
import { toolBadgeLabel, type BadgeSettings } from "@/lib/tool-badges";
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
  /** Tools only — "New" or "Popular" (VIB-187). */
  flag?: string;
  /** Content only — tools have no skill tier. Rendered as a DifficultyBadge. */
  difficulty?: RoleLevel;
  /** Quiet card meta. Reading time for content; tools have none. */
  meta?: string;
};

/**
 * `settings` is optional so a surface that has not read the settings row
 * still renders a card — it just renders one with no badge, which is the
 * same thing the default mode gives an unbadged tool.
 */
export function toolView(tool: Tool, settings?: BadgeSettings): ResourceView {
  return {
    targetType: "tool",
    id: tool.id,
    href: `/tools/${tool.slug}`,
    title: tool.name,
    eyebrow: toolCategoryLabel(tool.category),
    description: tool.tagline,
    badges: tool.pricing_tier ? [tool.pricing_tier] : undefined,
    flag: settings ? toolBadgeLabel(tool, settings) : undefined,
  };
}

export function contentView(item: Content): ResourceView {
  return {
    targetType: "content",
    id: item.id,
    href: `/learn/${item.slug}`,
    title: item.title,
    /*
     * The mockup's Learn card is eyebrowed with the pillar, not the content
     * type. Unfiled rows fall back to the type rather than showing nothing:
     * help articles belong to no pillar by design, and they still surface in
     * search and bookmarks.
     */
    eyebrow: item.pillar ? contentPillarLabel(item.pillar) : contentTypeLabel(item.type),
    // `content` has no tagline column, so the preview is drawn from the body
    // rather than a second stored field — or from the blocks, for a guide
    // authored without one (VIB-192).
    description: contentPreview(item.type, item.body, item.blocks),
    // The tier is a DifficultyBadge, not a `badges` string: it is its own
    // design-system surface with a fixed hue per level, and a raw lowercase
    // "expert" in a grey pill was never what the badge set is for.
    difficulty: item.role_level ?? undefined,
  };
}
