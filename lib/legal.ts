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
 * TODO(ali): confirm before launch. This is the address the site tells people
 * to use for privacy requests and account deletion, so it has to be one that
 * is actually read. Deliberately not defaulted to the Supabase/GitHub account
 * address — publishing a personal inbox on a public page is your call.
 */
export const LEGAL_CONTACT_EMAIL = "hello@viberation.example";

/** Shown on both pages. Bump when the wording changes. */
export const LEGAL_LAST_UPDATED = "28 August 2026";
