import type { Enums } from "@/types/supabase";

export type ToolCategory = Enums<"tool_category">;

/**
 * The 16 canonical directory categories (artifact-type taxonomy, §24/§07).
 *
 * Order is the display order in the category nav, not alphabetical: the
 * things a beginner meets first come first. The enum values double as URL
 * values (`/tools?category=mcp_servers`) so there is no second slug to keep
 * in sync — the database enum is the only source of truth for what exists.
 */
export const TOOL_CATEGORIES: ReadonlyArray<{ value: ToolCategory; label: string }> = [
  { value: "models", label: "Models" },
  { value: "chats", label: "Chats" },
  { value: "app_builders", label: "App Builders" },
  { value: "hosting", label: "Hosting" },
  { value: "agents", label: "Agents" },
  { value: "ides", label: "IDEs" },
  { value: "terminals", label: "Terminals" },
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

/** One line per directory category. Keyed by the enum so a new category fails the build until it has one. */
export const CATEGORY_BLURBS: Record<ToolCategory, string> = {
  models: "The AI behind every tool. See what each one is good at.",
  chats: "Ask, plan and draft code with an AI in your browser.",
  app_builders: "Describe an app in plain English and get a working one.",
  hosting: "Put your project online with a real link to share.",
  agents: "AI that plans and carries out coding tasks for you.",
  ides: "Code editors with AI built in, for when you open the code.",
  terminals: "Where you type commands to install, run and ship your project.",
  clis: "AI coding assistants that run in your terminal.",
  skills: "Instructions your agent loads to follow a proven method.",
  mcp_servers: "Connect your AI to the apps and data you already use.",
  plugins: "Add-ons that extend the AI tools you already have.",
  frameworks: "Solid foundations to build on, so the AI invents less.",
  templates: "Starter projects, so you begin from something that works.",
  workflows: "Proven ways of working with AI, step by step.",
  tools: "Focused helpers that do one job in your build well.",
  utilities: "Small extras that smooth out everyday AI coding.",
};

/** The signed-in home's short row (VIB-150): what a beginner reaches for first. The rest sit behind "All tools". */
export const BEGINNER_CATEGORIES: ReadonlyArray<ToolCategory> = [
  "chats",
  "app_builders",
  "models",
  "ides",
  "hosting",
  "templates",
  "skills",
];

/** The "All tools" modal's tabs. Every category appears in exactly one group (tool-categories.test.ts). */
export const CATEGORY_GROUPS: ReadonlyArray<{ label: string; categories: ReadonlyArray<ToolCategory> }> = [
  { label: "Build", categories: ["app_builders", "ides", "terminals", "clis", "agents"] },
  { label: "AI", categories: ["models", "chats"] },
  { label: "Extend", categories: ["skills", "mcp_servers", "plugins"] },
  { label: "Start from", categories: ["templates", "frameworks", "workflows"] },
  { label: "Ship", categories: ["hosting", "tools", "utilities"] },
];

const BY_VALUE =new Map(TOOL_CATEGORIES.map((c) => [c.value, c.label]));

/** Narrows an untrusted URL param to a real category, or undefined. */
export function toToolCategory(value: string | undefined): ToolCategory | undefined {
  return value && BY_VALUE.has(value as ToolCategory) ? (value as ToolCategory) : undefined;
}

/** Display label for a category, falling back to the raw enum value. */
export function toolCategoryLabel(value: ToolCategory): string {
  return BY_VALUE.get(value) ?? value;
}
