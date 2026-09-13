import { strToU8, zipSync, type Zippable } from "fflate";

/*
 * A skill's files as a ZIP (VIB-132).
 *
 * Pure so it runs under plain `node --test`. The files come from skills.sh,
 * which is third-party input: every path is normalised here so nothing in the
 * archive can land outside the skill's own folder when someone unzips it
 * (the "zip slip" problem), and the total is capped so one oversized skill
 * cannot make the route build a huge response.
 */

/** Well above any real skill (the largest we list is a few hundred KB). */
export const SKILL_ZIP_MAX_BYTES = 5 * 1024 * 1024;

const SEGMENT = /^[A-Za-z0-9._@+ -]+$/;

/**
 * A safe relative path inside the archive, or null to skip the file.
 * Rejects absolute paths, drive letters, `..`, empty segments and anything
 * outside a conservative character set.
 */
export function safeZipPath(path: string): string | null {
  const parts = path.replace(/\\/g, "/").split("/");
  if (parts.length === 0 || parts.length > 20) return null;
  for (const part of parts) {
    if (part === "" || part === "." || part === ".." || !SEGMENT.test(part)) return null;
  }
  return parts.join("/");
}

export type SkillZipResult =
  | { ok: true; bytes: Uint8Array; files: number }
  | { ok: false; reason: "empty" | "too_large" };

/**
 * Zips `files` under a single top-level folder named after the skill, which
 * is the layout Claude.ai and ChatGPT expect on upload and the one a skills
 * folder wants when unzipped in place.
 */
export function buildSkillZip(
  folder: string,
  files: ReadonlyArray<{ path: string; contents: string }>,
): SkillZipResult {
  const root = safeZipPath(folder);
  if (!root || root.includes("/")) return { ok: false, reason: "empty" };

  const tree: Zippable = {};
  let total = 0;
  let count = 0;
  for (const file of files) {
    const path = safeZipPath(file.path);
    if (!path) continue;
    const bytes = strToU8(file.contents);
    total += bytes.length;
    if (total > SKILL_ZIP_MAX_BYTES) return { ok: false, reason: "too_large" };
    tree[`${root}/${path}`] = bytes;
    count += 1;
  }
  // A skill with no SKILL.md is not a skill any agent can load.
  if (!(`${root}/SKILL.md` in tree)) return { ok: false, reason: "empty" };

  return { ok: true, bytes: zipSync(tree, { level: 6 }), files: count };
}
