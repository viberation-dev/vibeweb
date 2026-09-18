import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/integrations/supabase/server";
import { listAllComparisons } from "@/lib/queries/comparisons";
import { requireStaff } from "@/lib/staff";

export const metadata: Metadata = { title: "Comparisons" };

/** Every comparison page, drafts included: the staff list (VIB-184). */
export default async function AdminComparisonsPage() {
  await requireStaff("/admin/comparisons");

  const supabase = await createClient();
  const items = await listAllComparisons(supabase);

  return (
    <main className="mx-auto w-full max-w-4xl space-y-6 px-[clamp(1.25rem,4vw,2.5rem)] py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-[-0.04em]">
            Comparisons
          </h1>
          <p className="text-muted-foreground text-sm">
            Curated &ldquo;A vs B&rdquo; pages at /compare. Only pairs people
            actually weigh up: every page needs a real verdict.
          </p>
        </div>
        <Link
          href="/admin/comparisons/new"
          className={buttonVariants({ variant: "pill", size: "pill-sm" })}
        >
          Add comparison
        </Link>
      </div>

      <ul className="bg-secondary divide-border/60 divide-y overflow-hidden rounded-[1.125rem]">
        {items.map((item) => (
          <li key={item.id} className="flex items-start justify-between gap-4 p-5">
            <div className="min-w-0">
              <Link
                href={`/admin/comparisons/${item.id}`}
                className="font-heading font-bold tracking-tight hover:underline"
              >
                {item.tool_a.name} vs {item.tool_b.name}
              </Link>
              <p className="text-muted-foreground line-clamp-2 text-sm">{item.intro}</p>
              <p className="text-muted-foreground mt-1 text-xs">/compare/{item.slug}</p>
            </div>
            <Badge variant={item.published ? "secondary" : "outline"}>
              {item.published ? "Published" : "Draft"}
            </Badge>
          </li>
        ))}
        {items.length === 0 ? (
          <li className="text-muted-foreground p-5 text-sm">
            None yet. Add the first pair people ask about.
          </li>
        ) : null}
      </ul>
    </main>
  );
}
