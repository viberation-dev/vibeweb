"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/integrations/supabase/server";
import {
  createTestimonial,
  deleteTestimonial,
  updateTestimonial,
} from "@/lib/queries/testimonials";
import { requireStaff } from "@/lib/staff";
import { testimonialEditorSchema } from "@/lib/validation/testimonial";

export type TestimonialFormState = { error?: string };

function readForm(formData: FormData) {
  return testimonialEditorSchema.safeParse({
    quote: formData.get("quote"),
    author_name: formData.get("author_name"),
    location: formData.get("location"),
    initials: formData.get("initials"),
    role_level: formData.get("role_level"),
    source_url: formData.get("source_url"),
    consent_at: formData.get("consent_at"),
    published: formData.get("published") ?? "",
    sort_order: formData.get("sort_order"),
  });
}

/**
 * Create or update one testimonial (VIB-102).
 *
 * `requireStaff()` runs first so a member gets the same answer here as on the
 * page — it is not the boundary, RLS is: `testimonials` is staff-write and
 * would reject this regardless.
 */
export async function saveTestimonialAction(
  id: string | null,
  _previous: TestimonialFormState,
  formData: FormData,
): Promise<TestimonialFormState> {
  await requireStaff("/admin/testimonials");

  const parsed = readForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();

  if (id) {
    await updateTestimonial(supabase, id, parsed.data);
  } else {
    await createTestimonial(supabase, parsed.data);
  }

  // The homepage is the only place these render.
  revalidatePath("/");
  revalidatePath("/admin/testimonials");

  // redirect() throws, so it sits outside any try above it.
  redirect("/admin/testimonials");
}

/**
 * Delete one testimonial.
 *
 * Unlike tools and articles there is no draft state to retreat to that would
 * serve here: a quote withdrawn by the person who gave it should leave, not
 * linger unpublished. Unpublishing stays available for the softer case.
 */
export async function deleteTestimonialAction(id: string): Promise<void> {
  await requireStaff("/admin/testimonials");

  const supabase = await createClient();
  await deleteTestimonial(supabase, id);

  revalidatePath("/");
  revalidatePath("/admin/testimonials");
  redirect("/admin/testimonials");
}
