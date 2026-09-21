/* eslint-disable max-lines -- four related, genuinely thin DataForSEO Labs/SERP wrappers, same grouping style as dataforseo-research-tools.ts */
import { z } from "zod";
import { createDataforseoClient } from "@/server/lib/dataforseo";
import { normalizeDomainInput } from "@/server/lib/domainUtils";
import {
  assertLabsLocationCode,
  assertLanguageForLocation,
} from "@/server/lib/market";
import { buildProjectMeta } from "@/server/mcp/context";
import { mcpResponse } from "@/server/mcp/formatters";
import {
  looseObjectOutputSchema,
  optionalMetaOutputSchema,
} from "@/server/mcp/output-schemas";
import { withMcpProjectAuth } from "@/server/mcp/project-auth";
import {
  formatMcpTable,
  readPath,
  type McpTableColumn,
} from "@/server/mcp/table";
import {
  languageCodeSchema,
  locationCodeSchema,
  projectIdSchema,
} from "@/server/mcp/schemas";
import { resolveLabsMarket, resolveMarket } from "@/shared/keyword-locations";

/**
 * Four more thin DataForSEO wrappers (RankMeister SEO-4 Punkt 5), each
 * checked against the dataforseo-client SDK's actual method list before
 * being built — see the comments on each endpoint below for the exact
 * source. No business logic, same as ai-visibility-tools.ts and
 * llm-scraper-tools.ts: resolve the project's market, call the client,
 * format the rows.
 */

// ---------------------------------------------------------------------------
// get_keyword_gap — Labs `google/domain_intersection/live`
// ---------------------------------------------------------------------------

const getKeywordGapInputSchema = {
  projectId: projectIdSchema,
  yourDomain: z
    .string()
    .min(1)
    .max(2048)
    .describe("Your own domain (e.g. 'leifken.ai')."),
  competitorDomain: z
    .string()
    .min(1)
    .max(2048)
    .describe("The competitor's domain to compare against."),
  includeSubdomains: z
    .boolean()
    .optional()
    .describe("Include subdomains for both domains. Defaults to true."),
  gapOnly: z
    .boolean()
    .optional()
    .describe(
      "true (default): only keywords the competitor ranks for and you don't (the actual 'gap'). false: every keyword either domain ranks for, including ones you both rank for.",
    ),
  locationCode: locationCodeSchema.optional(),
  languageCode: languageCodeSchema.optional(),
  limit: z
    .number()
    .int()
    .min(1)
    .max(1000)
    .optional()
    .describe("Max rows to return (1-1000). Defaults to 100."),
} as const;

type GetKeywordGapArgs = z.infer<z.ZodObject<typeof getKeywordGapInputSchema>>;

function hasSerpElement(row: unknown, field: string): boolean {
  return readPath(row, field) != null;
}

const KEYWORD_GAP_COLUMNS: McpTableColumn<unknown>[] = [
  {
    header: "keyword",
    value: (row) => readPath(row, "keyword_data", "keyword"),
  },
  {
    header: "volume",
    value: (row) =>
      readPath(row, "keyword_data", "keyword_info", "search_volume"),
  },
  {
    header: "KD",
    value: (row) =>
      readPath(row, "keyword_data", "keyword_properties", "keyword_difficulty"),
  },
  {
    header: "competitor rank",
    value: (row) =>
      readPath(row, "second_domain_serp_element", "rank_absolute"),
  },
  {
    header: "competitor url",
    value: (row) => readPath(row, "second_domain_serp_element", "url"),
  },
  {
    header: "your rank",
    value: (row) =>
      readPath(row, "first_domain_serp_element", "rank_absolute") ?? "—",
  },
];

