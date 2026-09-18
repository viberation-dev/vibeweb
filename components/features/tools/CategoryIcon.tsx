import {
  IconAdjustments,
  IconApps,
  IconAward,
  IconBox,
  IconCloudUpload,
  IconCode,
  IconMessage2,
  IconPlug,
  IconPuzzle,
  IconRobot,
  IconRoute,
  IconStack2,
  IconTemplate,
  IconTerminal,
  IconTerminal2,
  IconTool,
  type Icon,
} from "@tabler/icons-react";

import type { ToolCategory } from "@/lib/tool-categories";

/**
 * One icon per directory family, matching the mockups' `ti-*` classes
 * one for one (see CLAUDE.md — the repo standardised on Tabler).
 *
 * A Record rather than a lookup with a fallback, so adding a value to the
 * `tool_category` enum fails the typecheck here instead of silently
 * rendering a category with no icon.
 *
 * Shared by the home page's category tiles and the directory's cards: the
 * mockup gives Supabase a database icon on its card, but nothing in `tools`
 * stores a per-tool icon, so the category's icon is what there is. A tool
 * icon column would be its own piece of work.
 */
export const CATEGORY_ICONS: Record<ToolCategory, Icon> = {
  models: IconBox,
  chats: IconMessage2,
  app_builders: IconApps,
  hosting: IconCloudUpload,
  agents: IconRobot,
  ides: IconCode,
  clis: IconTerminal,
  terminals: IconTerminal2,
  skills: IconAward,
  mcp_servers: IconPlug,
  plugins: IconPuzzle,
  frameworks: IconStack2,
  templates: IconTemplate,
  workflows: IconRoute,
  tools: IconTool,
  utilities: IconAdjustments,
};

export function CategoryIcon({
  category,
  className,
}: {
  category: ToolCategory;
  className?: string;
}) {
  const Icon = CATEGORY_ICONS[category];
  return <Icon aria-hidden className={className} />;
}
