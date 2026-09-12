import type { Metadata } from "next";

import { saveTestimonialAction } from "@/app/(site)/admin/testimonials/actions";
import { TestimonialForm } from "@/components/features/admin/TestimonialForm";
import { requireStaff } from "@/lib/staff";

export const metadata: Metadata = { title: "New testimonial" };

export default async function NewTestimonialPage() {
  await requireStaff("/admin/testimonials/new");

  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">New testimonial</h1>
      <TestimonialForm
        testimonial={null}
        action={saveTestimonialAction.bind(null, null)}
      />
    </main>
  );
}
