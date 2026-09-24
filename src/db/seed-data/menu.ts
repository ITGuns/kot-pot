/**
 * Full menu transcription from kot-pot-i-mcallen.md ("The Menu — Korean Style Barbecue").
 * Prices are cents. Do not "improve" names, Korean names, prices or descriptions
 * here — this file mirrors the source exactly.
 */
import { $, type SeedCategory } from "./types";

export const MENU: SeedCategory[] = [
  {
    name: "Korean BBQ",
    slug: "korean-bbq",
    tagline: "Grill at Your Table",
    hoursCategory: "store",
    image: "/images/meat-platter.jpg",
    sections: [
      {
        name: "BBQ Meats",
        description: "Grill at Your Table",
        items: [
          { name: "Sliced Beef Brisket", korean: "차돌박이", description: "Thinly shaved, melts on the grill", price: $(14), featured: true },
          { name: "Marinated Beef Bulgogi", korean: "불고기", description: "Sweet soy, garlic, sesame", price: $(15), featured: true },
          { name: "Sliced Pork Belly", korean: "삼겹살", description: "Thick-cut, crisp & juicy", price: $(13), featured: true },
          { name: "Spicy Pork", korean: "제육볶음", description: "Gochujang glazed pork shoulder", price: $(13) },
          { name: "Sliced Chicken", korean: "닭갈비", description: "House marinade, charred edges", price: $(11) },
          { name: "Beef Short Rib (LA Galbi)", korean: "LA갈비", description: "Cross-cut, soy-marinated", price: $(18), featured: true },
          { name: "Spicy Squid", korean: "오징어볶음", description: "Tender, fiery glaze", price: $(12) },
          { name: "Shrimp Skewers", korean: "새우꼬치", description: "Garlic butter brushed", price: $(13) },
        ],
      },
    ],
  },
  {
    name: "Hot Pot",
    slug: "hot-pot",
    tagline: "Two Broths per Pot",
    hoursCategory: "store",
    image: "/images/hotpot.jpg",
    sections: [
      {
        name: "Hot Pot Broths",
        description: "Two Broths per Pot",
        items: [
          { name: "Spicy Sichuan Mala", description: "Numbing chili, star anise, cassia", price: $(8), featured: true },
          { name: "Tomato Comfort", description: "Slow-simmered tomato & pork bone", price: $(8) },
          { name: "Mushroom Forest", description: "Six wild mushrooms, herb infusion", price: $(8) },
          { name: "Korean Kimchi", description: "Aged kimchi & gochugaru base", price: $(8), featured: true },
          { name: "Tom Yum", description: "Lemongrass, galangal, lime leaf", price: $(8) },
          { name: "Pork Bone (Tonkotsu)", description: "18-hour rich, milky broth", price: $(8) },
        ],
      },
    ],
  },
  {
    name: "Sauce Bar",
    slug: "sauce-bar",
    tagline: "Build Your Own",
    hoursCategory: "store",
    image: "/images/banchan.jpg",
    sections: [
      {
        name: "Sauce Bar",
        description: "Build Your Own",
        items: [
          { name: "House Sesame", description: "Toasted sesame paste, garlic oil" },
          { name: "Korean Ssamjang", description: "Fermented bean & chili" },
          { name: "Garlic Soy", description: "Aged shoyu, fresh garlic, scallion" },
          { name: "Spicy Chili Crisp", description: "Sichuan peppercorn, dried chili" },
          { name: "Ponzu Citrus", description: "Yuzu, soy, mirin" },
          { name: "Sweet & Sour Plum", description: "Aged plum reduction" },
        ],
      },
    ],
  },
  {
    name: "Cocktails",
    slug: "cocktails",
    tagline: "Signature Pours",
    hoursCategory: "store",
    sections: [
      {
        name: "Cocktails",
        description: "Signature Pours",
        items: [
          { name: "Cherry Soju Spritz", description: "Soju, cherry, yuzu sparkle", price: $(12), featured: true },
          { name: "Peach Makgeolli", description: "Rice wine, white peach", price: $(11) },
          { name: "Korean Ember", description: "Smoked whiskey, gochujang honey", price: $(14), featured: true },
          { name: "Lychee Martini", description: "Soju, lychee, lime", price: $(12) },
          { name: "Drunken Yuzu", description: "Gin, yuzu, elderflower", price: $(13) },
          { name: "Hot Pot Old Fashioned", description: "Bourbon, sesame, orange", price: $(14) },
        ],
      },
    ],
  },
  {
    name: "Beer & Sake",
    slug: "beer-sake",
    tagline: "Cold Pours, Warm Bowls",
    hoursCategory: "store",
    sections: [
      {
        name: "Beer & Sake",
        description: "Cold Pours, Warm Bowls",
        items: [
          { name: "Hite Draft", price: $(6) },
          { name: "Cass Pint", price: $(6) },
          { name: "Sapporo", price: $(7) },
          { name: "Asahi Super Dry", price: $(7) },
          { name: "Tsingtao", price: $(6) },
          { name: "Hakutsuru Junmai (Hot)", price: $(10) },
          { name: "Hakkaisan Tokubetsu", price: $(14) },
          { name: "Dassai 45 (Bottle)", price: $(48) },
        ],
      },
    ],
  },
];
