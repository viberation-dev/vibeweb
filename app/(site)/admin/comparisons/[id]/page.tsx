import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  deleteComparisonAction,
  saveComparisonAction,
} from "@/app/(site)/admin/comparisons/actions";
import { ComparisonForm } from "@/components/features/admin/ComparisonForm";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { createClient } from "@/lib/integrations/supabase/server";
import { getComparisonById } from "@/lib/queries/comparisons";
import { listAllTools } from "@/lib/queries/tools";
import { requireStaff } from "@/lib/staff";

export const metadata: Metadata = { title: "Edit comparison" };

export default async function EditComparisonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireStaff(`/admin/comparisons/${id}`);

  const supabase = await createClient();
  const [comparison, tools] = await Promise.all([
    getComparisonById(supabase, id),
    listAllTools(supabase),
  ]);

  if (!comparison) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 px-[clamp(1.25rem,4vw,2.5rem)] py-10">
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="font-heading text-3xl font-bold tracking-[-0.04em]">
          Edit comparison
        </h1>
        {comparison.published ? (
          <Link href={`/compare/${comparison.slug}`} className="text-sm hover:underline">
            View page
          </Link>
        ) : null}
      </div>
      <Panel>
        <ComparisonForm
          comparison={comparison}
          tools={tools.map(({ id, name, category }) => ({ id, name, category }))}
          action={saveComparisonAction.bind(null, comparison.id)}
        />
      </Panel>

      {/* Its own form, so deleting is never one misclick from saving. */}
      <form
        action={deleteComparisonAction.bind(null, comparison.id)}
        className="border-destructive/30 space-y-3 rounded-[1.125rem] border p-5"
      >
        <p className="text-sm font-medium">Delete this comparison</p>
        <p className="text-muted-foreground text-sm">
          Unpublish instead if you only want it off the site for now. A deleted
          page that search engines have indexed will start returning not found.
        </p>
        <Button type="submit" variant="destructive">
          Delete permanently
        </Button>
      </form>
    </main>
  );
}
