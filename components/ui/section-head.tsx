import { IconArrowRight } from "@tabler/icons-react";
import Link from "next/link";

/**
 * The v3 section heading (VIB-125): a barred eyebrow, a tight display title,
 * an optional lede, and an optional link pushed to the far end.
 *
 * The eyebrow's bar is what keeps an uppercase label from reading as a
 * generic tracked-out kicker: it is a mark on the page, not just small caps.
 *
 * `align="center"` is for the screens with no side rail (auth, onboarding),
 * where a left-aligned head in a narrow centred column looks misplaced.
 */
export function SectionHead({
  eyebrow,
  title,
  lede,
  action,
  align = "start",
  level = "h2",
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  action?: { label: string; href: string };
  align?: "start" | "center";
  /** h1 where this is the page title, h2 where it heads a section within one. */
  level?: "h1" | "h2";
  className?: string;
}) {
  const centred = align === "center";
  const Heading = level;

  return (
    <div
      className={[
        "mb-10 flex flex-wrap gap-7",
        centred
          ? "flex-col items-center text-center"
          : "items-end justify-between",
        className ?? "",
      ].join(" ")}
    >
      <div>
        {eyebrow ? (
          <p
            className={[
              "text-primary flex items-center gap-2.5 text-xs font-bold tracking-widest uppercase",
              centred ? "justify-center" : "",
            ].join(" ")}
          >
            <span aria-hidden className="bg-primary h-0.5 w-5 rounded-full" />
            {eyebrow}
          </p>
        ) : null}
        <Heading
          className={[
            "font-heading text-3xl font-bold tracking-[-0.04em] lg:text-4xl",
            eyebrow ? "mt-3.5" : "",
          ].join(" ")}
        >
          {title}
        </Heading>
        {lede ? (
          <p
            className={[
              "text-muted-foreground mt-3.5 text-lg leading-relaxed",
              centred ? "mx-auto max-w-[56ch]" : "max-w-[56ch]",
            ].join(" ")}
          >
            {lede}
          </p>
        ) : null}
      </div>
      {action ? (
        <Link
          href={action.href}
          className="text-primary flex shrink-0 items-center gap-2 text-[0.9375rem] font-bold hover:underline"
        >
          {action.label}
          <IconArrowRight aria-hidden className="size-4" />
        </Link>
      ) : null}
    </div>
  );
}
