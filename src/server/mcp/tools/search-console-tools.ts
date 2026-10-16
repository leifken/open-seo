import { sort } from "remeda";
/* eslint-disable max-lines */
import { z } from "zod";
import { buildProjectMeta } from "@/server/mcp/context";
import { mcpResponse } from "@/server/mcp/formatters";
import { optionalMetaOutputSchema } from "@/server/mcp/output-schemas";
import { withMcpProjectAuth } from "@/server/mcp/project-auth";
import {
  formatMcpTable,
  percentCell,
  positionCell,
  type McpTableColumn,
} from "@/server/mcp/table";
import { projectIdSchema } from "@/server/mcp/schemas";
import { buildDashboardUrl } from "@/server/mcp/urls";
import { hasGoogleOAuthConfig } from "@/server/features/google/oauth-config";
import {
  GscService,
  type GscOrganizationSiteListResult,
} from "@/server/features/gsc/services/GscService";
import {
  GSC_DATE_RANGES,
  GSC_DEFAULT_ROW_LIMIT,
  GSC_DIMENSIONS,
  GSC_FILTER_OPERATORS,
  GSC_MAX_ROW_LIMIT,
  GSC_SEARCH_TYPES,
  type GscPerformanceInput,
} from "@/server/features/gsc/searchAnalytics";
import {
  GSC_API_DISABLED_MESSAGE,
  GscApiError,
  GscNotConnectedError,
  GscTokenError,
} from "@/server/lib/gscErrors";
import { AppError } from "@/server/lib/errors";
import { GSC_SELF_HOSTED_SETUP_DOCS_URL } from "@/shared/gsc";

type GscPerfRow = {
  keys?: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position?: number;
};

const GSC_PERF_COLUMNS: McpTableColumn<GscPerfRow>[] = [
  { header: "key", value: (row) => row.keys?.join(" / ") ?? "(total)" },
  { header: "clicks", value: (row) => row.clicks },
  { header: "impressions", value: (row) => row.impressions },
  { header: "CTR", value: (row) => row.ctr, format: percentCell },
  { header: "position", value: (row) => row.position, format: positionCell },
];

type ProjectAuthContext = {
  auth: { organizationId: string };
  baseUrl: string;
};

function connectGscUrl(baseUrl: string, projectId: string): string {
  // GSC Insights hosts the connection card AND the data the user came for,
  // so land them there rather than in settings.
  return buildDashboardUrl(baseUrl, `/p/${projectId}/search-performance`);
}

/** Self-hosted GSC requires the operator to provide a Google OAuth client and
 *  BETTER_AUTH_SECRET. Return this setup nudge before attempting a token lookup
 *  when either is missing. */
async function missingSelfHostedGoogleClientResponse(
  context: ProjectAuthContext,
  projectId: string,
) {
  if (await hasGoogleOAuthConfig()) return null;

  return mcpResponse({
    text: `This self-hosted OpenSEO deployment is not configured for Search Console yet. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and BETTER_AUTH_SECRET, then reconnect Search Console from the project's settings page. Setup docs: ${GSC_SELF_HOSTED_SETUP_DOCS_URL}`,
    meta: buildProjectMeta(context, projectId),
    isError: true,
    structuredContent: {
      ok: false,
      connected: false,
      reason: "gsc_oauth_not_configured",
      setupDocsUrl: GSC_SELF_HOSTED_SETUP_DOCS_URL,
    },
  });
}

function invalidRequest(
  meta: ReturnType<typeof buildProjectMeta>,
  message: string,
) {
  return mcpResponse({
    text: message,
    meta,
    isError: true,
    structuredContent: { ok: false, reason: "invalid_request" },
  });
}

function describeGscError(error: unknown): string {
  if (error instanceof GscNotConnectedError) {
    return "Search Console is not connected for this project.";
  }
  if (error instanceof GscTokenError) {
    return "The Search Console connection has expired or was revoked. Reconnect it to continue.";
  }
  if (error instanceof GscApiError) {
    return error.apiDisabled
      ? `${GSC_API_DISABLED_MESSAGE} Setup docs: ${GSC_SELF_HOSTED_SETUP_DOCS_URL}`
      : error.message;
  }
  return error instanceof Error ? error.message : String(error);
}

