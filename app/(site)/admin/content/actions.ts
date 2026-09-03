"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/integrations/supabase/server";
import { createContent, updateContent } from "@/lib/queries/content";
import { requireStaff } from "@/lib/staff";
import { contentEditorSchema } from "@/lib/validation/content";

export type ContentFormState = { error?: string };

function readForm(formData: FormData) {
  return contentEditorSchema.safeParse({
    type: formData.get("type"),
    title: formData.get("title"),
    slug: formData.get("slug"),
    body: formData.get("body"),
    role_level: formData.get("role_level"),
    audience: formData.get("audience"),
    pillar: formData.get("pillar"),
    status: formData.get("status"),
  });
}

/** `slug` is unique on `content`, so a collision must be a form error, not a 500. */
function slugTaken(error: unknown): boolean {
  const message = error instanceof Error ? error.message : "";
  return /duplicate key|unique/i.test(message);
}

/**
 * Create or update one Learn article (VIB-59).
 *
 * `requireStaff()` runs first so a member gets the same answer here as on the
 * page — it is not the boundary, RLS is: `content` is staff-write under
 * migration 03 and would reject this write regardless.
 */
export async function saveContentAction(
  id: string | null,
  _previous: ContentFormState,
  formData: FormData,
): Promise<ContentFormState> {
  await requireStaff("/admin/content");

  const parsed = readForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();

  try {
    if (id) {
      await updateContent(supabase, id, parsed.data);
    } else {
      await createContent(supabase, parsed.data);
    }
  } catch (error) {
    if (slugTaken(error)) {
      return { error: `The slug "${parsed.data.slug}" is already taken.` };
    }
    throw error;
  }

  // The article's own page, the hub and the home feed can all show it.
  revalidatePath("/learn", "layout");
  revalidatePath("/");
  revalidatePath("/admin/content");

  // redirect() throws, so it must sit outside the try above.
  redirect("/admin/content");
}
