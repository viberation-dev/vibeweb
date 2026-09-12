import {
  IconBookmark,
  IconClockHour4,
  IconSettings,
} from "@tabler/icons-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ButtonIcon, buttonVariants } from "@/components/ui/button";
import { IconTile } from "@/components/ui/icon-tile";
import { Panel } from "@/components/ui/panel";
import { createClient } from "@/lib/integrations/supabase/server";
import { getCurrentProfile } from "@/lib/queries/profiles";

export const metadata: Metadata = { title: "Your account" };

const ROLE_LEVELS = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  expert: "Expert",
} as const;

const LAYOUT_MODES = {
  essentials: "Essentials",
  advanced: "Advanced",
} as const;

/** Where the other tabs live, so the overview is a way in and not a dead end. */
const SHORTCUTS = [
  {
    href: "/account/bookmarks",
    icon: IconBookmark,
    title: "Bookmarks",
    blurb: "Everything you have saved, in folders you named.",
  },
  {
    href: "/account/history",
    icon: IconClockHour4,
    title: "History",
    blurb: "What you have opened recently, newest first.",
  },
  {
    href: "/account/settings",
    icon: IconSettings,
    title: "Settings",
    blurb: "Your level, your layout and this browser's theme.",
  },
] as const;

/**
 * Overview (VIB-69, restyled under VIB-126) — read-only summary of what
 * Settings can change, plus a way into the other tabs.
 *
 * Deliberately not a second copy of the form: one editor for these fields,
 * on the Settings tab, so there is no question of which one won.
 */
export default async function AccountOverviewPage() {
  const supabase = await createClient();
  const profile = await getCurrentProfile(supabase);

  /*
   * Middleware already gates /account. This is a second, independent check:
   * middleware can be misconfigured by a matcher change, and a page that
   * renders account data should not depend on routing config alone.
   */
  if (!profile) {
    redirect("/login?redirectTo=/account");
  }

  const rows = [
    { label: "Email", value: profile.email ?? "Not set" },
    { label: "Username", value: profile.username ?? "Not set" },
    { label: "Experience level", value: ROLE_LEVELS[profile.role_level] },
    { label: "Layout", value: LAYOUT_MODES[profile.layout_mode] },
    { label: "Plan", value: profile.plan },
  ];

  return (
    <div className="grid gap-5">
      <Panel>
        <div className="flex flex-wrap items-start justify-between gap-5">
          <h2 className="font-heading text-xl font-bold tracking-tight">
            Your details
          </h2>
          <Link
            href="/account/settings"
            className={buttonVariants({
              variant: "pill-soft",
              size: "pill-sm",
              className: "bg-card hover:bg-accent",
            })}
          >
            <ButtonIcon tone="on-soft" size="sm" className="bg-secondary">
              <IconSettings />
            </ButtonIcon>
            Edit in Settings
          </Link>
        </div>

        <dl className="mt-7 grid gap-x-8 gap-y-5 sm:grid-cols-2">
          {rows.map((row) => (
            <div key={row.label}>
              <dt className="text-muted-foreground text-sm">{row.label}</dt>
              <dd className="mt-1 font-bold capitalize">{row.value}</dd>
            </div>
          ))}
        </dl>
      </Panel>

      <ul className="grid gap-5 sm:grid-cols-3">
        {SHORTCUTS.map(({ href, icon: Icon, title, blurb }) => (
          <li key={href}>
            <Link href={href} className="block h-full">
              <Panel className="motion-lift hover:bg-primary/10 h-full transition-colors">
                <IconTile>
                  <Icon aria-hidden className="size-5" />
                </IconTile>
                <h2 className="font-heading mt-5 text-lg font-bold tracking-tight">
                  {title}
                </h2>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {blurb}
                </p>
              </Panel>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
