import type { Metadata } from "next";
import Link from "next/link";

import { LEGAL_CONTACT_EMAIL, LEGAL_LAST_UPDATED } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Terms of use — Viberation",
  description:
    "Terms of use for Viberation, including how affiliate links work and what they do not affect.",
};

/**
 * Standard terms-of-use structure, written for what this site actually is: a
 * free directory that links out, with no payments, no user-published content
 * and no subscription (VIB-57).
 *
 * The affiliate disclosure is the load-bearing section. VIB-52 shipped
 * /go/[slug], so monetized outbound links are possible today; the tool page
 * carries both rel="sponsored" and a visible line next to the link when a
 * tool is flagged, and this is the full explanation both point at.
 *
 * Governing law is Pakistan, where the business is currently established
 * (confirmed by Ali, 2026-08-29). If it moves to Canada, section 12 and the
 * last-updated date in lib/legal.ts both change — the clause names a country,
 * not a placeholder, so this is a real edit rather than a find-and-replace.
 */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl space-y-8 p-6 pb-16">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Terms of use</h1>
        <p className="text-sm text-muted-foreground">Last updated {LEGAL_LAST_UPDATED}</p>
      </header>

      <p className="text-muted-foreground">
        These terms govern your use of Viberation, a free curated directory of AI tools and
        guides. By using the site you agree to them. If you do not agree, please do not use
        the site.
      </p>

      {/* Linked directly from the footer and from every affiliate tool page, hence the id. */}
      <section
        id="affiliate-disclosure"
        className="scroll-mt-6 space-y-3 rounded-lg border p-5"
      >
        <h2 className="text-xl font-semibold">1. Affiliate disclosure</h2>
        <p className="text-muted-foreground">
          <strong className="text-foreground">
            Some links out of Viberation are affiliate links.
          </strong>{" "}
          If you follow one and then sign up or buy something, we may earn a commission
          from that company. It never costs you anything extra — the price you pay is the
          same as it would be if you went there directly.
        </p>
        <p className="text-muted-foreground">
          <strong className="text-foreground">
            A commission never buys a place on this site.
          </strong>{" "}
          It does not affect whether a tool is listed, how it is described, where it
          appears in a list, or whether we recommend it. Many of the tools we link to pay
          us nothing. We list tools because they are worth knowing about — that judgement
          is the entire product, and selling it would make the directory worthless.
        </p>
        <p className="text-muted-foreground">
          Where a link is an affiliate link, we say so on the tool&rsquo;s page next to the
          link itself, as well as here.
        </p>
      </section>

      <Section title="2. Eligibility">
        <p className="text-muted-foreground">
          You must be at least 13 years old to create an account. If you are under the age
          of majority where you live, you may use Viberation only with the involvement of a
          parent or guardian.
        </p>
      </Section>

      <Section title="3. Your account">
        <p className="text-muted-foreground">
          You are responsible for everything that happens under your account, so keep your
          sign-in details to yourself. Give accurate information when you register, do not
          impersonate anyone, and do not choose a username intended to look like someone
          else. Tell us promptly if you believe your account has been used without your
          permission.
        </p>
        <p className="text-muted-foreground">
          You may close your account at any time — see the{" "}
          <Link className="underline underline-offset-4" href="/privacy">
            privacy policy
          </Link>{" "}
          for how.
        </p>
      </Section>

      <Section title="4. Acceptable use">
        <p className="text-muted-foreground">
          Read the site, save things to it, and share links to it. You agree not to: attempt
          to gain unauthorised access to the site, other accounts, or our infrastructure;
          scrape or copy the directory wholesale; interfere with or place unreasonable load
          on the service; use the site to distribute malware or unlawful material; or use
          it in breach of any applicable law.
        </p>
      </Section>

      <Section title="5. Intellectual property">
        <p className="text-muted-foreground">
          The writing, curation, arrangement and design of Viberation belong to us and are
          protected by copyright. You may link to the site and quote short extracts with
          attribution; you may not republish substantial parts of it as your own.
        </p>
        <p className="text-muted-foreground">
          The tools we list belong to the people who made them. Their names, logos and
          trademarks are theirs, used here to identify their products. Listing a tool does
          not mean it is affiliated with us or endorses us.
        </p>
      </Section>

      <Section title="6. Third-party tools and links">
        <p className="text-muted-foreground">
          Viberation is a directory: its purpose is to send you to other people&rsquo;s
          products. We do not control those products, their pricing, their terms, their
          privacy practices, or their availability, and we are not responsible for them.
          Your relationship with a tool you sign up for is between you and that company.
        </p>
      </Section>

      <Section title="7. Availability and changes to the site">
        <p className="text-muted-foreground">
          Viberation is free, and we may change, suspend or discontinue any part of it at
          any time. We may add, edit or remove listings and guides as the landscape changes
          — that is what a curated directory is.
        </p>
      </Section>

      <Section title="8. Disclaimers">
        <p className="text-muted-foreground">
          The site is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;, without
          warranties of any kind, whether express or implied, including implied warranties
          of merchantability, fitness for a particular purpose, and non-infringement, to the
          fullest extent permitted by law.
        </p>
        <p className="text-muted-foreground">
          We try to keep listings accurate and current, but the AI tool landscape moves
          quickly: prices change, features change, and products are discontinued. Verify
          anything that matters against the tool&rsquo;s own site before relying on it.
          Nothing on Viberation is professional, legal or financial advice.
        </p>
      </Section>

      <Section title="9. Limitation of liability">
        <p className="text-muted-foreground">
          To the fullest extent permitted by law, we are not liable for any indirect,
          incidental, special, consequential or punitive damages, or for any loss of
          profits, data, or goodwill, arising from your use of the site or of any tool you
          reached through it. Some jurisdictions do not allow these exclusions, in which
          case they apply to you only as far as the law permits.
        </p>
      </Section>

      <Section title="10. Indemnity">
        <p className="text-muted-foreground">
          You agree to indemnify us against claims and costs arising from your misuse of
          the site or your breach of these terms.
        </p>
      </Section>

      <Section title="11. Suspension and termination">
        <p className="text-muted-foreground">
          We may suspend or remove an account that is being used to abuse the site, to harm
          other people, or in breach of these terms. You may stop using Viberation at any
          time.
        </p>
      </Section>

      <Section title="12. Governing law">
        <p className="text-muted-foreground">
          These terms are governed by the laws of Pakistan, and the courts of Pakistan
          have jurisdiction over any dispute arising out of them or your use of
          Viberation.
        </p>
        <p className="text-muted-foreground">
          Viberation is available worldwide, and if you use it from somewhere else you
          are responsible for complying with your own local laws. Nothing in these terms
          removes consumer-protection rights you have where you live that cannot be
          given up by agreement.
        </p>
      </Section>

      <Section title="13. Changes to these terms">
        <p className="text-muted-foreground">
          We may update these terms. The date at the top of this page shows when they last
          changed, and continuing to use the site means the current version applies to you.
        </p>
      </Section>

      <Section title="14. Contact">
        <p className="text-muted-foreground">
          Questions about these terms:{" "}
          <a className="underline underline-offset-4" href={`mailto:${LEGAL_CONTACT_EMAIL}`}>
            {LEGAL_CONTACT_EMAIL}
          </a>
          .
        </p>
      </Section>
    </main>
  );
}