const SITE_UNVERIFIED_PERMISSION = "siteUnverifiedUser";

type AvailableProperty = {
  siteUrl: string;
  permissionLevel: string;
  verified: boolean;
  userId: string;
  accountId: string;
};

function availableProperties(
  result: GscOrganizationSiteListResult,
): AvailableProperty[] {
  const unique = new Map<string, AvailableProperty>();
  for (const account of result.accounts) {
    if (account.requiresReconnect) continue;
    for (const site of account.sites) {
      const property = {
        ...site,
        verified: site.permissionLevel !== SITE_UNVERIFIED_PERMISSION,
        userId: account.userId,
        accountId: account.accountId,
      };
      const existing = unique.get(site.siteUrl);
      if (!existing || (!existing.verified && property.verified)) {
        unique.set(site.siteUrl, property);
      }
    }
  }
  return [...unique.values()];
}

function hasGoogleGrant(result: GscOrganizationSiteListResult): boolean {
  return result.accounts.some((account) => !account.requiresReconnect);
}

function parseSiteDomain(siteUrl: string): {
  domain: string;
  isDomainProperty: boolean;
  url?: URL;
} | null {
  if (siteUrl.startsWith("sc-domain:")) {
    const value = siteUrl.slice("sc-domain:".length).trim();
    if (!value) return null;
    try {
      const parsed = new URL(`https://${value}`);
      if (
        parsed.username ||
        parsed.password ||
        parsed.port ||
        parsed.pathname !== "/" ||
        parsed.search ||
        parsed.hash
      ) {
        return null;
      }
      return {
        domain: parsed.hostname.toLowerCase().replace(/\.$/, ""),
        isDomainProperty: true,
      };
    } catch {
      return null;
    }
  }

  try {
    const parsed = new URL(siteUrl);
    if (
      (parsed.protocol !== "https:" && parsed.protocol !== "http:") ||
      parsed.username ||
      parsed.password ||
      !parsed.hostname
    ) {
      return null;
    }
    return {
      domain: parsed.hostname.toLowerCase().replace(/\.$/, ""),
      isDomainProperty: false,
      url: parsed,
    };
  } catch {
    return null;
  }
}

function comparableDomain(domain: string): string {
  return domain
    .toLowerCase()
    .replace(/\.$/, "")
    .replace(/^www\./, "");
}

function propertyMatchesProjectDomain(
  siteUrl: string,
  projectDomain: string,
): boolean {
  const property = parseSiteDomain(siteUrl);
  return (
    property !== null &&
    comparableDomain(property.domain) === comparableDomain(projectDomain)
  );
}

function automaticMatchScore(
  siteUrl: string,
  projectDomain: string,
): number | null {
  const property = parseSiteDomain(siteUrl);
  if (
    !property ||
    comparableDomain(property.domain) !== comparableDomain(projectDomain)
  ) {
    return null;
  }
  if (property.isDomainProperty) return 0;

  const url = property.url;
  if (!url || url.pathname !== "/" || url.search || url.hash || url.port) {
    return null;
  }
  const schemeScore = url.protocol === "https:" ? 1 : 3;
  return schemeScore + (property.domain.startsWith("www.") ? 1 : 0);
}

function seenDomains(properties: AvailableProperty[]): string[] {
  return [
    ...new Set(
      properties.flatMap((property) => {
        const parsed = parseSiteDomain(property.siteUrl);
        return parsed ? [parsed.domain] : [];
      }),
    ),
  ];
}

function isUnknownProject(error: unknown): boolean {
  return (
    error instanceof AppError &&
    (error.code === "NOT_FOUND" || error.code === "FORBIDDEN")
  );
}

function unknownProjectResponse(projectId: string) {
  return mcpResponse({
    text: `Project ${projectId} is not available in this organization.`,
    meta: { projectId },
    structuredContent: {
      ok: false,
      status: "projekt_unbekannt" as const,
    },
  });
}

// ---------------------------------------------------------------------------
// list_search_console_properties
// ---------------------------------------------------------------------------

