import {
  IconAdjustmentsAlt,
  IconArrowRight,
  IconArrowUpRight,
  IconRocket,
  IconSeeding,
  IconWand,
} from "@tabler/icons-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  chooseLevelAction,
  finishOnboardingAction,
} from "@/app/(focused)/onboarding/actions";
import { Button, ButtonIcon } from "@/components/ui/button";
import { IconTile } from "@/components/ui/icon-tile";
import { Panel } from "@/components/ui/panel";
import { createClient } from "@/lib/integrations/supabase/server";
import { getCurrentProfile } from "@/lib/queries/profiles";
import {
  DEFAULT_ROLE_LEVEL,
  ONBOARDING_STEPS,
  onboardingHref,
  resolveStep,
  revealHeadline,
  revealSummary,
  starterSetSlug,
  STARTER_SET_FALLBACK_SLUG,
  walkthroughFraming,
  stepEyebrow,
} from "@/lib/onboarding";
import {
  getCollectionBySlug,
  type Collection,
} from "@/lib/queries/collections";
import { listTags, type Tag } from "@/lib/queries/tags";
import { listTools, type Tool } from "@/lib/queries/tools";
import { listWalkthroughs, type Walkthrough } from "@/lib/queries/walkthroughs";
import { toolView } from "@/lib/resource-view";
import { ROLE_LEVELS, toRoleLevel, type RoleLevel } from "@/lib/role-level";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Get set up",
};

type Props = {
  searchParams: Promise<{ step?: string; level?: string; focus?: string }>;
};

const LEVEL_BLURBS: Record<RoleLevel, string> = {
  beginner: "New to building with AI.",
  intermediate: "Shipped a few projects.",
  expert: "Refining production code.",
};

/** One glyph per tier, in the mockup's order: seedling → rocket → dials. */
const LEVEL_ICONS: Record<RoleLevel, typeof IconSeeding> = {
  beginner: IconSeeding,
  intermediate: IconRocket,
  expert: IconAdjustmentsAlt,
};

/**
 * Three-step onboarding (§31, VIB-39).
 *
 * Every step is a real URL and every transition is a plain link or form, so
 * the back button works, a refresh keeps your answers, and none of it needs
 * JavaScript.
 *
 * Step 1 saves the chosen tier as it goes past (VIB-67); the reveal's exits
 * are tool cards people are meant to click, so holding the answer in the URL
 * until the end meant success looked identical to abandonment. Completion is
 * still only written by the final submit.
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

  const [starterTools, starterCollection, walkthroughs] =
    step === 3
      ? await Promise.all([
          // Narrowed to the focus when there is one. If that tag has fewer
          // than three tools the starter set is simply shorter — better than
          // padding it with things the person did not ask about.
          // Narrowed by tier as well as focus (VIB-94): an expert who picks
          // "frontend" was getting the same three rows as a beginner who did.
          // Tools with no stated audience stay in for everyone.
          listTools(supabase, {
            tag: focusTag?.slug,
            bestFor: level,
            sort: "popular",
            pageSize: 3,
          }).then((page) => page.tools),
          // One collection per tier, by slug. Falling back to the beginner
          // set rather than rendering an empty panel on the screen that
          // promises "here is your Viberation".
          getCollectionBySlug(supabase, starterSetSlug(level!)).then(
            (found) =>
              found ?? getCollectionBySlug(supabase, STARTER_SET_FALLBACK_SLUG),
          ),
          listWalkthroughs(supabase),
        ])
      : [[], null, []];

  const heading = ONBOARDING_STEPS.find((s) => s.step === step)!.title;

  return (
    <div className="w-full max-w-2xl">
      <p className="text-primary text-center text-xs font-bold tracking-widest uppercase">
        {stepEyebrow(step)}
      </p>

      {/* Dots, not a bar: three steps is few enough to show as places. */}
      <nav
        aria-label="Progress"
        className="mt-3 flex items-center justify-center gap-2"
      >
        {ONBOARDING_STEPS.map(({ step: n }) => (
          <span
            key={n}
            aria-current={n === step ? "step" : undefined}
            className={cn(
              "size-2 rounded-full",
              n <= step ? "bg-primary" : "bg-muted",
            )}
          >
            <span className="sr-only">Step {n}</span>
          </span>
        ))}
      </nav>

      <h1 className="font-heading mt-6 text-center text-3xl font-bold tracking-[-0.04em] lg:text-4xl">
        {step === 3 ? revealHeadline(profile.username) : heading}
      </h1>

      {step === 1 ? <StepLevel /> : null}
      {step === 2 && level ? <StepFocus level={level} tags={tags} /> : null}
      {step === 3 && level ? (
        <StepReveal
          level={level}
          focusTag={focusTag}
          tools={starterTools}
          collection={starterCollection ?? undefined}
          walkthrough={walkthroughs[0]}
        />
      ) : null}
    </div>
  );
}

