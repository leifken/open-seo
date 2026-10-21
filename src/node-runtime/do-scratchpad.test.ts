import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import Database from "better-sqlite3";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { makeScratchpadNamespace } from "./do-scratchpad";
import { AuditScratchpad } from "@/server/features/audit/AuditScratchpad";
import type { CrawlThrottleState } from "@/server/lib/audit/crawl-throttle";

vi.mock("cloudflare:workers", () => ({
  env: {},
  DurableObject: class {
    constructor(
      protected ctx: unknown,
      protected env: unknown,
    ) {}
  },
}));

// A consumer of the public namespace, not a replacement storage implementation.
class StorageClient {
  constructor(private ctx: { storage: DurableObjectStorage }) {}
  async read(key: string) {
    return this.ctx.storage.get(key);
  }
  async write(key: string, value: unknown) {
    await this.ctx.storage.put(key, value);
  }
}

function namespace() {
  return makeScratchpadNamespace(
    async () => AuditScratchpad,
    () => ({}),
  );
}

function scratchpad(ns: ReturnType<typeof namespace>, name = "audit") {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Node supplies the RPC methods of the constructor passed to the namespace
  return ns.get(ns.idFromName(name)) as unknown as AuditScratchpad;
}

function client(
  ns = makeScratchpadNamespace(
    async () => StorageClient,
    () => ({}),
  ),
) {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- the namespace returns this test consumer's RPC surface
  return ns.get(ns.idFromName("values")) as unknown as StorageClient;
}

const throttle: CrawlThrottleState = {
  intervalMs: 2_000,
  nextRequestAt: 10_000,
  pausedUntil: 30_000,
  consecutiveRateLimits: 1,
  cooldownMs: 30_000,
};
let directory: string;

beforeEach(() => {
  directory = fs.mkdtempSync(path.join(os.tmpdir(), "openseo-scratchpad-"));
  vi.stubEnv("DATA_DIR", directory);
});
afterEach(() => {
  vi.unstubAllEnvs();
  fs.rmSync(directory, { recursive: true, force: true });
});

describe("Node scratchpad persistence", () => {
  it("reads a missing throttle and round-trips the real audit's checkpoint", async () => {
    const pad = scratchpad(namespace());
    expect(await pad.getCrawlThrottle()).toBeUndefined();
    await pad.saveCrawlThrottle(throttle);
    expect(await pad.getCrawlThrottle()).toEqual(throttle);
    await pad.destroy();
  });

  it("preserves zero, null, objects and structured values, without shared references", async () => {
    const storage = client();
    expect(await storage.read("missing")).toBeUndefined();
    for (const value of [
      0,
      null,
      { nested: [1, 2] },
      new Map([["value", 3]]),
    ]) {
      await storage.write("value", value);
      expect(await storage.read("value")).toEqual(value);
    }
    const original = { nested: { count: 1 } };
    const pending = storage.write("object", original);
    await pending;
    original.nested.count = 99;
    const saved = await storage.read("object");
    expect(saved).toEqual({ nested: { count: 1 } });
    if (saved && typeof saved === "object") Reflect.set(saved, "nested", null);
    expect(await storage.read("object")).toEqual({ nested: { count: 1 } });
  });

  it("keeps the previous checkpoint when serializing a replacement fails", async () => {
    const storage = client();
    await storage.write("checkpoint", throttle);
    await expect(storage.write("checkpoint", () => 1)).rejects.toThrow();
    expect(await storage.read("checkpoint")).toEqual(throttle);
  });

  it("shares committed values between independent instances and isolates audits", async () => {
    const first = scratchpad(namespace());
    const second = scratchpad(namespace());
    await Promise.all([
      first.saveCrawlThrottle(throttle),
      second.seedStart("https://fixture.example/"),
    ]);
    expect(await second.getCrawlThrottle()).toEqual(throttle);
    await second.saveCrawlThrottle({ ...throttle, intervalMs: 4_000 });
    expect(await first.getCrawlThrottle()).toEqual({
      ...throttle,
      intervalMs: 4_000,
    });
    const other = scratchpad(namespace(), "other");
    expect(await other.getCrawlThrottle()).toBeUndefined();
    await other.destroy();
    await first.destroy();
  });

  it("upgrades an existing SQL database while retaining its frontier and alarm", async () => {
    const ns = namespace();
    const first = scratchpad(ns);
    await first.seedStart("https://fixture.example/");
    const db = new Database(path.join(directory, "scratchpads/audit.sqlite"));
    const alarm = db.prepare("SELECT wake_at FROM _node_runtime_alarm").get();
    // Reproduce the layout of an audit created before the KV fix.
    db.exec("DROP TABLE IF EXISTS _node_runtime_kv");
    const upgraded = scratchpad(namespace());
    await upgraded.saveCrawlThrottle(throttle);
    expect(await upgraded.claimChunk(1, 10)).toEqual({
      isRetry: false,
      urls: [{ url: "https://fixture.example/", depth: 0, inSitemap: false }],
    });
    expect(db.prepare("SELECT wake_at FROM _node_runtime_alarm").get()).toEqual(
      alarm,
    );
    expect(await first.getCrawlThrottle()).toEqual(throttle);
    db.close();
    await upgraded.destroy();
  });

  it("clears the KV state on the regular cleanup and permits a fresh audit", async () => {
    const ns = namespace();
    const pad = scratchpad(ns);
    await pad.saveCrawlThrottle(throttle);
    await pad.alarm();
    expect(
      fs.existsSync(path.join(directory, "scratchpads/audit.sqlite")),
    ).toBe(false);
    const fresh = scratchpad(ns);
    expect(await fresh.getCrawlThrottle()).toBeUndefined();
    await fresh.destroy();
  });

  it("reads the checkpoint after the writer process exits", async () => {
    const source = `
      import { makeScratchpadNamespace } from ${JSON.stringify(path.resolve("src/node-runtime/do-scratchpad.ts"))};
      class Consumer {
        constructor(ctx) { this.storage = ctx.storage; }
        async write() { await this.storage.put('checkpoint', ${JSON.stringify(throttle)}); }
      }
      const ns = makeScratchpadNamespace(async () => Consumer, () => ({}));
      const pad = ns.get(ns.idFromName('values'));
      await pad.write();
    `;
    // The child exits before this process opens the same persistent namespace.
    // A second tsx child adds startup cost without strengthening that boundary.
    execFileSync(
      process.execPath,
      ["--import", "tsx", "--input-type=module", "-e", source],
      { encoding: "utf8", env: { ...process.env, DATA_DIR: directory } },
    );
    expect(await client().read("checkpoint")).toEqual(throttle);
  });
});
