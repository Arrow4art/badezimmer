import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "bz_admin";

export function adminPassword(): string | null {
  if (process.env.ADMIN_PASSWORD) return process.env.ADMIN_PASSWORD;
  if (process.env.NODE_ENV !== "production") return "demo-iwoody";
  return null;
}

export function devPasswordHint(): boolean {
  return !process.env.ADMIN_PASSWORD && process.env.NODE_ENV !== "production";
}

function secret(): string {
  return process.env.ADMIN_SECRET || adminPassword() || "iwoody-dev-secret";
}

function digest(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

export function passwordsMatch(input: string, expected: string): boolean {
  return timingSafeEqual(digest(input), digest(expected));
}

export function createSessionToken(): string {
  const exp = Date.now() + 1000 * 60 * 60 * 12;
  const payload = `v1.${exp}`;
  const signature = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function sessionTokenValid(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [version, expRaw, signature] = parts;
  const payload = `${version}.${expRaw}`;
  const expected = createHmac("sha256", secret()).update(payload).digest("base64url");
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return false;
  const exp = Number(expRaw);
  return Number.isFinite(exp) && exp > Date.now();
}

export async function isAdmin(): Promise<boolean> {
  const jar = await cookies();
  return sessionTokenValid(jar.get(ADMIN_COOKIE)?.value);
}
