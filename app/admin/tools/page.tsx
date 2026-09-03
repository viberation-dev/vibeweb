import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/integrations/supabase/server";
import { listAllTools } from "@/lib/queries/tools";
import { requireStaff } from "@/lib/staff";
import { toolCategoryLabel } from "@/lib/tool-categories";

export const metadata: Metadata = { title: "Tools — Viberation" };

/** Every tool in the directory, most recently edited first (VIB-59). */
export default async function AdminToolsPage() {
  await requireStaff("/admin/tools");

  const supabase = await createClient();
  const tools = await listAllTools(supabase);

  return (
    <main className="mx-auto w-full max-w-4xl space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Tools</h1>
          <p className="text-muted-foreground text-sm">
            {tools.length} {tools.length === 1 ? "tool" : "tools"} in the directory.
          </p>
        </div>
        <Link href="/admin/tools/new" className={buttonVariants()}>
          New tool
        </Link>
      </div>

      <ul className="divide-border divide-y rounded-lg border">
        {tools.map((tool) => (
          <li key={tool.id} className="flex items-center justify-between gap-4 p-4">
            <div className="min-w-0">
              <Link href={`/admin/tools/${tool.id}`} className="font-medium hover:underline">
                {tool.name}
              </Link>
              <p className="text-muted-foreground truncate text-sm">
                /tools/{tool.slug} · {toolCategoryLabel(tool.category)}
                {tool.pricing_tier ? ` · ${tool.pricing_tier}` : ""}
              </p>
            </div>
            {tool.is_affiliate ? <Badge variant="secondary">Affiliate</Badge> : null}
          </li>
        ))}
        {tools.length === 0 ? (
          <li className="text-muted-foreground p-4 text-sm">No tools yet.</li>
        ) : null}
      </ul>
    </main>
  );
}
