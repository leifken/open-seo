/* oxlint-disable typescript/no-unsafe-return, typescript/no-unsafe-type-assertion -- The proxy resolves the lazily created process-wide Postgres pool. */
/* oxlint-disable eslint/no-restricted-imports -- This file replaces the src/db/pg/client.ts seam in the Node build, so it needs the dialect-specific retry helper and schema. */
// Node replacement for the upstream src/db/pg/client.ts, wired in by the
// resolveId hook in vite.config.node.ts. Same exports, same contract for the
// callers (`pgDb` handle, `withPgClient` around every entrypoint) — but backed
// by ONE postgres.js pool per process instead of one client per request.
//
// Upstream opens a fresh `postgres(..., { max: 1 })` inside `withPgClient` on
// every request and never calls `sql.end()`: on Workers that is correct (a
// socket may not outlive its invocation, Hyperdrive pools at the edge, and the
// runtime reclaims the socket when the invocation ends). In Node nothing
// reclaims it — postgres.js keeps idle connections open forever by default —
// so every request that touched the DB leaked one connection until Postgres
// answered "sorry, too many clients already" (seo.leifken.ai, 2026-09-15,
// max_connections=100 exhausted after ~35 MCP calls).
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getPostgresConnectionString } from "@/db/provider";
import { withQueryRetries } from "@/db/pg/retry";
import * as schema from "@/db/pg/schema";

type Sql = ReturnType<typeof postgres>;
type PgDb = ReturnType<typeof createPgDb>;

function createPgDb(sql: Sql) {
  return drizzle(sql, { schema });
}

// Conservative: Postgres in compose.node.yaml ships with max_connections=100,
// and migrations, psql sessions and a restarting container share that budget.
const DEFAULT_POOL_MAX = 20;

function poolMax(): number {
  const raw = process.env.POSTGRES_POOL_MAX;
  const parsed = raw ? Number.parseInt(raw, 10) : Number.NaN;
  return Number.isInteger(parsed) && parsed > 0 ? parsed : DEFAULT_POOL_MAX;
}

// Keyed by connection string so a changed URL (tests, a swapped binding)
// yields its own pool instead of silently reusing the old one.
const pools = new Map<string, PgDb>();

function getPool(): PgDb {
  const connectionString = getPostgresConnectionString();
  let db = pools.get(connectionString);
  if (!db) {
    const sql = withQueryRetries(
      postgres(connectionString, {
        max: poolMax(),
        // Seconds. Idle connections are closed, long-lived ones recycled, so a
        // burst never pins the whole budget and failovers don't leave stale
        // sockets behind.
        idle_timeout: 30,
        max_lifetime: 30 * 60,
        connect_timeout: 10,
        fetch_types: false,
      }),
    );
    db = createPgDb(sql);
    pools.set(connectionString, db);
  }
  return db;
}

export const pgDb = new Proxy(
  {},
  {
    get(_target, prop, receiver) {
      return Reflect.get(getPool(), prop, receiver);
    },
  },
) as PgDb;

/**
 * Same signature as the upstream `withPgClient`; entrypoints keep wrapping DB
 * work in it. The pool is process-wide and created lazily on first query, so
 * there is nothing to set up or tear down per request.
 */
export function withPgClient<T>(fn: () => Promise<T>): Promise<T> {
  return fn();
}
