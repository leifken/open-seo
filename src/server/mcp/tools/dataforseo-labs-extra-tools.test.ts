import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getAutocompleteSuggestionsTool,
  getHistoricalRankOverviewTool,
  getKeywordGapTool,
  getKeywordsForSiteTool,
} from "./dataforseo-labs-extra-tools";
import { makeToolContext, textContent } from "./tool-test-support";

const mocks = vi.hoisted(() => ({
  createDataforseoClient: vi.fn(),
  getProjectForOrganization: vi.fn(),
}));

vi.mock("cloudflare:workers", () => ({ env: {} }));

vi.mock("@/server/lib/dataforseo", () => ({
  createDataforseoClient: mocks.createDataforseoClient,
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
    locationCode: 2840,
    languageCode: "en",
  });
});

describe("get_keyword_gap", () => {
  it("normalizes both domains and filters to a true gap by default", async () => {
    const intersection = vi.fn().mockResolvedValue([
      {
        keyword_data: { keyword: "shared keyword" },
        first_domain_serp_element: { rank_absolute: 2 },
        second_domain_serp_element: { rank_absolute: 5 },
      },
      {
        keyword_data: { keyword: "gap keyword" },
        second_domain_serp_element: {
          rank_absolute: 3,
          url: "https://rivalseo.com/",
        },
      },
    ]);
    mocks.createDataforseoClient.mockReturnValue({
      domain: { intersection },
    });

    const result = await getKeywordGapTool.handler(
      {
        projectId: "project_1",
        yourDomain: "https://www.example.com/",
        competitorDomain: "rivalseo.com",
      },
      toolContext,
    );

    expect(intersection).toHaveBeenCalledWith(
      expect.objectContaining({
        target1: "example.com",
        target2: "rivalseo.com",
        intersections: false,
      }),
    );
    expect(result.structuredContent).toMatchObject({
      gapCount: 1,
      totalReturned: 2,
    });
    expect(result.structuredContent.items).toHaveLength(1);
    expect(textContent(result)).toContain("gap keyword");
    expect(textContent(result)).not.toContain("shared keyword");
  });

  it("returns every row (shared and gap) when gapOnly is false", async () => {
    const intersection = vi.fn().mockResolvedValue([
      {
        keyword_data: { keyword: "shared keyword" },
        first_domain_serp_element: { rank_absolute: 2 },
        second_domain_serp_element: { rank_absolute: 5 },
      },
    ]);
    mocks.createDataforseoClient.mockReturnValue({
      domain: { intersection },
    });

    const result = await getKeywordGapTool.handler(
      {
        projectId: "project_1",
        yourDomain: "example.com",
        competitorDomain: "rivalseo.com",
        gapOnly: false,
      },
      toolContext,
    );

    expect(intersection).toHaveBeenCalledWith(
      expect.objectContaining({ intersections: true }),
    );
    expect(result.structuredContent).toMatchObject({
      gapCount: 0,
      totalReturned: 1,
    });
    expect(result.structuredContent.items).toHaveLength(1);
  });
});

describe("get_historical_rank_overview", () => {
  it("sorts months chronologically and renders the metrics table", async () => {
    const historicalRankOverview = vi.fn().mockResolvedValue([
      { year: 2026, month: 3, metrics: { organic: { pos_1: 1, count: 20 } } },
      { year: 2025, month: 12, metrics: { organic: { pos_1: 0, count: 15 } } },
    ]);
    mocks.createDataforseoClient.mockReturnValue({
      domain: { historicalRankOverview },
    });

    const result = await getHistoricalRankOverviewTool.handler(
      { projectId: "project_1", domain: "example.com" },
      toolContext,
    );

    const months = result.structuredContent.months;
    expect(months.map((m) => `${m.year}-${m.month}`)).toEqual([
      "2025-12",
      "2026-3",
    ]);
    expect(textContent(result)).toContain("2025-12");
  });
});

describe("get_keywords_for_site", () => {
  it("passes includeSubdomains through and renders the keyword ideas", async () => {
    const keywordsForSite = vi
      .fn()
      .mockResolvedValue([
        { keyword: "webdesign nottuln", keyword_info: { search_volume: 90 } },
      ]);
    mocks.createDataforseoClient.mockReturnValue({
      domain: { keywordsForSite },
    });

    const result = await getKeywordsForSiteTool.handler(
      {
        projectId: "project_1",
        domain: "example.com",
        includeSubdomains: false,
      },
      toolContext,
    );

    expect(keywordsForSite).toHaveBeenCalledWith(
      expect.objectContaining({
        target: "example.com",
        includeSubdomains: false,
      }),
    );
    expect(textContent(result)).toContain("webdesign nottuln");
  });
});

describe("get_autocomplete_suggestions", () => {
  it("defaults location/language from the project and renders suggestions", async () => {
    const autocomplete = vi
      .fn()
      .mockResolvedValue([
        { rank_absolute: 1, suggestion: "webdesign nottuln preise" },
      ]);
    mocks.createDataforseoClient.mockReturnValue({
      serp: { autocomplete },
    });

    const result = await getAutocompleteSuggestionsTool.handler(
      { projectId: "project_1", query: "webdesign nottuln" },
      toolContext,
    );

    expect(autocomplete).toHaveBeenCalledWith(
      expect.objectContaining({
        keyword: "webdesign nottuln",
        locationCode: 2840,
        languageCode: "en",
      }),
    );
    expect(textContent(result)).toContain("webdesign nottuln preise");
  });

  it("reports no suggestions honestly instead of an empty table", async () => {
    const autocomplete = vi.fn().mockResolvedValue([]);
    mocks.createDataforseoClient.mockReturnValue({ serp: { autocomplete } });

    const result = await getAutocompleteSuggestionsTool.handler(
      { projectId: "project_1", query: "asdkjhaskjdhaksjhd" },
      toolContext,
    );

    expect(textContent(result)).toContain("No autocomplete suggestions");
  });
});
