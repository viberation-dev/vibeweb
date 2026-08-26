import type { SupabaseClient } from "@supabase/supabase-js";

import type { Tool } from "@/lib/queries/tools";
import {
  checklistStateSchema,
  wizardStepsSchema,
  type ChecklistState,
  type WizardSteps,
} from "@/lib/validation/wizard";
import type { Database, Tables } from "@/types/supabase";

export type WizardRow = Tables<"wizards">;
export type WizardProgress = Tables<"wizard_progress">;

/** A wizard with its jsonb `steps` parsed into real types. */
export type Wizard = Omit<WizardRow, "steps"> & { steps: WizardSteps };

type Client = SupabaseClient<Database>;

/**
 * Parses the jsonb columns a wizard carries.
 *
 * Migration 04 stores steps as an opaque blob, so nothing upstream
 * guarantees its shape. Throwing here is deliberate: a malformed wizard is
 * an authoring bug that should surface loudly in one place, not render as a
 * half-empty runner that a visitor has to figure out.
 */
function parseWizard(row: WizardRow): Wizard {
  const steps = wizardStepsSchema.safeParse(row.steps);

  if (!steps.success) {
    throw new Error(`Wizard "${row.slug}" has invalid steps: ${steps.error.issues[0].message}`);
  }
  return { ...row, steps: steps.data };
}

/**
 * Published wizards, newest first.
 *
 * RLS on `wizards` (migration 04) already hides drafts from everyone but
 * staff, so the status filter here is for the index's intent, not security —
 * a staff member browsing the index wants the published list, and reaches
 * drafts by their own URL.
 */
export async function listWizards(client: Client): Promise<Wizard[]> {
  const { data, error } = await client
    .from("wizards")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`listWizards: ${error.message}`);
  }
  return data.map(parseWizard);
}

/**
 * One wizard by slug. Null when it does not exist.
 *
 * A draft returns null for everyone except staff — that is RLS filtering the
 * row out, not a check in this function. Do not add one: the policy is the
 * boundary (§34).
 */
export async function getWizardBySlug(client: Client, slug: string): Promise<Wizard | null> {
  const { data, error } = await client.from("wizards").select("*").eq("slug", slug).maybeSingle();

  if (error) {
    throw new Error(`getWizardBySlug(${slug}): ${error.message}`);
  }
  return data ? parseWizard(data) : null;
}

/**
 * The tools a wizard recommends, alphabetical (VIB-46).
 *
 * One round trip, not two: the join table and `tools` are fetched together
 * through an embedded select, the same shape getToolTags and getContentTags
 * already use. Reading the ids first and then the rows doubled the cost of
 * the panel for nothing.
 */
export async function getWizardTools(client: Client, wizardId: string): Promise<Tool[]> {
  const { data, error } = await client
    .from("wizard_recommended_tools")
    .select("tools!inner(*)")
    .eq("wizard_id", wizardId);

  if (error) {
    throw new Error(`getWizardTools(${wizardId}): ${error.message}`);
  }
  return data.map((row) => row.tools).sort((a, b) => a.name.localeCompare(b.name));
}

export type ProgressSnapshot = {
  stepIndex: number;
  checklistState: ChecklistState;
};

/**
 * One user's progress through one wizard, or null if they have never started.
 *
 * RLS on `wizard_progress` is owner-only, so this can only ever return the
 * caller's own row. A `checklist_state` that fails to parse is treated as
 * empty rather than throwing — corrupt saved state must not lock someone out
 * of a wizard they can otherwise still run.
 */
export async function getWizardProgress(
  client: Client,
  userId: string,
  wizardId: string,
): Promise<ProgressSnapshot | null> {
  const { data, error } = await client
    .from("wizard_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("wizard_id", wizardId)
    .maybeSingle();

  if (error) {
    throw new Error(`getWizardProgress(${wizardId}): ${error.message}`);
  }
  if (!data) return null;

  const parsed = checklistStateSchema.safeParse(data.checklist_state);
  return {
    stepIndex: data.step_index,
    checklistState: parsed.success ? parsed.data : {},
  };
}

/**
 * Saves progress, creating the row on first save (VIB-45).
 *
 * Upserts on the unique (user_id, wizard_id) from migration 04, so starting
 * and resuming take the same path. `user_id` is written from the caller's
 * verified session; RLS rejects any other value anyway.
 */
export async function saveWizardProgress(
  client: Client,
  userId: string,
  wizardId: string,
  snapshot: ProgressSnapshot,
): Promise<void> {
  const { error } = await client.from("wizard_progress").upsert(
    {
      user_id: userId,
      wizard_id: wizardId,
      step_index: snapshot.stepIndex,
      checklist_state: snapshot.checklistState,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,wizard_id" },
  );

  if (error) {
    throw new Error(`saveWizardProgress(${wizardId}): ${error.message}`);
  }
}
