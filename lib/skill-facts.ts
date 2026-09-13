import { z } from "zod";

/*
 * Skill facts, parsed and formatted (VIB-130).
 *
 * Pure and alias-free so it runs under plain `node --test`, for the same
 * reason lib/model-facts.ts is. The network half lives in
 * lib/integrations/skills-sh.ts and lib/integrations/github.ts; both hand
 * their raw JSON to the parsers here, so a response shape change is caught by
 * a test rather than by a visitor.
 */

/**
 * Same rule as the `tools_skills_sh_source_shape` CHECK: `owner/repo` for a
 * pack of skills, `owner/repo/skill` for one. GitHub owners keep their case
 * (`Leonxlnx`). Anchored segments that start alphanumeric, so `..` can never
 * reach the URL the adapter builds from it.
 */
export const SKILLS_SH_SOURCE =
  /^[A-Za-z0-9][A-Za-z0-9._-]*\/[A-Za-z0-9][A-Za-z0-9._-]*(\/[A-Za-z0-9][A-Za-z0-9._:-]*)?$/;

export type SkillSource = {
  owner: string;
  repo: string;
  /** Null for a pack: the pointer names a repository, not one skill in it. */
  skill: string | null;
};

/** Splits a stored pointer. Null when it does not have the CHECK's shape. */
export function parseSkillSource(value: string | null | undefined): SkillSource | null {
  if (!value || !SKILLS_SH_SOURCE.test(value)) return null;
  const [owner, repo, skill] = value.split("/");
  return { owner, repo, skill: skill ?? null };
}

/**
 * The command skills.sh itself prints. Shown, never run — installing a skill
 * puts third-party instructions into someone's agent, and that is their call
 * to make in their own terminal.
 */
export function installCommand(source: SkillSource): string {
  const base = `npx skills add https://github.com/${source.owner}/${source.repo}`;
  return source.skill ? `${base} --skill ${source.skill}` : base;
}

/**
 * `owner/repo` from a tool's outbound link when it is a GitHub repository.
 * Only github.com itself: a docs site that happens to mention a repo is not
 * the repo, and stars on the wrong one would be a wrong fact.
 */
export function githubRepoFromUrl(url: string | null | undefined): { owner: string; repo: string } | null {
  if (!url) return null;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:" || parsed.hostname !== "github.com") return null;
  const [owner, repo] = parsed.pathname.split("/").filter(Boolean);
  if (!owner || !repo) return null;
  const name = repo.replace(/\.git$/, "");
  const segment = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
  return segment.test(owner) && segment.test(name) ? { owner, repo: name } : null;
}

/** The repo a skill's GitHub facts come from: its skills.sh source, else its link. */
export function skillRepo(
  source: SkillSource | null,
  outboundUrl: string | null | undefined,
): { owner: string; repo: string } | null {
  return source ? { owner: source.owner, repo: source.repo } : githubRepoFromUrl(outboundUrl);
}

// ---------------------------------------------------------------------------
// skills.sh

export type SkillFile = { path: string; size: number };

export type SkillDetail = {
  installs: number | null;
  files: SkillFile[];
  /** SKILL.md, cut to SKILL_MD_PREVIEW characters. Plain text, never HTML. */
  skillMd: string | null;
  skillMdTruncated: boolean;
};

/** Enough of SKILL.md to judge what it does without shipping the whole file. */
export const SKILL_MD_PREVIEW = 4000;

const SkillDetailSchema = z.object({
  installs: z.number().nullish(),
  files: z
    .array(z.object({ path: z.string(), contents: z.string().nullish() }))
    .nullish(),
});

/** One skill's detail response, or null when it is not the shape we know. */
export function parseSkillDetail(raw: unknown): SkillDetail | null {
  const parsed = SkillDetailSchema.safeParse(raw);
  if (!parsed.success) return null;

  const files = (parsed.data.files ?? [])
    .map((file) => ({ path: file.path, size: file.contents?.length ?? 0 }))
    .sort((a, b) => a.path.localeCompare(b.path));
  const skillMd =
    parsed.data.files?.find((file) => /(^|\/)SKILL\.md$/i.test(file.path))?.contents ?? null;

  return {
    installs: parsed.data.installs ?? null,
    files,
    skillMd: skillMd ? skillMd.slice(0, SKILL_MD_PREVIEW) : null,
    skillMdTruncated: (skillMd?.length ?? 0) > SKILL_MD_PREVIEW,
  };
}

const SearchRowSchema = z.object({ source: z.string(), installs: z.number().nullish() });

/**
 * Total installs across every skill skills.sh lists under `owner/repo` — a
 * pack's number. Search results are matched on the exact source, so a fork
 * with a similar name adds nothing. Null when nothing matched.
 */
