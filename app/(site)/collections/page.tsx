import type { Metadata } from "next";
import { CollectionCard } from "@/components/features/collections/CollectionCard";
import { createAnonClient } from "@/lib/integrations/supabase/anon";
import {
  countCollectionItems,
  listCollections,
} from "@/lib/queries/collections";

export const metadata: Metadata = {
  title: "Collections",
  description:
    "Starter stacks, already picked for you. Each one gathers the tools and guides for a single job, so you start from something instead of a blank page.",
};

// Public, published content only: cached and rebuilt every 5 minutes.
export const revalidate = 300;

export default async function CollectionsPage() {
  const supabase = createAnonClient();
  const collections = await listCollections(supabase);
  const counts = await countCollectionItems(
    supabase,
    collections.map((collection) => collection.id),
  );

  return (
    <main className="mx-auto w-full max-w-6xl p-6">
      <h1 className="font-heading text-2xl font-semibold">Collections</h1>
      <p className="mt-1 text-muted-foreground">
        Starter stacks, already picked for you. Each one gathers the tools and
        guides for a single job, so you start from something instead of a blank
        page.
      </p>

      {collections.length ? (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => {
            const count = counts.get(collection.id) ?? 0;
            return (
              <li key={collection.id}>
                <CollectionCard
                  collection={collection}
                  eyebrow={collection.is_featured ? "Featured" : undefined}
                  count={count}
                />
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-8 text-muted-foreground">No collections yet.</p>
      )}
    </main>
  );
}
