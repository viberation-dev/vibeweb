import { IconArrowUpRight } from "@tabler/icons-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { saveToolAction } from "@/app/(site)/admin/tools/actions";
import { ToolForm } from "@/components/features/admin/ToolForm";
import { createClient } from "@/lib/integrations/supabase/server";
import { getToolById } from "@/lib/queries/tools";
import { ButtonIcon, buttonVariants } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { requireStaff } from "@/lib/staff";

export const metadata: Metadata = { title: "Edit tool" };

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
    <main className="mx-auto w-full max-w-3xl space-y-6 px-[clamp(1.25rem,4vw,2.5rem)] py-10">
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="font-heading text-3xl font-bold tracking-[-0.04em]">
          Edit tool
        </h1>
        <Link
          href={`/tools/${tool.slug}`}
          className={buttonVariants({
            variant: "pill-soft",
            size: "pill-sm",
            className: "shrink-0 bg-card hover:bg-accent",
          })}
        >
          <ButtonIcon tone="on-soft" size="sm" className="bg-secondary">
            <IconArrowUpRight />
          </ButtonIcon>
          View
        </Link>
      </div>
      {/* view_count / bookmark_count are not in the form — they belong to
          increment_tool_views() and the bookmark trigger — so show them here
          rather than leaving staff wondering where the numbers went. */}
      <p className="text-muted-foreground text-sm">
        {tool.view_count} views · {tool.bookmark_count} bookmarks. Both are
        maintained automatically and are not editable.
      </p>
      <Panel>
        <ToolForm tool={tool} action={saveToolAction.bind(null, tool.id)} />
      </Panel>
    </main>
  );
}
