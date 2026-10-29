import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { unstable_noStore as noStore } from "next/cache";
import { getRedis } from "@/lib/kv";

// One Redis hash per shop day (product slug → clicks on "In den Warenkorb"). No visitor data is stored.
const KEY_PREFIX = "badezimmer:cart-adds:";
const KEEP_DAYS = 120;
const filePath = path.join(process.cwd(), "data", "cart-adds.json");

export type CartAddDay = { day: string; counts: Record<string, number> };

/** Calendar day in German time, as YYYY-MM-DD. */
export function shopDay(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin" }).format(date);
}

function lastDays(count: number): string[] {
  const now = Date.now();
  return Array.from({ length: count }, (_, index) => shopDay(new Date(now - index * 86_400_000)));
}

async function readFileLog(): Promise<Record<string, Record<string, number>>> {
  try {
    return JSON.parse(await readFile(filePath, "utf8")) as Record<string, Record<string, number>>;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return {};
    throw error;
  }
}

export async function recordCartAdd(slug: string): Promise<void> {
  const day = shopDay();
  const redis = getRedis();
  if (redis) {
    const key = `${KEY_PREFIX}${day}`;
    await redis.hincrby(key, slug, 1);
    await redis.expire(key, KEEP_DAYS * 86_400);
    return;
  }
  // Without Upstash (local development) the counts go to a git-ignored file.
  const log = await readFileLog();
  log[day] = { ...log[day], [slug]: (log[day]?.[slug] ?? 0) + 1 };
  await writeFile(filePath, `${JSON.stringify(log, null, 2)}\n`, "utf8");
}

/** Clicks per day for the last `days` days, newest first. */
export async function readCartAdds(days = 30): Promise<CartAddDay[]> {
  noStore();
  const keys = lastDays(days);
  const redis = getRedis();
  if (redis) {
    const pipeline = redis.pipeline();
    for (const day of keys) pipeline.hgetall<Record<string, number>>(`${KEY_PREFIX}${day}`);
    const results = (await pipeline.exec()) as (Record<string, number> | null)[];
    return keys.map((day, index) => ({ day, counts: normalize(results[index]) }));
  }
  const log = await readFileLog();
  return keys.map((day) => ({ day, counts: normalize(log[day]) }));
}

function normalize(counts: Record<string, unknown> | null | undefined): Record<string, number> {
  return Object.fromEntries(Object.entries(counts ?? {}).map(([slug, value]) => [slug, Number(value) || 0]));
}
