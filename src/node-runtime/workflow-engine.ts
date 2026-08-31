// Node replacement for Cloudflare Workflows, faithful to the semantics the
// upstream workflows rely on:
//   - step.do memoizes results (a re-run replays completed steps from the
//     `node_workflow_steps` table instead of re-executing them — the property
//     the paid Lighthouse/DataForSEO steps depend on)
//   - per-step retry budgets + timeouts from WorkflowStepConfig
//   - NonRetryableError fails a step immediately
//   - step.sleep survives process restarts (the BullMQ job is re-run and the
//     replay skips completed steps and already-elapsed sleeps)
//   - instance.status() reports {status, error} exactly like the reconciler
//     and rank-check guards expect; get() on an unknown id throws a
//     "not found" error (the reconciler regex-matches that message).
//
// Execution: one BullMQ queue ("openseo-workflows"), jobId = instance id, so
// duplicate create() calls dedupe. The worker runs in-process (started from
// the server entry) — one container, no separate deployment unit.
import { Queue, Worker, type Job } from "bullmq";
import postgres from "postgres";

type StepConfig = {
  retries?: { limit: number; delay: string | number; backoff?: string };
  timeout?: string | number;
};

// Loose on purpose: the real classes type ctx/env/event/step with workerd
// types; the engine supplies structurally compatible Node objects.
/* oxlint-disable typescript/no-explicit-any */
type WorkflowClass = new (
  ctx: any,
  env: any,
) => {
  run(event: any, step: any): Promise<unknown>;
};
/* oxlint-enable typescript/no-explicit-any */

const QUEUE_NAME = "openseo-workflows";

let sqlClient: postgres.Sql | undefined;
let queue: Queue | undefined;
let worker: Worker | undefined;
const registry = new Map<string, WorkflowClass>();

function sql(): postgres.Sql {
  if (!sqlClient) {
    const url = process.env.POSTGRES_DATABASE_URL;
    if (!url) throw new Error("POSTGRES_DATABASE_URL is required");
    sqlClient = postgres(url, { max: 3, prepare: false });
  }
  return sqlClient;
}

async function ensureTables(): Promise<void> {
  await sql()`
    create table if not exists node_workflow_runs (
      id text primary key,
      workflow_name text not null,
      params text not null,
      status text not null default 'queued',
      error text,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )`;
  await sql()`
    create table if not exists node_workflow_steps (
      instance_id text not null,
      step_name text not null,
      output text,
      completed_at timestamptz not null default now(),
      primary key (instance_id, step_name)
    )`;
}

function redisConnection() {
  const url = new URL(process.env.REDIS_URL ?? "redis://localhost:6379");
  return {
    host: url.hostname,
    port: Number(url.port || 6379),
    password: url.password || undefined,
    // BullMQ requirement for blocking commands.
    maxRetriesPerRequest: null,
  };
}

function getQueue(): Queue {
  if (!queue) {
    queue = new Queue(QUEUE_NAME, { connection: redisConnection() });
  }
  return queue;
}

// "5 seconds" | "2 minutes" | "1 hour" | number (ms)
export function parseDuration(value: string | number | undefined): number {
  if (value === undefined) return 0;
  if (typeof value === "number") return value;
  const match = /^(\d+(?:\.\d+)?)\s*(ms|milliseconds?|s|seconds?|m|minutes?|h|hours?|d|days?)$/.exec(
    value.trim(),
  );
  if (!match) throw new Error(`Unparseable workflow duration: ${value}`);
  const amount = Number(match[1]);
  const unit = match[2];
  if (unit.startsWith("ms") || unit.startsWith("millisecond")) return amount;
  if (unit.startsWith("s")) return amount * 1000;
  if (unit.startsWith("m") && !unit.startsWith("ms")) return amount * 60_000;
  if (unit.startsWith("h")) return amount * 3_600_000;
  return amount * 86_400_000;
}

function isNonRetryable(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === "NonRetryableError" ||
      error.name === "WorkflowTerminatedError")
  );
}

