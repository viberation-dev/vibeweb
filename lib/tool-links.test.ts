import assert from "node:assert/strict";
import { test } from "node:test";

import { groupByCategory, type ToolLink } from "./tool-links.ts";

const link = (name: string, category: ToolLink["tool"]["category"], sort_order = 0): ToolLink => ({
  kind: "pairs_with",
  note: null,
  sort_order,
  tool: { name, slug: name.toLowerCase(), category },
});

test("groupByCategory follows directory order and drops empty groups", () => {
  const groups = groupByCategory([
    link("Next.js", "frameworks"),
    link("Superpowers", "skills"),
    link("Playwright MCP", "mcp_servers"),
  ]);
  assert.deepEqual(
    groups.map((g) => g.label),
    ["Skills", "MCP Servers", "Frameworks"],
  );
});

test("groupByCategory sorts by sort_order, then name", () => {
  const [group] = groupByCategory([
    link("Zeta", "skills"),
    link("Alpha", "skills"),
    link("Pinned", "skills", -1),
  ]);
  assert.deepEqual(
    group.links.map((l) => l.tool.name),
    ["Pinned", "Alpha", "Zeta"],
  );
});
