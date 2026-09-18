import { getVercelOidcToken } from "@vercel/oidc";
import { unstable_cache } from "next/cache";

import {
  parseAudits,
  parseSkillDetail,
  parseSkillFiles,
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

/**
 * `cached: false` skips Next's data cache for this request. The detail
 * response carries every file's contents and runs to megabytes (VIB-176),
 * past the cache's 2MB ceiling, so it is fetched raw and only the parsed
 * result is cached — see getSkillDetail. Those megabytes get 15s rather
 * than 5s: a skill that never downloads in time would never be cached, and
 * after one success the next hour is served from the parsed copy.
 */
async function getJson(path: string, authenticated: boolean, cached = true): Promise<unknown> {
  const headers: Record<string, string> = {};
  if (authenticated) {
    const token = await oidcToken();
    if (!token) return null;
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API}${path}`, {
      headers,
      ...(cached ? { next: { revalidate: REVALIDATE_SECONDS } } : { cache: "no-store" as const }),
      // A hung request would hold the whole page until Vercel's 300s kill (VIB-175).
      signal: AbortSignal.timeout(cached ? 5000 : 15000),
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

/*
 * The parsed detail is a few kilobytes (paths, sizes, SKILL.md cut to 4000
 * characters) however large the raw response is, so this is what gets cached.
 * An unknown result throws, because unstable_cache does not store a throw: a
 * skills.sh outage is retried on the next render, not remembered for an hour.
 */
const cachedSkillDetail = unstable_cache(
  async (path: string) => {
    const detail = parseSkillDetail(await getJson(path, true, false));
    if (!detail) throw new Error(`skills.sh ${path}: no detail`);
    return detail;
  },
  ["skills-sh-detail"],
  { revalidate: REVALIDATE_SECONDS },
);

/** One skill's installs and files. Null for a pack, or when unknown. */
export async function getSkillDetail(source: SkillSource): Promise<SkillDetail | null> {
  if (!source.skill) return null;
  try {
    return await cachedSkillDetail(`/${skillPath(source)}`);
  } catch {
    // Already logged by getJson, or a shape we do not know.
    return null;
  }
}

/**
 * One skill's files with contents, for the ZIP download (VIB-132). Fetched
 * fresh on each download: the contents are the megabytes that cannot be
 * cached, and a download is rare next to a page view. Empty for a pack or
 * when unknown.
 */
export async function getSkillFiles(source: SkillSource): Promise<{ path: string; contents: string }[]> {
  if (!source.skill) return [];
  return parseSkillFiles(await getJson(`/${skillPath(source)}`, true, false));
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
