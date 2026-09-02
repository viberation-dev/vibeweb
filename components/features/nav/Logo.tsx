import { cn } from "@/lib/utils";

type Props = {
  /** `horizontal` is mark + wordmark; `mark` is the glyph alone. */
  variant?: "horizontal" | "mark";
  className?: string;
};

/*
 * Aspect ratios read from each file's own viewBox — "0 0 350 65" and
 * "6 6 82 54". Kept here so a caller sets height alone and the width
 * follows, rather than every call site guessing. The mark is 82×54, not
 * square, so assuming 1/1 squashes it.
 */
const ART = {
  horizontal: { src: "/brand/logo-horizontal.svg", ratio: "350 / 65" },
  mark: { src: "/brand/logo-mark.svg", ratio: "82 / 54" },
} as const;

/**
 * The brand mark (VIB-75).
 *
 * Painted as a CSS mask over `currentColor` rather than an <img>. The SVGs
 * are monochrome and declare `fill="currentColor"`, but an <img> renders in
 * its own document and inherits nothing from this one — so it would come out
 * black, which is invisible on the dark ground VIB-73 just shipped. A mask
 * takes its colour from whatever the surrounding text is, in both modes,
 * with no second file and no JavaScript.
 *
 * Decorative here: every call site wraps this in a link that already carries
 * the accessible name, so announcing "Viberation" twice would be noise.
 */
export function Logo({ variant = "horizontal", className }: Props) {
  const art = ART[variant];

  return (
    <span
      aria-hidden
      className={cn("block bg-current", className)}
      style={{
        aspectRatio: art.ratio,
        maskImage: `url(${art.src})`,
        maskRepeat: "no-repeat",
        maskSize: "contain",
        maskPosition: "center",
        WebkitMaskImage: `url(${art.src})`,
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskSize: "contain",
        WebkitMaskPosition: "center",
      }}
    />
  );
}
