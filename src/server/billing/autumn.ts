import { AppError } from "@/server/lib/errors";
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
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- billing-off returns only entitlement fields read by callers
  return {
    allowed: true,
    balance: { remaining: UNLIMITED_CREDITS },
  } as unknown as Awaited<ReturnType<Autumn["check"]>>;
}

function disabledCustomer(customerId: string) {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- self-hosted facade supplies only customer fields used by this app
  return {
    id: customerId,
    flags: { paid_plan: {}, managed_access: {} },
    subscriptions: [],
    sendEmailReceipts: false,
    balances: {
      [AUTUMN_SEO_DATA_BALANCE_FEATURE_ID]: { remaining: UNLIMITED_CREDITS },
      [AUTUMN_SEO_DATA_TOPUP_BALANCE_FEATURE_ID]: { remaining: 0 },
    },
  } as unknown as Awaited<ReturnType<Autumn["customers"]["getOrCreate"]>>;
}

// Lazy: keeps the ~450 kB autumn-js SDK out of the eager isolate startup
// graph (self-hosted deployments never load it at all); resolves instantly
// after the first call.
async function loadAutumn(): Promise<Autumn> {
  if (await isBillingDisabled())
    throw new AppError(
      "VALIDATION_ERROR",
      "Billing is disabled on this deployment.",
    );
  return (autumnPromise ??= import("autumn-js").then(
    ({ Autumn }) =>
      new Autumn({
        secretKey: () => getRequiredEnvValue("AUTUMN_SECRET_KEY"),
        // Without this client-wide value the SDK aborts check/track after
        // 5s; a per-call timeoutMs cannot raise it. A timed-out call fails
        // open: track then never charges the usage, and check returns no
        // balance.
        timeoutMs: 10_000,
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
      ? // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- billing-off track result is ignored by all callers
        ({} as Awaited<ReturnType<Autumn["track"]>>)
      : loadAutumn().then((client) => client.track(...args)),
  customers: {
    getOrCreate: async (
      ...args: Parameters<Autumn["customers"]["getOrCreate"]>
    ) =>
      (await isBillingDisabled())
        ? disabledCustomer(args[0]?.customerId ?? "self-hosted")
        : loadAutumn().then((client) => client.customers.getOrCreate(...args)),
    get: async (...args: Parameters<Autumn["customers"]["get"]>) =>
      (await isBillingDisabled())
        ? disabledCustomer(args[0].customerId)
        : loadAutumn().then((client) => client.customers.get(...args)),
    update: async (...args: Parameters<Autumn["customers"]["update"]>) =>
      (await isBillingDisabled())
        ? disabledCustomer(args[0].customerId)
        : loadAutumn().then((client) => client.customers.update(...args)),
  },
  invoices: {
    list: async (...args: Parameters<Autumn["invoices"]["list"]>) =>
      (await isBillingDisabled())
        ? { list: [], nextCursor: null }
        : loadAutumn().then((client) => client.invoices.list(...args)),
  },
  balances: {
    // Confirms or releases a hold taken by `check({ lock })`. Not in the
    // SDK's fail-open set, so a lost deduction surfaces as an error.
    finalize: async (...args: Parameters<Autumn["balances"]["finalize"]>) =>
      (await isBillingDisabled())
        ? { success: true }
        : loadAutumn().then((client) => client.balances.finalize(...args)),
  },
  billing: {
    attach: (...args: Parameters<Autumn["billing"]["attach"]>) =>
      loadAutumn().then((client) => client.billing.attach(...args)),
    openCustomerPortal: (
      ...args: Parameters<Autumn["billing"]["openCustomerPortal"]>
    ) =>
      loadAutumn().then((client) => client.billing.openCustomerPortal(...args)),
  },
};

// track() has no idempotency key, so replaying a deduction Autumn already
// processed (5xx after a successful write, dropped connection) would
// double-charge. Retry only 429s, which are rejected before processing.
// Lock checks and balances.finalize() use the same options: a replayed lock
// check surfaces 409 lock_already_exists, and a replayed finalize surfaces
// "Lock not found", on the caller's first attempt, where neither can be told
// apart from a real failure. None sets a per-call timeoutMs, so all get the
// client-wide 10s; finalize does not fail open, so a shorter deadline would
// drop deductions that Autumn completes in 5-10s.
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
