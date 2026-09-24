import "server-only";
import { SignJWT } from "jose/jwt/sign";
import { jwtVerify } from "jose/jwt/verify";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

export const SESSION_COOKIE = "sm_admin";
const SESSION_TTL_SEC = 60 * 60 * 24 * 7; // 7 days

export type AdminSession = { sub: number; email: string; name: string; role: string };

function secret(): Uint8Array {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) throw new Error("SESSION_SECRET must be set (16+ chars) in .env.local");
  return new TextEncoder().encode(s);
}

export async function createSession(user: AdminSession): Promise<void> {
  const token = await new SignJWT({ email: user.email, name: user.name, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(user.sub))
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SEC}s`)
    .sign(secret());
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SEC,
  });
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function verifySessionToken(token: string | undefined): Promise<AdminSession | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    if (!payload.sub) return null;
    return {
      sub: Number(payload.sub),
      email: String(payload.email ?? ""),
      name: String(payload.name ?? ""),
      role: String(payload.role ?? "admin"),
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<AdminSession | null> {
  const jar = await cookies();
  return verifySessionToken(jar.get(SESSION_COOKIE)?.value);
}

/** Use in server actions + route handlers: throws if not authenticated. */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHORIZED");
  return session;
}

/** Use in admin pages/layouts: redirects to login. */
export async function requireAdminPage(): Promise<AdminSession> {
  const session = await getSession();
  if (!session) {
    const h = await headers();
    const next = h.get("x-pathname") ?? "/admin";
    redirect(`/admin/login?next=${encodeURIComponent(next)}`);
  }
  return session;
}

export async function clientKey(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return fwd || h.get("x-real-ip") || "local";
}
