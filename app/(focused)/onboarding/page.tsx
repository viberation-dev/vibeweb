import {
  IconAdjustmentsAlt,
  IconAppWindow,
  IconArrowLeft,
  IconArrowRight,
  IconArrowUpRight,
  IconBolt,
  IconBrandGoogle,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandReddit,
  IconBrandTiktok,
  IconBrandX,
  IconBrandYoutube,
  IconBriefcase,
  IconBulb,
  IconChartBar,
  IconCode,
  IconDots,
  IconFileText,
  IconHeart,
  IconHelpCircle,
  IconMessageChatbot,
  IconPalette,
  IconPencil,
  IconRocket,
  IconSchool,
  IconSeeding,
  IconShoppingCart,
  IconSpeakerphone,
  IconUser,
  IconUsers,
  IconWand,
  IconWorld,
} from "@tabler/icons-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  finishOnboardingAction,
  saveAnswerAction,
} from "@/app/(focused)/onboarding/actions";
import { Button, ButtonIcon } from "@/components/ui/button";
import { IconTile } from "@/components/ui/icon-tile";
import { Input } from "@/components/ui/input";
import { Panel } from "@/components/ui/panel";
import { createClient } from "@/lib/integrations/supabase/server";
import {
  CREATING_OPTIONS,
  DISCOVERY_OPTIONS,
  LAST_STEP,
  OCCUPATION_OPTIONS,
  ONBOARDING_STEPS,
  onboardingHref,
  resolveStep,
  revealHeadline,
  revealSummary,
  starterSetSlug,
  STARTER_SET_FALLBACK_SLUG,
  stepEyebrow,
  USAGE_OPTIONS,
  walkthroughFraming,
  type OnboardingStep,
  type OnboardingStepKey,
} from "@/lib/onboarding";
import { getCollectionBySlug, type Collection } from "@/lib/queries/collections";
import { getOnboardingAnswers } from "@/lib/queries/onboarding-answers";
import { getCurrentProfile } from "@/lib/queries/profiles";
import { listTools, type Tool } from "@/lib/queries/tools";
import { listWalkthroughs, type Walkthrough } from "@/lib/queries/walkthroughs";
import { toolView } from "@/lib/resource-view";
import { ROLE_LEVELS, type RoleLevel } from "@/lib/role-level";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Get set up",
};

type Props = {
  searchParams: Promise<{ step?: string }>;
};

type Icon = typeof IconSeeding;

const LEVEL_BLURBS: Record<RoleLevel, string> = {
  beginner: "New to building with AI.",
  intermediate: "Shipped a few projects.",
  expert: "Refining production code.",
};

/** One glyph per tier, in the mockup's order: seedling → rocket → dials. */
const LEVEL_ICONS: Record<RoleLevel, Icon> = {
  beginner: IconSeeding,
  intermediate: IconRocket,
  expert: IconAdjustmentsAlt,
};

const OPTION_ICONS: Record<string, Icon> = {
  // usage
  work: IconBriefcase,
  personal: IconUser,
  both: IconHeart,
  // occupation
  founder: IconBriefcase,
  developer: IconCode,
  designer: IconPalette,
  product: IconChartBar,
  marketer: IconSpeakerphone,
  creator: IconPencil,
  student: IconSchool,
  // creating
  landing_page: IconFileText,
  website: IconWorld,
  web_app: IconAppWindow,
  ecommerce: IconShoppingCart,
  workflow: IconBolt,
  inspiration: IconBulb,
  undecided: IconHelpCircle,
  // discovery
  youtube: IconBrandYoutube,
  friends: IconUsers,
  ai_chat: IconMessageChatbot,
  google: IconBrandGoogle,
  reddit: IconBrandReddit,
  x: IconBrandX,
  linkedin: IconBrandLinkedin,
  instagram: IconBrandInstagram,
  tiktok: IconBrandTiktok,
};

/**
 * Onboarding (§31, VIB-39, VIB-152): six short questions, then the reveal.
 *
 * Every step is a real URL and every transition is a plain link or form, so
 * the back button works, a refresh keeps your place, and none of it needs
 * JavaScript. Single-choice steps submit on the option itself, the way the
 * Magnific flow does; only the name, level and multi-pick need a Continue.
 */
