// DurableObjectNamespace shim for AUDIT_SCRATCHPAD. Each instance name
// (= auditId) gets its own better-sqlite3 database file under
// `<DATA_DIR>/scratchpads/`, mirroring the DO's per-object SQLite.
//
// Semantics preserved from workerd that AuditScratchpad relies on:
//   - `ctx.storage.sql.exec(query, ...params)` is synchronous and returns a
//     cursor with `.toArray()` and `.one()`; the no-param form may contain
//     multiple statements (the constructor's CREATE TABLE block).
//   - RPC atomicity: the class only awaits at the end of its methods, so with
//     synchronous SQL on a single-threaded event loop, claimChunk stays
//     race-free exactly as under workerd's per-object serialization.
//   - `databaseSize`, alarms (stored in a meta table; swept periodically so
//     they survive restarts), `deleteAll` (drops the database file).
import fs from "node:fs";
import path from "node:path";
import { deserialize, serialize } from "node:v8";
import Database from "better-sqlite3";
import { dataDir } from "./r2-fs";

// Loose on purpose: the upstream class types ctx with workerd's
// DurableObjectState; this shim supplies a structurally compatible object.
/* oxlint-disable typescript/no-explicit-any */
type ScratchpadCtor = new (ctx: any, env: any) => unknown;
/* oxlint-enable typescript/no-explicit-any */

const ALARM_META_TABLE = "_node_runtime_alarm";
const KV_TABLE = "_node_runtime_kv";
const ALARM_SWEEP_INTERVAL_MS = 60 * 60 * 1000;

function scratchpadDir(): string {
  return path.join(dataDir(), "scratchpads");
}

function dbPath(name: string): string {
  return path.join(scratchpadDir(), `${encodeURIComponent(name)}.sqlite`);
}

class SqlCursor<T> {
  constructor(private readonly rows: T[]) {}
  toArray(): T[] {
    return this.rows;
  }
  one(): T {
    if (this.rows.length !== 1) {
      throw new Error(`Expected exactly one row, got ${this.rows.length}`);
    }
    return this.rows[0];
  }
  [Symbol.iterator]() {
    return this.rows[Symbol.iterator]();
  }
}

class NodeDoStorage {
  private db: Database.Database;
  readonly sql: {
    exec: <T = Record<string, unknown>>(
      query: string,
      ...params: unknown[]
    ) => SqlCursor<T>;
    readonly databaseSize: number;
  };

  constructor(
    private readonly name: string,
    private readonly onDeleteAll: () => void,
  ) {
    fs.mkdirSync(scratchpadDir(), { recursive: true });
    this.db = new Database(dbPath(name));
    this.db.pragma("journal_mode = WAL");
    this.db.exec(
      `CREATE TABLE IF NOT EXISTS ${ALARM_META_TABLE} (id INTEGER PRIMARY KEY CHECK (id = 1), wake_at INTEGER)`,
    );
    this.db.exec(
      `CREATE TABLE IF NOT EXISTS ${KV_TABLE} (key TEXT PRIMARY KEY, value BLOB NOT NULL)`,
    );
    // oxlint-disable-next-line typescript/no-this-alias -- the sql getters close over the instance
    const storage = this;
    this.sql = {
      exec<T = Record<string, unknown>>(
        query: string,
        ...params: unknown[]
      ): SqlCursor<T> {
        if (params.length === 0 && /;\s*\S/.test(query)) {
          // Multi-statement block (constructor DDL) — no results expected.
          storage.db.exec(query);
          return new SqlCursor<T>([]);
        }
        const normalized = params.map((p) =>
          typeof p === "boolean" ? (p ? 1 : 0) : (p ?? null),
        );
        const stmt = storage.db.prepare<unknown[], T>(query);
        if (stmt.reader) {
          return new SqlCursor<T>(stmt.all(...normalized));
        }
        stmt.run(...normalized);
        return new SqlCursor<T>([]);
      },
      get databaseSize(): number {
        const pageCount = Number(
          storage.db.pragma("page_count", {
            simple: true,
          }),
        );
        const pageSize = Number(
          storage.db.pragma("page_size", {
            simple: true,
          }),
        );
        return pageCount * pageSize;
      },
    };
  }

  async get<T>(key: string): Promise<T | undefined> {
    const row = this.db
      .prepare<
        [string],
        { value: Buffer }
      >(`SELECT value FROM ${KV_TABLE} WHERE key = ?`)
      .get(key);
    // Values originate from put<T>; v8 serialization preserves the structured
    // values the Workers KV contract accepts and returns a fresh copy on read.
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- storage values are typed by their caller, like DurableObjectStorage.get<T>
    return row === undefined ? undefined : (deserialize(row.value) as T);
  }

