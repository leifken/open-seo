import { beforeEach, describe, expect, it, vi } from "vitest";
import { getSerpResultsTool } from "./get-serp-results";
import { makeToolContext } from "./tool-test-support";

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

describe("get_serp_results", () => {
  it("returns ok: true, teilweise: true with a reason when DataForSEO could only retrieve some pages", async () => {
    // Fixed example modeled on the reported "webdesign nottuln" failure: page
    // 1 came back, later pages did not, but the earlier bug discarded the
    // page-1 items and returned ok:false, items:[].
    const live = vi.fn().mockResolvedValue({
      items: [
        {
          type: "organic",
          rank_group: 1,
          rank_absolute: 1,
          title: "Webdesign Nottuln – Agentur XY",
          url: "https://example.com/",
          domain: "example.com",
          description: "Ihre Agentur für Webdesign in Nottuln.",
        },
      ],
      partial: true,
      partialReason:
        "Task completed with partial results. Some pages could not be retrieved after several retry attempts. You have not been charged for the pages that were not returned.",
    });
    mocks.createDataforseoClient.mockReturnValue({ serp: { live } });

    const result = await getSerpResultsTool.handler(
      { projectId: "project_1", queries: [{ keyword: "webdesign nottuln" }] },
      toolContext,
    );

    expect(result.structuredContent.results).toHaveLength(1);
    const [entry] = result.structuredContent.results;
    expect(entry.ok).toBe(true);
    if (!entry.ok) throw new Error("expected ok: true");
    expect(entry.teilweise).toBe(true);
    expect(entry.grund).toContain("partial results");
    expect(entry.items).toMatchObject([{ domain: "example.com" }]);
    expect(result.isError).toBeUndefined();
  });

  it("returns ok: false when partial results retrieved no pages at all", async () => {
    const live = vi.fn().mockResolvedValue({
      items: [],
      partial: true,
      partialReason: "Task completed with partial results.",
    });
    mocks.createDataforseoClient.mockReturnValue({ serp: { live } });

    const result = await getSerpResultsTool.handler(
      { projectId: "project_1", queries: [{ keyword: "webdesign nottuln" }] },
      toolContext,
    );

    expect(result.structuredContent.results).toHaveLength(1);
    const [entry] = result.structuredContent.results;
    expect(entry.ok).toBe(false);
    if (entry.ok) throw new Error("expected ok: false");
    expect(typeof entry.error).toBe("string");
    // Every query in the batch failed, so the call itself is an error — not a
    // 200 whose body happens to say "FAILED" for the only query asked.
    expect(result.isError).toBe(true);
  });

  it("does not set isError when at least one query in the batch succeeds", async () => {
    const live = vi
      .fn()
      .mockResolvedValueOnce({ items: [], partial: true, partialReason: "boom" })
      .mockResolvedValueOnce({
        items: [
          {
            type: "organic",
            rank_group: 1,
            rank_absolute: 1,
            title: "Agentur XY",
            url: "https://example.com/",
            domain: "example.com",
            description: null,
          },
        ],
        partial: false,
      });
    mocks.createDataforseoClient.mockReturnValue({ serp: { live } });

    const result = await getSerpResultsTool.handler(
      {
        projectId: "project_1",
        queries: [{ keyword: "a" }, { keyword: "b" }],
      },
      toolContext,
    );

    expect(result.isError).toBeUndefined();
  });

  it("extracts aiOverview, peopleAlsoAsk, and localPack from the full item list", async () => {
    const live = vi.fn().mockResolvedValue({
      items: [
        {
          type: "ai_overview",
          markdown: "Webdesign in Nottuln wird von mehreren Agenturen angeboten.",
          references: [
            { domain: "example.com", url: "https://example.com/", title: "Agentur XY" },
          ],
        },
        {
          type: "people_also_ask",
          items: [
            {
              title: "Was kostet Webdesign in Nottuln?",
              expanded_element: [
                { domain: "example.com", url: "https://example.com/preise", title: "Preise" },
              ],
            },
          ],
        },
        {
          type: "local_pack",
          rank_group: 1,
          title: "Agentur XY",
          domain: "example.com",
          rating: { value: 4.8, votes_count: 23 },
        },
        {
          type: "organic",
          rank_group: 1,
          rank_absolute: 4,
          title: "Agentur XY",
          url: "https://example.com/",
          domain: "example.com",
          description: null,
        },
      ],
      partial: false,
    });
    mocks.createDataforseoClient.mockReturnValue({ serp: { live } });

    const result = await getSerpResultsTool.handler(
      { projectId: "project_1", queries: [{ keyword: "webdesign nottuln" }] },
      toolContext,
    );

    const [entry] = result.structuredContent.results;
    expect(entry.ok).toBe(true);
    if (!entry.ok) throw new Error("expected ok: true");
    expect(entry.aiOverview).toEqual({
      present: true,
      text: "Webdesign in Nottuln wird von mehreren Agenturen angeboten.",
      sources: [{ domain: "example.com", url: "https://example.com/", title: "Agentur XY" }],
    });
    expect(entry.peopleAlsoAsk).toEqual([
      {
        question: "Was kostet Webdesign in Nottuln?",
        source: { domain: "example.com", url: "https://example.com/preise", title: "Preise" },
      },
    ]);
    expect(entry.localPack).toEqual([
      { name: "Agentur XY", domain: "example.com", rating: 4.8, ratingCount: 23, rank: 1 },
    ]);
    // The pre-existing items array (incl. local_pack entries) stays untouched.
    expect(entry.items.some((item) => item.type === "organic")).toBe(true);
  });

  it("reports aiOverview.present: false when the SERP has none", async () => {
    const live = vi.fn().mockResolvedValue({
      items: [
        {
          type: "organic",
          rank_group: 1,
          rank_absolute: 1,
          title: "Agentur XY",
          url: "https://example.com/",
          domain: "example.com",
          description: null,
        },
      ],
      partial: false,
    });
    mocks.createDataforseoClient.mockReturnValue({ serp: { live } });

    const result = await getSerpResultsTool.handler(
      { projectId: "project_1", queries: [{ keyword: "webdesign nottuln" }] },
      toolContext,
    );

    const [entry] = result.structuredContent.results;
    expect(entry.ok).toBe(true);
    if (!entry.ok) throw new Error("expected ok: true");
    expect(entry.aiOverview).toEqual({ present: false });
    expect(entry.peopleAlsoAsk).toEqual([]);
    expect(entry.localPack).toEqual([]);
  });

  it("defaults depth to 20 and rounds a requested depth up to the nearest page of 10", async () => {
    const live = vi.fn().mockResolvedValue({ items: [], partial: false });
    mocks.createDataforseoClient.mockReturnValue({ serp: { live } });

    await getSerpResultsTool.handler(
      {
        projectId: "project_1",
        queries: [{ keyword: "a" }, { keyword: "b", depth: 35 }],
      },
      toolContext,
    );

    expect(live).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ keyword: "a", depth: 20 }),
    );
    expect(live).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ keyword: "b", depth: 40 }),
    );
  });
});
