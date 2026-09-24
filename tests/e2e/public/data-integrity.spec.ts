import { expect, test } from "@playwright/test";
import { closePool, query } from "../helpers/db";

/**
 * Final audit against kot-pot-i-mcallen.md: every source section, item, price,
 * Korean name and restaurant fact must exist in the database exactly as written.
 */
const SOURCE = {
  restaurant: { name: "Kot Pot I", tagline: "Authentic Korean · Korean BBQ · Hot Pot", rating: "4.5", review_count: 411, price_range: "$30–40 per person", address_line1: "400 W Nolana Ave Ste V", city: "McAllen", state: "TX", zip: "78504", phone: "(956) 843-0065", seo_title: "Kot Pot I — Korean BBQ & Hot Pot · McAllen, TX" },
  serviceTypes: ["Dine-in", "Takeout", "Delivery"],
  hours: { 0: ["11:00", "22:00"], 1: ["11:00", "22:00"], 2: ["11:00", "22:00"], 3: ["11:00", "22:00"], 4: ["11:00", "22:00"], 5: ["11:00", "23:00"], 6: ["11:00", "23:00"] },
  ayce: [
    ["Monday – Friday", "Lunch", 2299, 1299],
    ["Monday – Friday", "Dinner", 2899, 1499],
    ["Sat · Sun · Holidays", "All Day", 3499, 1699],
  ],
  menu: {
    "Korean BBQ": [
      ["Sliced Beef Brisket", "차돌박이", "Thinly shaved, melts on the grill", 1400],
      ["Marinated Beef Bulgogi", "불고기", "Sweet soy, garlic, sesame", 1500],
      ["Sliced Pork Belly", "삼겹살", "Thick-cut, crisp & juicy", 1300],
      ["Spicy Pork", "제육볶음", "Gochujang glazed pork shoulder", 1300],
      ["Sliced Chicken", "닭갈비", "House marinade, charred edges", 1100],
      ["Beef Short Rib (LA Galbi)", "LA갈비", "Cross-cut, soy-marinated", 1800],
      ["Spicy Squid", "오징어볶음", "Tender, fiery glaze", 1200],
      ["Shrimp Skewers", "새우꼬치", "Garlic butter brushed", 1300],
    ],
    "Hot Pot": [
      ["Spicy Sichuan Mala", null, "Numbing chili, star anise, cassia", 800],
      ["Tomato Comfort", null, "Slow-simmered tomato & pork bone", 800],
      ["Mushroom Forest", null, "Six wild mushrooms, herb infusion", 800],
      ["Korean Kimchi", null, "Aged kimchi & gochugaru base", 800],
      ["Tom Yum", null, "Lemongrass, galangal, lime leaf", 800],
      ["Pork Bone (Tonkotsu)", null, "18-hour rich, milky broth", 800],
    ],
    "Sauce Bar": [
      ["House Sesame", null, "Toasted sesame paste, garlic oil", null],
      ["Korean Ssamjang", null, "Fermented bean & chili", null],
      ["Garlic Soy", null, "Aged shoyu, fresh garlic, scallion", null],
      ["Spicy Chili Crisp", null, "Sichuan peppercorn, dried chili", null],
      ["Ponzu Citrus", null, "Yuzu, soy, mirin", null],
      ["Sweet & Sour Plum", null, "Aged plum reduction", null],
    ],
    Cocktails: [
      ["Cherry Soju Spritz", null, "Soju, cherry, yuzu sparkle", 1200],
      ["Peach Makgeolli", null, "Rice wine, white peach", 1100],
      ["Korean Ember", null, "Smoked whiskey, gochujang honey", 1400],
      ["Lychee Martini", null, "Soju, lychee, lime", 1200],
      ["Drunken Yuzu", null, "Gin, yuzu, elderflower", 1300],
      ["Hot Pot Old Fashioned", null, "Bourbon, sesame, orange", 1400],
    ],
    "Beer & Sake": [
      ["Hite Draft", null, null, 600],
      ["Cass Pint", null, null, 600],
      ["Sapporo", null, null, 700],
      ["Asahi Super Dry", null, null, 700],
      ["Tsingtao", null, null, 600],
      ["Hakutsuru Junmai (Hot)", null, null, 1000],
      ["Hakkaisan Tokubetsu", null, null, 1400],
      ["Dassai 45 (Bottle)", null, null, 4800],
    ],
  } as Record<string, [string, string | null, string | null, number | null][]>,
  taglines: { "Korean BBQ": "Grill at Your Table", "Hot Pot": "Two Broths per Pot", "Sauce Bar": "Build Your Own", Cocktails: "Signature Pours", "Beer & Sake": "Cold Pours, Warm Bowls" },
  images: ["Sizzling Korean BBQ marbled beef on charcoal grill", "Premium marbled beef platter", "Bubbling spicy Korean hot pot", "Korean banchan side dishes"],
};

test.describe("Data integrity vs. kot-pot-i-mcallen.md", () => {
  test.afterAll(closePool);

  test("restaurant facts, hours, service types and images match the source", async () => {
    const [r] = await query<Record<string, unknown>>(`select * from restaurant_info where id = 1`);
    expect(r).toMatchObject(SOURCE.restaurant);
    expect(r.service_types).toEqual(SOURCE.serviceTypes);
    const hours = await query<{ day_of_week: number; opens_at: string; closes_at: string; is_closed: boolean }>(`select day_of_week, opens_at, closes_at, is_closed from hours where category = 'store' order by day_of_week`);
    expect(hours).toHaveLength(7);
    for (const h of hours) {
      expect(h.is_closed).toBe(false);
      expect([h.opens_at, h.closes_at]).toEqual(SOURCE.hours[h.day_of_week as 0]);
    }
    const media = await query<{ alt: string }>(`select alt from media where file like '/images/%' order by display_order`);
    expect(media.map((m) => m.alt)).toEqual(SOURCE.images);
  });

  test("all-you-can-eat pricing matches the source exactly", async () => {
    const rows = await query<{ label: string; session: string; adult_price: number; child_price: number; child_label: string }>(`select label, session, adult_price, child_price, child_label from ayce_pricing where label not like 'QA %' order by display_order`);
    expect(rows.map((r) => [r.label, r.session, r.adult_price, r.child_price])).toEqual(SOURCE.ayce);
    for (const r of rows) expect(r.child_label).toBe("Child (4–10)");
  });

  test("every source menu section and item exists with matching Korean name, description and price", async () => {
    const cats = await query<{ id: number; name: string; tagline: string }>(`select id, name, tagline from menu_categories where name not like 'QA %' order by display_order`);
    expect(cats.map((c) => c.name)).toEqual(Object.keys(SOURCE.menu));
    for (const c of cats) {
      expect(c.tagline).toBe(SOURCE.taglines[c.name as keyof typeof SOURCE.taglines]);
      const items = await query<{ name: string; korean_name: string | null; description: string | null; price: number | null }>(
        `select i.name, i.korean_name, i.description, i.price from menu_items i join menu_sections s on s.id = i.section_id where s.category_id = $1 and i.name not like 'QA %' order by i.display_order`,
        [c.id],
      );
      expect(items.map((i) => [i.name, i.korean_name, i.description, i.price])).toEqual(SOURCE.menu[c.name]);
    }
  });
});
