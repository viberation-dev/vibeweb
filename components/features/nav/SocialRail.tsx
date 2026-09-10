import { IconBrandGithub, IconBrandX } from "@tabler/icons-react";

/**
 * Fixed right rail (VIB-99). Hidden below 1280px, where there is no room
 * beside the content column — the footer carries the same links there.
 */
const LINKS = [
  { label: "X", href: "https://x.com/viberation", Icon: IconBrandX },
  {
    label: "GitHub",
    href: "https://github.com/viberation-dev",
    Icon: IconBrandGithub,
  },
] as const;

export function SocialRail() {
  return (
    <div className="fixed top-1/2 right-4 z-40 hidden -translate-y-1/2 xl:block">
      <div className="flex flex-col items-center gap-4">
        <span
          className="text-muted-foreground text-[0.7rem] tracking-[0.14em] uppercase"
          style={{ writingMode: "vertical-rl" }}
        >
          Follow us
        </span>
        <span aria-hidden className="bg-muted-foreground/30 h-11 w-px" />
        {LINKS.map(({ label, href, Icon }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <Icon aria-hidden className="size-4" />
          </a>
        ))}
      </div>
    </div>
  );
}
