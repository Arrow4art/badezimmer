import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminPassword, createSessionToken, passwordsMatch } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const expected = adminPassword();
  if (!expected) {
    return NextResponse.json({ error: "Die Verwaltung ist nicht konfiguriert." }, { status: 503 });
  }
  let password = "";
  try {
    const body = (await request.json()) as { password?: unknown };
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    password = "";
  }
  if (!passwordsMatch(password, expected)) {
    return NextResponse.json({ error: "Das Passwort ist nicht korrekt." }, { status: 401 });
  }
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return NextResponse.json({ ok: true });
}
