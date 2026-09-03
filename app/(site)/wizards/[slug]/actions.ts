"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/integrations/supabase/server";
import {
  getWizardBySlug,
  getWizardProgress,
  saveWizardProgress,
} from "@/lib/queries/wizards";
import { allTaskIds } from "@/lib/wizards";

const toggleSchema = z.object({
  wizard_slug: z.string().min(1),
  task_id: z.string().min(1),
  step_index: z.coerce.number().int().min(0),
  done: z.enum(["true", "false"]).transform((value) => value === "true"),
});

/**
 * Ticks or unticks one checklist task (VIB-45).
 *
 * A plain Server Action taking FormData, like the bookmark toggle, so the
 * checklist works with JavaScript disabled.
 */
export async function toggleTaskAction(formData: FormData): Promise<void> {
  const parsed = toggleSchema.safeParse({
    wizard_slug: formData.get("wizard_slug"),
    task_id: formData.get("task_id"),
    step_index: formData.get("step_index"),
    done: formData.get("done"),
  });

  if (!parsed.success) {
    redirect("/wizards");
  }

  const { wizard_slug: slug, task_id: taskId, step_index: stepIndex, done } = parsed.data;

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();

  if (!auth.user) {
    // Signed-out visitors can run a wizard but not save (VIB-45). The UI does
    // not render these forms for them; this covers a hand-posted request.
    redirect(`/login?redirectTo=/wizards/${slug}`);
  }

  const wizard = await getWizardBySlug(supabase, slug);
  if (!wizard) {
    redirect("/wizards");
  }

  /*
   * Only ids that exist in the authored steps may be written. Without this,
   * a hand-posted form could stuff arbitrary keys into checklist_state —
   * RLS scopes the row to its owner, but it does not police its contents.
   */
  if (!allTaskIds(wizard.steps).includes(taskId)) {
    redirect(`/wizards/${slug}`);
  }

  const existing = await getWizardProgress(supabase, auth.user.id, wizard.id);
  const checklistState = { ...(existing?.checklistState ?? {}) };

  if (done) {
    checklistState[taskId] = true;
  } else {
    // Delete rather than store false: absent and false mean the same thing,
    // and this keeps the saved object from growing a key per task ever
    // touched.
    delete checklistState[taskId];
  }

  await saveWizardProgress(supabase, auth.user.id, wizard.id, {
    // Ticking a task on the step you are reading is also how "resume where I
    // was" learns where you were.
    stepIndex,
    checklistState,
  });

  revalidatePath(`/wizards/${slug}`);
}

const resumeSchema = z.object({
  wizard_slug: z.string().min(1),
  step_index: z.coerce.number().int().min(0),
});

/**
 * Records which step someone is on, without touching their checklist.
 *
 * Used by the "save my place" control. Navigation itself does not write —
 * paging through a wizard to look at it should not overwrite the step you
 * had actually reached.
 */
export async function saveStepAction(formData: FormData): Promise<void> {
  const parsed = resumeSchema.safeParse({
    wizard_slug: formData.get("wizard_slug"),
    step_index: formData.get("step_index"),
  });

  if (!parsed.success) {
    redirect("/wizards");
  }

  const { wizard_slug: slug, step_index: stepIndex } = parsed.data;

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();

  if (!auth.user) {
    redirect(`/login?redirectTo=/wizards/${slug}`);
  }

  const wizard = await getWizardBySlug(supabase, slug);
  if (!wizard) {
    redirect("/wizards");
  }

  const existing = await getWizardProgress(supabase, auth.user.id, wizard.id);
  await saveWizardProgress(supabase, auth.user.id, wizard.id, {
    stepIndex: Math.min(stepIndex, wizard.steps.length - 1),
    checklistState: existing?.checklistState ?? {},
  });

  revalidatePath(`/wizards/${slug}`);
}
