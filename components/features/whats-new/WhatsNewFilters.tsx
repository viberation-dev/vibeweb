import Link from "next/link";

import {
  EVENT_LABELS,
  KIND_LABELS,
  WHATS_NEW_EVENTS,
  WHATS_NEW_KINDS,
  type WhatsNewEvent,
  type WhatsNewKind,
} from "@/lib/whats-new";

/**
 * Links, not a form: the filters are two short lists, so a GET link per option
 * is simpler than a submit and keeps every state shareable. Same posture as
 * the home feed's tabs.
 */
function href(kind?: WhatsNewKind, event?: WhatsNewEvent): string {
  const params = new URLSearchParams();
  if (kind) params.set("kind", kind);
  if (event) params.set("event", event);
  const query = params.toString();
  return query ? `/new?${query}` : "/new";
}

function Row({
  label,
  options,
  selected,
  hrefFor,
}: {
  label: string;
  options: readonly { value: string; label: string }[];
  selected: string | undefined;
  hrefFor: (value?: string) => string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-muted-foreground mr-1 text-xs font-bold tracking-widest uppercase">
        {label}
      </span>
      {[{ value: "", label: "All" }, ...options].map((option) => {
        const isSelected = (option.value || undefined) === selected;
        return (
          <Link
            key={option.value || "all"}
            href={hrefFor(option.value || undefined)}
            aria-current={isSelected ? "page" : undefined}
            className={
              isSelected
                ? "bg-primary text-primary-foreground rounded-full px-3 py-1.5 text-sm font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full px-3 py-1.5 text-sm font-bold transition-colors"
            }
          >
            {option.label}
          </Link>
        );
      })}
    </div>
  );
}

export function WhatsNewFilters({
  kind,
  event,
}: {
  kind?: WhatsNewKind;
  event?: WhatsNewEvent;
}) {
  return (
    <div className="space-y-2">
      <Row
        label="Kind"
        selected={kind}
        options={WHATS_NEW_KINDS.map((value) => ({ value, label: KIND_LABELS[value] }))}
        hrefFor={(value) => href(value as WhatsNewKind | undefined, event)}
      />
      <Row
        label="Change"
        selected={event}
        options={WHATS_NEW_EVENTS.map((value) => ({ value, label: EVENT_LABELS[value] }))}
        hrefFor={(value) => href(kind, value as WhatsNewEvent | undefined)}
      />
    </div>
  );
}
