import type { Metadata } from "next";

import { saveContentAction } from "@/app/(site)/admin/content/actions";
import { ContentForm } from "@/components/features/admin/ContentForm";
import { requireStaff } from "@/lib/staff";

export const metadata: Metadata = { title: "New article — Viberation" };

export default async function NewContentPage() {
  await requireStaff("/admin/content/new");

  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">New article</h1>
      <ContentForm content={null} action={saveContentAction.bind(null, null)} />
    </main>
  );
}
