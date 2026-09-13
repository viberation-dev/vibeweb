import { parseRepo, type RepoFacts } from "@/lib/skill-facts";

/**
 * GitHub adapter (VIB-130).
 *
 * The one module that knows stars, last push and licence come from GitHub's
 * REST API. Works with no key at 60 requests an hour per server IP; set
 * `GITHUB_TOKEN` (a fine-grained token with no permissions — public data
 * only) in Vercel to raise that to 5,000. Server-only: the token never
 * reaches the browser.
 *
 * Every failure, rate limiting included, resolves to null — the same
 * contract as the OpenRouter and skills.sh adapters.
 */

const API = "https://api.github.com";

/*
 * Stars and pushes move slowly. Six hours keeps the unauthenticated budget
 * comfortable: a cold cache costs one call per repo, not one per view.
 */
const REVALIDATE_SECONDS = 6 * 3600;

/** `owner` and `repo` come from githubRepoFromUrl or a parsed SkillSource, both segment-checked. */
export async function getRepoFacts(owner: string, repo: string): Promise<RepoFacts | null> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  try {
    const response = await fetch(`${API}/repos/${owner}/${repo}`, {
      headers,
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!response.ok) {
      console.error(`github ${owner}/${repo}: HTTP ${response.status}`);
      return null;
    }
    return parseRepo(await response.json());
  } catch (error) {
    console.error(`github ${owner}/${repo}:`, error);
    return null;
  }
}
