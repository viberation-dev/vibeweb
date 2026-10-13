"use client";

import { IconChevronDown, IconExternalLink, IconEye } from "@tabler/icons-react";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";

import { CopyButton } from "@/components/features/walkthroughs/CopyButton";
import { PromptExample } from "@/components/features/walkthroughs/PromptExample";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  AI_BUILDERS,
  AI_CHATS,
  DESKTOP_EDITORS,
  launcherHref,
  type AiLauncher,
} from "@/lib/ai-launchers";
import { segmentPrompt, type PlaceholderHint } from "@/lib/prompt-placeholders";
import { toolsHref } from "@/lib/tools-url";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  prompt: string;
  prompts?: { title: string; prompt: string; description?: string }[];
  placeholders?: PlaceholderHint[];
  followUp?: boolean;
};

/*
 * The AI tool the reader opened last, kept in localStorage so that step 2
 * leads with the tool they used in step 1. A store rather than state because
 * a step can hold several prompt blocks and they should all agree at once.
 */
const TOOL_KEY = "viberation:ai-tool";
const toolListeners = new Set<() => void>();

function subscribeToTool(onChange: () => void) {
  toolListeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    toolListeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function readTool(): string | null {
  try {
    return window.localStorage.getItem(TOOL_KEY);
  } catch {
    // Storage can be blocked. The buttons still work; they just do not reorder.
    return null;
  }
}

function rememberTool(name: string) {
  try {
    window.localStorage.setItem(TOOL_KEY, name);
  } catch {
    return;
  }
  toolListeners.forEach((listener) => listener());
}

/**
 * A copyable prompt, optionally with a choice of versions, followed by
 * one-click links to open an AI tool (VIB-160). Every link copies the prompt;
 * sites that support it also open with the prompt pre-filled, and desktop
 * editors open through their own URL scheme.
 *
 * Client-side only for the picker: which version is selected is throwaway UI
 * state, not something worth a URL or a saved row.
 *
 * A blank with a hint is a button: hovering or focusing it shows the tip, and
 * clicking it opens the filled-in example at that blank. What gets copied is
 * always the prompt as authored, blanks and all.
 *
 * A follow-up prompt gets no launch links. It answers something the AI just
 * said, and a link would open a new chat that has never seen it.
 */
export function PromptBlock({ label, prompt, prompts, placeholders, followUp }: Props) {
  const options: NonNullable<Props["prompts"]> = prompts ?? [{ title: "", prompt }];
  const [selected, setSelected] = useState(0);
  const current = options[selected];
  const [copiedTo, setCopiedTo] = useState<string | null>(null);
  const lastTool = useSyncExternalStore(subscribeToTool, readTool, () => null);
  const segments = segmentPrompt(current.prompt, placeholders);
  const hasBlanks = segments.some((segment) => segment.hint);
  /** Null is closed; -1 is open with no particular blank in focus. */
  const [example, setExample] = useState<number | null>(null);

  return (
    <div className="rounded-lg border">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2">
        <p className="text-sm font-medium">{label}</p>
        <div className="flex flex-wrap items-center gap-2">
          {hasBlanks ? (
            <Button type="button" size="sm" variant="ghost" onClick={() => setExample(-1)}>
              <IconEye aria-hidden />
              See an example
            </Button>
          ) : null}
          <CopyButton text={current.prompt} label="Copy prompt" />
        </div>
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
      {current.description ? (
        <p className="text-muted-foreground border-b px-4 py-2 text-sm">{current.description}</p>
      ) : null}

      {/*
        pre-wrap, not pre-line: authored prompts use indentation that
        pre-line would collapse, and a prompt that loses its shape is a
        different prompt.
      */}
      <p className="px-4 py-3 font-mono text-sm whitespace-pre-wrap">
        {segments.map((segment, i) =>
          segment.hint ? (
            <button
              key={i}
              type="button"
              onClick={() => setExample(segment.hintIndex)}
              className="group/blank decoration-primary relative cursor-help text-left font-mono underline decoration-dotted decoration-2 underline-offset-4"
            >
              {segment.text}
              <span
                role="tooltip"
                className="bg-popover text-popover-foreground pointer-events-none absolute bottom-full left-0 z-10 mb-1 hidden w-64 max-w-[70vw] rounded-lg border px-3 py-2 font-sans text-xs font-normal whitespace-normal shadow-md group-hover/blank:block group-focus-visible/blank:block"
              >
                {segment.hint.tip} <span className="text-muted-foreground">Click for examples.</span>
              </span>
            </button>
          ) : (
            segment.text
          ),
        )}
      </p>
      {example !== null ? (
        <PromptExample
          title={current.title ? `${label}: ${current.title}` : label}
          segments={segments}
          focus={example < 0 ? null : example}
          onClose={() => setExample(null)}
        />
      ) : null}

      {followUp ? (
        <p className="text-muted-foreground border-t px-4 py-3 text-sm">
          Copy this and paste it into the chat you already have open, under the AI&rsquo;s
          last reply. Do not start a new chat for it: a new chat has not seen your answers.
        </p>
      ) : (
      <div className="flex flex-col gap-2 border-t px-4 py-3 text-sm">
        <p className="text-muted-foreground">
          Open it in your AI tool. Clicking copies the prompt, and ChatGPT and Grok open with it
          already filled in.{" "}
          {lastTool
            ? `${lastTool} is first because it is the one you used last.`
            : "Use the same tool for every step, and it will be offered first from then on."}
        </p>
        <LauncherList
          launchers={AI_CHATS}
          prompt={current.prompt}
          onCopy={setCopiedTo}
          lastTool={lastTool}
        />
        {copiedTo ? (
          <p aria-live="polite" className="text-muted-foreground">
            Prompt copied. If {copiedTo} opens empty, paste it in with Ctrl+V (Cmd+V on a Mac).
          </p>
        ) : null}
        <details className="group">
          <summary className="flex w-fit cursor-pointer list-none items-center gap-1 text-sm font-medium [&::-webkit-details-marker]:hidden">
            More tools
            <IconChevronDown aria-hidden className="size-4 transition-transform group-open:rotate-180" />
          </summary>
          <div className="mt-2 flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <p className="text-muted-foreground">App builders, in your browser:</p>
              <LauncherList
                launchers={AI_BUILDERS}
                prompt={current.prompt}
                onCopy={setCopiedTo}
                lastTool={lastTool}
              />
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-muted-foreground">
                Code editors on your computer. Open app only works once it is installed, so use Get it
                first if you do not have it.
              </p>
              <ul className="flex flex-col gap-2">
                {DESKTOP_EDITORS.map((editor) => (
                  <li key={editor.name} className="flex flex-wrap items-center gap-2">
                    <span className="w-32 font-medium">{editor.name}</span>
                    <a
                      href={editor.appUrl}
                      onClick={() => copyPrompt(current.prompt, editor.name, setCopiedTo)}
                      className={buttonVariants({ variant: "outline", size: "sm" })}
                    >
                      Open app
                    </a>
                    <a
                      href={editor.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={buttonVariants({ variant: "ghost", size: "sm" })}
                    >
                      Get it
                      <IconExternalLink aria-hidden />
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
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
      )}
    </div>
  );
}

/**
 * Copies the prompt as the link opens. Fire-and-forget: the click must not
 * wait on the clipboard, or the browser treats the new tab as a popup.
 */
function copyPrompt(prompt: string, toolName: string, onCopy: (name: string) => void) {
  rememberTool(toolName);
  navigator.clipboard?.writeText(prompt).then(
    () => onCopy(toolName),
    // Denied clipboard: the prompt is still on screen to select by hand.
    () => {},
  );
}

function LauncherList({
  launchers,
  prompt,
  onCopy,
  lastTool,
}: {
  launchers: readonly AiLauncher[];
  prompt: string;
  onCopy: (name: string) => void;
  lastTool: string | null;
}) {
  // The tool used last leads the row, as the filled button.
  const ordered = [...launchers].sort(
    (a, b) => Number(b.name === lastTool) - Number(a.name === lastTool),
  );
  return (
    <ul className="flex flex-wrap gap-2">
      {ordered.map((tool) => (
        <li key={tool.name}>
          <a
            href={launcherHref(tool, prompt)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => copyPrompt(prompt, tool.name, onCopy)}
            className={buttonVariants({
              variant: tool.name === lastTool ? "default" : "outline",
              size: "sm",
            })}
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
