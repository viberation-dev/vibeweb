import type { Metadata } from "next";

import { saveToolAction } from "@/app/(site)/admin/tools/actions";
import { ToolForm } from "@/components/features/admin/ToolForm";
import { requireStaff } from "@/lib/staff";

export const metadata: Metadata = { title: "New tool — Viberation" };

export default async function NewToolPage() {
  await requireStaff("/admin/tools/new");

  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">New tool</h1>
      <ToolForm tool={null} action={saveToolAction.bind(null, null)} />
    </main>
  );
}
