import type { Autumn } from "autumn-js";
import {
  AUTUMN_SEO_DATA_BALANCE_FEATURE_ID,
  AUTUMN_SEO_DATA_TOPUP_BALANCE_FEATURE_ID,
} from "@/shared/billing";
import {
  getOptionalEnvValue,
  getRequiredEnvValue,
} from "@/server/lib/runtime-env";

let autumnPromise: Promise<Autumn> | undefined;

// Self-hosts run AUTH_MODE=hosted for its better-auth login but have no
// Autumn account: BILLING_DISABLED=true turns this facade into a no-op
// client that reports every entitlement as granted and every balance as
// effectively unlimited (the operator pays DataForSEO directly). Neutralized
// here — the single point every billing read/write passes through — so the
// ~50 gate call sites upstream stay untouched.
const UNLIMITED_CREDITS = 1_000_000_000;

async function isBillingDisabled(): Promise<boolean> {
  return (await getOptionalEnvValue("BILLING_DISABLED")) === "true";
}

function disabledCheckResult() {
  return {
    allowed: true,
    balance: { remaining: UNLIMITED_CREDITS },
  } as unknown as Awaited<ReturnType<Autumn["check"]>>;
}

function disabledCustomer(customerId: string) {
  return {
    id: customerId,
    balances: {
      [AUTUMN_SEO_DATA_BALANCE_FEATURE_ID]: { remaining: UNLIMITED_CREDITS },
      [AUTUMN_SEO_DATA_TOPUP_BALANCE_FEATURE_ID]: { remaining: 0 },
    },
  } as unknown as Awaited<ReturnType<Autumn["customers"]["getOrCreate"]>>;
}

// Lazy: keeps the ~450 kB autumn-js SDK out of the eager isolate startup
// graph (self-hosted deployments never load it at all); resolves instantly
// after the first call.
function loadAutumn(): Promise<Autumn> {
  return (autumnPromise ??= import("autumn-js").then(
    ({ Autumn }) =>
      new Autumn({
        secretKey: () => getRequiredEnvValue("AUTUMN_SECRET_KEY"),
        // Retries 429/500/502/503/504 (per-operation retryCodes) plus
        // connection errors. Cloudflare 52x statuses are not in the SDK's
        // retry list, so those still surface immediately.
        //
        // These reads/gates (customers.getOrCreate, check) sit on the request
        // hot path, so keep the total retry window short: when Autumn is
        // rate-limiting or slow, an 8s backoff window held the isolate open
        // for seconds on every request and cascaded into region-wide
        // congestion (incident 2026-07-06). Fail fast instead — a caller that
        // can't gate surfaces an error rather than hanging.
        retryConfig: {
          strategy: "backoff",
          backoff: {
            initialInterval: 250,
            maxInterval: 1000,
            exponent: 1.5,
            maxElapsedTime: 2500,
          },
          retryConnectionErrors: true,
        },
      }),
  ));
}

/** Shape-preserving lazy facade over the SDK client: call sites keep the
 *  plain `autumn.check(...)` form. Covers only the methods we use — add a
 *  line here when adopting a new one. */
export const autumn = {
  check: async (...args: Parameters<Autumn["check"]>) =>
    (await isBillingDisabled())
      ? disabledCheckResult()
      : loadAutumn().then((client) => client.check(...args)),
  track: async (...args: Parameters<Autumn["track"]>) =>
    (await isBillingDisabled())
      ? ({} as Awaited<ReturnType<Autumn["track"]>>)
      : loadAutumn().then((client) => client.track(...args)),
  customers: {
    getOrCreate: async (
      ...args: Parameters<Autumn["customers"]["getOrCreate"]>
    ) =>
      (await isBillingDisabled())
        ? disabledCustomer(args[0]?.customerId ?? "self-hosted")
        : loadAutumn().then((client) => client.customers.getOrCreate(...args)),
  },
};

// track() has no idempotency key, so replaying a deduction Autumn already
// processed (5xx after a successful write, dropped connection) would
// double-charge. Retry only 429s, which are rejected before processing.
export const AUTUMN_TRACK_RETRY_OPTIONS: Parameters<Autumn["track"]>[1] = {
  retryCodes: ["429"],
  retries: {
    strategy: "backoff",
    backoff: {
      initialInterval: 250,
      maxInterval: 2000,
      exponent: 1.5,
      maxElapsedTime: 8000,
    },
    retryConnectionErrors: false,
  },
};
