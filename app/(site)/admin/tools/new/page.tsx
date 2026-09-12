import type { Metadata } from "next";

import { saveToolAction } from "@/app/(site)/admin/tools/actions";
import { ToolForm } from "@/components/features/admin/ToolForm";
import { Panel } from "@/components/ui/panel";
import { requireStaff } from "@/lib/staff";

export const metadata: Metadata = { title: "New tool" };

export default async function NewToolPage() {
  await requireStaff("/admin/tools/new");

  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 px-[clamp(1.25rem,4vw,2.5rem)] py-10">
      <h1 className="font-heading text-3xl font-bold tracking-[-0.04em]">
        New tool
      </h1>
      <Panel>
        <ToolForm tool={null} action={saveToolAction.bind(null, null)} />
      </Panel>
    </main>
  );
}
