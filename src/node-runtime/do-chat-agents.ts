// DurableObjectNamespace shim for the chat agents (ONBOARDING_CHAT, SAM_CHAT).
// One better-sqlite3 database per instance name under DATA_DIR/agents/, plus
// the full DurableObjectState surface the partyserver/agents/ai-chat/think
// stack actually uses at runtime (see the port analysis): synchronous
// sql.exec with rowsWritten, KV get/put/delete/list, transactionSync, real
// alarm timers, a serializing blockConcurrencyWhile, ctx.id.name, and the
// hibernation WebSocket registry (acceptWebSocket/getWebSockets) with events
// dispatched to the instance's webSocketMessage/Close/Error handlers.
//
// Single-process assumption: like workerd's one-instance-per-name guarantee,
// this registry is only correct with ONE app replica (compose runs one).
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { dataDir } from "./r2-fs";
import { waitUntil } from "./wait-until";

/* oxlint-disable typescript/no-explicit-any */
type ChatAgentCtor = new (ctx: any, env: any) => any;
/* oxlint-enable typescript/no-explicit-any */

const ALARM_TABLE = "_node_runtime_alarm";
const KV_TABLE = "_node_runtime_kv";

// Every agent invocation (fetch, webSocketMessage/Close/Error, alarm, RPC)
// gets its own request-scoped Postgres client — the workerd invocation
// semantics the upstream code assumes. withPgClient is re-entrant, so the
// upstream's own wrapping composes fine. Lazy import breaks the module cycle
// env → do-chat-agents → db → cf-workers-shim → env.
let withPgClientFn: (<T>(fn: () => Promise<T>) => Promise<T>) | undefined;
async function inPgScope<T>(fn: () => Promise<T>): Promise<T> {
  if (!withPgClientFn) {
    withPgClientFn = (await import("../db")).withPgClient;
  }
  return withPgClientFn(fn);
}

class SqlCursor<T> {
  constructor(
    private readonly rows: T[],
    readonly rowsWritten: number,
  ) {}
  toArray(): T[] {
    return this.rows;
  }
  one(): T {
    if (this.rows.length !== 1) {
      throw new Error(`Expected exactly one row, got ${this.rows.length}`);
    }
    return this.rows[0];
  }
  get rowsRead(): number {
    return this.rows.length;
  }
  [Symbol.iterator]() {
    return this.rows[Symbol.iterator]();
  }
}

function normalizeParams(params: unknown[]): unknown[] {
  return params.map((p) =>
    typeof p === "boolean" ? (p ? 1 : 0) : (p ?? null),
  );
}

class NodeChatStorage {
  private db: Database.Database;
  private alarmTimer: NodeJS.Timeout | undefined;
  private onAlarm: (() => void) | undefined;
  readonly sql: {
    exec: <T = Record<string, unknown>>(
      query: string,
      ...params: unknown[]
    ) => SqlCursor<T>;
    readonly databaseSize: number;
  };

