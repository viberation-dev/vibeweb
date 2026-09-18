import { createClient } from "@/lib/integrations/supabase/server";
import { contentHref, LEARN_TYPE_VALUES } from "@/lib/learn";
import { listAllContent } from "@/lib/queries/content";
import { listAllTools } from "@/lib/queries/tools";
import { listWalkthroughs } from "@/lib/queries/walkthroughs";
import { siteUrl } from "@/lib/site-url";

/**
 * /llms.txt (VIB-183): a Markdown map of the public site for AI crawlers and
 * answer engines, per llmstxt.org. Built from the same queries as the
 * sitemap, so a new tool or article appears in both without anyone editing
 * this file.
 */
export const revalidate = 3600;

const link = (title: string, path: string, note?: string | null) =>
  `- [${title}](${siteUrl}${path})${note ? `: ${note.replace(/\s+/g, " ")}` : ""}`;

export async function GET() {
  const supabase = await createClient();
  const [tools, content, walkthroughs] = await Promise.all([
    listAllTools(supabase),
    listAllContent(supabase),
    listWalkthroughs(supabase),
  ]);
  const published = content.filter((c) => c.status === "published");
  const ofType = (types: readonly string[]) =>
    published
      .filter((c) => types.includes(c.type))
      .map((c) => link(c.title, contentHref(c.type, c.slug)));

  const text = [
    "# Viberation",
    "",
    "> A curated AI tool library, role-aware guides, and step-by-step walkthroughs for vibe coders: people building real software with AI tools.",
    "",
    "## Main sections",
    link("Tools", "/tools", "Directory of AI coding tools, models, agents and skills, with pricing, platform and who each is best for"),
    link("Learn", "/learn", "Guides and articles on building with AI"),
    link("Walkthroughs", "/walkthroughs", "Step-by-step guided builds"),
    link("Docs", "/docs", "Help for using Viberation itself"),
    link("Blog", "/blog", "Product news"),
    "",
    "## Tools",
    ...tools.map((t) => link(t.name, `/tools/${t.slug}`, t.tagline)),
    "",
    "## Walkthroughs",
    ...walkthroughs.map((w) => link(w.title, `/walkthroughs/${w.slug}`)),
    "",
    "## Learn",
    // Help articles sit under Docs below, not twice.
    ...ofType(LEARN_TYPE_VALUES.filter((t) => t !== "help_article")),
    "",
    "## Docs",
    ...ofType(["help_article", "role_guide"]),
    "",
    "## Blog",
    ...ofType(["announcement"]),
    "",
  ].join("\n");

  return new Response(text, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
