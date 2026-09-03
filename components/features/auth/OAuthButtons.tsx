import { IconBrandGithub, IconBrandGoogle } from "@tabler/icons-react";

import { signInWithProviderAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";

/**
 * Provider sign-in.
 *
 * One form, with each provider carried by the submit button's own name/value.
 * That keeps this a plain server action with no client JavaScript, so it still
 * works before hydration.
 *
 * Side by side and icon-led per the mockup (screen 7). The visible label is
 * the provider name alone; the full "Continue with GitHub" stays as the
 * accessible name so a screen reader still hears the verb.
 */
export function OAuthButtons({ redirectTo }: { redirectTo?: string }) {
  return (
    <form action={signInWithProviderAction} className="grid grid-cols-2 gap-3">
      {redirectTo ? <input type="hidden" name="redirectTo" value={redirectTo} /> : null}

      <Button
        type="submit"
        name="provider"
        value="github"
        variant="outline"
        aria-label="Continue with GitHub"
      >
        <IconBrandGithub aria-hidden />
        GitHub
      </Button>

      <Button
        type="submit"
        name="provider"
        value="google"
        variant="outline"
        aria-label="Continue with Google"
      >
        <IconBrandGoogle aria-hidden />
        Google
      </Button>
    </form>
  );
}
