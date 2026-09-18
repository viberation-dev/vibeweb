import type { Metadata } from "next";
import Link from "next/link";

import { ResourceCard } from "@/components/features/resource/ResourceCard";
import { createClient } from "@/lib/integrations/supabase/server";
import { listPublishedComparisons } from "@/lib/queries/comparisons";

export const metadata: Metadata = {
  title: "Compare AI tools",
  description:
    "Side-by-side comparisons of the AI coding tools people weigh up most, with a straight answer on which to pick.",
};

/** Every published comparison (VIB-184). */
export default async function CompareIndexPage() {
  const supabase = await createClient();
  const items = await listPublishedComparisons(supabase);

  return (
    <main className="mx-auto w-full max-w-6xl p-6">
      <h1 className="font-heading text-2xl font-semibold">Compare AI tools</h1>
      <p className="text-muted-foreground mt-1 max-w-2xl">
        The pairs people weigh up most, side by side, with a straight answer on
        which to pick and when.
      </p>

      {items.length ? (
        <ul className="mt-8 grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li key={item.id}>
              <ResourceCard
                href={`/compare/${item.slug}`}
                eyebrow="Comparison"
                title={`${item.tool_a.name} vs ${item.tool_b.name}`}
                description={item.intro}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground mt-8">
          No comparisons yet. Browse the{" "}
          <Link href="/tools" className="underline underline-offset-4">
            tool directory
          </Link>{" "}
          in the meantime.
        </p>
      )}
    </main>
  );
}
