import { NextResponse } from "next/server";

import { getSkillFiles } from "@/lib/integrations/skills-sh";
import { createClient } from "@/lib/integrations/supabase/server";
import { getToolBySlug } from "@/lib/queries/tools";
import { parseSkillSource, skillRepo } from "@/lib/skill-facts";
import { buildSkillZip } from "@/lib/skill-zip";

type Context = { params: Promise<{ slug: string }> };

/**
 * A skill as a ZIP (VIB-132): the folder Claude.ai and ChatGPT take on
 * upload, and what a skills folder wants when unzipped in place.
 *
 * Built from the same cached skills.sh response the page lists, so the
 * download is exactly the files a visitor could read there first. Nothing is
 * stored and nothing runs: the route only packages text.
 *
 * When there is nothing we can package — a pack, no skills.sh source, no
 * SKILL.md, or skills.sh unreachable — it redirects to the GitHub repository
 * instead of failing, so the button never leads to an error page.
 */
export async function GET(_request: Request, { params }: Context) {
  const { slug } = await params;
  const supabase = await createClient();
  const tool = await getToolBySlug(supabase, slug);

  if (!tool || tool.category !== "skills") {
    return new NextResponse("Not found", { status: 404 });
  }

  const source = parseSkillSource(tool.skills_sh_source);
  const repo = skillRepo(source, tool.outbound_url);
  const fallback = () =>
    repo
      ? NextResponse.redirect(`https://github.com/${repo.owner}/${repo.repo}`, 302)
      : new NextResponse("Not found", { status: 404 });

  if (!source?.skill) return fallback();

  const result = buildSkillZip(source.skill, await getSkillFiles(source));
  if (!result.ok) {
    if (result.reason === "too_large") {
      console.error(`skill download ${slug}: over the size cap, sent to GitHub`);
    }
    return fallback();
  }

  return new NextResponse(Buffer.from(result.bytes), {
    headers: {
      "Content-Type": "application/zip",
      // source.skill is held to [A-Za-z0-9._:-] by SKILLS_SH_SOURCE, so it is safe in a header.
      "Content-Disposition": `attachment; filename="${source.skill.replace(/:/g, "-")}.zip"`,
      "Content-Length": String(result.bytes.length),
      // Same freshness as the page it came from.
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
