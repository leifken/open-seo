import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { Client } from "@libsql/client";
import type { WorkflowStep, WorkflowStepConfig } from "cloudflare:workers";
import { afterAll, afterEach, beforeEach, expect, it, vi } from "vitest";
import { db } from "@/db";
import { audits, auditPages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { makeScratchpadNamespace } from "./do-scratchpad";
import { AuditScratchpad } from "@/server/features/audit/AuditScratchpad";
import { SiteAuditWorkflow } from "@/server/workflows/SiteAuditWorkflow";

const runtime = vi.hoisted(() => ({
  client: undefined as Client | undefined,
  namespace: undefined as
    | ReturnType<typeof makeScratchpadNamespace>
    | undefined,
  capture:
    vi.fn<
      (event: {
        event: string;
        properties?: Record<string, unknown>;
      }) => Promise<void>
    >(),
}));
vi.mock("cloudflare:workers", () => ({
  env: {
    DATABASE_PROVIDER: "d1",
    get AUDIT_SCRATCHPAD() {
      return runtime.namespace;
    },
    KV: { get: async () => null, put: async () => {}, delete: async () => {} },
  },
  DurableObject: class {
    constructor(
      protected ctx: unknown,
      protected env: unknown,
    ) {}
  },
  WorkflowEntrypoint: vi.fn(),
}));
vi.mock("cloudflare:workflows", () => ({
  NonRetryableError: class extends Error {},
}));
vi.mock("@/db", async () => {
  const { createClient } = await import("@libsql/client");
  const { drizzle } = await import("drizzle-orm/libsql");
  const { migrate } = await import("drizzle-orm/libsql/migrator");
  const schema = await import("@/db/d1/schema");
  const client = createClient({ url: "file::memory:" });
  const database = drizzle(client, { schema });
  // Execute the real repository queries and all shipped SQLite migrations.
  await migrate(database, { migrationsFolder: "drizzle/sqlite" });
  runtime.client = client;
  return { db: database, withPgClient: (fn: () => Promise<unknown>) => fn() };
});
vi.mock("@/db/d1/client", async () => ({ d1Db: (await import("@/db")).db }));
vi.mock("@/server/lib/posthog", () => ({
  captureServerEvent: runtime.capture,
  captureServerError: vi.fn(),
}));
vi.mock("@/server/features/audit/services/CrawlerCredentialService", () => ({
  CrawlerCredentialService: { openCrawlerAccess: async () => null },
}));
vi.mock("@/server/lib/audit/rendering-billing", () => ({
  settleRenderingLocks: () => {
    throw new Error("Unzulässiger bezahlter Prüfweg");
  },
}));

const ORIGIN = "https://fixture.example";
const AUDIT = "fixture-audit";
let directory: string;

beforeEach(() => {
  directory = fs.mkdtempSync(path.join(os.tmpdir(), "openseo-workflow-"));
  vi.stubEnv("DATA_DIR", directory);
  runtime.namespace = makeScratchpadNamespace(
    async () => AuditScratchpad,
    () => ({}),
  );
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  fs.rmSync(directory, { recursive: true, force: true });
});
afterAll(() => runtime.client?.close());

it("completes the regular workflow after a persisted 429 cooldown and a fresh scratchpad instance", async () => {
  await runtime.client!.executeMultiple(`
    INSERT INTO organization (id,name,slug,created_at) VALUES ('org','Fixture','fixture',0);
    INSERT INTO projects (id,organization_id,name,domain) VALUES ('project','org','Fixture','fixture.example');
  `);
  await db.insert(audits).values({
    id: AUDIT,
    projectId: "project",
    startedByUserId: "user",
    startUrl: ORIGIN + "/",
    workflowInstanceId: AUDIT,
    config: JSON.stringify({ maxPages: 10, lighthouseStrategy: "none" }),
  });
  const requests: string[] = [];
  let limited = false;
  vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
    const url = input instanceof Request ? input.url : String(input);
    requests.push(url);
    if (url === ORIGIN + "/robots.txt")
      return new Response("User-agent: *\nSitemap: " + ORIGIN + "/sitemap.xml");
    if (url === ORIGIN + "/sitemap.xml")
      return new Response(
        `<?xml version="1.0"?><urlset><url><loc>${ORIGIN}/</loc></url></urlset>`,
        { headers: { "content-type": "application/xml" } },
      );
    if (url === ORIGIN + "/" && !limited) {
      limited = true;
      return new Response("Bitte später erneut versuchen", {
        status: 429,
        headers: { "retry-after": "120" },
      });
    }
    if (url === ORIGIN + "/")
      return new Response(
        '<html lang="de"><head><title>Fixture</title></head><body><h1>Fixture</h1><a href="/kontakt">Kontakt</a></body></html>',
        { headers: { "content-type": "text/html" } },
      );
    if (url === ORIGIN + "/kontakt")
      return new Response(
        '<html lang="de"><head><title>Kontakt</title></head><body><h1>Kontakt</h1></body></html>',
        { headers: { "content-type": "text/html" } },
      );
    throw new Error("Nicht aufgezeichneter HTTP-Aufruf: " + url);
  });
  // SQLite and HTML parsing use real I/O; advance only the crawl's logical clock.
  let now = 0;
  vi.spyOn(Date, "now").mockImplementation(() => now);
  const checkpoints = new Map<string, unknown>();
  let resumed = false;
  const step = {
    async do(
      name: string,
      configOrFn: WorkflowStepConfig | (() => Promise<unknown>),
      fn?: () => Promise<unknown>,
    ) {
      if (checkpoints.has(name)) return checkpoints.get(name);
      const callback = typeof configOrFn === "function" ? configOrFn : fn;
      if (typeof callback !== "function")
        throw new Error("Fehlender Prüfschritt");
      const result: unknown = await callback();
      checkpoints.set(name, result);
      return result;
    },
    async sleepUntil(_name: string, at: number) {
      const ns = runtime.namespace!;
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- namespace was constructed with the actual AuditScratchpad
      const pad = ns.get(ns.idFromName(AUDIT)) as unknown as AuditScratchpad;
      expect(await pad.getCrawlThrottle()).toMatchObject({
        pausedUntil: 120_000,
        consecutiveRateLimits: 1,
      });
      runtime.namespace = makeScratchpadNamespace(
        async () => AuditScratchpad,
        () => ({}),
      );
      now = at;
      resumed = true;
    },
  };
  // Let one-second pacing timers advance the logical clock without a real wait.
  const nativeTimeout = globalThis.setTimeout;
  vi.spyOn(globalThis, "setTimeout").mockImplementation(
    (handler, delay, ...args) => {
      if (delay && delay <= 2_000) {
        now += delay;
        return nativeTimeout(handler, 0, ...args);
      }
      return nativeTimeout(handler, delay, ...args);
    },
  );
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- the mocked base does not use its constructor arguments
  const workflow = new SiteAuditWorkflow({} as ExecutionContext, {} as Env);
  await workflow.run(
    {
      instanceId: AUDIT,
      timestamp: new Date(),
      payload: {
        auditId: AUDIT,
        projectId: "project",
        startUrl: ORIGIN + "/",
        billingCustomer: {
          userId: "user",
          userEmail: "fixture@example.test",
          organizationId: "org",
        },
        config: { maxPages: 10, lighthouseStrategy: "none" },
      },
    },
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- fixture supplies the do/sleepUntil surface reached by this workflow
    step as unknown as WorkflowStep,
  );
  const [audit] = await db.select().from(audits).where(eq(audits.id, AUDIT));
  expect(audit).toMatchObject({
    status: "completed",
    currentPhase: "completed",
    pagesCrawled: 2,
  });
  expect(
    await db.select().from(auditPages).where(eq(auditPages.auditId, AUDIT)),
  ).toHaveLength(2);
  expect(resumed).toBe(true);
  expect(requests.filter((url) => url === ORIGIN + "/")).toHaveLength(2);
  expect(checkpoints.has("finalize")).toBe(true);
  expect(
    fs.existsSync(path.join(directory, "scratchpads", AUDIT + ".sqlite")),
  ).toBe(false);
  expect(runtime.capture.mock.calls.map(([event]) => event)).toMatchObject([
    { event: "site_audit:complete", properties: { status: "completed" } },
  ]);
});
