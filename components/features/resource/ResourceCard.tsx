import Link from "next/link";
import type { ReactNode } from "react";

import { DifficultyBadge } from "@/components/features/resource/DifficultyBadge";
import { TagPill } from "@/components/ui/tag-pill";
import type { RoleLevel } from "@/lib/role-level";
import { cn } from "@/lib/utils";

export type ResourceCardProps = {
  /** Where the whole card links to. */
  href: string;
  title: string;
  /** Optional square glyph beside the title — the directory's category icon. */
  icon?: ReactNode;
  /** Small label above the title — a category, content type, or collection name. */
  eyebrow?: string;
  description?: string | null;
  /** Short pills under the description: tags, pricing tier. */
  badges?: string[];
  /**
   * Skill tier, rendered as the design system's DifficultyBadge rather than
   * a plain pill — its hues are fixed per level so "Beginner" reads the same
   * colour in every theme (readme "Colour").
   */
  difficulty?: RoleLevel;
  /** Quiet text beside the badges — a count, a date. */
  meta?: string;
  /** Controls in a footer — a bookmark toggle, a folder picker. */
  action?: ReactNode;
  /**
   * Extra classes on the card itself. The motion utilities live here rather
   * than on the component: hover-lift is scoped to the homepage and the
   * Learn hub, and the directory grid stays calm (handoff §4 motion note).
   */
  className?: string;
};

/**
 * One card for every kind of directory item.
 *
 * Deliberately generic: tools, Learn articles, collection entries, bookmarks
 * and history all render through this, so the grid stays visually identical
 * across the site and there is one place to change how a listed item looks
 * (§34).
 *
 * Drawn on the v3 soft surface since VIB-126. It was a bordered shadcn Card,
 * which was the last outlined box left once the account screens moved onto
 * panels — a bordered card sitting inside a soft panel reads as two systems
 * arguing. Hover lightens toward the accent rather than the muted grey, the
 * same move the category tiles make.
 */
export function ResourceCard({
  href,
  title,
  icon,
  eyebrow,
  description,
  badges,
  difficulty,
  meta,
  action,
  className,
}: ResourceCardProps) {
  return (
    <div
      className={cn(
        "bg-secondary focus-within:ring-ring hover:bg-primary/10 relative flex h-full flex-col rounded-[1.125rem] p-6 transition-colors focus-within:ring-2",
        className,
      )}
    >
      {eyebrow ? (
        <span className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
          {eyebrow}
        </span>
      ) : null}

      <h3
        className={cn(
          "font-heading flex items-center gap-2.5 text-lg font-bold tracking-tight",
          eyebrow && "mt-2.5",
        )}
      >
        {icon ? (
          <span className="bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-lg">
            {icon}
          </span>
        ) : null}
        {/*
          The link covers the card via ::after so the whole card is clickable,
          while the accessible name and keyboard focus stay on real link text.
        */}
        <Link href={href} className="outline-none after:absolute after:inset-0">
          {title}
        </Link>
      </h3>

      {description ? (
        <p className="text-muted-foreground mt-2.5 text-sm leading-relaxed">
          {description}
        </p>
      ) : null}

      {badges?.length || difficulty || meta ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {difficulty ? <DifficultyBadge level={difficulty} /> : null}
          {badges?.map((badge) => (
            <TagPill key={badge}>{badge}</TagPill>
          ))}
          {meta ? (
            <span className="text-muted-foreground text-xs">{meta}</span>
          ) : null}
        </div>
      ) : null}

      {action ? (
        /*
          z-10 lifts the footer above the link's covering ::after — without it
          the card-wide click target would swallow every control in here.
          mt-auto keeps it on the bottom edge however tall the card grows.
        */
        <div className="relative z-10 mt-auto flex flex-wrap items-center justify-between gap-2 pt-6">
          {action}
        </div>
      ) : null}
    </div>
  );
}
