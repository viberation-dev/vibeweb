import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/integrations/supabase/server";
import { listAllTestimonials } from "@/lib/queries/testimonials";
import { initialsFrom } from "@/lib/testimonials";
import { requireStaff } from "@/lib/staff";

export const metadata: Metadata = { title: "Testimonials" };

/** Every testimonial, drafts included — the staff list (VIB-102). */
export default async function AdminTestimonialsPage() {
  await requireStaff("/admin/testimonials");

  const supabase = await createClient();
  const items = await listAllTestimonials(supabase);
  const published = items.filter((item) => item.published).length;

  return (
    <main className="mx-auto w-full max-w-4xl space-y-6 px-[clamp(1.25rem,4vw,2.5rem)] py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-[-0.04em]">
            Testimonials
          </h1>
          <p className="text-muted-foreground text-sm">
            {items.length} total, {published} published. The homepage shows the
            first three published, by order.
          </p>
        </div>
        <Link
          href="/admin/testimonials/new"
          className={buttonVariants({ variant: "pill", size: "pill-sm" })}
        >
          Add testimonial
        </Link>
      </div>

      <ul className="bg-secondary divide-border/60 divide-y overflow-hidden rounded-[1.125rem]">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-start justify-between gap-4 p-5"
          >
            <div className="min-w-0">
              <Link
                href={`/admin/testimonials/${item.id}`}
                className="font-heading font-bold tracking-tight hover:underline"
              >
                {item.author_name}
                {item.location ? ` · ${item.location}` : ""}
              </Link>
              <p className="text-muted-foreground line-clamp-2 text-sm">
                &ldquo;{item.quote}&rdquo;
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                {initialsFrom(item.author_name, item.initials)} · order{" "}
                {item.sort_order} · consent{" "}
                {new Date(item.consent_at).toISOString().slice(0, 10)}
              </p>
            </div>
            <Badge variant={item.published ? "secondary" : "outline"}>
              {item.published ? "Published" : "Draft"}
            </Badge>
          </li>
        ))}
        {items.length === 0 ? (
          <li className="text-muted-foreground p-5 text-sm">
            None yet. Until there is at least one published quote the homepage
            keeps describing who the product is for, in the third person — which
            is the honest thing to show when nobody has said anything.
          </li>
        ) : null}
      </ul>
    </main>
  );
}
