/*
 * Pure helpers for "works with" links (VIB-109). Relative imports only, so it
 * runs under plain `node --test` like lib/model-facts.ts.
 */
import type { Enums } from "@/types/supabase";

import { TOOL_CATEGORIES, type ToolCategory } from "./tool-categories.ts";

export type ToolLinkKind = Enums<"tool_link_kind">;

/** One link as the page sees it: the tool on the other end, plus how. */
export type ToolLink = {
  kind: ToolLinkKind;
  note: string | null;
  sort_order: number;
  tool: { name: string; slug: string; category: ToolCategory };
};

/** Editorial order first, then name, so unordered rows still read A–Z. */
export function sortLinks(links: readonly ToolLink[]): ToolLink[] {
  return [...links].sort(
    (a, b) => a.sort_order - b.sort_order || a.tool.name.localeCompare(b.tool.name),
  );
}

/**
 * "Pairs well with", one group per category of the linked tool, in directory
 * order — MCP servers before frameworks, the same order as the category nav.
 * Empty categories are absent, so the page never prints a bare heading.
 */
export function groupByCategory(
  links: readonly ToolLink[],
): { category: ToolCategory; label: string; links: ToolLink[] }[] {
  return TOOL_CATEGORIES.map(({ value, label }) => ({
    category: value,
    label,
    links: sortLinks(links.filter((link) => link.tool.category === value)),
  })).filter((group) => group.links.length > 0);
}
