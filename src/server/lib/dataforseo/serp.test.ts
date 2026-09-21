import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/server/lib/runtime-env", () => ({
  getRequiredEnvValue: vi.fn(async () => "test-api-key"),
}));

import {
  fetchAutocomplete,
  fetchLiveSerp,
  fetchRankCheckTaskResult,
  postRankCheckTasks,
} from "@/server/lib/dataforseo/serp";

function parseDataforseoRequestBody(init: RequestInit | undefined): unknown {
  const body = init?.body;
  if (typeof body !== "string") {
    throw new Error("Expected DataForSEO request body to be a string");
  }
  return JSON.parse(body) as unknown;
}

describe("fetchLiveSerp", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // Fixed example modeled on the reported bug: "webdesign nottuln" (location
  // 2276, de) returned page 1 but DataForSEO could not retrieve later pages.
  // The task's own status_code isn't in the report; matching is intentionally
  // on the status_message substring (isPartialResultsTask), not a specific code.
  it("returns the retrieved items with partial: true instead of throwing", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({
        status_code: 20000,
        tasks: [
          {
            status_code: 40602,
            status_message:
              "Task completed with partial results. Some pages could not be retrieved after several retry attempts. You have not been charged for the pages that were not returned.",
            path: ["v3", "serp", "google", "organic", "live", "advanced"],
            cost: 0.002,
            result: [
              {
                items: [
                  {
                    type: "organic",
                    rank_group: 1,
                    rank_absolute: 1,
                    title: "Webdesign Nottuln – Agentur XY",
                    domain: "example.com",
                    url: "https://example.com/",
                  },
                ],
              },
            ],
          },
        ],
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchLiveSerp({
      keyword: "webdesign nottuln",
      locationCode: 2276,
      languageCode: "de",
    });

    expect(result.data.partial).toBe(true);
    expect(result.data.partialReason).toMatch(/partial results/);
    expect(result.data.items).toEqual([
      expect.objectContaining({ domain: "example.com" }),
    ]);
    expect(result.billing).toEqual({
      path: ["v3", "serp", "google", "organic", "live", "advanced"],
      costUsd: 0.002,
    });
  });

  it("clamps depth to 10-100 and requests async AI Overview loading", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({
        status_code: 20000,
        tasks: [
          {
            status_code: 20000,
            path: ["v3", "serp", "google", "organic", "live", "advanced"],
            cost: 0.0006,
            result: [{ items: [] }],
          },
        ],
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await fetchLiveSerp({
      keyword: "x",
      locationCode: 2276,
      languageCode: "de",
      depth: 5,
    });

    const body = parseDataforseoRequestBody(fetchMock.mock.calls[0]?.[1]) as Array<
      Record<string, unknown>
    >;
    expect(body[0]).toMatchObject({ depth: 10, load_async_ai_overview: true });
  });
});

describe("rank check task queue", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("posts queued tasks, maps ids by tag, and sums cost over all entries", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({
        status_code: 20000,
        tasks: [
          {
            id: "task-a",
            status_code: 20100,
            cost: 0.0006,
            data: { tag: "kw-1:desktop" },
          },
          {
            id: "task-b",
            status_code: 20100,
            cost: 0.0006,
            data: { tag: "kw-1:mobile" },
          },
          {
            id: "task-c",
            status_code: 40006,
            status_message: "Task Limit Exceeded",
            cost: 0.0006,
            data: { tag: "kw-2:desktop" },
          },
        ],
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await postRankCheckTasks({
      tasks: [
        { keyword: "alpha", keywordId: "kw-1", device: "desktop" },
        { keyword: "alpha", keywordId: "kw-1", device: "mobile" },
        { keyword: "beta", keywordId: "kw-2", device: "desktop" },
      ],
      locationCode: 2840,
      languageCode: "en",
      depth: 20,
      targetDomain: "example.com",
    });

    expect(
      fetchMock.mock.calls.map(([url]) =>
        typeof url === "string" || url instanceof URL
          ? url.toString()
          : url.url,
      ),
    ).toEqual(["https://api.dataforseo.com/v3/serp/google/organic/task_post"]);

    // Every posted task asks DataForSEO to stop crawling at the target's
    // organic listing — that is what cuts the actual crawl cost for ranking
    // domains without false "not ranking" stops on sitelinks/PAA mentions.
    const stopCrawl = {
      stop_crawl_on_match: [
        { match_value: "example.com", match_type: "with_subdomains" },
      ],
      find_targets_in: ["organic"],
    };
    expect(
      parseDataforseoRequestBody(fetchMock.mock.calls[0]?.[1]),
    ).toMatchObject([stopCrawl, stopCrawl, stopCrawl]);
    expect(result.data).toEqual([
      {
        keyword: "alpha",
        keywordId: "kw-1",
        device: "desktop",
        taskId: "task-a",
      },
      {
        keyword: "alpha",
        keywordId: "kw-1",
        device: "mobile",
        taskId: "task-b",
      },
    ]);
    // The rejected entry's cost is still metered: a charge is a charge.
    expect(result.billing.costUsd).toBeCloseTo(0.0018, 10);
    expect(result.billing.path).toEqual([
      "v3",
      "serp",
      "google",
      "organic",
      "task_post",
    ]);
  });

  it("reports a queued task still in progress as pending", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({
        status_code: 20000,
        tasks: [{ id: "task-a", status_code: 40602 }],
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const outcome = await fetchRankCheckTaskResult({
      taskId: "task-a",
      keywordId: "kw-1",
      keyword: "alpha",
      targetDomain: "example.com",
    });

    expect(outcome).toEqual({ status: "pending" });
  });

  it("parses a completed queued task into a rank check result", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({
        status_code: 20000,
        tasks: [
          {
            id: "task-a",
            status_code: 20000,
            cost: 0,
            path: ["v3", "serp", "google", "organic", "task_get", "advanced"],
            result: [
              {
                items: [
                  {
                    type: "organic",
                    rank_group: 3,
                    rank_absolute: 4,
                    domain: "www.example.com",
                    url: "https://www.example.com/page",
                  },
                ],
              },
            ],
          },
        ],
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const outcome = await fetchRankCheckTaskResult({
      taskId: "task-a",
      keywordId: "kw-1",
      keyword: "alpha",
      targetDomain: "example.com",
    });

    expect(outcome).toEqual({
      status: "completed",
      result: {
        keywordId: "kw-1",
        keyword: "alpha",
        position: 3,
        url: "https://www.example.com/page",
        serpFeatures: ["organic"],
      },
    });
  });
});

describe("fetchAutocomplete", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("sends location_code/language_code and returns the suggestion items", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({
        status_code: 20000,
        tasks: [
          {
            status_code: 20000,
            path: ["v3", "serp", "google", "autocomplete", "live", "advanced"],
            cost: 0.0005,
            result: [
              {
                items: [
                  { rank_absolute: 1, suggestion: "webdesign nottuln preise" },
                  { rank_absolute: 2, suggestion: "webdesign nottuln agentur" },
                ],
              },
            ],
          },
        ],
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchAutocomplete({
      keyword: "webdesign nottuln",
      locationCode: 2276,
      languageCode: "de",
    });

    const [, init] = fetchMock.mock.calls[0];
    expect(parseDataforseoRequestBody(init)).toEqual([
      {
        keyword: "webdesign nottuln",
        location_code: 2276,
        language_code: "de",
        cursor_pointer: undefined,
      },
    ]);
    expect(result.data).toEqual([
      { rank_absolute: 1, suggestion: "webdesign nottuln preise" },
      { rank_absolute: 2, suggestion: "webdesign nottuln agentur" },
    ]);
  });

  it("treats 'No Search Results' as an empty, billed success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(
        Response.json({
          status_code: 20000,
          tasks: [
            {
              status_code: 40501,
              status_message: "No Search Results.",
              path: ["v3", "serp", "google", "autocomplete", "live", "advanced"],
              cost: 0.0005,
              result: [],
            },
          ],
        }),
      ),
    );

    const result = await fetchAutocomplete({
      keyword: "asdkjhaskjdhaksjhd",
      locationCode: 2276,
      languageCode: "de",
    });

    expect(result.data).toEqual([]);
    expect(result.billing.costUsd).toBe(0.0005);
  });
});