export const listSearchConsolePropertiesTool = {
  name: "list_search_console_properties",
  config: {
    title: "List Google Search Console properties",
    description:
      "List every Google Search Console property visible through this organization's connected Google grants, including its permission level and whether access is verified. Read-only; uses no credits.",
    inputSchema: {},
    outputSchema: {
      ok: z.boolean(),
      status: z.enum(["verfuegbar", "keine_google_freigabe"]),
      properties: z.array(
        z.looseObject({
          siteUrl: z.string(),
          permissionLevel: z.string(),
          verified: z.boolean(),
        }),
      ),
      ...optionalMetaOutputSchema,
    },
    annotations: {
      readOnlyHint: true,
      openWorldHint: false,
      destructiveHint: false,
    },
  },
  handler: async (
    _args: Record<string, never>,
    context: { auth: ProjectAuthContext["auth"] },
  ) => {
    const siteList = await GscService.listSitesForOrganizationWithGrantStatus(
      context.auth.organizationId,
    );
    if (!hasGoogleGrant(siteList)) {
      return mcpResponse({
        text: "No usable Google Search Console grant is connected to this organization.",
        structuredContent: {
          ok: false,
          status: "keine_google_freigabe" as const,
          properties: [],
        },
      });
    }

    const properties = availableProperties(siteList).map(
      ({ siteUrl, permissionLevel, verified }) => ({
        siteUrl,
        permissionLevel,
        verified,
      }),
    );
    const text =
      properties.length === 0
        ? "The connected Google grant currently sees no Search Console properties."
        : properties
            .map(
              (property) =>
                `${property.siteUrl} · ${property.permissionLevel} · ${property.verified ? "verified" : "unverified"}`,
            )
            .join("\n");
    return mcpResponse({
      text,
      structuredContent: {
        ok: true,
        status: "verfuegbar" as const,
        properties,
      },
    });
  },
};

// ---------------------------------------------------------------------------
// connect_search_console_property
// ---------------------------------------------------------------------------

const connectPropertyInputSchema = {
  projectId: projectIdSchema,
  siteUrl: z
    .string()
    .min(1)
    .optional()
    .describe(
      "Exact siteUrl returned by list_search_console_properties. Omit it to choose the best verified property matching the project's domain.",
    ),
} as const;

type ConnectPropertyArgs = z.infer<
  z.ZodObject<typeof connectPropertyInputSchema>
>;

const connectPropertyHandler = withMcpProjectAuth(
  async (args: ConnectPropertyArgs, context) => {
    const meta = buildProjectMeta(context, args.projectId);
    const siteList = await GscService.listSitesForOrganizationWithGrantStatus(
      context.auth.organizationId,
    );
    if (!hasGoogleGrant(siteList)) {
      return mcpResponse({
        text: "No usable Google Search Console grant is connected to this organization.",
        meta,
        structuredContent: {
          ok: false,
          status: "keine_google_freigabe" as const,
        },
      });
    }

    const properties = availableProperties(siteList);
    const projectDomain = context.project.domain;
    let match: AvailableProperty | undefined;
    if (projectDomain) {
      if (args.siteUrl) {
        match = properties.find(
          (property) =>
            property.verified &&
            property.siteUrl === args.siteUrl &&
            propertyMatchesProjectDomain(property.siteUrl, projectDomain),
        );
      } else {
        match = sort(
          properties
            .filter((property) => property.verified)
            .map((property) => ({
              property,
              score: automaticMatchScore(property.siteUrl, projectDomain),
            }))
            .filter(
              (
                candidate,
              ): candidate is { property: AvailableProperty; score: number } =>
                candidate.score !== null,
            ),
          (left, right) => left.score - right.score,
        )[0]?.property;
      }
    }

    if (!match) {
      const domains = seenDomains(properties);
      return mcpResponse({
        text: `No verified Search Console property matches this project's domain.${domains.length > 0 ? ` Seen domains: ${domains.join(", ")}.` : ""}`,
        meta,
        structuredContent: {
          ok: false,
          status: "keine_passende_property" as const,
          seenDomains: domains,
        },
      });
    }

    let connection: Awaited<ReturnType<typeof GscService.setSite>>;
    try {
      connection = await GscService.setSite({
        projectId: args.projectId,
        organizationId: context.auth.organizationId,
        siteUrl: match.siteUrl,
        accountId: match.accountId,
        userId: match.userId,
      });
    } catch (error) {
      // The grant or property can disappear between sites.list and the write.
      // Treat that as a non-match, not as an unknown project.
      if (
        error instanceof AppError &&
        (error.code === "NOT_FOUND" || error.code === "FORBIDDEN")
      ) {
        return mcpResponse({
          text: "The selected Search Console property is no longer available with verified access.",
          meta,
          structuredContent: {
            ok: false,
            status: "keine_passende_property" as const,
            seenDomains: seenDomains(properties),
          },
        });
      }
      throw error;
    }
    return mcpResponse({
      text: `Connected ${connection.siteUrl} with ${match.permissionLevel} permission.`,
      meta,
      structuredContent: {
        ok: true,
        status: "verbunden" as const,
        siteUrl: connection.siteUrl,
        permissionLevel: match.permissionLevel,
      },
    });
  },
);

