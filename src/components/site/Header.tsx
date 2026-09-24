"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Wordmark } from "./Wordmark";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

export const NAV = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/korean-bbq", label: "Korean BBQ" },
  { href: "/hot-pot", label: "Hot Pot" },
  { href: "/gallery", label: "Gallery" },
  { href: "/visit", label: "Visit Us" },
];

const HERO_PAGES = ["/", "/korean-bbq", "/hot-pot", "/gallery"];

export type HeaderProps = {
  name: string;
  status: { isOpen: boolean; label: string; detail: string };
  phone: string;
  phoneHref: string;
  address: string;
  hoursToday: string;
};

export function StatusDot({ isOpen, className }: { isOpen: boolean; className?: string }) {
  return (
    <span className={cn("relative flex h-2 w-2", isOpen ? "text-jade-400" : "text-ivory-300/70", className)}>
      {isOpen && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />}
      <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
    </span>
  );
}

export function Header({ name, status, phone, phoneHref, address, hoursToday }: HeaderProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const overHero = HERO_PAGES.includes(pathname);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const solid = scrolled || !overHero || open;

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* Utility strip (desktop) */}
      <div
        aria-hidden={scrolled}
        className={cn(
          "hidden overflow-hidden transition-[max-height,opacity] duration-500 ease-out-expo lg:block",
          scrolled ? "max-h-0 opacity-0" : "max-h-10 opacity-100",
          solid && !scrolled ? "bg-ink-950" : "bg-ink-950/50 backdrop-blur-md",
        )}
      >
        <div className="container-site flex h-9 items-center justify-between font-label text-[12.5px] tracking-[0.16em] text-ivory-100/70">
          <span className="inline-flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-chili-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {address}
          </span>
          <div className="flex items-center gap-6">
            <span className="inline-flex items-center gap-2">
              <StatusDot isOpen={status.isOpen} />
              <span className="text-ivory-50">{status.label}</span>
              <span>· Today {hoursToday}</span>
            </span>
            <a href={phoneHref} className="text-ivory-50 transition hover:text-chili-300">
              {phone}
            </a>
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-ivory-50/15 to-transparent" />
      </div>

      {/* Main bar */}
      <div
        className={cn(
          "transition-[background-color,box-shadow,backdrop-filter] duration-500",
          solid
            ? "bg-ink-950/88 shadow-[0_1px_0_rgb(255_255_255/0.07),0_12px_40px_-20px_rgb(0_0_0/0.7)] backdrop-blur-xl"
            : "bg-gradient-to-b from-ink-950/75 via-ink-950/25 to-transparent",
        )}
      >
        <div className={cn("container-site flex items-center justify-between gap-6 transition-[height] duration-500 ease-out-expo", scrolled ? "h-[62px] md:h-[68px]" : "h-[68px] md:h-[84px]")}>
          <Link href="/" className="relative z-10 shrink-0" aria-label={`${name} home`}>
            <Wordmark name={name} size="sm" className="md:hidden" />
            <Wordmark name={name} size="md" className="hidden md:inline-flex" />
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-7 lg:flex">
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className="group relative py-2 nav-label text-ivory-100/85 transition-colors hover:text-ivory-50"
                >
                  {item.label}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-x-0 -bottom-0.5 h-[2px] origin-left bg-chili-400 transition-transform duration-500 ease-out-expo",
                      active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
                    )}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-4 lg:flex">
            <a href={phoneHref} className="hidden whitespace-nowrap nav-label text-[14px] text-ivory-100/90 transition hover:text-ivory-50 xl:block">
              {phone}
            </a>
            <ButtonLink href="/book" size="sm" className="h-10 px-5" arrow>
              Book a Table
            </ButtonLink>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <ButtonLink href="/book" size="sm" className="h-9 px-4 text-[13px]">
              Book
            </ButtonLink>
            <button
              type="button"
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
              className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full border border-ivory-50/15 text-ivory-50"
            >
              <span className="relative block h-3.5 w-5">
                <span className={cn("absolute left-0 top-0 h-0.5 w-5 rounded bg-current transition-all duration-300", open && "top-[6px] rotate-45")} />
                <span className={cn("absolute left-0 top-[6px] h-0.5 w-5 rounded bg-current transition-all duration-300", open && "opacity-0")} />
                <span className={cn("absolute left-0 top-[12px] h-0.5 w-5 rounded bg-current transition-all duration-300", open && "top-[6px] -rotate-45")} />
              </span>
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-nav"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="grain fixed inset-0 top-[68px] z-40 overflow-y-auto bg-ink-950 lg:hidden"
          >
            <div aria-hidden className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-chili-500/15 blur-3xl" />
            <div className="container-site relative z-[2] flex min-h-full flex-col pb-10 pt-2">
              <nav aria-label="Mobile" className="flex flex-col">
                {NAV.map((item, i) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link
                      href={item.href}
                      aria-current={pathname === item.href ? "page" : undefined}
                      className="flex items-center justify-between border-b border-ivory-50/10 py-5 font-display text-[2.2rem] leading-none text-ivory-50"
                    >
                      <span>{item.label}</span>
                      <span className="font-label text-lg tracking-[0.2em] text-chili-400">→</span>
                    </Link>
                  </motion.div>
                ))}
              </nav>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="mt-8 space-y-5">
                <ButtonLink href="/book" size="lg" className="w-full" arrow>
                  Book a Table
                </ButtonLink>
                <div className="grid gap-4 rounded-[20px] border border-ivory-50/10 p-5 text-[14px] text-ivory-100/75">
                  <p className="flex items-center gap-2">
                    <StatusDot isOpen={status.isOpen} />
                    <span className="font-semibold text-ivory-50">{status.label}</span>
                    <span>· Today {hoursToday}</span>
                  </p>
                  <p>{address}</p>
                  <a href={phoneHref} className="font-label text-[15px] tracking-[0.16em] text-ivory-50">{phone}</a>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
