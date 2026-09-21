import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAuditLighthouseTool } from "./site-audit-tools";
import { makeToolContext, textContent } from "./tool-test-support";

const mocks = vi.hoisted(() => ({
  getAuditForProject: vi.fn(),
  getLatestAuditForProject: vi.fn(),
  getLighthouseForAudit: vi.fn(),
  getPagesForAudit: vi.fn(),
  getProjectForOrganization: vi.fn(),
}));

vi.mock("cloudflare:workers", () => ({ env: {} }));

vi.mock("@/server/features/audit/repositories/AuditRepository", () => ({
  AuditRepository: {
    getAuditForProject: mocks.getAuditForProject,
    getLatestAuditForProject: mocks.getLatestAuditForProject,
    getLighthouseForAudit: mocks.getLighthouseForAudit,
    getPagesForAudit: mocks.getPagesForAudit,
  },
}));

vi.mock("@/server/features/projects/services/ProjectService", () => ({
  ProjectService: {
    getProjectForOrganization: mocks.getProjectForOrganization,
  },
}));

// get_audit_lighthouse never calls AuditService, but the module imports it
// alongside AuditRepository; stub it out rather than pull in its real
// dependency graph (AuditScratchpad needs a DurableObject binding).
vi.mock("@/server/features/audit/services/AuditService", () => ({
  AuditService: {},
}));

vi.mock("@/server/lib/posthog", () => ({
  captureServerEvent: vi.fn(),
}));

const toolContext = makeToolContext();

const AUDIT = { id: "audit_1", startUrl: "https://example.com" };
const PAGES = [
  { id: "page_1", url: "https://example.com/" },
  { id: "page_2", url: "https://example.com/kontakt" },
];

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getProjectForOrganization.mockResolvedValue({
    id: "project_1",
    locationCode: 2276,
    languageCode: "de",
  });
  mocks.getLatestAuditForProject.mockResolvedValue(AUDIT);
  mocks.getAuditForProject.mockResolvedValue(AUDIT);
  mocks.getPagesForAudit.mockResolvedValue(PAGES);
});

describe("get_audit_lighthouse", () => {
  it("joins each Lighthouse row to its page URL and reports scores + Core Web Vitals", async () => {
    mocks.getLighthouseForAudit.mockResolvedValue([
      {
        pageId: "page_1",
        strategy: "mobile",
        performanceScore: 72,
        accessibilityScore: 95,
        bestPracticesScore: 89,
        seoScore: 100,
        lcpMs: 2400,
        cls: 0.05,
        inpMs: 180,
        ttfbMs: 320,
        errorMessage: null,
        r2Key: "audits/audit_1/page_1-mobile.json",
      },
    ]);

    const result = await getAuditLighthouseTool.handler(
      { projectId: "project_1" },
      toolContext,
    );

    expect(result.structuredContent.total).toBe(1);
    const [row] = result.structuredContent.results;
    expect(row).toMatchObject({
      url: "https://example.com/",
      strategy: "mobile",
      scores: { performance: 72, accessibility: 95, bestPractices: 89, seo: 100 },
      coreWebVitals: { lcpMs: 2400, cls: 0.05, inpMs: 180, ttfbMs: 320 },
      hasDetailedReport: true,
    });
    expect(textContent(result)).toContain("LCP ms");
    expect(textContent(result)).toContain("2400");
  });

  it("filters by strategy and URL substring", async () => {
    mocks.getLighthouseForAudit.mockResolvedValue([
      {
        pageId: "page_1",
        strategy: "mobile",
        performanceScore: 72,
        accessibilityScore: null,
        bestPracticesScore: null,
        seoScore: null,
        lcpMs: null,
        cls: null,
        inpMs: null,
        ttfbMs: null,
        errorMessage: null,
        r2Key: null,
      },
      {
        pageId: "page_2",
        strategy: "desktop",
        performanceScore: 91,
        accessibilityScore: null,
        bestPracticesScore: null,
        seoScore: null,
        lcpMs: null,
        cls: null,
        inpMs: null,
        ttfbMs: null,
        errorMessage: null,
        r2Key: null,
      },
    ]);

    const result = await getAuditLighthouseTool.handler(
      { projectId: "project_1", strategy: "desktop", urlContains: "kontakt" },
      toolContext,
    );

    expect(result.structuredContent.total).toBe(1);
    expect(result.structuredContent.results[0]).toMatchObject({
      url: "https://example.com/kontakt",
      strategy: "desktop",
    });
  });

  it("explains that Lighthouse was never run when the audit has no results", async () => {
    mocks.getLighthouseForAudit.mockResolvedValue([]);

    const result = await getAuditLighthouseTool.handler(
      { projectId: "project_1" },
      toolContext,
    );

    expect(result.structuredContent.total).toBe(0);
    expect(textContent(result)).toContain("runLighthouse: true");
  });
});
