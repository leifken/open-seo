// Node stand-in for the `cloudflare:workers` virtual module, wired in via
// resolve.alias in vite.config.node.ts. Exports exactly what the app (and the
// libraries bundled with it) import from that module at runtime: `env`,
// `waitUntil`, and the DurableObject / WorkflowEntrypoint base classes.
import { nodeEnv } from "./env";

export const env = nodeEnv;

// Track background work so a graceful shutdown can drain it, mirroring
// workerd's invocation-lifetime guarantee closely enough for our use.
const pending = new Set<Promise<unknown>>();

export function waitUntil(promise: Promise<unknown>): void {
  pending.add(promise);
  promise
    .catch((err) => console.error("[node-runtime] waitUntil task failed:", err))
    .finally(() => pending.delete(promise));
}

export function drainWaitUntil(): Promise<unknown> {
  return Promise.allSettled([...pending]);
}

// Minimal base classes: enough for `extends` clauses to evaluate at module
// load. The scratchpad DO gets a real ctx from the do-scratchpad milestone;
// until then nothing instantiates these under Node.
export class DurableObject<TEnv = unknown> {
  constructor(
    protected ctx: unknown,
    protected env: TEnv,
  ) {}
}

export class WorkflowEntrypoint<TEnv = unknown, TParams = unknown> {
  constructor(
    protected ctx: unknown,
    protected env: TEnv,
  ) {}
  // Subclasses override run(event, step); the workflow engine invokes it.
  declare run: (event: { payload: TParams }, step: unknown) => Promise<unknown>;
}

// A few libraries feature-detect `WorkerEntrypoint`; harmless to provide.
export class WorkerEntrypoint<TEnv = unknown> {
  constructor(
    protected ctx: unknown,
    protected env: TEnv,
  ) {}
}

// The agents SDK imports RpcTarget for its RPC surface; nothing instantiates
// it under Node until the chat milestone.
export class RpcTarget {}

// The agents SDK reads these defensively (`tracing ?? fallback`,
// `exports`-based class discovery). Empty values make it take its fallbacks.
export const tracing = undefined;
// eslint-disable-next-line unicorn/prefer-module -- workerd module registry, not CJS
export const exports: Record<string, unknown> = {};
