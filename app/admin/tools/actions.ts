"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/integrations/supabase/server";
import { createTool, updateTool } from "@/lib/queries/tools";
import { requireStaff } from "@/lib/staff";
import { toolEditorSchema } from "@/lib/validation/tool";

export type ToolFormState = { error?: string };

/** `slug` is unique on `tools`, so a collision must be a form error, not a 500. */
function slugTaken(error: unknown): boolean {
  const message = error instanceof Error ? error.message : "";
  return /duplicate key|unique/i.test(message);
}

/**
 * Create or update one tool (VIB-59).
 *
 * Mirrors saveContentAction: requireStaff() so the action answers like the
 * page it was posted from, with RLS as the actual boundary — `tools` is
 * staff-write under migration 03.
 */
export async function saveToolAction(
  id: string | null,
  _previous: ToolFormState,
  formData: FormData,
): Promise<ToolFormState> {
  await requireStaff("/admin/tools");

  const parsed = toolEditorSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    category: formData.get("category"),
    tagline: formData.get("tagline"),
    description: formData.get("description"),
    pricing_tier: formData.get("pricing_tier"),
    outbound_url: formData.get("outbound_url"),
    is_affiliate: formData.get("is_affiliate"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();

  try {
    if (id) {
      await updateTool(supabase, id, parsed.data);
    } else {
      await createTool(supabase, parsed.data);
    }
  } catch (error) {
    if (slugTaken(error)) {
      return { error: `The slug "${parsed.data.slug}" is already taken.` };
    }
    throw error;
  }

  // The directory, the tool's own page and the home feed can all show it.
  revalidatePath("/tools", "layout");
  revalidatePath("/");
  revalidatePath("/admin/tools");

  // redirect() throws, so it must sit outside the try above.
  redirect("/admin/tools");
}
