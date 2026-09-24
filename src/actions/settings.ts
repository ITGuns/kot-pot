"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { revalidateContent } from "@/lib/revalidate";
import { bookingSettingsInput, fieldErrors, restaurantInfoInput } from "@/lib/validation";
import { fail, type ActionResult } from "./types";

const { bookingSettings, restaurantInfo } = schema;

async function guard(): Promise<ActionResult<never> | null> {
  try {
    await requireAdmin();
    return null;
  } catch {
    return fail("Your session has expired. Please sign in again.", { code: "unauthorized" });
  }
}

export async function saveBookingSettings(raw: unknown): Promise<ActionResult> {
  const g = await guard();
  if (g) return g;
  const p = bookingSettingsInput.safeParse(raw);
  if (!p.success) return fail("Please check the highlighted fields.", { fieldErrors: fieldErrors(p.error) });
  if (p.data.maxPartySize < p.data.minPartySize) return fail("Max party size must be ≥ min.", { fieldErrors: { maxPartySize: "Must be ≥ min" } });
  await db.update(bookingSettings).set({ ...p.data, updatedAt: new Date().toISOString() }).where(eq(bookingSettings.id, 1));
  revalidateContent();
  revalidatePath("/admin/settings");
  return { ok: true, data: undefined };
}

export async function saveRestaurantInfo(raw: unknown): Promise<ActionResult> {
  const g = await guard();
  if (g) return g;
  const p = restaurantInfoInput.safeParse(raw);
  if (!p.success) return fail("Please check the highlighted fields.", { fieldErrors: fieldErrors(p.error) });
  await db.update(restaurantInfo).set({ ...p.data, updatedAt: new Date().toISOString() }).where(eq(restaurantInfo.id, 1));
  revalidateContent();
  revalidatePath("/admin/settings");
  return { ok: true, data: undefined };
}
