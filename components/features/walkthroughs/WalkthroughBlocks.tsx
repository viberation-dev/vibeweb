import Link from "next/link";

import { toggleTaskAction } from "@/app/(site)/walkthroughs/[slug]/actions";
import { BlockView } from "@/components/features/resource/BlockView";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  ChecklistState,
  NestedWalkthroughBlock,
  WalkthroughBlock,
} from "@/lib/validation/walkthrough";
import { walkthroughHref } from "@/lib/walkthroughs";

type Props = {
  /** Top-level, or a block inside a tab, which renders through here too. */
  block: WalkthroughBlock | NestedWalkthroughBlock;
  walkthroughSlug: string;
  stepIndex: number;
  checklistState: ChecklistState;
  /** Signed-out visitors can run a walkthrough but not save ticks (VIB-45). */
  canSave: boolean;
};

/**
 * Renders one authored block (§26 §1 taxonomy, MVP subset).
 *
 * A switch on `kind` rather than a registry: there are seven kinds and a
 * registry would be indirection for one consumer. The discriminated union
 * means adding a kind fails the typecheck here until it is handled.
 */
export function WalkthroughBlockView({
  block,
  walkthroughSlug,
  stepIndex,
  checklistState,
  canSave,
}: Props) {
  // Every other kind is context-free and shared with guides (VIB-192).
  if (block.kind !== "checklist") return <BlockView block={block} />;

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
                  name="walkthrough_slug"
                  value={walkthroughSlug}
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
            href={`/login?redirectTo=/walkthroughs/${walkthroughSlug}`}
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

/** Prev / next control for the runner. Links, so each step is a real URL. */
export function WalkthroughNav({
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
      aria-label="Walkthrough steps"
      className="mt-10 flex items-center justify-between gap-4 border-t pt-6"
    >
      {prev === null ? (
        <span />
      ) : (
        <Link
          href={walkthroughHref(slug, prev)}
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
          href={walkthroughHref(slug, next)}
          rel="next"
          className={buttonVariants()}
        >
          Next step →
        </Link>
      )}
    </nav>
  );
}
