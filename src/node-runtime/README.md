# Node runtime compatibility layer

This directory contains the LEIFKEN self-host Node port. It re-implements the
Cloudflare Workers surface the upstream app consumes, so upstream code stays
untouched and `git merge upstream/main` keeps working.

## How it plugs in

- `vite.config.node.ts` (repo root) builds the app WITHOUT
  `@cloudflare/vite-plugin` and aliases the Cloudflare virtual modules:
  - `cloudflare:workers` → `cf-workers-shim.ts` (env, waitUntil, DurableObject,
    WorkflowEntrypoint)
  - `cloudflare:workflows` → `cf-workflows-shim.ts` (NonRetryableError)
- `entry.ts` is the TanStack Start server entry for the Node build. It calls
  the untouched upstream `src/server.ts` default export with a Node-built
  `env` object and an `ExecutionContext` shim.

## Binding implementations

| Cloudflare binding | Node implementation |
|---|---|
| `KV`, `OAUTH_KV` (KVNamespace) | `kv-redis.ts` (Redis via ioredis) |
| `R2` (R2Bucket) | `r2-fs.ts` (filesystem under `DATA_DIR/r2`) |
| `DB` (D1) | not supported — `DATABASE_PROVIDER=postgres` is required |
| `HYPERDRIVE` | plain object carrying `POSTGRES_DATABASE_URL` |
| `SITE_AUDIT_WORKFLOW`, `RANK_CHECK_WORKFLOW` | `workflow-engine/` (BullMQ) |
| `AUDIT_SCRATCHPAD` (DO) | `do-scratchpad.ts` (better-sqlite3, one DB per audit) |
| `ONBOARDING_CHAT`, `SAM_CHAT` (DO) | ported last; unavailable stubs until then |

## Environment variables (Node-only)

- `POSTGRES_DATABASE_URL` (required)
- `REDIS_URL` (required, e.g. `redis://redis:6379`)
- `DATA_DIR` (default `./data`) — R2 objects + scratchpad SQLite files

## Rules

- Never edit upstream files from here; if upstream adds a new Cloudflare
  surface, extend the shims instead.
- Keep every shim's behavior aligned with the workerd semantics the upstream
  code relies on (see comments in each file for the exact contract).