export function sumPackInstalls(raw: unknown, source: SkillSource): number | null {
  const body = z
    .union([
      z.array(z.unknown()),
      z.object({ data: z.array(z.unknown()) }).transform((b) => b.data),
      z.object({ skills: z.array(z.unknown()) }).transform((b) => b.skills),
    ])
    .safeParse(raw);
  if (!body.success) return null;

  const want = `${source.owner}/${source.repo}`.toLowerCase();
  let total = 0;
  let matched = false;
  for (const row of body.data) {
    const parsed = SearchRowSchema.safeParse(row);
    if (parsed.success && parsed.data.source.toLowerCase() === want) {
      matched = true;
      total += parsed.data.installs ?? 0;
    }
  }
  return matched ? total : null;
}

export type AuditStatus = "pass" | "warn" | "fail";

export type SkillAudit = {
  provider: string;
  status: AuditStatus;
  summary: string | null;
  /** ISO 8601. */
  auditedAt: string | null;
  riskLevel: string | null;
};

const AuditSchema = z.object({
  provider: z.string(),
  status: z.enum(["pass", "warn", "fail"]),
  summary: z.string().nullish(),
  auditedAt: z.string().nullish(),
  riskLevel: z.string().nullish(),
});

/** The audit list. A malformed row costs that row, not the table. */
export function parseAudits(raw: unknown): SkillAudit[] {
  const body = z.object({ audits: z.array(z.unknown()) }).safeParse(raw);
  if (!body.success) return [];
  return body.data.audits.flatMap((row) => {
    const parsed = AuditSchema.safeParse(row);
    return parsed.success
      ? [
          {
            provider: parsed.data.provider,
            status: parsed.data.status,
            summary: parsed.data.summary ?? null,
            auditedAt: parsed.data.auditedAt ?? null,
            riskLevel: parsed.data.riskLevel ?? null,
          },
        ]
      : [];
  });
}

// ---------------------------------------------------------------------------
// GitHub

export type RepoFacts = {
  stars: number;
  /** ISO 8601, the last push to any branch. */
  pushedAt: string | null;
  /** SPDX id, e.g. "MIT". Null for none or GitHub's "NOASSERTION". */
  license: string | null;
  archived: boolean;
};

const RepoSchema = z.object({
  stargazers_count: z.number(),
  pushed_at: z.string().nullish(),
  archived: z.boolean().nullish(),
  license: z.object({ spdx_id: z.string().nullish() }).nullish(),
});

export function parseRepo(raw: unknown): RepoFacts | null {
  const parsed = RepoSchema.safeParse(raw);
  if (!parsed.success) return null;
  const spdx = parsed.data.license?.spdx_id;
  return {
    stars: parsed.data.stargazers_count,
    pushedAt: parsed.data.pushed_at ?? null,
    license: spdx && spdx !== "NOASSERTION" ? spdx : null,
    archived: parsed.data.archived ?? false,
  };
}

// ---------------------------------------------------------------------------
// Formatting

const COMPACT = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

/** 881,300 → "881.3K". */
export function formatCount(value: number): string {
  return COMPACT.format(value);
}

const DAY = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

/** "2026-09-03T16:37:00Z" → "3 Sep 2026". Null for a date that does not parse. */
export function formatDay(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : DAY.format(date);
}

/** "881.3K installs · 176K stars" for a skill card; "" when neither is known. */
export function skillLine(installs: number | null, stars: number | null): string {
  return [
    installs !== null ? `${formatCount(installs)} installs` : null,
    stars !== null ? `${formatCount(stars)} stars` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

/** Most installed first; unknown installs after, by stars, then by name. */
export function bySkillPopularity<T extends { name: string; installs: number | null; stars: number | null }>(
  a: T,
  b: T,
): number {
  return (
    (b.installs ?? -1) - (a.installs ?? -1) ||
    (b.stars ?? -1) - (a.stars ?? -1) ||
    a.name.localeCompare(b.name)
  );
}

// ---------------------------------------------------------------------------
// The /skills hub

/** Facet tag that puts a tool or guide on the /skills hub's resources. */
export const SKILLS_HUB_TAG = "skills-ecosystem";

export type HubGroupKey = "install" | "discover";

export const HUB_GROUPS: ReadonlyArray<{ key: HubGroupKey; title: string; blurb: string }> = [
  {
    key: "install",
    title: "Install and manage",
    blurb: "Package managers and CLIs that put skills into Claude Code, Cursor, Codex and the rest.",
  },
  {
    key: "discover",
    title: "Find more skills",
    blurb: "Directories, leaderboards and curated lists, most with security checks on each skill.",
  },
];

/**
 * Which resource group a tagged tool belongs in. Command-line tools install
 * things; everything else is somewhere to look for them. Skills themselves
 * are the hub's main grid, so they are not a resource.
 */
export function hubGroupFor(category: string): HubGroupKey | null {
  if (category === "skills") return null;
  return category === "clis" ? "install" : "discover";
}
