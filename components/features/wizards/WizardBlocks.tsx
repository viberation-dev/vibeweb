import Link from "next/link";

import { toggleTaskAction } from "@/app/(site)/wizards/[slug]/actions";
import { CopyButton } from "@/components/features/wizards/CopyButton";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ChecklistState, WizardBlock } from "@/lib/validation/wizard";
import { wizardHref } from "@/lib/wizards";

type Props = {
  block: WizardBlock;
  wizardSlug: string;
  stepIndex: number;
  checklistState: ChecklistState;
  /** Signed-out visitors can run a wizard but not save ticks (VIB-45). */
  canSave: boolean;
};

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
 * Renders one authored block (§26 §1 taxonomy, MVP subset).
 *
 * A switch on `kind` rather than a registry: there are five kinds and a
 * registry would be indirection for one consumer. The discriminated union
 * means adding a kind fails the typecheck here until it is handled.
 */
export function WizardBlockView({
  block,
  wizardSlug,
  stepIndex,
  checklistState,
  canSave,
}: Props) {
  switch (block.kind) {
    case "text":
      return (
        <p className="leading-relaxed whitespace-pre-line">{block.body}</p>
      );

    case "callout":
      return (
        <aside
          className={cn(
            "rounded-r-lg border-l-4 p-4",
            CALLOUT_TONES[block.tone],
          )}
        >
          <p className="text-xs font-medium tracking-wide uppercase">
            {CALLOUT_LABELS[block.tone]}
          </p>
          <p className="mt-1 leading-relaxed whitespace-pre-line">
            {block.body}
          </p>
        </aside>
      );

    case "prompt":
      return (
        <div className="rounded-lg border">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2">
            <p className="text-sm font-medium">{block.label}</p>
            <CopyButton text={block.prompt} label="Copy prompt" />
          </div>
          {/*
            pre-wrap, not pre-line: authored prompts use indentation that
            pre-line would collapse, and a prompt that loses its shape is a
            different prompt.
          */}
          <p className="px-4 py-3 font-mono text-sm whitespace-pre-wrap">
            {block.prompt}
          </p>
        </div>
      );

    case "code":
      return (
        <div className="rounded-lg border">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2">
            <p className="font-mono text-xs text-muted-foreground">
              {block.language}
            </p>
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

    case "checklist":
      return (
        <ul className="flex flex-col gap-2">
          {block.tasks.map((task) => {
            const done = Boolean(checklistState[task.id]);
            return (
              <li key={task.id}>
                {canSave ? (
                  /*
                    A form per task posting to a Server Action: ticking works
                    without JavaScript, and the tick is saved server-side
                    rather than held in a client store that a refresh loses.
                  */
                  <form action={toggleTaskAction}>
                    <input
                      type="hidden"
                      name="wizard_slug"
                      value={wizardSlug}
                    />
                    <input type="hidden" name="step_index" value={stepIndex} />
                    <input type="hidden" name="task_id" value={task.id} />
                    <input
                      type="hidden"
                      name="done"
                      value={done ? "false" : "true"}
                    />
                    <button
                      type="submit"
                      aria-pressed={done}
                      className="flex w-full cursor-pointer items-start gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/50"
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border text-xs",
                          done &&
                            "border-transparent bg-primary text-primary-foreground",
                        )}
                      >
                        {done ? "✓" : ""}
                      </span>
                      <span
                        className={cn(
                          done && "text-muted-foreground line-through",
                        )}
                      >
                        {task.label}
                      </span>
                    </button>
                  </form>
                ) : (
                  <div className="flex items-start gap-3 rounded-lg border p-3">
                    <span
                      aria-hidden
                      className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border text-xs"
                    />
                    <span>{task.label}</span>
                  </div>
                )}
              </li>
            );
          })}

          {canSave ? null : (
            <li className="text-sm text-muted-foreground">
              <Link
                href={`/login?redirectTo=/wizards/${wizardSlug}`}
                className="underline"
              >
                Sign in
              </Link>{" "}
              to tick these off and pick up where you left them.
            </li>
          )}
        </ul>
      );
  }
}

/** Prev / next control for the runner. Links, so each step is a real URL. */
export function WizardNav({
  slug,
  stepIndex,
  stepCount,
  children,
}: {
  slug: string;
  stepIndex: number;
  stepCount: number;
  /** Centre slot — the save control, per mockup screen 5's footer. */
  children?: React.ReactNode;
}) {
  const prev = stepIndex > 0 ? stepIndex - 1 : null;
  const next = stepIndex < stepCount - 1 ? stepIndex + 1 : null;

  return (
    <nav
      aria-label="Wizard steps"
      className="mt-10 flex items-center justify-between gap-4 border-t pt-6"
    >
      {prev === null ? (
        <span />
      ) : (
        <Link
          href={wizardHref(slug, prev)}
          rel="prev"
          className={buttonVariants({ variant: "outline" })}
        >
          ← Previous
        </Link>
      )}
      {children ?? <span />}

      {next === null ? (
        <span />
      ) : (
        <Link
          href={wizardHref(slug, next)}
          rel="next"
          className={buttonVariants()}
        >
          Next step →
        </Link>
      )}
    </nav>
  );
}
