/*
 * Skill categories, agents and how to install into each (VIB-132).
 *
 * Pure and alias-free so it runs under plain `node --test`, like
 * lib/skill-facts.ts. The database mirrors two lists here: the
 * `skill_category` enum and the `tools_skill_agents_excluded_known` CHECK.
 */

// ---------------------------------------------------------------------------
// Categories

export const SKILL_CATEGORIES = [
  { value: "design_ui", label: "Design & UI" },
  { value: "frontend", label: "Frontend" },
  { value: "backend_apis", label: "Backend & APIs" },
  { value: "testing_qa", label: "Testing & QA" },
  { value: "code_review", label: "Code review" },
  { value: "debugging", label: "Debugging" },
  { value: "planning_workflow", label: "Planning & workflow" },
  { value: "docs_writing", label: "Docs & writing" },
  { value: "data_analysis", label: "Data & analysis" },
  { value: "devops_deploy", label: "DevOps & deploy" },
  { value: "security", label: "Security" },
  { value: "marketing_content", label: "Marketing & content" },
  { value: "documents_office", label: "Documents & office" },
] as const;

export type SkillCategory = (typeof SKILL_CATEGORIES)[number]["value"];

export const SKILL_CATEGORY_VALUES: readonly SkillCategory[] = SKILL_CATEGORIES.map((c) => c.value);

export function toSkillCategory(value: string | null | undefined): SkillCategory | undefined {
  return SKILL_CATEGORY_VALUES.find((category) => category === value);
}

export function skillCategoryLabel(value: SkillCategory): string {
  return SKILL_CATEGORIES.find((category) => category.value === value)!.label;
}

// ---------------------------------------------------------------------------
// Agents

/**
 * How a skill gets into an agent. `folder` agents read skills from disk and
 * the skills CLI can target them; `upload` agents take a ZIP through their
 * own settings screen.
 */
export type SkillAgent =
  | {
      id: string;
      label: string;
      kind: "folder";
      /** The skills CLI's `-a` value. */
      cliAgent: string;
      /** Relative to the project root. */
      projectPath: string;
      personalPath: string;
      note?: string;
      docs: string;
    }
  | {
      id: string;
      label: string;
      kind: "upload";
      steps: readonly string[];
      note?: string;
      docs: string;
    };

/**
 * Every path and menu below was checked against the vendor's own docs on
 * 2026-09-13 (links in `docs`). Where a vendor and the skills CLI disagree on
 * a personal folder, the vendor wins: it is what the agent actually reads.
 */
export const SKILL_AGENTS = [
  {
    id: "claude-code",
    label: "Claude Code",
    kind: "folder",
    cliAgent: "claude-code",
    projectPath: ".claude/skills",
    personalPath: "~/.claude/skills",
    note: "Picked up in the current session, no restart needed.",
    docs: "https://code.claude.com/docs/en/skills",
  },
  {
    id: "claude-ai",
    label: "Claude.ai",
    kind: "upload",
    steps: [
      "In Settings > Capabilities, turn on Code execution and file creation.",
      "Go to Customize > Skills, press +, then Create skill.",
      "Choose Upload a skill and pick the ZIP you downloaded.",
    ],
    note: "Free, Pro and Max plans. On Team and Enterprise, an owner turns skills on in Organization settings first.",
    docs: "https://support.claude.com/en/articles/12512180-use-skills-in-claude",
  },
  {
    id: "chatgpt",
    label: "ChatGPT",
    kind: "upload",
    steps: [
      "Open Skills in ChatGPT and select Create.",
      "Select Upload from your computer and pick the ZIP you downloaded.",
      "Wait for ChatGPT's safety scan. A skill marked Needs Review asks you to check it before use.",
    ],
    note: "Skills that rely on scripts or a terminal may not work unchanged in ChatGPT.",
    docs: "https://help.openai.com/en/articles/20001066-skills-in-chatgpt",
  },
  {
    id: "codex",
    label: "Codex",
    kind: "folder",
    cliAgent: "codex",
    projectPath: ".agents/skills",
    personalPath: "~/.agents/skills",
    note: "Restart Codex if the skill does not show up.",
    docs: "https://learn.chatgpt.com/docs/build-skills",
  },
  {
    id: "cursor",
    label: "Cursor",
    kind: "folder",
    cliAgent: "cursor",
    projectPath: ".cursor/skills",
    personalPath: "~/.cursor/skills",
    note: "Run it by typing / and the skill name in chat.",
    docs: "https://cursor.com/docs/skills",
  },
  {
    id: "github-copilot",
    label: "GitHub Copilot",
    kind: "folder",
    cliAgent: "github-copilot",
    projectPath: ".github/skills",
    personalPath: "~/.copilot/skills",
    note: "Works in Copilot CLI, the cloud agent and agent mode in VS Code and JetBrains.",
    docs: "https://docs.github.com/en/copilot/concepts/agents/about-agent-skills",
  },
  {
    id: "antigravity",
    label: "Antigravity",
    kind: "folder",
    cliAgent: "antigravity",
    projectPath: ".agents/skills",
    personalPath: "~/.gemini/config/skills",
    docs: "https://antigravity.google/docs/skills/",
  },
  {
    id: "gemini-cli",
    label: "Gemini CLI",
    kind: "folder",
    cliAgent: "gemini-cli",
    projectPath: ".gemini/skills",
    personalPath: "~/.gemini/skills",
    note: "Run /skills to check it was found.",
    docs: "https://geminicli.com/docs/cli/skills/",
  },
] as const satisfies readonly SkillAgent[];