  async put<T>(key: string, value: T): Promise<void> {
    const bytes = serialize(value);
    this.db
      .prepare(
        `INSERT INTO ${KV_TABLE} (key, value) VALUES (?, ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      )
      .run(key, bytes);
  }

  async getAlarm(): Promise<number | null> {
    const row = this.db
      .prepare<
        [],
        { wake_at: number }
      >(`SELECT wake_at FROM ${ALARM_META_TABLE} WHERE id = 1`)
      .get();
    return row?.wake_at ?? null;
  }

  async setAlarm(timestamp: number): Promise<void> {
    this.db
      .prepare(
        `INSERT INTO ${ALARM_META_TABLE} (id, wake_at) VALUES (1, ?)
         ON CONFLICT(id) DO UPDATE SET wake_at = excluded.wake_at`,
      )
      .run(timestamp);
  }

  async deleteAlarm(): Promise<void> {
    this.db.prepare(`DELETE FROM ${ALARM_META_TABLE} WHERE id = 1`).run();
  }

  async deleteAll(): Promise<void> {
    this.db.close();
    for (const suffix of ["", "-wal", "-shm"]) {
      fs.rmSync(dbPath(this.name) + suffix, { force: true });
    }
    this.onDeleteAll();
  }
}

class NodeDoState {
  readonly storage: NodeDoStorage;

  constructor(name: string, onDeleteAll: () => void) {
    this.storage = new NodeDoStorage(name, onDeleteAll);
  }

  async blockConcurrencyWhile<T>(fn: () => Promise<T>): Promise<T> {
    return fn();
  }
}

export function makeScratchpadNamespace(
  loadCtor: () => Promise<ScratchpadCtor>,
  getEnv: () => unknown,
) {
  const instances = new Map<string, unknown>();

  async function instantiate(name: string): Promise<unknown> {
    const existing = instances.get(name);
    if (existing) return existing;
    const Ctor = await loadCtor();
    const ctx = new NodeDoState(name, () => instances.delete(name));
    const instance = new Ctor(ctx, getEnv());
    instances.set(name, instance);
    return instance;
  }

  // Alarm sweep: walk the on-disk scratchpads, fire overdue alarms (the
  // class's 7-day self-cleanup). Runs hourly; survives restarts because the
  // wake-at time lives inside each database file.
  const sweep = async () => {
    let files: string[] = [];
    try {
      files = fs.readdirSync(scratchpadDir());
    } catch {
      return;
    }
    for (const file of files) {
      if (!file.endsWith(".sqlite")) continue;
      const name = decodeURIComponent(file.slice(0, -".sqlite".length));
      try {
        // The constructor is loaded from the upstream AuditScratchpad class;
        // its Cloudflare ctx is implemented by NodeDoState above.
        // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- runtime bridge between structurally equivalent DO contexts
        const instance = (await instantiate(name)) as {
          alarm?: () => Promise<void>;
          ctx: { storage: NodeDoStorage };
        };
        const wakeAt = await instance.ctx.storage.getAlarm();
        if (wakeAt !== null && wakeAt <= Date.now() && instance.alarm) {
          await instance.alarm();
        }
      } catch (err) {
        console.error(`[scratchpad] alarm sweep failed for ${name}:`, err);
      }
    }
  };
  const timer = setInterval(() => void sweep(), ALARM_SWEEP_INTERVAL_MS);
  timer.unref?.();

  return {
    idFromName(name: string) {
      return { name, toString: () => name };
    },
    // Callers use the returned stub as `stub.method(...)` with awaited calls,
    // never awaiting get() itself — so hand back a proxy whose methods
    // resolve the instance lazily (also breaks the import cycle between the
    // env shim and the upstream class).
    get(id: { name: string }) {
      return new Proxy(
        {},
        {
          get(_target, prop) {
            if (typeof prop !== "string") return undefined;
            return async (...args: unknown[]) => {
              const instance = await instantiate(id.name);
              if (typeof instance !== "object" || instance === null)
                throw new TypeError("Invalid AuditScratchpad instance");
              const method: unknown = Reflect.get(instance, prop);
              if (typeof method !== "function") {
                throw new TypeError(`AuditScratchpad.${prop} is not a method`);
              }
              const result: unknown = method.apply(instance, args);
              return result;
            };
          },
        },
      );
    },
  };
}