export default async function OnboardingPage({ searchParams }: Props) {
  const step = resolveStep((await searchParams).step);

  const supabase = await createClient();
  const profile = await getCurrentProfile(supabase);

  if (!profile) {
    // The middleware gates this route; this is the belt to its braces.
    redirect("/login?redirectTo=/onboarding");
  }

  /*
   * §31: onboarding "runs once, post-signup". An existing member who clicks a
   * provider button on /signup would otherwise be walked through it again.
   * Abandoning does not set the flag, so the home nudge stays the way back in.
   */
  if (profile.onboarding_completed) {
    redirect("/");
  }

  const answers = await getOnboardingAnswers(supabase, profile.id);
  const level = profile.role_level;

  // Only the reveal fetches catalogue data.
  const [starterTools, starterCollection, walkthroughs] =
    step === LAST_STEP
      ? await Promise.all([
          // Narrowed by tier (VIB-94). Tools with no stated audience stay in.
          listTools(supabase, { bestFor: level, sort: "popular", pageSize: 3 }).then(
            (page) => page.tools,
          ),
          // Falling back to the beginner set rather than an empty panel on the
          // screen that promises "here is your Viberation".
          getCollectionBySlug(supabase, starterSetSlug(level)).then(
            (found) => found ?? getCollectionBySlug(supabase, STARTER_SET_FALLBACK_SLUG),
          ),
          listWalkthroughs(supabase),
        ])
      : [[], null, []];

  const current = ONBOARDING_STEPS.find((s) => s.step === step)!;
  const name = answers?.display_name ?? profile.username;
  const withIcons = (options: readonly { value: string; label: string; blurb?: string }[]) =>
    options.map((o) => ({ ...o, icon: OPTION_ICONS[o.value] ?? IconDots }));

  return (
    <div className="w-full max-w-2xl">
      <p className="text-primary text-center text-xs font-bold tracking-widest uppercase">
        {stepEyebrow(step)}
      </p>

      <div
        role="progressbar"
        aria-label="Onboarding progress"
        aria-valuemin={1}
        aria-valuemax={LAST_STEP}
        aria-valuenow={step}
        className="bg-muted mx-auto mt-3 h-1 w-48 overflow-hidden rounded-full"
      >
        <div
          className="bg-primary h-full rounded-full"
          style={{ width: `${(step / LAST_STEP) * 100}%` }}
        />
      </div>

      <h1 className="font-heading mt-6 text-center text-3xl font-bold tracking-[-0.04em] lg:text-4xl">
        {step === LAST_STEP ? revealHeadline(name) : current.title}
      </h1>

      {current.key === "name" ? <StepName defaultName={name ?? ""} /> : null}
      {current.key === "level" ? <StepLevel level={level} /> : null}
      {current.key === "usage" ? (
        <StepCards
          stepKey="usage"
          step={step}
          lede="Tell us about your projects so we can show you the right things."
          options={withIcons(USAGE_OPTIONS)}
          selected={answers?.usage}
        />
      ) : null}
      {current.key === "occupation" ? (
        <StepChips
          stepKey="occupation"
          step={step}
          lede="Pick the one that fits you best."
          options={withIcons(OCCUPATION_OPTIONS)}
          selected={answers?.occupation ? [answers.occupation] : []}
        />
      ) : null}
      {current.key === "creating" ? (
        <StepChips
          multiple
          stepKey="creating"
          step={step}
          lede="Pick as many as you like."
          options={withIcons(CREATING_OPTIONS)}
          selected={answers?.creating ?? []}
        />
      ) : null}
      {current.key === "discovery" ? (
        <StepChips
          stepKey="discovery"
          step={step}
          lede="Last question. It helps us know where to show up."
          options={withIcons(DISCOVERY_OPTIONS)}
          selected={answers?.discovery ? [answers.discovery] : []}
        />
      ) : null}
      {step === LAST_STEP ? (
        <StepReveal
          level={level}
          tools={starterTools}
          collection={starterCollection ?? undefined}
          walkthrough={walkthroughs[0]}
        />
      ) : null}
    </div>
  );
}

type QuestionKey = Exclude<OnboardingStepKey, "reveal">;
type Option = { value: string; label: string; icon: Icon; blurb?: string };

function Lede({ children }: { children: React.ReactNode }) {
  return <p className="text-muted-foreground mx-auto mt-3 max-w-md text-center">{children}</p>;
}

/** Back, an optional Continue, and Skip. Skip posts through the same action. */
function StepFooter({
  step,
  stepKey,
  withContinue = false,
}: {
  step: OnboardingStep;
  stepKey: QuestionKey;
  withContinue?: boolean;
}) {
  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-5">
      {step > 1 ? (
        <Link
          href={onboardingHref((step - 1) as OnboardingStep)}
          className="text-muted-foreground inline-flex items-center gap-1 text-sm hover:underline"
        >
          <IconArrowLeft className="size-4" aria-hidden />
          Back
        </Link>
      ) : null}
      {withContinue ? (
        <Button type="submit" variant="pill" size="pill">
          <ButtonIcon>
            <IconArrowUpRight />
          </ButtonIcon>
          Continue
        </Button>
      ) : null}
      <button
        type="submit"
        name="skip"
        value={stepKey}
        formNoValidate
        className="text-muted-foreground text-sm hover:underline"
      >
        Skip
      </button>
    </div>
  );
}

function StepName({ defaultName }: { defaultName: string }) {
  return (
    <>
      <Lede>We will use it to greet you.</Lede>
      <form action={saveAnswerAction} className="mx-auto mt-8 max-w-sm">
        <input type="hidden" name="step" value="name" />
        <label htmlFor="display_name" className="sr-only">
          Your name
        </label>
        <Input
          id="display_name"
          name="display_name"
          autoComplete="name"
          maxLength={60}
          required
          defaultValue={defaultName}
          placeholder="Your name"
        />
        <StepFooter step={1} stepKey="name" withContinue />
      </form>
    </>
  );
}

