/*
 * Agent CLIs and where each one keeps its settings and instructions.
 *
 * The third matrix, after SKILL_AGENTS (lib/skill-taxonomy.ts) and
 * MCP_CLIENTS (lib/mcp-clients.ts). Pure and alias-free so it runs under
 * plain `node --test`.
 *
 * Checked against each vendor's own docs on 2026-10-02 (links in `docs`).
 *
 * Deliberately *not* here:
 *
 *   - The install command. It already lives in `tools.key_facts` for every
 *     row in the `clis` category and renders on the tool page. Copying it
 *     here would make two places to update and one to forget, which is the
 *     thing these matrices exist to stop.
 *   - MCP config. Four of these CLIs take MCP servers; those paths are in
 *     MCP_CLIENTS under the same ids.
 *   - Login, update and version commands. Vendor-churny, low value in a
 *     guide, and `--help` answers them on the day the reader asks.
 *
 * What is here is the part that collides: run four of these in one repo and
 * you have four binaries on PATH, four global config directories, and up to
 * four instruction files that each tool reads differently.
 */

/**
 * What a CLI does with an `AGENTS.md` it finds in the repo. Four real
 * behaviours, and the difference between them is the single most common
 * wrong assumption about these tools — "they all read AGENTS.md now" is not
 * true of any two of them in the same way.
 */
export type AgentsMdSupport =
  /** Reads it as its own instruction file. */
  | "reads"
  /** Reads it only where its own file is absent. */
  | "fallback"
  /** Reads it only once you name it in config. */
  | "opt-in"
  /** Does not read it. */
  | "no";

export type CodingCli = {
  /** Matches the tool's `slug` in the directory. */
  id: string;
  label: string;
  /** The command name it puts on your PATH. */
  binary: string;
  /** File or directory holding its global settings and sign-in. */
  globalConfig: string;
  /** Environment variable that moves `globalConfig`, where one exists. */
  globalConfigEnv?: string;
  /** Instruction file it reads at the repo root, committed for the team. */
  projectInstructions: string | null;
  /** The same, for every project on your machine. */
  personalInstructions: string | null;
  agentsMd: AgentsMdSupport;
  note?: string;
  docs: string;
};

/*
 * Six of the ten rows in the `clis` category.
 *
 * Left out on purpose: Kimi Code CLI, whose published docs do not state a
 * config directory or an instruction file clearly enough to put in a table
 * other guides will render — add it when they do. The three skill managers
 * (skills CLI, skild, SkillKit) are also in that category and are not agents;
 * their per-agent install is already SKILL_AGENTS' job.
 */
