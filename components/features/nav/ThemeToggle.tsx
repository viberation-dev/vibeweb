"use client";

import { IconDeviceDesktop, IconMoon, IconSun } from "@tabler/icons-react";
import { useEffect, useState } from "react";

import {
  DARK_CLASS,
  resolveTheme,
  THEME_MODES,
  THEME_STORAGE_KEY,
  toThemeMode,
  type ThemeMode,
} from "@/lib/theme";
import { cn } from "@/lib/utils";

const ICONS = {
  light: IconSun,
  dark: IconMoon,
  system: IconDeviceDesktop,
} as const;
const LABELS = { light: "Light", dark: "Dark", system: "System" } as const;

function apply(mode: ThemeMode) {
  const dark = resolveTheme(
    mode,
    window.matchMedia("(prefers-color-scheme: dark)").matches,
  );
  document.documentElement.classList.toggle(DARK_CLASS, dark === "dark");
  document.documentElement.style.colorScheme = dark;
}

/**
 * Light / dark / system control (VIB-73).
 *
 * The mode is already applied before this renders — the inline script in the
 * layout does that, so there is no flash. This only handles *changing* it.
 *
 * Reads storage in an effect rather than during render on purpose: the
 * server has no localStorage, so rendering the stored value directly would
 * be a hydration mismatch. Until the effect runs the control shows the
 * default, which is what the markup says too.
 */
export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>("system");

  useEffect(() => {
    try {
      setMode(toThemeMode(localStorage.getItem(THEME_STORAGE_KEY)));
    } catch {
      // Site data blocked. The default stands and nothing here needs to fail.
    }
  }, []);

  /*
   * While on "system", the OS can change under us — at sunset, or when
   * someone flips their laptop's appearance. Without this the page keeps
   * whatever it painted at load, which is the one case "system" exists to
   * handle.
   */
  useEffect(() => {
    if (mode !== "system") return;
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => apply("system");
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [mode]);

  function choose(next: ThemeMode) {
    setMode(next);
    apply(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Blocked storage means the choice lasts this page only. Applying it
      // still works, so the click is not silently ignored.
    }
  }

  return (
    <div role="group" aria-label="Colour mode" className="flex gap-0.5 p-1">
      {THEME_MODES.map((value) => {
        const Icon = ICONS[value];
        const active = mode === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => choose(value)}
            aria-pressed={active}
            title={LABELS[value]}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded px-2 py-1 text-xs",
              active
                ? "bg-accent text-accent-foreground font-medium"
                : "text-muted-foreground hover:bg-accent/50",
            )}
          >
            <Icon aria-hidden className="size-3.5" />
            {LABELS[value]}
          </button>
        );
      })}
    </div>
  );
}
