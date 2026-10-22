import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { unstable_noStore as noStore } from "next/cache";
import { getRedis } from "@/lib/kv";
import type { StoreData } from "@/lib/types";

const storePath = path.join(process.cwd(), "data", "store.json");
const SAVED_KEY = "badezimmer:store";
const STOCK_KEY = "badezimmer:stock";

// Settings saved in Redis apply only while data/store.json is unchanged, so an
// edit committed to git wins. Stock survives such edits unless that product's
// stock in the file changed.
type SavedStore = { seed: string; store: StoreData };
type StockEntry = { base: number; value: number };

async function readFileStore(): Promise<{ raw: string; file: StoreData }> {
  const raw = await readFile(storePath, "utf8");
  return { raw, file: JSON.parse(raw) as StoreData };
}

function seedOf(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export async function readStore(): Promise<StoreData> {
  noStore();
  const { raw, file } = await readFileStore();
  const redis = getRedis();
  if (!redis) return file;
  const [saved, stock] = await Promise.all([
    redis.get<SavedStore>(SAVED_KEY),
    redis.get<Record<string, StockEntry>>(STOCK_KEY),
  ]);
  const store = saved?.seed === seedOf(raw) ? saved.store : file;
  for (const product of store.products) {
    const base = file.products.find((entry) => entry.slug === product.slug)?.stock;
    const entry = stock?.[product.slug];
    product.stock = entry && entry.base === base ? entry.value : (base ?? product.stock);
  }
  return store;
}

export async function writeStore(store: StoreData): Promise<void> {
  const redis = getRedis();
  if (!redis) {
    await writeFile(storePath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
    return;
  }
  const { raw, file } = await readFileStore();
  const stock: Record<string, StockEntry> = {};
  for (const product of store.products) {
    const base = file.products.find((entry) => entry.slug === product.slug)?.stock ?? product.stock;
    stock[product.slug] = { base, value: product.stock };
  }
  await Promise.all([
    redis.set(SAVED_KEY, { seed: seedOf(raw), store } satisfies SavedStore),
    redis.set(STOCK_KEY, stock),
  ]);
}
