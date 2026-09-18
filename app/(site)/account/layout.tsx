import { redirect } from "next/navigation";

import { AccountTabs } from "@/components/features/account/AccountTabs";
import { Avatar } from "@/components/features/profile/Avatar";
import { Panel } from "@/components/ui/panel";
import { TagPill } from "@/components/ui/tag-pill";
import { createClient } from "@/lib/integrations/supabase/server";
import { avatarUrl } from "@/lib/queries/avatars";
import { getOnboardingAnswers } from "@/lib/queries/onboarding-answers";
import { getCurrentProfile } from "@/lib/queries/profiles";

/**
 * The /account shell (VIB-69, restyled to the v3 system under VIB-126).
 *
 * The identity block and tab strip live here so all four tabs share one
 * header rather than each repeating it. The shell used to be a single
 * bordered box with the tabs as an underlined strip inside it; now the
 * header is a soft panel, the tabs are a segmented pill beneath it, and each
 * tab supplies its own panels. That is the same arrangement the marketing
 * pages use: surfaces stacked on the page ground, no outlines.
 *
 * **This is still not a gate.** Every page underneath keeps its own session
 * check — middleware handles the signed-out half at the edge, and a layout
 * that redirects is not a substitute for either. The redirect below exists
 * only so the header has a profile to render; removing it would not open
 * anything up.
 *
 * getCurrentProfile is cache()d, so this shares one revalidation with the
 * root layout and the page rather than adding a third round trip.
 */
export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const profile = await getCurrentProfile(supabase);

  if (!profile) {
    redirect("/login?redirectTo=/account");
  }

  // Display name first: it is private, and this header only its owner sees.
  const answers = await getOnboardingAnswers(supabase, profile.id);
  const name =
    answers?.display_name ??
    profile.username ??
    profile.email ??
    "Your account";

  return (
    <div className="mx-auto w-full max-w-4xl px-[clamp(1.25rem,4vw,2.5rem)] py-10">
      <Panel className="flex flex-wrap items-center gap-5">
        <Avatar
          name={name}
          src={avatarUrl(supabase, profile.avatar_path)}
          className="font-heading size-16 text-xl font-bold"
        />
        <div className="min-w-0">
          <h1 className="font-heading truncate text-3xl font-bold tracking-[-0.04em]">
            {name}
          </h1>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            {/*
              Both read straight off `profiles`. Plan is `free` or `pro` and
              capitalised for display only — the stored value is the enum,
              not this string.
            */}
            <TagPill>{profile.plan} plan</TagPill>
            <TagPill>{profile.role_level}</TagPill>
          </div>
        </div>
      </Panel>

      <div className="mt-6">
        <AccountTabs />
      </div>

      <div className="mt-6">{children}</div>
    </div>
  );
}
