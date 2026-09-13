import { IconX } from "@tabler/icons-react";
import Link from "next/link";

import { SkillCategoryIcon } from "@/components/features/skills/SkillCategoryIcon";
import { buttonVariants } from "@/components/ui/button";
import {
  SKILL_AGENTS,
  SKILL_CATEGORIES,
  skillsHref,
  type SkillCategory,
  type SkillFilters as Filters,
} from "@/lib/skill-taxonomy";
import { cn } from "@/lib/utils";

type Props = {
  filters: Filters;
  /** Per category, within the other active filters. Categories with none are hidden. */
  counts: Map<SkillCategory, number>;
  /** GitHub owners with at least one listed skill, alphabetical. */
  creators: string[];
};

/**
 * The /skills filters (VIB-132): category tiles, agent chips and a creator
 * select. Links and a GET form, never client state, so every filtered view
 * has a URL and the page stays server-rendered, like the tools directory.
 */
export function SkillFilters({ filters, counts, creators }: Props) {
  const active = Boolean(filters.category || filters.agent || filters.creator);
  const categories = SKILL_CATEGORIES.filter(
    (category) => counts.has(category.value) || category.value === filters.category,
  );

  return (
    <div className="space-y-6">
      {categories.length ? (
        <nav aria-label="Skill categories">
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
              const selected = filters.category === category.value;
              return (
                <li key={category.value}>
                  <Link
                    href={skillsHref({ ...filters, category: selected ? undefined : category.value })}
                    aria-current={selected ? "page" : undefined}
                    scroll={false}
                    className={cn(
                      "flex items-center gap-3.5 rounded-2xl border p-3.5 transition-colors",
                      selected
                        ? "border-primary bg-primary/10"
                        : "bg-secondary hover:bg-primary/10 border-transparent",
                    )}
                  >
                    <span className="bg-background flex size-11 shrink-0 items-center justify-center rounded-xl">
                      <SkillCategoryIcon category={category.value} className="text-primary size-5" />
                    </span>
                    <span className="min-w-0 flex-1 truncate font-bold tracking-tight">{category.label}</span>
                    <span className="text-muted-foreground text-sm">{counts.get(category.value) ?? 0}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <nav aria-label="Works with">
          <p className="text-muted-foreground mb-2 text-xs font-bold tracking-widest uppercase">Works with</p>
          <ul className="flex flex-wrap gap-2">
            {SKILL_AGENTS.map((agent) => {
              const selected = filters.agent === agent.id;
              return (
                <li key={agent.id}>
                  <Link
                    href={skillsHref({ ...filters, agent: selected ? undefined : agent.id })}
                    aria-current={selected ? "page" : undefined}
                    scroll={false}
                    className={cn(
                      "inline-flex rounded-full border px-3 py-1 text-sm transition-colors",
                      selected
                        ? "border-primary bg-primary/10 text-foreground font-medium"
                        : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                    )}
                  >
                    {agent.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {creators.length ? (
          /*
            A GET form so it works without JavaScript; the hidden inputs carry
            the other filters through instead of clearing them.
          */
          <form method="get" action="/skills" className="flex items-end gap-2">
            <label className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
              Creator
              <select
                name="creator"
                defaultValue={filters.creator ?? ""}
                className="border-input bg-background text-foreground mt-2 block h-9 min-w-44 rounded-md border px-3 text-sm font-normal tracking-normal normal-case"
              >
                <option value="">Everyone</option>
                {creators.map((creator) => (
                  <option key={creator} value={creator}>
                    {creator}
                  </option>
                ))}
              </select>
            </label>
            {filters.category ? <input type="hidden" name="category" value={filters.category} /> : null}
            {filters.agent ? <input type="hidden" name="agent" value={filters.agent} /> : null}
            <button type="submit" className={buttonVariants({ variant: "outline", size: "sm" })}>
              Apply
            </button>
          </form>
        ) : null}
      </div>

      {active ? (
        <Link
          href="/skills"
          scroll={false}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
        >
          <IconX aria-hidden className="size-4" />
          Clear filters
        </Link>
      ) : null}
    </div>
  );
}
