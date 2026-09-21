import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/server/lib/runtime-env", () => ({
  getRequiredEnvValue: vi.fn(async () => "test-api-key"),
}));

import { postMapsTasks } from "@/server/lib/dataforseo/maps-tasks";

function parseDataforseoRequestBody(init: RequestInit | undefined): unknown {
  const body = init?.body;
  if (typeof body !== "string") {
    throw new Error("Expected DataForSEO request body to be a string");
  }
  return JSON.parse(body) as unknown;
}

describe("postMapsTasks (SEO-5)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // Response shape of a real serp/google/maps/task_post (21.09.2026).
  it("posts every grid point in one high-priority request, maps tags to task ids, sums cost", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({
        status_code: 20000,
        tasks: [
          {
            id: "09212130-2421-0066-0000-92e32ec8872a",
            status_code: 20100,
            status_message: "Task Created.",
            cost: 0.0012,
            data: { tag: "0:0" },
          },
          {
            status_code: 40501,
            status_message: "Invalid Field: 'location_coordinate'.",
            cost: 0,
            data: { tag: "0:1" },
          },
        ],
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await postMapsTasks({
      keyword: "steuerberater",
      languageCode: "de",
      device: "mobile",
      depth: 20,
      priority: "high",
      points: [
        { tag: "0:0", locationCoordinate: "51.97,7.62,13z" },
        { tag: "0:1", locationCoordinate: "51.97,7.65,13z" },
      ],
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(parseDataforseoRequestBody(fetchMock.mock.calls[0]?.[1])).toEqual([
      expect.objectContaining({
        keyword: "steuerberater",
        location_coordinate: "51.97,7.62,13z",
        priority: 2,
        device: "mobile",
        os: "android",
        tag: "0:0",
      }),
      expect.objectContaining({ tag: "0:1" }),
    ]);
    expect(result).toEqual({
      data: [{ tag: "0:0", taskId: "09212130-2421-0066-0000-92e32ec8872a" }],
      billing: {
        path: ["v3", "serp", "google", "maps", "task_post"],
        costUsd: 0.0012,
      },
    });
  });
});
