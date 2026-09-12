import { cn } from "@/lib/utils";

/**
 * The square icon plate (VIB-125), from MarketingHome's category tiles.
 *
 * A --primary fill with a --primary-foreground glyph, which Ali chose over
 * v3's inverse on 2026-09-10. Never lime: `--highlight` is a fill-only
 * colour (VIB-99) and a stroke is not a fill.
 */
export function IconTile({
  size = "md",
  className,
  children,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "bg-primary text-primary-foreground flex shrink-0 items-center justify-center",
        size === "lg" && "size-13 rounded-2xl",
        size === "md" && "size-10 rounded-xl",
        size === "sm" && "size-8 rounded-lg",
        className,
      )}
    >
      {children}
    </span>
  );
}
