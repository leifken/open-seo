import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/server/lib/runtime-env", () => ({
  getRequiredEnvValue: vi.fn(async () => "test-api-key"),
}));

import {
  fetchDomainIntersection,
  fetchHistoricalRankOverview,
  fetchKeywordsForSite,
} from "@/server/lib/dataforseo/labs";

function stubDataforseo(payload: unknown) {
  const fetchMock = vi
    .fn<typeof fetch>()
    .mockResolvedValue(Response.json(payload));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function requestBody(fetchMock: ReturnType<typeof stubDataforseo>): unknown {
  const [, init] = fetchMock.mock.calls[0];
  const body = init?.body;
  return typeof body === "string" ? (JSON.parse(body) as unknown) : null;
}

const okTask = (path: string[], result: unknown[]) => ({
  status_code: 20000,
  tasks: [{ status_code: 20000, path, cost: 0.02, result }],
});

describe("fetchDomainIntersection", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("sends target_1/target_2 and the intersections flag, and returns the items", async () => {
    const fetchMock = stubDataforseo(
      okTask(
        ["v3", "dataforseo_labs", "google", "domain_intersection", "live"],
        [
          {
            items: [
              {
                keyword_data: { keyword: "webdesign nottuln" },
                first_domain_serp_element: null,
                second_domain_serp_element: { rank_absolute: 3, url: "https://rival.example/" },
              },
            ],
          },
        ],
      ),
    );

    const result = await fetchDomainIntersection({
      target1: "example.com",
      target2: "rival.example",
      locationCode: 2276,
      languageCode: "de",
      intersections: false,
      limit: 100,
    });

    expect(requestBody(fetchMock)).toMatchObject([
      { target_1: "example.com", target_2: "rival.example", intersections: false },
    ]);
    expect(result.data).toHaveLength(1);
    expect(result.data[0]?.second_domain_serp_element).toMatchObject({
      rank_absolute: 3,
    });
    // The SDK's generated item parser turns a null serp_element into
    // undefined (verified against DataforseoLabsDomainIntersectionLiveItem's
    // compiled init()), not null — the MCP tool's gap filter checks `!= null`
    // so it treats both the same way.
    expect(result.data[0]?.first_domain_serp_element).toBeUndefined();
  });
});

describe("fetchHistoricalRankOverview", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("always sets correlate: true and returns the monthly items", async () => {
    const fetchMock = stubDataforseo(
      okTask(
        ["v3", "dataforseo_labs", "google", "historical_rank_overview", "live"],
        [
          {
            items: [
              {
                year: 2026,
                month: 8,
                metrics: { organic: { pos_1: 2, count: 40, etv: 120.5 } },
              },
            ],
          },
        ],
      ),
    );

    const result = await fetchHistoricalRankOverview({
      target: "example.com",
      locationCode: 2276,
      languageCode: "de",
    });

    expect(requestBody(fetchMock)).toMatchObject([
      { target: "example.com", correlate: true },
    ]);
    expect(result.data).toEqual([
      { year: 2026, month: 8, metrics: { organic: { pos_1: 2, count: 40, etv: 120.5 } } },
    ]);
  });
});

describe("fetchKeywordsForSite", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns the keyword idea rows", async () => {
    const fetchMock = stubDataforseo(
      okTask(
        ["v3", "dataforseo_labs", "google", "keywords_for_site", "live"],
        [
          {
            items: [
              {
                keyword: "webdesign agentur nottuln",
                keyword_info: { search_volume: 90, cpc: 2.1 },
              },
            ],
          },
        ],
      ),
    );

    const result = await fetchKeywordsForSite({
      target: "example.com",
      locationCode: 2276,
      languageCode: "de",
      includeSubdomains: true,
      limit: 100,
    });

    expect(requestBody(fetchMock)).toMatchObject([
      { target: "example.com", include_subdomains: true },
    ]);
    expect(result.data).toEqual([
      { keyword: "webdesign agentur nottuln", keyword_info: { search_volume: 90, cpc: 2.1 } },
    ]);
  });
});
