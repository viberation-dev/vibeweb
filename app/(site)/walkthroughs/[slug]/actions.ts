"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/integrations/supabase/server";
import {
  getWalkthroughBySlug,
  getWalkthroughProgress,
  saveWalkthroughProgress,
} from "@/lib/queries/walkthroughs";
import { allTaskIds } from "@/lib/walkthroughs";

const toggleSchema = z.object({
  walkthrough_slug: z.string().min(1),
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
    walkthrough_slug: formData.get("walkthrough_slug"),
    task_id: formData.get("task_id"),
    step_index: formData.get("step_index"),
    done: formData.get("done"),
  });

  if (!parsed.success) {
    redirect("/walkthroughs");
  }

  const { walkthrough_slug: slug, task_id: taskId, step_index: stepIndex, done } = parsed.data;

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();

  if (!auth.user) {
    // Signed-out visitors can run a walkthrough but not save (VIB-45). The UI does
    // not render these forms for them; this covers a hand-posted request.
    redirect(`/login?redirectTo=/walkthroughs/${slug}`);
  }

  const walkthrough = await getWalkthroughBySlug(supabase, slug);
  if (!walkthrough) {
    redirect("/walkthroughs");
  }

  /*
   * Only ids that exist in the authored steps may be written. Without this,
   * a hand-posted form could stuff arbitrary keys into checklist_state —
   * RLS scopes the row to its owner, but it does not police its contents.
   */
  if (!allTaskIds(walkthrough.steps).includes(taskId)) {
    redirect(`/walkthroughs/${slug}`);
  }

  const existing = await getWalkthroughProgress(supabase, auth.user.id, walkthrough.id);
  const checklistState = { ...(existing?.checklistState ?? {}) };

  if (done) {
    checklistState[taskId] = true;
  } else {
    // Delete rather than store false: absent and false mean the same thing,
    // and this keeps the saved object from growing a key per task ever
    // touched.
    delete checklistState[taskId];
  }

  await saveWalkthroughProgress(supabase, auth.user.id, walkthrough.id, {
    // Ticking a task on the step you are reading is also how "resume where I
    // was" learns where you were.
    stepIndex,
    checklistState,
  });

  revalidatePath(`/walkthroughs/${slug}`);
}

const resumeSchema = z.object({
  walkthrough_slug: z.string().min(1),
  step_index: z.coerce.number().int().min(0),
});

/**
 * Records which step someone is on, without touching their checklist.
 *
 * Used by the "save my place" control. Navigation itself does not write —
 * paging through a walkthrough to look at it should not overwrite the step you
 * had actually reached.
 */
export async function saveStepAction(formData: FormData): Promise<void> {
  const parsed = resumeSchema.safeParse({
    walkthrough_slug: formData.get("walkthrough_slug"),
    step_index: formData.get("step_index"),
  });

  if (!parsed.success) {
    redirect("/walkthroughs");
  }

  const { walkthrough_slug: slug, step_index: stepIndex } = parsed.data;

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();

  if (!auth.user) {
    redirect(`/login?redirectTo=/walkthroughs/${slug}`);
  }

  const walkthrough = await getWalkthroughBySlug(supabase, slug);
  if (!walkthrough) {
    redirect("/walkthroughs");
  }

  const existing = await getWalkthroughProgress(supabase, auth.user.id, walkthrough.id);
  await saveWalkthroughProgress(supabase, auth.user.id, walkthrough.id, {
    stepIndex: Math.min(stepIndex, walkthrough.steps.length - 1),
    checklistState: existing?.checklistState ?? {},
  });

  revalidatePath(`/walkthroughs/${slug}`);
}
