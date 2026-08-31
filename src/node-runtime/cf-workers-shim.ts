// Node stand-in for the `cloudflare:workers` virtual module, wired in via
// resolve.alias in vite.config.node.ts. Exports exactly what the app (and the
// libraries bundled with it) import from that module at runtime: `env`,
// `waitUntil`, and the DurableObject / WorkflowEntrypoint base classes.
import { nodeEnv } from "./env";

export const env = nodeEnv;

export { waitUntil, drainWaitUntil } from "./wait-until";

// Minimal base classes: enough for `extends` clauses to evaluate at module
// load and for subclasses to reach this.ctx/this.env (assigned manually so
// the property named `env` doesn't shadow this module's `env` export).
export class DurableObject<TEnv = unknown> {
  protected ctx: unknown;
  protected env: TEnv;
  constructor(ctx: unknown, workerEnv: TEnv) {
    this.ctx = ctx;
    this.env = workerEnv;
  }
}

export class WorkflowEntrypoint<TEnv = unknown, TParams = unknown> {
  protected ctx: unknown;
  protected env: TEnv;
  constructor(ctx: unknown, workerEnv: TEnv) {
    this.ctx = ctx;
    this.env = workerEnv;
  }
  // Subclasses override run(event, step); the workflow engine invokes it.
  declare run: (event: { payload: TParams }, step: unknown) => Promise<unknown>;
}

// A few libraries feature-detect `WorkerEntrypoint`; harmless to provide.
export class WorkerEntrypoint<TEnv = unknown> {
  protected ctx: unknown;
  protected env: TEnv;
  constructor(ctx: unknown, workerEnv: TEnv) {
    this.ctx = ctx;
    this.env = workerEnv;
  }
}

// The agents SDK imports RpcTarget for its RPC surface; nothing instantiates
// it under Node until the chat milestone.
// oxlint-disable-next-line typescript/no-extraneous-class
export class RpcTarget {}

// The agents SDK reads these defensively (`tracing ?? fallback`,
// `exports`-based class discovery). Empty values make it take its fallbacks.
export const tracing = undefined;
// eslint-disable-next-line unicorn/prefer-module -- workerd module registry, not CJS
export const exports: Record<string, unknown> = {};
