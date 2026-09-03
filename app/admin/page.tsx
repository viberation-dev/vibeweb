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
 * The staff area (VIB-53's gate, VIB-59's first screen behind it).
 *
 * The Learn editor is the half that lands here first: articles are the thing
 * written weekly. The tools editor is the other half of VIB-59 and is still
 * the Supabase dashboard.
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
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            Tools are still edited in the Supabase dashboard — that editor is the
            other half of VIB-59.
          </p>
          <Link href="/admin/content" className={buttonVariants()}>
            Learn content
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
