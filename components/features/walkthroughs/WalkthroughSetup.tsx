import { setSetupAction } from "@/app/(site)/walkthroughs/[slug]/actions";
import { Button } from "@/components/ui/button";
import {
  DEPTH_HINTS,
  DEPTH_LABELS,
  TEAM_HINTS,
  TEAM_LABELS,
  type Depth,
  type Setup,
  type Team,
} from "@/lib/walkthrough-setup";

type Props = {
  slug: string;
  stepKey: string;
  setup: Setup;
  options: { depths: Depth[]; teams: Team[] };
};

/**
 * "How are you doing this?": the reader's way through the walkthrough.
 *
 * A form posting to a Server Action, like the checklist, so it works without
 * JavaScript and the page that comes back is already the right one. Only the
 * questions the walkthrough has content for are asked, and a walkthrough with
 * none renders nothing.
 *
 * Folded shut once it has been seen, because it is answered once and then is
 * in the way; the summary line keeps the current answer visible.
 */
export function WalkthroughSetup({ slug, stepKey, setup, options }: Props) {
  const askDepth = options.depths.length > 1;
  const askTeam = options.teams.length > 1;
  if (!askDepth && !askTeam) return null;

  const current = [askTeam ? TEAM_LABELS[setup.team] : null, askDepth ? DEPTH_LABELS[setup.depth] : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <details className="group rounded-lg border">
      <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm [&::-webkit-details-marker]:hidden">
        <span>
          <span className="font-medium">How are you doing this?</span>{" "}
          <span className="text-muted-foreground">{current}</span>
        </span>
        <span className="text-primary underline underline-offset-4 group-open:hidden">Change</span>
      </summary>

      <form action={setSetupAction} className="flex flex-col gap-5 border-t px-4 py-4">
        <input type="hidden" name="walkthrough_slug" value={slug} />
        <input type="hidden" name="step_key" value={stepKey} />

        {askTeam ? (
          <Choice
            legend="Who is doing the work?"
            name="team"
            selected={setup.team}
            options={options.teams.map((team) => ({
              value: team,
              label: TEAM_LABELS[team],
              hint: TEAM_HINTS[team],
            }))}
          />
        ) : (
          <input type="hidden" name="team" value={setup.team} />
        )}

        {askDepth ? (
          <Choice
            legend="How thorough?"
            name="depth"
            selected={setup.depth}
            options={options.depths.map((depth) => ({
              value: depth,
              label: DEPTH_LABELS[depth],
              hint: DEPTH_HINTS[depth],
            }))}
          />
        ) : (
          <input type="hidden" name="depth" value={setup.depth} />
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" size="sm">
            Use these settings
          </Button>
          <p className="text-muted-foreground text-sm">
            You can change this at any step. Your ticked tasks are kept.
          </p>
        </div>
      </form>
    </details>
  );
}

function Choice({
  legend,
  name,
  selected,
  options,
}: {
  legend: string;
  name: string;
  selected: string;
  options: { value: string; label: string; hint: string }[];
}) {
  return (
    <fieldset>
      <legend className="text-sm font-medium">{legend}</legend>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {options.map((option) => (
          <label
            key={option.value}
            className="has-checked:border-primary has-checked:bg-muted/50 flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm"
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              defaultChecked={option.value === selected}
              className="accent-primary mt-1"
            />
            <span>
              <span className="block font-medium">{option.label}</span>
              <span className="text-muted-foreground block">{option.hint}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
