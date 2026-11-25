"use client";

import { Suspense, useEffect, useState } from "react";

import { AppSidebar } from "@/components/features/nav/AppSidebar";
import { SiteHeader } from "@/components/features/nav/SiteHeader";
import { isSuperAdmin } from "@/lib/app-role";
import { createClient } from "@/lib/integrations/supabase/client";
import {
  SIDEBAR_CLOSED_COOKIE,
  SIDEBAR_MODE_COOKIE,
  toSidebarMode,
  type SidebarMode,
} from "@/lib/nav";
import { avatarUrl } from "@/lib/queries/avatars";
import { getOnboardingAnswers } from "@/lib/queries/onboarding-answers";
import { getProfile } from "@/lib/queries/profiles";

type Member = {
  name: string;
  avatarSrc: string | null;
  isStaff: boolean;
  sidebarMode: SidebarMode;
  sidebarClosed: string[];
};

function readCookie(name: string): string | undefined {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

/**
 * Picks the visitor or member shell in the browser, so the site layout can be
 * static and cached (VIB perf, 2026-11-25). Reading the session on the server
 * made every page under (site) render per request, which is what used up
 * Vercel's Hobby CPU allowance in October.
 *
 * The server always renders the visitor shell. For a member, the pre-paint
 * script in app/layout.tsx sets `data-member` on <html> when an auth cookie
 * exists, and globals.css hides `[data-visitor-chrome]` under it, so members
 * never see the visitor header flash before this swaps the shell in.
 *
 * The child slot stays at the same position in both shells, so switching
 * does not remount the page.
 */
export function SiteChrome({
  children,
  visitorHeader,
  visitorRails,
  socialRail,
  visitorFooter,
  appFooter,
  newWalkthrough,
}: {
  children: React.ReactNode;
  visitorHeader: React.ReactNode;
  visitorRails: React.ReactNode;
  socialRail: React.ReactNode;
  visitorFooter: React.ReactNode;
  appFooter: React.ReactNode;
  newWalkthrough: boolean;
}) {
  const [member, setMember] = useState<Member | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let live = true;

    async function load(userId: string | undefined, email: string | undefined) {
      if (!userId) {
        if (live) setMember(null);
        document.documentElement.removeAttribute("data-member");
        return;
      }
      const [profile, answers] = await Promise.all([
        getProfile(supabase, userId).catch(() => null),
        getOnboardingAnswers(supabase, userId).catch(() => null),
      ]);
      if (!live) return;
      setMember({
        name: answers?.display_name ?? profile?.username ?? email ?? "?",
        avatarSrc: avatarUrl(supabase, profile?.avatar_path ?? null),
        isStaff: profile ? isSuperAdmin(profile.app_role) : false,
        sidebarMode: toSidebarMode(readCookie(SIDEBAR_MODE_COOKIE)),
        sidebarClosed:
          readCookie(SIDEBAR_CLOSED_COOKIE)?.split(",").filter(Boolean) ?? [],
      });
      document.documentElement.setAttribute("data-member", "");
    }

    // Fires INITIAL_SESSION straight away, then on every sign-in and sign-out.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // Querying inside the callback can deadlock supabase-js; defer it.
      setTimeout(() => void load(session?.user.id, session?.user.email), 0);
    });

    return () => {
      live = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <>
      {member ? (
        <SiteHeader name={member.name} avatarSrc={member.avatarSrc} />
      ) : (
        <div data-visitor-chrome className="contents">
          {visitorHeader}
        </div>
      )}

      <div
        className={
          member ? "flex min-h-0 flex-1 flex-col md:flex-row" : "flex-1"
        }
      >
        {member ? (
          /*
            AppSidebar reads the query string to mark the active category,
            and useSearchParams needs a Suspense boundary above it.
          */
          <Suspense
            fallback={
              <div
                className={`hidden shrink-0 border-r md:block ${member.sidebarMode === "expanded" ? "w-56" : "w-14"}`}
              />
            }
          >
            <AppSidebar
              showRoadmap={member.isStaff}
              initialMode={member.sidebarMode}
              initialClosed={member.sidebarClosed}
              newHrefs={newWalkthrough ? ["/walkthroughs"] : []}
            />
          </Suspense>
        ) : (
          <div data-visitor-chrome className="contents">
            {visitorRails}
          </div>
        )}
        <div className={member ? "min-w-0 flex-1" : undefined}>{children}</div>
        {socialRail}
      </div>

      {member ? (
        appFooter
      ) : (
        <div data-visitor-chrome className="contents">
          {visitorFooter}
        </div>
      )}
    </>
  );
}
