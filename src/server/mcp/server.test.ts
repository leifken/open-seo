import { describe, expect, it, vi } from "vitest";

vi.mock("cloudflare:workers", () => ({
  env: {},
  // AuditScratchpad (pulled in transitively via runSiteAuditTool) extends
  // this at module scope; a plain stub is enough since registration never
  // instantiates it.
  DurableObject: class {
    noop() {
      /* stub */
    }
  },
}));

import { createOpenSeoMcpServer } from "@/server/mcp/server";
import type { McpProps } from "@/server/mcp/context";
import { MCP_AUTH_CONTEXT_PROP } from "@/server/mcp/context";

const props: McpProps = {
  [MCP_AUTH_CONTEXT_PROP]: {
    userId: "user_1",
    userEmail: "test@example.com",
    organizationId: "org_1",
    baseUrl: "https://open-seo.test",
  },
};

// Smoke test for the whole tools/list surface (SEO-4 Abnahme: "tools/list:
// alle alten Werkzeuge unverändert"). McpServer#registerTool throws
// synchronously on a duplicate name, so constructing the server without
// throwing is itself proof every tool has a unique name; this then asserts
// the pre-SEO-4 tool set is untouched and the new tools are present.
const PRE_SEO4_TOOL_NAMES = [
  "whoami",
  "list_projects",
  "create_project",
  "get_project_context",
  "update_project_context",
  "list_saved_keywords",
  "research_keywords",
  "save_keywords",
  "get_domain_overview",
  "get_domain_keyword_suggestions",
  "get_backlinks_overview",
  "get_backlinks_profile",
  "get_serp_results",
  "create_rank_tracker",
  "get_rank_tracker",
  "add_rank_tracking_keywords",
  "remove_rank_tracking_keywords",
  "estimate_rank_tracker_cost",
  "run_rank_tracker",
  "get_ranked_keywords",
  "find_serp_competitors",
  "search_local_businesses",
  "get_local_serp_results",
  "get_google_business_questions",
  "get_business_profile",
  "get_business_reviews",
  "get_business_updates",
  "list_business_categories",
  "get_local_rank_grid",
  "get_keyword_metrics",
  "get_ai_visibility",
  "explore_ai_prompt",
  "get_search_console_performance",
  "inspect_urls",
  "get_google_analytics_organic_landing_pages",
  "get_google_analytics_page_performance",
  "get_google_analytics_key_events",
  "get_search_opportunities",
  "get_google_analytics_organic_overview",
  "get_google_analytics_traffic_acquisition",
  "get_google_analytics_measurement_health",
  "get_google_analytics_ecommerce_performance",
  "get_google_analytics_site_search",
  "get_google_analytics_audience_breakdown",
  "run_site_audit",
  "get_audit_status",
  "get_audit_issues",
  "get_audit_pages",
] as const;

const SEO4_NEW_TOOL_NAMES = [
  "get_audit_lighthouse",
  "get_chatgpt_answer",
  "get_gemini_ai_answer",
  "get_keyword_gap",
  "get_historical_rank_overview",
  "get_keywords_for_site",
  "get_autocomplete_suggestions",
] as const;

const SEO5_NEW_TOOL_NAMES = [
  "resolve_locations",
  "get_keyword_volume_by_location",
] as const;

describe("createOpenSeoMcpServer", () => {
  it("registers every tool exactly once (registerTool throws on a duplicate name)", () => {
    expect(() => createOpenSeoMcpServer(props)).not.toThrow();
  });

  it("keeps every pre-SEO-4 tool name and adds the new SEO-4 tools, nothing removed", () => {
    const server = createOpenSeoMcpServer(props);
    // _registeredTools is the SDK's internal registry (verified against the
    // compiled McpServer source) — there's no public listing API on the
    // server object itself outside of an actual tools/list RPC round trip.
    const internal: unknown = server;
    if (
      typeof internal !== "object" ||
      internal === null ||
      !("_registeredTools" in internal) ||
      typeof internal._registeredTools !== "object" ||
      internal._registeredTools === null
    ) {
      throw new Error(
        "McpServer no longer exposes _registeredTools — update this test to match the SDK's current internals.",
      );
    }
    const registered = Object.keys(internal._registeredTools);

    for (const name of PRE_SEO4_TOOL_NAMES) {
      expect(registered).toContain(name);
    }
    for (const name of [...SEO4_NEW_TOOL_NAMES, ...SEO5_NEW_TOOL_NAMES]) {
      expect(registered).toContain(name);
    }
    expect(registered).toHaveLength(
      PRE_SEO4_TOOL_NAMES.length +
        SEO4_NEW_TOOL_NAMES.length +
        SEO5_NEW_TOOL_NAMES.length,
    );
  });
});
