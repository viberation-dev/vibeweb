"use client";

import { useActionState, useState } from "react";

import type { ProfileFormState } from "@/app/profile/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Profile } from "@/lib/queries/profiles";

type Props = {
  profile: Profile;
  action: (state: ProfileFormState, formData: FormData) => Promise<ProfileFormState>;
};

const ROLE_LEVELS = [
  { value: "beginner", label: "Beginner — new to building with AI tools" },
  { value: "intermediate", label: "Intermediate — shipping projects already" },
  { value: "expert", label: "Expert — deep in the stack" },
] as const;

const LAYOUT_MODES = [
  { value: "essentials", label: "Essentials — just what I need" },
  { value: "advanced", label: "Advanced — show me everything" },
] as const;

/** Native selects on purpose: keyboard and screen-reader behaviour for free. */
const selectClass =
  "border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border px-3 py-1 text-sm outline-none focus-visible:ring-3";

export function ProfileForm({ profile, action }: Props) {
  const [state, formAction, pending] = useActionState(action, {});

  /*
   * Controlled rather than defaultValue. After a save, revalidatePath
   * re-renders this with a new profile prop, and an uncontrolled input warns
   * about its default changing post-initialisation. Remounting via key would
   * silence that but also resets useActionState, throwing away the "Saved."
   * confirmation — so hold the value in state instead and keep both.
   */
  const [username, setUsername] = useState(profile.username ?? "");

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          name="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="Not set"
          autoComplete="username"
        />
        <p className="text-muted-foreground text-sm">
          3–30 characters. Letters, numbers, hyphens and underscores. Leave blank to clear.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="role_level">Experience level</Label>
        <select
          id="role_level"
          name="role_level"
          defaultValue={profile.role_level}
          className={selectClass}
        >
          {ROLE_LEVELS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <p className="text-muted-foreground text-sm">
          Tunes which guides and tools are surfaced to you.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="layout_mode">Layout</Label>
        <select
          id="layout_mode"
          name="layout_mode"
          defaultValue={profile.layout_mode}
          className={selectClass}
        >
          {LAYOUT_MODES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {state.error ? (
        <p role="alert" className="text-destructive text-sm">
          {state.error}
        </p>
      ) : null}

      {state.notice ? (
        <p role="status" className="text-sm">
          {state.notice}
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
