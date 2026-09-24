import { cn } from "@/lib/cn";

/** Flame-over-pot mark. Purely decorative brand glyph. */
export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("h-7 w-7", className)} fill="none">
      <path d="M16 3c1.2 3.2 4.6 4.9 4.6 8.6 0 2.6-2 4.6-4.6 4.6s-4.6-2-4.6-4.6c0-1.3.5-2.3 1.2-3.2.2 1.4 1 2.4 2.1 2.6-.4-2.7.6-5.5 1.3-8z" fill="currentColor" className="text-chili-400" />
      <path d="M5 19h22l-1.6 6.2A4 4 0 0 1 21.5 28h-11a4 4 0 0 1-3.9-2.8L5 19z" fill="currentColor" className="text-ivory-50" />
      <path d="M3 19h26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-ivory-50" />
    </svg>
  );
}

/** Typographic wordmark. The previous site had no logo file, so the brand is set in type. */
export function Wordmark({ name = "Kot Pot I", className, size = "md", tone = "light" }: { name?: string; className?: string; size?: "sm" | "md" | "lg" | "xl"; tone?: "light" | "dark" }) {
  const text = { sm: "text-[22px] tracking-[0.18em]", md: "text-[26px] tracking-[0.2em]", lg: "text-[34px] tracking-[0.22em]", xl: "text-[clamp(2.6rem,7vw,5rem)] tracking-[0.22em]" }[size];
  const mark = { sm: "h-6 w-6", md: "h-7 w-7", lg: "h-9 w-9", xl: "h-[1.1em] w-[1.1em]" }[size];
  return (
    <span className={cn("inline-flex items-center gap-2.5 whitespace-nowrap font-label uppercase leading-none", tone === "light" ? "text-ivory-50" : "text-ink-900", text, className)}>
      <Mark className={mark} />
      <span>{name}</span>
    </span>
  );
}
