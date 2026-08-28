import type { Metadata } from "next";
import { CollectionCard } from "@/components/features/collections/CollectionCard";
import { createClient } from "@/lib/integrations/supabase/server";
import { countCollectionItems, listCollections } from "@/lib/queries/collections";

export const metadata: Metadata = {
  title: "Collections — Viberation",
  description:
    "Curated sets of tools and guides, grouped around one thing you are trying to do.",
};

export default async function CollectionsPage() {
  const supabase = await createClient();
  const collections = await listCollections(supabase);
  const counts = await countCollectionItems(
    supabase,
    collections.map((collection) => collection.id),
  );

  return (
    <main className="mx-auto w-full max-w-6xl p-6">
      <h1 className="font-heading text-2xl font-semibold">Collections</h1>
      <p className="mt-1 text-muted-foreground">
        Curated sets of tools and guides, grouped around one thing you are trying to do.
      </p>

      {collections.length ? (
        <ul className="mt-8 grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
