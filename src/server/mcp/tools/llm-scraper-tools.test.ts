import { beforeEach, describe, expect, it, vi } from "vitest";
import { getChatGptAnswerTool, getGeminiAiAnswerTool } from "./llm-scraper-tools";
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
    locationCode: 2276,
    languageCode: "de",
  });
});

describe("get_chatgpt_answer", () => {
  it("defaults location/language from the project and renders the answer, sources, and brands", async () => {
    const chatGptScrape = vi.fn().mockResolvedValue({
      location_code: 2276,
      language_code: "de",
      model: "gpt-5",
      markdown: "Es gibt mehrere Agenturen in Nottuln.",
      sources: [{ title: "Agentur XY", domain: "example.com", url: "https://example.com/" }],
      brand_entities: [{ title: "Agentur XY" }],
    });
    mocks.createDataforseoClient.mockReturnValue({
      aiSearch: { chatGptScrape },
    });

    const result = await getChatGptAnswerTool.handler(
      { projectId: "project_1", query: "beste Webdesign Agentur Nottuln" },
      toolContext,
    );

    expect(chatGptScrape).toHaveBeenCalledWith(
      expect.objectContaining({
        keyword: "beste Webdesign Agentur Nottuln",
        locationCode: 2276,
        languageCode: "de",
      }),
    );
    const text = textContent(result);
    expect(text).toContain("mehrere Agenturen in Nottuln");
    expect(text).toContain("Brands mentioned: Agentur XY");
    expect(text).toContain("Agentur XY | example.com | https://example.com/");
  });

  it("passes an explicit locationCode/languageCode through instead of the project default", async () => {
    const chatGptScrape = vi.fn().mockResolvedValue({ markdown: "ok" });
    mocks.createDataforseoClient.mockReturnValue({
      aiSearch: { chatGptScrape },
    });

    await getChatGptAnswerTool.handler(
      {
        projectId: "project_1",
        query: "best webdesign agency",
        locationCode: 2840,
        languageCode: "en",
      },
      toolContext,
    );

    expect(chatGptScrape).toHaveBeenCalledWith(
      expect.objectContaining({ locationCode: 2840, languageCode: "en" }),
    );
  });
});

describe("get_gemini_ai_answer", () => {
  it("renders the AI Mode overview markdown and references", async () => {
    const googleAiModeScrape = vi.fn().mockResolvedValue({
      location_code: 2276,
      language_code: "de",
      items: [
        {
          markdown: "In Nottuln gibt es mehrere Webdesign-Agenturen.",
          references: [
            { title: "Agentur XY", domain: "example.com", url: "https://example.com/" },
          ],
        },
      ],
    });
    mocks.createDataforseoClient.mockReturnValue({
      aiSearch: { googleAiModeScrape },
    });

    const result = await getGeminiAiAnswerTool.handler(
      { projectId: "project_1", query: "beste Webdesign Agentur Nottuln" },
      toolContext,
    );

    expect(googleAiModeScrape).toHaveBeenCalledWith(
      expect.objectContaining({
        keyword: "beste Webdesign Agentur Nottuln",
        locationCode: 2276,
        languageCode: "de",
      }),
    );
    const text = textContent(result);
    expect(text).toContain("mehrere Webdesign-Agenturen");
    expect(text).toContain("References:");
    expect(text).toContain("Agentur XY | example.com | https://example.com/");
  });

  it("reports honestly when AI Mode shows no answer for the query", async () => {
    const googleAiModeScrape = vi.fn().mockResolvedValue({ items: [] });
    mocks.createDataforseoClient.mockReturnValue({
      aiSearch: { googleAiModeScrape },
    });

    const result = await getGeminiAiAnswerTool.handler(
      { projectId: "project_1", query: "an obscure query" },
      toolContext,
    );

    expect(textContent(result)).toContain("No AI Mode answer was shown");
    expect(result.isError).toBeUndefined();
  });
});
