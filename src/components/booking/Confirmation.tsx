"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import type { PublicReservation } from "@/actions/booking";
import { ButtonLink, Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Badge";
import { downloadIcs, googleCalendarUrl, type CalendarEvent } from "@/lib/calendar";
import { SITE_URL } from "@/lib/constants";
import { longDate, time12 } from "@/lib/format";
import { cn } from "@/lib/cn";

export function Confirmation({
  reservation: r,
  restaurant,
  turnTime,
  timezone,
  heading = "You're booked.",
}: {
  reservation: PublicReservation;
  restaurant: { name: string; addressLine1: string; city: string; state: string; zip: string; phone: string };
  turnTime: number;
  timezone: string;
  heading?: string;
}) {
  const [origin, setOrigin] = useState(SITE_URL);
  useEffect(() => setOrigin(window.location.origin), []);
  const manageUrl = `${origin}/book/${r.confirmationCode}?t=${r.manageToken}`;
  const event: CalendarEvent = {
    title: `${restaurant.name}: table for ${r.partySize}`,
    description: `Reservation ${r.confirmationCode} for ${r.firstName} ${r.lastName}. Party of ${r.partySize}. ${restaurant.phone}`,
    location: `${restaurant.name}, ${restaurant.addressLine1}, ${restaurant.city}, ${restaurant.state} ${restaurant.zip}`,
    date: r.date,
    time: r.time,
    durationMinutes: turnTime,
    uid: `${r.confirmationCode}@kotpot`,
    url: manageUrl,
    timezone,
  };
  const pending = r.status === "pending";
  const cancelled = r.status === "cancelled";

  return (
    <div className="mx-auto max-w-xl text-center" role="status" aria-live="polite">
      <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 18 }} className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-chili-600 text-ivory-50 shadow-glow">
        {cancelled ? (
          <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.25, duration: 0.5, ease: "easeOut" }} />
          </svg>
        )}
      </motion.div>
      <h2 className="mt-6 font-display text-4xl text-ink-900 sm:text-5xl">{cancelled ? "Reservation cancelled" : heading}</h2>
      <p className="mt-3 text-[15px] text-ink-700">
        {cancelled
          ? "We've released your table. We hope to see you another time."
          : r.status === "completed"
            ? "Thanks for dining with us. This reservation is complete."
            : pending
            ? "Your request is in. Large parties are confirmed by our team. We'll reach out shortly."
            : "Reservation confirmed. Your table is saved and the grill is waiting."}
      </p>

      <div className="mt-8 rounded-[24px] border border-ink-900/10 bg-ivory-50 p-6 text-left shadow-card sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="eyebrow text-ink-500">Confirmation</span>
          <span className="font-label text-2xl tracking-[0.12em] text-ink-900" data-testid="confirmation-code">{r.confirmationCode}</span>
        </div>
        <dl className="mt-5 grid gap-5 sm:grid-cols-3">
          <div>
            <dt className="eyebrow text-ink-500">Date</dt>
            <dd className="mt-1 font-display text-xl text-ink-900">{longDate(r.date)}</dd>
          </div>
          <div>
            <dt className="eyebrow text-ink-500">Time</dt>
            <dd className="mt-1 font-display text-xl text-ink-900">{time12(r.time)}</dd>
          </div>
          <div>
            <dt className="eyebrow text-ink-500">Party</dt>
            <dd className="mt-1 font-display text-xl text-ink-900">{r.partySize} {r.partySize === 1 ? "guest" : "guests"}</dd>
          </div>
        </dl>
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-ink-900/10 pt-5 text-[14px] text-ink-700">
          <span className="font-semibold text-ink-900">{r.firstName} {r.lastName}</span>
          <span>·</span>
          <span>{r.email}</span>
          <span>·</span>
          <span>{r.phone}</span>
          <Pill tone={cancelled || r.status === "no_show" ? "garnet" : pending ? "bronze" : "jade"} className={cn("ml-auto", cancelled || r.status === "no_show" ? "bg-garnet-700/10 text-garnet-700 ring-garnet-600/30" : pending ? "bg-bronze-400/25 text-wood-700 ring-bronze-500/40" : "bg-jade-500/15 text-jade-700 ring-jade-500/30")}>
            {{ pending: "Pending", confirmed: "Confirmed", cancelled: "Cancelled", completed: "Completed", no_show: "No-show" }[r.status]}
          </Pill>
        </div>
        {(r.seatingPreference || r.occasion || r.specialRequests) && (
          <div className="mt-4 space-y-1 text-[14px] text-ink-700">
            {r.seatingPreference && <p><span className="font-semibold">Seating:</span> {r.seatingPreference}</p>}
            {r.occasion && <p><span className="font-semibold">Occasion:</span> {r.occasion}</p>}
            {r.specialRequests && <p><span className="font-semibold">Requests:</span> {r.specialRequests}</p>}
          </div>
        )}
      </div>

      {!cancelled && (
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <ButtonLink href={googleCalendarUrl(event)} variant="dark" size="sm">Add to Calendar</ButtonLink>
          <Button variant="outline" size="sm" className="text-ink-900" onClick={() => downloadIcs(event, `kot-pot-${r.confirmationCode}.ics`)}>Download .ics</Button>
          <ButtonLink href={`/book/${r.confirmationCode}?t=${r.manageToken}`} variant="outline" size="sm" className="text-ink-900">View Reservation</ButtonLink>
        </div>
      )}
      <p className="mt-6 text-[13px] text-ink-500">
        Need to change something? Call us at <a href={`tel:+1${restaurant.phone.replace(/\D/g, "")}`} className="font-semibold text-ink-900">{restaurant.phone}</a>.
      </p>
      <Link href="/" className="mt-4 inline-block text-[14px] font-semibold text-chili-600 hover:underline">← Back to Home</Link>
    </div>
  );
}
