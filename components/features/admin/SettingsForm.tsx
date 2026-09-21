"use client";

import { useActionState } from "react";

import type { SettingsFormState } from "@/app/(site)/admin/settings/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SiteSettings } from "@/lib/queries/settings";
import { BADGE_MODES } from "@/lib/tool-badges";

type Props = {
  settings: SiteSettings;
  action: (
    state: SettingsFormState,
    formData: FormData,
  ) => Promise<SettingsFormState>;
};

/** Native select, same as ToolForm: keyboard and screen-reader behaviour for free. */
const selectClass =
  "border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border px-3 py-1 text-sm outline-none focus-visible:ring-3";

/** What each mode does, in the words a reader would use. */
const MODE_COPY: Record<(typeof BADGE_MODES)[number], { label: string; help: string }> = {
  staff: {
    label: "Staff picks only",
    help: "Only the badge set on each tool in the tools editor. Nothing is badged automatically.",
  },
  derived: {
    label: "From the numbers only",
    help: "Ignores the per-tool badge. New comes from when a tool was added, Popular from its view count.",
  },
  both: {
    label: "Both — a staff badge wins",
    help: "A tool with a badge set shows that one; every other tool falls back to the numbers below.",
  },
};

export function SettingsForm({ settings, action }: Props) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="tool_badge_mode">Where card badges come from</Label>
        <select
          id="tool_badge_mode"
          name="tool_badge_mode"
          defaultValue={settings.tool_badge_mode}
          className={selectClass}
        >
          {BADGE_MODES.map((mode) => (
            <option key={mode} value={mode}>
              {MODE_COPY[mode].label}
            </option>
          ))}
        </select>
        <ul className="text-muted-foreground space-y-1 text-sm">
          {BADGE_MODES.map((mode) => (
            <li key={mode}>
              <strong className="text-foreground font-semibold">
                {MODE_COPY[mode].label}:
              </strong>{" "}
              {MODE_COPY[mode].help}
            </li>
          ))}
        </ul>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="badge_new_days">&quot;New&quot; for how many days</Label>
          <Input
            id="badge_new_days"
            name="badge_new_days"
            type="number"
            min={1}
            max={365}
            defaultValue={settings.badge_new_days}
            required
          />
          <p className="text-muted-foreground text-sm">
            Counted from when the tool was added.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="badge_popular_views">&quot;Popular&quot; from this many views</Label>
          <Input
            id="badge_popular_views"
            name="badge_popular_views"
            type="number"
            min={1}
            defaultValue={settings.badge_popular_views}
            required
          />
          <p className="text-muted-foreground text-sm">
            Popular wins when a tool qualifies for both.
          </p>
        </div>
      </div>

      {state.error ? (
        <p role="alert" className="text-destructive text-sm">
          {state.error}
        </p>
      ) : null}
      {state.saved && !state.error ? (
        <p role="status" className="text-muted-foreground text-sm">
          Saved.
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save settings"}
      </Button>
    </form>
  );
}
