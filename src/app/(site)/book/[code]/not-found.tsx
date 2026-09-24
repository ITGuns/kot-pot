import Link from "next/link";
import { getRestaurant } from "@/lib/data/restaurant";

export default async function ReservationNotFound() {
  const restaurant = await getRestaurant();
  return (
    <section className="bg-ivory-50 pb-32 pt-32 text-ink-900 md:pt-40">
      <div className="container-site">
        <div className="mx-auto max-w-lg text-center">
          <p className="eyebrow text-chili-600">Reservation</p>
          <h1 className="mt-4 font-display text-4xl text-ink-900">We couldn&apos;t find that reservation.</h1>
          <p className="mt-3 text-ink-700">
            Check the link from your confirmation, or call us at{" "}
            <a className="font-semibold text-ink-900" href={`tel:+1${restaurant.phone.replace(/\D/g, "")}`}>
              {restaurant.phone}
            </a>
            .
          </p>
          <Link href="/book" className="mt-6 inline-block rounded-full bg-chili-600 px-6 py-3 font-semibold text-ivory-50">
            Make a new reservation
          </Link>
        </div>
      </div>
    </section>
  );
}
