import type { Metadata } from "next";
import Link from "next/link";
import { lookupReservation } from "@/actions/booking";
import { ManageReservation } from "@/components/booking/ManageReservation";
import { getBookingSettings, getRestaurant } from "@/lib/data/restaurant";

export const metadata: Metadata = { title: "Your Reservation", robots: { index: false, follow: false } };

export default async function ReservationPage({ params, searchParams }: { params: Promise<{ code: string }>; searchParams: Promise<{ t?: string }> }) {
  const [{ code }, { t }, settings, restaurant] = await Promise.all([params, searchParams, getBookingSettings(), getRestaurant()]);
  const res = t ? await lookupReservation(code, t) : null;

  return (
    <section className="bg-ivory-50 pb-32 pt-32 text-ink-900 md:pt-40">
      <div className="container-site">
        {res?.ok ? (
          <ManageReservation
            reservation={res.data}
            token={t!}
            restaurant={{ name: restaurant.name, addressLine1: restaurant.addressLine1, city: restaurant.city, state: restaurant.state, zip: restaurant.zip, phone: restaurant.phone }}
            turnTime={settings.turnTimeMinutes}
            timezone={settings.timezone}
          />
        ) : (
          <div className="mx-auto max-w-lg text-center">
            <p className="eyebrow text-chili-600">Reservation</p>
            <h1 className="mt-4 font-display text-4xl text-ink-900">We couldn&apos;t find that reservation.</h1>
            <p className="mt-3 text-ink-700">
              Check the link in your confirmation, or call us at{" "}
              <a className="font-semibold text-ink-900" href={`tel:+1${restaurant.phone.replace(/\D/g, "")}`}>
                {restaurant.phone}
              </a>
              .
            </p>
            <Link href="/book" className="mt-6 inline-block rounded-full bg-chili-600 px-6 py-3 font-semibold text-ivory-50">
              Make a new reservation
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
