import { Button } from "@/components/ui/button";
import type { DesignHistoryEntry } from "@/lib/queries/settings";

type Props = {
  entries: DesignHistoryEntry[];
  restoreAction: (formData: FormData) => Promise<void>;
};

const WHEN = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

/**
 * The last design changes, newest first (VIB-247).
 *
 * Restore puts the colours and defaults back to how that save left them, and
 * is recorded as a change of its own, so restoring is never a way to lose
 * history.
 */
export function DesignHistory({ entries, restoreAction }: Props) {
  return (
    <section className="space-y-4 border-t pt-6">
      <div>
        <h2 className="font-heading text-xl font-bold tracking-[-0.02em]">
          Design history
        </h2>
        <p className="text-muted-foreground text-sm">
          Every saved change to the colours above. Restore returns the site to
          how that change left it.
        </p>
      </div>

      {entries.length === 0 ? (
        <p className="text-muted-foreground text-sm">No changes yet.</p>
      ) : (
        <ol className="divide-y">
          {entries.map((entry, index) => (
            <li key={entry.id} className="flex items-start justify-between gap-4 py-3">
              <div className="min-w-0 space-y-1">
                <p className="text-sm break-words">{entry.summary}</p>
                <p className="text-muted-foreground text-xs">
                  {entry.actor_name} · {WHEN.format(new Date(entry.created_at))} UTC
                </p>
              </div>
              {index === 0 ? (
                <span className="text-muted-foreground shrink-0 text-xs">Current</span>
              ) : (
                <form action={restoreAction} className="shrink-0">
                  <input type="hidden" name="id" value={entry.id} />
                  <Button type="submit" variant="outline" size="sm">
                    Restore
                  </Button>
                </form>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
