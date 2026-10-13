import { unstable_cache } from "next/cache";

import type { SupabaseClient } from "@supabase/supabase-js";

import { createAnonClient } from "@/lib/integrations/supabase/anon";
import { applySetup, DEFAULT_SETUP } from "@/lib/walkthrough-setup";
import { isNewSince } from "@/lib/whats-new";

import type { Tool } from "@/lib/queries/tools";
import {
  checklistStateSchema,
  walkthroughStepsSchema,
  type ChecklistState,
  type WalkthroughSteps,
} from "@/lib/validation/walkthrough";
import type { Database, Tables } from "@/types/supabase";

export type WalkthroughRow = Tables<"wizards">;
export type WalkthroughProgress = Tables<"wizard_progress">;

/** A walkthrough with its jsonb `steps` parsed into real types. */
export type Walkthrough = Omit<WalkthroughRow, "steps"> & {
  steps: WalkthroughSteps;
};

type Client = SupabaseClient<Database>;

/**
 * Parses the jsonb columns a walkthrough carries.
 *
 * Migration 04 stores steps as an opaque blob, so nothing upstream
 * guarantees its shape. Throwing here is deliberate: a malformed walkthrough is
 * an authoring bug that should surface loudly in one place, not render as a
 * half-empty runner that a visitor has to figure out.
 */
function parseWalkthrough(row: WalkthroughRow): Walkthrough {
  const steps = walkthroughStepsSchema.safeParse(row.steps);

  if (!steps.success) {
    throw new Error(
      `Walkthrough "${row.slug}" has invalid steps: ${steps.error.issues[0].message}`,
    );
  }
  return { ...row, steps: steps.data };
}

/**
 * Published walkthroughs, newest first.
 *
 * RLS on `walkthroughs` (migration 04) already hides drafts from everyone but
 * staff, so the status filter here is for the index's intent, not security —
 * a staff member browsing the index wants the published list, and reaches
 * drafts by their own URL.
 */
export async function listWalkthroughs(client: Client): Promise<Walkthrough[]> {
  const { data, error } = await client
    .from("wizards")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`listWalkthroughs: ${error.message}`);
  }
  /*
   * A list describes each walkthrough as a new reader meets it: the default
   * setup. Without this, a walkthrough with a Complete depth advertises ten
   * steps on its card and opens on eight. The runner reads the full set
   * through getWalkthroughBySlug and applies the reader's own setup.
   */
  return data.map(parseWalkthrough).map((walkthrough) => ({
    ...walkthrough,
    steps: applySetup(walkthrough.steps, DEFAULT_SETUP),
  }));
}

/**
 * Whether any published walkthrough is new, for the sidebar's marker.
 *
 * The layout asks on every signed-in page view and the answer is the same for
 * everyone, so it is cached for an hour through the session-less client, the
 * way the footer's affiliate count is. False on a failed read: a missing
 * marker is better than a broken page.
 */
export const hasNewWalkthroughCached = unstable_cache(
  async (): Promise<boolean> => {
    const client = createAnonClient();
    const [newest, settings] = await Promise.all([
      client
        .from("wizards")
        .select("created_at")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      client.from("site_settings").select("badge_new_days").maybeSingle(),
    ]);
    if (newest.error || !newest.data) return false;
    return isNewSince(newest.data.created_at, settings.data?.badge_new_days ?? 14);
  },
  ["new-walkthrough"],
  { revalidate: 60 * 60 },
);

/**
 * One walkthrough by slug. Null when it does not exist.
 *
 * A draft returns null for everyone except staff — that is RLS filtering the
 * row out, not a check in this function. Do not add one: the policy is the
 * boundary (§34).
 */
export async function getWalkthroughBySlug(
  client: Client,
  slug: string,
): Promise<Walkthrough | null> {
  const { data, error } = await client
    .from("wizards")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(`getWalkthroughBySlug(${slug}): ${error.message}`);
  }
  return data ? parseWalkthrough(data) : null;
}

/**
 * The tools a walkthrough recommends, alphabetical (VIB-46).
 *
 * One round trip, not two: the join table and `tools` are fetched together
 * through an embedded select, the same shape getToolTags and getContentTags
 * already use. Reading the ids first and then the rows doubled the cost of
 * the panel for nothing.
 */
export async function getWalkthroughTools(
  client: Client,
  walkthroughId: string,
): Promise<Tool[]> {
  const { data, error } = await client
    .from("wizard_recommended_tools")
    .select("tools!inner(*)")
    .eq("wizard_id", walkthroughId);

  if (error) {
    throw new Error(`getWalkthroughTools(${walkthroughId}): ${error.message}`);
  }
  return data
    .map((row) => row.tools)
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Published walkthroughs that recommend one tool, alphabetical (VIB-111) — the
 * reverse of getWalkthroughTools, for the tool page's "Guided walkthroughs".
 *
 * The status filter is intent, not security: RLS already hides drafts from
 * everyone but staff, and staff do not need their drafts advertised here.
 */
export async function getWalkthroughsForTool(
  client: Client,
  toolId: string,
): Promise<Pick<WalkthroughRow, "slug" | "title" | "role_level">[]> {
  const { data, error } = await client
    .from("wizard_recommended_tools")
    .select("wizards!inner(slug, title, role_level, status)")
    .eq("tool_id", toolId)
    .eq("wizards.status", "published");

  if (error) {
    throw new Error(`getWalkthroughsForTool(${toolId}): ${error.message}`);
  }
  return data
    .map((row) => row.wizards)
    .sort((a, b) => a.title.localeCompare(b.title));
}

export type ProgressSnapshot = {
  stepIndex: number;
  checklistState: ChecklistState;
};

/**
 * One user's progress through one walkthrough, or null if they have never started.
 *
 * RLS on `wizard_progress` is owner-only, so this can only ever return the
 * caller's own row. A `checklist_state` that fails to parse is treated as
 * empty rather than throwing — corrupt saved state must not lock someone out
 * of a walkthrough they can otherwise still run.
 */
export async function getWalkthroughProgress(
  client: Client,
  userId: string,
  walkthroughId: string,
): Promise<ProgressSnapshot | null> {
  const { data, error } = await client
    .from("wizard_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("wizard_id", walkthroughId)
    .maybeSingle();

  if (error) {
    throw new Error(
      `getWalkthroughProgress(${walkthroughId}): ${error.message}`,
    );
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
export async function saveWalkthroughProgress(
  client: Client,
  userId: string,
  walkthroughId: string,
  snapshot: ProgressSnapshot,
): Promise<void> {
  const { error } = await client.from("wizard_progress").upsert(
    {
      user_id: userId,
      wizard_id: walkthroughId,
      step_index: snapshot.stepIndex,
      checklist_state: snapshot.checklistState,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,wizard_id" },
  );

  if (error) {
    throw new Error(
      `saveWalkthroughProgress(${walkthroughId}): ${error.message}`,
    );
  }
}
