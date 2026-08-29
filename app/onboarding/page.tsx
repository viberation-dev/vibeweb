import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { finishOnboardingAction } from "@/app/onboarding/actions";
import { ResourceCard } from "@/components/features/resource/ResourceCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/integrations/supabase/server";
import { getCurrentProfile } from "@/lib/queries/profiles";
import {
  DEFAULT_ROLE_LEVEL,
  ONBOARDING_STEPS,
  onboardingHref,
  resolveStep,
  revealSummary,
} from "@/lib/onboarding";
import { listFeaturedCollections, type Collection } from "@/lib/queries/collections";
import { listTags, type Tag } from "@/lib/queries/tags";
import { listTools, type Tool } from "@/lib/queries/tools";
import { listWizards, type Wizard } from "@/lib/queries/wizards";
import { toolView } from "@/lib/resource-view";
import { ROLE_LEVELS, toRoleLevel, type RoleLevel } from "@/lib/role-level";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Get set up — Viberation",
};

type Props = {
  searchParams: Promise<{ step?: string; level?: string; focus?: string }>;
};

const LEVEL_BLURBS: Record<RoleLevel, string> = {
  beginner: "New to building with AI tools. Show me the basics first.",
  intermediate: "I have shipped a few things. Skip the hand-holding.",
  expert: "I know the stack. Give me the deep material.",
};

/**
 * Three-step onboarding (§31, VIB-39).
 *
 * Every step is a real URL and every transition is a plain link or GET form,
 * so the back button works, a refresh keeps your answers, and none of it
 * needs JavaScript. Nothing touches the profile until the final submit —
 * abandoning at step 2 changes nothing.
 */
export default async function OnboardingPage({ searchParams }: Props) {
  const params = await searchParams;
  const level = toRoleLevel(params.level);
  const focus = params.focus?.trim() || undefined;
  const step = resolveStep(params.step, level);

  const supabase = await createClient();
  const profile = await getCurrentProfile(supabase);

  if (!profile) {
    // The middleware gates this route; this is the belt to its braces.
    redirect("/login?redirectTo=/onboarding");
  }

  /*
   * §31: onboarding "runs once, post-signup". The signup paths send people
   * here, and sign-in deliberately does not — but an existing member who
   * clicks a provider button on /signup would otherwise be walked through it
   * again. Anyone already finished goes to the feed instead.
   *
   * Abandoning the flow does not set the flag, so the home page keeps showing
   * its onboarding nudge (§31 home §3) until it is genuinely completed. That
   * nudge, not a repeated redirect, is the way back in.
   */
  if (profile.onboarding_completed) {
    redirect("/");
  }

  // Only the step being rendered fetches anything. resolveStep guarantees a
  // level exists past step 1, so these narrowings hold.
  const tags = step >= 2 ? await listTags(supabase) : [];
  const focusTag = tags.find((tag) => tag.slug === focus);

  const [starterTools, starterCollections, wizards] =
    step === 3
      ? await Promise.all([
          // Narrowed to the focus when there is one. If that tag has fewer
          // than three tools the starter set is simply shorter — better than
          // padding it with things the person did not ask about.
          listTools(supabase, { tag: focusTag?.slug, sort: "popular", pageSize: 3 }).then(
            (page) => page.tools,
          ),
          listFeaturedCollections(supabase, 1),
          listWizards(supabase),
        ])
      : [[], [], []];

  const heading = ONBOARDING_STEPS.find((s) => s.step === step)!.title;

  return (
    <main className="mx-auto w-full max-w-2xl p-6">
      <nav aria-label="Progress" className="flex items-center gap-2">
        {ONBOARDING_STEPS.map(({ step: n }) => (
          <span
            key={n}
            aria-current={n === step ? "step" : undefined}
            className={cn(
              "h-1.5 w-10 rounded-full",
              n === step ? "bg-primary" : n < step ? "bg-primary/40" : "bg-muted",
            )}
          >
            <span className="sr-only">Step {n}</span>
          </span>
        ))}
      </nav>

      <h1 className="mt-6 font-heading text-3xl font-semibold">{heading}</h1>

      {step === 1 ? <StepLevel /> : null}
      {step === 2 && level ? <StepFocus level={level} tags={tags} /> : null}
      {step === 3 && level ? (
        <StepReveal
          level={level}
          focusTag={focusTag}
          tools={starterTools}
          collection={starterCollections[0]}
          wizard={wizards[0]}
        />
      ) : null}
    </main>
  );
}

