import { beforeEach, describe, expect, it, vi } from "vitest";
import { whoamiTool } from "./whoami";
import { makeToolContext, textContent } from "./tool-test-support";

const mocks = vi.hoisted(() => ({
  isHostedServerAuthMode: vi.fn(),
  autumnCheck: vi.fn(),
  fetchUserData: vi.fn(),
  getCached: vi.fn(),
  setCached: vi.fn(),
}));

vi.mock("cloudflare:workers", () => ({ env: {} }));

vi.mock("@/server/lib/runtime-env", () => ({
  isHostedServerAuthMode: mocks.isHostedServerAuthMode,
}));

vi.mock("@/server/billing/autumn", () => ({
  autumn: { check: mocks.autumnCheck },
}));

vi.mock("@/server/lib/dataforseo", () => ({
  fetchUserData: mocks.fetchUserData,
}));

vi.mock("@/server/lib/r2-cache", () => ({
  buildCacheKey: (prefix: string) => Promise.resolve(`${prefix}:key`),
  getCached: mocks.getCached,
  setCached: mocks.setCached,
}));

const toolContext = makeToolContext();

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getCached.mockResolvedValue(null);
  mocks.isHostedServerAuthMode.mockResolvedValue(false);
});

describe("whoami", () => {
  it("reports the DataForSEO account balance from a fresh appendix/user_data call and caches it", async () => {
    mocks.fetchUserData.mockResolvedValue({
      login: "leifken",
      money: { total: 100, balance: 43.22 },
    });

    const result = await whoamiTool.handler({}, toolContext);

    expect(result.structuredContent.dataforseoAccountBalance).toMatchObject({
      balanceUsd: 43.22,
      depositedTotalUsd: 100,
    });
    expect(textContent(result)).toContain("$43.22 left of $100.00 deposited");
    expect(mocks.setCached).toHaveBeenCalledTimes(1);
    expect(mocks.setCached).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ balanceUsd: 43.22, depositedTotalUsd: 100 }),
      5 * 60,
    );
  });

  it("serves the cached balance without calling DataForSEO again", async () => {
    mocks.getCached.mockResolvedValue({
      balanceUsd: 12.5,
      depositedTotalUsd: 60,
      fetchedAt: "2026-09-21T10:00:00.000Z",
    });

    const result = await whoamiTool.handler({}, toolContext);

    expect(mocks.fetchUserData).not.toHaveBeenCalled();
    expect(result.structuredContent.dataforseoAccountBalance).toMatchObject({
      balanceUsd: 12.5,
    });
  });

  it("degrades to null instead of failing the whole call when DataForSEO is unreachable", async () => {
    mocks.fetchUserData.mockRejectedValue(new Error("network error"));

    const result = await whoamiTool.handler({}, toolContext);

    expect(result.isError).toBeUndefined();
    expect(result.structuredContent.dataforseoAccountBalance).toBeNull();
    expect(textContent(result)).toContain("DataForSEO account balance: unknown");
  });

  it("still reports hosted credits alongside the DataForSEO balance", async () => {
    mocks.isHostedServerAuthMode.mockResolvedValue(true);
    mocks.autumnCheck.mockResolvedValue({ balance: { remaining: 250 } });
    mocks.fetchUserData.mockResolvedValue({ money: { total: 10, balance: 5 } });

    const result = await whoamiTool.handler({}, toolContext);

    expect(result.structuredContent.creditsRemaining).toBe(500);
    expect(result.structuredContent.dataforseoAccountBalance).toMatchObject({
      balanceUsd: 5,
    });
  });
});
