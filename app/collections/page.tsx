import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
                {/*
                  Not ResourceCard: a collection is a container, not a
                  resource. It has no bookmark toggle and its subtitle is a
                  member count, so it gets its own small card rather than
                  bending the shared one out of shape.
                */}
                <Card className="relative h-full transition-colors hover:bg-muted/40 focus-within:ring-2 focus-within:ring-ring">
                  <CardHeader>
                    {collection.is_featured ? (
                      <Badge variant="secondary" className="w-fit">
                        Featured
                      </Badge>
                    ) : null}
                    <CardTitle>
                      <Link
                        href={`/collections/${collection.slug}`}
                        className="after:absolute after:inset-0 outline-none"
                      >
                        {collection.title}
                      </Link>
                    </CardTitle>
                    {collection.description ? (
                      <CardDescription>{collection.description}</CardDescription>
                    ) : null}
                    <p className="text-sm text-muted-foreground">
                      {count} {count === 1 ? "item" : "items"}
                    </p>
                  </CardHeader>
                </Card>
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
