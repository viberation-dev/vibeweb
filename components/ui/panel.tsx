import { cn } from "@/lib/utils";

/**
 * The v3 surface (VIB-126): the soft block the whole design is built from.
 *
 * Two sizes, because the system uses exactly two. `md` is a content panel
 * inside a grid; `lg` is a full-width chapter band. Radius and padding move
 * together, since a band at the panel radius reads as one enormous card.
 *
 * Tones are the three fills a surface is allowed. `ink` inverts in light
 * mode only: in dark mode the deep ground and the soft surface are the same
 * colour, so that chapter break exists only in light (see MarketingHome's
 * proof block, where this rule was first written down).
 */
const TONES = {
  soft: "bg-secondary",
  accent: "bg-highlight text-highlight-foreground",
  ink: "bg-foreground text-background dark:bg-secondary dark:text-foreground",
} as const;

const SIZES = {
  md: "rounded-[1.125rem] p-6 sm:p-8",
  lg: "rounded-3xl p-9 lg:p-14",
} as const;

export function Panel({
  tone = "soft",
  size = "md",
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  tone?: keyof typeof TONES;
  size?: keyof typeof SIZES;
}) {
  return (
    <div className={cn(SIZES[size], TONES[tone], className)} {...props}>
      {children}
    </div>
  );
}
