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
import Database from "better-sqlite3";
import { dataDir } from "./r2-fs";

// Loose on purpose: the upstream class types ctx with workerd's
// DurableObjectState; this shim supplies a structurally compatible object.
/* oxlint-disable typescript/no-explicit-any */
type ScratchpadCtor = new (ctx: any, env: any) => unknown;
/* oxlint-enable typescript/no-explicit-any */

const ALARM_META_TABLE = "_node_runtime_alarm";
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
        const stmt = storage.db.prepare(query);
        if (stmt.reader) {
          return new SqlCursor<T>(stmt.all(...normalized) as T[]);
        }
        stmt.run(...normalized);
        return new SqlCursor<T>([]);
      },
      get databaseSize(): number {
        const pageCount = storage.db.pragma("page_count", {
          simple: true,
        }) as number;
        const pageSize = storage.db.pragma("page_size", {
          simple: true,
        }) as number;
        return pageCount * pageSize;
      },
    };
  }

  async getAlarm(): Promise<number | null> {
    const row = this.db
      .prepare(`SELECT wake_at FROM ${ALARM_META_TABLE} WHERE id = 1`)
      .get() as { wake_at: number } | undefined;
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
              const instance = (await instantiate(id.name)) as Record<
                string,
                (...a: unknown[]) => unknown
              >;
              if (typeof instance[prop] !== "function") {
                throw new TypeError(`AuditScratchpad.${prop} is not a method`);
              }
              return instance[prop](...args);
            };
          },
        },
      );
    },
  };
}
