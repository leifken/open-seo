import { beforeEach, describe, expect, it, vi } from "vitest";
import { researchKeywordsTool } from "./research-keywords";
import { makeToolContext } from "./tool-test-support";

const mocks = vi.hoisted(() => ({
  research: vi.fn(),
  getProjectForOrganization: vi.fn(),
}));

vi.mock("cloudflare:workers", () => ({ env: {} }));

vi.mock("@/server/features/keywords/services/KeywordResearchService", () => ({
  KeywordResearchService: { research: mocks.research },
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
});

describe("research_keywords", () => {
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