export const getKeywordGapTool = {
  name: "get_keyword_gap",
  config: {
    title: "Get keyword gap",
    description:
      "Finds keywords a competitor ranks for that you don't (DataForSEO Labs domain_intersection, gapOnly: true by default) — or, with gapOnly: false, every keyword either domain ranks for including shared ones. Use this to build a content/ranking to-do list against one named competitor. Charges credits.",
    inputSchema: getKeywordGapInputSchema,
    outputSchema: {
      items: z.array(looseObjectOutputSchema),
      gapCount: z.number(),
      totalReturned: z.number(),
      ...optionalMetaOutputSchema,
    },
    annotations: {
      readOnlyHint: false,
      openWorldHint: false,
      destructiveHint: false,
    },
  },
  handler: withMcpProjectAuth(async (args: GetKeywordGapArgs, context) => {
    const { locationCode, languageCode } = resolveLabsMarket(
      args,
      context.project,
    );
    assertLabsLocationCode(locationCode);
    assertLanguageForLocation(locationCode, languageCode);
    const includeSubdomains = args.includeSubdomains ?? true;
    const gapOnly = args.gapOnly ?? true;
    const target1 = normalizeDomainInput(args.yourDomain, includeSubdomains);
    const target2 = normalizeDomainInput(
      args.competitorDomain,
      includeSubdomains,
    );

    const client = createDataforseoClient(context.billing);
    const rows = await client.domain.intersection({
      target1,
      target2,
      locationCode,
      languageCode,
      // intersections: true (DataForSEO default) returns only keywords BOTH
      // rank for; we want the full union so a gap (competitor ranks, you
      // don't) is computable from the per-domain serp elements below.
      intersections: !gapOnly,
      limit: args.limit ?? 100,
    });

    const items = gapOnly
      ? rows.filter(
          (row) =>
            hasSerpElement(row, "second_domain_serp_element") &&
            !hasSerpElement(row, "first_domain_serp_element"),
        )
      : rows;
    const gapCount = rows.filter(
      (row) =>
        hasSerpElement(row, "second_domain_serp_element") &&
        !hasSerpElement(row, "first_domain_serp_element"),
    ).length;

    const text =
      items.length === 0
        ? `No ${gapOnly ? "gap " : ""}keywords found between ${target1} and ${target2}.`
        : [
            gapOnly
              ? `${items.length} keyword(s) ${target2} ranks for and ${target1} doesn't:`
              : `${items.length} keyword row(s) for ${target1} vs ${target2} (${gapCount} are a gap for ${target1}):`,
            formatMcpTable(items, KEYWORD_GAP_COLUMNS),
          ].join("\n");

    return mcpResponse({
      text,
      meta: buildProjectMeta(
        context,
        args.projectId,
        `/p/${args.projectId}/domain`,
      ),
      structuredContent: { items, gapCount, totalReturned: rows.length },
    });
  }),
};

// ---------------------------------------------------------------------------
// get_historical_rank_overview — Labs `google/historical_rank_overview/live`
// ---------------------------------------------------------------------------

const getHistoricalRankOverviewInputSchema = {
  projectId: projectIdSchema,
  domain: z
    .string()
    .min(1)
    .max(2048)
    .describe("Domain to look up history for."),
  includeSubdomains: z
    .boolean()
    .optional()
    .describe("Include subdomains. Defaults to true."),
  dateFrom: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .describe(
      "Inclusive start date YYYY-MM-DD. Earliest available: 2020-10-01.",
    ),
  dateTo: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .describe("Inclusive end date YYYY-MM-DD."),
  locationCode: locationCodeSchema.optional(),
  languageCode: languageCodeSchema.optional(),
} as const;

type GetHistoricalRankOverviewArgs = z.infer<
  z.ZodObject<typeof getHistoricalRankOverviewInputSchema>
>;

function formatYearMonth(row: unknown): string {
  const year = readPath(row, "year");
  const month = readPath(row, "month");
  const monthStr =
    typeof month === "number" ? String(month).padStart(2, "0") : "??";
  return `${typeof year === "number" ? year : "????"}-${monthStr}`;
}

const HISTORICAL_RANK_COLUMNS: McpTableColumn<unknown>[] = [
  {
    header: "month",
    value: (row) => formatYearMonth(row),
  },
  {
    header: "pos 1",
    value: (row) => readPath(row, "metrics", "organic", "pos_1"),
  },
  {
    header: "pos 2-3",
    value: (row) => readPath(row, "metrics", "organic", "pos_2_3"),
  },
  {
    header: "pos 4-10",
    value: (row) => readPath(row, "metrics", "organic", "pos_4_10"),
  },
  {
    header: "pos 11-20",
    value: (row) => readPath(row, "metrics", "organic", "pos_11_20"),
  },
  {
    header: "keywords",
    value: (row) => readPath(row, "metrics", "organic", "count"),
  },
  { header: "ETV", value: (row) => readPath(row, "metrics", "organic", "etv") },
];

