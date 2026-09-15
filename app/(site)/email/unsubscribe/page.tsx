import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";

export const metadata: Metadata = {
  title: "Unsubscribe",
  robots: { index: false },
};

type Props = {
  searchParams: Promise<{ u?: string; s?: string; done?: string; invalid?: string }>;
};

/**
 * Where the unsubscribe link in welcome emails lands (VIB-155). A button
 * rather than an instant unsubscribe, so a mail scanner opening the link
 * cannot unsubscribe anyone by itself.
 */
export default async function UnsubscribePage({ searchParams }: Props) {
  const { u, s, done, invalid } = await searchParams;

  return (
    <div className="flex justify-center px-4 py-16">
      <Panel size="lg" className="w-full max-w-md p-8 text-center">
        {done ? (
          <>
            <h1 className="font-heading text-2xl font-bold tracking-tight">You are unsubscribed</h1>
            <p className="text-muted-foreground mt-3">
              No more welcome emails. You will still get emails you ask for, like password resets.
            </p>
          </>
        ) : invalid || !u || !s ? (
          <>
            <h1 className="font-heading text-2xl font-bold tracking-tight">That link did not work</h1>
            <p className="text-muted-foreground mt-3">
              It may have been copied only in part. Use the unsubscribe link at the bottom of any
              welcome email.
            </p>
          </>
        ) : (
          <>
            <h1 className="font-heading text-2xl font-bold tracking-tight">Unsubscribe from welcome emails?</h1>
            <p className="text-muted-foreground mt-3">
              We will stop the short series of tips we send after you join.
            </p>
            <form
              method="post"
              action={`/api/email/unsubscribe?${new URLSearchParams({ u, s })}`}
              className="mt-6"
            >
              <input type="hidden" name="from" value="page" />
              <Button type="submit" variant="pill" size="pill">
                Unsubscribe
              </Button>
            </form>
          </>
        )}
        <p className="mt-6 text-sm">
          <Link href="/" className="text-primary hover:underline">
            Back to Viberation
          </Link>
        </p>
      </Panel>
    </div>
  );
}
