import { cn } from "@/lib/utils";

/** Up to two letters from whatever identity exists; "?" rather than an empty circle. */
function initialsFor(name: string): string {
  const parts = name.split(/[\s._@-]+/).filter(Boolean);
  const letters =
    parts.length > 1 ? parts[0][0] + parts[1][0] : name.slice(0, 2);
  return letters.toUpperCase() || "?";
}

/**
 * The member's photo, or their initials on the brand fill (VIB-178).
 * Decorative: whatever it sits in carries the accessible name.
 */
export function Avatar({
  name,
  src,
  className,
}: {
  name: string;
  src: string | null;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "bg-primary text-primary-foreground flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold",
        className,
      )}
    >
      {src ? (
        // Supabase's public CDN URL; next/image would need a remote pattern
        // per project for a 64px circle.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="size-full object-cover" />
      ) : (
        initialsFor(name)
      )}
    </span>
  );
}
