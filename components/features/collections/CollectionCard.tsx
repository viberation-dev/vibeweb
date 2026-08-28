import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Collection } from "@/lib/queries/collections";

type Props = {
  collection: Collection;
  /** Small label above the title. Defaults to nothing. */
  eyebrow?: string;
  /** Member count, shown under the description when given. */
  count?: number;
};

/**
 * One collection, as a card.
 *
 * Not `ResourceCard`: a collection is a container, not a resource. It has no
 * bookmark toggle, and its subtitle is a member count rather than a tagline,
 * so bending the shared card around it would cost more than it saves. It
 * earns its own component because the collections index, the home feed and
 * the search results all render it.
 */
export function CollectionCard({ collection, eyebrow, count }: Props) {
  return (
    <Card className="relative h-full transition-colors hover:bg-muted/40 focus-within:ring-2 focus-within:ring-ring">
      <CardHeader>
        {eyebrow ? (
          <Badge variant="secondary" className="w-fit">
            {eyebrow}
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
        {count === undefined ? null : (
          <p className="text-sm text-muted-foreground">
            {count} {count === 1 ? "item" : "items"}
          </p>
        )}
      </CardHeader>
    </Card>
  );
}
