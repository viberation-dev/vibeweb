import { getRepoFacts } from "@/lib/integrations/github";
import { getSkillAudits, getSkillDetail, getSkillInstalls } from "@/lib/integrations/skills-sh";
import { listTools, type Tool } from "@/lib/queries/tools";
import {
  bySkillPopularity,
  installCommand,
  parseSkillSource,
  skillLine,
  skillRepo,
  type RepoFacts,
  type SkillAudit,
  type SkillDetail,
  type SkillSource,
} from "@/lib/skill-facts";

/*
 * Live skill facts for a tool row (VIB-130): the two adapters, combined the
 * way the pages need them. Kept out of both adapters so each still knows only
 * its own service, and out of the pages so the directory and the hub cannot
 * compute a skill's card line two different ways.
 */

type SkillRow = Pick<Tool, "category" | "skills_sh_source" | "outbound_url">;
type Client = Parameters<typeof listTools>[0];

export type SkillCardFacts = { installs: number | null; stars: number | null };

/** Installs and stars for one card. Both null for anything that is not a skill. */
export async function getSkillCardFacts(tool: SkillRow): Promise<SkillCardFacts> {
  const source = parseSkillSource(tool.skills_sh_source);
  const repo = tool.category === "skills" ? skillRepo(source, tool.outbound_url) : null;
  const [installs, facts] = await Promise.all([
    source ? getSkillInstalls(source) : null,
    repo ? getRepoFacts(repo.owner, repo.repo) : null,
  ]);
  return { installs, stars: facts?.stars ?? null };
}

/**
 * Card lines for a grid, keyed by tool id. Only skills are looked up; every
 * adapter call is cached, so a grid of skills costs nothing after the first
 * view each hour.
 */
export async function getSkillCardLines(
  tools: ReadonlyArray<SkillRow & Pick<Tool, "id">>,
): Promise<Map<string, string>> {
  const skills = tools.filter((tool) => tool.category === "skills");
  const lines = await Promise.all(
    skills.map(async (tool) => {
      const { installs, stars } = await getSkillCardFacts(tool);
      return [tool.id, skillLine(installs, stars)] as const;
    }),
  );
  return new Map(lines.filter(([, line]) => line !== ""));
}

export type RankedSkill = SkillCardFacts & { tool: Tool; name: string; line: string };

/**
 * Every skill, most installed first, with its card facts (VIB-131). The
 * /skills hub shows them all; the homepage takes the head of the list. When
 * skills.sh is unavailable the order falls back to stars, then name.
 */
export async function listRankedSkills(client: Client, limit?: number): Promise<RankedSkill[]> {
  const { tools } = await listTools(client, { category: "skills", pageSize: SKILL_LIST_LIMIT });
  const ranked = await Promise.all(
    tools.map(async (tool) => {
      const facts = await getSkillCardFacts(tool);
      return { tool, name: tool.name, ...facts, line: skillLine(facts.installs, facts.stars) };
    }),
  );
  ranked.sort(bySkillPopularity);
  return limit === undefined ? ranked : ranked.slice(0, limit);
}

/** Every skill fits on one page today; the directory paginates if this is ever outgrown. */
const SKILL_LIST_LIMIT = 100;

export type SkillPageFacts = {
  /** The parsed skills.sh pointer, for per-agent install text (VIB-132). */
  source: SkillSource | null;
  command: string | null;
  installs: number | null;
  repo: { owner: string; repo: string } | null;
  repoFacts: RepoFacts | null;
  detail: SkillDetail | null;
  audits: SkillAudit[];
  /** A pack names a repository of skills rather than one skill. */
  isPack: boolean;
};

/** Everything the skill detail section shows. Null when there is nothing to show. */
export async function getSkillPageFacts(tool: SkillRow): Promise<SkillPageFacts | null> {
  if (tool.category !== "skills") return null;
  const source = parseSkillSource(tool.skills_sh_source);
  const repo = skillRepo(source, tool.outbound_url);
  if (!source && !repo) return null;

  const [detail, packInstalls, repoFacts, audits] = await Promise.all([
    source?.skill ? getSkillDetail(source) : null,
    source && !source.skill ? getSkillInstalls(source) : null,
    repo ? getRepoFacts(repo.owner, repo.repo) : null,
    source ? getSkillAudits(source) : [],
  ]);

  return {
    source,
    command: source ? installCommand(source) : null,
    installs: detail?.installs ?? packInstalls,
    repo,
    repoFacts,
    detail,
    audits,
    isPack: source !== null && source.skill === null,
  };
}
