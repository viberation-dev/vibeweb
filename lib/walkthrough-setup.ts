/*
 * How a reader has chosen to do a walkthrough, and what that hides.
 *
 * One walkthrough, several ways through it: a reader picks how thorough to be
 * and whether they are working alone, and steps and blocks tagged for other
 * choices drop out. Six copies of the same walkthrough was the alternative,
 * and six copies drift apart the first time one of them is fixed.
 *
 * Alias-free and dependency-free so it runs under plain `node --test`. The
 * shapes are restated rather than imported from lib/validation for that
 * reason; the schema there is what guarantees stored content matches them.
 */

export const DEPTHS = ["basic", "standard", "full"] as const;
export type Depth = (typeof DEPTHS)[number];

export const TEAMS = ["solo", "team"] as const;
export type Team = (typeof TEAMS)[number];

/**
 * Whose project it is. "mine" and "client" because those were the tab keys
 * when this was a choice repeated inside three steps; it became a setting so
 * it is answered once.
 */
export const OWNERS = ["mine", "client"] as const;
export type Owner = (typeof OWNERS)[number];

export type Setup = { depth: Depth; team: Team; owner: Owner };

/** What an unmarked walkthrough has always been: one person, every step. */
export const DEFAULT_SETUP: Setup = { depth: "standard", team: "solo", owner: "mine" };

export const DEPTH_LABELS: Record<Depth, string> = {
  basic: "Basic",
  standard: "Standard",
  full: "Complete",
};

export const DEPTH_HINTS: Record<Depth, string> = {
  basic: "The shortest route to a live site. Fewer steps, and the AI fills in more for you.",
  standard: "The whole build, one step at a time.",
  full: "Everything in Standard, plus research before you start and a review before you launch.",
};

export const TEAM_LABELS: Record<Team, string> = {
  solo: "Just me",
  team: "A team",
};

export const TEAM_HINTS: Record<Team, string> = {
  solo: "You decide and approve everything yourself.",
  team: "Other people supply information and sign things off.",
};

export const OWNER_LABELS: Record<Owner, string> = {
  mine: "My own",
  client: "A client's",
};

export const OWNER_HINTS: Record<Owner, string> = {
  mine: "You are building it for your own business, and you approve it.",
  client: "You are building it for someone else, who approves it and takes it over.",
};

/**
 * Who a step or block is for. A missing key means "everyone"; every key that
 * is set must match.
 */
export type When = {
  depth?: readonly Depth[];
  team?: readonly Team[];
  owner?: readonly Owner[];
};

export type SetupOptions = { depths: Depth[]; teams: Team[]; owners: Owner[] };

type Conditional = { when?: When };
type StepLike<B> = Conditional & { blocks: B[] };

export function matchesSetup(when: When | undefined, setup: Setup): boolean {
  if (!when) return true;
  if (when.depth && !when.depth.includes(setup.depth)) return false;
  if (when.team && !when.team.includes(setup.team)) return false;
  if (when.owner && !when.owner.includes(setup.owner)) return false;
  return true;
}

/**
 * The steps and blocks this reader sees.
 *
 * A step whose blocks all drop out goes with them: an empty step is a page
 * with a title and nothing to do.
 */
export function applySetup<B extends Conditional, S extends StepLike<B>>(
  steps: readonly S[],
  setup: Setup,
): S[] {
  return steps
    .filter((step) => matchesSetup(step.when, setup))
    .map((step) => ({
      ...step,
      blocks: step.blocks.filter((block) => matchesSetup(block.when, setup)),
    }))
    .filter((step) => step.blocks.length > 0);
}

/**
 * Which choices a walkthrough actually offers, read from its own content.
 *
 * Derived rather than declared, so a walkthrough with no tagged content shows
 * no panel, and an option appears the day content for it is published and
 * not before. Standard and "just me" are always among the options when their
 * question is asked: they are what untagged content means.
 */
export function setupOptions<B extends Conditional>(
  steps: readonly StepLike<B>[],
): SetupOptions {
  const depths = new Set<Depth>();
  const teams = new Set<Team>();
  const owners = new Set<Owner>();

  const note = (when: When | undefined) => {
    when?.depth?.forEach((depth) => depths.add(depth));
    when?.team?.forEach((team) => teams.add(team));
    when?.owner?.forEach((owner) => owners.add(owner));
  };
  for (const step of steps) {
    note(step.when);
    step.blocks.forEach((block) => note(block.when));
  }

  if (depths.size) depths.add(DEFAULT_SETUP.depth);
  if (teams.size) teams.add(DEFAULT_SETUP.team);
  if (owners.size) owners.add(DEFAULT_SETUP.owner);

  return {
    depths: DEPTHS.filter((depth) => depths.has(depth)),
    teams: TEAMS.filter((team) => teams.has(team)),
    owners: OWNERS.filter((owner) => owners.has(owner)),
  };
}

/** One cookie per walkthrough: a choice made for one build is not a choice for all. */
export function setupCookieName(slug: string): string {
  return `wt_setup_${slug}`;
}

export function serializeSetup(setup: Setup): string {
  return `${setup.depth}.${setup.team}.${setup.owner}`;
}

/** Cookies are untrusted input: anything unrecognised falls back to the default. */
export function parseSetup(value: string | undefined): Setup {
  // Cookies set before the owner question existed have two parts; the third
  // falls back like any other unrecognised value.
  const [depth, team, owner] = (value ?? "").split(".");
  return {
    depth: DEPTHS.find((known) => known === depth) ?? DEFAULT_SETUP.depth,
    team: TEAMS.find((known) => known === team) ?? DEFAULT_SETUP.team,
    owner: OWNERS.find((known) => known === owner) ?? DEFAULT_SETUP.owner,
  };
}

/**
 * A setup the walkthrough can honour. A cookie can outlive the content it was
 * set for, and "full" on a walkthrough that offers no Full would hide every
 * depth-tagged block at once.
 */
export function clampSetup(setup: Setup, options: SetupOptions): Setup {
  return {
    depth: options.depths.includes(setup.depth) ? setup.depth : DEFAULT_SETUP.depth,
    team: options.teams.includes(setup.team) ? setup.team : DEFAULT_SETUP.team,
    owner: options.owners.includes(setup.owner) ? setup.owner : DEFAULT_SETUP.owner,
  };
}

/**
 * Where a reader lands after changing their setup: the step they were on if
 * it still exists, otherwise the nearest one before it.
 */
export function stepIndexAfterChange(
  allStepKeys: readonly string[],
  visibleStepKeys: readonly string[],
  currentKey: string,
): number {
  const position = allStepKeys.indexOf(currentKey);
  for (let index = position; index >= 0; index -= 1) {
    const visible = visibleStepKeys.indexOf(allStepKeys[index]);
    if (visible >= 0) return visible;
  }
  return 0;
}