class WorkflowTerminatedError extends Error {
  constructor(instanceId: string) {
    super(`Workflow instance ${instanceId} was terminated`);
    this.name = "WorkflowTerminatedError";
  }
}

class NodeWorkflowStep {
  constructor(private readonly instanceId: string) {}

  private async memoized(stepName: string): Promise<{ hit: boolean; output?: unknown }> {
    const rows = await sql()`
      select output from node_workflow_steps
      where instance_id = ${this.instanceId} and step_name = ${stepName}`;
    if (rows.length === 0) return { hit: false };
    const raw = rows[0].output as string | null;
    return { hit: true, output: raw === null ? undefined : JSON.parse(raw) };
  }

  private async persist(stepName: string, output: unknown): Promise<void> {
    const raw = output === undefined ? null : JSON.stringify(output);
    await sql()`
      insert into node_workflow_steps (instance_id, step_name, output)
      values (${this.instanceId}, ${stepName}, ${raw})
      on conflict (instance_id, step_name) do nothing`;
  }

  private async assertNotTerminated(): Promise<void> {
    const rows = await sql()`
      select status from node_workflow_runs where id = ${this.instanceId}`;
    if (rows[0]?.status === "terminated") {
      throw new WorkflowTerminatedError(this.instanceId);
    }
  }

  // Overloads mirror step.do(name, fn) and step.do(name, config, fn).
  async do<T>(name: string, configOrFn: StepConfig | (() => Promise<T>), maybeFn?: () => Promise<T>): Promise<T> {
    const config = typeof configOrFn === "function" ? undefined : configOrFn;
    const fn = typeof configOrFn === "function" ? configOrFn : maybeFn!;

    const cached = await this.memoized(name);
    if (cached.hit) return cached.output as T;

    await this.assertNotTerminated();

    const retryLimit = config?.retries?.limit ?? 3;
    const baseDelay = parseDuration(config?.retries?.delay ?? "1 second");
    const backoff = config?.retries?.backoff ?? "exponential";
    const timeoutMs = config?.timeout
      ? parseDuration(config.timeout)
      : 10 * 60_000;

    let attempt = 0;
    // CF semantics: `limit` is the number of retries after the first attempt.
    for (;;) {
      try {
        const result = await withTimeout(fn(), timeoutMs, name);
        await this.persist(name, result);
        return result;
      } catch (error) {
        if (isNonRetryable(error) || attempt >= retryLimit) throw error;
        const delay =
          backoff === "constant"
            ? baseDelay
            : backoff === "linear"
              ? baseDelay * (attempt + 1)
              : baseDelay * 2 ** attempt;
        attempt += 1;
        console.warn(
          `[workflow ${this.instanceId}] step "${name}" failed (attempt ${attempt}/${retryLimit + 1}), retrying in ${delay}ms:`,
          error instanceof Error ? error.message : error,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        await this.assertNotTerminated();
      }
    }
  }

  // Durable-enough sleep: persist the wake-up time on first pass, then wait
  // out the remainder. A replay after a crash re-enters here, finds the
  // stamp, and only waits whatever is still left.
  async sleep(name: string, duration: string | number): Promise<void> {
    const stepName = `sleep:${name}`;
    const cached = await this.memoized(stepName);
    const wakeAt = cached.hit
      ? (cached.output as number)
      : Date.now() + parseDuration(duration);
    if (!cached.hit) await this.persist(stepName, wakeAt);
    const remaining = wakeAt - Date.now();
    if (remaining > 0) {
      await new Promise((resolve) => setTimeout(resolve, remaining));
    }
    await this.assertNotTerminated();
  }

  async sleepUntil(name: string, timestamp: Date | number): Promise<void> {
    const wakeAt = typeof timestamp === "number" ? timestamp : timestamp.getTime();
    await this.sleep(name, Math.max(0, wakeAt - Date.now()));
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`Step "${label}" timed out after ${ms}ms`)),
      ms,
    );
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

async function setRunStatus(
  instanceId: string,
  status: string,
  error?: string,
): Promise<void> {
  await sql()`
    update node_workflow_runs
    set status = ${status}, error = ${error ?? null}, updated_at = now()
    where id = ${instanceId}
      and status not in ('terminated', 'complete')`;
}

