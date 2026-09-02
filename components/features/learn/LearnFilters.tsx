import { IconChevronDown } from "@tabler/icons-react";
import Link from "next/link";

import {
  DEFAULT_LEARN_SORT,
  LEARN_SORTS,
  LEARN_TYPES,
  learnHref,
  learnSortOrder,
  type ContentType,
  type LearnSort,
} from "@/lib/learn";
import { ALL_LEVELS, ROLE_LEVELS, type LevelParam, type RoleLevel } from "@/lib/role-level";
import { cn } from "@/lib/utils";

type Props = {
  type?: ContentType;
  /** The raw `?level=` choice — undefined means "whatever my profile says". */
  level?: LevelParam;
  /** The tier actually being filtered on, after the profile default applies. */
  effectiveLevel?: RoleLevel;
  /** Whether a signed-in profile is supplying that default. */
  hasProfileLevel: boolean;
  sort?: LearnSort;
};

const chip =
  "rounded-full border px-3 py-1 text-sm transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
const chipActive = "border-transparent bg-primary text-primary-foreground hover:bg-primary/80";
const control =
  "text-muted-foreground hover:text-foreground flex cursor-pointer list-none items-center gap-1 rounded-md border px-3 py-1 text-sm";
const menu = "bg-background absolute left-0 z-20 mt-2 w-48 rounded-md border p-1 shadow-md";
const menuItem = "hover:bg-accent block rounded px-2 py-1 text-sm";

/**
 * The Learn hub's filter row (VIB-85, mockup screen 10).
 *
 * **Two axes, not three.** The mockup draws "For: <level>" and "Difficulty"
 * as separate dropdowns, but `content` has one `role_level` column and it is
 * both: the tier a piece was written for *is* its difficulty. Two controls
 * driving one column would contradict each other the moment they disagreed,
 * so there is one level control, rendered as the mockup's dropdown.
 *
 * **No pillar chips.** The mockup's six editorial pillars (Fundamentals,
 * Context eng, …) have no data model — `content` has `type` and `audience`,
 * and the tags on the published rows are topics, not pillars. Filter chips
 * over a taxonomy that does not exist would be decoration; the taxonomy is
 * its own issue. The type chips are the real axis in its place.
 *
 * Plain links, native <details>, no client component: the filter state lives
 * entirely in the URL, so it is shareable, back-button-correct and works
 * without JS. No control carries `page`, so changing a filter resets to page
 * 1 — the only sane destination when the result set just changed under you.
 */
export function LearnFilters({ type, level, effectiveLevel, hasProfileLevel, sort }: Props) {
  const activeSort = sort ?? DEFAULT_LEARN_SORT;

  return (
    <div className="flex flex-col gap-3">
      <nav aria-label="Content types" className="flex flex-wrap gap-2">
        <Link
          href={learnHref({ level, sort })}
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
              href={learnHref({ type: active ? undefined : value, level, sort })}
              aria-current={active ? "page" : undefined}
              className={cn(chip, active && chipActive)}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-wrap items-center gap-2">
        {/*
          Native <details> rather than a select or a menu library: it needs no
          JavaScript, no client component, and each option stays a real link
          with a shareable URL behind it. Same control as the directory's sort.
        */}
        <details className="relative">
          <summary className={control}>
            For: {effectiveLevel ? levelLabel(effectiveLevel) : "All levels"}
            <IconChevronDown aria-hidden className="size-3.5" />
          </summary>
          <div className={menu}>
            <ul>
              {ROLE_LEVELS.map(({ value, label }) => {
                const active = effectiveLevel === value;
                return (
                  <li key={value}>
                    <Link
                      /*
                       * Picking the active tier clears the param rather than
                       * re-asserting it — but only when the profile is not the
                       * thing making it active, since clearing it there would
                       * change nothing and read as a dead option.
                       */
                      href={learnHref({
                        type,
                        sort,
                        level: active && !hasProfileLevel ? undefined : value,
                      })}
                      aria-current={active ? "page" : undefined}
                      className={cn(menuItem, active && "font-medium")}
                    >
                      {label}
                    </Link>
                  </li>
                );
              })}
              <li>
                <Link
                  href={learnHref({ type, sort, level: ALL_LEVELS })}
                  aria-current={effectiveLevel ? undefined : "page"}
                  className={cn(menuItem, !effectiveLevel && "font-medium")}
                >
                  All levels
                </Link>
              </li>
            </ul>
          </div>
        </details>

        <details className="relative">
          <summary className={control}>
            Sort: {learnSortOrder(activeSort).label}
            <IconChevronDown aria-hidden className="size-3.5" />
          </summary>
          <div className={menu}>
            <ul>
              {LEARN_SORTS.map(({ value, label }) => (
                <li key={value}>
                  <Link
                    /*
                     * The default sort is expressed by *omitting* ?sort=, so
                     * the plain /learn URL stays canonical instead of gaining
                     * a param that means what no param already meant.
                     */
                    href={learnHref({
                      type,
                      level,
                      sort: value === DEFAULT_LEARN_SORT ? undefined : value,
                    })}
                    aria-current={activeSort === value ? "page" : undefined}
                    className={cn(menuItem, activeSort === value && "font-medium")}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </details>
      </div>

      {effectiveLevel && !level && hasProfileLevel ? (
        <p className="text-muted-foreground text-sm">
          Showing what suits your {effectiveLevel} level, plus everything written for all levels.
        </p>
      ) : null}
    </div>
  );
}

function levelLabel(level: RoleLevel): string {
  // The `satisfies` on ROLE_LEVELS guarantees a match.
  return ROLE_LEVELS.find((l) => l.value === level)!.label;
}
