/**
 * Who wrote it (VIB-198).
 *
 * `content` has no author column, and every row in it was written by the
 * same person, so the byline is a site constant rather than a join. This is
 * a placeholder with a known ceiling and one honest owner — not a schema
 * decision.
 *
 * ponytail: one byline for the whole site; VIB-199 adds `content.author_id`
 * and this becomes the fallback for rows that predate it.
 */
export const SITE_BYLINE = {
  name: "Ali Rizwan",
  initials: "AR",
  bio: "Building Viberation. Writes about agent tooling that survives contact with a real codebase.",
} as const;
