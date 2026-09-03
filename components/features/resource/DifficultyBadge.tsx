import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import type { RoleLevel } from "@/lib/role-level";

/*
 * Fixed hue per level, independent of theme/mode, so "Beginner" reads the
 * same colour everywhere (Viberation Design System readme "Colour").
 *
 * Lives in features/, not ui/, because it is not a primitive: it knows the
 * product's `role_level` enum and that "expert" is shown as "Advanced".
 * components/ui holds things that know nothing about this app (VIB-74).
 */
const difficultyBadgeVariants = cva(
  "inline-flex h-[22px] w-fit shrink-0 items-center gap-1.5 rounded-4xl border px-2.5 text-xs font-semibold whitespace-nowrap before:content-[''] before:size-1.5 before:shrink-0 before:rounded-full before:bg-current",
  {
    variants: {
      level: {
        beginner:
          "border-difficulty-beginner-border bg-difficulty-beginner-bg text-difficulty-beginner",
        intermediate:
          "border-difficulty-intermediate-border bg-difficulty-intermediate-bg text-difficulty-intermediate",
        advanced:
          "border-difficulty-advanced-border bg-difficulty-advanced-bg text-difficulty-advanced",
      },
    },
  },
);

const LEVEL_LABEL: Record<"beginner" | "intermediate" | "advanced", string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export type DifficultyBadgeProps = {
  /** The product's own enum says "expert"; the badge set says "advanced". */
  level: RoleLevel;
  className?: string;
} & Omit<VariantProps<typeof difficultyBadgeVariants>, "level">;

function DifficultyBadge({ level, className }: DifficultyBadgeProps) {
  const resolved = level === "expert" ? "advanced" : level;
  return (
    <span
      data-slot="difficulty-badge"
      className={cn(difficultyBadgeVariants({ level: resolved }), className)}
    >
      {LEVEL_LABEL[resolved]}
    </span>
  );
}

export { DifficultyBadge, difficultyBadgeVariants };
