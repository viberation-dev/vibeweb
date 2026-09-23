import { BlockView } from "@/components/features/resource/BlockView";
import type { OutlineEntry } from "@/lib/article-outline";
import type { GuideBlock } from "@/lib/validation/guide";
import { cn } from "@/lib/utils";

/**
 * A structured guide's body, with the outline's anchors attached to its
 * headings (VIB-198).
 *
 * The walk lives here rather than in each page because the heading counter
 * has to advance in step with the render — the nth heading block gets the
 * nth outline entry's id, which is what keeps the rail's links and the
 * page's anchors in agreement when two sections share a title.
 */
export function ArticleBody({
  blocks,
  outline,
  className,
}: {
  blocks: GuideBlock[];
  outline: OutlineEntry[];
  className?: string;
}) {
  let heading = 0;

  return (
    <div className={cn("reading", className)}>
      {blocks.map((block, index) => (
        <BlockView
          key={index}
          block={block}
          headingId={block.kind === "heading" ? outline[heading++]?.id : undefined}
        />
      ))}
    </div>
  );
}
