import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/integrations/supabase/server";
import { contentHref, contentPillarLabel, contentTypeLabel } from "@/lib/learn";
import { listAllContent } from "@/lib/queries/content";
import { requireStaff } from "@/lib/staff";

export const metadata: Metadata = { title: "Learn content" };

/** Every article, drafts included — the staff list (VIB-59). */
export default async function AdminContentPage() {
  await requireStaff("/admin/content");

  const supabase = await createClient();
  const items = await listAllContent(supabase);

  return (
    <main className="mx-auto w-full max-w-4xl space-y-6 px-[clamp(1.25rem,4vw,2.5rem)] py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-[-0.04em]">
            Learn content
          </h1>
          <p className="text-muted-foreground text-sm">
            {items.length} {items.length === 1 ? "article" : "articles"}, drafts
            included.
          </p>
        </div>
        <Link
          href="/admin/content/new"
          className={buttonVariants({ variant: "pill", size: "pill-sm" })}
        >
          New article
        </Link>
      </div>

      <ul className="bg-secondary divide-border/60 divide-y overflow-hidden rounded-[1.125rem]">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between gap-4 p-5"
          >
            <div className="min-w-0">
              <Link
                href={`/admin/content/${item.id}`}
                className="font-heading font-bold tracking-tight hover:underline"
              >
                {item.title}
              </Link>
              <p className="text-muted-foreground truncate text-sm">
                {/* Announcements live at /blog, everything else at /learn. */}
                {contentHref(item.type, item.slug)} ·{" "}
                {contentTypeLabel(item.type)}
                {item.pillar ? ` · ${contentPillarLabel(item.pillar)}` : ""}
              </p>
            </div>
            <Badge
              variant={item.status === "published" ? "secondary" : "outline"}
            >
              {item.status === "published" ? "Published" : "Draft"}
            </Badge>
          </li>
        ))}
        {items.length === 0 ? (
          <li className="text-muted-foreground p-5 text-sm">
            Nothing written yet.
          </li>
        ) : null}
      </ul>
    </main>
  );
}
