import type { Enums } from "@/types/supabase";

export type RoleLevel = Enums<"role_level">;

/**
 * Role-based content display, in one place (VIB-40).
 *
 * Every surface that adapts to a reader's tier — Learn, the home feed, and
 * whatever comes next — resolves the tier here and filters with the same
 * rule, rather than each page growing its own conditionals.
 *
 * The rule: a row's `role_level` is the tier it was written for, and a null
 * `role_level` means "written for everyone". Filtering to a tier therefore
 * means *that tier plus the universal rows* — never that tier alone.
 */

export const ROLE_LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "expert", label: "Expert" },
] as const satisfies ReadonlyArray<{ value: RoleLevel; label: string }>;

/** Narrows an untrusted string to a real tier, or undefined. */
export function toRoleLevel(value: string | undefined): RoleLevel | undefined {
  return ROLE_LEVELS.some((l) => l.value === value) ? (value as RoleLevel) : undefined;
}

/** `?level=all` — the explicit "ignore my tier, show everything" choice. */
export const ALL_LEVELS = "all";

export type LevelParam = RoleLevel | typeof ALL_LEVELS;

/** Narrows an untrusted `?level=` value to a real choice, or undefined. */
export function toLevelParam(value: string | undefined): LevelParam | undefined {
  if (value === ALL_LEVELS) return ALL_LEVELS;
  return toRoleLevel(value);
}

/**
 * The tier a listing actually filters on.
 *
 * Three distinct states, which is why this is a function and not a `??`:
 *   - no param        → fall back to the signed-in user's tier (null signed out)
 *   - `?level=all`    → no tier filter, even when signed in
 *   - `?level=expert` → that tier, overriding the profile
 *
 * `undefined` means "no filter". Content with a null `role_level` is meant
 * for everyone and is never excluded by any of these.
 */
export function resolveRoleLevel(
  param: LevelParam | undefined,
  profileLevel: RoleLevel | null,
): RoleLevel | undefined {
  if (param === ALL_LEVELS) return undefined;
  if (param) return param;
  return profileLevel ?? undefined;
}

/**
 * The PostgREST `.or()` filter for one tier.
 *
 * Kept beside the rule it implements so the "plus the universal rows" half
 * cannot be forgotten by a caller writing its own `.eq()`.
 */
export function roleLevelFilter(level: RoleLevel): string {
  return `role_level.is.null,role_level.eq.${level}`;
}
