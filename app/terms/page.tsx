import type { Metadata } from "next";
import Link from "next/link";

import { LEGAL_CONTACT_EMAIL, LEGAL_LAST_UPDATED } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Terms & affiliate disclosure — Viberation",
  description:
    "Terms of use for Viberation, including how affiliate links work and what they do not affect.",
};

/**
 * DRAFT — needs Ali's review before launch (VIB-57).
 *
 * The affiliate disclosure is the load-bearing part: VIB-52 shipped
 * /go/[slug], so monetized outbound links exist today. rel="sponsored" on the
 * CTA is the machine-readable half; this is the half a person can read.
 *
 * Two placeholders must be filled before this ships — the contact address in
 * lib/legal.ts, and the governing law below. Both are business facts, not
 * engineering ones, and inventing either would be worse than leaving it
 * obviously blank.
 */
export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl space-y-8 p-6 pb-16">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Terms &amp; affiliate disclosure</h1>
        <p className="text-sm text-muted-foreground">
          Last updated {LEGAL_LAST_UPDATED}
        </p>
      </header>

      <section className="space-y-3">
        <p className="text-muted-foreground">
          Viberation is a free, curated directory of AI tools and guides for people
          learning to build with them. By using the site you agree to what is set out
          here.
        </p>
      </section>

      {/* The FTC disclosure. Linked directly from the footer, hence the id. */}
      <section id="affiliate-disclosure" className="space-y-3 scroll-mt-6 rounded-lg border p-5">
        <h2 className="text-xl font-semibold">Affiliate disclosure</h2>
        <p className="text-muted-foreground">
          <strong className="text-foreground">
            Some links out of Viberation are affiliate links.
          </strong>{" "}
          If you follow one and go on to sign up or buy something, we may earn a
          commission from that company. It never costs you anything extra, and the price
          you pay is the same as it would be if you went there directly.
        </p>
        <p className="text-muted-foreground">
          <strong className="text-foreground">
            A commission never buys a place on this site.
          </strong>{" "}
          It does not affect whether a tool is listed, how it is described, where it
          appears in a list, or whether we recommend it. Plenty of tools we link to pay us
          nothing. We list tools because they are worth knowing about — that is the entire
          product, and selling it would make the directory worthless.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Your account</h2>
        <p className="text-muted-foreground">
          You are responsible for what happens under your account, so keep your sign-in
          details to yourself. Give us accurate information when you register, do not
          impersonate anyone, and do not pick a username designed to look like someone
          else.
        </p>
        <p className="text-muted-foreground">
          We may suspend or remove an account that is being used to abuse the site or
          other people.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Using the site</h2>
        <p className="text-muted-foreground">
          Read it, save things to it, share links to it. Do not try to break into it,
          scrape it wholesale, overload it, or use it to distribute malware or anything
          unlawful.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">What belongs to whom</h2>
        <p className="text-muted-foreground">
          The writing, curation and design on Viberation belong to us. The tools we list
          belong to the people who made them — their names, logos and trademarks are
          theirs, and listing a tool does not mean it is affiliated with us or endorses
          us.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">No warranty</h2>
        <p className="text-muted-foreground">
          Viberation is provided as-is. We try to keep listings accurate and current, but
          the AI tool landscape moves fast: prices change, features change, and products
          get discontinued. Check anything that matters against the tool&rsquo;s own site
          before relying on it. Nothing here is professional advice, and we are not
          responsible for what a third-party tool does, charges, or fails to do — your
          relationship with that company is between you and them.
        </p>
        <p className="text-muted-foreground">
          To the extent the law allows, we are not liable for losses arising from your use
          of the site.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Privacy</h2>
        <p className="text-muted-foreground">
          What we store, and what we deliberately do not, is set out in our{" "}
          <Link className="underline underline-offset-4" href="/privacy">
            privacy policy
          </Link>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Changes</h2>
        <p className="text-muted-foreground">
          We may update these terms. The date at the top of this page tells you when they
          last changed, and continuing to use the site means the current version applies.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Contact</h2>
        <p className="text-muted-foreground">
          Questions about these terms:{" "}
          <a className="underline underline-offset-4" href={`mailto:${LEGAL_CONTACT_EMAIL}`}>
            {LEGAL_CONTACT_EMAIL}
          </a>
          .
        </p>
        {/* TODO(ali): governing law / jurisdiction — a business fact, left blank on purpose. */}
      </section>
    </main>
  );
}
