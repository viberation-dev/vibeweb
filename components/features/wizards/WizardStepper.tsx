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
 * Step navigation and overall progress (VIB-44, §31).
 *
 * Every step is a link, not a disabled-until-unlocked gate: this is a guide,
 * not an exam, and someone who already knows step 2 should be able to jump
 * to step 3. The bar tracks ticked checklist tasks rather than which step
 * you are looking at, so it reflects work done, not pages turned.
 */
export function WizardStepper({ slug, steps, currentIndex, progress }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-medium">
          Step {currentIndex + 1} of {steps.length}
        </p>
        {progress.total > 0 ? (
          <p className="text-sm text-muted-foreground">
            {progress.done} of {progress.total} done
          </p>
        ) : null}
      </div>

      {progress.total > 0 ? (
        <div
          role="progressbar"
          aria-valuenow={progress.percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Checklist progress"
          className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
        >
          <div className="h-full bg-primary transition-all" style={{ width: `${progress.percent}%` }} />
        </div>
      ) : null}

      <ol className="flex flex-wrap gap-2">
        {steps.map((step, index) => {
          const current = index === currentIndex;
          return (
            <li key={step.key}>
              <Link
                href={wizardHref(slug, index)}
                aria-current={current ? "step" : undefined}
                className={cn(
                  "rounded-full border px-3 py-1 text-sm transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  current && "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
                )}
              >
                <span className="text-muted-foreground/70 aria-current:text-inherit">
                  {index + 1}.
                </span>{" "}
                {step.title}
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
