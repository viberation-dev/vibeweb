import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/integrations/supabase/server";
import { listAllTools } from "@/lib/queries/tools";
import { requireStaff } from "@/lib/staff";
import { toolCategoryLabel } from "@/lib/tool-categories";

export const metadata: Metadata = { title: "Tools" };

/** Every tool in the directory, most recently edited first (VIB-59). */
export default async function AdminToolsPage() {
  await requireStaff("/admin/tools");

  const supabase = await createClient();
  const tools = await listAllTools(supabase);

  return (
    <main className="mx-auto w-full max-w-4xl space-y-6 px-[clamp(1.25rem,4vw,2.5rem)] py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-[-0.04em]">
            Tools
          </h1>
          <p className="text-muted-foreground text-sm">
            {tools.length} {tools.length === 1 ? "tool" : "tools"} in the
            directory.
          </p>
        </div>
        <Link
          href="/admin/tools/new"
          className={buttonVariants({ variant: "pill", size: "pill-sm" })}
        >
          New tool
        </Link>
      </div>

      <ul className="bg-secondary divide-border/60 divide-y overflow-hidden rounded-[1.125rem]">
        {tools.map((tool) => (
          <li
            key={tool.id}
            className="flex items-center justify-between gap-4 p-5"
          >
            <div className="min-w-0">
              <Link
                href={`/admin/tools/${tool.id}`}
                className="font-heading font-bold tracking-tight hover:underline"
              >
                {tool.name}
              </Link>
              <p className="text-muted-foreground truncate text-sm">
                /tools/{tool.slug} · {toolCategoryLabel(tool.category)}
                {tool.pricing_tier ? ` · ${tool.pricing_tier}` : ""}
              </p>
            </div>
            {tool.is_affiliate ? (
              <Badge variant="secondary">Affiliate</Badge>
            ) : null}
          </li>
        ))}
        {tools.length === 0 ? (
          <li className="text-muted-foreground p-5 text-sm">No tools yet.</li>
        ) : null}
      </ul>
    </main>
  );
}
