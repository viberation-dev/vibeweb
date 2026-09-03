import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/integrations/supabase/server";
import { contentTypeLabel } from "@/lib/learn";
import { listAllContent } from "@/lib/queries/content";
import { requireStaff } from "@/lib/staff";

export const metadata: Metadata = { title: "Learn content — Viberation" };

/** Every article, drafts included — the staff list (VIB-59). */
export default async function AdminContentPage() {
  await requireStaff("/admin/content");

  const supabase = await createClient();
  const items = await listAllContent(supabase);

  return (
    <main className="mx-auto w-full max-w-4xl space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Learn content</h1>
          <p className="text-muted-foreground text-sm">
            {items.length} {items.length === 1 ? "article" : "articles"}, drafts included.
          </p>
        </div>
        <Link href="/admin/content/new" className={buttonVariants()}>
          New article
        </Link>
      </div>

      <ul className="divide-border divide-y rounded-lg border">
        {items.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-4 p-4">
            <div className="min-w-0">
              <Link href={`/admin/content/${item.id}`} className="font-medium hover:underline">
                {item.title}
              </Link>
              <p className="text-muted-foreground truncate text-sm">
                /learn/{item.slug} · {contentTypeLabel(item.type)}
              </p>
            </div>
            <Badge variant={item.status === "published" ? "secondary" : "outline"}>
              {item.status === "published" ? "Published" : "Draft"}
            </Badge>
          </li>
        ))}
        {items.length === 0 ? (
          <li className="text-muted-foreground p-4 text-sm">Nothing written yet.</li>
        ) : null}
      </ul>
    </main>
  );
}
