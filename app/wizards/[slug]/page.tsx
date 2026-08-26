import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { saveStepAction } from "@/app/wizards/[slug]/actions";
import { ResourceCard } from "@/components/features/resource/ResourceCard";
import { WizardBlockView, WizardNav } from "@/components/features/wizards/WizardBlocks";
import { WizardStepper } from "@/components/features/wizards/WizardStepper";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/integrations/supabase/server";
import { getWizardBySlug, getWizardProgress, getWizardTools } from "@/lib/queries/wizards";
import { toolView } from "@/lib/resource-view";
import { resolveStepIndex, summariseProgress } from "@/lib/wizards";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ step?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const wizard = await getWizardBySlug(supabase, slug);

  if (!wizard) {
    return { title: "Wizard not found — Viberation" };
  }
  return { title: `${wizard.title} — Viberation` };
}

/**
 * The wizard runner (§31, VIB-44…VIB-46).
 *
 * Each step is a real URL, so the browser's back button, a bookmark and a
 * shared link all behave. Signed-in visitors resume where they stopped;
 * signed-out ones can read the whole thing but cannot tick anything off.
 */
export default async function WizardRunnerPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { step: stepParam } = await searchParams;

  const supabase = await createClient();

  /*
   * Two waves, not four. This page was the worst offender in the app: wizard
   * → session → progress → tools, each waiting on the last, and the tools
   * lookup was itself two round trips. Only progress genuinely depends on
   * anything earlier (it needs the user and the wizard id) — VIB-56.
   */
  const [wizard, { data: auth }] = await Promise.all([
    getWizardBySlug(supabase, slug),
    supabase.auth.getUser(),
  ]);

  // Drafts are filtered out by RLS for anyone but staff, so this covers both
  // "no such wizard" and "not yours to see".
  if (!wizard) {
    notFound();
  }

  const [progress, tools] = await Promise.all([
    auth.user ? getWizardProgress(supabase, auth.user.id, wizard.id) : Promise.resolve(null),
    getWizardTools(supabase, wizard.id),
  ]);

  const stepIndex = resolveStepIndex(stepParam, progress?.stepIndex ?? null, wizard.steps.length);
  const step = wizard.steps[stepIndex];

  const checklistState = progress?.checklistState ?? {};
  const summary = summariseProgress(wizard.steps, checklistState);

  const isLastStep = stepIndex === wizard.steps.length - 1;

  return (
    <main className="mx-auto w-full max-w-3xl p-6">
      <Link href="/wizards" className="text-sm text-muted-foreground hover:underline">
        ← All wizards
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {wizard.role_level ? <Badge variant="outline">{wizard.role_level}</Badge> : null}
        {wizard.status === "draft" ? <Badge variant="secondary">Draft</Badge> : null}
      </div>

      <h1 className="mt-3 font-heading text-3xl font-semibold">{wizard.title}</h1>

      <div className="mt-6">
        <WizardStepper
          slug={wizard.slug}
          steps={wizard.steps}
          currentIndex={stepIndex}
          progress={summary}
        />
      </div>

      <section className="mt-10">
        <h2 className="font-heading text-2xl font-medium">{step.title}</h2>
        {step.intro ? <p className="mt-2 text-muted-foreground">{step.intro}</p> : null}

        <div className="mt-6 flex flex-col gap-5">
          {step.blocks.map((block, index) => (
            <WizardBlockView
              // Blocks have no ids of their own — they are positional within
              // an authored step, and the array never reorders at runtime.
              key={`${step.key}-${index}`}
              block={block}
              wizardSlug={wizard.slug}
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
            {summary.complete ? "That is the whole build. Well done." : "Nearly there"}
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
            <Link href="/tools" className={buttonVariants({ variant: "outline" })}>
              Explore the directory
            </Link>
          </div>
        </section>
      ) : null}

      <WizardNav slug={wizard.slug} stepIndex={stepIndex} stepCount={wizard.steps.length} />

      {auth.user ? (
        /*
          Explicit save rather than writing on every page view: paging through
          a wizard to look at it should not overwrite the step you had
          actually reached.
        */
        <form action={saveStepAction} className="mt-4">
          <input type="hidden" name="wizard_slug" value={wizard.slug} />
          <input type="hidden" name="step_index" value={stepIndex} />
          <Button type="submit" variant="outline" size="sm">
            Save my place here
          </Button>
        </form>
      ) : null}

      {tools.length ? (
        <section className="mt-12 border-t pt-8">
          <h2 className="font-heading text-xl font-medium">Tools used in this build</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Everything this wizard reaches for, with the directory entry for each.
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
