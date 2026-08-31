// KVNamespace shim backed by Redis. Implements exactly the surface the app
// and @cloudflare/workers-oauth-provider use: get (plain/"text"/{type:"json"}),
// put with expirationTtl, delete, and list({prefix, cursor, limit}).
//
// Keys are stored as plain Redis strings under `<ns>:<key>` so TTLs map 1:1
// to PEXPIRE and `list` maps to SCAN MATCH. `cacheTtl` on reads is a
// Cloudflare edge-cache hint and is intentionally ignored here.
import { Redis } from "ioredis";

let client: Redis | undefined;

export function getRedis(): Redis {
  if (!client) {
    const url = process.env.REDIS_URL;
    if (!url) {
      throw new Error("REDIS_URL is required for the Node runtime");
    }
    // Lazy connect so importing the module never blocks or throws at boot.
    client = new Redis(url, { lazyConnect: false, maxRetriesPerRequest: 3 });
    client.on("error", (err) => {
      console.error("[node-runtime] redis error:", err.message);
    });
  }
  return client;
}

type KvGetOptions = { type?: "text" | "json"; cacheTtl?: number };

type KvListOptions = { prefix?: string; cursor?: string; limit?: number };

type KvListResult = {
  keys: { name: string }[];
  list_complete: boolean;
  cursor?: string;
};

export class RedisKvNamespace {
  constructor(private readonly namespace: string) {}

  private k(key: string): string {
    return `${this.namespace}:${key}`;
  }

  async get(
    key: string,
    typeOrOptions?: "text" | "json" | KvGetOptions,
  ): Promise<unknown> {
    const raw = await getRedis().get(this.k(key));
    if (raw === null) return null;
    const type =
      typeof typeOrOptions === "string"
        ? typeOrOptions
        : (typeOrOptions?.type ?? "text");
    if (type === "json") {
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    }
    return raw;
  }

  async put(
    key: string,
    value: string,
    options?: { expirationTtl?: number },
  ): Promise<void> {
    if (options?.expirationTtl) {
      // KV enforces a 60s minimum; keep parity so short TTLs don't diverge.
      const ttl = Math.max(60, Math.floor(options.expirationTtl));
      await getRedis().set(this.k(key), value, "EX", ttl);
    } else {
      await getRedis().set(this.k(key), value);
    }
  }

  async delete(key: string): Promise<void> {
    await getRedis().del(this.k(key));
  }

  async list(options?: KvListOptions): Promise<KvListResult> {
    const match = `${this.k(options?.prefix ?? "")}*`;
    const count = Math.min(options?.limit ?? 1000, 1000);
    const [nextCursor, found] = await getRedis().scan(
      options?.cursor ?? "0",
      "MATCH",
      match,
      "COUNT",
      count,
    );
    const strip = this.namespace.length + 1;
    return {
      keys: found.map((name) => ({ name: name.slice(strip) })),
      list_complete: nextCursor === "0",
      cursor: nextCursor === "0" ? undefined : nextCursor,
    };
  }
}
