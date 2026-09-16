import { AsyncLocalStorage } from "node:async_hooks";
import type { DataforseoApiCallCost } from "@/server/lib/dataforseo/envelope";

// LEIFKEN addition (RankMeister SEO-4): real DataForSEO cost per MCP call.
//
// Every billed DataForSEO task already reports its USD `cost`, and every
// fetcher carries it out through the billing envelope to meterDataforseoCall
// (client.ts). Upstream only forwards that number to Autumn in hosted billing
// mode; self-hosted deployments (and BILLING_DISABLED=true) dropped it. The
// ledger records it in every mode, scoped to the async context of one MCP tool
// call, so the tool response can report the real spend in `meta.costUsd`.
//
// Scopes nest: a child scope (e.g. one keyword inside get_serp_results) records
// into itself and every enclosing scope. Concurrent calls stay isolated because
// AsyncLocalStorage follows the promise chain, not the event loop.
//
// SDK-free on purpose: safe to import from eager server code.

export type DataforseoCostBreakdownEntry = {
  path: string;
  calls: number;
  costUsd: number;
};

export type DataforseoCostSummary = {
  costUsd: number;
  dataforseoCalls: number;
  costBreakdown: DataforseoCostBreakdownEntry[];
};

type Ledger = {
  parent: Ledger | undefined;
  entries: Map<string, { calls: number; costUsd: number }>;
};

const ledgerStorage = new AsyncLocalStorage<Ledger>();

/** USD amounts summed from floats: round to 1/10,000 cent. */
export function roundUsd(value: number): number {
  return Math.round(value * 1_000_000) / 1_000_000;
}

/** Records one billed DataForSEO task in every open ledger scope. No-op outside a scope. */
export function recordDataforseoCost(billing: DataforseoApiCallCost): void {
  const costUsd = Number.isFinite(billing.costUsd) ? billing.costUsd : 0;
  const path = billing.path.join("/");
  for (
    let ledger = ledgerStorage.getStore();
    ledger;
    ledger = ledger.parent
  ) {
    const entry = ledger.entries.get(path) ?? { calls: 0, costUsd: 0 };
    entry.calls += 1;
    entry.costUsd += costUsd;
    ledger.entries.set(path, entry);
  }
}

function summarize(ledger: Ledger): DataforseoCostSummary {
  let costUsd = 0;
  let dataforseoCalls = 0;
  const costBreakdown: DataforseoCostBreakdownEntry[] = [];
  for (const [path, entry] of ledger.entries) {
    costUsd += entry.costUsd;
    dataforseoCalls += entry.calls;
    costBreakdown.push({
      path,
      calls: entry.calls,
      costUsd: roundUsd(entry.costUsd),
    });
  }
  return {
    costUsd: roundUsd(costUsd),
    dataforseoCalls,
    costBreakdown: costBreakdown.toSorted((a, b) => b.costUsd - a.costUsd),
  };
}

export type LedgerOutcome<T> =
  | { ok: true; value: T; cost: DataforseoCostSummary }
  | { ok: false; error: unknown; cost: DataforseoCostSummary };

/**
 * Runs `fn` inside a new ledger scope and returns its outcome together with the
 * DataForSEO cost recorded while it ran — also when it throws, because a failed
 * DataForSEO task can still be billed.
 */
export async function runWithDataforseoCostLedger<T>(
  fn: () => Promise<T> | T,
): Promise<LedgerOutcome<T>> {
  const ledger: Ledger = {
    parent: ledgerStorage.getStore(),
    entries: new Map(),
  };
  return ledgerStorage.run(ledger, async () => {
    try {
      const value = await fn();
      return { ok: true as const, value, cost: summarize(ledger) };
    } catch (error) {
      return { ok: false as const, error, cost: summarize(ledger) };
    }
  });
}

/** Cost recorded so far in the innermost open scope, or null outside a scope. */
export function currentDataforseoCost(): DataforseoCostSummary | null {
  const ledger = ledgerStorage.getStore();
  return ledger ? summarize(ledger) : null;
}
