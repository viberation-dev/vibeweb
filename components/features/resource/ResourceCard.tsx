import Link from "next/link";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { DifficultyBadge } from "@/components/ui/difficulty-badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  /** Quiet text beside the badges — reading time, a count. */
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
 * Deliberately generic: tools, Learn articles and collection entries all
 * render through this, so the grid stays visually identical across the site
 * and there is one place to change how a listed item looks (§34).
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
    <Card
      className={cn(
        "relative h-full transition-colors hover:bg-muted/40 focus-within:ring-2 focus-within:ring-ring",
        className,
      )}
    >
      <CardHeader>
        {eyebrow ? (
          <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {eyebrow}
          </span>
        ) : null}
        <CardTitle className="flex items-center gap-2">
          {icon ? (
            <span className="bg-muted flex size-7 shrink-0 items-center justify-center rounded-md">
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
        </CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      {badges?.length || difficulty || meta ? (
        <CardContent className="flex flex-wrap items-center gap-1.5">
          {difficulty ? <DifficultyBadge level={difficulty} /> : null}
          {badges?.map((badge) => (
            <Badge key={badge} variant="secondary">
              {badge}
            </Badge>
          ))}
          {meta ? <span className="text-muted-foreground text-xs">{meta}</span> : null}
        </CardContent>
      ) : null}
      {action ? (
        /*
          z-10 lifts the footer above the link's covering ::after — without it
          the card-wide click target would swallow every control in here.
        */
        <CardFooter className="relative z-10 flex flex-wrap items-center justify-between gap-2">
          {action}
        </CardFooter>
      ) : null}
    </Card>
  );
}
