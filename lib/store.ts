import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { unstable_noStore as noStore } from "next/cache";
import type { StoreData } from "@/lib/types";

const storePath = path.join(process.cwd(), "data", "store.json");

export async function readStore(): Promise<StoreData> {
  noStore();
  const raw = await readFile(storePath, "utf8");
  return JSON.parse(raw) as StoreData;
}

export async function writeStore(store: StoreData): Promise<void> {
  await writeFile(storePath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}
