import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";

import { AuthStatus } from "@/components/features/auth/AuthStatus";

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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
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
          </nav>
          <AuthStatus />
        </header>
        {children}
      </body>
    </html>
  );
}
