import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import {
  agentInstallCommand,
  agentInstallPrompt,
  agentsFor,
  isCodingAgentsOnly,
  worksInSummary,
  categoryCounts,
  matchesSkillFilters,
  SKILL_AGENT_IDS,
  SKILL_AGENTS,
  SKILL_CATEGORY_VALUES,
  skillsHref,
  toSkillFilters,
} from "./skill-taxonomy.ts";

const migration = readFileSync(
  new URL("../supabase/migrations/20260913185959_tool_skill_category_agents.sql", import.meta.url),
  "utf8",
);

test("the lists match the migration's enum and CHECK, in order", () => {
  const enumBody = migration.match(/create type skill_category as enum \(([^)]*)\)/)![1];
  assert.deepEqual([...enumBody.matchAll(/'([a-z_]+)'/g)].map((m) => m[1]), [...SKILL_CATEGORY_VALUES]);

  const checkBody = migration.match(/skill_agents_excluded <@ array\[([^\]]*)\]/)![1];
  assert.deepEqual([...checkBody.matchAll(/'([a-z-]+)'/g)].map((m) => m[1]), [...SKILL_AGENT_IDS]);
});

test("every agent points at its vendor's docs over https, and folder agents name both folders", () => {
  for (const agent of SKILL_AGENTS) {
    assert.match(agent.docs, /^https:\/\//, agent.id);
    if (agent.kind === "folder") {
      assert.ok(!agent.projectPath.startsWith("/") && !agent.projectPath.startsWith("~"), agent.id);
      assert.ok(agent.personalPath.startsWith("~/"), agent.id);
    } else {
      assert.ok(agent.steps.length > 0, agent.id);
    }
  }
});

test("works everywhere unless marked", () => {
  assert.deepEqual(agentsFor([]), [...SKILL_AGENT_IDS]);
  assert.deepEqual(agentsFor(["chatgpt", "not-an-agent"]), SKILL_AGENT_IDS.filter((id) => id !== "chatgpt"));
});

test("per-agent command and prompt", () => {
  const one = { owner: "anthropics", repo: "skills", skill: "frontend-design" };
  assert.equal(
    agentInstallCommand(one, "antigravity"),
    "npx skills add https://github.com/anthropics/skills --skill frontend-design -a antigravity",
  );
  assert.equal(
    agentInstallCommand({ owner: "obra", repo: "superpowers", skill: null }, "codex"),
    "npx skills add https://github.com/obra/superpowers -a codex",
  );

  const prompt = agentInstallPrompt(one, { label: "Cursor", projectPath: ".cursor/skills" });
  assert.match(prompt, /"frontend-design" skill from https:\/\/github\.com\/anthropics\/skills/);
  assert.match(prompt, /into \.cursor\/skills\//);
  assert.match(prompt, /wait for me to confirm/);
});

test("filters: unknown values are dropped, and the URL round-trips", () => {
  assert.deepEqual(toSkillFilters({ category: "design_ui", agent: "cursor", creator: "Leonxlnx" }), {
    category: "design_ui",
    agent: "cursor",
    creator: "Leonxlnx",
  });
  assert.deepEqual(toSkillFilters({ category: "nope", agent: "vim", creator: "../x" }), {
    category: undefined,
    agent: undefined,
    creator: undefined,
  });
  assert.equal(skillsHref({}), "/skills");
  assert.equal(skillsHref({ category: "security", creator: "obra" }), "/skills?category=security&creator=obra");
});

test("matching and category counts respect the other filters", () => {
  const skills = [
    { category: "design_ui", agentsExcluded: [], creator: "nextlevelbuilder" },
    { category: "design_ui", agentsExcluded: ["chatgpt"], creator: "Leonxlnx" },
    { category: "planning_workflow", agentsExcluded: [], creator: "obra" },
    { category: null, agentsExcluded: [], creator: null },
  ] as const;

  assert.equal(matchesSkillFilters(skills[1], { agent: "chatgpt" }), false);
  assert.equal(matchesSkillFilters(skills[1], { creator: "leonxlnx" }), true);
  assert.equal(matchesSkillFilters(skills[3], { category: "design_ui" }), false);

  const all = categoryCounts(skills, {});
  assert.equal(all.get("design_ui"), 2);
  assert.equal(all.get("planning_workflow"), 1);

  // A tile's count is what clicking it would show under the other filters.
  const chatgpt = categoryCounts(skills, { agent: "chatgpt", category: "planning_workflow" });
  assert.equal(chatgpt.get("design_ui"), 1);
});

test("a skill that cannot run in a chat app is coding agents only", () => {
  assert.equal(isCodingAgentsOnly([]), false);
  assert.equal(isCodingAgentsOnly(["cursor"]), false);
  assert.equal(isCodingAgentsOnly(["claude-ai", "chatgpt"]), true);
  assert.equal(worksInSummary([]), "Every agent listed here, including Claude.ai and ChatGPT");
  assert.equal(
    worksInSummary(["claude-ai", "chatgpt"]),
    "Coding agents such as Claude Code, Codex and Cursor; not Claude.ai or ChatGPT",
  );
});
