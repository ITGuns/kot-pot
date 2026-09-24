import "server-only";
import { asc, eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { db, schema } from "@/db";
import type { MenuCategory, MenuItem, MenuSection, Modifier, ModifierGroup } from "@/db/schema";

const { menuCategories, menuSections, menuItems, modifierGroups, modifiers, menuItemModifierGroups } = schema;

export const MENU_TAG = "menu";

export type GroupNode = ModifierGroup & { modifiers: Modifier[] };
export type ItemNode = MenuItem & { modifierGroups: GroupNode[]; categoryId: number; categorySlug: string; sectionName: string; categoryName: string };
export type SectionNode = MenuSection & { items: ItemNode[]; linkedGroup: GroupNode | null };
export type CategoryNode = MenuCategory & { sections: SectionNode[] };
export type MenuTree = { categories: CategoryNode[]; groups: GroupNode[] };

export async function readModifierGroups(includeInactive = false): Promise<GroupNode[]> {
  const [groups, mods] = await Promise.all([
    db.select().from(modifierGroups).orderBy(asc(modifierGroups.displayOrder), asc(modifierGroups.id)),
    db.select().from(modifiers).orderBy(asc(modifiers.displayOrder), asc(modifiers.id)),
  ]);
  return groups
    .filter((g) => includeInactive || g.active)
    .map((g) => ({ ...g, modifiers: mods.filter((m) => m.groupId === g.id && (includeInactive || m.active)) }));
}

export async function readMenuTree(includeInactive = false): Promise<MenuTree> {
  const [cats, secs, items, links, groups] = await Promise.all([
    db.select().from(menuCategories).orderBy(asc(menuCategories.displayOrder), asc(menuCategories.id)),
    db.select().from(menuSections).orderBy(asc(menuSections.displayOrder), asc(menuSections.id)),
    db.select().from(menuItems).orderBy(asc(menuItems.displayOrder), asc(menuItems.id)),
    db.select().from(menuItemModifierGroups).orderBy(asc(menuItemModifierGroups.displayOrder)),
    readModifierGroups(includeInactive),
  ]);
  const groupById = new Map(groups.map((g) => [g.id, g]));

  const categories: CategoryNode[] = cats
    .filter((c) => includeInactive || c.active)
    .map((c) => ({
      ...c,
      sections: secs
        .filter((s) => s.categoryId === c.id && (includeInactive || s.active))
        .map((s) => ({
          ...s,
          linkedGroup: s.linkedModifierGroupId ? (groupById.get(s.linkedModifierGroupId) ?? null) : null,
          items: items
            .filter((i) => i.sectionId === s.id && (includeInactive || i.active))
            .map((i) => ({
              ...i,
              categoryId: c.id,
              categorySlug: c.slug,
              categoryName: c.name,
              sectionName: s.name,
              modifierGroups: links
                .filter((l) => l.itemId === i.id)
                .map((l) => groupById.get(l.groupId))
                .filter((g): g is GroupNode => Boolean(g)),
            })),
        })),
    }));

  return { categories, groups };
}

export function flattenItems(tree: MenuTree): ItemNode[] {
  return tree.categories.flatMap((c) => c.sections.flatMap((s) => s.items));
}

export async function readItem(id: number): Promise<ItemNode | null> {
  return flattenItems(await readMenuTree(true)).find((i) => i.id === id) ?? null;
}

export async function readItemBySlug(slug: string): Promise<ItemNode | null> {
  return flattenItems(await readMenuTree(true)).find((i) => i.slug === slug) ?? null;
}

export async function readCategories(): Promise<MenuCategory[]> {
  return db.select().from(menuCategories).orderBy(asc(menuCategories.displayOrder));
}

export async function readSections(categoryId?: number): Promise<MenuSection[]> {
  const q = db.select().from(menuSections).orderBy(asc(menuSections.displayOrder));
  return categoryId ? q.where(eq(menuSections.categoryId, categoryId)) : q;
}

/* Cached public reads */
export const getMenuTree = cache(unstable_cache(() => readMenuTree(false), ["menu-tree"], { tags: [MENU_TAG] }));

export const getFeaturedItems = cache(async (): Promise<ItemNode[]> => flattenItems(await getMenuTree()).filter((i) => i.featured));
