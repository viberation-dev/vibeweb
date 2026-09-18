"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/integrations/supabase/server";
import {
  createComparison,
  deleteComparison,
  updateComparison,
} from "@/lib/queries/comparisons";
import { listAllTools } from "@/lib/queries/tools";
import { requireStaff } from "@/lib/staff";
import {
  comparisonEditorSchema,
  comparisonSlug,
} from "@/lib/validation/comparison";

export type ComparisonFormState = { error?: string };

/**
 * Create or update one comparison page (VIB-184). `requireStaff()` gives a
 * member the same answer as the page; RLS is the boundary.
 */
export async function saveComparisonAction(
  id: string | null,
  _previous: ComparisonFormState,
  formData: FormData,
): Promise<ComparisonFormState> {
  await requireStaff("/admin/comparisons");

  const parsed = comparisonEditorSchema.safeParse({
    tool_a_id: formData.get("tool_a_id"),
    tool_b_id: formData.get("tool_b_id"),
    intro: formData.get("intro"),
    pick_a: formData.get("pick_a"),
    pick_b: formData.get("pick_b"),
    models_a: formData.get("models_a") ?? "",
    models_b: formData.get("models_b") ?? "",
    published: formData.get("published") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  // ponytail: loads every tool to find two slugs; add getToolsByIds if the directory grows past a few hundred.
  const tools = await listAllTools(supabase);
  const a = tools.find((t) => t.id === parsed.data.tool_a_id);
  const b = tools.find((t) => t.id === parsed.data.tool_b_id);
  if (!a || !b) {
    return { error: "One of those tools no longer exists." };
  }

  const values = { ...parsed.data, slug: comparisonSlug(a.slug, b.slug) };
  try {
    if (id) {
      await updateComparison(supabase, id, values);
    } else {
      await createComparison(supabase, values);
    }
  } catch (error) {
    // The pair index makes "B vs A" a duplicate of "A vs B" too.
    if (error instanceof Error && error.message.includes("duplicate key")) {
      return { error: `${a.name} and ${b.name} already have a comparison page.` };
    }
    throw error;
  }

  revalidatePath("/compare", "layout");
  revalidatePath("/admin/comparisons");
  redirect("/admin/comparisons");
}

export async function deleteComparisonAction(id: string): Promise<void> {
  await requireStaff("/admin/comparisons");

  const supabase = await createClient();
  await deleteComparison(supabase, id);

  revalidatePath("/compare", "layout");
  revalidatePath("/admin/comparisons");
  redirect("/admin/comparisons");
}
