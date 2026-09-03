import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";

import { THEME_INIT_SCRIPT } from "@/lib/theme";

import "./globals.css";

// Blue/Lime pairs Geist for display (headings) with Inter for body text —
// Viberation Design System readme "Type" / Bible §24.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Viberation",
  description:
    "The digital operating system for vibe coders — a curated AI tool library, role-aware guides, and a place to keep what works.",
};

/**
 * Document shell only — <html>, fonts, the pre-paint theme script.
 *
 * The site chrome (header, sidebar, footer) lives in `(site)/layout.tsx`
 * instead, because the auth screens must not have it: handoff §4 gives
 * /signup, /login and /forgot-password logo-only chrome. Route groups are
 * how Next.js expresses "these routes have different chrome" without
 * changing a single URL.
 */
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
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable}`}
      /*
        The inline script below sets a class and colorScheme on this element
        before React hydrates, so the server-rendered markup and the DOM
        differ by design. Without this, every dark-mode visitor gets a
        hydration warning about the thing that prevents their white flash.
      */
      suppressHydrationWarning
    >
      <head>
        {/*
          Runs before first paint (VIB-73). An effect would run after, which
          is a white flash on every navigation for anyone in dark mode.
        */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
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
        {children}
      </body>
    </html>
  );
}
