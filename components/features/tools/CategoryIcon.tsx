import {
  IconAdjustments,
  IconAward,
  IconBox,
  IconCode,
  IconMessage2,
  IconPlug,
  IconPuzzle,
  IconRobot,
  IconRoute,
  IconStack2,
  IconTemplate,
  IconTerminal,
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
const ICONS: Record<ToolCategory, Icon> = {
  models: IconBox,
  chats: IconMessage2,
  agents: IconRobot,
  ides: IconCode,
  clis: IconTerminal,
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
  const Icon = ICONS[category];
  return <Icon aria-hidden className={className} />;
}
