import type { Metadata } from "next";

import { saveTestimonialAction } from "@/app/(site)/admin/testimonials/actions";
import { TestimonialForm } from "@/components/features/admin/TestimonialForm";
import { Panel } from "@/components/ui/panel";
import { requireStaff } from "@/lib/staff";

export const metadata: Metadata = { title: "New testimonial" };

export default async function NewTestimonialPage() {
  await requireStaff("/admin/testimonials/new");

  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 px-[clamp(1.25rem,4vw,2.5rem)] py-10">
      <h1 className="font-heading text-3xl font-bold tracking-[-0.04em]">
        New testimonial
      </h1>
      <Panel>
        <TestimonialForm
          testimonial={null}
          action={saveTestimonialAction.bind(null, null)}
        />
      </Panel>
    </main>
  );
}
