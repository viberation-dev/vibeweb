import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariantsBase = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-[var(--primary-hover)]",
        outline:
          "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[var(--secondary-hover)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline",
        /* Affiliate / off-site links — the one place the secondary brand
           colour (lime) is a fill, always paired with its own on-colour. */
        outbound:
          "bg-highlight text-highlight-foreground font-semibold hover:bg-[var(--highlight-hover)]",
        /* v3 pill CTA (VIB-98/VIB-99). Pair with the `pill` / `pill-sm` size
           and put a <ButtonIcon> first in the children for the inset badge. */
        pill: "bg-primary text-primary-foreground hover:bg-[var(--primary-hover)]",
        "pill-soft": "bg-secondary text-secondary-foreground hover:bg-[var(--secondary-hover)]",
      },
      size: {
        default:
          "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-11 gap-1.5 px-3 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
        icon: "size-9",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-11",
        /* Asymmetric on purpose: the inset badge supplies the left padding,
           so the text sits optically centred rather than pushed right. */
        pill: "h-14 gap-3 rounded-full py-2 pr-6 pl-2 text-[0.9375rem] font-semibold",
        "pill-sm": "h-12 gap-2 rounded-full py-1.5 pr-5 pl-1.5 text-sm font-semibold",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

/**
 * cva concatenates; it does not tailwind-merge.
 *
 * So a class in the base string and a conflicting one in a variant both
 * survive, and the generated stylesheet's order decides which wins — not the
 * order they appear in the attribute. That is how every `pill` button
 * rendered at `rounded-lg` (12px) instead of `rounded-full`: the base's
 * radius outranked the variant's. The same trap swallowed `className`
 * overrides passed straight to `buttonVariants(...)`.
 *
 * Running the result through cn() fixes both, and fixes them for the
 * `<Link className={buttonVariants(...)}>` call sites too — which is most of
 * them on the marketing page, and which never went through <Button>.
 */
function buttonVariants(props?: Parameters<typeof buttonVariantsBase>[0]) {
  return cn(buttonVariantsBase(props))
}

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariantsBase>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={buttonVariants({ variant, size, className })}
      {...props}
    />
  )
}

/**
 * The inset circular badge inside a pill CTA (VIB-99).
 *
 * A component rather than a `icon` prop on Button, because most CTAs on the
 * marketing page are `<Link className={buttonVariants(...)}>` rather than
 * `<Button>` — a prop would not reach them, and two ways to draw the same
 * badge is how they drift apart.
 */
function ButtonIcon({
  tone = "on-primary",
  size = "default",
  className,
  children,
}: {
  /** Which fill the badge sits on — it inverts against it. */
  tone?: "on-primary" | "on-soft";
  /** Match the pill size it sits in: 38px default, 36px for `pill-sm`. */
  size?: "default" | "sm";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      aria-hidden
      data-slot="button-icon"
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full",
        size === "sm" ? "size-9 [&_svg]:size-4" : "size-9.5 [&_svg]:size-[1.1rem]",
        tone === "on-primary"
          ? "bg-primary-foreground text-primary"
          : "bg-card text-primary",
        className,
      )}
    >
      {children}
    </span>
  );
}

export { Button, ButtonIcon, buttonVariants }
