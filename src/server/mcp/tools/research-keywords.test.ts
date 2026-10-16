import { beforeEach, describe, expect, it, vi } from "vitest";
import { researchKeywordsTool } from "./research-keywords";
import { AppError } from "@/server/lib/errors";
import { makeToolContext } from "./tool-test-support";

const toolContext = makeToolContext();

const mocks = vi.hoisted(() => ({
  getProjectForOrganization: vi.fn(),
  research: vi.fn(),
}));

vi.mock("@/server/features/projects/services/ProjectService", () => ({
  ProjectService: {
    getProjectForOrganization: mocks.getProjectForOrganization,
  },
}));
vi.mock("@/server/auth/repositories/AuthRepository", () => ({
  AuthRepository: { getMembership: vi.fn() },
}));
vi.mock("@/server/features/keywords/services/KeywordResearchService", () => ({
  KeywordResearchService: { research: mocks.research },
}));

describe("research_keywords", () => {
  beforeEach(() => {
    mocks.getProjectForOrganization.mockResolvedValue({
      id: "project_1",
      locationCode: 2840,
      languageCode: "en",
    });
  });

  it("returns metric rows without the monthly trend array", async () => {
    mocks.research.mockResolvedValue({
      source: "labs",
      usedFallback: false,
      rows: [
        {
          keyword: "seo mcp",
          searchVolume: 320,
          keywordDifficulty: 12,
          cpc: 4.1,
          competition: 0.2,
          intent: "commercial",
          trend: [{ year: 2026, month: 8, searchVolume: 300 }],
        },
      ],
    });

    const result = await researchKeywordsTool.handler(
      { projectId: "project_1", seeds: [{ seed: "seo mcp" }] },
      makeToolContext(),
    );

    expect(result.structuredContent?.results).toEqual([
      {
        seed: "seo mcp",
        ok: true,
        rowCount: 1,
        source: "labs",
        usedFallback: false,
        rows: [
          {
            keyword: "seo mcp",
            searchVolume: 320,
            keywordDifficulty: 12,
            cpc: 4.1,
            competition: 0.2,
            intent: "commercial",
          },
        ],
      },
    ]);
  });

  it("tells an agent how to find a valid local location", async () => {
    mocks.research.mockRejectedValue(
      new AppError("UNKNOWN_LOCATION", "Not a known area."),
    );

    const result = await researchKeywordsTool.handler(
      {
        projectId: "project_1",
        seeds: [{ seed: "plumber", locationName: "Austin, TX" }],
      },
      makeToolContext(),
    );

    expect(result.structuredContent?.results).toEqual([
      {
        seed: "plumber",
        ok: false,
        error:
          "Not a known area. Call search_serp_locations and pass the returned locationName exactly.",
      },
    ]);
  });
  it("does not set isError when every seed succeeds", async () => {
    mocks.research.mockResolvedValue({
      rows: [
        {
          keyword: "seo tools",
          searchVolume: 2400,
          keywordDifficulty: 18,
          cpc: 3.25,
          competition: 0.4,
          intent: "commercial",
          trend: [],
        },
      ],
      source: "related",
      usedFallback: false,
    });

    const result = await researchKeywordsTool.handler(
      { projectId: "project_1", seeds: [{ seed: "seo tools" }] },
      toolContext,
    );

    expect(result.isError).toBeUndefined();
  });

  it("sets isError: true when every seed in the batch fails", async () => {
    mocks.research.mockRejectedValue(new Error("DataForSEO unavailable"));

    const result = await researchKeywordsTool.handler(
      { projectId: "project_1", seeds: [{ seed: "seo tools" }] },
      toolContext,
    );

    expect(result.isError).toBe(true);
    const [entry] = result.structuredContent.results;
    expect(entry.ok).toBe(false);
  });

  it("does not set isError when at least one seed succeeds", async () => {
    mocks.research
      .mockRejectedValueOnce(new Error("DataForSEO unavailable"))
      .mockResolvedValueOnce({
        rows: [
          {
            keyword: "free seo tools",
            searchVolume: 880,
            keywordDifficulty: null,
            cpc: null,
            competition: null,
            intent: "informational",
            trend: [],
          },
        ],
        source: "related",
        usedFallback: false,
      });

    const result = await researchKeywordsTool.handler(
      {
        projectId: "project_1",
        seeds: [{ seed: "seo tools" }, { seed: "free seo tools" }],
      },
      toolContext,
    );

    expect(result.isError).toBeUndefined();
  });
});
