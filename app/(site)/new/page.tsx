import type { Metadata } from "next";

import { WhatsNewCard } from "@/components/features/whats-new/WhatsNewCard";
import { WhatsNewFilters } from "@/components/features/whats-new/WhatsNewFilters";
import { createClient } from "@/lib/integrations/supabase/server";
import { listWhatsNew } from "@/lib/queries/whats-new";
import {
  groupByMonth,
  toWhatsNewEvent,
  toWhatsNewKind,
  whatsNewKey,
} from "@/lib/whats-new";

export const metadata: Metadata = {
  title: "What's new",
  description:
    "Everything recently added to and updated on Viberation: tools, guides, collections and shipped changes.",
};

type Props = {
  searchParams: Promise<{ kind?: string; event?: string }>;
};

export default async function WhatsNewPage({ searchParams }: Props) {
  const params = await searchParams;
  const kind = toWhatsNewKind(params.kind);
  const event = toWhatsNewEvent(params.event);

  const supabase = await createClient();
  const items = await listWhatsNew(supabase, { kind, event });

  return (
    <div className="mx-auto w-full max-w-4xl p-6">
      <h1 className="font-heading text-3xl font-bold tracking-[-0.04em]">
        What&rsquo;s new
      </h1>
      <p className="text-muted-foreground mt-2.5 leading-relaxed">
        Everything recently added and updated, newest first.
      </p>

      <div className="mt-6">
        <WhatsNewFilters kind={kind} event={event} />
      </div>

      {items.length ? (
        <div className="mt-8 space-y-10">
          {groupByMonth(items).map(([month, group]) => (
            <section key={month}>
              <h2 className="font-heading text-muted-foreground text-sm font-bold tracking-widest uppercase">
                {month}
              </h2>
              <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                {group.map((item) => (
                  <li key={whatsNewKey(item)}>
                    <WhatsNewCard item={item} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        /*
         * Reachable two ways: a filter that matches nothing, and a stream with
         * nothing in it at all. Both say the same true thing rather than
         * rendering a bare page.
         */
        <p className="text-muted-foreground mt-8 leading-relaxed">
          Nothing to show here yet.
        </p>
      )}
    </div>
  );
}
