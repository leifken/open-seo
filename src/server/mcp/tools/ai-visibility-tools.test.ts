import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import * as aiVisibilityTools from "./ai-visibility-tools";
import { makeToolContext, textContent } from "./tool-test-support";
import type { BrandLookupResult } from "@/types/schemas/ai-search";
import type { PromptExplorerResult } from "@/types/schemas/ai-search";

const mocks = vi.hoisted(() => ({
  getBrandLookup: vi.fn(),
  explorePrompt: vi.fn(),
  getProjectForOrganization: vi.fn(),
}));

vi.mock("cloudflare:workers", () => ({ env: {} }));

vi.mock("@/server/features/projects/services/ProjectService", () => ({
  ProjectService: {
    getProjectForOrganization: mocks.getProjectForOrganization,
  },
}));

vi.mock("@/server/features/ai-search/services/brandLookup", () => ({
  getBrandLookup: mocks.getBrandLookup,
}));

vi.mock("@/server/features/ai-search/services/promptExplorer", () => ({
  explorePrompt: mocks.explorePrompt,
}));

const toolContext = makeToolContext();

const deProjectRow = {
  id: "project_1",
  locationCode: 2276,
  languageCode: "de",
};

const brandLookupResult: BrandLookupResult = {
  query: "acme",
  detectedTargetType: "keyword",
  resolvedTarget: "acme",
  scope: null,
  aggregatesAreDomainLevel: false,
  fetchedAt: "2026-09-15T00:00:00.000Z",
  hasData: true,
  totalMentions: 42,
  totalAiSearchVolume: 1200,
  perPlatform: [
    {
      platform: "chat_gpt",
      status: "success",
      mentions: 30,
      aiSearchVolume: 900,
    },
    {
      platform: "google",
      status: "success",
      mentions: 12,
      aiSearchVolume: 300,
    },
  ],
  shareOfVoice: {
    platforms: ["chat_gpt", "google"],
    entries: [
      { label: "acme", isTarget: true, mentions: 42, sharePct: 60 },
      { label: "rival", isTarget: false, mentions: 28, sharePct: 40 },
    ],
  },
  topPages: [
    {
      url: "https://acme.example/pricing",
      domain: "acme.example",
      platform: "chat_gpt",
      mentions: 10,
      capturedVolume: 500,
      keywords: [],
    },
  ],
  topQueries: [],
  monthlyVolume: [],
};

const promptExplorerResult: PromptExplorerResult = {
  prompt: "best crm for small teams",
  highlightBrand: "acme",
  fetchedAt: "2026-09-15T00:00:00.000Z",
  results: [
    {
      status: "success",
      model: "claude",
      modelName: "claude-sonnet-4-5",
      text: "Acme CRM is a strong pick for small teams because of its pricing.",
      citations: [],
      fanOutQueries: [],
      brandMentioned: true,
      outputTokens: 120,
      webSearch: true,
    },
    {
      status: "error",
      model: "gemini",
      errorCode: "UPSTREAM_ERROR",
      message: "This model is temporarily unavailable. Please try again.",
    },
  ],
};

