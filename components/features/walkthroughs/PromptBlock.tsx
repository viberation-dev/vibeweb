"use client";

import { IconChevronDown, IconExternalLink } from "@tabler/icons-react";
import Link from "next/link";
import { useState } from "react";

import { CopyButton } from "@/components/features/walkthroughs/CopyButton";
import { buttonVariants } from "@/components/ui/button";
import { AI_BUILDERS, AI_CHATS, type AiLauncher } from "@/lib/ai-launchers";
import { toolsHref } from "@/lib/tools-url";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  prompt: string;
  prompts?: { title: string; prompt: string }[];
};

/**
 * A copyable prompt, optionally with a choice of versions, followed by
 * one-click links to open an AI tool (VIB-160).
 *
 * Client-side only for the picker: which version is selected is throwaway UI
 * state, not something worth a URL or a saved row.
 */
export function PromptBlock({ label, prompt, prompts }: Props) {
  const options = prompts ?? [{ title: "", prompt }];
  const [selected, setSelected] = useState(0);
  const current = options[selected];

  return (
    <div className="rounded-lg border">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2">
        <p className="text-sm font-medium">{label}</p>
        <CopyButton text={current.prompt} label="Copy prompt" />
      </div>

      {options.length > 1 ? (
        <div role="group" aria-label="Prompt versions" className="flex flex-wrap gap-2 border-b px-4 py-2">
          {options.map((option, i) => (
            <button
              key={option.title}
              type="button"
              aria-pressed={i === selected}
              onClick={() => setSelected(i)}
              className={cn(
                "cursor-pointer rounded-full border px-3 py-1 text-sm transition-colors hover:bg-muted",
                i === selected && "border-transparent bg-primary text-primary-foreground hover:bg-primary",
              )}
            >
              {option.title}
            </button>
          ))}
        </div>
      ) : null}

      {/*
        pre-wrap, not pre-line: authored prompts use indentation that
        pre-line would collapse, and a prompt that loses its shape is a
        different prompt.
      */}
      <p className="px-4 py-3 font-mono text-sm whitespace-pre-wrap">{current.prompt}</p>

      <div className="flex flex-col gap-2 border-t px-4 py-3 text-sm">
        <p className="text-muted-foreground">Then open your AI tool and paste it in:</p>
        <LauncherList launchers={AI_CHATS} />
        <details className="group">
          <summary className="flex w-fit cursor-pointer list-none items-center gap-1 text-sm font-medium [&::-webkit-details-marker]:hidden">
            More tools
            <IconChevronDown aria-hidden className="size-4 transition-transform group-open:rotate-180" />
          </summary>
          <div className="mt-2 flex flex-col gap-2">
            <LauncherList launchers={AI_BUILDERS} />
            <p className="text-muted-foreground">
              Want the full list? Browse all{" "}
              <Link href={toolsHref({ category: "app_builders" })} className="underline">
                app builders
              </Link>{" "}
              and{" "}
              <Link href={toolsHref({ category: "ides" })} className="underline">
                coding editors (IDEs)
              </Link>
              .
            </p>
          </div>
        </details>
      </div>
    </div>
  );
}

function LauncherList({ launchers }: { launchers: readonly AiLauncher[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {launchers.map((tool) => (
        <li key={tool.name}>
          <a
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            {tool.name}
            <IconExternalLink aria-hidden />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