export const getHistoricalRankOverviewTool = {
  name: "get_historical_rank_overview",
  config: {
    title: "Get historical rank overview",
    description:
      "Monthly organic ranking history for a domain since 2020-10 at the earliest — position buckets (pos_1, pos_2_3, pos_4_10, ...), keyword count, and estimated traffic value (ETV) per month. Use it to see whether a domain's visibility trend is improving before/after a change, or to compare against a competitor's own history. Charges credits.",
    inputSchema: getHistoricalRankOverviewInputSchema,
    outputSchema: {
      target: z.string(),
      months: z.array(looseObjectOutputSchema),
      ...optionalMetaOutputSchema,
    },
    annotations: {
      readOnlyHint: false,
      openWorldHint: false,
      destructiveHint: false,
    },
  },
  handler: withMcpProjectAuth(
    async (args: GetHistoricalRankOverviewArgs, context) => {
      const { locationCode, languageCode } = resolveLabsMarket(
        args,
        context.project,
      );
      assertLabsLocationCode(locationCode);
      assertLanguageForLocation(locationCode, languageCode);
      const target = normalizeDomainInput(
        args.domain,
        args.includeSubdomains ?? true,
      );

      const client = createDataforseoClient(context.billing);
      const months = await client.domain.historicalRankOverview({
        target,
        locationCode,
        languageCode,
        dateFrom: args.dateFrom,
        dateTo: args.dateTo,
      });
      // DataForSEO returns oldest-first already, but be explicit about it
      // rather than relying on provider order for a trend readout.
      const sorted = months.toSorted((a, b) => {
        const aKey = (a.year ?? 0) * 12 + (a.month ?? 0);
        const bKey = (b.year ?? 0) * 12 + (b.month ?? 0);
        return aKey - bKey;
      });

      const text =
        sorted.length === 0
          ? `No historical rank data for ${target} in this date range.`
          : `Monthly organic rank history for ${target} (${sorted.length} month(s)):\n${formatMcpTable(sorted, HISTORICAL_RANK_COLUMNS)}`;

      return mcpResponse({
        text,
        meta: buildProjectMeta(
          context,
          args.projectId,
          `/p/${args.projectId}/domain`,
        ),
        structuredContent: { target, months: sorted },
      });
    },
  ),
};

// ---------------------------------------------------------------------------
// get_keywords_for_site — Labs `google/keywords_for_site/live`
// ---------------------------------------------------------------------------

const getKeywordsForSiteInputSchema = {
  projectId: projectIdSchema,
  domain: z
    .string()
    .min(1)
    .max(2048)
    .describe("Domain whose on-site content is mined for keyword ideas."),
  includeSubdomains: z
    .boolean()
    .optional()
    .describe("Include subdomains. Defaults to true."),
  locationCode: locationCodeSchema.optional(),
  languageCode: languageCodeSchema.optional(),
  limit: z
    .number()
    .int()
    .min(1)
    .max(1000)
    .optional()
    .describe("Max rows to return (1-1000). Defaults to 100."),
} as const;

type GetKeywordsForSiteArgs = z.infer<
  z.ZodObject<typeof getKeywordsForSiteInputSchema>
>;

const KEYWORDS_FOR_SITE_COLUMNS: McpTableColumn<unknown>[] = [
  { header: "keyword", value: (row) => readPath(row, "keyword") },
  {
    header: "volume",
    value: (row) => readPath(row, "keyword_info", "search_volume"),
  },
  { header: "CPC", value: (row) => readPath(row, "keyword_info", "cpc") },
  {
    header: "competition",
    value: (row) => readPath(row, "keyword_info", "competition"),
  },
  {
    header: "KD",
    value: (row) => readPath(row, "keyword_properties", "keyword_difficulty"),
  },
];

