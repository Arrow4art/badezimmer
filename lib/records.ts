import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { unstable_noStore as noStore } from "next/cache";
import { getRedis } from "@/lib/kv";
import type { ContactMessage, NewsletterEntry, Order } from "@/lib/types";

async function readJson<T>(name: string, fallback: T): Promise<T> {
  noStore();
  const redis = getRedis();
  if (redis) return (await redis.get<T>(`badezimmer:${name}`)) ?? fallback;
  try {
    const raw = await readFile(filePath(name), "utf8");
    return JSON.parse(raw) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return fallback;
    throw error;
  }
}

async function writeJson(name: string, value: unknown): Promise<void> {
  const redis = getRedis();
  if (redis) {
    await redis.set(`badezimmer:${name}`, value);
    return;
  }
  try {
    await writeFile(filePath(name), `${JSON.stringify(value, null, 2)}\n`, "utf8");
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "EROFS" || code === "EPERM" || code === "EACCES" || code === "ENOENT") {
      throw new Error(
        "Order storage is not writable. Set KV_REST_API_URL and KV_REST_API_TOKEN, or UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.",
      );
    }
    throw error;
  }
}

function filePath(name: string): string {
  return path.join(process.cwd(), "data", `${name}.json`);
}

export const readOrders = () => readJson<Order[]>("orders", []);
export const writeOrders = (orders: Order[]) => writeJson("orders", orders);
export const readNewsletter = () => readJson<NewsletterEntry[]>("newsletter", []);
export const writeNewsletter = (entries: NewsletterEntry[]) => writeJson("newsletter", entries);
export const readMessages = () => readJson<ContactMessage[]>("messages", []);
export const writeMessages = (messages: ContactMessage[]) => writeJson("messages", messages);
