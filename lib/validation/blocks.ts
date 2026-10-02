import { z } from "zod";

/**
 * Authored content blocks, shared by walkthrough steps and guide bodies
 * (VIB-192).
 *
 * These started as `walkthroughs.steps` (§26 §1 taxonomy, MVP subset) and
 * moved here when guides took the same format. A second authoring shape for
 * the same six kinds is the pair that drifts: one of them gains a fix and
 * the other does not, and the bug surfaces in whichever surface nobody was
 * looking at.
 *
 * `checklist` is deliberately *not* here. Its ticks live in
 * `wizard_progress.checklist_state`, keyed by walkthrough and step, so it
 * only makes sense inside a runner. It stays in walkthrough.ts.
 *
 * Tested through its consumers: lib/validation/walkthrough.test.ts and
 * lib/validation/guide.test.ts.
 */

export const textBlock = z.object({
  kind: z.literal("text"),
  body: z.string().min(1),
});

/**
 * A section heading inside a guide (VIB-198).
 *
 * The block that makes the "On this page" rail possible: the outline is read
 * from these, not scraped out of rendered HTML, so the anchor an author sees
 * in the database is the anchor the link points at.
 *
 * `level` is 2 or 3 and nothing else — the page's `h1` is the title, and a
 * fourth level is a sign the section wanted to be its own piece. `eyebrow`
 * is the small line above a heading ("Step 02"), optional because only
 * sequential guides want one.
 */
export const headingBlock = z.object({
  kind: z.literal("heading"),
  level: z.union([z.literal(2), z.literal(3)]).default(2),
  title: z.string().min(1),
  eyebrow: z.string().min(1).optional(),
});

export const calloutBlock = z.object({
  kind: z.literal("callout"),
  tone: z.enum(["info", "tip", "warning"]).default("info"),
  body: z.string().min(1),
});

export const promptOption = z.object({
  /** Short name on the picker, e.g. "Quick check". */
  title: z.string().min(1),
  prompt: z.string().min(1),
});

export const promptBlock = z.object({
  kind: z.literal("prompt"),
  /** What to do with it — "Paste this into Claude Code", etc. */
  label: z.string().min(1),
  /**
   * The single prompt. Still required when `prompts` is set: builds from
   * before VIB-160 only read this field, and the one Supabase project serves
   * production and previews, so new content has to stay readable by them.
   */
  prompt: z.string().min(1),
  /** Two or more versions to choose between (VIB-160). Wins over `prompt`. */
  prompts: z.array(promptOption).min(2).optional(),
});

export const codeBlock = z.object({
  kind: z.literal("code"),
  language: z.string().default("bash"),
  code: z.string().min(1),
  /** What a correct run looks like, shown beside the command (§31). */
  expected: z.string().optional(),
});

/**
 * An authored link. Site-relative paths or https only: the value becomes an
 * href, and a `javascript:` or protocol-relative one would run or leave the
 * site on a visitor's click.
 */
export const linkHref = z
  .string()
  .refine(
    (href) => (href.startsWith("/") && !href.startsWith("//")) || href.startsWith("https://"),
    "Links are site paths starting with / or https:// URLs.",
  );

export const linksBlock = z.object({
  kind: z.literal("links"),
  links: z.array(z.object({ label: z.string().min(1), href: linkHref })).min(1),
});

/**
 * Blocks allowed inside a tab. No checklists or nested tabs: task ids stay
 * top-level. No headings either — the outline is built from the top level,
 * and a rail entry that jumps to a heading hidden behind an unselected tab
 * is a broken link that looks like a working one.
 */
export const nestedBlockSchema = z.discriminatedUnion("kind", [
  textBlock,
  calloutBlock,
  promptBlock,
  codeBlock,
  linksBlock,
]);

/**
 * Alternatives the reader picks one of, such as their operating system or a
 * host (VIB-162). With `detect: "os"`, tab keys are `windows`, `macos` and
 * `linux`, and the runner opens the visitor's own system first.
 */
export const tabsBlock = z.object({
  kind: z.literal("tabs"),
  label: z.string().min(1),
  detect: z.literal("os").optional(),
  tabs: z
    .array(
      z.object({
        key: z.string().min(1).regex(/^[a-z0-9-]+$/),
        title: z.string().min(1),
        blocks: z.array(nestedBlockSchema).min(1),
      }),
    )
    .min(2),
});

/**
 * Install tabs for one MCP server, generated rather than authored (VIB-217).
 *
 * The author names the server and what runs it; which clients exist and what
 * each one's panel says comes from MCP_CLIENTS. Before this, every guide
 * carried its own copy of the same three commands, and a vendor moving a path
 * meant an edit per guide with one of them missed.
 *
 * **Local (stdio) servers only** — ones with a command to run, which is what
 * `command` is. A remote server is a URL and a transport, every client spells
 * that differently again, and the two hosted clients *can* take one, so the
 * default client list would be wrong as well. The Supabase guide is remote and
 * stays hand-authored until that variant exists; do not reach for this block
 * for a URL.
 *
 * Expands into a `tabs` block at render time, so it is top-level only for the
 * same reason `tabs` is: a rail entry pointing inside an unselected tab is a
 * broken link that looks like a working one.
 */
export const mcpInstallBlock = z.object({
  kind: z.literal("mcp_install"),
  /** The name the server gets in config, e.g. `playwright`. */
  server: z.string().min(1),
  /** What runs it, e.g. `npx @playwright/mcp@latest`. */
  command: z.string().min(1),
  label: z.string().min(1).default("Install it in"),
  /**
   * Which clients to show, in order. Omitted means every client that can run
   * a local server — the right default, and one that grows on its own when a
   * client is added to the matrix.
   *
   * Not narrowed to `McpClientId` here: this schema parses whatever a
   * migration wrote, and an id that no longer exists should fail in
   * mcpInstallTabs with a name to grep for, not vanish into a `catch`.
   */
  clients: z.array(z.string().min(1)).min(1).optional(),
});

/** Every kind both surfaces render. */
export const sharedBlockSchema = z.discriminatedUnion("kind", [
  textBlock,
  headingBlock,
  calloutBlock,
  promptBlock,
  codeBlock,
  linksBlock,
  tabsBlock,
  mcpInstallBlock,
]);

export type SharedBlock = z.infer<typeof sharedBlockSchema>;
export type NestedBlock = z.infer<typeof nestedBlockSchema>;
export type TabsBlock = z.infer<typeof tabsBlock>;
