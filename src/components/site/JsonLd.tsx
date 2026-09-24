import type { Hours, RestaurantInfo } from "@/db/schema";
import { DAY_NAMES, SITE_URL } from "@/lib/constants";

/** schema.org Restaurant markup built only from stored restaurant facts. */
export function RestaurantJsonLd({ restaurant: r, hours }: { restaurant: RestaurantInfo; hours: Hours[] }) {
  const store = hours.filter((h) => h.category === "store" && !h.isClosed && h.opensAt && h.closesAt);
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: r.name,
    description: r.description,
    url: SITE_URL,
    telephone: r.phone,
    image: r.heroImage ? `${SITE_URL}${r.heroImage}` : undefined,
    servesCuisine: ["Korean", "Korean BBQ", "Hot Pot"],
    priceRange: r.priceRange ?? undefined,
    acceptsReservations: "True",
    hasMenu: `${SITE_URL}/menu`,
    address: {
      "@type": "PostalAddress",
      streetAddress: [r.addressLine1, r.addressLine2].filter(Boolean).join(", "),
      addressLocality: r.city,
      addressRegion: r.state,
      postalCode: r.zip,
      addressCountry: "US",
    },
    sameAs: [r.instagramUrl, r.facebookUrl, r.tiktokUrl, r.yelpUrl, r.website].filter(Boolean),
    openingHoursSpecification: store.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: DAY_NAMES[h.dayOfWeek],
      opens: h.opensAt,
      closes: h.closesAt,
    })),
    potentialAction: {
      "@type": "ReserveAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/book`, actionPlatform: ["http://schema.org/DesktopWebPlatform", "http://schema.org/MobileWebPlatform"] },
      result: { "@type": "FoodEstablishmentReservation", name: "Table reservation" },
    },
  };
  if (r.email) data.email = r.email;
  if (r.rating && r.reviewCount) {
    data.aggregateRating = { "@type": "AggregateRating", ratingValue: r.rating, reviewCount: r.reviewCount, bestRating: "5" };
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
