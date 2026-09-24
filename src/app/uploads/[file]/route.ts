import { eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { db, schema } from "@/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Serves admin-uploaded images stored in the `uploads` table. */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ file: string }> }) {
  const { file } = await ctx.params;
  if (!/^[a-zA-Z0-9._-]{1,120}$/.test(file)) return new NextResponse("Not found", { status: 404 });
  const [row] = await db.select({ mime: schema.uploads.mime, data: schema.uploads.data }).from(schema.uploads).where(eq(schema.uploads.name, file)).limit(1);
  if (!row) return new NextResponse("Not found", { status: 404 });
  return new NextResponse(new Uint8Array(row.data), {
    headers: {
      "Content-Type": row.mime,
      "Content-Length": String(row.data.length),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
