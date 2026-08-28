import type { Enums } from "@/types/supabase";

export type AppRole = Enums<"app_role">;

/**
 * The staff gate, in one place (VIB-53).
 *
 * `app_role` is the staff axis — member | admin | super_admin — and is a
 * different thing from `role_level`, which is the audience tier a reader
 * picks for themselves. Nothing here should ever consult the other one.
 *
 * This mirrors migration 02's `is_staff()`, which is what actually protects
 * the data: every staff-write RLS policy calls it. Duplicating the rule in
 * TypeScript buys a 404 instead of an empty page, not security. Keep the two
 * lists identical — if a role is ever added to the enum, both change.
 */
const STAFF_ROLES: readonly AppRole[] = ["admin", "super_admin"];

/** True for staff. Null/undefined — signed out, or no profile — is not staff. */
export function isStaff(role: AppRole | null | undefined): boolean {
  return role != null && STAFF_ROLES.includes(role);
}