function StepLevel({ level }: { level: RoleLevel }) {
  return (
    <>
      <Lede>
        This is the one setting that changes what you see. We keep beginner
        guides clear of advanced noise, and the reverse.
      </Lede>

      <form action={saveAnswerAction} className="mt-8">
        <input type="hidden" name="step" value="level" />
        <div className="grid gap-3 sm:grid-cols-3">
          {ROLE_LEVELS.map(({ value, label }) => {
            const LevelIcon = LEVEL_ICONS[value];
            return (
              <label
                key={value}
                className="bg-secondary hover:bg-primary/10 has-checked:ring-primary has-focus-visible:ring-ring flex cursor-pointer flex-col items-center rounded-[1.125rem] p-6 text-center transition-colors has-checked:ring-2 has-focus-visible:ring-2"
              >
                {/* Pre-checked with the saved tier, which defaults to beginner (§31). */}
                <input
                  type="radio"
                  name="role_level"
                  value={value}
                  defaultChecked={value === level}
                  className="sr-only"
                />
                <IconTile>
                  <LevelIcon className="size-5" aria-hidden />
                </IconTile>
                <span className="font-heading mt-4 font-bold tracking-tight">{label}</span>
                <span className="text-muted-foreground mt-1 text-sm">{LEVEL_BLURBS[value]}</span>
              </label>
            );
          })}
        </div>
        <StepFooter step={2} stepKey="level" withContinue />
      </form>
    </>
  );
}

/** Single choice as cards; picking one saves it and moves on. */
function StepCards({
  stepKey,
  step,
  lede,
  options,
  selected,
}: {
  stepKey: QuestionKey;
  step: OnboardingStep;
  lede: string;
  options: Option[];
  selected?: string | null;
}) {
  return (
    <>
      <Lede>{lede}</Lede>
      <form action={saveAnswerAction} className="mt-8">
        <input type="hidden" name="step" value={stepKey} />
        <div className="grid gap-3 sm:grid-cols-2">
          {options.map(({ value, label, blurb, icon: OptionIcon }) => (
            <button
              key={value}
              type="submit"
              name={stepKey}
              value={value}
              aria-pressed={selected === value}
              className="bg-secondary hover:bg-primary/10 aria-pressed:ring-primary flex items-start gap-4 rounded-[1.125rem] p-5 text-left transition-colors aria-pressed:ring-2"
            >
              <IconTile>
                <OptionIcon className="size-5" aria-hidden />
              </IconTile>
              <span>
                <span className="font-heading block font-bold tracking-tight">{label}</span>
                {blurb ? (
                  <span className="text-muted-foreground mt-1 block text-sm">{blurb}</span>
                ) : null}
              </span>
            </button>
          ))}
        </div>
        <StepFooter step={step} stepKey={stepKey} />
      </form>
    </>
  );
}

/**
 * Pills. Single choice submits on click; `multiple` turns them into
 * checkboxes with a Continue, since picking several needs a moment to finish.
 */
function StepChips({
  stepKey,
  step,
  lede,
  options,
  selected,
  multiple = false,
}: {
  stepKey: QuestionKey;
  step: OnboardingStep;
  lede: string;
  options: Option[];
  selected: string[];
  multiple?: boolean;
}) {
  const chip =
    "bg-secondary hover:bg-primary/10 inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-colors";

  return (
    <>
      <Lede>{lede}</Lede>
      <form action={saveAnswerAction} className="mt-8">
        <input type="hidden" name="step" value={stepKey} />
        <div className="flex flex-wrap justify-center gap-2">
          {options.map(({ value, label, icon: OptionIcon }) =>
            multiple ? (
              <label
                key={value}
                className={cn(
                  chip,
                  "has-checked:bg-primary has-checked:text-primary-foreground has-focus-visible:ring-ring has-focus-visible:ring-2",
                )}
              >
                <input
                  type="checkbox"
                  name={stepKey}
                  value={value}
                  defaultChecked={selected.includes(value)}
                  className="sr-only"
                />
                <OptionIcon className="size-4" aria-hidden />
                {label}
              </label>
            ) : (
              <button
                key={value}
                type="submit"
                name={stepKey}
                value={value}
                aria-pressed={selected.includes(value)}
                className={cn(chip, "aria-pressed:bg-primary aria-pressed:text-primary-foreground")}
              >
                <OptionIcon className="size-4" aria-hidden />
                {label}
              </button>
            ),
          )}
        </div>
        <StepFooter step={step} stepKey={stepKey} withContinue={multiple} />
      </form>
    </>
  );
}

function StepReveal({
  level,
  tools,
  collection,
  walkthrough,
}: {
  level: RoleLevel;
  tools: Tool[];
  collection?: Collection;
  walkthrough?: Walkthrough;
}) {
  return (
    <>
      <p className="text-muted-foreground mt-3 text-center">
        {revealSummary(level)}
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
