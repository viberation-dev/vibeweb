import type { Metadata } from "next";

import { DesignHistory } from "@/components/features/admin/DesignHistory";
import { SettingsForm } from "@/components/features/admin/SettingsForm";
import { createClient } from "@/lib/integrations/supabase/server";
import { getSiteSettings, listDesignHistory } from "@/lib/queries/settings";
import { requireStaff } from "@/lib/staff";

import { restoreDesignAction, saveSettingsAction } from "./actions";

export const metadata: Metadata = { title: "Site settings" };

/**
 * Site settings (VIB-187) — one screen, one row: card badges and the design
 * tokens with their history (VIB-246, VIB-247).
 *
 * It exists because the badge rules are an editorial decision that changes
 * with the traffic, and a decision that changes should not need a deploy.
 */
export default async function AdminSettingsPage() {
  await requireStaff("/admin/settings");

  const client = await createClient();
  const [settings, history] = await Promise.all([
    getSiteSettings(client),
    listDesignHistory(client),
  ]);

  return (
    <main className="mx-auto w-full max-w-2xl space-y-6 px-[clamp(1.25rem,4vw,2.5rem)] py-10">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-[-0.04em]">
          Site settings
        </h1>
        <p className="text-muted-foreground text-sm">
          Card badges and site colours. Changes apply as soon as they are
          saved.
        </p>
      </div>

      <SettingsForm settings={settings} action={saveSettingsAction} />
      <DesignHistory entries={history} restoreAction={restoreDesignAction} />
    </main>
  );
}
