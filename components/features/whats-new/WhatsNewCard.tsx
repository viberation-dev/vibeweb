import { ResourceCard } from "@/components/features/resource/ResourceCard";
import type { WhatsNewItem } from "@/lib/queries/whats-new";
import { EVENT_LABELS, KIND_LABELS } from "@/lib/whats-new";

/** The stream's date format. Short, unambiguous, no time of day. */
function dateLabel(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * One entry in the What's new stream (VIB-230).
 *
 * Deliberately `ResourceCard` rather than a card of its own: the stream lists
 * the same things the directory, Learn and bookmarks list, and a second card
 * component would drift from it. The event label and the date ride in the
 * eyebrow and `meta`, both of which the card already has.
 *
 * A feature entry has no row and therefore no view — it renders from the
 * entry alone and links to the changelog, with no bookmark toggle. It is the
 * only entry kind that is not bookmarkable.
 */
export function WhatsNewCard({ item }: { item: WhatsNewItem }) {
  const eyebrow = `${EVENT_LABELS[item.event]} · ${KIND_LABELS[item.kind]}`;
  const meta = [dateLabel(item.at), item.view?.meta].filter(Boolean).join(" · ");

  if (!item.view) {
    return (
      <ResourceCard
        href={item.href ?? "/changelog"}
        title={item.title}
        eyebrow={eyebrow}
        description={item.note}
        meta={meta}
      />
    );
  }

  return (
    <ResourceCard
      href={item.view.href}
      title={item.view.title}
      eyebrow={eyebrow}
      // An Updated entry says what changed; an addition falls back to the
      // item's own description.
      description={item.note ?? item.view.description}
      badges={item.view.badges}
      flag={item.isNew ? "New" : undefined}
      difficulty={item.view.difficulty}
      meta={meta}
    />
  );
}
