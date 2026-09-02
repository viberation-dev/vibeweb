import type { SupabaseClient } from "@supabase/supabase-js";

import { getContentByIds } from "@/lib/queries/content";
import { getToolsByIds } from "@/lib/queries/tools";
import { contentView, toolView, type ResourceView } from "@/lib/resource-view";
import type { Database, Enums } from "@/types/supabase";

type Client = SupabaseClient<Database>;

/** Anything that points at a resource by polymorphic (type, id) pair. */
type Target = { target_type: Enums<"target_kind">; target_id: string };

/**
 * Resolves polymorphic targets — bookmarks, history rows — to renderable
 * views, keyed by target id.
 *
 * Bookmarks, History and the home rail all needed the same eight lines, so
 * it lives here once. Target ids are uuids, so one map across kinds cannot
 * collide, and kinds with no UI yet (prompts, collections, wizards) are
 * simply absent from it.
 *
 * Callers drop entries whose target is missing rather than rendering holes:
 * nothing deletes a bookmark or history row when its tool goes away — no
 * foreign key can span a polymorphic target — so a vanished target is
 * expected, not an error.
 */
export async function resolveTargetViews(
  client: Client,
  targets: readonly Target[],
): Promise<Map<string, ResourceView>> {
  const idsOf = (kind: Enums<"target_kind">) =>
    targets.filter((target) => target.target_type === kind).map((target) => target.target_id);

  const [tools, content] = await Promise.all([
    getToolsByIds(client, idsOf("tool")),
    getContentByIds(client, idsOf("content")),
  ]);

  const views = new Map<string, ResourceView>();
  for (const view of [...tools.map(toolView), ...content.map(contentView)]) {
    views.set(view.id, view);
  }
  return views;
}
