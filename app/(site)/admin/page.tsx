import type { Metadata } from "next";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { requireStaff } from "@/lib/staff";

export const metadata: Metadata = { title: "Staff — Viberation" };

/**
 * The staff area — VIB-53's gate, with VIB-59's two editors behind it.
 *
 * Two editors and nothing else, deliberately: tags, collections, wizards and
 * role changes stay in the Supabase dashboard (or VIB-58's RPC) until one of
 * them becomes a weekly job the way tools and articles are.
 */
export default async function AdminPage() {
  const profile = await requireStaff("/admin");

  return (
    <main className="mx-auto w-full max-w-2xl p-6">
      <Card>
        <CardHeader>
          <CardTitle>Staff area</CardTitle>
          <CardDescription>
            Signed in as {profile.email} ({profile.app_role}).
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link href="/admin/content" className={buttonVariants()}>
            Learn content
          </Link>
          <Link href="/admin/tools" className={buttonVariants()}>
            Tools
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
