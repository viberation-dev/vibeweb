"use client";

import { createContext, useContext, useEffect, useState } from "react";

import { createClient } from "@/lib/integrations/supabase/client";
import { listBookmarks } from "@/lib/queries/bookmarks";
import type { Enums } from "@/types/supabase";

type Saved = { has: (id: string) => boolean; toggle: (id: string) => void };

const SavedContext = createContext<Saved | null>(null);

/**
 * Which items on a cached listing the reader has saved, loaded in the
 * browser so the page itself can be the same for everyone.
 *
 * Signed out, nothing is saved and nothing is fetched. A Save press updates
 * this straight away; the server action does the real write.
 */
export function BookmarksProvider({
  targetType,
  children,
}: {
  targetType: Enums<"target_kind">;
  children: React.ReactNode;
}) {
  const [ids, setIds] = useState<ReadonlySet<string>>(new Set());

  useEffect(() => {
    let live = true;
    const supabase = createClient();
    void supabase.auth.getSession().then(async ({ data }) => {
      const user = data.session?.user;
      if (!user) return;
      const rows = await listBookmarks(supabase, user.id, targetType).catch(() => []);
      if (live) setIds(new Set(rows.map((row) => row.target_id)));
    });
    return () => {
      live = false;
    };
  }, [targetType]);

  const value: Saved = {
    has: (id) => ids.has(id),
    toggle: (id) =>
      setIds((current) => {
        const next = new Set(current);
        if (!next.delete(id)) next.add(id);
        return next;
      }),
  };

  return <SavedContext value={value}>{children}</SavedContext>;
}

export function useSaved(): Saved | null {
  return useContext(SavedContext);
}
