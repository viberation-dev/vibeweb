import { getVercelOidcToken } from "@vercel/oidc";

import {
  parseAudits,
  parseSkillDetail,
  sumPackInstalls,
  type SkillAudit,
  type SkillDetail,
  type SkillSource,
} from "@/lib/skill-facts";

/**
 * skills.sh adapter (VIB-130).
 *
 * The one module that knows install counts, skill files and security audits
 * come from skills.sh. Free, with no key to leak: the leaderboard, search and
 * detail endpoints authenticate with the Vercel OIDC token every Vercel
 * deployment already has (600 requests a minute per project). The audit
 * endpoint is public.
 *
 * Every failure — no token (local dev without `vercel env pull`), network,
 * non-200, a changed shape — resolves to "nothing known", never a throw, the
 * same contract as lib/integrations/openrouter.ts. A skill page without an
 * install count is still a useful page.
 */

const API = "https://skills.sh/api/v1/skills";

/*
 * Installs move by the day. An hour matches the OpenRouter adapter and keeps
 * a busy page well under the rate limit.
 *
 * ponytail: the detail response carries every file's contents. A skill
 * bundling large assets could pass Next's 2MB data-cache ceiling, at which
 * point that one skill silently stops caching; move to a leaner endpoint if
 * skills.sh ever offers one.
 */
const REVALIDATE_SECONDS = 3600;

async function oidcToken(): Promise<string | null> {
  try {
    return await getVercelOidcToken();
  } catch {
    // Outside Vercel with no pulled token. Expected locally; not an error.
    return null;
  }
}

async function getJson(path: string, authenticated: boolean): Promise<unknown> {
  const headers: Record<string, string> = {};
  if (authenticated) {
    const token = await oidcToken();
    if (!token) return null;
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API}${path}`, {
      headers,
      next: { revalidate: REVALIDATE_SECONDS },
    });
    // 404 is an answer — no audits yet, or not listed — not a fault to log.
    if (response.status === 404) return null;
    if (!response.ok) {
      console.error(`skills.sh ${path}: HTTP ${response.status}`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error(`skills.sh ${path}:`, error);
    return null;
  }
}

/*
 * Paths are built only from a parsed SkillSource, whose segments the
 * SKILLS_SH_SOURCE rule (and the column CHECK behind it) hold to
 * [A-Za-z0-9._:-] — nothing that can leave /api/v1/skills/.
 */
const skillPath = (source: SkillSource) =>
  `${source.owner}/${source.repo}${source.skill ? `/${source.skill}` : ""}`;

/** One skill's installs and files. Null for a pack, or when unknown. */
export async function getSkillDetail(source: SkillSource): Promise<SkillDetail | null> {
  if (!source.skill) return null;
  return parseSkillDetail(await getJson(`/${skillPath(source)}`, true));
}

/**
 * Installs for the card line: the skill's own count, or for a pack the sum
 * across the repository's skills.
 */
export async function getSkillInstalls(source: SkillSource): Promise<number | null> {
  if (source.skill) return (await getSkillDetail(source))?.installs ?? null;

  const query = new URLSearchParams({ q: source.repo, owner: source.owner, limit: "200" });
  return sumPackInstalls(await getJson(`/search?${query}`, true), source);
}

/** Third-party audit results for one skill. Empty for a pack or none yet. */
export async function getSkillAudits(source: SkillSource): Promise<SkillAudit[]> {
  if (!source.skill) return [];
  return parseAudits(await getJson(`/audit/${skillPath(source)}`, false));
}
