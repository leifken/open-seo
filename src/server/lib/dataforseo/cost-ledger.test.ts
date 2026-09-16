import { describe, expect, it } from "vitest";
import {
  currentDataforseoCost,
  recordDataforseoCost,
  roundUsd,
  runWithDataforseoCostLedger,
} from "@/server/lib/dataforseo/cost-ledger";

const billing = (path: string[], costUsd: number) => ({ path, costUsd });

describe("roundUsd", () => {
  it("rounds to 1/10,000 of a cent", () => {
    expect(roundUsd(0.1 + 0.2)).toBe(0.3);
    expect(roundUsd(0.123456789)).toBe(0.123457);
  });
});

describe("runWithDataforseoCostLedger", () => {
  it("reports zero cost when nothing is recorded", async () => {
    const outcome = await runWithDataforseoCostLedger(async () => "ok");
    expect(outcome).toEqual({
      ok: true,
      value: "ok",
      cost: { costUsd: 0, dataforseoCalls: 0, costBreakdown: [] },
    });
  });

  it("sums repeated calls to the same path into one breakdown entry", async () => {
    const outcome = await runWithDataforseoCostLedger(async () => {
      recordDataforseoCost(billing(["v3", "serp", "live"], 0.002));
      recordDataforseoCost(billing(["v3", "serp", "live"], 0.003));
      return "done";
    });
    expect(outcome.ok).toBe(true);
    expect(outcome.cost).toEqual({
      costUsd: 0.005,
      dataforseoCalls: 2,
      costBreakdown: [
        { path: "v3/serp/live", calls: 2, costUsd: 0.005 },
      ],
    });
  });

  it("sorts the breakdown by cost, highest first", async () => {
    const outcome = await runWithDataforseoCostLedger(async () => {
      recordDataforseoCost(billing(["v3", "cheap"], 0.001));
      recordDataforseoCost(billing(["v3", "expensive"], 0.1));
      return null;
    });
    expect(outcome.cost.costBreakdown.map((e) => e.path)).toEqual([
      "v3/expensive",
      "v3/cheap",
    ]);
  });

  it("still reports cost recorded before the handler threw", async () => {
    const outcome = await runWithDataforseoCostLedger(async () => {
      recordDataforseoCost(billing(["v3", "serp", "live"], 0.004));
      throw new Error("boom");
    });
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) expect(outcome.error).toBeInstanceOf(Error);
    expect(outcome.cost.costUsd).toBe(0.004);
    expect(outcome.cost.dataforseoCalls).toBe(1);
  });

  it("treats a non-finite cost as 0 instead of poisoning the sum", async () => {
    const outcome = await runWithDataforseoCostLedger(async () => {
      recordDataforseoCost(billing(["v3", "x"], Number.NaN));
      recordDataforseoCost(billing(["v3", "x"], 0.01));
    });
    expect(outcome.cost.costUsd).toBe(0.01);
    expect(outcome.cost.dataforseoCalls).toBe(2);
  });

  it("keeps concurrent scopes isolated from each other", async () => {
    const [a, b] = await Promise.all([
      runWithDataforseoCostLedger(async () => {
        recordDataforseoCost(billing(["v3", "a"], 0.01));
        await new Promise((resolve) => setTimeout(resolve, 5));
        return "a";
      }),
      runWithDataforseoCostLedger(async () => {
        recordDataforseoCost(billing(["v3", "b"], 0.02));
        return "b";
      }),
    ]);
    expect(a.cost.costUsd).toBe(0.01);
    expect(b.cost.costUsd).toBe(0.02);
  });

  it("nests scopes: a child records into itself and every enclosing scope", async () => {
    const outer = await runWithDataforseoCostLedger(async () => {
      recordDataforseoCost(billing(["v3", "outer"], 0.01));
      const inner = await runWithDataforseoCostLedger(async () => {
        recordDataforseoCost(billing(["v3", "inner"], 0.02));
        return currentDataforseoCost();
      });
      return inner.ok ? inner.value : null;
    });
    // The inner scope only sees its own call while it's running...
    expect(outer.ok && outer.value).toEqual({
      costUsd: 0.02,
      dataforseoCalls: 1,
      costBreakdown: [{ path: "v3/inner", calls: 1, costUsd: 0.02 }],
    });
    // ...but the outer scope accumulates both.
    expect(outer.cost.costUsd).toBe(0.03);
    expect(outer.cost.dataforseoCalls).toBe(2);
  });
});

describe("recordDataforseoCost", () => {
  it("is a no-op outside any ledger scope", () => {
    expect(() =>
      recordDataforseoCost(billing(["v3", "x"], 0.01)),
    ).not.toThrow();
    expect(currentDataforseoCost()).toBeNull();
  });
});
