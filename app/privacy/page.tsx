import type { Metadata } from "next";
import Link from "next/link";

import { LEGAL_CONTACT_EMAIL, LEGAL_LAST_UPDATED } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Privacy policy — Viberation",
  description:
    "What Viberation collects, why, who else touches it, and the rights you have over it.",
};

/**
 * Standard privacy-policy structure, filled with this app's real behaviour
 * rather than template text (VIB-57).
 *
 * The structure is conventional — collection, use, cookies, sharing,
 * retention, security, transfers, rights, children, changes, contact —
 * because a reader looking for a particular section should find it where they
 * expect it. The *content* of each section was checked against the code:
 *
 *   - stored fields    → migrations 02, 04, 05 (profiles, bookmarks,
 *                        history_items, wizard_progress)
 *   - anonymous clicks → migration 13; tool_clicks is (tool_id, clicked_at),
 *                        no user_id and no request metadata
 *   - history cap      → migration 05's prune trigger
 *   - no analytics     → package.json carries no analytics, error-reporting
 *                        or advertising dependency at all
 *   - sign-in options  → lib/integrations/supabase/auth.ts
 *
 * If any of those change, this page changes with them. The "no third-party
 * analytics" claim in particular becomes false the day anyone adds Vercel
 * Analytics or Sentry.
 */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-3xl space-y-8 p-6 pb-16">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Privacy policy</h1>
        <p className="text-sm text-muted-foreground">Last updated {LEGAL_LAST_UPDATED}</p>
      </header>

      <p className="text-muted-foreground">
        Viberation is a curated directory of AI tools and guides for people learning to
        build with them. This policy explains what we collect, why we collect it, who else
        handles it, and what you can ask us to do with it. You can browse the entire site
        without an account; most of what follows applies only once you create one.
      </p>

      <Section title="1. Information we collect">
        <p className="text-muted-foreground">
          <strong className="text-foreground">Information you give us.</strong> When you
          create an account we store your email address and the username you choose. If you
          sign in with GitHub or Google instead of a password, that provider confirms your
          identity and gives us your email address — we never receive your password and
          cannot act on your account there.
        </p>
        <p className="text-muted-foreground">
          <strong className="text-foreground">Your preferences.</strong> Your experience
          level, how dense you like listings to be, and whether you have completed
          onboarding.
        </p>
        <p className="text-muted-foreground">
          <strong className="text-foreground">Things you save and do.</strong> Bookmarks
          (what you saved, the folder you filed it under, and when), recently viewed items
          (what you opened and when), and your progress through a wizard (which step you
          reached and which boxes you ticked).
        </p>
        <p className="text-muted-foreground">
          <strong className="text-foreground">Outbound clicks.</strong> When you click
          through to a tool&rsquo;s website we record that a click happened — which tool,
          and when. Nothing else. That record contains no user identifier, no IP address
          and no device information, and it is not linked to your account whether you are
          signed in or not.
        </p>
        <p className="text-muted-foreground">
          <strong className="text-foreground">Server logs.</strong> Our host produces
          ordinary web-server logs, which include IP addresses and browser user agents.
          See section 4.
        </p>
      </Section>

      <Section title="2. How we use it">
        <p className="text-muted-foreground">
          To give you an account and keep you signed in; to show you your own bookmarks,
          history and wizard progress; to tailor which guides we surface to the experience
          level you selected; to understand in aggregate which tools people find useful;
          and to keep the site running, secure and free of abuse.
        </p>
        <p className="text-muted-foreground">
          We do not use your information to build an advertising profile, and we do not
          make automated decisions about you that produce legal or similarly significant
          effects.
        </p>
      </Section>

      <Section title="3. Cookies and tracking">
        <p className="text-muted-foreground">
          <strong className="text-foreground">
            There is no third-party analytics or advertising technology on this site.
          </strong>{" "}
          No Google Analytics, no advertising or retargeting pixels, no session recording,
          no cross-site tracking.
        </p>
        <p className="text-muted-foreground">
          The only cookies we set are the ones our authentication provider needs to keep
          you signed in and to keep that session secure. They are strictly necessary for
          the site to work, which is why you are not asked to consent to them. Signing out
          clears them.
        </p>
      </Section>

      <Section title="4. Who else handles your information">
        <p className="text-muted-foreground">
          We do not sell your personal information, and we do not share it for advertising.
          We use two service providers, each acting on our instructions:
        </p>
        <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
          <li>
            <strong className="text-foreground">Supabase</strong> — hosts our database and
            handles sign-in and account security.
          </li>
          <li>
            <strong className="text-foreground">Vercel</strong> — hosts and serves the
            site. Like any web host, Vercel processes request logs, including IP addresses,
            in order to deliver pages and protect the service against abuse. We do not
            store IP addresses in our own database.
          </li>
        </ul>
        <p className="text-muted-foreground">
          If you sign in with GitHub or Google, that provider necessarily learns that you
          signed in to Viberation. Their handling of that is governed by their own privacy
          policy.
        </p>
        <p className="text-muted-foreground">
          We may also disclose information where we are legally required to, where it is
          necessary to establish or defend a legal claim, or to protect the safety of our
          users.
        </p>
      </Section>

      <Section title="5. How long we keep it">
        <p className="text-muted-foreground">
          Your profile, bookmarks and wizard progress are kept until you delete them or
          close your account. Your recently-viewed list is capped automatically — older
          entries are removed as new ones arrive, rather than accumulating indefinitely.
          Anonymous click records are kept as aggregate statistics; because they identify
          nobody, they are not removed when an account is deleted.
        </p>
      </Section>

      <Section title="6. Security">
        <p className="text-muted-foreground">
          Traffic to the site is encrypted in transit. Access to your personal records is
          enforced in the database itself rather than only in application code, so
          bookmarks, history and wizard progress are readable only by the account that owns
          them. Passwords are handled by our authentication provider and are never stored
          by us in a readable form.
        </p>
        <p className="text-muted-foreground">
          No service can promise perfect security, and we do not. If a breach affects your
          information we will notify you and any relevant regulator as required by law.
        </p>
      </Section>

      <Section title="7. International transfers">
        <p className="text-muted-foreground">
          Our providers operate globally, so your information may be stored or processed in
          a country other than the one you live in, including the United States. Where the
          law requires a safeguard for such transfers, we rely on our providers&rsquo;
          standard contractual protections.
        </p>
      </Section>

      <Section title="8. Your rights">
        <p className="text-muted-foreground">
          You can access and correct most of your information yourself: your username and
          preferences on your profile page, and your bookmarks wherever they appear.
        </p>
        <p className="text-muted-foreground">
          Depending on where you live, you may also have the right to obtain a copy of your
          information, have it corrected or deleted, object to or restrict how we use it,
          ask for it in a portable format, or withdraw consent. Residents of California and
          other US states with comparable laws have the right not to be treated differently
          for exercising these rights — and note that we do not sell or share personal
          information for cross-context behavioural advertising, so there is nothing to opt
          out of.
        </p>
        <p className="text-muted-foreground">
          There is currently no self-service delete button. To request a copy of your data,
          or to delete your account and everything attached to it, email{" "}
          <a className="underline underline-offset-4" href={`mailto:${LEGAL_CONTACT_EMAIL}`}>
            {LEGAL_CONTACT_EMAIL}
          </a>
          . Deletion removes your profile, bookmarks, history and wizard progress. We will
          respond without undue delay, and within any period your local law requires.
        </p>
      </Section>

      <Section title="9. Children">
        <p className="text-muted-foreground">
          Viberation is not directed at children under 13, and we do not knowingly collect
          information from them. If you believe a child has given us information, contact us
          and we will delete it.
        </p>
      </Section>

      <Section title="10. Links to other sites">
        <p className="text-muted-foreground">
          The directory links out to third-party tools, and some of those links are
          affiliate links — see our{" "}
          <Link className="underline underline-offset-4" href="/terms#affiliate-disclosure">
            affiliate disclosure
          </Link>
          . Once you leave Viberation you are on someone else&rsquo;s site, under their
          privacy policy rather than ours.
        </p>
      </Section>

      <Section title="11. Changes to this policy">
        <p className="text-muted-foreground">
          If this policy changes we will update the date at the top of this page. If the
          change is significant we will make it more obvious than that.
        </p>
      </Section>

      <Section title="12. Contact">
        <p className="text-muted-foreground">
          Questions, requests, or complaints about privacy:{" "}
          <a className="underline underline-offset-4" href={`mailto:${LEGAL_CONTACT_EMAIL}`}>
            {LEGAL_CONTACT_EMAIL}
          </a>
          .
        </p>
      </Section>
    </main>
  );
}
