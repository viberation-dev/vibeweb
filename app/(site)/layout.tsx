import { IconArrowUpRight } from "@tabler/icons-react";
import Link from "next/link";
import { Suspense } from "react";

import { AppSidebar } from "@/components/features/nav/AppSidebar";
import { HamburgerMenu } from "@/components/features/nav/HamburgerMenu";
import { Logo } from "@/components/features/nav/Logo";
import { SiteHeader } from "@/components/features/nav/SiteHeader";
import { SocialRail } from "@/components/features/nav/SocialRail";
import { ThemeRail } from "@/components/features/nav/ThemeRail";
import { UtilityBar } from "@/components/features/nav/UtilityBar";
import { SearchInput } from "@/components/features/search/SearchInput";
import { ButtonIcon, buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/integrations/supabase/server";
import { TOP_NAV } from "@/lib/nav";
import { getCurrentProfile, type Profile } from "@/lib/queries/profiles";
import { countAffiliateTools } from "@/lib/queries/tools";

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
 * The visitor chrome is v3 (VIB-98): a utility bar above the header, a
 * circular burger, the centre nav, a pill CTA, and the two fixed rails. It
 * lives here rather than on the homepage because a site header that changes
 * between / and /tools reads as a bug — v3's header *is* the visitor header,
 * so every signed-out route gets it.
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

  /*
   * The footer's affiliate line is a claim about the site, so it is read from
   * the site rather than typed into the markup — see countAffiliateTools.
   */
  const affiliateCount = await countAffiliateTools(supabase);

  return (
    <>
      {profile ? (
        <SiteHeader initials={initialsFor(profile)} />
      ) : (
        <>
          <UtilityBar />
          <VisitorHeader />
        </>
      )}

      {profile ? (
        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          {/*
            AppSidebar reads the query string to mark the active category,
            and useSearchParams needs a Suspense boundary above it or the
            whole tree opts out of static rendering.
          */}
          <Suspense
            fallback={<div className="hidden w-56 shrink-0 border-r md:block" />}
          >
            <AppSidebar />
          </Suspense>
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      ) : (
        <>
          <ThemeRail />
          <SocialRail />
          <div className="flex-1">{children}</div>
        </>
      )}

      {profile ? (
        <AppFooter />
      ) : (
        <VisitorFooter hasAffiliateLinks={affiliateCount > 0} />
      )}
    </>
  );
}

/** v3's visitor header (VIB-98) — burger, wordmark, centre nav, pill CTA. */
function VisitorHeader() {
  return (
    <header className="bg-background sticky top-0 z-50 border-b">
      <div className="mx-auto flex max-w-7xl items-center gap-5 px-6 py-3.5">
        {/*
          The hamburger now shows at every width, matching demo5's pairing of
          `desktop-hamburger` and `mobile-hamburger` (both `-left`). It earns
          the desktop slot because the overlay carries more than the header
          nav does — Walkthroughs, contact, socials — so it is not a duplicate of
          the links already on screen.

          This replaces the <details> disclosure that shipped in VIB-98: a
          full-screen overlay needs focus trapping, Escape and an inert page
          behind it, which <dialog> does properly and <details> does not.
        */}
        <HamburgerMenu />

        {/* Wordmark at 26px — 30% up from the shipped 20px (VIB-101). */}
        <Link href="/" aria-label="Viberation — home" className="shrink-0">
          <Logo className="h-6.5" />
        </Link>

        {/*
          v3 draws chevrons on these, implying dropdowns. There are no
          dropdown menus in this app and no second level of nav to put in one,
          so the chevrons are left off rather than drawn as a promise the
          header does not keep.
        */}
        <nav
          aria-label="Primary"
          className="mx-auto hidden items-center gap-7 lg:flex"
        >
          {TOP_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:text-primary text-[0.9375rem] font-medium transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3 lg:ml-0">
          {/* §31 puts search in the top nav on every page, not just /search. */}
          <SearchInput compact className="hidden md:flex" />
          {/*
            No theme switch here. Its three labelled buttons pushed the header
            past the viewport at every width below 1280px. ThemeRail owns it
            from xl, and the hamburger overlay carries it below that.
          */}
          <Link
            href="/login"
            className="hover:text-primary hidden text-[0.9375rem] font-semibold whitespace-nowrap sm:block"
          >
            Sign in
          </Link>
          {/*
            Below 640px the burger and wordmark leave ~100px, so the pill
            collapses to its badge. The label stays for screen readers.
          */}
          <Link
            href="/signup"
            className={buttonVariants({
              variant: "pill",
              size: "pill-sm",
              className: "max-sm:pr-1.5",
            })}
          >
            <ButtonIcon size="sm">
              <IconArrowUpRight />
            </ButtonIcon>
            <span className="max-sm:sr-only">Get started</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

/**
 * Affiliate disclosure gets its own link rather than hiding inside "Terms"
 * (VIB-57). /go/[slug] sends visitors to monetized destinations, and the FTC
 * expects that relationship to be findable — a reader should not have to
 * guess that it lives under a terms-of-service link.
 */
const FOOTER_COLUMNS = [
  {
    heading: "Product",
    links: [
      { label: "Directory", href: "/tools" },
      { label: "Learn hub", href: "/learn" },
      { label: "Collections", href: "/collections" },
      { label: "Walkthroughs", href: "/walkthroughs" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Affiliate disclosure", href: "/terms#affiliate-disclosure" },
    ],
  },
] as const;

/** v3's visitor footer (VIB-98). */
function VisitorFooter({ hasAffiliateLinks }: { hasAffiliateLinks: boolean }) {
  return (
    <footer className="mt-20 border-t">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr]">
          <div>
            <Logo className="h-5" />
            <p className="text-muted-foreground mt-4 max-w-[34ch] text-sm">
              Tools and learning for the next generation of AI builders.
              Independent, solo-run, and honest about affiliate links.
            </p>
          </div>
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.heading}>
              <h2 className="text-muted-foreground mb-3 text-xs font-bold tracking-widest uppercase">
                {column.heading}
              </h2>
              {column.links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-muted-foreground hover:text-primary block py-1 text-sm"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        <div className="text-muted-foreground mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 border-t pt-6 text-sm">
          <span>&copy; {new Date().getFullYear()} Viberation</span>
          {/*
            Only claimed when it is true. No tool carries an affiliate link
            today (VIB-100): the programmes require a live site with content
            before they approve an application, so this line would have been
            asserting something untrue on every page.
          */}
          {hasAffiliateLinks ? (
            <span>Some links are affiliate links</span>
          ) : null}
          {/*
            SocialRail is hidden below 1280px, so the same links need a home
            that is always reachable.
          */}
          <span className="flex items-center gap-4 xl:hidden">
            <a
              href="https://x.com/viberation"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary"
            >
              X
            </a>
            <a
              href="https://github.com/viberation-dev"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary"
            >
              GitHub
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}

/** The signed-in shell keeps the compact footer — v3 is visitor chrome. */
function AppFooter() {
  return (
    <footer className="border-t px-6 py-6">
      <div className="text-muted-foreground flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
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
  );
}
