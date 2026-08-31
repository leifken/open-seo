// waitUntil lives in its own module so binding shims can use it without
// importing the env-carrying cf-workers-shim (avoids an import cycle).
const pending = new Set<Promise<unknown>>();

export function waitUntil(promise: Promise<unknown>): void {
  pending.add(promise);
  promise
    .catch((err) => console.error("[node-runtime] waitUntil task failed:", err))
    .finally(() => pending.delete(promise));
}

export function drainWaitUntil(): Promise<unknown> {
  return Promise.allSettled(pending);
}
