import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  deleteTestimonialAction,
  saveTestimonialAction,
} from "@/app/(site)/admin/testimonials/actions";
import { TestimonialForm } from "@/components/features/admin/TestimonialForm";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/integrations/supabase/server";
import { getTestimonialById } from "@/lib/queries/testimonials";
import { Panel } from "@/components/ui/panel";
import { requireStaff } from "@/lib/staff";

export const metadata: Metadata = { title: "Edit testimonial" };

export default async function EditTestimonialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireStaff(`/admin/testimonials/${id}`);

  const supabase = await createClient();
  const testimonial = await getTestimonialById(supabase, id);

  if (!testimonial) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 px-[clamp(1.25rem,4vw,2.5rem)] py-10">
      <h1 className="font-heading text-3xl font-bold tracking-[-0.04em]">
        Edit testimonial
      </h1>
      <Panel>
        <TestimonialForm
          testimonial={testimonial}
          action={saveTestimonialAction.bind(null, testimonial.id)}
        />
      </Panel>

      {/*
        Deleting is its own form rather than a button inside the editor: a
        withdrawn quote should leave the database, and that should not be one
        misclick away from the save button.
      */}
      <form
        action={deleteTestimonialAction.bind(null, testimonial.id)}
        className="border-destructive/30 space-y-3 rounded-[1.125rem] border p-5"
      >
        <p className="text-sm font-medium">Delete this testimonial</p>
        <p className="text-muted-foreground text-sm">
          For a quote someone has withdrawn. Unpublish instead if you only want
          it off the homepage for now.
        </p>
        <Button type="submit" variant="destructive">
          Delete permanently
        </Button>
      </form>
    </main>
  );
}
