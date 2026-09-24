import type { Metadata } from "next";
import { BookingWizard } from "@/components/booking/BookingWizard";
import { getBookableDates } from "@/lib/booking";
import { getBookingSettings, getRestaurant } from "@/lib/data/restaurant";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const r = await getRestaurant();
  return pageMeta(r, { title: "Book a Table", description: `Reserve a table at ${r.name}: ${r.tagline} in ${r.city}, ${r.state}.`, path: "/book" });
}

export default async function BookPage() {
  const [settings, restaurant, bookable] = await Promise.all([getBookingSettings(), getRestaurant(), getBookableDates()]);
  return (
    <>
      <section className="grain relative overflow-hidden bg-ink-950 pb-12 pt-32 text-ivory-50 md:pt-40">
        <div aria-hidden className="pointer-events-none absolute -left-20 top-0 h-[420px] w-[420px] rounded-full bg-chili-500/15 blur-3xl" />
        <div className="container-site relative z-[2]">
          <p className="eyebrow text-chili-300">Reservations</p>
          <h1 className="mt-4 font-display text-[clamp(2.8rem,7vw,6rem)] leading-[0.95] tracking-[-0.01em]">
            Book a <em className="italic text-chili-300">table</em>.
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ivory-100/70">
            Pick a day, tell us how many, grab a time. Parties of {settings.largePartyThreshold} or more are confirmed by our team.
          </p>
        </div>
      </section>
      <section className="bg-ivory-50 py-12 pb-32 text-ink-900 lg:py-16">
        <div className="container-site">
          <BookingWizard
            settings={{
              minPartySize: settings.minPartySize,
              maxPartySize: settings.maxPartySize,
              largePartyThreshold: settings.largePartyThreshold,
              turnTimeMinutes: settings.turnTimeMinutes,
              seatingPreferences: settings.seatingPreferences,
              occasions: settings.occasions,
              bookingsEnabled: settings.bookingsEnabled,
              timezone: settings.timezone,
            }}
            bookable={bookable}
            restaurant={{ name: restaurant.name, addressLine1: restaurant.addressLine1, city: restaurant.city, state: restaurant.state, zip: restaurant.zip, phone: restaurant.phone }}
          />
        </div>
      </section>
    </>
  );
}
