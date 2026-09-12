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
        "bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-bold capitalize",
        className,
      )}
    >
      {children}
    </span>
  );
}
