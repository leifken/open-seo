// The Node replacement for the Workers `env` object: Cloudflare bindings are
// backed by Node implementations, every other property falls through to
// process.env (mirroring CLOUDFLARE_INCLUDE_PROCESS_ENV in the Docker
// self-host, which the app's config reading already relies on).
import { RedisKvNamespace } from "./kv-redis";
import { FsBucket } from "./r2-fs";
import {
  makeUnportedDurableObjectNamespace,
  makeUnportedWorkflowBinding,
} from "./unported";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required for the Node runtime`);
  }
  return value;
}

// D1 has no Node backing; the Node runtime is Postgres-only. Poison the
// binding so a misconfigured DATABASE_PROVIDER fails with the fix, not a
// confusing crash deep inside drizzle.
const d1Poison = new Proxy(
  {},
  {
    get() {
      throw new Error(
        "D1 is not available in the Node runtime. Set DATABASE_PROVIDER=postgres and POSTGRES_DATABASE_URL.",
      );
    },
  },
);

const bindings: Record<string, unknown> = {
  KV: new RedisKvNamespace("kv"),
  OAUTH_KV: new RedisKvNamespace("oauth-kv"),
  R2: new FsBucket(),
  DB: d1Poison,
  get HYPERDRIVE() {
    return { connectionString: required("POSTGRES_DATABASE_URL") };
  },
  SITE_AUDIT_WORKFLOW: makeUnportedWorkflowBinding("SITE_AUDIT_WORKFLOW"),
  RANK_CHECK_WORKFLOW: makeUnportedWorkflowBinding("RANK_CHECK_WORKFLOW"),
  AUDIT_SCRATCHPAD: makeUnportedDurableObjectNamespace("AUDIT_SCRATCHPAD"),
  // Chat agents (SAM, onboarding) are the last porting milestone. Leaving the
  // bindings out entirely makes `routeAgentRequest` fall through to 404.
};

export const nodeEnv = new Proxy(bindings, {
  get(target, prop) {
    if (typeof prop !== "string") return undefined;
    if (prop in target) return target[prop];
    return process.env[prop];
  },
  has(target, prop) {
    return typeof prop === "string" && (prop in target || prop in process.env);
  },
}) as unknown as Env;
