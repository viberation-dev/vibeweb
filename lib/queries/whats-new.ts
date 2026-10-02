import type { SupabaseClient } from "@supabase/supabase-js";

import { CHANGELOG } from "@/lib/changelog";
import { listCollectionsSurfaced } from "@/lib/queries/collections";
import { listContentSurfaced } from "@/lib/queries/content";
import { getSiteSettings } from "@/lib/queries/settings";
import { listToolsSurfaced } from "@/lib/queries/tools";
import { contentView, toolView, type ResourceView } from "@/lib/resource-view";
import {
  mergeWhatsNew,
  type WhatsNewEntry,
  type WhatsNewEvent,
  type WhatsNewInput,
  type WhatsNewKind,
} from "@/lib/whats-new";
import type { Database } from "@/types/supabase";

type Client = SupabaseClient<Database>;

/** An entry plus its renderable view. A feature has no row, so no view. */
export type WhatsNewItem = WhatsNewEntry & { view: ResourceView | null };

export type WhatsNewOptions = {
  limit?: number;
  kind?: WhatsNewKind;
  event?: WhatsNewEvent;
};

/** How many rows to pull per source before merging. */
const PER_SOURCE = 40;

/**
 * The What's new stream (VIB-230): additions and announced revisions across
 * tools, content, collections and shipped features, newest first.
 *
 * One source failing degrades to that source being absent rather than
 * blanking the whole stream — a reader is better served by three kinds of
 * news than by an empty page.
 */
export async function listWhatsNew(
  client: Client,
  { limit, kind, event }: WhatsNewOptions = {},
): Promise<WhatsNewItem[]> {
  /*
   * allSettled for the three table reads, because one source failing should
   * cost that source and not the page. getSiteSettings rides along in the same
   * batch but needs no guard: it already falls back to the defaults internally
   * and neither throws nor returns null (see its own comment).
   */
  const [sources, settings] = await Promise.all([
    Promise.allSettled([
      listToolsSurfaced(client, PER_SOURCE),
      listContentSurfaced(client, PER_SOURCE),
      listCollectionsSurfaced(client, PER_SOURCE),
    ]),
    getSiteSettings(client),
  ]);

  const [toolsResult, contentResult, collectionsResult] = sources;
  const tools = toolsResult.status === "fulfilled" ? toolsResult.value : [];
  const content = contentResult.status === "fulfilled" ? contentResult.value : [];
  const collections =
    collectionsResult.status === "fulfilled" ? collectionsResult.value : [];

  const views = new Map<string, ResourceView>();
  for (const tool of tools) views.set(tool.id, toolView(tool, settings));
  for (const item of content) views.set(item.id, contentView(item));

  const inputs: WhatsNewInput[] = [
    ...tools.map((tool) => ({
      id: tool.id,
      kind: "tool" as const,
      title: tool.name,
      addedAt: tool.created_at,
      revisedAt: tool.revised_at,
      note: tool.revision_note,
    })),
    ...content.map((item) => ({
      id: item.id,
      kind: "content" as const,
      title: item.title,
      addedAt: item.published_at,
      revisedAt: item.revised_at,
      note: item.revision_note,
    })),
    ...collections.map((collection) => ({
      id: collection.id,
      kind: "collection" as const,
      title: collection.title,
      href: `/collections/${collection.slug}`,
      addedAt: collection.created_at,
      revisedAt: null,
      note: null,
    })),
    /*
     * Features come from the repo constant, not a table — a changelog entry is
     * written in the pull request that causes it. `added` is an addition;
     * `improved` and `fixed` are updates, and the entry's own body is the note.
     */
    ...CHANGELOG.map((entry) => ({
      kind: "feature" as const,
      title: entry.title,
      href: "/changelog",
      addedAt: entry.kind === "added" ? entry.date : null,
      revisedAt: entry.kind === "added" ? null : entry.date,
      note: entry.body,
    })),
  ];

  const merged = mergeWhatsNew(inputs, { newDays: settings.badge_new_days });

  const filtered = merged.filter(
    (entry) =>
      (kind === undefined || entry.kind === kind) &&
      (event === undefined || entry.event === event),
  );

  // Filter before capping, so `?kind=tool&limit=6` gives six tools rather
  // than whichever tools happened to be in the first six of everything.
  const capped = limit === undefined ? filtered : filtered.slice(0, limit);

  return capped.map((entry) => ({
    ...entry,
    view: entry.id ? (views.get(entry.id) ?? null) : null,
  }));
}
