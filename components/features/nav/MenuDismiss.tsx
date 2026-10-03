"use client";

import { useEffect } from "react";

/**
 * Light-dismiss for the header and filter menus (VIB-233).
 *
 * Those menus are native `<details>`, deliberately: server components, real
 * links inside, no JavaScript needed to render them. What that choice does
 * not buy is menu *dismissal* — `<details>` is a disclosure widget, so the
 * spec gives it no outside-click close and no Escape, whatever the old
 * comment in SiteHeader claimed. Before this, a menu stayed open until you
 * clicked its own summary again.
 *
 * Mutual exclusion is handled natively by the `name` attribute the menus
 * share; this covers the two behaviours HTML has no equivalent for. The same
 * `name` is the selector, which is why inline disclosures — the FAQ
 * accordion, skill install blocks, model specs — are untouched. Those should
 * stay open, and they carry no `name`.
 *
 * One listener pair on the document rather than per-menu handlers: the menus
 * are server-rendered in several different trees, and this is the only client
 * component between them.
 */
export const MENU_NAME = "menu";

export function MenuDismiss() {
  useEffect(() => {
    const open = () =>
      document.querySelectorAll<HTMLDetailsElement>(`details[name="${MENU_NAME}"][open]`);

    /*
     * pointerdown, not click: a menu that closes on mouse-up stays open
     * through a drag, and the selection a drag starts lands behind it.
     */
    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node | null;
      for (const menu of open()) {
        if (!target || !menu.contains(target)) menu.open = false;
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      for (const menu of open()) {
        menu.open = false;
        // Escape should leave focus where a keyboard user can carry on, which
        // is the control they opened, not the top of the document.
        menu.querySelector("summary")?.focus();
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return null;
}