export const connectSearchConsolePropertyTool = {
  name: "connect_search_console_property",
  config: {
    title: "Connect a Search Console property",
    description:
      "Connect a verified Search Console property to a project. With siteUrl, only that exact visible property is considered. Without it, selection prefers sc-domain:<project-domain>, then the project's root URL (HTTPS before HTTP, with or without www). A property whose domain differs from the project is never connected. Uses no credits.",
    inputSchema: connectPropertyInputSchema,
    outputSchema: {
      ok: z.boolean(),
      status: z.enum([
        "verbunden",
        "keine_passende_property",
        "keine_google_freigabe",
        "projekt_unbekannt",
      ]),
      siteUrl: z.string().optional(),
      permissionLevel: z.string().optional(),
      seenDomains: z.array(z.string()).optional(),
      ...optionalMetaOutputSchema,
    },
    annotations: {
      readOnlyHint: false,
      openWorldHint: false,
      destructiveHint: false,
    },
  },
  handler: async (
    args: ConnectPropertyArgs,
    context: Parameters<typeof connectPropertyHandler>[1],
  ) => {
    try {
      return await connectPropertyHandler(args, context);
    } catch (error) {
      if (isUnknownProject(error)) {
        return unknownProjectResponse(args.projectId);
      }
      throw error;
    }
  },
};

// ---------------------------------------------------------------------------
// get_search_console_connection
// ---------------------------------------------------------------------------

const connectionInputSchema = { projectId: projectIdSchema } as const;
type ConnectionArgs = z.infer<z.ZodObject<typeof connectionInputSchema>>;

const getConnectionHandler = withMcpProjectAuth(
  async (args: ConnectionArgs, context) => {
    const connection = await GscService.getConnection(args.projectId);
    const meta = buildProjectMeta(context, args.projectId);
    return mcpResponse({
      text: connection
        ? `Connected to ${connection.siteUrl} since ${connection.createdAt}${connection.connectedAccountEmail ? ` via ${connection.connectedAccountEmail}` : ""}.`
        : "No Search Console property is connected to this project.",
      meta,
      structuredContent: {
        ok: true,
        status: connection
          ? ("verbunden" as const)
          : ("nicht_verbunden" as const),
        connected: Boolean(connection),
        siteUrl: connection?.siteUrl ?? null,
        connectedAt: connection?.createdAt ?? null,
        connectedAccountEmail: connection?.connectedAccountEmail ?? null,
      },
    });
  },
);

export const getSearchConsoleConnectionTool = {
  name: "get_search_console_connection",
  config: {
    title: "Get a project's Search Console connection",
    description:
      "Report whether a project is connected to Search Console, including the exact property, connection time, and connected Google account address. Read-only; uses no credits.",
    inputSchema: connectionInputSchema,
    outputSchema: {
      ok: z.boolean(),
      status: z.enum(["verbunden", "nicht_verbunden", "projekt_unbekannt"]),
      connected: z.boolean().optional(),
      siteUrl: z.string().nullable().optional(),
      connectedAt: z.string().nullable().optional(),
      connectedAccountEmail: z.string().nullable().optional(),
      ...optionalMetaOutputSchema,
    },
    annotations: {
      readOnlyHint: true,
      openWorldHint: false,
      destructiveHint: false,
    },
  },
  handler: async (
    args: ConnectionArgs,
    context: Parameters<typeof getConnectionHandler>[1],
  ) => {
    try {
      return await getConnectionHandler(args, context);
    } catch (error) {
      if (isUnknownProject(error)) {
        return unknownProjectResponse(args.projectId);
      }
      throw error;
    }
  },
};

