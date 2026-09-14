import { cn } from "@/lib/utils";

/** The v3 tag: a wash of the accent with the accent as its text (VIB-125). */
export function TagPill({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        // First letter only: `capitalize` turned "Next.js" into "Next.Js".
        "bg-primary/10 text-primary inline-block rounded-full px-3 py-1 text-xs font-bold first-letter:uppercase",
        className,
      )}
    >
      {children}
    </span>
  );
}
