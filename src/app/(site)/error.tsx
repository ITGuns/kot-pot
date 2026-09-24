"use client";

import { useEffect } from "react";
import { FALLBACK_CONTACT as C } from "@/lib/fallback";

/** Shown when a public page fails to render (e.g. the database is unreachable). Keeps the essentials visible. */
export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  const tel = `tel:+1${C.phone.replace(/\D/g, "")}`;
  return (
    <section className="flex min-h-[70svh] flex-col items-center justify-center bg-ink-950 px-6 pb-24 pt-40 text-center text-ivory-50">
      <p className="eyebrow text-chili-300">Something went wrong</p>
      <h1 className="mt-4 font-display text-[clamp(2.4rem,6vw,4.4rem)] leading-[0.98]">The grill is still hot, our website hiccupped.</h1>
      <p className="mt-4 max-w-md text-ivory-100/75">Please try again in a moment. You can always reach {C.name} directly.</p>
      <div className="mt-8 grid gap-2 text-[15px]">
        <a href={tel} className="font-label text-2xl tracking-[0.12em] text-ivory-50 hover:text-chili-300">
          {C.phone}
        </a>
        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(C.mapsQuery)}`} target="_blank" rel="noopener noreferrer" className="text-ivory-100/80 hover:text-ivory-50">
          {C.address}
        </a>
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className="rounded-full bg-chili-600 px-6 py-3 font-semibold text-ivory-50 hover:bg-chili-500">
          Try again
        </button>
        <a href="/" className="rounded-full border border-ivory-50/20 px-6 py-3 font-semibold text-ivory-50 hover:border-ivory-50/50">
          Back home
        </a>
      </div>
      {error.digest && <p className="mt-8 text-[12px] text-ivory-100/40">Reference: {error.digest}</p>}
    </section>
  );
}
