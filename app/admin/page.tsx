import type { Metadata } from "next";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireStaff } from "@/lib/staff";

export const metadata: Metadata = { title: "Staff — Viberation" };

/**
 * The staff area, deliberately empty (VIB-53).
 *
 * MVP scope is the gate, not an admin UI. This page exists so the gate has a
 * real route to protect and something reviewable behind it — the first actual
 * admin screen replaces this body and keeps the requireStaff() call.
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
        <CardContent className="text-sm text-muted-foreground">
          Nothing here yet. This route is gated on <code>profiles.app_role</code>;
          the tools that live behind it come after MVP.
        </CardContent>
      </Card>
    </main>
  );
}
