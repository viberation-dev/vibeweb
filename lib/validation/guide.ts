import { z } from "zod";

/*
 * Relative, not the `@/` alias: guide.test.ts runs under
 * `node --experimental-strip-types`, which does not resolve the alias for a
 * *value* import. Every `@/` import in a tested lib file is `import type`,
 * which strip-types erases; `sharedBlockSchema` is a value. Same constraint
 * lib/changelog.ts records ("Alias-free ... so it runs under plain node --test").
 */
import { sharedBlockSchema, type SharedBlock } from "./blocks.ts";

/**
 * The shape of `content.blocks` (VIB-192).
 *
 * Every shared block kind, and no checklist: a guide has nowhere to save a
 * tick, and one that vanishes on reload is worse than none.
 *
 * jsonb enforces nothing beyond "is this JSON", so this schema is the only
 * thing between an authoring typo in a migration and a visitor's page
 * throwing. Same arrangement as walkthroughStepsSchema.
 *
 * A structured guide still carries a short plain `body` alongside its
 * blocks. `blocks` is the page, but `generateMetadata` and the JSON-LD both
 * read `body`, so a guide without one is a guide search engines describe
 * badly.
 */
export const guideBlocksSchema = z.array(sharedBlockSchema).min(1);

export type GuideBlock = SharedBlock;

/**
 * Parses a `content.blocks` column value.
 *
 * Returns null rather than throwing, and null for *any* failure — absent,
 * empty, or malformed. The caller's fallback is `body`, which is a real
 * page; half a rendered guide is not. A row whose blocks do not parse is an
 * authoring bug to fix in a migration, and it should not take the page down
 * on the way.
 */
export function toGuideBlocks(value: unknown): GuideBlock[] | null {
  const parsed = guideBlocksSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}