async function processJob(job: Job): Promise<void> {
  const { workflowName, instanceId } = job.data as {
    workflowName: string;
    instanceId: string;
  };
  const rows = await sql()`
    select params, status, created_at from node_workflow_runs where id = ${instanceId}`;
  if (rows.length === 0) throw new Error(`Run row missing for ${instanceId}`);
  if (["terminated", "complete", "errored"].includes(rows[0].status)) return;

  const WorkflowCtor = registry.get(workflowName);
  if (!WorkflowCtor) throw new Error(`No workflow registered as ${workflowName}`);

  await setRunStatus(instanceId, "running");
  const { nodeEnv } = await import("./env");
  const instance = new WorkflowCtor({}, nodeEnv);
  const step = new NodeWorkflowStep(instanceId);
  try {
    await instance.run(
      {
        payload: JSON.parse(rows[0].params as string),
        timestamp: new Date(rows[0].created_at as string),
        instanceId,
      },
      step,
    );
    await setRunStatus(instanceId, "complete");
  } catch (error) {
    if (error instanceof WorkflowTerminatedError) return;
    const message = error instanceof Error ? error.message : String(error);
    await setRunStatus(instanceId, "errored", message);
    // Don't rethrow: run state lives in node_workflow_runs, and a BullMQ-level
    // retry would restart run() without the engine's step semantics deciding.
    console.error(`[workflow ${instanceId}] errored:`, message);
  }
}

export function registerWorkflows(classes: Record<string, WorkflowClass>): void {
  for (const [name, ctor] of Object.entries(classes)) {
    registry.set(name, ctor);
  }
}

export async function startWorkflowWorker(): Promise<void> {
  if (worker) return;
  await ensureTables();
  worker = new Worker(QUEUE_NAME, processJob, {
    connection: redisConnection(),
    concurrency: Number(process.env.WORKFLOW_CONCURRENCY ?? 2),
    // A crashed process leaves its job "stalled"; BullMQ re-queues it and the
    // step memoization makes the re-run a replay, not a repeat.
    stalledInterval: 30_000,
    maxStalledCount: 10,
  });
  worker.on("failed", (job, err) => {
    console.error(`[workflow-worker] job ${job?.id} failed:`, err.message);
  });
  console.log("[node-runtime] workflow worker started");
}

export function makeWorkflowBinding(workflowName: string) {
  return {
    async create(options: { id?: string; params?: unknown }) {
      const instanceId = options.id ?? crypto.randomUUID();
      await ensureTables();
      await sql()`
        insert into node_workflow_runs (id, workflow_name, params, status)
        values (${instanceId}, ${workflowName}, ${JSON.stringify(options.params ?? {})}, 'queued')
        on conflict (id) do nothing`;
      await getQueue().add(
        workflowName,
        { workflowName, instanceId },
        { jobId: instanceId, removeOnComplete: 1000, removeOnFail: 1000 },
      );
      return { id: instanceId };
    },

    async get(instanceId: string) {
      const rows = await sql()`
        select status, error from node_workflow_runs where id = ${instanceId}`;
      if (rows.length === 0) {
        // The audit reconciler regex-matches /not[ _]?found/i on this message.
        throw new Error(`Workflow instance not found: ${instanceId}`);
      }
      return {
        id: instanceId,
        async status() {
          const current = await sql()`
            select status, error from node_workflow_runs where id = ${instanceId}`;
          return {
            status: (current[0]?.status ?? "unknown") as string,
            error: (current[0]?.error as string | null) ?? undefined,
          };
        },
        async terminate() {
          await sql()`
            update node_workflow_runs
            set status = 'terminated', updated_at = now()
            where id = ${instanceId} and status in ('queued', 'running')`;
          const job = await getQueue().getJob(instanceId);
          if (job) {
            const state = await job.getState();
            if (state === "waiting" || state === "delayed") {
              await job.remove();
            }
          }
        },
      };
    },
  };
}