// ---------------------------------------------------------------------------
// get_search_console_performance
// ---------------------------------------------------------------------------

type MetricFilter = {
  minPosition?: number;
  maxPosition?: number;
  minImpressions?: number;
};

function pickMetricFilter(args: MetricFilter): MetricFilter | null {
  const { minPosition, maxPosition, minImpressions } = args;
  if (
    minPosition === undefined &&
    maxPosition === undefined &&
    minImpressions === undefined
  ) {
    return null;
  }
  return { minPosition, maxPosition, minImpressions };
}

// Rows without a position (discover/googleNews) never match a position bound.
function matchesMetricFilter(row: GscPerfRow, filter: MetricFilter): boolean {
  if (
    filter.minImpressions !== undefined &&
    row.impressions < filter.minImpressions
  ) {
    return false;
  }
  if (filter.minPosition !== undefined) {
    if (row.position === undefined || row.position < filter.minPosition)
      return false;
  }
  if (filter.maxPosition !== undefined) {
    if (row.position === undefined || row.position > filter.maxPosition)
      return false;
  }
  return true;
}

// Google returns full-precision floats (0.041237113402061855); four decimals of
// CTR and one of position is all anyone reads and trims ~40 bytes per row.
function roundMetrics<T extends GscPerfRow>(row: T): T {
  return {
    ...row,
    ctr: Math.round(row.ctr * 10_000) / 10_000,
    ...(row.position === undefined
      ? {}
      : { position: Math.round(row.position * 10) / 10 }),
  };
}

const filterSchema = z.object({
  dimension: z.enum(GSC_DIMENSIONS),
  operator: z.enum(GSC_FILTER_OPERATORS).default("equals"),
  expression: z.string().min(1),
});

const perfInputSchema = {
  projectId: projectIdSchema,
  dimensions: z
    .array(z.enum(GSC_DIMENSIONS))
    .min(1)
    .max(4)
    .optional()
    .describe(
      "Group rows by these dimensions. Default ['query']. Use ['page'] for top pages, ['query','page'] to map queries to pages / spot cannibalization, ['date'] for a time series.",
    ),
  dateRange: z
    .enum(GSC_DATE_RANGES)
    .optional()
    .describe(
      "Convenience window (default last_28_days). End is set ~3 days back for GSC data lag. Ignored if startDate+endDate are given. Max lookback is 16 months.",
    ),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .describe("Explicit start (YYYY-MM-DD, Pacific Time). Use with endDate."),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .describe("Explicit end (YYYY-MM-DD, Pacific Time). Use with startDate."),
  filters: z
    .array(filterSchema)
    .max(5)
    .optional()
    .describe(
      "AND-combined filters. To get the queries for one page: [{dimension:'page',operator:'equals',expression:'https://example.com/post'}] with dimensions ['query'].",
    ),
  rowLimit: z
    .number()
    .int()
    .min(1)
    .max(GSC_MAX_ROW_LIMIT)
    .optional()
    .describe(
      `Rows per call (default ${GSC_DEFAULT_ROW_LIMIT}, max ${GSC_MAX_ROW_LIMIT}). GSC sorts by clicks desc; paginate with startRow when hasMore is true.`,
    ),
  startRow: z.number().int().min(0).optional().describe("Pagination offset."),
  minPosition: z
    .number()
    .min(1)
    .optional()
    .describe(
      "Keep rows with average position >= this. For 'striking distance' queries use minPosition 5, maxPosition 20, minImpressions 50.",
    ),
  maxPosition: z
    .number()
    .min(1)
    .optional()
    .describe("Keep rows with average position <= this."),
  minImpressions: z
    .number()
    .int()
    .min(0)
    .optional()
    .describe("Keep rows with at least this many impressions."),
  type: z
    .enum(GSC_SEARCH_TYPES)
    .optional()
    .describe("Search type (default web)."),
  dataState: z
    .enum(["all", "final"])
    .optional()
    .describe("'all' (default) includes fresh/incomplete recent data."),
} as const;

