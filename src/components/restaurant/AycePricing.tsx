"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import type { AycePricing as Row } from "@/db/schema";
import type { AyceGroup } from "@/lib/ayce";
import { sessionHoursLabel } from "@/lib/ayce";
import { daysLabelWeek, money, time12 } from "@/lib/format";
import { cn } from "@/lib/cn";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { onTabListKeyDown } from "@/lib/tabs";

function Price({ cents, big }: { cents: number; big?: boolean }) {
  const [dollars, c] = money(cents, { always: true }).replace("$", "").split(".");
  return (
    <span className={cn("inline-flex items-start font-display leading-none tabular-nums", big ? "text-[clamp(3.6rem,9vw,7rem)]" : "text-[clamp(2.4rem,5vw,3.6rem)]")}>
      <span className={cn("mt-[0.18em] font-sans font-semibold", big ? "text-[0.34em]" : "text-[0.4em]")}>$</span>
      {dollars}
      <span className={cn("ml-0.5 mt-[0.16em] font-sans font-semibold", big ? "text-[0.34em]" : "text-[0.4em]")}>.{c}</span>
    </span>
  );
}

export function AycePricing({
  groups,
  blurb,
  todayKey,
  currentId,
  tone = "light",
  compact = false,
  showCta = true,
}: {
  groups: AyceGroup[];
  blurb: string | null;
  /** key of the group that applies today */
  todayKey: string | null;
  /** id of the session running right now */
  currentId: number | null;
  tone?: "light" | "dark";
  compact?: boolean;
  showCta?: boolean;
}) {
  const reduce = useReducedMotion();
  const [groupKey, setGroupKey] = useState(() => todayKey ?? groups[0]?.key ?? "");
  const group = groups.find((g) => g.key === groupKey) ?? groups[0];
  const [sessionId, setSessionId] = useState<number | null>(() => (group ? (group.sessions.find((s) => s.id === currentId)?.id ?? group.sessions[0]?.id ?? null) : null));
  useEffect(() => {
    if (!group) return;
    if (!group.sessions.some((s) => s.id === sessionId)) setSessionId(group.sessions.find((s) => s.id === currentId)?.id ?? group.sessions[0]?.id ?? null);
  }, [group, sessionId, currentId]);
  const session: Row | undefined = group?.sessions.find((s) => s.id === sessionId) ?? group?.sessions[0];
  const light = tone === "light";

  if (!groups.length || !session) return null;

  return (
    <section id="all-you-can-eat" aria-labelledby="ayce-title" className={cn("relative scroll-mt-24 overflow-hidden", light ? "bg-ivory-50 text-ink-900" : "bg-ink-900 text-ivory-50", compact ? "py-16 lg:py-20" : "py-24 lg:py-32")}>
      <div aria-hidden className={cn("pointer-events-none absolute -right-32 top-0 h-[560px] w-[560px] rounded-full blur-3xl", light ? "bg-chili-400/12" : "bg-chili-500/15")} />
      <div aria-hidden className="pointer-events-none absolute left-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-chili-400/40 to-transparent" />
      <div className="container-site relative z-[2] grid gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-5">
          <Reveal>
            <p className={cn("eyebrow", light ? "text-chili-600" : "text-chili-300")}>Featured</p>
            <h2 id="ayce-title" className={cn("mt-4 font-display leading-[0.95] tracking-[-0.01em]", compact ? "text-[clamp(2.6rem,5.5vw,4.4rem)]" : "text-[clamp(3rem,6.5vw,5.6rem)]")}>
              All you <em className="italic text-chili-500">can</em> eat.
            </h2>
            {blurb && <p className={cn("mt-6 max-w-md text-[17px] leading-relaxed", light ? "text-ink-700" : "text-ivory-100/75")}>{blurb}</p>}
          </Reveal>
          <Reveal delay={0.1} className="mt-8">
            <div role="tablist" aria-label="Days" onKeyDown={onTabListKeyDown} className={cn("inline-flex flex-wrap gap-1 rounded-full p-1", light ? "bg-ink-900/6" : "bg-ivory-50/8")}>
              {groups.map((g) => {
                const on = g.key === group.key;
                return (
                  <button
                    key={g.key}
                    id={`ayce-day-${g.key}`}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    aria-controls="ayce-panel"
                    tabIndex={on ? 0 : -1}
                    onClick={() => setGroupKey(g.key)}
                    className={cn("relative h-11 rounded-full px-5 text-[14px] font-semibold transition-colors", on ? (light ? "text-ivory-50" : "text-ink-900") : light ? "text-ink-700 hover:text-ink-900" : "text-ivory-100/75 hover:text-ivory-50")}
                  >
                    {on && <motion.span layoutId={`ayce-tab-${tone}`} className={cn("absolute inset-0 rounded-full", light ? "bg-ink-900" : "bg-ivory-50")} transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 36 }} />}
                    <span className="relative inline-flex items-center gap-2">
                      {g.label}
                      {g.key === todayKey && <span className={cn("h-1.5 w-1.5 rounded-full", on ? "bg-chili-400" : "bg-chili-500")} aria-label="today" />}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className={cn("mt-3 text-[13px]", light ? "text-ink-500" : "text-ivory-100/70")}>
              {daysLabelWeek(group.days)}
              {group.includesHolidays ? " & holidays" : ""}
              {group.key === todayKey ? " · today" : ""}
            </p>
          </Reveal>
          {showCta && (
            <Reveal delay={0.15} className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/book" arrow>
                Book a Table
              </ButtonLink>
              <Link href="/menu" className={cn("inline-flex h-11 items-center px-2 text-[15px] font-semibold underline-offset-4 hover:underline", light ? "text-ink-900" : "text-ivory-50")}>
                See what's on the grill
              </Link>
            </Reveal>
          )}
        </div>

        <Reveal delay={0.1} className="lg:col-span-7" amount={0.2}>
          <div className={cn("relative overflow-hidden rounded-[32px] p-7 shadow-lift sm:p-10", light ? "bg-ink-900 text-ivory-50" : "bg-ivory-50 text-ink-900")}>
            <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-chili-500/25 blur-3xl" />
            {group.sessions.length > 1 && (
              <div role="tablist" aria-label="Session" onKeyDown={onTabListKeyDown} className="relative z-[2] flex flex-wrap gap-2">
                {group.sessions.map((s) => {
                  const on = s.id === session.id;
                  return (
                    <button
                      key={s.id}
                      id={`ayce-session-${s.id}`}
                      type="button"
                      role="tab"
                      aria-selected={on}
                      aria-controls="ayce-panel"
                      tabIndex={on ? 0 : -1}
                      onClick={() => setSessionId(s.id)}
                      className={cn(
                        "flex h-11 items-center gap-2 rounded-full border px-4 font-label text-[15px] tracking-[0.18em] transition-colors",
                        on ? "border-chili-400 bg-chili-600 text-ivory-50" : light ? "border-ivory-50/20 text-ivory-100/80 hover:border-ivory-50/50" : "border-ink-900/15 text-ink-700 hover:border-ink-900/40",
                      )}
                    >
                      {s.session}
                      {s.id === currentId && <span className="h-1.5 w-1.5 rounded-full bg-ivory-50" aria-label="running now" />}
                    </button>
                  );
                })}
              </div>
            )}
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={session.id}
                id="ayce-panel"
                role="tabpanel"
                aria-label={`${group.label}: ${session.session}`}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-[2] mt-8"
              >
                <p className={cn("font-label text-[15px] tracking-[0.2em]", light ? "text-chili-300" : "text-chili-600")}>
                  {session.session}
                  {sessionHoursLabel(session, time12) !== "All day" && ` · ${sessionHoursLabel(session, time12)}`}
                  {session.id === currentId && <span className="ml-2 rounded-full bg-chili-600 px-2 py-0.5 text-[11px] font-semibold text-ivory-50">Right now</span>}
                </p>
                <div className="mt-6 grid gap-8 sm:grid-cols-2 sm:gap-6">
                  <div>
                    <p className="eyebrow opacity-70">Adult</p>
                    <div className="mt-2">
                      <Price cents={session.adultPrice} big />
                    </div>
                  </div>
                  {session.childPrice != null && (
                    <div className={cn("border-t pt-6 sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0", light ? "border-ivory-50/15" : "border-ink-900/10")}>
                      <p className="eyebrow opacity-70">{session.childLabel}</p>
                      <div className="mt-2">
                        <Price cents={session.childPrice} />
                      </div>
                    </div>
                  )}
                </div>
                {session.note && <p className={cn("mt-6 text-[14px]", light ? "text-ivory-100/65" : "text-ink-500")}>{session.note}</p>}
              </motion.div>
            </AnimatePresence>
            <div className={cn("relative z-[2] mt-8 grid grid-cols-1 gap-2 border-t pt-6 text-[13px] sm:grid-cols-3", light ? "border-ivory-50/15 text-ivory-100/65" : "border-ink-900/10 text-ink-500")}>
              {group.sessions.map((s) => (
                <div key={s.id} className="flex items-baseline justify-between gap-3 sm:flex-col sm:gap-0.5">
                  <span className="font-semibold">{s.session}</span>
                  <span className="tabular-nums">
                    {sessionHoursLabel(s, time12) !== "All day" && `${sessionHoursLabel(s, time12)} · `}
                    {money(s.adultPrice, { always: true })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