function StepLevel() {
  return (
    <>
      <p className="mt-2 text-muted-foreground">
        This tunes what you see across Learn and the home feed. You can change it any time in your
        profile.
      </p>

      {/*
        A GET form, so choosing a level just navigates to the next step with
        the answer in the URL. Nothing is saved yet.
      */}
      <form method="get" action="/onboarding" className="mt-6 flex flex-col gap-3">
        <input type="hidden" name="step" value="2" />
        {ROLE_LEVELS.map(({ value, label }) => (
          <label
            key={value}
            className="flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors hover:bg-muted/50 has-checked:border-primary has-checked:bg-muted/40"
          >
            <input
              type="radio"
              name="level"
              value={value}
              defaultChecked={value === DEFAULT_ROLE_LEVEL}
              className="mt-1"
            />
            <span>
              <span className="font-medium">{label}</span>
              <span className="block text-sm text-muted-foreground">{LEVEL_BLURBS[value]}</span>
            </span>
          </label>
        ))}
        <Button type="submit" size="lg" className="mt-2 self-start">
          Continue
        </Button>
      </form>
    </>
  );
}

function StepFocus({ level, tags }: { level: RoleLevel; tags: Tag[] }) {
  return (
    <>
      <p className="mt-2 text-muted-foreground">
        Optional — pick the one closest to what you are working on and we will lead with it.
      </p>

      <form method="get" action="/onboarding" className="mt-6">
        <input type="hidden" name="step" value="3" />
        <input type="hidden" name="level" value={level} />

        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <label
              key={tag.id}
              className="cursor-pointer rounded-full border px-3 py-1 text-sm transition-colors hover:bg-muted has-checked:border-transparent has-checked:bg-primary has-checked:text-primary-foreground"
            >
              <input type="radio" name="focus" value={tag.slug} className="sr-only" />
              {tag.name}
            </label>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button type="submit" size="lg">
            Continue
          </Button>
          {/*
            Skip is a link, not a disabled submit: step 2 is optional and must
            never be able to block finishing (VIB-39).
          */}
          <Link
            href={onboardingHref({ step: 3, level })}
            className="text-sm text-muted-foreground hover:underline"
          >
            Skip this
          </Link>
        </div>
      </form>
    </>
  );
}

function StepReveal({
  level,
  focusTag,
  tools,
  collection,
  wizard,
}: {
  level: RoleLevel;
  focusTag?: Tag;
  tools: Tool[];
  collection?: Collection;
  wizard?: Wizard;
}) {
  return (
    <>
      <p className="mt-2 text-lg text-muted-foreground">{revealSummary(level, focusTag?.name)}</p>
      <p className="mt-1 text-muted-foreground">Here is where to start.</p>

      {tools.length ? (
        <section className="mt-8">
          <h2 className="font-heading text-lg font-medium">
            {tools.length === 1 ? "A tool to look at first" : "Tools to look at first"}
          </h2>
          <ul className="mt-3 grid items-start gap-4 sm:grid-cols-2">
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

      {collection ? (
        <section className="mt-8">
          <h2 className="font-heading text-lg font-medium">A collection to work through</h2>
          <Card className="relative mt-3 transition-colors hover:bg-muted/40 focus-within:ring-2 focus-within:ring-ring">
            <CardHeader>
              <Badge variant="secondary" className="w-fit">
                Collection
              </Badge>
              <CardTitle>
                <Link
                  href={`/collections/${collection.slug}`}
                  className="after:absolute after:inset-0 outline-none"
                >
                  {collection.title}
                </Link>
              </CardTitle>
              {collection.description ? (
                <CardDescription>{collection.description}</CardDescription>
              ) : null}
            </CardHeader>
          </Card>
        </section>
      ) : null}

      {wizard ? (
        <section className="mt-8">
          <h2 className="font-heading text-lg font-medium">Or start building right now</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {wizard.steps.length} guided steps that end with a real URL you can send someone.
          </p>
        </section>
      ) : null}

      {/*
        §31: the flagship wizard is the primary action here, with the feed as
        the secondary. Both submit the same form, so the level is saved either
        way — the only difference is where you land.
      */}
      <form action={finishOnboardingAction} className="mt-6 flex flex-wrap items-center gap-3">
        <input type="hidden" name="role_level" value={level} />
        {wizard ? (
          <>
            <Button type="submit" name="next" value={`/wizards/${wizard.slug}`} size="lg">
              Start {wizard.title}
            </Button>
            <Button type="submit" name="next" value="/" size="lg" variant="outline">
              Just take me to the feed
            </Button>
          </>
        ) : (
          <Button type="submit" size="lg">
            Finish and take me in
          </Button>
        )}
      </form>
      <p className="mt-3 text-sm text-muted-foreground">
        Finishing saves your level. Change it any time from{" "}
        <Link href="/profile" className="underline">
          your profile
        </Link>
        .
      </p>
    </>
  );
}
