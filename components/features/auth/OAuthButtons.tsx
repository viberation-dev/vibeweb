import { signInWithProviderAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";

/**
 * Provider sign-in.
 *
 * One form, with each provider carried by the submit button's own name/value.
 * That keeps this a plain server action with no client JavaScript, so it still
 * works before hydration.
 */
export function OAuthButtons({ redirectTo }: { redirectTo?: string }) {
  return (
    <form action={signInWithProviderAction} className="space-y-2">
      {redirectTo ? <input type="hidden" name="redirectTo" value={redirectTo} /> : null}

      <Button
        type="submit"
        name="provider"
        value="github"
        variant="outline"
        className="w-full"
      >
        Continue with GitHub
      </Button>

      <Button
        type="submit"
        name="provider"
        value="google"
        variant="outline"
        className="w-full"
      >
        Continue with Google
      </Button>
    </form>
  );
}
