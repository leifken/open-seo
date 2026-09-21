import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getKeywordVolumeByLocationTool,
  resolveLocationsTool,
} from "./local-market-tools";
import { getLocalSerpResultsTool } from "./dataforseo-research-tools";
import { makeToolContext, textContent } from "./tool-test-support";

const mocks = vi.hoisted(() => ({
  createDataforseoClient: vi.fn(),
  getProjectForOrganization: vi.fn(),
  fetchGeoLocationsForCountry: vi.fn(),
}));

vi.mock("cloudflare:workers", () => ({
  env: {
    KV: { get: () => Promise.resolve(null), put: () => Promise.resolve() },
  },
}));

vi.mock("@/server/lib/dataforseo", () => ({
  createDataforseoClient: mocks.createDataforseoClient,
  fetchGeoLocationsForCountry: mocks.fetchGeoLocationsForCountry,
}));

vi.mock("@/server/features/projects/services/ProjectService", () => ({
  ProjectService: {
    getProjectForOrganization: mocks.getProjectForOrganization,
  },
}));

const toolContext = makeToolContext();

beforeEach(() => {
  mocks.getProjectForOrganization.mockResolvedValue({
    id: "project_1",
    locationCode: 2276,
    languageCode: "de",
  });
  mocks.fetchGeoLocationsForCountry.mockResolvedValue([
    {
      code: 1004707,
      name: "Munster,North Rhine-Westphalia,Germany",
      type: "City",
    },
    {
      code: 9117095,
      name: "Coesfeld,North Rhine-Westphalia,Germany",
      type: "District",
    },
    { code: 20235, name: "North Rhine-Westphalia,Germany", type: "State" },
  ]);
});

describe("get_keyword_volume_by_location", () => {
  it("asks Google Ads once per resolved place and reports codes in meta", async () => {
    // Values from a real search_volume/live call for Münster (21.09.2026).
    const adsSearchVolume = vi.fn(
      ({ locationCode }: { locationCode: number }) =>
        locationCode === 20235
          ? Promise.reject(new Error("DataForSEO HTTP 500"))
          : Promise.resolve([
              {
                keyword: "steuerberater",
                search_volume: locationCode === 1004707 ? 480 : 140,
                cpc: 7.85,
                competition: "LOW",
                monthly_searches: [
                  { year: 2026, month: 8, search_volume: 480 },
                ],
              },
            ]),
    );
    mocks.createDataforseoClient.mockReturnValue({
      keywords: { adsSearchVolume },
    });

    const result = await getKeywordVolumeByLocationTool.handler(
      {
        projectId: "project_1",
        keywords: ["steuerberater"],
        locations: ["Münster", "Kreis Coesfeld", "Nordrhein-Westfalen"],
      },
      toolContext,
    );

    expect(adsSearchVolume).toHaveBeenCalledWith(
      expect.objectContaining({
        keywords: ["steuerberater"],
        locationCode: 9117095,
        languageCode: "de",
      }),
    );
    expect(result.isError).toBeUndefined();
    expect(result.structuredContent.meta).toMatchObject({
      locationCodes: [1004707, 9117095, 20235],
    });
    expect(result.structuredContent.estimatedCostUsd).toBe(0.27);
    expect(result.structuredContent.locations).toEqual([
      expect.objectContaining({
        locationCode: 1004707,
        ok: true,
        keywords: [
          {
            keyword: "steuerberater",
            search_volume: 480,
            cpc: 7.85,
            competition: "LOW",
            competition_index: null,
            low_top_of_page_bid: null,
            high_top_of_page_bid: null,
          },
        ],
      }),
      expect.objectContaining({ locationCode: 9117095, ok: true }),
      expect.objectContaining({ locationCode: 20235, ok: false }),
    ]);
    expect(textContent(result)).toContain("480");
  });

  it("fails before any paid call when a place is unknown, and estimates for free", async () => {
    const adsSearchVolume = vi.fn();
    mocks.createDataforseoClient.mockReturnValue({
      keywords: { adsSearchVolume },
    });

    await expect(
      getKeywordVolumeByLocationTool.handler(
        {
          projectId: "project_1",
          keywords: ["steuerberater"],
          locations: ["Münster", "Atlantis"],
        },
        toolContext,
      ),
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });

    const estimate = await getKeywordVolumeByLocationTool.handler(
      {
        projectId: "project_1",
        keywords: ["steuerberater"],
        locations: [1004707],
        estimateOnly: true,
      },
      toolContext,
    );
    expect(estimate.structuredContent).toMatchObject({
      estimateOnly: true,
      estimatedCostUsd: 0.09,
    });
    expect(adsSearchVolume).not.toHaveBeenCalled();
  });
});

describe("resolve_locations", () => {
  it("reports each place separately and is an error only when none resolves", async () => {
    const result = await resolveLocationsTool.handler(
      { projectId: "project_1", locations: ["Münster", "Atlantis"] },
      toolContext,
    );

    expect(result.isError).toBeUndefined();
    expect(result.structuredContent.locations).toEqual([
      expect.objectContaining({ ok: true, locationCode: 1004707 }),
      expect.objectContaining({ ok: false, input: "Atlantis" }),
    ]);
  });
});

describe("get_local_serp_results with a place", () => {
  it("fetches a local SERP for a named place by its location code (SEO-5)", async () => {
    const local = vi.fn().mockResolvedValue([]);
    mocks.createDataforseoClient.mockReturnValue({ serp: { local } });

    const result = await getLocalSerpResultsTool.handler(
      {
        projectId: "project_1",
        keyword: "steuerberater",
        location: "Kreis Coesfeld",
        countryCode: "de",
      },
      toolContext,
    );

    expect(local).toHaveBeenCalledWith(
      expect.objectContaining({ locationCode: 9117095 }),
    );
    expect(local.mock.calls[0]?.[0]).not.toHaveProperty("locationCoordinate");
    expect(result.structuredContent.meta).toMatchObject({
      locationCodes: [9117095],
    });

    await expect(
      getLocalSerpResultsTool.handler(
        { projectId: "project_1", keyword: "steuerberater" },
        toolContext,
      ),
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
  });
});
