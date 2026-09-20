import type { Metadata } from "next";

import { saveComparisonAction } from "@/app/(site)/admin/comparisons/actions";
import { ComparisonForm } from "@/components/features/admin/ComparisonForm";
import { Panel } from "@/components/ui/panel";
import { createClient } from "@/lib/integrations/supabase/server";
import { listAllTools } from "@/lib/queries/tools";
import { requireStaff } from "@/lib/staff";

export const metadata: Metadata = { title: "New comparison" };

export default async function NewComparisonPage() {
  await requireStaff("/admin/comparisons/new");

  const supabase = await createClient();
  const tools = await listAllTools(supabase);

  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 px-[clamp(1.25rem,4vw,2.5rem)] py-10">
      <h1 className="font-heading text-3xl font-bold tracking-[-0.04em]">
        New comparison
      </h1>
      <Panel>
        <ComparisonForm
          comparison={null}
          tools={tools.map(({ id, name, category }) => ({ id, name, category }))}
          action={saveComparisonAction.bind(null, null)}
        />
      </Panel>
    </main>
  );
}
