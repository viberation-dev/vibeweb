import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { saveToolAction } from "@/app/(site)/admin/tools/actions";
import { ToolForm } from "@/components/features/admin/ToolForm";
import { createClient } from "@/lib/integrations/supabase/server";
import { getToolById } from "@/lib/queries/tools";
import { requireStaff } from "@/lib/staff";

export const metadata: Metadata = { title: "Edit tool — Viberation" };

export default async function EditToolPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireStaff(`/admin/tools/${id}`);

  const supabase = await createClient();
  const tool = await getToolById(supabase, id);

  if (!tool) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 p-6">
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="text-2xl font-semibold">Edit tool</h1>
        <Link href={`/tools/${tool.slug}`} className="text-sm hover:underline">
          View →
        </Link>
      </div>
      {/* view_count / bookmark_count are not in the form — they belong to
          increment_tool_views() and the bookmark trigger — so show them here
          rather than leaving staff wondering where the numbers went. */}
      <p className="text-muted-foreground text-sm">
        {tool.view_count} views · {tool.bookmark_count} bookmarks. Both are maintained
        automatically and are not editable.
      </p>
      <ToolForm tool={tool} action={saveToolAction.bind(null, tool.id)} />
    </main>
  );
}
