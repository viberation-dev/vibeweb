"use client";

import { IconCheck, IconCopy } from "@tabler/icons-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

/**
 * Copy-to-clipboard with a confirmation state (§31 CopyablePromptBlock).
 *
 * One of the few genuinely client-side things in this app — the clipboard
 * has no server-side equivalent. It degrades honestly: without JavaScript
 * the button simply does not appear, and the prompt text is still selectable
 * because it is rendered as plain text beside it, not locked in a widget.
 */
export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
        } catch {
          // Clipboard access can be denied (insecure origin, permissions).
          // The text is on screen and selectable, so there is nothing to
          // recover — just do not pretend it worked.
          setCopied(false);
        }
      }}
      aria-live="polite"
    >
      {copied ? <IconCheck aria-hidden /> : <IconCopy aria-hidden />}
      {copied ? "Copied" : label}
    </Button>
  );
}