export type SkillAgentId = (typeof SKILL_AGENTS)[number]["id"];

export const SKILL_AGENT_IDS: readonly SkillAgentId[] = SKILL_AGENTS.map((agent) => agent.id);

export function toSkillAgent(value: string | null | undefined): SkillAgentId | undefined {
  return SKILL_AGENT_IDS.find((id) => id === value);
}

export function skillAgentLabel(id: SkillAgentId): string {
  return SKILL_AGENTS.find((agent) => agent.id === id)!.label;
}

/** Agents a skill works in: all of them, minus the ones staff marked. Unknown ids are ignored. */
export function agentsFor(excluded: readonly string[]): SkillAgentId[] {
  return SKILL_AGENT_IDS.filter((id) => !excluded.includes(id));
}

// ---------------------------------------------------------------------------
// Install text

type Source = { owner: string; repo: string; skill: string | null };

/** `npx skills add … -a claude-code`, the skills CLI's own per-agent install. */
export function agentInstallCommand(source: Source, cliAgent: string): string {
  const skill = source.skill ? ` --skill ${source.skill}` : "";
  return `npx skills add https://github.com/${source.owner}/${source.repo}${skill} -a ${cliAgent}`;
}

/**
 * A prompt to paste into a folder agent so it installs the skill itself —
 * for people who would rather not run a command. It names the exact folder
 * and asks the agent to show the files first, because installing a skill is
 * trusting its instructions.
 */
export function agentInstallPrompt(source: Source, agent: { label: string; projectPath: string }): string {
  const repo = `https://github.com/${source.owner}/${source.repo}`;
  const what = source.skill ? `the "${source.skill}" skill from ${repo}` : `the skills in ${repo}`;
  return [
    `Install ${what} for ${agent.label}.`,
    `Copy the skill folder (the one containing SKILL.md, with any scripts or reference files next to it) into ${agent.projectPath}/ in this project.`,
    "Before copying, show me the SKILL.md and list any scripts it includes, and wait for me to confirm.",
  ].join("\n");
}

// ---------------------------------------------------------------------------
// /skills filters

export type SkillFilters = {
  category?: SkillCategory;
  agent?: SkillAgentId;
  /** A GitHub owner, as it appears in the repo URL. */
  creator?: string;
};

const OWNER = /^[A-Za-z0-9][A-Za-z0-9-]{0,38}$/;

/** Untrusted URL params narrowed to real values. Unknown ones are dropped, not 404'd. */
export function toSkillFilters(params: { category?: string; agent?: string; creator?: string }): SkillFilters {
  return {
    category: toSkillCategory(params.category),
    agent: toSkillAgent(params.agent),
    creator: params.creator && OWNER.test(params.creator) ? params.creator : undefined,
  };
}

export function skillsHref(filters: SkillFilters): string {
  const query = new URLSearchParams();
  if (filters.category) query.set("category", filters.category);
  if (filters.agent) query.set("agent", filters.agent);
  if (filters.creator) query.set("creator", filters.creator);
  const search = query.toString();
  return search ? `/skills?${search}` : "/skills";
}

type FilterableSkill = {
  category: SkillCategory | null;
  agentsExcluded: readonly string[];
  creator: string | null;
};

/** Whether a skill passes every active filter. Creators compare case-insensitively, as GitHub does. */
export function matchesSkillFilters(skill: FilterableSkill, filters: SkillFilters): boolean {
  if (filters.category && skill.category !== filters.category) return false;
  if (filters.agent && skill.agentsExcluded.includes(filters.agent)) return false;
  if (filters.creator && skill.creator?.toLowerCase() !== filters.creator.toLowerCase()) return false;
  return true;
}

/**
 * Count per category for the tiles, within the other active filters — so a
 * tile's number is what clicking it would show.
 */
export function categoryCounts(
  skills: readonly FilterableSkill[],
  filters: SkillFilters,
): Map<SkillCategory, number> {
  const counts = new Map<SkillCategory, number>();
  for (const skill of skills) {
    if (!skill.category || !matchesSkillFilters(skill, { ...filters, category: undefined })) continue;
    counts.set(skill.category, (counts.get(skill.category) ?? 0) + 1);
  }
  return counts;
}
