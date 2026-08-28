import type { Metadata } from "next";

import { LEGAL_CONTACT_EMAIL, LEGAL_LAST_UPDATED } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Privacy — Viberation",
  description: "What Viberation stores about you, and what it does not.",
};

/**
 * DRAFT — needs Ali's review before launch (VIB-57).
 *
 * Every factual claim below was checked against the code and schema rather
 * than written from a template, because a privacy policy that describes a
 * different product than the one shipped is worse than none:
 *
 *   - stored fields      → migrations 02 and 05 (profiles, bookmarks,
 *                          history_items, wizard_progress)
 *   - anonymous clicks   → migration 13, tool_clicks is (tool_id, clicked_at)
 *                          only, no user_id and no request metadata
 *   - no analytics       → package.json has no analytics, error-reporting or
 *                          advertising dependency of any kind
 *   - sign-in options    → lib/integrations/supabase/auth.ts (password,
 *                          GitHub, Google)
 *
 * If any of those change, this page is part of the change.
 */
export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-3xl space-y-8 p-6 pb-16">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Privacy</h1>
        <p className="text-sm text-muted-foreground">
          Last updated {LEGAL_LAST_UPDATED}
        </p>
      </header>

      <section className="space-y-3">
        <p className="text-muted-foreground">
          Viberation is a curated directory of AI tools and guides. You can browse all of
          it without an account. This page explains what we store when you do make one,
          and what we deliberately do not.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">What we store</h2>
        <p className="text-muted-foreground">
          <strong className="text-foreground">Your account.</strong> Sign-in is handled by
          Supabase Auth. You can use an email address and password, or sign in with GitHub
          or Google. We store your email address, the username you choose, and your
          preferences — your experience level and how dense you like listings to be.
        </p>
        <p className="text-muted-foreground">
          <strong className="text-foreground">Your bookmarks.</strong> Which tools and
          guides you saved, the folder name you filed them under, and when you saved them.
        </p>
        <p className="text-muted-foreground">
          <strong className="text-foreground">Your recently viewed.</strong> Which tools
          and guides you opened and when, so the site can show you your own history. It is
          capped automatically — old entries fall off rather than accumulating forever.
        </p>
        <p className="text-muted-foreground">
          <strong className="text-foreground">Your wizard progress.</strong> Which step
          you reached in a walkthrough and which boxes you ticked.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">What we do not do</h2>
        <p className="text-muted-foreground">
          There is no third-party analytics on this site. No Google Analytics, no
          advertising trackers, no session recording, no cross-site profiling. The only
          cookies we set are the ones Supabase needs to keep you signed in.
        </p>
        <p className="text-muted-foreground">
          When you click through to a tool&rsquo;s website we record that the click
          happened — the tool and the time, nothing else. That record is not linked to
          your account, and it is not linked to you when you are signed out either. It
          exists so we can tell which tools people find useful.
        </p>
        <p className="text-muted-foreground">
          We do not sell your data, and we do not share it with anyone for advertising.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Who else touches it</h2>
        <p className="text-muted-foreground">
          Two providers, both acting on our behalf:{" "}
          <strong className="text-foreground">Supabase</strong>, which hosts the database
          and handles sign-in, and <strong className="text-foreground">Vercel</strong>,
          which hosts the site. Like any web host, Vercel processes ordinary request logs
          — including IP addresses — as part of serving and protecting the site. We do not
          store IP addresses in our own database.
        </p>
        <p className="text-muted-foreground">
          If you sign in with GitHub or Google, that provider tells us your email address
          and confirms who you are. We do not receive your password, and we cannot act on
          your account there.
        </p>
        <p className="text-muted-foreground">
          These providers may process data outside the country you are in.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Your data is yours</h2>
        <p className="text-muted-foreground">
          You can change your username and preferences at any time on your profile page,
          and remove bookmarks yourself. To get a copy of your data, or to delete your
          account and everything attached to it, email{" "}
          <a className="underline underline-offset-4" href={`mailto:${LEGAL_CONTACT_EMAIL}`}>
            {LEGAL_CONTACT_EMAIL}
          </a>
          . Deleting your account removes your profile, bookmarks, history and wizard
          progress.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Children</h2>
        <p className="text-muted-foreground">
          Viberation is not directed at children under 13, and we do not knowingly collect
          their information.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Changes</h2>
        <p className="text-muted-foreground">
          If this policy changes we will update the date at the top of this page.
        </p>
      </section>
    </main>
  );
}
