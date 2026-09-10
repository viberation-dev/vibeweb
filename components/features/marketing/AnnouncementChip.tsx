import { IconChevronRight } from "@tabler/icons-react";
import Link from "next/link";

/**
 * The v3 hero eyebrow (VIB-99) — a soft pill carrying a dark `New` badge,
 * a label, and a chevron.
 *
 * Deliberately not `components/ui/badge.tsx`: a Badge is a static status
 * marker, this is a navigational affordance with two tones inside one pill.
 * Folding it into Badge would mean a variant that is a link, which is a
 * different component wearing Badge's name.
 */
export function AnnouncementChip({
  badge,
  children,
  href,
}: {
  badge: string;
  children: React.ReactNode;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="bg-secondary hover:bg-primary/10 inline-flex items-center gap-3 rounded-full py-2 pr-5 pl-2 text-sm font-medium transition-colors"
    >
      <span className="bg-foreground text-background rounded-full px-3 py-1 text-xs font-bold">
        {badge}
      </span>
      {children}
      <IconChevronRight
        aria-hidden
        className="text-muted-foreground size-4 shrink-0"
      />
    </Link>
  );
}
