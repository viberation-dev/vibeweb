import type { Enums } from "@/types/supabase";

export type ToolCategory = Enums<"tool_category">;

/**
 * The 13 canonical directory categories (artifact-type taxonomy, §24/§07).
 *
 * Order is the display order in the category nav, not alphabetical: the
 * things a beginner meets first come first. The enum values double as URL
 * values (`/tools?category=mcp_servers`) so there is no second slug to keep
 * in sync — the database enum is the only source of truth for what exists.
 */
export const TOOL_CATEGORIES: ReadonlyArray<{ value: ToolCategory; label: string }> = [
  { value: "models", label: "Models" },
  { value: "chats", label: "Chats" },
  { value: "agents", label: "Agents" },
  { value: "ides", label: "IDEs" },
  { value: "clis", label: "CLIs" },
  { value: "skills", label: "Skills" },
  { value: "mcp_servers", label: "MCP Servers" },
  { value: "plugins", label: "Plugins" },
  { value: "frameworks", label: "Frameworks" },
  { value: "templates", label: "Templates" },
  { value: "workflows", label: "Workflows" },
  { value: "tools", label: "Tools" },
  { value: "utilities", label: "Utilities" },
];

const BY_VALUE = new Map(TOOL_CATEGORIES.map((c) => [c.value, c.label]));

/** Narrows an untrusted URL param to a real category, or undefined. */
export function toToolCategory(value: string | undefined): ToolCategory | undefined {
  return value && BY_VALUE.has(value as ToolCategory) ? (value as ToolCategory) : undefined;
}

/** Display label for a category, falling back to the raw enum value. */
export function toolCategoryLabel(value: ToolCategory): string {
  return BY_VALUE.get(value) ?? value;
}
