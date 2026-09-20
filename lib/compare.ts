/*
 * Relative imports so this runs under plain `node --test`, like lib/theme.ts.
 */
import { toKeyFacts } from "./key-facts.ts";
import { ROLE_LEVELS } from "./role-level.ts";
import { toolCategoryLabel } from "./tool-categories.ts";
import { hasFreeTier } from "./tool-facts.ts";
import { platformSummary } from "./tool-platforms.ts";
import type { Tool } from "./queries/tools.ts";

export type CompareRow = { label: string; a: string; b: string };

type ToolFacts = Pick<Tool, "category" | "pricing_tier" | "platform" | "best_for" | "key_facts">;

function fixedFacts(tool: ToolFacts): Map<string, string> {
  const level = ROLE_LEVELS.find((l) => l.value === tool.best_for)?.label;
  const rows: [string, string | undefined][] = [
    ["Category", toolCategoryLabel(tool.category)],
    ["Pricing", tool.pricing_tier ?? undefined],
    ["Free tier", tool.pricing_tier ? (hasFreeTier(tool.pricing_tier) ? "Yes" : "No") : undefined],
    ["Platform", platformSummary(tool.platform) || undefined],
    ["Best for", level],
  ];
  return new Map(rows.filter((r): r is [string, string] => Boolean(r[1])));
}

/**
 * The side-by-side table on a comparison page (VIB-184).
 *
 * Fixed rows first, then every editorial key fact either tool has, in the
 * order it first appears (A's facts, then any only B has). A side with no
 * value says "Not stated" rather than guessing, the same rule as the tool
 * page. A fact that repeats a fixed row's label is dropped (VIB-143), and a
 * row neither side states is not shown at all.
 */
export function compareRows(a: ToolFacts, b: ToolFacts): CompareRow[] {
  const fixedA = fixedFacts(a);
  const fixedB = fixedFacts(b);
  const fixedLabels = ["Category", "Pricing", "Free tier", "Platform", "Best for"];

  const factsA = new Map(toKeyFacts(a.key_facts).map((f) => [f.label, f.value]));
  const factsB = new Map(toKeyFacts(b.key_facts).map((f) => [f.label, f.value]));
  const factLabels = [...new Set([...factsA.keys(), ...factsB.keys()])].filter(
    (label) => !fixedLabels.includes(label),
  );

  const row = (label: string, left?: string, right?: string): CompareRow[] =>
    left || right ? [{ label, a: left ?? "Not stated", b: right ?? "Not stated" }] : [];

  return [
    ...fixedLabels.flatMap((label) => row(label, fixedA.get(label), fixedB.get(label))),
    ...factLabels.flatMap((label) => row(label, factsA.get(label), factsB.get(label))),
  ];
}