type PerfArgs = z.infer<z.ZodObject<typeof perfInputSchema>>;

export const getSearchConsolePerformanceTool = {
  name: "get_search_console_performance",
  config: {
    title: "Get Google Search Console performance",
    description:
      "Query the connected Search Console property's Search Analytics: clicks, impressions, CTR, and average position by query/page/country/device/date. First-party data — use it for what already ranks, near-ranking queries, and pages with real demand. Google sorts by clicks and can't filter by position, so minPosition/maxPosition/minImpressions are applied server-side over the top 1000 rows of the window — use them instead of fetching everything. ctr is a 0-1 fraction; position is a 1-based average and is omitted from rows when type is 'discover' or 'googleNews' (Google does not report it there — treat it as unavailable, not a failure); dates are Pacific Time; the last ~3 days may be incomplete. Reads only the Search Console property already connected to an OpenSEO project the caller is authorized to access. The server selects the Google account and property from that project's saved connection. Read-only; uses no credits.",
    inputSchema: perfInputSchema,
    outputSchema: z.looseObject({
      ok: z.boolean(),
      reason: z.string().optional(),
      connectUrl: z.string().optional(),
      setupDocsUrl: z.string().optional(),
      siteUrl: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      dimensions: z.array(z.string()).optional(),
      rowCount: z.number().optional(),
      rows: z
        .array(
          z
            .looseObject({
              keys: z.array(z.string()).optional(),
              clicks: z.number(),
              impressions: z.number(),
              ctr: z.number(),
              // Google omits position for the discover and googleNews search
              // types even though the other metrics are present. The table
              // already renders a missing position as an em dash.
              position: z.number().optional(),
            })
            .passthrough(),
        )
        .optional(),
      hasMore: z.boolean().optional(),
      nextStartRow: z.number().optional(),
      ...optionalMetaOutputSchema,
    }),
    annotations: {
      readOnlyHint: true,
      openWorldHint: true,
      destructiveHint: false,
    },
  },
  handler: withMcpProjectAuth(async (args: PerfArgs, context) => {
    const blocked = await missingSelfHostedGoogleClientResponse(
      context,
      args.projectId,
    );
    if (blocked) return blocked;

    const connectUrl = connectGscUrl(context.baseUrl, args.projectId);
    const meta = buildProjectMeta(
      context,
      args.projectId,
      `/p/${args.projectId}/settings/integrations`,
    );

    // GSC rejects searchAppearance combined with any other dimension.
    if (
      args.dimensions &&
      args.dimensions.includes("searchAppearance") &&
      args.dimensions.length > 1
    ) {
      return invalidRequest(
        meta,
        "searchAppearance must be the only dimension when used.",
      );
    }
    // A half-specified explicit range would silently fall back to a default window.
    if (Boolean(args.startDate) !== Boolean(args.endDate)) {
      return invalidRequest(
        meta,
        "Provide both startDate and endDate, or neither (use dateRange instead).",
      );
    }

    try {
      const requestedLimit = args.rowLimit ?? GSC_DEFAULT_ROW_LIMIT;
      const metricFilter = pickMetricFilter(args);
      // Google can't filter by position or impressions, so with a metric filter
      // we fetch the full window and filter here; fetched == returned otherwise.
      const fetchLimit = metricFilter ? GSC_MAX_ROW_LIMIT : requestedLimit;
      const result = await GscService.getPerformance({
        projectId: args.projectId,
        dimensions: args.dimensions,
        dateRange: args.dateRange,
        startDate: args.startDate,
        endDate: args.endDate,
        filters: args.filters,
        rowLimit: fetchLimit,
        startRow: args.startRow,
        type: args.type,
        dataState: args.dataState,
      } satisfies GscPerformanceInput);
      const dimensions = result.request.dimensions ?? ["query"];
      const startRow = result.request.startRow ?? 0;
      const fetched = result.rows;
      const kept = metricFilter
        ? fetched.filter((row) => matchesMetricFilter(row, metricFilter))
        : fetched;
      const rows = kept.slice(0, requestedLimit).map(roundMetrics);
      // Pagination stays in Google's row space: the next page starts right after
      // the last row we returned (which may be well past rows.length when a
      // metric filter dropped rows before it).
      const lastReturned = kept[rows.length - 1];
      const truncated = kept.length > rows.length;
      const hasMore = truncated || fetched.length >= fetchLimit;
      const nextStartRow =
        truncated && lastReturned
          ? startRow + fetched.indexOf(lastReturned) + 1
          : startRow + fetched.length;

      const filterText = metricFilter
        ? ` · filtered ${fetched.length} rows → ${kept.length}`
        : "";
      const header =
        `${result.siteUrl} · ${dimensions.join("+")} · ${result.request.startDate}→${result.request.endDate} · ` +
        `${rows.length} row${rows.length === 1 ? "" : "s"}${filterText}${hasMore ? ` (more available — call again with startRow=${nextStartRow})` : ""}`;
      const text =
        rows.length > 0
          ? `${header}\n${formatMcpTable(rows, GSC_PERF_COLUMNS)}`
          : `${header}\nNo rows for this query/date range.`;

      return mcpResponse({
        text,
        meta,
        structuredContent: {
          ok: true,
          siteUrl: result.siteUrl,
          startDate: result.request.startDate,
          endDate: result.request.endDate,
          dimensions,
          rowCount: rows.length,
          rows,
          hasMore,
          nextStartRow: hasMore ? nextStartRow : undefined,
        },
      });
    } catch (error) {
      const isNotConnected = error instanceof GscNotConnectedError;
      const apiDisabled = error instanceof GscApiError && error.apiDisabled;
      return mcpResponse({
        text: `${describeGscError(error)}${isNotConnected ? ` Connect it here: ${connectUrl}` : apiDisabled ? "" : ` (reconnect at ${connectUrl})`}`,
        meta,
        isError: true,
        structuredContent: {
          ok: false,
          reason: isNotConnected ? "not_connected" : "api_error",
          connectUrl,
        },
      });
    }
  }),
};

