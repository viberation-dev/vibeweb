import { SkillCategoryIcon } from "@/components/features/skills/SkillCategoryIcon";
import { CategoryIcon } from "@/components/features/tools/CategoryIcon";
import type { Tool } from "@/lib/queries/tools";
import { toolLogoSrc } from "@/lib/tool-logos";
import { cn } from "@/lib/utils";

/**
 * A tool's brand logo, or its generic glyph when it has no official mark:
 * the skill category icon for a categorised skill, otherwise the directory
 * category icon (VIB-164).
 *
 * The logo renders as an <img>, so a tile around it can switch to a white
 * ground with `has-[img]:bg-white` — brand colours and black marks both
 * need it, and the generic glyph keeps the tile's own colour.
 */
export function ToolIcon({
  tool,
  className,
}: {
  tool: Pick<Tool, "slug" | "category"> & Partial<Pick<Tool, "skill_category">>;
  className?: string;
}) {
  const src = toolLogoSrc(tool.slug);
  if (src) {
    // Local static SVGs; next/image adds nothing for these.
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" aria-hidden className={cn("object-contain", className)} />;
  }
  if (tool.skill_category) {
    return <SkillCategoryIcon category={tool.skill_category} className={className} />;
  }
  return <CategoryIcon category={tool.category} className={className} />;
}
