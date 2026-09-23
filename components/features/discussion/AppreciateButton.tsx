import { IconHeart } from "@tabler/icons-react";

import { toggleAppreciationAction } from "@/app/(site)/discussion-actions";
import type { AppreciationTarget } from "@/lib/queries/appreciations";
import { cn } from "@/lib/utils";

/**
 * "Appreciate this" — a count and a toggle (VIB-199).
 *
 * A form posting to a Server Action, not a client component: it works with no
 * JavaScript, ships no client bundle, and a signed-out reader is sent to sign
 * in and lands back here, which is how a lot of people discover accounts
 * exist. The same reasoning BookmarkButton records.
 *
 * The count shown is the real one from the database, not an optimistic
 * guess — a number that jumps and then corrects itself is worse than one
 * that waits for the round trip it is reporting.
 */
export function AppreciateButton({
  target,
  count,
  mine,
  returnTo,
  variant = "full",
}: {
  target: AppreciationTarget;
  count: number;
  mine: boolean;
  returnTo: string;
  /** "compact" is the dock's icon-and-number form. */
  variant?: "full" | "compact";
}) {
  const compact = variant === "compact";

  return (
    <form action={toggleAppreciationAction}>
      <input type="hidden" name="target_type" value={target.targetType} />
      <input type="hidden" name="target_id" value={target.targetId} />
      <input type="hidden" name="return_to" value={returnTo} />
      <input type="hidden" name="intent" value={mine ? "remove" : "add"} />
      <button
        type="submit"
        aria-pressed={mine}
        className={cn(
          "focus-visible:ring-ring inline-flex items-center gap-2.5 rounded-full font-semibold transition-colors focus-visible:ring-3 focus-visible:outline-none",
          compact
            ? "text-muted-foreground hover:bg-secondary hover:text-foreground px-4 py-2 text-[0.9375rem]"
            : "font-heading border-foreground border-2 px-5 py-2.5 text-base",
          mine &&
            (compact
              ? "bg-highlight text-highlight-foreground"
              : "bg-highlight border-highlight text-highlight-foreground"),
        )}
      >
        <IconHeart
          aria-hidden
          className={cn("size-[1.1875rem]", mine && "fill-current")}
        />
        {compact ? null : (
          <span>{mine ? "Thanks!" : "Appreciate this"}</span>
        )}
        <span className={compact ? undefined : "before:mr-1 before:content-['·']"}>
          {count}
        </span>
        <span className="sr-only">
          {mine ? "Remove your appreciation" : "Appreciate this"}
        </span>
      </button>
    </form>
  );
}