// ---------------------------------------------------------------------------
// inspect_urls
// ---------------------------------------------------------------------------

const INSPECT_LIST_PREVIEW = 2;

type UrlInspection = Awaited<
  ReturnType<typeof GscService.inspectUrls>
>["results"][number];

/** Join `label: value` pairs into one compact line, dropping pairs Google
 *  didn't report. Returns undefined when nothing survives, so the caller can
 *  skip the line entirely instead of printing empty labels. */
function detailLine(pairs: [string, string | undefined][]): string | undefined {
  const rendered = pairs
    .filter((pair): pair is [string, string] => Boolean(pair[1]))
    .map(([label, value]) => `${label}: ${value}`);
  return rendered.length > 0 ? rendered.join(" · ") : undefined;
}

/** Show the first couple of URLs plus a count so sitemap/referrer lists can't
 *  dominate the block (the full arrays stay in structuredContent). */
function listPreview(values: string[] | undefined): string | undefined {
  if (!values || values.length === 0) return undefined;
  const shown = values.slice(0, INSPECT_LIST_PREVIEW).join(", ");
  const rest = values.length - INSPECT_LIST_PREVIEW;
  return rest > 0 ? `${values.length} (${shown}, +${rest} more)` : shown;
}

/** A Google-selected canonical that differs from the declared one is the usual
 *  answer to "why isn't my page indexed?", so call the mismatch out. */
function canonicalSummary(
  google: string | undefined,
  user: string | undefined,
): string | undefined {
  if (google && user) {
    return google === user
      ? `${google} (declared canonical matches)`
      : `MISMATCH — Google selected ${google}, page declares ${user}`;
  }
  if (google) return `Google selected ${google} (no declared canonical)`;
  if (user) return `page declares ${user}`;
  return undefined;
}

/** One block per inspected URL: the headline verdict plus the fields an SEO
 *  acts on. Issue lists stay in structuredContent; sitemaps and referring
 *  URLs are previewed. */
