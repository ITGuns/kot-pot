"use server";

import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import type { AycePricing } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { nextOrder, reorderRows } from "@/lib/data/order";
import { toMinutes } from "@/lib/format";
import { revalidateContent } from "@/lib/revalidate";
import { ayceInput, fieldErrors } from "@/lib/validation";
import { fail, type ActionResult } from "./types";

const { aycePricing } = schema;

async function guard(): Promise<ActionResult<never> | null> {
  try {
    await requireAdmin();
    return null;
  } catch {
    return fail("Your session has expired. Please sign in again.", { code: "unauthorized" });
  }
}

export async function saveAyceRow(raw: unknown): Promise<ActionResult<AycePricing>> {
  const g = await guard();
  if (g) return g;
  const p = ayceInput.safeParse(raw);
  if (!p.success) return fail("Please check the highlighted fields.", { fieldErrors: fieldErrors(p.error) });
  const d = p.data;
  if (d.days.length === 0 && !d.includesHolidays) return fail("Pick at least one day (or holidays).", { fieldErrors: { days: "Choose at least one day" } });
  if (d.startTime && d.endTime && toMinutes(d.endTime) <= toMinutes(d.startTime)) return fail("End time must be after start time.", { fieldErrors: { endTime: "Must be after start" } });
  const values = {
    label: d.label,
    days: d.days,
    includesHolidays: d.includesHolidays,
    session: d.session,
    startTime: d.startTime ?? null,
    endTime: d.endTime ?? null,
    adultPrice: d.adultPrice!,
    childPrice: d.childPrice,
    childLabel: d.childLabel,
    note: d.note ?? null,
    active: d.active,
    updatedAt: new Date().toISOString(),
  };
  let row: AycePricing | undefined;
  if (d.id) [row] = await db.update(aycePricing).set(values).where(eq(aycePricing.id, d.id)).returning();
  else [row] = await db.insert(aycePricing).values({ ...values, displayOrder: await nextOrder("ayce_pricing") }).returning();
  if (!row) return fail("Pricing row not found.");
  revalidateContent();
  return { ok: true, data: row };
}

export async function deleteAyceRow(id: number): Promise<ActionResult> {
  const g = await guard();
  if (g) return g;
  await db.delete(aycePricing).where(eq(aycePricing.id, id));
  revalidateContent();
  return { ok: true, data: undefined };
}

export async function reorderAyce(ids: number[]): Promise<ActionResult> {
  const g = await guard();
  if (g) return g;
  await reorderRows("ayce_pricing", ids);
  revalidateContent();
  return { ok: true, data: undefined };
}