function StepLevel() {
  return (
    <>
      <p className="text-muted-foreground mx-auto mt-3 max-w-md text-center">
        This is the one setting that changes what you see. We keep beginner
        guides clear of advanced noise, and the reverse.
      </p>

      {/*
        Posts to a Server Action that saves the tier and then redirects to
        step 2 as a plain URL, so the back button and refresh behave exactly
        as they did when this was a GET form (VIB-67).
      */}
      <form action={chooseLevelAction} className="mt-8">
        <div className="grid gap-3 sm:grid-cols-3">
          {ROLE_LEVELS.map(({ value, label }) => {
            const Icon = LEVEL_ICONS[value];
            return (
              <label
                key={value}
                className="bg-secondary hover:bg-primary/10 has-checked:ring-primary flex cursor-pointer flex-col items-center rounded-[1.125rem] p-6 text-center transition-colors has-checked:ring-2"
              >
                <input
                  type="radio"
                  name="role_level"
                  value={value}
                  defaultChecked={value === DEFAULT_ROLE_LEVEL}
                  className="sr-only"
                />
                <IconTile>
                  <Icon className="size-5" aria-hidden />
                </IconTile>
                <span className="font-heading mt-4 font-bold tracking-tight">
                  {label}
                </span>
                <span className="text-muted-foreground mt-1 text-sm">
                  {LEVEL_BLURBS[value]}
                </span>
              </label>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col items-center gap-3">
          <Button type="submit" variant="pill" size="pill">
            <ButtonIcon>
              <IconArrowUpRight />
            </ButtonIcon>
            Continue
          </Button>
          {/*
            The radio for Beginner is already checked, so this submits the same
            form rather than being a second code path with its own default.
          */}
          <p className="text-muted-foreground text-sm">
            Not sure? Continue as{" "}
            <span className="text-foreground">Beginner</span>.
          </p>
        </div>
      </form>
    </>
  );
}

function StepFocus({ level, tags }: { level: RoleLevel; tags: Tag[] }) {
  return (
    <>
      <p className="text-muted-foreground mx-auto mt-3 max-w-md text-center">
        Optional. Pick the one closest to what you are working on and we will
        lead with it, or skip if you are just here to explore.
      </p>

      <form method="get" action="/onboarding" className="mt-6">
        <input type="hidden" name="step" value="3" />
        <input type="hidden" name="level" value={level} />

        <div className="flex flex-wrap justify-center gap-2">
          {tags.map((tag) => (
            <label
              key={tag.id}
              className="bg-secondary hover:bg-primary/10 has-checked:bg-primary has-checked:text-primary-foreground cursor-pointer rounded-full px-3.5 py-1.5 text-sm font-bold transition-colors"
            >
              <input
                type="radio"
                name="focus"
                value={tag.slug}
                className="sr-only"
              />
              {tag.name}
            </label>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Button type="submit" variant="pill" size="pill">
            <ButtonIcon>
              <IconArrowUpRight />
            </ButtonIcon>
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
  walkthrough,
}: {
  level: RoleLevel;
  focusTag?: Tag;
  tools: Tool[];
  collection?: Collection;
  walkthrough?: Walkthrough;
}) {
  return (
    <>
      <p className="text-muted-foreground mt-3 text-center">
        {revealSummary(level, focusTag?.name)}
      </p>

      {/*
        The walkthrough is the headline offer, in its own accented panel — the
        mockup's "START HERE". Everything below it is browsing; this is the
        one thing that ends with something built.
      */}
      {walkthrough ? (
        <Panel
          tone="accent"
          className="mt-8 flex flex-wrap items-center gap-5"
          role="group"
        >
          <span
            aria-hidden
            className="bg-highlight-foreground text-highlight flex size-13 shrink-0 items-center justify-center rounded-2xl"
          >
            <IconWand className="size-6" />
          </span>
          <div className="min-w-40 flex-1">
            <p className="text-xs font-bold tracking-widest uppercase opacity-80">
              Start here
            </p>
            <h2 className="font-heading mt-1.5 text-xl font-bold tracking-tight">
              {walkthrough.title}
            </h2>
            <p className="mt-1.5 text-sm font-semibold opacity-75">
              Guided walkthrough, from an idea to a live URL
            </p>
            {/* Same walkthrough, pitched for who is reading it (VIB-94). */}
            <p className="mt-2.5 text-sm">{walkthroughFraming(level)}</p>
          </div>
        </Panel>
      ) : null}

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {tools.length ? (
          <Panel className="sm:col-span-2">
            <h2 className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
              {tools.length === 1
                ? "A tool to start with"
                : `${tools.length} tools to start with`}
            </h2>
            <ul className="mt-5 space-y-3.5">
              {tools.map(toolView).map((view) => (
                <li key={view.id} className="flex items-baseline gap-3">
                  <Link href={view.href} className="font-bold hover:underline">
                    {view.title}
                  </Link>
                  <span className="text-muted-foreground ml-auto text-xs">
                    {view.eyebrow}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        ) : null}

        {collection ? (
          <Panel className="hover:bg-primary/10 relative transition-colors">
            <h2 className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
              A collection
            </h2>
            <h3 className="font-heading mt-5 text-lg font-bold tracking-tight">
              <Link
                href={`/collections/${collection.slug}`}
                className="outline-none after:absolute after:inset-0"
              >
                {collection.title}
              </Link>
            </h3>
            {collection.description ? (
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {collection.description}
              </p>
            ) : null}
          </Panel>
        ) : null}
      </div>

      {/*
        §31: the flagship walkthrough is the primary action here, with the feed as
        the secondary. The level is already saved by now (VIB-67); what these
        record is that onboarding is finished, so the home nudge stops. Both
        submit the same form and differ only in where you land.
      */}
      <form
        action={finishOnboardingAction}
        className="mt-8 flex flex-col items-center gap-3"
      >
        <input type="hidden" name="role_level" value={level} />
        {walkthrough ? (
          <>
            <Button
              type="submit"
              name="next"
              value={`/walkthroughs/${walkthrough.slug}`}
              variant="pill"
              size="pill"
            >
              <ButtonIcon>
                <IconArrowUpRight />
              </ButtonIcon>
              Start {walkthrough.title}
            </Button>
            {/*
              A submit, not a link: skipping to the feed still has to write
              completion, or the home nudge keeps offering a flow this person
              has finished (VIB-67).
            */}
            <Button
              type="submit"
              name="next"
              value="/"
              variant="pill-soft"
              size="pill-sm"
            >
              <ButtonIcon tone="on-soft" size="sm">
                <IconArrowRight />
              </ButtonIcon>
              Skip to my feed
            </Button>
          </>
        ) : (
          <Button type="submit" variant="pill" size="pill">
            <ButtonIcon>
              <IconArrowUpRight />
            </ButtonIcon>
            Finish and take me in
          </Button>
        )}
      </form>

      <p className="text-muted-foreground mt-3 text-center text-sm">
        Your level is saved. Change it any time from{" "}
        <Link href="/account" className="underline">
          your profile
        </Link>
        .
      </p>
    </>
  );
}
