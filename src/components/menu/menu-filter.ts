import type { DietaryTag } from "@/db/schema";
import type { AvailabilityInfo } from "@/lib/availability";
import { DIETARY_FILTERS, type DietaryFilterKey } from "@/lib/constants";
import type { CategoryNode, ItemNode, SectionNode } from "@/lib/data/menu";

export type MenuFilters = {
  query: string;
  dietary: DietaryFilterKey[];
  availableNow: boolean;
  featured: boolean;
};

export const EMPTY_FILTERS: MenuFilters = { query: "", dietary: [], availableNow: false, featured: false };

export function hasActiveFilters(f: MenuFilters): boolean {
  return Boolean(f.query.trim()) || f.dietary.length > 0 || f.availableNow || f.featured;
}

export function matchesDietary(tags: DietaryTag[], keys: DietaryFilterKey[]): boolean {
  return keys.every((k) => {
    const def = DIETARY_FILTERS.find((d) => d.key === k)!;
    return tags.some((t) => (def.matches as readonly DietaryTag[]).includes(t));
  });
}

const norm = (s: string) => s.toLowerCase().normalize("NFKC").replace(/\s+/g, " ").trim();

/** Name, Korean name, description, section, category, notes and modifier names all count. */
export function itemMatches(item: ItemNode, f: MenuFilters, availability: Record<number, AvailabilityInfo>): boolean {
  if (f.featured && !item.featured) return false;
  if (f.dietary.length && !matchesDietary(item.dietaryTags, f.dietary)) return false;
  if (f.availableNow && !availability[item.id]?.availableNow) return false;
  const q = norm(f.query);
  if (q) {
    const hay = norm(
      [item.name, item.koreanName, item.description, item.sectionName, item.categoryName, item.notes, ...item.modifierGroups.flatMap((g) => g.modifiers.map((m) => m.name))]
        .filter(Boolean)
        .join(" "),
    );
    if (!q.split(" ").every((word) => hay.includes(word))) return false;
  }
  return true;
}

export type FilteredSection = SectionNode & { items: ItemNode[] };
export type FilteredCategory = CategoryNode & { sections: FilteredSection[]; itemCount: number };

export function applyFilters(categories: CategoryNode[], f: MenuFilters, availability: Record<number, AvailabilityInfo>): FilteredCategory[] {
  const active = hasActiveFilters(f);
  return categories.map((c) => {
    const sections = c.sections
      .map((s) => ({ ...s, items: active ? s.items.filter((i) => itemMatches(i, f, availability)) : s.items }))
      .filter((s) => s.items.length > 0 || (!active && s.sectionType === "addons" && s.linkedGroup));
    return { ...c, sections, itemCount: sections.reduce((n, s) => n + s.items.length, 0) };
  });
}
