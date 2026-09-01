// TanStack Start server entry for the Node build (vite.config.node.ts).
// Delegates every request to the untouched upstream Worker entry
// (src/server.ts) with a Node-built env and ExecutionContext, and replaces
// the wrangler cron triggers with in-process timers.
import { installCfWebSocketGlobals } from "./cf-websocket-globals";
import server, { SiteAuditWorkflow, RankCheckWorkflow } from "../server";
import { nodeEnv } from "./env";
import { waitUntil } from "./cf-workers-shim";
import { registerWorkflows, startWorkflowWorker } from "./workflow-engine";

// partyserver reads these globals at request time (not at module load), so
// installing here — before any request or agent instantiation — is safe.
installCfWebSocketGlobals();

const makeCtx = (): ExecutionContext =>
  ({
    waitUntil,
    passThroughOnException() {},
    props: {},
  }) as unknown as ExecutionContext;

// The two schedules from wrangler.jsonc. server.ts dispatches on the literal
// cron string, so these must match it exactly.
const RANK_AND_RECONCILE_CRON = "*/5 * * * *";
const MCP_OAUTH_PURGE_CRON = "17 3 * * *";

function runScheduled(cron: string) {
  const controller = { cron, scheduledTime: Date.now() };
  Promise.resolve(
    server.scheduled?.(
      controller as unknown as ScheduledController,
      nodeEnv,
      makeCtx(),
    ),
  ).catch((err) => console.error(`[node-runtime] cron ${cron} failed:`, err));
}

function msUntilNextFiveMinuteMark(): number {
  const now = Date.now();
  const step = 5 * 60 * 1000;
  return step - (now % step);
}

function msUntilNextDailyUtc(hour: number, minute: number): number {
  const now = new Date();
  const next = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      hour,
      minute,
      0,
      0,
    ),
  );
  if (next.getTime() <= now.getTime()) {
    next.setUTCDate(next.getUTCDate() + 1);
  }
  return next.getTime() - now.getTime();
}

function startCron() {
  const tickFive = () => {
    runScheduled(RANK_AND_RECONCILE_CRON);
    setTimeout(tickFive, msUntilNextFiveMinuteMark());
  };
  setTimeout(tickFive, msUntilNextFiveMinuteMark()).unref?.();

  const tickDaily = () => {
    runScheduled(MCP_OAUTH_PURGE_CRON);
    setTimeout(tickDaily, msUntilNextDailyUtc(3, 17));
  };
  setTimeout(tickDaily, msUntilNextDailyUtc(3, 17)).unref?.();

  console.log("[node-runtime] cron timers armed (*/5 rank+reconcile, 03:17 UTC oauth purge)");
}

// Guard against double-arming across dev-server module reloads.
const CRON_FLAG = Symbol.for("openseo.node-runtime.cron");
const globalState = globalThis as Record<symbol, boolean>;
if (!globalState[CRON_FLAG] && process.env.DISABLE_CRON !== "1") {
  globalState[CRON_FLAG] = true;
  startCron();
}

// The workflow worker runs in-process. Workflow classes come from the
// untouched upstream entry's named exports; the registry keys must match the
// names used by makeWorkflowBinding in env.ts.
registerWorkflows({ SiteAuditWorkflow, RankCheckWorkflow });

// Provision the single admin account (no-op unless ADMIN_EMAIL/ADMIN_PASSWORD
// are set and the user doesn't exist yet).
import("./bootstrap-admin")
  .then(({ bootstrapAdminAccount }) => bootstrapAdminAccount())
  .catch((err) =>
    console.error("[node-runtime] admin bootstrap failed:", err),
  );
const WORKER_FLAG = Symbol.for("openseo.node-runtime.workflow-worker");
if (!globalState[WORKER_FLAG] && process.env.DISABLE_WORKFLOW_WORKER !== "1") {
  globalState[WORKER_FLAG] = true;
  startWorkflowWorker().catch((err) =>
    console.error("[node-runtime] workflow worker failed to start:", err),
  );
}

// Re-exported for scripts/serve-node.mjs, which serves stored profile
// pictures at /api/leifken/avatar/<key>.
export { readAvatar } from "./avatar-store";

export default {
  fetch(request: Request): Promise<Response> {
    return Promise.resolve(server.fetch(request, nodeEnv, makeCtx()));
  },
};