describe("get_ai_visibility", () => {
  beforeEach(() => {
    mocks.getProjectForOrganization.mockResolvedValue(deProjectRow);
    mocks.getBrandLookup.mockResolvedValue(brandLookupResult);
  });

  it("defaults location/language from the project when omitted", async () => {
    await aiVisibilityTools.getAiVisibilityTool.handler(
      { projectId: "project_1", query: "acme", competitors: [] },
      toolContext,
    );

    expect(mocks.getBrandLookup).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: "project_1",
        query: "acme",
        locationCode: 2276,
        languageCode: "de",
      }),
      expect.anything(),
    );
  });

  it("passes an explicit locationCode/languageCode through instead of the project default", async () => {
    await aiVisibilityTools.getAiVisibilityTool.handler(
      {
        projectId: "project_1",
        query: "acme",
        competitors: [],
        locationCode: 2840,
        languageCode: "en",
      },
      toolContext,
    );

    expect(mocks.getBrandLookup).toHaveBeenCalledWith(
      expect.objectContaining({ locationCode: 2840, languageCode: "en" }),
      expect.anything(),
    );
  });

  it("builds the billing context from the caller's org and the requested project", async () => {
    await aiVisibilityTools.getAiVisibilityTool.handler(
      { projectId: "project_1", query: "acme", competitors: [] },
      toolContext,
    );

    expect(mocks.getBrandLookup).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        organizationId: toolContext.auth.organizationId,
        projectId: "project_1",
      }),
    );
  });

  it("summarizes mentions per platform, Share of Voice, and top sources in the text output; passes structuredContent through unchanged", async () => {
    const result = await aiVisibilityTools.getAiVisibilityTool.handler(
      { projectId: "project_1", query: "acme", competitors: ["rival"] },
      toolContext,
    );

    const text = textContent(result);
    expect(text).toContain("Total mentions: 42");
    expect(text).toContain("chat_gpt");
    expect(text).toContain("Share of Voice");
    expect(text).toContain("rival");
    expect(text).toContain("acme.example");
    expect(result.structuredContent).toMatchObject({
      result: brandLookupResult,
    });
  });

  it("rejects more than 5 competitors", () => {
    const parsed = z
      .object(aiVisibilityTools.getAiVisibilityTool.config.inputSchema)
      .safeParse({
        projectId: "project_1",
        query: "acme",
        competitors: ["a", "b", "c", "d", "e", "f"],
      });
    expect(parsed.success).toBe(false);
  });
});

describe("explore_ai_prompt", () => {
  beforeEach(() => {
    mocks.getProjectForOrganization.mockResolvedValue(deProjectRow);
    mocks.explorePrompt.mockResolvedValue(promptExplorerResult);
  });

  it("builds the billing context from the caller's org and the requested project", async () => {
    await aiVisibilityTools.exploreAiPromptTool.handler(
      {
        projectId: "project_1",
        prompt: "best crm for small teams",
        models: ["claude", "gemini"],
        webSearch: true,
      },
      toolContext,
    );

    expect(mocks.explorePrompt).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: "project_1",
        prompt: "best crm for small teams",
        models: ["claude", "gemini"],
      }),
      expect.objectContaining({
        organizationId: toolContext.auth.organizationId,
        projectId: "project_1",
      }),
    );
  });

  it("summarizes per-model brand mentions and a text preview; passes structuredContent through unchanged", async () => {
    const result = await aiVisibilityTools.exploreAiPromptTool.handler(
      {
        projectId: "project_1",
        prompt: "best crm for small teams",
        models: ["claude", "gemini"],
        highlightBrand: "acme",
        webSearch: true,
      },
      toolContext,
    );

    const text = textContent(result);
    expect(text).toContain("claude");
    expect(text).toContain("brand mentioned: yes");
    expect(text).toContain("Acme CRM is a strong pick");
    expect(text).toContain("gemini: error (UPSTREAM_ERROR)");
    expect(result.structuredContent).toMatchObject({
      result: promptExplorerResult,
    });
  });

  it("rejects an empty models list", () => {
    const parsed = z
      .object(aiVisibilityTools.exploreAiPromptTool.config.inputSchema)
      .safeParse({
        projectId: "project_1",
        prompt: "best crm for small teams",
        models: [],
      });
    expect(parsed.success).toBe(false);
  });

  it("defaults models to all four when omitted", () => {
    const parsed = z
      .object(aiVisibilityTools.exploreAiPromptTool.config.inputSchema)
      .parse({
        projectId: "project_1",
        prompt: "best crm for small teams",
      });
    expect(parsed.models).toEqual([
      "chat_gpt",
      "claude",
      "gemini",
      "perplexity",
    ]);
  });
});
