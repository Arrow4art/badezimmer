import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { unstable_noStore as noStore } from "next/cache";
import type { ContactMessage, NewsletterEntry, Order } from "@/lib/types";

async function readJson<T>(file: string, fallback: T): Promise<T> {
  noStore();
  try {
    const raw = await readFile(file, "utf8");
    return JSON.parse(raw) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return fallback;
    throw error;
  }
}

async function writeJson(file: string, value: unknown): Promise<void> {
  await writeFile(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

const ordersPath = path.join(process.cwd(), "data", "orders.json");
const newsletterPath = path.join(process.cwd(), "data", "newsletter.json");
const messagesPath = path.join(process.cwd(), "data", "messages.json");

export const readOrders = () => readJson<Order[]>(ordersPath, []);
export const writeOrders = (orders: Order[]) => writeJson(ordersPath, orders);
export const readNewsletter = () => readJson<NewsletterEntry[]>(newsletterPath, []);
export const writeNewsletter = (entries: NewsletterEntry[]) => writeJson(newsletterPath, entries);
export const readMessages = () => readJson<ContactMessage[]>(messagesPath, []);
export const writeMessages = (messages: ContactMessage[]) => writeJson(messagesPath, messages);
