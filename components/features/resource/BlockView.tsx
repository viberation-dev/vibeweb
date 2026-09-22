import { IconExternalLink } from "@tabler/icons-react";
import Link from "next/link";

import { CopyButton } from "@/components/features/walkthroughs/CopyButton";
import { PromptBlock } from "@/components/features/walkthroughs/PromptBlock";
import { TabsBlock } from "@/components/features/walkthroughs/TabsBlock";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { NestedBlock, SharedBlock } from "@/lib/validation/blocks";

const CALLOUT_TONES = {
  info: "border-l-primary bg-muted/40",
  tip: "border-l-primary bg-muted/40",
  warning: "border-l-destructive bg-destructive/5",
} as const;

const CALLOUT_LABELS = {
  info: "Note",
  tip: "Tip",
  warning: "Careful",
} as const;

/**
 * Renders one authored block that needs no surrounding context (VIB-192).
 *
 * Every kind except `checklist`, which needs a walkthrough slug and step to
 * save a tick against and stays in WalkthroughBlocks.tsx. Guides render
 * entirely through here.
 *
 * Imports CopyButton, PromptBlock and TabsBlock from features/walkthroughs/
 * rather than moving them: features/skills/ and features/tools/ already
 * import CopyButton from there, so this matches the existing arrangement
 * instead of churning five files.
 */
export function BlockView({ block }: { block: SharedBlock | NestedBlock }) {
  switch (block.kind) {
    case "text":
      return <p className="leading-relaxed whitespace-pre-line">{block.body}</p>;

    case "callout":
      return (
        <aside className={cn("rounded-r-lg border-l-4 p-4", CALLOUT_TONES[block.tone])}>
          <p className="text-xs font-medium tracking-wide uppercase">
            {CALLOUT_LABELS[block.tone]}
          </p>
          <p className="mt-1 leading-relaxed whitespace-pre-line">{block.body}</p>
        </aside>
      );

    case "prompt":
      return <PromptBlock label={block.label} prompt={block.prompt} prompts={block.prompts} />;

    case "code":
      return (
        <div className="rounded-lg border">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2">
            <p className="font-mono text-xs text-muted-foreground">{block.language}</p>
            <CopyButton text={block.code} />
          </div>
          <pre className="overflow-x-auto px-4 py-3 font-mono text-sm">
            <code>{block.code}</code>
          </pre>
          {block.expected ? (
            <div className="border-t px-4 py-3">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                What you should see
              </p>
              <pre className="mt-1 overflow-x-auto font-mono text-sm whitespace-pre-wrap">
                <code>{block.expected}</code>
              </pre>
            </div>
          ) : null}
        </div>
      );

    case "links":
      return (
        <ul className="flex flex-wrap gap-2">
          {block.links.map((link) => (
            <li key={link.href}>
              {link.href.startsWith("/") ? (
                <Link
                  href={link.href}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  {link.label}
                  <IconExternalLink aria-hidden />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              )}
            </li>
          ))}
        </ul>
      );

    case "tabs":
      return (
        <TabsBlock
          label={block.label}
          detect={block.detect}
          tabs={block.tabs.map((tab) => ({
            key: tab.key,
            title: tab.title,
            content: tab.blocks.map((inner, i) => <BlockView key={i} block={inner} />),
          }))}
        />
      );
  }
}
