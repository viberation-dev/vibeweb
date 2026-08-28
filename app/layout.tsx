import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";

import { AuthStatus } from "@/components/features/auth/AuthStatus";
import { SearchInput } from "@/components/features/search/SearchInput";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Viberation",
  description:
    "The digital operating system for vibe coders — a curated AI tool library, role-aware guides, and a place to keep what works.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    /*
      The font variables go on <html>, not <body>: globals.css applies
      font-sans to <html>, and a custom property declared on <body> is not
      visible to its own parent. Declared on <body> they resolved to nothing
      and every page fell back to the browser default serif.
    */
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body
        className="flex min-h-screen flex-col antialiased"
        /*
         * Grammarly, ColorZilla and friends add their own attributes to
         * <body> before React hydrates, so React reports a mismatch that no
         * change to this app can fix. This suppresses that false alarm.
         *
         * It applies to this element only — one level deep, attributes and
         * text — so a real hydration bug anywhere inside still surfaces. Our
         * own body attribute is a static className, so there is nothing here
         * worth warning about anyway.
         */
        suppressHydrationWarning
      >
        <header className="flex items-center justify-between border-b px-6 py-3">
          <nav className="flex items-center gap-6">
            <Link href="/" className="font-semibold">
              Viberation
            </Link>
            <Link href="/tools" className="text-sm text-muted-foreground hover:text-foreground">
              Tools
            </Link>
            <Link href="/learn" className="text-sm text-muted-foreground hover:text-foreground">
              Learn
            </Link>
            <Link
              href="/collections"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Collections
            </Link>
            <Link href="/wizards" className="text-sm text-muted-foreground hover:text-foreground">
              Wizards
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            {/* §31 puts search in the top nav on every page, not just /search. */}
            <SearchInput compact className="hidden sm:flex" />
            <AuthStatus />
          </div>
        </header>
        <div className="flex-1">{children}</div>
        {/*
          Affiliate disclosure gets its own link rather than hiding inside
          "Terms" (VIB-57). /go/[slug] sends visitors to monetized destinations,
          and the FTC expects that relationship to be findable — a reader should
          not have to guess that it lives under a terms-of-service link.
        */}
        <footer className="border-t px-6 py-6">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span>&copy; {new Date().getFullYear()} Viberation</span>
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
            <Link href="/terms#affiliate-disclosure" className="hover:text-foreground">
              Affiliate disclosure
            </Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
