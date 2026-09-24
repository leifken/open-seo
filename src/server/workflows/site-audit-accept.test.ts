import { afterEach, describe, expect, it, vi } from "vitest";
import { crawlPage, CRAWL_ACCEPT } from "./site-audit-workflow-helpers";

// Apache with MultiViews negotiates on Accept and answers 406 when no
// representation matches and there is no wildcard.
function multiViews(init?: RequestInit) {
  const accept = new Headers(init?.headers).get("accept") ?? "";
  if (!accept.includes("*/*")) return new Response("Not Acceptable", { status: 406 });
  return new Response("<html><head><title>Ok</title></head><body>ok</body></html>", {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

describe("site audit crawler Accept header", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("sends a wildcard so content negotiation never answers 406", async () => {
    expect(CRAWL_ACCEPT).toContain("*/*");
    const fetchMock = vi.fn(async (_url: unknown, init?: RequestInit) => multiViews(init));
    vi.stubGlobal("fetch", fetchMock);
    const result = await crawlPage("https://example.org/kontakt", 1, true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result.statusCode).toBe(200);
  });
});
