import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { saveContentAction } from "@/app/admin/content/actions";
import { ContentForm } from "@/components/features/admin/ContentForm";
import { createClient } from "@/lib/integrations/supabase/server";
import { getContentById } from "@/lib/queries/content";
import { requireStaff } from "@/lib/staff";

export const metadata: Metadata = { title: "Edit article — Viberation" };

export default async function EditContentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireStaff(`/admin/content/${id}`);

  const supabase = await createClient();
  const content = await getContentById(supabase, id);

  if (!content) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 p-6">
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="text-2xl font-semibold">Edit article</h1>
        {/* Staff can open a draft at its own URL — getContentBySlug does not
            filter status, so this previews unpublished prose. */}
        <Link href={`/learn/${content.slug}`} className="text-sm hover:underline">
          Preview →
        </Link>
      </div>
      <ContentForm content={content} action={saveContentAction.bind(null, content.id)} />
    </main>
  );
}
