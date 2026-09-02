import { IconCheck } from "@tabler/icons-react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import type { WizardSteps } from "@/lib/validation/wizard";
import { wizardHref, type WizardProgressSummary } from "@/lib/wizards";

type Props = {
  slug: string;
  steps: WizardSteps;
  currentIndex: number;
  progress: WizardProgressSummary;
};

/**
 * Step navigation and overall progress (VIB-44, restyled for VIB-79 to
 * mockup screen 5's wizard panel).
 *
 * Every step is a link, not a disabled-until-unlocked gate: this is a guide,
 * not an exam, and someone who already knows step 2 should be able to jump
 * to step 3. The mockup draws the steps as plain dots, which read as
 * non-interactive — they stay links, because making them inert would undo a
 * deliberate call and re-create the VIB-64 trap where a step you can see is
 * a step you cannot reach.
 *
 * Two different progress signals, deliberately kept apart:
 *
 *   The segmented bar is **step position** — the mockup's `.seg`, filled for
 *   steps behind you. It answers "how far through the build am I".
 *
 *   The "N of M done" text is **checklist tasks ticked**, which is work
 *   actually completed rather than pages turned. It used to be the bar; it
 *   is now the number beside it, so both facts survive in one row instead of
 *   two bars competing to mean "progress".
 */
export function WizardStepper({ slug, steps, currentIndex, progress }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-muted-foreground text-sm">
          <span className="text-foreground font-medium">
            Step {currentIndex + 1} of {steps.length}
          </span>{" "}
          · linear, one-off
        </p>
        {progress.total > 0 ? (
          <p className="text-muted-foreground text-sm">
            {progress.done} of {progress.total} done
          </p>
        ) : null}
      </div>

      {/*
        Segments rather than one filled track, so the number of steps is
        readable at a glance even before the labels below are scanned.
      */}
      <ol aria-hidden className="flex gap-1.5">
        {steps.map((step, index) => (
          <li
            key={step.key}
            className={cn(
              "h-1.5 flex-1 rounded-full",
              index <= currentIndex ? "bg-primary" : "bg-muted",
            )}
          />
        ))}
      </ol>

      <ol className="flex flex-wrap gap-x-4 gap-y-2">
        {steps.map((step, index) => {
          const current = index === currentIndex;
          const behind = index < currentIndex;
          return (
            <li key={step.key}>
              <Link
                href={wizardHref(slug, index)}
                aria-current={current ? "step" : undefined}
                className="group hover:text-foreground focus-visible:outline-ring flex items-center gap-2 rounded-md text-sm focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full border text-xs",
                    current &&
                      "border-primary bg-primary text-primary-foreground font-medium",
                    behind && "border-primary text-primary",
                    !current && !behind && "text-muted-foreground",
                  )}
                >
                  {behind ? (
                    <IconCheck aria-hidden className="size-3.5" />
                  ) : (
                    index + 1
                  )}
                </span>
                <span className={cn(!current && "text-muted-foreground")}>
                  {step.title}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
