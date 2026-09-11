import type { SupabaseClient } from "@supabase/supabase-js";

import type { ToolLink } from "@/lib/tool-links";
import type { Database } from "@/types/supabase";

type Client = SupabaseClient<Database>;

/**
 * Both ends of a tool's "works with" links (VIB-109).
 *
 * `outgoing` is what this tool links to (Claude → Cursor); `incoming` is what
 * links to it (Cursor ← Claude), shown as "Works with" so the Supabase MCP
 * page lists the models that pair with it without anyone entering the link
 * twice. The two queries run in parallel, so the page pays one round trip.
 *
 * RLS on `tool_links` is public-read, so this works signed out.
 */
export async function listToolLinks(
  client: Client,
  toolId: string,
): Promise<{ outgoing: ToolLink[]; incoming: ToolLink[] }> {
  const [outgoing, incoming] = await Promise.all([
    client
      .from("tool_links")
      .select("kind, note, sort_order, tool:tools!tool_links_linked_tool_id_fkey(name, slug, category)")
      .eq("tool_id", toolId),
    client
      .from("tool_links")
      .select("kind, note, sort_order, tool:tools!tool_links_tool_id_fkey(name, slug, category)")
      .eq("linked_tool_id", toolId),
  ]);

  if (outgoing.error) {
    throw new Error(`listToolLinks(${toolId}) outgoing: ${outgoing.error.message}`);
  }
  if (incoming.error) {
    throw new Error(`listToolLinks(${toolId}) incoming: ${incoming.error.message}`);
  }
  return { outgoing: outgoing.data, incoming: incoming.data };
}
