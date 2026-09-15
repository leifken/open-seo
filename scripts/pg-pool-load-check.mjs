// Connection-leak check for the Node runtime (see src/node-runtime/pg-client.ts).
// Fires N parallel MCP `tools/call whoami` requests at a running server in
// AUTH_MODE=local_noauth and counts Postgres client backends before, right
// after, and once the burst has settled. Every whoami call resolves the local
// admin through the DB, so each request exercises the pool.
//
// Usage (server started with DATABASE_PROVIDER=postgres, AUTH_MODE=local_noauth):
//   POSTGRES_DATABASE_URL=postgres://openseo:openseo@127.0.0.1:5433/openseo \
//     node scripts/pg-pool-load-check.mjs --url http://localhost:3001/mcp --requests 50 --max 20
// Exits 1 when the settled connection count exceeds --max.
import postgres from "postgres";

const args = new Map();
for (let i = 2; i < process.argv.length; i += 2) {
  args.set(process.argv[i].replace(/^--/, ""), process.argv[i + 1]);
}
const mcpUrl = args.get("url") ?? "http://localhost:3001/mcp";
const requests = Number(args.get("requests") ?? 50);
const max = Number(args.get("max") ?? 20);
const settleMs = Number(args.get("settle-ms") ?? 2000);
const databaseUrl = process.env.POSTGRES_DATABASE_URL;
if (!databaseUrl) {
  console.error("POSTGRES_DATABASE_URL is required");
  process.exit(2);
}

const sql = postgres(databaseUrl, { max: 1 });
const database = new URL(databaseUrl).pathname.slice(1);

async function countConnections() {
  const [row] = await sql`
    select count(*)::int as n
    from pg_stat_activity
    where datname = ${database}
      and backend_type = 'client backend'
      and pid <> pg_backend_pid()
  `;
  return row.n;
}

async function callWhoami(id) {
  const res = await fetch(mcpUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id,
      method: "tools/call",
      params: { name: "whoami", arguments: {} },
    }),
  });
  const text = await res.text();
  const ok = res.ok && !text.includes('"error"');
  return { status: res.status, ok, text: ok ? "" : text.slice(0, 200) };
}

const before = await countConnections();
const started = Date.now();
const results = await Promise.all(
  Array.from({ length: requests }, (_, i) => callWhoami(i + 1)),
);
const elapsedMs = Date.now() - started;
const afterBurst = await countConnections();
await new Promise((resolve) => setTimeout(resolve, settleMs));
const settled = await countConnections();
await sql.end();

const okCount = results.filter((r) => r.ok).length;
const failures = results.filter((r) => !r.ok);
console.log(
  JSON.stringify(
    {
      mcpUrl,
      requests,
      ok: okCount,
      failed: failures.length,
      elapsedMs,
      connections: { before, afterBurst, settled },
      max,
    },
    null,
    2,
  ),
);
if (failures.length > 0) {
  console.log("first failure:", failures[0]);
}
process.exit(settled > max || okCount !== requests ? 1 : 0);
