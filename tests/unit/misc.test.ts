import { describe, expect, it } from "vitest";
import { buildIcs, googleCalendarUrl } from "@/lib/calendar";
import { imageSize } from "@/lib/image-size";
import { hashPassword, verifyPassword } from "@/lib/password";
import { slugify } from "@/lib/slug";
import { applyFilters, itemMatches, matchesDietary } from "@/components/menu/menu-filter";
import type { CategoryNode, ItemNode } from "@/lib/data/menu";
import { category, item } from "./fixtures";

describe("password hashing", () => {
  it("verifies the right password and rejects others", () => {
    const stored = hashPassword("correct horse battery");
    expect(stored).toMatch(/^[0-9a-f]{32}:[0-9a-f]{128}$/);
    expect(verifyPassword("correct horse battery", stored)).toBe(true);
    expect(verifyPassword("wrong", stored)).toBe(false);
    expect(verifyPassword("anything", "garbage")).toBe(false);
  });
});

describe("slugify", () => {
  it("makes URL-safe slugs from the source item names", () => {
    expect(slugify("Beef Short Rib (LA Galbi)")).toBe("beef-short-rib-la-galbi");
    expect(slugify("Sweet & Sour Plum")).toBe("sweet-and-sour-plum");
    expect(slugify("Pork Bone (Tonkotsu)")).toBe("pork-bone-tonkotsu");
    expect(slugify("Dassai 45 (Bottle)")).toBe("dassai-45-bottle");
  });
});

describe("calendar links", () => {
  const event = { title: "Kot Pot I: table for 4", description: "Reservation KP-10001", location: "400 W Nolana Ave Ste V", date: "2026-09-26", time: "19:00", durationMinutes: 90, uid: "KP-10001@kotpot", url: "https://example.com/book/KP-10001", timezone: "America/Chicago" };
  it("builds a Google Calendar URL in the restaurant timezone", () => {
    const u = new URL(googleCalendarUrl(event));
    expect(u.searchParams.get("dates")).toBe("20260926T190000/20260926T203000");
    expect(u.searchParams.get("ctz")).toBe("America/Chicago");
    expect(u.searchParams.get("text")).toBe(event.title);
  });
  it("builds a valid ICS with TZID and escaping", () => {
    const ics = buildIcs({ ...event, description: "Party of 4; bring cake, please" });
    expect(ics).toContain("PRODID:-//Kot Pot I//Reservations//EN");
    expect(ics).toContain("DTSTART;TZID=America/Chicago:20260926T190000");
    expect(ics).toContain("DTEND;TZID=America/Chicago:20260926T203000");
    expect(ics).toContain("DESCRIPTION:Party of 4\; bring cake\\, please");
    expect(ics.split("\r\n").at(-1)).toBe("END:VCALENDAR");
  });
});

describe("image-size", () => {
  it("reads PNG, JPEG and WebP headers", () => {
    const png = Buffer.alloc(32);
    png.write("\x89PNG\r\n\x1a\n", 0, "binary");
    png.writeUInt32BE(13, 8);
    png.write("IHDR", 12);
    png.writeUInt32BE(1024, 16);
    png.writeUInt32BE(768, 20);
    expect(imageSize(png, "image/png")).toEqual({ width: 1024, height: 768 });

    const jpg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x04, 0x00, 0x00, 0xff, 0xc0, 0x00, 0x11, 0x08, 0x04, 0x38, 0x07, 0x80, 0x03, 0x01, 0x22, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01]);
    expect(imageSize(jpg, "image/jpeg")).toEqual({ width: 1920, height: 1080 });

    const webp = Buffer.alloc(30);
    webp.write("RIFF", 0);
    webp.write("WEBP", 8);
    webp.write("VP8X", 12);
    webp.writeUIntLE(1599, 24, 3);
    webp.writeUIntLE(899, 27, 3);
    expect(imageSize(webp, "image/webp")).toEqual({ width: 1600, height: 900 });

    expect(imageSize(Buffer.from("not an image"), "image/png")).toBeNull();
  });
});

describe("menu filters", () => {
  const node = (over: Partial<ItemNode>): ItemNode => ({ ...item(), modifierGroups: [], categoryId: 1, categorySlug: "korean-bbq", categoryName: "Korean BBQ", sectionName: "BBQ Meats", ...over });
  const brisket = node({ id: 1 });
  const belly = node({ id: 2, name: "Sliced Pork Belly", koreanName: "삼겹살", description: "Thick-cut, crisp & juicy", dietaryTags: ["gluten-free"] });
  const squid = node({ id: 3, name: "Spicy Squid", koreanName: "오징어볶음", description: "Tender, fiery glaze", dietaryTags: ["spicy", "contains-shellfish"] });
  const availability = { 1: { availableNow: true, availableToday: true, label: null, detail: null }, 2: { availableNow: false, availableToday: true, label: null, detail: null }, 3: { availableNow: true, availableToday: true, label: null, detail: null } };
  const none = { query: "", dietary: [] as never[], availableNow: false, featured: false };

  it("matches dietary filters including vegan ⊂ vegetarian", () => {
    expect(matchesDietary(["vegan"], ["vegetarian"])).toBe(true);
    expect(matchesDietary(["vegetarian"], ["vegan"])).toBe(false);
    expect(matchesDietary(squid.dietaryTags, ["spicy"])).toBe(true);
  });
  it("searches English names, Korean names, descriptions and sections", () => {
    expect(itemMatches(brisket, { ...none, query: "brisket" }, availability)).toBe(true);
    expect(itemMatches(belly, { ...none, query: "삼겹살" }, availability)).toBe(true);
    expect(itemMatches(belly, { ...none, query: "brisket" }, availability)).toBe(false);
    expect(itemMatches(squid, { ...none, query: "fiery glaze" }, availability)).toBe(true);
    expect(itemMatches(brisket, { ...none, query: "bbq meats" }, availability)).toBe(true);
  });
  it("applies availability and dietary filters", () => {
    const tree: CategoryNode[] = [{ ...category(), sections: [{ id: 1, categoryId: 1, name: "BBQ Meats", slug: "bbq-meats", description: null, sectionType: "items", linkedModifierGroupId: null, displayOrder: 0, active: true, createdAt: "", updatedAt: "", linkedGroup: null, items: [brisket, belly, squid] }] }];
    expect(applyFilters(tree, { ...none, dietary: ["gluten-free"], availableNow: true }, availability)[0].itemCount).toBe(0); // belly is GF but not available now
    expect(applyFilters(tree, { ...none, dietary: ["spicy"] }, availability)[0].sections[0].items.map((i) => i.name)).toEqual(["Spicy Squid"]);
    expect(applyFilters(tree, none, availability)[0].itemCount).toBe(3);
  });
});
