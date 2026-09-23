"use client";

import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandPinterest,
  IconBrandThreads,
  IconBrandX,
  IconCheck,
  IconLink,
} from "@tabler/icons-react";
import { useState, type ComponentType } from "react";

import { SHARE_NETWORKS } from "@/lib/share";

/**
 * Icons by network key.
 *
 * Mapped here rather than looked up by name from the share list, so the
 * bundler can see exactly which icons are used and the typecheck fails if a
 * network is added to lib/share.ts without one.
 */
const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  x: IconBrandX,
  facebook: IconBrandFacebook,
  linkedin: IconBrandLinkedin,
  threads: IconBrandThreads,
  pinterest: IconBrandPinterest,
};

const chipClass =
  "border-border bg-card focus-visible:ring-ring hover:border-primary hover:text-primary group/chip inline-flex h-11 items-center rounded-full border px-3.5 text-[0.9375rem] font-semibold transition-all focus-visible:ring-3 focus-visible:outline-none";

/**
 * The label that grows in on hover.
 *
 * A grid track animated from 0fr to 1fr is the one way to transition to an
 * element's intrinsic width — a `max-width` guess has to be large enough for
 * the longest label, which makes every shorter one ease at the wrong speed.
 *
 * `hover:none` pointers keep the labels open: a touch device has no hover
 * state to discover them with, so a row of unlabelled logos would stay
 * unlabelled.
 */
function ChipLabel({ children }: { children: string }) {
  return (
    <span className="grid grid-cols-[0fr] opacity-0 transition-all duration-200 group-hover/chip:grid-cols-[1fr] group-hover/chip:opacity-100 group-focus-visible/chip:grid-cols-[1fr] group-focus-visible/chip:opacity-100 [@media(hover:none)]:grid-cols-[1fr] [@media(hover:none)]:opacity-100">
      <span className="overflow-hidden whitespace-nowrap">
        <span className="pl-2">{children}</span>
      </span>
    </span>
  );
}

/**
 * Share this page: one icon chip per network, expanding to its label on
 * hover or keyboard focus (VIB-198).
 *
 * The URL is passed in from the server rather than read from
 * `window.location`, so what gets shared is the canonical address of the
 * piece and not whatever tracking query the reader happened to arrive with.
 *
 * Instagram is a copy-link button wearing a logo, because Instagram has no
 * web share intent — see lib/share.ts.
 */
export function ShareChips({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /*
       * Clipboard access is refused outright in some browsers and settings.
       * The URL is in the address bar either way, so this fails quietly
       * rather than throwing an alert at the reader.
       */
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {SHARE_NETWORKS.map((network) => {
        const Icon = ICONS[network.key];
        return (
          <a
            key={network.key}
            href={network.href(url, title)}
            target="_blank"
            rel="noopener noreferrer"
            className={chipClass}
          >
            <Icon className="size-[1.1875rem]" />
            <ChipLabel>{network.label}</ChipLabel>
            <span className="sr-only">Share on {network.label}</span>
          </a>
        );
      })}

      <button type="button" onClick={copy} className={chipClass}>
        <IconBrandInstagram className="size-[1.1875rem]" />
        <ChipLabel>Instagram</ChipLabel>
        <span className="sr-only">Copy the link to share on Instagram</span>
      </button>

      <button type="button" onClick={copy} className={chipClass}>
        {copied ? (
          <IconCheck className="size-[1.1875rem]" />
        ) : (
          <IconLink className="size-[1.1875rem]" />
        )}
        <ChipLabel>{copied ? "Copied" : "Copy link"}</ChipLabel>
        <span className="sr-only">Copy link to this page</span>
      </button>

      {/* Announced once, rather than on every keystroke of the timer. */}
      <span aria-live="polite" className="sr-only">
        {copied ? "Link copied" : ""}
      </span>
    </div>
  );
}
