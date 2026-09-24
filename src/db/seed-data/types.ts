import type { AvailabilityType, DietaryTag, HoursCategory, SectionType } from "../schema";

/** dollars → cents */
export const $ = (dollars: number) => Math.round(dollars * 100);

export const SUN = 0, MON = 1, TUE = 2, WED = 3, THU = 4, FRI = 5, SAT = 6;

export type SeedModifier = {
  name: string;
  price?: number; // cents, default 0 (included)
  description?: string;
  dietary?: DietaryTag[];
  note?: string;
  days?: number[];
};

export type SeedModifierGroup = {
  key: string;
  name: string;
  description?: string;
  required?: boolean;
  min?: number;
  max?: number;
  modifiers: SeedModifier[];
};

export type SeedAvailability = {
  type?: AvailabilityType;
  days?: number[];
  start?: string;
  end?: string;
  note?: string;
};

export type SeedItem = {
  name: string;
  korean?: string;
  slug?: string;
  price?: number | null; // cents; null/undefined = no price shown
  priceNote?: string;
  description?: string;
  dietary?: DietaryTag[];
  notes?: string;
  availability?: SeedAvailability;
  image?: string;
  imageAlt?: string;
  featured?: boolean;
  modifierGroups?: string[];
};

export type SeedSection = {
  name: string;
  slug?: string;
  description?: string;
  type?: SectionType;
  linkedGroup?: string;
  items?: SeedItem[];
};

export type SeedCategory = {
  name: string;
  slug: string;
  tagline?: string;
  description?: string;
  hoursNote?: string;
  hoursCategory?: HoursCategory;
  days?: number[];
  start?: string;
  end?: string;
  image?: string;
  sections: SeedSection[];
};
