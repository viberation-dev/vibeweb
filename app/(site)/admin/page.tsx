import { IconBook2, IconQuote, IconStack2 } from "@tabler/icons-react";
import type { Metadata } from "next";
import Link from "next/link";

import { IconTile } from "@/components/ui/icon-tile";
import { Panel } from "@/components/ui/panel";
import { SectionHead } from "@/components/ui/section-head";
import { requireStaff } from "@/lib/staff";

export const metadata: Metadata = { title: "Staff" };

const EDITORS = [
  {
    href: "/admin/content",
    icon: IconBook2,
    title: "Learn content",
    blurb: "Articles, guides, cheatsheets and the help pages behind /docs.",
  },
  {
    href: "/admin/tools",
    icon: IconStack2,
    title: "Tools",
    blurb: "Every directory entry, its category, links and affiliate flag.",
  },
  {
    href: "/admin/testimonials",
    icon: IconQuote,
    title: "Testimonials",
    blurb: "Real quotes from real people, or the homepage shows none.",
  },
] as const;

/**
 * The staff area — VIB-53's gate, with VIB-59's two editors behind it,
 * restyled to the design system under VIB-127.
 *
 * Three editors and nothing else, deliberately: tags, collections,
 * walkthroughs and role changes stay in the Supabase dashboard (or VIB-58's
 * RPC) until one of them becomes a weekly job the way tools and articles
 * are. Testimonials joined them in VIB-102 — they are visitor-facing claims
 * about real people, which is not work to do in a database client.
 */
export default async function AdminPage() {
  const profile = await requireStaff("/admin");

  return (
    <main className="mx-auto w-full max-w-4xl px-[clamp(1.25rem,4vw,2.5rem)] py-10">
      <SectionHead
        level="h1"
        eyebrow="Staff"
        title="What needs editing?"
        lede={`Signed in as ${profile.email} (${profile.app_role}).`}
        className="mb-8"
      />

      <ul className="grid gap-5 sm:grid-cols-3">
        {EDITORS.map(({ href, icon: Icon, title, blurb }) => (
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
    </main>
  );
}
