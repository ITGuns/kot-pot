import type { DietaryTag } from "@/db/schema";
import { DIETARY_LABELS } from "@/lib/constants";
import { cn } from "@/lib/cn";

const dietaryStyles: Record<DietaryTag, string> = {
  vegetarian: "bg-jade-500/15 text-jade-400 ring-jade-500/35",
  vegan: "bg-jade-500/20 text-jade-400 ring-jade-500/45",
  "gluten-free": "bg-bronze-400/20 text-bronze-300 ring-bronze-500/45",
  spicy: "bg-chili-500/15 text-chili-300 ring-chili-500/40",
  "contains-shellfish": "bg-steel-600/25 text-ivory-200 ring-steel-400/40",
  "contains-nuts": "bg-steel-600/25 text-ivory-200 ring-steel-400/40",
  "non-alcoholic": "bg-ivory-50/10 text-ivory-200 ring-ivory-50/20",
};
const dietaryStylesLight: Record<DietaryTag, string> = {
  vegetarian: "bg-jade-500/15 text-jade-700 ring-jade-500/30",
  vegan: "bg-jade-500/20 text-jade-700 ring-jade-500/40",
  "gluten-free": "bg-bronze-400/25 text-wood-700 ring-bronze-500/40",
  spicy: "bg-chili-500/12 text-chili-700 ring-chili-500/30",
  "contains-shellfish": "bg-ink-900/8 text-ink-700 ring-ink-900/15",
  "contains-nuts": "bg-ink-900/8 text-ink-700 ring-ink-900/15",
  "non-alcoholic": "bg-ink-900/8 text-ink-700 ring-ink-900/15",
};

export function DietaryBadge({ tag, size = "sm", tone = "dark", className }: { tag: DietaryTag; size?: "xs" | "sm"; tone?: "dark" | "light"; className?: string }) {
  const meta = DIETARY_LABELS[tag];
  return (
    <span
      title={meta.description}
      aria-label={meta.description}
      className={cn(
        "inline-flex items-center rounded-full font-label tracking-[0.12em] ring-1 ring-inset",
        size === "xs" ? "h-5 px-1.5 text-[11px]" : "h-6 px-2 text-[12px]",
        tone === "dark" ? dietaryStyles[tag] : dietaryStylesLight[tag],
        className,
      )}
    >
      {meta.short}
    </span>
  );
}

export function Pill({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "chili" | "jade" | "bronze" | "garnet" | "dark" | "light" | "outline";
  className?: string;
}) {
  const tones = {
    neutral: "bg-ivory-50/8 text-ivory-100 ring-ivory-50/15",
    chili: "bg-chili-500/15 text-chili-300 ring-chili-500/35",
    jade: "bg-jade-500/15 text-jade-400 ring-jade-500/35",
    bronze: "bg-bronze-400/18 text-bronze-300 ring-bronze-500/40",
    garnet: "bg-garnet-700/40 text-chili-300 ring-garnet-600/60",
    dark: "bg-ink-900 text-ivory-100 ring-ink-700",
    light: "bg-ivory-50/92 text-ink-900 ring-ivory-300 backdrop-blur",
    outline: "bg-transparent text-current ring-current/30",
  };
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-[11.5px] font-semibold uppercase tracking-[0.14em] ring-1 ring-inset",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
