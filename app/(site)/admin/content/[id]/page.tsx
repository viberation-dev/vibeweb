import { IconArrowUpRight } from "@tabler/icons-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { saveContentAction } from "@/app/(site)/admin/content/actions";
import { ContentForm } from "@/components/features/admin/ContentForm";
import { createClient } from "@/lib/integrations/supabase/server";
import { contentHref } from "@/lib/learn";
import { getContentById } from "@/lib/queries/content";
import { ButtonIcon, buttonVariants } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { requireStaff } from "@/lib/staff";

export const metadata: Metadata = { title: "Edit article" };

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
    <main className="mx-auto w-full max-w-3xl space-y-6 px-[clamp(1.25rem,4vw,2.5rem)] py-10">
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="font-heading text-3xl font-bold tracking-[-0.04em]">
          Edit article
        </h1>
        {/* Staff can open a draft at its own URL — getContentBySlug does not
            filter status, so this previews unpublished prose. */}
        <Link
          href={contentHref(content.type, content.slug)}
          className={buttonVariants({
            variant: "pill-soft",
            size: "pill-sm",
            className: "shrink-0 bg-card hover:bg-accent",
          })}
        >
          <ButtonIcon tone="on-soft" size="sm" className="bg-secondary">
            <IconArrowUpRight />
          </ButtonIcon>
          Preview
        </Link>
      </div>
      <Panel>
        <ContentForm
          content={content}
          action={saveContentAction.bind(null, content.id)}
        />
      </Panel>
    </main>
  );
}
