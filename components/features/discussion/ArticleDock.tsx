import { IconMessageCircle } from "@tabler/icons-react";
import type { ReactNode } from "react";

import { AppreciateButton } from "@/components/features/discussion/AppreciateButton";
import { ShareMenu } from "@/components/features/resource/ShareMenu";
import type { AppreciationTarget } from "@/lib/queries/appreciations";

/**
 * The floating bar at the bottom of a long piece (VIB-199).
 *
 * Held back from VIB-198 on purpose: carrying only "share" and "save" it
 * duplicated the footer. With the appreciation and comment counts on it, it
 * is the thing that tells a reader half-way down a guide that other people
 * are in here — which is the whole argument for a dock rather than a second
 * row of buttons.
 *
 * Server-rendered. Only the share menu needs a client, and it is its own
 * component.
 */
export function ArticleDock({
  target,
  returnTo,
  appreciations,
  appreciated,
  commentCount,
  url,
  title,
  save,
}: {
  target: AppreciationTarget;
  returnTo: string;
  appreciations: number;
  appreciated: boolean;
  commentCount: number;
  url: string;
  title: string;
  /** The bookmark form, passed in rather than rebuilt here. */
  save?: ReactNode;
}) {
  return (
    <div
      className={
        /*
          Clear of the back-to-top button on the right, and of the phone's
          own home indicator underneath — `pb-[env(safe-area-inset-bottom)]`
          on the wrapper rather than the bar, so the bar keeps its shape.
        */
        "pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center pb-[max(1.25rem,env(safe-area-inset-bottom))] pr-20 pl-4"
      }
    >
      <div className="border-border bg-card pointer-events-auto flex max-w-full items-center gap-1 rounded-full border p-1.5 shadow-xl">
        <AppreciateButton
          target={target}
          count={appreciations}
          mine={appreciated}
          returnTo={returnTo}
          variant="compact"
        />

        <a
          href="#comments"
          className="text-muted-foreground hover:bg-secondary hover:text-foreground inline-flex items-center gap-2 rounded-full px-4 py-2 text-[0.9375rem] transition-colors"
        >
          <IconMessageCircle aria-hidden className="size-[1.1875rem]" />
          {commentCount}{" "}
          <span className="sr-only">comments — jump to the discussion</span>
        </a>

        <span aria-hidden className="bg-border mx-1 h-6 w-px" />

        <ShareMenu url={url} title={title} />

        {save}
      </div>
    </div>
  );
}