export const getKeywordsForSiteTool = {
  name: "get_keywords_for_site",
  config: {
    title: "Get keywords for site",
    description:
      "Keyword ideas DataForSEO has mined from a site's own content and existing rankings (Labs keywords_for_site) — different from get_ranked_keywords (what the domain already ranks for) and get_domain_keyword_suggestions (a competitor's ranked keywords): this one surfaces keywords the site itself is topically relevant for, ranked or not. Charges credits.",
    inputSchema: getKeywordsForSiteInputSchema,
    outputSchema: {
      target: z.string(),
      keywords: z.array(looseObjectOutputSchema),
      ...optionalMetaOutputSchema,
    },
    annotations: {
      readOnlyHint: false,
      openWorldHint: false,
      destructiveHint: false,
    },
  },
  handler: withMcpProjectAuth(async (args: GetKeywordsForSiteArgs, context) => {
    const { locationCode, languageCode } = resolveLabsMarket(
      args,
      context.project,
    );
    assertLabsLocationCode(locationCode);
    assertLanguageForLocation(locationCode, languageCode);
    const target = normalizeDomainInput(
      args.domain,
      args.includeSubdomains ?? true,
    );

    const client = createDataforseoClient(context.billing);
    const keywords = await client.domain.keywordsForSite({
      target,
      locationCode,
      languageCode,
      includeSubdomains: args.includeSubdomains ?? true,
      limit: args.limit ?? 100,
    });

    const text =
      keywords.length === 0
        ? `No keyword ideas found for ${target}.`
        : `${keywords.length} keyword idea(s) for ${target}:\n${formatMcpTable(keywords, KEYWORDS_FOR_SITE_COLUMNS)}`;

    return mcpResponse({
      text,
      meta: buildProjectMeta(
        context,
        args.projectId,
        `/p/${args.projectId}/keywords`,
      ),
      structuredContent: { target, keywords },
    });
  }),
};

// ---------------------------------------------------------------------------
// get_autocomplete_suggestions — SERP `google/autocomplete/live/advanced`
// ---------------------------------------------------------------------------

const getAutocompleteSuggestionsInputSchema = {
  projectId: projectIdSchema,
  query: z
    .string()
    .min(1)
    .max(700)
    .describe(
      "Partial search phrase to get Google Autocomplete suggestions for.",
    ),
  locationCode: locationCodeSchema.optional(),
  languageCode: languageCodeSchema.optional(),
} as const;

type GetAutocompleteSuggestionsArgs = z.infer<
  z.ZodObject<typeof getAutocompleteSuggestionsInputSchema>
>;

const AUTOCOMPLETE_COLUMNS: McpTableColumn<unknown>[] = [
  { header: "#", value: (row) => readPath(row, "rank_absolute") },
  { header: "suggestion", value: (row) => readPath(row, "suggestion") },
  { header: "relevance", value: (row) => readPath(row, "relevance") },
];

export const getAutocompleteSuggestionsTool = {
  name: "get_autocomplete_suggestions",
  config: {
    title: "Get autocomplete suggestions",
    description:
      "Live Google Autocomplete suggestions for a partial search phrase (SERP google/autocomplete/live/advanced) — what real users are typing next. Use it for long-tail keyword and content ideas grounded in actual search behavior, or to check what autocomplete suggests for your own brand name. Charges credits.",
    inputSchema: getAutocompleteSuggestionsInputSchema,
    outputSchema: {
      suggestions: z.array(looseObjectOutputSchema),
      ...optionalMetaOutputSchema,
    },
    annotations: {
      readOnlyHint: true,
      openWorldHint: true,
      destructiveHint: false,
    },
  },
  handler: withMcpProjectAuth(
    async (args: GetAutocompleteSuggestionsArgs, context) => {
      const { locationCode, languageCode } = resolveMarket(
        args,
        context.project,
      );
      const client = createDataforseoClient(context.billing);
      const suggestions = await client.serp.autocomplete({
        keyword: args.query,
        locationCode,
        languageCode,
      });

      const text =
        suggestions.length === 0
          ? `No autocomplete suggestions for "${args.query}".`
          : `${suggestions.length} autocomplete suggestion(s) for "${args.query}":\n${formatMcpTable(suggestions, AUTOCOMPLETE_COLUMNS)}`;

      return mcpResponse({
        text,
        meta: buildProjectMeta(
          context,
          args.projectId,
          `/p/${args.projectId}/keywords`,
        ),
        structuredContent: { suggestions },
      });
    },
  ),
};
