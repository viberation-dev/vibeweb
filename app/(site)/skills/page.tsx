import type { Metadata } from "next";
import Link from "next/link";

import { BookmarkButton } from "@/components/features/bookmarks/BookmarkButton";
import { ResourceCard } from "@/components/features/resource/ResourceCard";
import { CategoryIcon } from "@/components/features/tools/CategoryIcon";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/integrations/supabase/server";
import { listBookmarks } from "@/lib/queries/bookmarks";
import { listContent } from "@/lib/queries/content";
import { listTools } from "@/lib/queries/tools";
import { contentView, toolView } from "@/lib/resource-view";
import {
  bySkillPopularity,
  HUB_GROUPS,
  hubGroupFor,
  SKILLS_HUB_TAG,
  skillLine,
} from "@/lib/skill-facts";
import { getSkillCardFacts } from "@/lib/skill-live";
import { toolsHref } from "@/lib/tools-url";

export const metadata: Metadata = {
  title: "Skills",
  description:
    "Agent skills worth installing, ranked by real installs, with independent security checks. Plus the package managers, directories and guides to go further.",
};

/** Enough for every skill and resource today; the directory paginates if this is ever outgrown. */
const HUB_LIMIT = 100;

/**
 * The skills hub (VIB-130).
 *
 * A view over rows that already exist, not a second store: skills are
 * `tools` rows in the `skills` category, the package managers and
 * directories are `tools` rows carrying the `skills-ecosystem` tag, and the
 * guides are `content` rows with the same tag, so they also appear in Learn.
 * Staff edit all of it in /admin like anything else.
 */
export default async function SkillsPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();

  const [{ tools: skillRows }, { tools: tagged }, { items: guides }, bookmarks] =
    await Promise.all([
      listTools(supabase, { category: "skills", pageSize: HUB_LIMIT }),
      listTools(supabase, { tag: SKILLS_HUB_TAG, pageSize: HUB_LIMIT }),
      listContent(supabase, { tag: SKILLS_HUB_TAG, pageSize: HUB_LIMIT }),
      auth.user ? listBookmarks(supabase, auth.user.id, "tool") : [],
    ]);

  // Cached per skill for an hour, and null rather than throwing (VIB-130).
  const skills = (
    await Promise.all(
      skillRows.map(async (tool) => ({ tool, name: tool.name, ...(await getSkillCardFacts(tool)) })),
    )
  ).sort(bySkillPopularity);

  const groups = HUB_GROUPS.map((group) => ({
    ...group,
    tools: tagged.filter((tool) => hubGroupFor(tool.category) === group.key),
  })).filter((group) => group.tools.length);

  const bookmarkedIds = new Set(bookmarks.map((bookmark) => bookmark.target_id));

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-14">
      <header>
        <p className="text-primary flex items-center gap-2.5 text-xs font-bold tracking-widest uppercase">
          <span aria-hidden className="bg-primary h-0.5 w-5 rounded-full" />
          Skills
        </p>
        <h1 className="font-heading mt-3.5 text-3xl font-bold tracking-[-0.04em] lg:text-4xl">
          Teach your agent how you work
        </h1>
        <p className="text-muted-foreground mt-3.5 max-w-[60ch] text-lg leading-relaxed">
          A skill is a folder of instructions your coding agent loads when a task matches, so it
          follows a proven method instead of improvising. These are ranked by real installs, and each
          skill&apos;s page shows independent security checks where they exist.
        </p>
      </header>

      <section aria-labelledby="skills-list" className="mt-12">
        <div className="flex flex-wrap items-center gap-3">
          <h2 id="skills-list" className="font-heading text-xl font-bold tracking-tight">
            Popular skills
          </h2>
          <Badge variant="secondary">{skills.length}</Badge>
        </div>
        <p className="text-muted-foreground mt-2 max-w-[60ch]">
          Install counts from skills.sh and stars from GitHub, refreshed hourly.{" "}
          <Link
            href={toolsHref({ category: "skills" })}
            className="text-primary font-semibold hover:underline"
          >
            Filter them in the directory
          </Link>
          .
        </p>

        {skills.length ? (
          <ul className="mt-6 grid items-start gap-4 md:grid-cols-2 lg:grid-cols-3">
            {skills.map(({ tool, installs, stars }) => (
              <li key={tool.id}>
                <ResourceCard
                  href={`/tools/${tool.slug}`}
                  title={tool.name}
                  icon={<CategoryIcon category={tool.category} className="text-primary size-4" />}
                  description={tool.tagline}
                  meta={skillLine(installs, stars) || undefined}
                  action={
                    <>
                      <BookmarkButton
                        targetType="tool"
                        targetId={tool.id}
                        bookmarked={bookmarkedIds.has(tool.id)}
                        returnTo="/skills"
                      />
                      <Link
                        href={`/tools/${tool.slug}`}
                        className={buttonVariants({ variant: "outline", size: "sm" })}
                      >
                        Details
                      </Link>
                    </>
                  }
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground mt-6">No skills are listed yet.</p>
        )}
      </section>

      {groups.map((group) => (
        <section key={group.key} aria-labelledby={`group-${group.key}`} className="mt-14">
          <h2
            id={`group-${group.key}`}
            className="font-heading text-xl font-bold tracking-tight"
          >
            {group.title}
          </h2>
          <p className="text-muted-foreground mt-2 max-w-[60ch]">{group.blurb}</p>
          <ul className="mt-6 grid items-start gap-4 md:grid-cols-2 lg:grid-cols-3">
            {group.tools.map((tool) => {
              return (
                <li key={tool.id}>
                  <ResourceCard
                    {...toolView(tool)}
                    icon={<CategoryIcon category={tool.category} className="text-primary size-4" />}
                    action={
                      <>
                        <BookmarkButton
                          targetType="tool"
                          targetId={tool.id}
                          bookmarked={bookmarkedIds.has(tool.id)}
                          returnTo="/skills"
                        />
                        {/* Through /go, as everywhere: the click is logged before the visitor leaves. */}
                        <a
                          href={`/go/${tool.slug}`}
                          rel="sponsored noopener"
                          target="_blank"
                          className={buttonVariants({ variant: "outbound", size: "sm" })}
                        >
                          Visit ↗
                        </a>
                      </>
                    }
                  />
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      {guides.length ? (
        <section aria-labelledby="skills-guides" className="mt-14">
          <h2 id="skills-guides" className="font-heading text-xl font-bold tracking-tight">
            Guides
          </h2>
          <p className="text-muted-foreground mt-2 max-w-[60ch]">
            What skills are, how to install them safely, and how to write your own.
          </p>
          <ul className="mt-6 grid items-start gap-4 md:grid-cols-2 lg:grid-cols-3">
            {guides.map((item) => (
              <li key={item.id}>
                <ResourceCard {...contentView(item)} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
