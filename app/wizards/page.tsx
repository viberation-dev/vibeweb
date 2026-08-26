import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/integrations/supabase/server";
import { listWizards } from "@/lib/queries/wizards";

export const metadata: Metadata = {
  title: "Wizards — Viberation",
  description: "Step-by-step builds that end with something real on the internet.",
};

/**
 * Wizard index (§31 marks this [min] — MVP ships one flagship wizard, but a
 * single-item list is still the right shape for the route that will hold
 * several).
 */
export default async function WizardsPage() {
  const supabase = await createClient();
  const wizards = await listWizards(supabase);

  return (
    <main className="mx-auto w-full max-w-6xl p-6">
      <h1 className="font-heading text-2xl font-semibold">Wizards</h1>
      <p className="mt-1 text-muted-foreground">
        Step-by-step builds that end with something real on the internet, not a finished tutorial.
      </p>

      {wizards.length ? (
        <ul className="mt-8 grid items-start gap-4 sm:grid-cols-2">
          {wizards.map((wizard) => (
            <li key={wizard.id}>
              <Card className="relative h-full transition-colors hover:bg-muted/40 focus-within:ring-2 focus-within:ring-ring">
                <CardHeader>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">
                      {wizard.steps.length} step{wizard.steps.length === 1 ? "" : "s"}
                    </Badge>
                    {wizard.role_level ? (
                      <Badge variant="outline">{wizard.role_level}</Badge>
                    ) : null}
                  </div>
                  <CardTitle>
                    <Link
                      href={`/wizards/${wizard.slug}`}
                      className="after:absolute after:inset-0 outline-none"
                    >
                      {wizard.title}
                    </Link>
                  </CardTitle>
                  <CardDescription>
                    {wizard.steps.map((step) => step.title).join(" → ")}
                  </CardDescription>
                </CardHeader>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-8 text-muted-foreground">No wizards published yet.</p>
      )}
    </main>
  );
}