export const CODING_CLIS = [
  {
    id: "aider",
    label: "Aider",
    binary: "aider",
    globalConfig: "~/.aider.conf.yml",
    projectInstructions: "CONVENTIONS.md",
    personalInstructions: null,
    agentsMd: "no",
    note: "The odd one out: Aider loads nothing automatically. CONVENTIONS.md is a convention, not a path it looks for — you pass `--read CONVENTIONS.md`, or put `read: CONVENTIONS.md` in .aider.conf.yml, which can also sit at the repo root rather than in your home directory.",
    docs: "https://aider.chat/docs/usage/conventions.html",
  },
  {
    id: "claude-code",
    label: "Claude Code",
    binary: "claude",
    globalConfig: "~/.claude/",
    globalConfigEnv: "CLAUDE_CONFIG_DIR",
    projectInstructions: "CLAUDE.md",
    personalInstructions: "~/.claude/CLAUDE.md",
    agentsMd: "fallback",
    note: "Reads AGENTS.md only where there is no CLAUDE.md, .claude/CLAUDE.md or CLAUDE.local.md in the working directory or above it. If you have both, the CLAUDE.md is the one being read — so adding a CLAUDE.local.md to a repo that relies on AGENTS.md silently stops the AGENTS.md loading. Also reads .claude/rules/*.md, and files up the directory tree are concatenated rather than overridden.",
    docs: "https://code.claude.com/docs/en/memory",
  },
  {
    id: "codex",
    label: "Codex",
    binary: "codex",
    globalConfig: "~/.codex/",
    globalConfigEnv: "CODEX_HOME",
    projectInstructions: "AGENTS.md",
    personalInstructions: "~/.codex/AGENTS.md",
    agentsMd: "reads",
    note: "AGENTS.md is its native file, not a compatibility shim. An AGENTS.override.md beside it wins. Files are concatenated from the project root down to your working directory, so the nearest one is read last.",
    docs: "https://developers.openai.com/codex/guides/agents-md",
  },
  {
    id: "gemini-cli",
    label: "Gemini CLI",
    binary: "gemini",
    globalConfig: "~/.gemini/",
    projectInstructions: "GEMINI.md",
    personalInstructions: "~/.gemini/GEMINI.md",
    agentsMd: "opt-in",
    note: 'Reads GEMINI.md, not AGENTS.md, until you say otherwise: set `"context": { "fileName": ["AGENTS.md", "GEMINI.md"] }` in settings.json and it reads both. Run /memory show to see exactly what it loaded.',
    docs: "https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/gemini-md.md",
  },
  {
    id: "opencode",
    label: "opencode",
    binary: "opencode",
    globalConfig: "~/.config/opencode/",
    projectInstructions: "AGENTS.md",
    personalInstructions: "~/.config/opencode/AGENTS.md",
    agentsMd: "reads",
    note: "Falls back to CLAUDE.md where there is no AGENTS.md, and to ~/.claude/CLAUDE.md for the personal one — so it picks up a Claude Code setup without being told to.",
    docs: "https://opencode.ai/docs/rules/",
  },
  {
    id: "qwen-code",
    label: "Qwen Code",
    binary: "qwen",
    globalConfig: "~/.qwen/",
    projectInstructions: "QWEN.md",
    personalInstructions: "~/.qwen/QWEN.md",
    agentsMd: "reads",
    note: "Reads an existing AGENTS.md as well as QWEN.md, so a repo set up for other agents needs nothing added. .qwen/ is not gitignored for you.",
    docs: "https://github.com/QwenLM/qwen-code/blob/main/docs/users/features/memory.md",
  },
] as const satisfies readonly CodingCli[];

export type CodingCliId = (typeof CODING_CLIS)[number]["id"];

export const CODING_CLI_IDS: readonly CodingCliId[] = CODING_CLIS.map((cli) => cli.id);

/** Narrows an untrusted string — a tab key, a `?cli=` — to a real CLI. */
export function toCodingCli(value: string | null | undefined): CodingCliId | undefined {
  return CODING_CLI_IDS.find((id) => id === value);
}

export function codingCliLabel(id: CodingCliId): string {
  return CODING_CLIS.find((cli) => cli.id === id)!.label;
}

/**
 * One line on what a CLI does with an AGENTS.md, for a table cell.
 *
 * A sentence rather than the raw enum: "fallback" on its own tells a reader
 * nothing, and the follow-up question is always "fallback from what".
 */
export function agentsMdLine(id: CodingCliId): string {
  const cli = CODING_CLIS.find((c) => c.id === id)!;
  switch (cli.agentsMd) {
    case "reads":
      return "Reads it.";
    case "fallback":
      return `Reads it only where there is no ${cli.projectInstructions}.`;
    case "opt-in":
      return `Reads ${cli.projectInstructions} instead, unless you name AGENTS.md in its config.`;
    case "no":
      return "Does not read it.";
  }
}

/**
 * The instruction files a repo would need to satisfy every one of these CLIs,
 * deduplicated.
 *
 * The honest answer to "which file do I write?" — and the number is the point.
 * Deduplicating only works because three of them read AGENTS.md; the list is
 * what is left over after that.
 */
export function instructionFilesFor(ids: readonly CodingCliId[]): string[] {
  const files = new Set<string>();
  for (const id of ids) {
    const cli = CODING_CLIS.find((c) => c.id === id)!;
    if (cli.agentsMd === "reads") {
      files.add("AGENTS.md");
      continue;
    }
    if (cli.projectInstructions) files.add(cli.projectInstructions);
  }
  return [...files];
}
