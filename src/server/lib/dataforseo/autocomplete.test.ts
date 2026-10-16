import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/server/lib/runtime-env", () => ({
  getRequiredEnvValue: vi.fn(async () => "test-api-key"),
}));

import { fetchAutocomplete } from "@/server/lib/dataforseo/serp";

function parseDataforseoRequestBody(init: RequestInit | undefined): unknown {
  const body = init?.body;
  if (typeof body !== "string") {
    throw new Error("Expected DataForSEO request body to be a string");
  }
  return JSON.parse(body) as unknown;
}

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
              path: [
                "v3",
                "serp",
                "google",
                "autocomplete",
                "live",
                "advanced",
              ],
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
