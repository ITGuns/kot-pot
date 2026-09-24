"use server";

import { and, eq, ne, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { nextOrder, reorderRows } from "@/lib/data/order";
import { revalidateMenu } from "@/lib/revalidate";
import { slugify } from "@/lib/slug";
import { categoryInput, fieldErrors, menuItemInput, modifierGroupInput, modifierInput, sectionInput } from "@/lib/validation";
import { fail, type ActionResult } from "./types";

const { menuCategories, menuSections, menuItems, modifierGroups, modifiers, menuItemModifierGroups } = schema;
const now = () => new Date().toISOString();

async function guard(): Promise<ActionResult<never> | null> {
  try {
    await requireAdmin();
    return null;
  } catch {
    return fail("Your session has expired. Please sign in again.", { code: "unauthorized" });
  }
}

async function uniqueSlug(base: string, exists: (slug: string) => Promise<boolean>): Promise<string> {
  let slug = slugify(base) || "item";
  let i = 2;
  while (await exists(slug)) slug = `${slugify(base)}-${i++}`;
  return slug;
}

/* ---------------- Categories ---------------- */

export async function saveCategory(raw: unknown): Promise<ActionResult<{ id: number }>> {
  const g = await guard();
  if (g) return g;
  const parsed = categoryInput.safeParse(raw);
  if (!parsed.success) return fail("Please check the highlighted fields.", { fieldErrors: fieldErrors(parsed.error) });
  const d = parsed.data;
  const values = {
    name: d.name,
    tagline: d.tagline ?? null,
    description: d.description ?? null,
    hoursNote: d.hoursNote ?? null,
    hoursCategory: d.hoursCategory,
    availableDays: d.availableDays ?? null,
    startTime: d.startTime ?? null,
    endTime: d.endTime ?? null,
    image: d.image ?? null,
    active: d.active,
    updatedAt: now(),
  };
  if (d.id) {
    await db.update(menuCategories).set(values).where(eq(menuCategories.id, d.id));
    revalidateMenu();
    return { ok: true, data: { id: d.id } };
  }
  const slug = await uniqueSlug(d.slug || d.name, async (s) => (await db.select({ id: menuCategories.id }).from(menuCategories).where(eq(menuCategories.slug, s)).limit(1)).length > 0);
  const [row] = await db.insert(menuCategories).values({ ...values, slug, displayOrder: await nextOrder("menu_categories") }).returning({ id: menuCategories.id });
  revalidateMenu();
  return { ok: true, data: { id: row.id } };
}

export async function deleteCategory(id: number): Promise<ActionResult> {
  const g = await guard();
  if (g) return g;
  await db.delete(menuCategories).where(eq(menuCategories.id, id));
  revalidateMenu();
  return { ok: true, data: undefined };
}

export async function reorderCategories(ids: number[]): Promise<ActionResult> {
  const g = await guard();
  if (g) return g;
  await reorderRows("menu_categories", ids);
  revalidateMenu();
  return { ok: true, data: undefined };
}

/* ---------------- Sections ---------------- */

export async function saveSection(raw: unknown): Promise<ActionResult<{ id: number }>> {
  const g = await guard();
  if (g) return g;
  const parsed = sectionInput.safeParse(raw);
  if (!parsed.success) return fail("Please check the highlighted fields.", { fieldErrors: fieldErrors(parsed.error) });
  const d = parsed.data;
  const values = {
    categoryId: d.categoryId,
    name: d.name,
    description: d.description ?? null,
    sectionType: d.sectionType,
    linkedModifierGroupId: d.sectionType === "addons" ? (d.linkedModifierGroupId ?? null) : null,
    active: d.active,
    updatedAt: now(),
  };
  if (d.id) {
    await db.update(menuSections).set(values).where(eq(menuSections.id, d.id));
    revalidateMenu();
    return { ok: true, data: { id: d.id } };
  }
  const slug = await uniqueSlug(
    d.name,
    async (s) => (await db.select({ id: menuSections.id }).from(menuSections).where(and(eq(menuSections.categoryId, d.categoryId), eq(menuSections.slug, s))).limit(1)).length > 0,
  );
  const displayOrder = await nextOrder("menu_sections", sql` where category_id = ${d.categoryId}`);
  const [row] = await db.insert(menuSections).values({ ...values, slug, displayOrder }).returning({ id: menuSections.id });
  revalidateMenu();
  return { ok: true, data: { id: row.id } };
}

export async function deleteSection(id: number): Promise<ActionResult> {
  const g = await guard();
  if (g) return g;
  await db.delete(menuSections).where(eq(menuSections.id, id));
  revalidateMenu();
  return { ok: true, data: undefined };
}

export async function reorderSections(ids: number[]): Promise<ActionResult> {
  const g = await guard();
  if (g) return g;
  await reorderRows("menu_sections", ids);
  revalidateMenu();
  return { ok: true, data: undefined };
}

/* ---------------- Items ---------------- */

export async function saveMenuItem(raw: unknown): Promise<ActionResult<{ id: number }>> {
  const g = await guard();
  if (g) return g;
  const parsed = menuItemInput.safeParse(raw);
  if (!parsed.success) return fail("Please check the highlighted fields.", { fieldErrors: fieldErrors(parsed.error) });
  const d = parsed.data;
  if ((d.availabilityType === "days" || d.availabilityType === "schedule") && (!d.availableDays || d.availableDays.length === 0)) {
    return fail("Pick at least one day for day-specific availability.", { fieldErrors: { availableDays: "Choose at least one day" } });
  }
  const timed = d.availabilityType === "days" || d.availabilityType === "schedule";
  const values = {
    sectionId: d.sectionId,
    name: d.name,
    koreanName: d.koreanName ?? null,
    description: d.description ?? null,
    price: d.price,
    priceNote: d.priceNote ?? null,
    image: d.image ?? null,
    imageAlt: d.imageAlt ?? null,
    dietaryTags: d.dietaryTags,
    availabilityType: d.availabilityType,
    availableDays: timed ? (d.availableDays ?? null) : null,
    availableStartTime: timed ? (d.availableStartTime ?? null) : null,
    availableEndTime: timed ? (d.availableEndTime ?? null) : null,
    availabilityNote: d.availabilityNote ?? null,
    notes: d.notes ?? null,
    featured: d.featured,
    active: d.active,
    updatedAt: now(),
  };

  const id = await db.transaction(async (tx) => {
    let itemId = d.id;
    if (itemId) {
      await tx.update(menuItems).set(values).where(eq(menuItems.id, itemId));
    } else {
      const slug = await uniqueSlug(d.slug || d.name, async (s) => (await tx.select({ id: menuItems.id }).from(menuItems).where(eq(menuItems.slug, s)).limit(1)).length > 0);
      const { rows } = await tx.execute<{ m: number }>(sql`select coalesce(max(display_order), -1)::int as m from menu_items where section_id = ${d.sectionId}`);
      const [row] = await tx.insert(menuItems).values({ ...values, slug, displayOrder: (rows[0]?.m ?? -1) + 1 }).returning({ id: menuItems.id });
      itemId = row.id;
    }
    await tx.delete(menuItemModifierGroups).where(eq(menuItemModifierGroups.itemId, itemId));
    if (d.modifierGroupIds.length) {
      await tx.insert(menuItemModifierGroups).values(d.modifierGroupIds.map((groupId, i) => ({ itemId: itemId!, groupId, displayOrder: i })));
    }
    return itemId;
  });
  revalidateMenu();
  return { ok: true, data: { id } };
}

export async function deleteMenuItem(id: number): Promise<ActionResult> {
  const g = await guard();
  if (g) return g;
  await db.delete(menuItems).where(eq(menuItems.id, id));
  revalidateMenu();
  return { ok: true, data: undefined };
}

export async function setItemFlag(id: number, field: "active" | "featured", value: boolean): Promise<ActionResult> {
  const g = await guard();
  if (g) return g;
  await db.update(menuItems).set({ [field]: value, updatedAt: now() }).where(eq(menuItems.id, id));
  revalidateMenu();
  return { ok: true, data: undefined };
}

export async function reorderItems(sectionId: number, ids: number[]): Promise<ActionResult> {
  const g = await guard();
  if (g) return g;
  await reorderRows("menu_items", ids, sql`, section_id = ${sectionId}`);
  revalidateMenu();
  return { ok: true, data: undefined };
}

export async function duplicateMenuItem(id: number): Promise<ActionResult<{ id: number }>> {
  const g = await guard();
  if (g) return g;
  const [src] = await db.select().from(menuItems).where(eq(menuItems.id, id)).limit(1);
  if (!src) return fail("Item not found.");
  const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = src;
  const slug = await uniqueSlug(`${src.name} copy`, async (s) => (await db.select({ id: menuItems.id }).from(menuItems).where(eq(menuItems.slug, s)).limit(1)).length > 0);
  const [row] = await db
    .insert(menuItems)
    .values({ ...rest, name: `${src.name} (copy)`, slug, active: false, featured: false, displayOrder: src.displayOrder + 1 })
    .returning({ id: menuItems.id });
  const links = await db.select().from(menuItemModifierGroups).where(eq(menuItemModifierGroups.itemId, id));
  if (links.length) await db.insert(menuItemModifierGroups).values(links.map((l) => ({ ...l, itemId: row.id })));
  revalidateMenu();
  return { ok: true, data: { id: row.id } };
}

/* ---------------- Modifier groups + modifiers ---------------- */

export async function saveModifierGroup(raw: unknown): Promise<ActionResult<{ id: number }>> {
  const g = await guard();
  if (g) return g;
  const parsed = modifierGroupInput.safeParse(raw);
  if (!parsed.success) return fail("Please check the highlighted fields.", { fieldErrors: fieldErrors(parsed.error) });
  const d = parsed.data;
  if (d.maxSelections < d.minSelections) return fail("Max selections must be ≥ min selections.", { fieldErrors: { maxSelections: "Must be ≥ min" } });
  const values = { name: d.name, description: d.description ?? null, required: d.required, minSelections: d.minSelections, maxSelections: d.maxSelections, active: d.active, updatedAt: now() };
  if (d.id) {
    await db.update(modifierGroups).set(values).where(eq(modifierGroups.id, d.id));
    revalidateMenu();
    return { ok: true, data: { id: d.id } };
  }
  const [row] = await db.insert(modifierGroups).values({ ...values, key: slugify(d.name), displayOrder: await nextOrder("modifier_groups") }).returning({ id: modifierGroups.id });
  revalidateMenu();
  return { ok: true, data: { id: row.id } };
}

export async function deleteModifierGroup(id: number): Promise<ActionResult> {
  const g = await guard();
  if (g) return g;
  await db.delete(modifierGroups).where(eq(modifierGroups.id, id));
  revalidateMenu();
  return { ok: true, data: undefined };
}

export async function saveModifier(raw: unknown): Promise<ActionResult<{ id: number }>> {
  const g = await guard();
  if (g) return g;
  const parsed = modifierInput.safeParse(raw);
  if (!parsed.success) return fail("Please check the highlighted fields.", { fieldErrors: fieldErrors(parsed.error) });
  const d = parsed.data;
  const values = {
    groupId: d.groupId,
    name: d.name,
    description: d.description ?? null,
    priceAdjustment: d.priceAdjustment,
    dietaryTags: d.dietaryTags,
    availabilityNote: d.availabilityNote ?? null,
    availableDays: d.availableDays ?? null,
    active: d.active,
    updatedAt: now(),
  };
  if (d.id) {
    await db.update(modifiers).set(values).where(eq(modifiers.id, d.id));
    revalidateMenu();
    return { ok: true, data: { id: d.id } };
  }
  const displayOrder = await nextOrder("modifiers", sql` where group_id = ${d.groupId}`);
  const [row] = await db.insert(modifiers).values({ ...values, displayOrder }).returning({ id: modifiers.id });
  revalidateMenu();
  return { ok: true, data: { id: row.id } };
}

export async function deleteModifier(id: number): Promise<ActionResult> {
  const g = await guard();
  if (g) return g;
  await db.delete(modifiers).where(eq(modifiers.id, id));
  revalidateMenu();
  return { ok: true, data: undefined };
}

export async function reorderModifiers(ids: number[]): Promise<ActionResult> {
  const g = await guard();
  if (g) return g;
  await reorderRows("modifiers", ids);
  revalidateMenu();
  return { ok: true, data: undefined };
}

export async function itemSlugExists(slug: string, exceptId?: number): Promise<boolean> {
  await requireAdmin();
  const rows = await db
    .select({ id: menuItems.id })
    .from(menuItems)
    .where(exceptId ? and(eq(menuItems.slug, slug), ne(menuItems.id, exceptId)) : eq(menuItems.slug, slug))
    .limit(1);
  return rows.length > 0;
}
