"use client";

import { IconX } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  filledText,
  hintName,
  hintsUsed,
  type PromptSegment,
} from "@/lib/prompt-placeholders";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  segments: readonly PromptSegment[];
  /** Which blank the reader clicked, to scroll its options into view. */
  focus: number | null;
  onClose: () => void;
};

/**
 * The prompt with every blank filled in, and the choices behind each one.
 *
 * A native <dialog>: it brings focus trapping, Escape and the backdrop with
 * it, which is all a modal here needs. Mounted only while open, so the chosen
 * options reset each time rather than leaking between prompts.
 *
 * There is deliberately no "copy this example" button. The example is
 * somebody else's project; the thing to copy is the prompt, with the
 * reader's own answers in it.
 */
export function PromptExample({ title, segments, focus, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [choices, setChoices] = useState<Record<number, number>>({});
  const used = hintsUsed(segments);

  useEffect(() => {
    dialog.current?.showModal();
    if (focus !== null) {
      document.getElementById(`blank-${focus}`)?.scrollIntoView({ block: "nearest" });
    }
  }, [focus]);

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      // A click on the backdrop lands on the dialog element itself.
      onClick={(event) => {
        if (event.target === dialog.current) dialog.current.close();
      }}
      aria-labelledby="prompt-example-title"
      className="bg-card text-card-foreground m-auto max-h-[85vh] w-[min(92vw,44rem)] rounded-lg border p-0 shadow-lg backdrop:bg-black/50"
    >
      <div className="flex max-h-[85vh] flex-col">
        <div className="flex items-start justify-between gap-4 border-b px-5 py-4">
          <div>
            <h2 id="prompt-example-title" className="font-heading text-lg font-semibold">
              A filled-in example
            </h2>
            <p className="text-muted-foreground mt-0.5 text-sm">{title}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label="Close"
            onClick={() => dialog.current?.close()}
          >
            <IconX aria-hidden />
          </Button>
        </div>

        <div className="flex flex-col gap-5 overflow-y-auto px-5 py-4">
          {/*
            A warning, not a caption. The first reader to test this copied two
            example answers into a real brief with the nouns swapped, and the
            AI built them in as facts about his business.
          */}
          <aside className="border-l-destructive bg-destructive/5 rounded-r-lg border-l-4 p-4">
            <p className="text-xs font-medium tracking-wide uppercase">Do not copy these answers</p>
            <p className="mt-1 text-sm leading-relaxed">
              They describe a made-up business. If you paste one in, even with the names
              changed, your AI tool will treat it as a fact about yours and build on it. Read
              them for the shape of a good answer, then write your own from scratch.
            </p>
          </aside>
          <p className="text-muted-foreground text-sm">
            Pick another option below to see the example change.
          </p>

          <p className="bg-muted/40 rounded-lg border px-4 py-3 font-mono text-sm whitespace-pre-wrap">
            {segments.map((segment, i) =>
              segment.hint ? (
                <mark key={i} className="bg-highlight text-highlight-foreground rounded px-0.5">
                  {filledText(segment, choices)}
                </mark>
              ) : (
                segment.text
              ),
            )}
          </p>

          <div>
            <h3 className="font-heading font-semibold">What goes in each blank</h3>
            <ul className="mt-3 flex flex-col gap-4">
              {used.map(({ hint, hintIndex }) => (
                <li key={hintIndex} id={`blank-${hintIndex}`} className="scroll-mt-4">
                  <p className="text-sm font-medium">
                    {hintName(hint)}{" "}
                    {hint.label ? (
                      <span className="text-muted-foreground font-mono text-xs font-normal">
                        {hint.token}
                      </span>
                    ) : null}
                  </p>
                  <p className="text-muted-foreground mt-0.5 text-sm">{hint.tip}</p>
                  {hint.options.length > 1 ? (
                    <div
                      role="group"
                      aria-label={`Examples for ${hintName(hint)}`}
                      className="mt-2 flex flex-col items-start gap-1.5"
                    >
                      {hint.options.map((option, optionIndex) => {
                        const selected = (choices[hintIndex] ?? 0) === optionIndex;
                        return (
                          <button
                            key={option}
                            type="button"
                            aria-pressed={selected}
                            onClick={() =>
                              setChoices((current) => ({ ...current, [hintIndex]: optionIndex }))
                            }
                            className={cn(
                              "hover:bg-muted cursor-pointer rounded-lg border px-3 py-1.5 text-left text-sm whitespace-pre-wrap transition-colors",
                              selected &&
                                "bg-primary text-primary-foreground hover:bg-primary border-transparent",
                            )}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="mt-2 rounded-lg border px-3 py-1.5 text-sm whitespace-pre-wrap">
                      {hint.options[0]}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </dialog>
  );
}
