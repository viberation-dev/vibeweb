"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { createClient } from "@/lib/integrations/supabase/client";
import { getProfile } from "@/lib/queries/profiles";

/**
 * A member's own tier is the Learn hub's default filter (VIB-34). The page is
 * cached for everyone, so instead of reading the profile on the server, this
 * turns an unset `?level=` into the member's tier in the browser.
 *
 * Renders nothing. Only runs when the URL has no level, so `?level=all` and
 * an explicit tier are left alone.
 */
export function LevelDefault({ hrefFor }: { hrefFor: Record<string, string> }) {
  const router = useRouter();

  useEffect(() => {
    let live = true;
    const supabase = createClient();
    void supabase.auth.getSession().then(async ({ data }) => {
      const user = data.session?.user;
      if (!user) return;
      const profile = await getProfile(supabase, user.id).catch(() => null);
      const href = profile?.role_level ? hrefFor[profile.role_level] : undefined;
      if (live && href) router.replace(href, { scroll: false });
    });
    return () => {
      live = false;
    };
  }, [hrefFor, router]);

  return null;
}
