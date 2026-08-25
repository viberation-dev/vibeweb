import Link from "next/link";

import {
  ALL_LEVELS,
  LEARN_TYPES,
  learnHref,
  ROLE_LEVELS,
  type ContentType,
  type LevelParam,
  type RoleLevel,
} from "@/lib/learn";
import { cn } from "@/lib/utils";

type Props = {
  type?: ContentType;
  /** The raw `?level=` choice — undefined means "whatever my profile says". */
  level?: LevelParam;
  /** The tier actually being filtered on, after the profile default applies. */
  effectiveLevel?: RoleLevel;
  /** Whether a signed-in profile is supplying that default. */
  hasProfileLevel: boolean;
};

const chip =
  "rounded-full border px-3 py-1 text-sm transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
const chipActive = "border-transparent bg-primary text-primary-foreground hover:bg-primary/80";

/**
 * Content-type nav + skill-level filter for the Learn hub.
 *
 * Plain links, no client component: the filter state lives entirely in the
 * URL, so it is shareable, back-button-correct and works without JS. No chip
 * carries `page`, so changing a filter resets to page 1 — the only sane
 * destination when the result set just changed under you.
 *
 * The level chips highlight the *effective* tier, so a signed-in beginner
 * can see their profile default is doing something before they touch it,
 * and "All levels" is always an explicit escape from it.
 */
export function LearnFilters({ type, level, effectiveLevel, hasProfileLevel }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <nav aria-label="Content types" className="flex flex-wrap gap-2">
        <Link
          href={learnHref({ level })}
          aria-current={type ? undefined : "page"}
          className={cn(chip, !type && chipActive)}
        >
          Everything
        </Link>
        {LEARN_TYPES.map(({ value, label }) => {
          const active = type === value;
          return (
            <Link
              key={value}
              href={learnHref({ type: active ? undefined : value, level })}
              aria-current={active ? "page" : undefined}
              className={cn(chip, active && chipActive)}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Level</span>
        {ROLE_LEVELS.map(({ value, label }) => {
          const active = effectiveLevel === value;
          return (
            <Link
              key={value}
              /*
               * Clicking the active tier clears the param rather than
               * re-asserting it — but only when the profile is not the thing
               * making it active, since clearing it there would change
               * nothing and read as a dead chip.
               */
              href={learnHref({
                type,
                level: active && !hasProfileLevel ? undefined : value,
              })}
              aria-current={active ? "page" : undefined}
              className={cn(chip, "text-xs", active && chipActive)}
            >
              {label}
            </Link>
          );
        })}
        <Link
          href={learnHref({ type, level: ALL_LEVELS })}
          aria-current={effectiveLevel ? undefined : "page"}
          className={cn(chip, "text-xs", !effectiveLevel && chipActive)}
        >
          All levels
        </Link>
      </div>

      {effectiveLevel && !level && hasProfileLevel ? (
        <p className="text-sm text-muted-foreground">
          Showing what suits your {effectiveLevel} level, plus everything written for all levels.
        </p>
      ) : null}
    </div>
  );
}
