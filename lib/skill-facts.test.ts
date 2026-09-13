import assert from "node:assert/strict";
import { test } from "node:test";

import {
  bySkillPopularity,
  githubRepoFromUrl,
  hubGroupFor,
  installCommand,
  parseAudits,
  parseRepo,
  parseSkillDetail,
  parseSkillSource,
  SKILL_MD_PREVIEW,
  skillLine,
  sumPackInstalls,
} from "./skill-facts.ts";

test("a skills.sh source is owner/repo or owner/repo/skill, and nothing that walks a path", () => {
  assert.deepEqual(parseSkillSource("anthropics/skills/frontend-design"), {
    owner: "anthropics",
    repo: "skills",
    skill: "frontend-design",
  });
  assert.deepEqual(parseSkillSource("Leonxlnx/taste-skill"), {
    owner: "Leonxlnx",
    repo: "taste-skill",
    skill: null,
  });
  for (const bad of ["", "skills", "a/b/c/d", "../admin/x", "a/../b", "a//b", "a/b/", "a b/c"]) {
    assert.equal(parseSkillSource(bad), null, `expected ${bad} to be rejected`);
  }
});

test("the install command matches what skills.sh prints", () => {
  assert.equal(
    installCommand(parseSkillSource("anthropics/skills/frontend-design")!),
    "npx skills add https://github.com/anthropics/skills --skill frontend-design",
  );
  assert.equal(
    installCommand(parseSkillSource("obra/superpowers")!),
    "npx skills add https://github.com/obra/superpowers",
  );
});

test("only github.com repository links count as a repo", () => {
  assert.deepEqual(githubRepoFromUrl("https://github.com/obra/superpowers"), {
    owner: "obra",
    repo: "superpowers",
  });
  assert.deepEqual(githubRepoFromUrl("https://github.com/garrytan/gstack.git/tree/main"), {
    owner: "garrytan",
    repo: "gstack",
  });
  for (const url of [
    "https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview",
    "https://github.com/obra",
    "http://github.com/obra/superpowers",
    "https://github.com.evil.example/obra/superpowers",
    "not a url",
    null,
  ]) {
    assert.equal(githubRepoFromUrl(url), null, `expected ${url} to be rejected`);
  }
});

test("skill detail: installs, sorted files, SKILL.md cut to the preview", () => {
  const long = "x".repeat(SKILL_MD_PREVIEW + 10);
  const detail = parseSkillDetail({
    id: "anthropics/skills/frontend-design",
    installs: 881300,
    files: [
      { path: "SKILL.md", contents: long },
      { path: "LICENSE.txt", contents: "Apache" },
    ],
  });
  assert.equal(detail?.installs, 881300);
  assert.deepEqual(
    detail?.files.map((f) => f.path),
    ["LICENSE.txt", "SKILL.md"],
  );
  assert.equal(detail?.skillMd?.length, SKILL_MD_PREVIEW);
  assert.equal(detail?.skillMdTruncated, true);
});

test("skill detail: a changed shape is nothing known, not a throw", () => {
  assert.equal(parseSkillDetail(null), null);
  assert.equal(parseSkillDetail({ installs: "lots" }), null);
  assert.equal(parseSkillDetail({ error: "authentication_required" })?.installs, null);
});

test("pack installs sum exact-source matches only", () => {
  const source = parseSkillSource("obra/superpowers")!;
  const rows = [
    { source: "obra/superpowers", installs: 100 },
    { source: "OBRA/superpowers", installs: 50 },
    { source: "someone/superpowers", installs: 9999 },
    { source: "obra/superpowers-lab", installs: 9999 },
    { source: "obra/superpowers" },
  ];
  assert.equal(sumPackInstalls({ data: rows }, source), 150);
  assert.equal(sumPackInstalls({ skills: rows }, source), 150);
  assert.equal(sumPackInstalls(rows, source), 150);
  assert.equal(sumPackInstalls({ data: [] }, source), null);
  assert.equal(sumPackInstalls({ results: "?" }, source), null);
});

test("audits: the real response parses, and a bad row costs only that row", () => {
  const audits = parseAudits({
    id: "anthropics/skills/frontend-design",
    audits: [
      {
        provider: "Snyk",
        slug: "snyk",
        status: "pass",
        summary: "Risk: LOW · No issues",
        auditedAt: "2026-02-17T22:15:26.596712+00:00",
        riskLevel: "LOW",
      },
      { provider: "Socket", slug: "socket", status: "pass", summary: "No alerts" },
      { provider: "Mystery", status: "unknown" },
    ],
  });
  assert.deepEqual(
    audits.map((a) => [a.provider, a.status, a.riskLevel]),
    [
      ["Snyk", "pass", "LOW"],
      ["Socket", "pass", null],
    ],
  );
  assert.deepEqual(parseAudits({ error: "not_found" }), []);
});

test("repo facts: licence NOASSERTION is no licence", () => {
  assert.deepEqual(
    parseRepo({
      stargazers_count: 176034,
      pushed_at: "2026-09-03T16:37:00Z",
      license: { spdx_id: "NOASSERTION" },
    }),
    { stars: 176034, pushedAt: "2026-09-03T16:37:00Z", license: null, archived: false },
  );
  assert.equal(parseRepo({ message: "API rate limit exceeded" }), null);
});

test("card line and ordering", () => {
  assert.equal(skillLine(881300, 176034), "881.3K installs · 176K stars");
  assert.equal(skillLine(null, 1497), "1.5K stars");
  assert.equal(skillLine(null, null), "");

  const rows = [
    { name: "b", installs: null, stars: 10 },
    { name: "a", installs: 5, stars: null },
    { name: "c", installs: null, stars: null },
    { name: "d", installs: 50, stars: 1 },
  ];
  assert.deepEqual(rows.sort(bySkillPopularity).map((r) => r.name), ["d", "a", "b", "c"]);
});

test("hub groups: CLIs install, everything else discovers, skills are not resources", () => {
  assert.equal(hubGroupFor("clis"), "install");
  assert.equal(hubGroupFor("utilities"), "discover");
  assert.equal(hubGroupFor("skills"), null);
});
