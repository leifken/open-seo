import { describe, expect, it } from "vitest";
import type { CallToolResult } from "@modelcontextprotocol/server";
import { ProtocolError, ProtocolErrorCode } from "@modelcontextprotocol/server";
import { recordDataforseoCost } from "@/server/lib/dataforseo/cost-ledger";
import { AppError } from "@/server/lib/errors";
import { buildCostMeta, withDataforseoCostMeta } from "@/server/mcp/tool-cost-meta";

const okResult = (structuredContent: Record<string, unknown>): CallToolResult => ({
  content: [{ type: "text", text: "ok" }],
  structuredContent,
});

describe("buildCostMeta", () => {
  it("omits costBreakdown when nothing was billed", () => {
    expect(
      buildCostMeta("get_serp_results", {
        costUsd: 0,
        dataforseoCalls: 0,
        costBreakdown: [],
      }),
    ).toEqual({ costUsd: 0, costCurrency: "USD", dataforseoCalls: 0 });
  });

  it("includes the breakdown when calls were billed", () => {
    const meta = buildCostMeta("get_serp_results", {
      costUsd: 0.006,
      dataforseoCalls: 2,
      costBreakdown: [{ path: "v3/serp/live", calls: 2, costUsd: 0.006 }],
    });
    expect(meta.costBreakdown).toEqual([
      { path: "v3/serp/live", calls: 2, costUsd: 0.006 },
    ]);
  });

  it("attaches the documented background-cost note for run_rank_tracker", () => {
    const meta = buildCostMeta("run_rank_tracker", {
      costUsd: 0,
      dataforseoCalls: 0,
      costBreakdown: [],
    });
    expect(meta.costNote).toMatch(/background workflow/);
  });

  it("attaches no note for a tool without one", () => {
    const meta = buildCostMeta("get_domain_overview", {
      costUsd: 0.01,
      dataforseoCalls: 1,
      costBreakdown: [{ path: "v3/x", calls: 1, costUsd: 0.01 }],
    });
    expect(meta.costNote).toBeUndefined();
  });
});

describe("withDataforseoCostMeta", () => {
  it("adds real cost to a successful result's meta and _meta", async () => {
    const handler = async () => {
      recordDataforseoCost({ path: ["v3", "serp", "live"], costUsd: 0.0025 });
      return okResult({ rows: [] });
    };
    const wrapped = withDataforseoCostMeta("get_serp_results", handler);
    const result = await wrapped({}, {});

    expect(result.isError).toBeUndefined();
    expect(result.structuredContent).toMatchObject({
      rows: [],
      meta: {
        costUsd: 0.0025,
        costCurrency: "USD",
        dataforseoCalls: 1,
        costBreakdown: [{ path: "v3/serp/live", calls: 1, costUsd: 0.0025 }],
      },
    });
    expect(result._meta).toMatchObject({
      costUsd: 0.0025,
      dataforseoCalls: 1,
    });
  });

  it("reports zero cost for a call that made no DataForSEO request", async () => {
    const wrapped = withDataforseoCostMeta("list_projects", async () =>
      okResult({ projects: [] }),
    );
    const result = await wrapped({}, {});
    expect(result.structuredContent).toMatchObject({
      meta: { costUsd: 0, dataforseoCalls: 0 },
    });
    // No calls -> no breakdown key at all (not an empty array).
    const meta = (result.structuredContent as { meta: Record<string, unknown> })
      .meta;
    expect(meta.costBreakdown).toBeUndefined();
  });

  it("converts a thrown AppError into an isError result carrying the cost billed so far", async () => {
    const wrapped = withDataforseoCostMeta("get_business_profile", async () => {
      recordDataforseoCost({
        path: ["v3", "business_data", "google", "my_business_info", "live"],
        costUsd: 0.002,
      });
      throw new AppError("UPSTREAM_UNAVAILABLE", "DataForSEO did not respond in time.");
    });

    const result = await wrapped({}, {});
    expect(result.isError).toBe(true);
    expect(result.content).toEqual([
      { type: "text", text: "DataForSEO did not respond in time." },
    ]);
    expect(result.structuredContent).toMatchObject({
      error: { code: "UPSTREAM_UNAVAILABLE", message: "DataForSEO did not respond in time." },
      meta: { costUsd: 0.002, dataforseoCalls: 1 },
    });
    expect(result._meta).toMatchObject({ costUsd: 0.002 });
  });

  it("falls back to INTERNAL_ERROR for a plain thrown Error", async () => {
    const wrapped = withDataforseoCostMeta("get_domain_overview", async () => {
      throw new Error("kaboom");
    });
    const result = await wrapped({}, {});
    expect(result.isError).toBe(true);
    expect(result.structuredContent).toMatchObject({
      error: { code: "INTERNAL_ERROR", message: "kaboom" },
    });
  });

  it("lets a UrlElicitationRequired ProtocolError escape uncaught for the SDK to handle", async () => {
    const protocolError = new ProtocolError(
      ProtocolErrorCode.UrlElicitationRequired,
      "needs a URL",
    );
    const wrapped = withDataforseoCostMeta("save_keywords", async () => {
      throw protocolError;
    });
    await expect(wrapped({}, {})).rejects.toBe(protocolError);
  });
});