  constructor(
    private readonly filePath: string,
    private readonly onDeleteAll: () => void,
  ) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    this.db = new Database(filePath);
    this.db.pragma("journal_mode = WAL");
    this.db.exec(
      `CREATE TABLE IF NOT EXISTS ${ALARM_TABLE} (id INTEGER PRIMARY KEY CHECK (id = 1), wake_at INTEGER);
       CREATE TABLE IF NOT EXISTS ${KV_TABLE} (key TEXT PRIMARY KEY, value TEXT NOT NULL);`,
    );
    // oxlint-disable-next-line typescript/no-this-alias -- getters close over the instance
    const self = this;
    this.sql = {
      exec<T = Record<string, unknown>>(
        query: string,
        ...params: unknown[]
      ): SqlCursor<T> {
        if (params.length === 0 && /;\s*\S/.test(query)) {
          self.db.exec(query);
          return new SqlCursor<T>([], 0);
        }
        const stmt = self.db.prepare(query);
        if (stmt.reader) {
          return new SqlCursor<T>(stmt.all(...normalizeParams(params)) as T[], 0);
        }
        const info = stmt.run(...normalizeParams(params));
        return new SqlCursor<T>([], info.changes);
      },
      get databaseSize(): number {
        const pages = self.db.pragma("page_count", { simple: true }) as number;
        const size = self.db.pragma("page_size", { simple: true }) as number;
        return pages * size;
      },
    };
  }

  bindAlarmHandler(handler: () => void): void {
    this.onAlarm = handler;
    // Re-arm a persisted alarm after a restart.
    const row = this.db
      .prepare(`SELECT wake_at FROM ${ALARM_TABLE} WHERE id = 1`)
      .get() as { wake_at: number } | undefined;
    if (row) this.armTimer(row.wake_at);
  }

  private armTimer(wakeAt: number): void {
    if (this.alarmTimer) clearTimeout(this.alarmTimer);
    const delay = Math.max(0, wakeAt - Date.now());
    this.alarmTimer = setTimeout(() => {
      this.db.prepare(`DELETE FROM ${ALARM_TABLE} WHERE id = 1`).run();
      this.onAlarm?.();
    }, delay);
    this.alarmTimer.unref?.();
  }

  async get(key: string | string[]): Promise<unknown> {
    if (Array.isArray(key)) {
      const result = new Map<string, unknown>();
      for (const k of key) {
        const v = await this.get(k);
        if (v !== undefined) result.set(k, v);
      }
      return result;
    }
    const row = this.db
      .prepare(`SELECT value FROM ${KV_TABLE} WHERE key = ?`)
      .get(key) as { value: string } | undefined;
    return row === undefined ? undefined : JSON.parse(row.value);
  }

  async put(key: string | Record<string, unknown>, value?: unknown): Promise<void> {
    const entries =
      typeof key === "string" ? [[key, value] as const] : Object.entries(key);
    const stmt = this.db.prepare(
      `INSERT INTO ${KV_TABLE} (key, value) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    );
    for (const [k, v] of entries) stmt.run(k, JSON.stringify(v));
  }

  async delete(key: string | string[]): Promise<boolean | number> {
    const keys = Array.isArray(key) ? key : [key];
    const stmt = this.db.prepare(`DELETE FROM ${KV_TABLE} WHERE key = ?`);
    let deleted = 0;
    for (const k of keys) deleted += stmt.run(k).changes;
    return Array.isArray(key) ? deleted : deleted > 0;
  }

  async list(options?: { prefix?: string; limit?: number }): Promise<Map<string, unknown>> {
    const prefix = options?.prefix ?? "";
    const rows = this.db
      .prepare(
        `SELECT key, value FROM ${KV_TABLE} WHERE key >= ? AND key < ? ORDER BY key${options?.limit ? " LIMIT " + Math.floor(options.limit) : ""}`,
      )
      .all(prefix, prefix + "￿") as { key: string; value: string }[];
    return new Map(rows.map((r) => [r.key, JSON.parse(r.value)]));
  }

  transactionSync<T>(fn: () => T): T {
    return this.db.transaction(fn)();
  }

  async getAlarm(): Promise<number | null> {
    const row = this.db
      .prepare(`SELECT wake_at FROM ${ALARM_TABLE} WHERE id = 1`)
      .get() as { wake_at: number } | undefined;
    return row?.wake_at ?? null;
  }

  async setAlarm(timestamp: number | Date): Promise<void> {
    const wakeAt = typeof timestamp === "number" ? timestamp : timestamp.getTime();
    this.db
      .prepare(
        `INSERT INTO ${ALARM_TABLE} (id, wake_at) VALUES (1, ?)
         ON CONFLICT(id) DO UPDATE SET wake_at = excluded.wake_at`,
      )
      .run(wakeAt);
    this.armTimer(wakeAt);
  }

  async deleteAlarm(): Promise<void> {
    if (this.alarmTimer) clearTimeout(this.alarmTimer);
    this.db.prepare(`DELETE FROM ${ALARM_TABLE} WHERE id = 1`).run();
  }

  async deleteAll(): Promise<void> {
    if (this.alarmTimer) clearTimeout(this.alarmTimer);
    this.db.close();
    for (const suffix of ["", "-wal", "-shm"]) {
      fs.rmSync(this.filePath + suffix, { force: true });
    }
    this.onDeleteAll();
  }

  async sync(): Promise<void> {}
}

type SocketAdapter = {
  readyState: number;
  __realSocket: {
    on(event: string, cb: (...args: unknown[]) => void): void;
  };
};

class NodeChatState {
  readonly storage: NodeChatStorage;
  readonly id: { name: string; toString(): string; equals(other: unknown): boolean };
  private sockets = new Map<SocketAdapter, string[]>();
  private lock: Promise<unknown> = Promise.resolve();
  /* oxlint-disable typescript/no-explicit-any */
  instance: any;
  /* oxlint-enable typescript/no-explicit-any */

  constructor(binding: string, name: string, onDeleteAll: () => void) {
    const file = path.join(
      dataDir(),
      "agents",
      encodeURIComponent(binding),
      `${encodeURIComponent(name)}.sqlite`,
    );
    this.storage = new NodeChatStorage(file, onDeleteAll);
    const idString = `${binding}:${name}`;
    this.id = {
      name,
      toString: () => idString,
      equals: (other: unknown) => String(other) === idString,
    };
  }

  blockConcurrencyWhile<T>(fn: () => Promise<T>): Promise<T> {
    const next = this.lock.then(fn);
    this.lock = next.catch(() => {});
    return next;
  }

  waitUntil(promise: Promise<unknown>): void {
    waitUntil(promise);
  }

  acceptWebSocket(ws: SocketAdapter, tags: string[] = []): void {
    this.sockets.set(ws, tags);
    const real = ws.__realSocket;
    if (process.env.NODE_RUNTIME_DEBUG === "1") {
      console.log(
        `[chat-agent ${this.id.name}] acceptWebSocket: ctor=${ws?.constructor?.name} realSocket=${typeof real} tags=${JSON.stringify(tags)}`,
      );
    }
    if (!real || typeof real.on !== "function") {
      console.error(
        `[chat-agent ${this.id.name}] acceptWebSocket got a socket without __realSocket — messages will not be delivered`,
      );
      return;
    }
    real.on("message", (data: unknown, isBinary: unknown) => {
      const payload = isBinary ? data : String(data);
      if (process.env.NODE_RUNTIME_DEBUG === "1") {
        console.log(
          `[chat-agent ${this.id.name}] message in:`,
          String(payload).slice(0, 120),
          "| handler:",
          typeof this.instance?.webSocketMessage,
        );
      }
      inPgScope(() =>
        Promise.resolve(this.instance?.webSocketMessage?.(ws, payload)),
      ).catch((err: unknown) =>
        console.error("[chat-agent] webSocketMessage failed:", err),
      );
    });
    real.on("close", (code: unknown, reason: unknown) => {
      this.sockets.delete(ws);
      inPgScope(() =>
        Promise.resolve(
          this.instance?.webSocketClose?.(ws, Number(code) || 1006, String(reason ?? ""), true),
        ),
      ).catch((err: unknown) => console.error("[chat-agent] webSocketClose failed:", err));
    });
    real.on("error", (error: unknown) => {
      inPgScope(() =>
        Promise.resolve(this.instance?.webSocketError?.(ws, error)),
      ).catch((err: unknown) =>
        console.error("[chat-agent] webSocketError failed:", err),
      );
    });
  }

  getWebSockets(tag?: string): SocketAdapter[] {
    const all = [...this.sockets.entries()];
    return (tag ? all.filter(([, tags]) => tags.includes(tag)) : all).map(([ws]) => ws);
  }

  setWebSocketAutoResponse(): void {}
  getTags(ws: SocketAdapter): string[] {
    return this.sockets.get(ws) ?? [];
  }

  abort(): void {
    // workerd kills the object; here the registry eviction (via deleteAll's
    // onDeleteAll) is what matters. Nothing to do for a bare abort.
  }
}

export function makeChatAgentNamespace(
  binding: string,
  loadCtor: () => Promise<ChatAgentCtor>,
  getEnv: () => unknown,
) {
  const instances = new Map<string, { state: NodeChatState; instance: unknown }>();

  async function instantiate(name: string) {
    const existing = instances.get(name);
    if (existing) return existing;
    const Ctor = await loadCtor();
    const state = new NodeChatState(binding, name, () => instances.delete(name));
    const instance = new Ctor(state, getEnv());
    state.instance = instance;
    state.storage.bindAlarmHandler(() => {
      /* oxlint-disable typescript/no-explicit-any */
      inPgScope(() => Promise.resolve((instance as any).alarm?.())).catch(
        (err: unknown) =>
          console.error(`[chat-agent ${binding}:${name}] alarm failed:`, err),
      );
      /* oxlint-enable typescript/no-explicit-any */
    });
    const entry = { state, instance };
    instances.set(name, entry);
    return entry;
  }

  return {
    idFromName(name: string) {
      return { name, toString: () => `${binding}:${name}` };
    },
    get(id: { name: string }) {
      return new Proxy(
        {},
        {
          get(_target, prop) {
            if (typeof prop !== "string") return undefined;
            if (prop === "fetch") {
              return async (request: Request) => {
                const { instance } = await instantiate(id.name);
                /* oxlint-disable typescript/no-explicit-any */
                return inPgScope(() => (instance as any).fetch(request));
                /* oxlint-enable typescript/no-explicit-any */
              };
            }
            return async (...args: unknown[]) => {
              const { instance } = await instantiate(id.name);
              /* oxlint-disable typescript/no-explicit-any */
              const method = (instance as any)[prop];
              /* oxlint-enable typescript/no-explicit-any */
              if (typeof method !== "function") {
                throw new TypeError(`${binding}.${prop} is not a method`);
              }
              return inPgScope(() => Promise.resolve(method.apply(instance, args)));
            };
          },
        },
      );
    },
  };
}