function inspectionBlock(inspection: UrlInspection): string {
  if (inspection.error) return `${inspection.url} — error: ${inspection.error}`;
  if (!inspection.result) {
    return `${inspection.url} — no inspection result returned.`;
  }

  const index = inspection.result.indexStatusResult;
  const headline = `${inspection.url} — ${index?.verdict ?? "UNKNOWN"}: ${index?.coverageState ?? "no coverage state reported"}`;
  const lines = [
    detailLine([
      ["robots.txt", index?.robotsTxtState],
      ["indexing", index?.indexingState],
      ["page fetch", index?.pageFetchState],
    ]),
    detailLine([
      ["last crawl", index?.lastCrawlTime],
      ["crawled as", index?.crawledAs],
    ]),
    detailLine([
      [
        "canonical",
        canonicalSummary(index?.googleCanonical, index?.userCanonical),
      ],
    ]),
    detailLine([
      ["mobile usability", inspection.result.mobileUsabilityResult?.verdict],
      ["rich results", inspection.result.richResultsResult?.verdict],
    ]),
    detailLine([
      ["sitemaps", listPreview(index?.sitemap)],
      ["referring URLs", listPreview(index?.referringUrls)],
    ]),
    detailLine([["details", inspection.result.inspectionResultLink]]),
  ].filter((line) => line !== undefined);

  return [headline, ...lines.map((line) => `  ${line}`)].join("\n");
}

const inspectInputSchema = {
  projectId: projectIdSchema,
  urls: z
    .array(z.string().url())
    .min(1)
    .max(10)
    .describe(
      "1–10 absolute URLs to inspect. Each must belong to the connected property.",
    ),
  languageCode: z
    .string()
    .optional()
    .describe("BCP-47 language for the inspection result (e.g. 'en-US')."),
} as const;

type InspectArgs = z.infer<z.ZodObject<typeof inspectInputSchema>>;

export const inspectUrlsTool = {
  name: "inspect_urls",
  config: {
    title: "Inspect URLs in Google Search Console",
    description:
      "Read Google Search Console's existing index status for up to 10 URLs of the connected property: index/coverage state, last crawl time, Google-selected vs declared canonical, and mobile/rich-results verdicts. Use it to answer 'is this page indexed? why not?'. Google requires each URL to belong to that property. This does not run a live crawl. Per-URL failures are reported inline. Reads only the Search Console property already connected to an OpenSEO project the caller is authorized to access. The server selects the Google account and property from that project's saved connection. Read-only; uses no credits.",
    inputSchema: inspectInputSchema,
    outputSchema: z.looseObject({
      ok: z.boolean(),
      reason: z.string().optional(),
      connectUrl: z.string().optional(),
      setupDocsUrl: z.string().optional(),
      siteUrl: z.string().optional(),
      results: z
        .array(
          z
            .looseObject({
              url: z.string(),
              result: z.unknown().nullable().optional(),
              error: z.string().optional(),
            })
            .passthrough(),
        )
        .optional(),
      ...optionalMetaOutputSchema,
    }),
    annotations: {
      readOnlyHint: true,
      openWorldHint: true,
      destructiveHint: false,
    },
  },
  handler: withMcpProjectAuth(async (args: InspectArgs, context) => {
    const blocked = await missingSelfHostedGoogleClientResponse(
      context,
      args.projectId,
    );
    if (blocked) return blocked;

    const connectUrl = connectGscUrl(context.baseUrl, args.projectId);
    const meta = buildProjectMeta(
      context,
      args.projectId,
      `/p/${args.projectId}/settings/integrations`,
    );

    try {
      const { siteUrl, results } = await GscService.inspectUrls({
        projectId: args.projectId,
        urls: args.urls,
        languageCode: args.languageCode,
      });

      const blocks = results.map(inspectionBlock);
      const text =
        `${siteUrl} · inspected ${results.length} URL${results.length === 1 ? "" : "s"}\n\n` +
        blocks.join("\n\n");

      return mcpResponse({
        text,
        meta,
        structuredContent: { ok: true, siteUrl, results },
      });
    } catch (error) {
      const isNotConnected = error instanceof GscNotConnectedError;
      const apiDisabled = error instanceof GscApiError && error.apiDisabled;
      return mcpResponse({
        text: `${describeGscError(error)}${isNotConnected ? ` Connect it here: ${connectUrl}` : apiDisabled ? "" : ` (reconnect at ${connectUrl})`}`,
        meta,
        isError: true,
        structuredContent: {
          ok: false,
          reason: isNotConnected ? "not_connected" : "api_error",
          connectUrl,
        },
      });
    }
  }),
};
