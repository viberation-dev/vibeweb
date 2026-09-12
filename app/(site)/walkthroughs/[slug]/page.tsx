import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { saveStepAction } from "@/app/(site)/walkthroughs/[slug]/actions";
import { ResourceCard } from "@/components/features/resource/ResourceCard";
import {
  WalkthroughBlockView,
  WalkthroughNav,
} from "@/components/features/walkthroughs/WalkthroughBlocks";
import { WalkthroughStepper } from "@/components/features/walkthroughs/WalkthroughStepper";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/integrations/supabase/server";
import {
  getWalkthroughBySlug,
  getWalkthroughProgress,
  getWalkthroughTools,
} from "@/lib/queries/walkthroughs";
import { toolView } from "@/lib/resource-view";
import { resolveStepIndex, summariseProgress } from "@/lib/walkthroughs";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ step?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const walkthrough = await getWalkthroughBySlug(supabase, slug);

  if (!walkthrough) {
    return { title: "Walkthrough not found" };
  }
  return { title: walkthrough.title };
}

/**
 * The walkthrough runner (§31, VIB-44…VIB-46).
 *
 * Each step is a real URL, so the browser's back button, a bookmark and a
 * shared link all behave. Signed-in visitors resume where they stopped;
 * signed-out ones can read the whole thing but cannot tick anything off.
 */
export default async function WalkthroughRunnerPage({
  params,
  searchParams,
}: Props) {
  const { slug } = await params;
  const { step: stepParam } = await searchParams;

  const supabase = await createClient();

  /*
   * Two waves, not four. This page was the worst offender in the app: walkthrough
   * → session → progress → tools, each waiting on the last, and the tools
   * lookup was itself two round trips. Only progress genuinely depends on
   * anything earlier (it needs the user and the walkthrough id) — VIB-56.
   */
  const [walkthrough, { data: auth }] = await Promise.all([
    getWalkthroughBySlug(supabase, slug),
    supabase.auth.getUser(),
  ]);

  // Drafts are filtered out by RLS for anyone but staff, so this covers both
  // "no such walkthrough" and "not yours to see".
  if (!walkthrough) {
    notFound();
  }

  const [progress, tools] = await Promise.all([
    auth.user
      ? getWalkthroughProgress(supabase, auth.user.id, walkthrough.id)
      : Promise.resolve(null),
    getWalkthroughTools(supabase, walkthrough.id),
  ]);

  const stepIndex = resolveStepIndex(
    stepParam,
    progress?.stepIndex ?? null,
    walkthrough.steps.length,
  );
  const step = walkthrough.steps[stepIndex];

  const checklistState = progress?.checklistState ?? {};
  const summary = summariseProgress(walkthrough.steps, checklistState);

  const isLastStep = stepIndex === walkthrough.steps.length - 1;

  return (
    <main className="mx-auto w-full max-w-3xl p-6">
      <Link
        href="/walkthroughs"
        className="text-sm text-muted-foreground hover:underline"
      >
        ← All walkthroughs
      </Link>

      {/*
        The mockup's eyebrow. "Project build" is the walkthrough kind spelled for
        a reader — Setup and Path are Phase 1.5 and unbuilt, so nothing here
        branches on kind yet.
      */}
      <p className="text-muted-foreground mt-4 text-xs font-medium tracking-wide uppercase">
        Walkthrough · Project build
      </p>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        {walkthrough.role_level ? (
          <Badge variant="outline">{walkthrough.role_level}</Badge>
        ) : null}
        {walkthrough.status === "draft" ? (
          <Badge variant="secondary">Draft</Badge>
        ) : null}
      </div>

      <h1 className="mt-3 font-heading text-3xl font-semibold">
        {walkthrough.title}
      </h1>

      <div className="mt-6">
        <WalkthroughStepper
          slug={walkthrough.slug}
          steps={walkthrough.steps}
          currentIndex={stepIndex}
          progress={summary}
        />
      </div>

      <section className="mt-10">
        <h2 className="font-heading text-2xl font-medium">{step.title}</h2>
        {step.intro ? (
          <p className="mt-2 text-muted-foreground">{step.intro}</p>
        ) : null}

        <div className="mt-6 flex flex-col gap-5">
          {step.blocks.map((block, index) => (
            <WalkthroughBlockView
              // Blocks have no ids of their own — they are positional within
              // an authored step, and the array never reorders at runtime.
              key={`${step.key}-${index}`}
              block={block}
              walkthroughSlug={walkthrough.slug}
              stepIndex={stepIndex}
              checklistState={checklistState}
              canSave={Boolean(auth.user)}
            />
          ))}
        </div>
      </section>

      {isLastStep ? (
        <section className="mt-10 rounded-xl border bg-muted/40 p-5">
          <h2 className="font-heading text-lg font-medium">
            {summary.complete
              ? "That is the whole build. Well done."
              : "Nearly there"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {summary.complete
              ? "You have a project that exists on the internet. Keep going with a collection, or browse the directory for what to add next."
              : `${summary.total - summary.done} task${summary.total - summary.done === 1 ? "" : "s"} still unticked — go back through the steps and finish them off.`}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/collections" className={buttonVariants()}>
              Browse collections
            </Link>
            <Link
              href="/tools"
              className={buttonVariants({ variant: "outline" })}
            >
              Explore the directory
            </Link>
          </div>
        </section>
      ) : null}

      <WalkthroughNav
        slug={walkthrough.slug}
        stepIndex={stepIndex}
        stepCount={walkthrough.steps.length}
      >
        {auth.user ? (
          /*
            Explicit save rather than writing on every page view: paging
            through a walkthrough to look at it should not overwrite the step you
            had actually reached.

            The mockup labels this slot "Autosaved". It is not — saying so
            would promise a write that does not happen, and someone who
            trusted it would lose their place. The button says what it does.
          */
          <form action={saveStepAction}>
            <input type="hidden" name="walkthrough_slug" value={walkthrough.slug} />
            <input type="hidden" name="step_index" value={stepIndex} />
            <Button type="submit" variant="ghost" size="sm">
              Save my place here
            </Button>
          </form>
        ) : (
          <p className="text-muted-foreground text-xs">
            Sign in to save your place.
          </p>
        )}
      </WalkthroughNav>

      {tools.length ? (
        <section className="mt-12 border-t pt-8">
          <h2 className="font-heading text-xl font-medium">
            Tools used in this build
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Everything this walkthrough reaches for, with the directory entry for
            each.
          </p>
          <ul className="mt-4 grid items-start gap-4 sm:grid-cols-2">
            {tools.map(toolView).map((view) => (
              <li key={view.id}>
                <ResourceCard
                  href={view.href}
                  title={view.title}
                  eyebrow={view.eyebrow}
                  description={view.description}
                  badges={view.badges}
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
