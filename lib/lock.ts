import { randomBytes } from "node:crypto";
import type { Redis } from "@upstash/redis";
import { getRedis } from "@/lib/kv";

const LOCK_KEY = "badezimmer:lock";
const LOCK_MS = 15_000;

let chain: Promise<unknown> = Promise.resolve();

async function withRedisLock<T>(redis: Redis, task: () => Promise<T>): Promise<T> {
  const token = `lock-${randomBytes(8).toString("hex")}`;
  const deadline = Date.now() + LOCK_MS;
  while (!(await redis.set(LOCK_KEY, token, { nx: true, px: LOCK_MS }))) {
    if (Date.now() > deadline) throw new Error("Der Shop ist gerade ausgelastet. Bitte versuchen Sie es erneut.");
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  try {
    return await task();
  } finally {
    if ((await redis.get<string>(LOCK_KEY)) === token) await redis.del(LOCK_KEY);
  }
}

export function withLock<T>(task: () => Promise<T>): Promise<T> {
  const redis = getRedis();
  const guarded = redis ? () => withRedisLock(redis, task) : task;
  const run = chain.then(guarded, guarded);
  chain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}
