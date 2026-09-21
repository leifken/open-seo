import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/server/lib/runtime-env", () => ({
  getRequiredEnvValue: vi.fn(async () => "test-api-key"),
}));

import {
  fetchChatGptScrape,
  fetchGoogleAiModeScrape,
} from "@/server/lib/dataforseo/llm-scraper";

function stubDataforseo(payload: unknown) {
  const fetchMock = vi
    .fn<typeof fetch>()
    .mockResolvedValue(Response.json(payload));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function requestOf(fetchMock: ReturnType<typeof stubDataforseo>) {
  const [url, init] = fetchMock.mock.calls[0];
  const rawUrl = typeof url === "string" || url instanceof URL ? url : url.url;
  const body = init?.body;
  return {
    url: rawUrl.toString(),
    body: typeof body === "string" ? (JSON.parse(body) as unknown) : null,
  };
}

const okTask = (path: string[], result: unknown[]) => ({
  status_code: 20000,
  tasks: [{ status_code: 20000, path, cost: 0.01, result }],
});

describe("fetchChatGptScrape", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("sends location_code/language_code and returns the parsed answer", async () => {
    const fetchMock = stubDataforseo(
      okTask(
        ["v3", "ai_optimization", "chat_gpt", "llm_scraper", "live", "advanced"],
        [
          {
            keyword: "beste Webdesign Agentur Nottuln",
            location_code: 2276,
            language_code: "de",
            model: "gpt-5",
            check_url: "https://chatgpt.com/...",
            markdown: "Es gibt mehrere Agenturen in Nottuln...",
            sources: [
              { title: "Agentur XY", domain: "example.com", url: "https://example.com/" },
            ],
            fan_out_queries: ["Webdesign Nottuln Preise"],
            brand_entities: [{ title: "Agentur XY" }],
          },
        ],
      ),
    );

    const result = await fetchChatGptScrape({
      keyword: "beste Webdesign Agentur Nottuln",
      locationCode: 2276,
      languageCode: "de",
    });

    const { url, body } = requestOf(fetchMock);
    expect(url).toBe(
      "https://api.dataforseo.com/v3/ai_optimization/chat_gpt/llm_scraper/live/advanced",
    );
    expect(body).toMatchObject([
      { keyword: "beste Webdesign Agentur Nottuln", location_code: 2276, language_code: "de" },
    ]);
    expect(result.data.markdown).toContain("mehrere Agenturen");
    expect(result.data.brand_entities).toEqual([{ title: "Agentur XY" }]);
    expect(result.billing.costUsd).toBe(0.01);
  });
});

describe("fetchGoogleAiModeScrape", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("sends location_code/language_code and returns the AI overview item", async () => {
    stubDataforseo(
      okTask(
        ["v3", "serp", "google", "ai_mode", "live", "advanced"],
        [
          {
            keyword: "beste Webdesign Agentur Nottuln",
            location_code: 2276,
            language_code: "de",
            check_url: "https://google.com/...",
            items: [
              {
                markdown: "In Nottuln gibt es mehrere Webdesign-Agenturen...",
                references: [
                  { title: "Agentur XY", domain: "example.com", url: "https://example.com/" },
                ],
              },
            ],
          },
        ],
      ),
    );

    const result = await fetchGoogleAiModeScrape({
      keyword: "beste Webdesign Agentur Nottuln",
      locationCode: 2276,
      languageCode: "de",
    });

    expect(result.data.items?.[0]?.markdown).toContain("Webdesign-Agenturen");
    expect(result.data.items?.[0]?.references).toEqual([
      { title: "Agentur XY", domain: "example.com", url: "https://example.com/" },
    ]);
  });

  it("treats a 'No Search Results' response as an empty, billed success", async () => {
    stubDataforseo({
      status_code: 20000,
      tasks: [
        {
          status_code: 40501,
          status_message: "No Search Results.",
          path: ["v3", "serp", "google", "ai_mode", "live", "advanced"],
          cost: 0.008,
          result: [],
        },
      ],
    });

    const result = await fetchGoogleAiModeScrape({
      keyword: "no ai mode for this query",
      locationCode: 2276,
      languageCode: "de",
    });

    expect(result.data).toEqual({});
    expect(result.billing.costUsd).toBe(0.008);
  });
});
