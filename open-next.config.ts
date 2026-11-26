import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
import memoryQueue from "@opennextjs/cloudflare/overrides/queue/memory-queue";
import d1NextTagCache from "@opennextjs/cloudflare/overrides/tag-cache/d1-next-tag-cache";

/*
 * Without these, static pages and unstable_cache entries are rebuilt on every
 * request on Workers, which brings back the CPU cost the static layout removed.
 *
 * - R2 holds the rendered pages and unstable_cache values.
 * - D1 records revalidatePath/revalidateTag calls (41 of them, from admin
 *   edits and member actions), so cached pages go stale when content changes.
 * - The memory queue re-renders a page after its `revalidate` window. Good
 *   enough at this traffic; swap in the Durable Object queue if it grows.
 *
 * Bindings are in wrangler.jsonc; `opennextjs-cloudflare deploy` creates the
 * D1 table and uploads the build's cache.
 */
export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
  tagCache: d1NextTagCache,
  queue: memoryQueue,
});
