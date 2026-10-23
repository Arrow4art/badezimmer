import { Redis } from "@upstash/redis";

let client: Redis | null | undefined;

// Bracket access stays a runtime lookup. Dot access can be inlined as empty
// during `next build` and then ignore credentials that exist only at runtime.
function readEnv(name: string): string {
  const value = process.env[name];
  return typeof value === "string" ? value.trim() : "";
}

export function getRedis(): Redis | null {
  if (client !== undefined) return client;
  const url = readEnv("KV_REST_API_URL") || readEnv("UPSTASH_REDIS_REST_URL");
  const token = readEnv("KV_REST_API_TOKEN") || readEnv("UPSTASH_REDIS_REST_TOKEN");
  client = url && token ? new Redis({ url, token }) : null;
  return client;
}

export function storageConfigured(): boolean {
  return getRedis() !== null;
}
