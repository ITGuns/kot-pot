import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "light" | "glass" | "dark";
type Size = "sm" | "md" | "lg";

const base =
  "group/btn inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold tracking-tight transition-all duration-300 ease-out-expo select-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";
const variants: Record<Variant, string> = {
  primary: "bg-chili-600 text-ivory-50 shadow-[0_8px_24px_-8px_rgb(204_58_30/0.75)] hover:bg-chili-500 hover:shadow-glow",
  secondary: "bg-ivory-50 text-ink-900 hover:bg-white",
  ghost: "bg-transparent text-current hover:bg-current/8",
  outline: "border border-current/30 text-current hover:border-current hover:bg-current/5",
  light: "bg-ivory-50 text-ink-900 hover:bg-white",
  glass: "bg-ink-900/60 text-ivory-50 backdrop-blur border border-ivory-50/15 hover:bg-ink-900/90 hover:border-ivory-50/30",
  dark: "bg-ink-900 text-ivory-50 hover:bg-ink-700",
};
const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[13px]",
  md: "h-11 px-6 text-[15px]",
  lg: "h-13 px-8 text-base",
};

type Common = { variant?: Variant; size?: Size; className?: string; children: ReactNode; arrow?: boolean };

export function Arrow({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 20 20"
      className={cn("h-4 w-4 transition-transform duration-300 ease-out-expo group-hover/btn:translate-x-1", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 10h12M11 5l5 5-5 5" />
    </svg>
  );
}

export function Button({ variant = "primary", size = "md", className, children, arrow, ...rest }: Common & ComponentProps<"button">) {
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...rest}>
      {children}
      {arrow && <Arrow />}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  arrow,
  href,
  ...rest
}: Common & Omit<ComponentProps<typeof Link>, "className" | "children">) {
  const external = typeof href === "string" && /^https?:/.test(href);
  return (
    <Link
      href={href}
      className={cn(base, variants[variant], sizes[size], className)}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...rest}
    >
      {children}
      {arrow && <Arrow />}
    </Link>
  );
}
