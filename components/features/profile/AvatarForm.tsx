"use client";

import { useActionState } from "react";

import type { ProfileFormState } from "@/app/(site)/account/settings/actions";
import { Avatar } from "@/components/features/profile/Avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type Props = {
  name: string;
  src: string | null;
  action: (
    state: ProfileFormState,
    formData: FormData,
  ) => Promise<ProfileFormState>;
};

/** Upload or remove the profile photo (VIB-178). Saved on its own, not with the profile form. */
export function AvatarForm({ name, src, action }: Props) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-5">
      <Avatar name={name} src={src} className="size-16 text-xl" />
      <div className="min-w-0 flex-1 space-y-2">
        <Label htmlFor="avatar">Photo</Label>
        <input
          id="avatar"
          name="avatar"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="file:bg-muted file:text-foreground block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:px-3 file:py-1.5 file:text-sm file:font-medium"
        />
        <p className="text-muted-foreground text-sm">
          PNG, JPEG or WebP, up to 2MB.
        </p>
        <div className="flex gap-2">
          <Button
            type="submit"
            name="intent"
            value="upload"
            size="sm"
            disabled={pending}
          >
            {pending ? "Saving…" : "Upload photo"}
          </Button>
          {src ? (
            <Button
              type="submit"
              name="intent"
              value="remove"
              variant="outline"
              size="sm"
              disabled={pending}
            >
              Remove
            </Button>
          ) : null}
        </div>
        {state.error ? (
          <p role="alert" className="text-destructive text-sm">
            {state.error}
          </p>
        ) : state.notice ? (
          <p role="status" className="text-muted-foreground text-sm">
            {state.notice}
          </p>
        ) : null}
      </div>
    </form>
  );
}
