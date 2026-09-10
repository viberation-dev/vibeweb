import { IconArrowRight, IconCheck } from "@tabler/icons-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * The v3 three-up feature row (VIB-99).
 *
 * `filled` is the emphasis card and there is **exactly one per row** — more
 * than one and the hierarchy collapses, which is the whole point of the
 * treatment.
 *
 * The v3 mockup sets the filled card's heading in lime. That is not
 * reproduced here: `--highlight` is a fill-only colour (VIB-99, design
 * system readme "Do"), and lime as text on the primary fill fails contrast.
 * The heading uses `--primary-foreground`, which is the token that already
 * resolves correctly against that fill in both modes. Lime survives where it
 * belongs — as the icon tile's *fill*, with its own on-colour.
 */
export function FeatureCard({
  icon,
  title,
  points,
  cta,
  href,
  tone = "soft",
}: {
  icon: React.ReactNode;
  title: string;
  points: readonly string[];
  cta: string;
  href: string;
  tone?: "filled" | "soft";
}) {
  const filled = tone === "filled";

  return (
    <li className="h-full">
      <Link
        href={href}
        className={cn(
          "motion-lift flex h-full flex-col rounded-[1.125rem] p-[clamp(1.5rem,2.4vw,2.125rem)]",
          filled
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-foreground",
        )}
      >
        <span
          className={cn(
            "mb-[1.625rem] flex size-15 items-center justify-center rounded-2xl [&_svg]:size-6.5",
            filled
              ? "bg-highlight text-highlight-foreground"
              : "bg-card text-primary",
          )}
        >
          {icon}
        </span>

        <h3 className="font-heading text-[clamp(1.25rem,1.6vw,1.5rem)] leading-tight font-bold tracking-[-0.035em]">
          {title}
        </h3>

        <ul className="mt-[1.375rem] grid gap-[0.6875rem]">
          {points.map((point) => (
            <li
              key={point}
              className={cn(
                "flex items-center gap-2.5 text-[0.9rem] font-semibold",
                /* No opacity on the filled card: --primary-foreground at 90%
                   over the fill measures 4.07:1, under the 4.5 bar. The
                   token at full strength is what clears it. */
                filled ? "" : "text-muted-foreground",
              )}
            >
              <IconCheck
                aria-hidden
                className={cn(
                  "size-4 shrink-0",
                  filled ? "" : "text-primary",
                )}
              />
              {point}
            </li>
          ))}
        </ul>

        <span
          className={cn(
            "mt-auto flex items-center gap-2 pt-[1.625rem] text-[0.9rem] font-bold",
            filled ? "" : "text-primary",
          )}
        >
          {cta}
          <IconArrowRight aria-hidden className="size-4" />
        </span>
      </Link>
    </li>
  );
}
