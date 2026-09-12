import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/integrations/supabase/server";
import { listWalkthroughs } from "@/lib/queries/walkthroughs";

export const metadata: Metadata = {
  title: "Walkthroughs",
  description:
    "Guided builds that end with a live link you can send to anyone. Copy each prompt, paste it into your AI tool, and keep going.",
};

/**
 * Walkthrough index (§31 marks this [min] — MVP ships one flagship walkthrough, but a
 * single-item list is still the right shape for the route that will hold
 * several).
 */
export default async function WalkthroughsPage() {
  const supabase = await createClient();
  const walkthroughs = await listWalkthroughs(supabase);

  return (
    <main className="mx-auto w-full max-w-6xl p-6">
      <h1 className="font-heading text-2xl font-semibold">Walkthroughs</h1>
      <p className="mt-1 text-muted-foreground">
        Follow the steps and end with a live link you can send to anyone. Copy
        each prompt, paste it into your AI tool, check the result, move on.
      </p>

      {walkthroughs.length ? (
        <ul className="mt-8 grid items-start gap-4 sm:grid-cols-2">
          {walkthroughs.map((walkthrough) => (
            <li key={walkthrough.id}>
              <Card className="relative h-full transition-colors hover:bg-muted/40 focus-within:ring-2 focus-within:ring-ring">
                <CardHeader>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">
                      {walkthrough.steps.length} step
                      {walkthrough.steps.length === 1 ? "" : "s"}
                    </Badge>
                    {walkthrough.role_level ? (
                      <Badge variant="outline">{walkthrough.role_level}</Badge>
                    ) : null}
                  </div>
                  <CardTitle>
                    <Link
                      href={`/walkthroughs/${walkthrough.slug}`}
                      className="after:absolute after:inset-0 outline-none"
                    >
                      {walkthrough.title}
                    </Link>
                  </CardTitle>
                  <CardDescription>
                    {walkthrough.steps.map((step) => step.title).join(" → ")}
                  </CardDescription>
                </CardHeader>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-8 text-muted-foreground">No walkthroughs published yet.</p>
      )}
    </main>
  );
}
