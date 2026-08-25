import Link from "next/link";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export type ResourceCardProps = {
  /** Where the whole card links to. */
  href: string;
  title: string;
  /** Small label above the title — a category, content type, or collection name. */
  eyebrow?: string;
  description?: string | null;
  /** Short pills under the description: tags, pricing tier, role level. */
  badges?: string[];
  /** Controls in a footer — a bookmark toggle, a folder picker. */
  action?: ReactNode;
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
  eyebrow,
  description,
  badges,
  action,
}: ResourceCardProps) {
  return (
    <Card className="relative h-full transition-colors hover:bg-muted/40 focus-within:ring-2 focus-within:ring-ring">
      <CardHeader>
        {eyebrow ? (
          <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {eyebrow}
          </span>
        ) : null}
        <CardTitle>
          {/*
            The link covers the card via ::after so the whole card is clickable,
            while the accessible name and keyboard focus stay on real link text.
          */}
          <Link href={href} className="after:absolute after:inset-0 outline-none">
            {title}
          </Link>
        </CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      {badges?.length ? (
        <CardContent className="flex flex-wrap gap-1.5">
          {badges.map((badge) => (
            <Badge key={badge} variant="secondary">
              {badge}
            </Badge>
          ))}
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
