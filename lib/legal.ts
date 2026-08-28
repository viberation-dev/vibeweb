/**
 * Shared facts for /privacy and /terms (VIB-57).
 *
 * Here rather than inline in both pages because these are the two values Ali
 * will actually edit, and a contact address that is right on one legal page
 * and stale on the other is worse than no address at all.
 *
 * ponytail: two constants, not a CMS. If legal copy ever needs to change
 * without a deploy, that is a `content` row question — see CLAUDE.md.
 */

/**
 * The address both legal pages tell people to use for privacy requests and
 * account deletion. It has to be one that is actually monitored — a policy
 * pointing at a dead inbox is worse than no policy.
 */
export const LEGAL_CONTACT_EMAIL = "hello@viberation.dev";

/** Shown on both pages. Bump when the wording changes. */
export const LEGAL_LAST_UPDATED = "29 August 2026";
