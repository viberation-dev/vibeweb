import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/integrations/supabase/server";
import { listAllTestimonials } from "@/lib/queries/testimonials";
import { initialsFrom } from "@/lib/testimonials";
import { requireStaff } from "@/lib/staff";

export const metadata: Metadata = { title: "Testimonials — Viberation" };

/** Every testimonial, drafts included — the staff list (VIB-102). */
export default async function AdminTestimonialsPage() {
  await requireStaff("/admin/testimonials");

  const supabase = await createClient();
  const items = await listAllTestimonials(supabase);
  const published = items.filter((item) => item.published).length;

  return (
    <main className="mx-auto w-full max-w-4xl space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Testimonials</h1>
          <p className="text-muted-foreground text-sm">
            {items.length} total, {published} published. The homepage shows the
            first three published, by order.
          </p>
        </div>
        <Link href="/admin/testimonials/new" className={buttonVariants()}>
          Add testimonial
        </Link>
      </div>

      <ul className="divide-border divide-y rounded-lg border">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-start justify-between gap-4 p-4"
          >
            <div className="min-w-0">
              <Link
                href={`/admin/testimonials/${item.id}`}
                className="font-medium hover:underline"
              >
                {item.author_name}
                {item.location ? ` · ${item.location}` : ""}
              </Link>
              <p className="text-muted-foreground line-clamp-2 text-sm">
                &ldquo;{item.quote}&rdquo;
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                {initialsFrom(item.author_name, item.initials)} · order {item.sort_order} · consent{" "}
                {new Date(item.consent_at).toISOString().slice(0, 10)}
              </p>
            </div>
            <Badge variant={item.published ? "secondary" : "outline"}>
              {item.published ? "Published" : "Draft"}
            </Badge>
          </li>
        ))}
        {items.length === 0 ? (
          <li className="text-muted-foreground p-4 text-sm">
            None yet. Until there is at least one published quote the homepage
            keeps describing who the product is for, in the third person —
            which is the honest thing to show when nobody has said anything.
          </li>
        ) : null}
      </ul>
    </main>
  );
}
