import Link from "next/link";
import { Suspense } from "react";

import { AuthStatus } from "@/components/features/auth/AuthStatus";
import { AppSidebar } from "@/components/features/nav/AppSidebar";
import { Logo } from "@/components/features/nav/Logo";
import { SiteHeader } from "@/components/features/nav/SiteHeader";
import { SearchInput } from "@/components/features/search/SearchInput";
import { createClient } from "@/lib/integrations/supabase/server";
import { TOP_NAV } from "@/lib/nav";
import { getCurrentProfile, type Profile } from "@/lib/queries/profiles";

/**
 * Up to two letters for the header avatar, from whatever identity exists.
 * Falls back to "?" rather than rendering an empty circle.
 */
function initialsFor(profile: Profile): string {
  const source = profile.username ?? profile.email ?? "";
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  const letters =
    parts.length > 1 ? parts[0][0] + parts[1][0] : source.slice(0, 2);
  return letters.toUpperCase() || "?";
}

/**
 * Two nav structures, not one (VIB-76, handoff §2).
 *
 * Visitors get a flat marketing top nav. Signed-in users get the app shell:
 * the same header minus the marketing links, plus the sidebar. The session
 * is read once here and handed to AuthStatus rather than fetched twice.
 *
 * Every route except the auth screens lives under this group. The group name
 * is in parentheses, so it adds nothing to any URL — /tools is still /tools.
 */
export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const profile = await getCurrentProfile(supabase);

  return (
    <>
        {/*
          Two headers for the two nav structures, per handoff §2. The app
          shell's is its own component because it needs a keyboard shortcut;
          the marketing one is four links and stays here.
        */}
        {profile ? (
          <SiteHeader initials={initialsFor(profile)} />
        ) : (
          <header className="flex items-center justify-between border-b px-6 py-3">
            <nav className="flex items-center gap-6">
              <Link
                href="/"
                aria-label="Viberation — home"
                className="shrink-0"
              >
                <Logo className="h-5" />
              </Link>
              {TOP_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground text-sm"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-4">
              {/* §31 puts search in the top nav on every page, not just /search. */}
              <SearchInput compact className="hidden sm:flex" />
              <AuthStatus profile={profile} />
            </div>
          </header>
        )}
        {profile ? (
          <div className="flex min-h-0 flex-1 flex-col md:flex-row">
            {/*
              AppSidebar reads the query string to mark the active category,
              and useSearchParams needs a Suspense boundary above it or the
              whole tree opts out of static rendering.
            */}
            <Suspense
              fallback={
                <div className="hidden w-56 shrink-0 border-r md:block" />
              }
            >
              <AppSidebar />
            </Suspense>
            <div className="min-w-0 flex-1">{children}</div>
          </div>
        ) : (
          <div className="flex-1">{children}</div>
        )}
        {/*
          Affiliate disclosure gets its own link rather than hiding inside
          "Terms" (VIB-57). /go/[slug] sends visitors to monetized destinations,
          and the FTC expects that relationship to be findable — a reader should
          not have to guess that it lives under a terms-of-service link.
        */}
        <footer className="border-t px-6 py-6">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Logo variant="mark" className="h-4" />
              &copy; {new Date().getFullYear()} Viberation
            </span>
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
            <Link
              href="/terms#affiliate-disclosure"
              className="hover:text-foreground"
            >
              Affiliate disclosure
            </Link>
          </div>
        </footer>
    </>
  );
}
