import { z } from "zod";
import { createDataforseoClient } from "@/server/lib/dataforseo";
import { AppError } from "@/server/lib/errors";
import {
  loadGeoLocations,
  matchGeoLocation,
  type ResolvedGeoLocation,
} from "@/server/lib/geo-location-resolver";
import { buildProjectMeta } from "@/server/mcp/context";
import { mcpResponse } from "@/server/mcp/formatters";
import {
  looseObjectOutputSchema,
  optionalMetaOutputSchema,
} from "@/server/mcp/output-schemas";
import { withMcpProjectAuth } from "@/server/mcp/project-auth";
import { languageCodeSchema, projectIdSchema } from "@/server/mcp/schemas";
import { formatMcpTable, type McpTableColumn } from "@/server/mcp/table";
import {
  countryCodeSchema,
  describeLocation,
  locationMeta,
  placeSchema,
  resolveCountryIso,
  resolvePlaces,
} from "@/server/mcp/tools/location-input";

// LEIFKEN (RankMeister SEO-5): search demand per city, district and state.
// DataForSEO Labs (get_keyword_metrics) only knows countries; Google Ads
// search volume accepts any geotarget. Thin MCP wrappers, no product logic.

/** Measured 21.09.2026: keywords_data/google_ads/search_volume/live cost
 *  $0.09 per task (one task = one location, up to 1,000 keywords). Estimates
 *  only; the real amount is meta.costUsd. */
const ADS_SEARCH_VOLUME_TASK_USD = 0.09;
// Google Ads endpoints are rate limited per account (DataForSEO: 12 live
// requests per minute), so locations run two at a time, not all at once.
const ADS_CONCURRENCY = 2;
const MAX_LOCATIONS = 10;

// ---------------------------------------------------------------------------
// resolve_locations
// ---------------------------------------------------------------------------

const resolveLocationsInputSchema = {
  projectId: projectIdSchema,
  locations: z
    .array(placeSchema)
    .min(1)
    .max(50)
    .describe("1-50 places to resolve to DataForSEO location codes."),
  countryCode: countryCodeSchema.optional(),
  refresh: z
    .boolean()
    .optional()
    .describe(
      "Re-read the country's location list from DataForSEO instead of the 30-day cache (free). Use only when a place that should exist is missing.",
    ),
} as const;

type ResolveLocationsArgs = z.infer<
  z.ZodObject<typeof resolveLocationsInputSchema>
>;

type ResolveOutcome =
  | (ResolvedGeoLocation & { ok: true })
  | { input: string; ok: false; error: string };

export const resolveLocationsTool = {
  name: "resolve_locations",
  config: {
    title: "Resolve locations",
    description:
      'Turns place names ("Münster", "Kreis Borken", "Nordrhein-Westfalen", "Münster, NRW") into DataForSEO location codes, with type (City, Municipality, District = Landkreis, State = Bundesland) and alternatives when a name is ambiguous. Free: reads DataForSEO\'s location list (cached 30 days). Use the codes with get_keyword_volume_by_location, get_serp_results and get_local_serp_results, which also accept the names directly.',
    inputSchema: resolveLocationsInputSchema,
    outputSchema: {
      countryCode: z.string(),
      listSource: z.enum(["memory", "cache", "dataforseo"]),
      locations: z.array(looseObjectOutputSchema),
      ...optionalMetaOutputSchema,
    },
    annotations: {
      readOnlyHint: true,
      openWorldHint: false,
      destructiveHint: false,
    },
  },
  handler: withMcpProjectAuth(async (args: ResolveLocationsArgs, context) => {
    const countryCode = resolveCountryIso(args.countryCode, context.project);
    const { rows, source } = await loadGeoLocations(countryCode, {
      refresh: args.refresh,
    });
    const outcomes: ResolveOutcome[] = args.locations.map((place) => {
      try {
        return { ...matchGeoLocation(place, rows), ok: true as const };
      } catch (error) {
        if (!(error instanceof AppError)) throw error;
        return {
          input: String(place),
          ok: false as const,
          error: error.message,
        };
      }
    });
    const resolved = outcomes.filter((outcome) => outcome.ok);

    const lines = outcomes.map((outcome) =>
      outcome.ok
        ? `- "${outcome.input}" → ${describeLocation(outcome)}${outcome.alternatives ? `; also: ${outcome.alternatives.map((alt) => `${alt.locationName} (${alt.locationType}, ${alt.locationCode})`).join(", ")}` : ""}`
        : `- "${outcome.input}" → not found. ${outcome.error}`,
    );
    return mcpResponse({
      text: `Resolved ${resolved.length} of ${outcomes.length} places in "${countryCode}" (location list: ${rows.length} entries, from ${source}):\n${lines.join("\n")}`,
      meta: {
        ...buildProjectMeta(context, args.projectId),
        ...locationMeta(resolved),
      },
      structuredContent: {
        countryCode,
        listSource: source,
        locations: outcomes,
      },
      isError: resolved.length === 0,
    });
  }),
};

// ---------------------------------------------------------------------------
// get_keyword_volume_by_location
// ---------------------------------------------------------------------------

const getKeywordVolumeByLocationInputSchema = {
  projectId: projectIdSchema,
  keywords: z
    .array(z.string().trim().min(1).max(80))
    .min(1)
    .max(1000)
    .describe(
      "1-1000 keywords (Google Ads limits: at most 80 characters and 10 words each). One call per location covers all of them.",
    ),
  locations: z
    .array(placeSchema)
    .min(1)
    .max(MAX_LOCATIONS)
    .describe(
      `1-${MAX_LOCATIONS} places (city, Kreis, Bundesland, or location code). Each place is one Google Ads request.`,
    ),
  countryCode: countryCodeSchema.optional(),
  languageCode: languageCodeSchema.optional(),
  includeMonthlyTrends: z
    .boolean()
    .optional()
    .describe("Include the last 12 months per keyword. Defaults to false."),
  estimateOnly: z
    .boolean()
    .optional()
    .describe(
      "Resolve the places and return the cost estimate without calling Google Ads (free).",
    ),
} as const;

type GetKeywordVolumeByLocationArgs = z.infer<
  z.ZodObject<typeof getKeywordVolumeByLocationInputSchema>
>;

const VOLUME_ROW_FIELDS = [
  "keyword",
  "search_volume",
  "cpc",
  "competition",
  "competition_index",
  "low_top_of_page_bid",
  "high_top_of_page_bid",
] as const;

type VolumeRow = Record<string, unknown> & { keyword: string };

function toVolumeRow(item: unknown, includeMonthlyTrends: boolean): VolumeRow {
  const source: Record<string, unknown> =
    typeof item === "object" && item !== null ? { ...item } : {};
  const row: VolumeRow = {
    keyword: typeof source.keyword === "string" ? source.keyword : "",
  };
  for (const field of VOLUME_ROW_FIELDS) {
    if (field !== "keyword") row[field] = source[field] ?? null;
  }
  if (includeMonthlyTrends)
    row.monthly_searches = source.monthly_searches ?? null;
  return row;
}

type LocationVolumes = {
  input: string;
  locationCode: number;
  locationName: string;
  locationType: string;
} & ({ ok: true; keywords: VolumeRow[] } | { ok: false; error: string });

function volumeMatrix(keywords: string[], results: LocationVolumes[]): string {
  const ok = results.filter((result) => result.ok);
  const columns: McpTableColumn<string>[] = [
    { header: "keyword", value: (keyword) => keyword },
    ...ok.map((result) => ({
      header: result.locationName.split(",")[0] ?? String(result.locationCode),
      value: (keyword: string) =>
        result.keywords.find(
          (row) => row.keyword.toLowerCase() === keyword.toLowerCase(),
        )?.search_volume ?? null,
    })),
  ];
  return formatMcpTable(keywords, columns);
}

async function inBatches<T, R>(
  items: T[],
  size: number,
  run: (item: T) => Promise<R>,
): Promise<R[]> {
  const out: R[] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(...(await Promise.all(items.slice(i, i + size).map(run))));
  }
  return out;
}

export const getKeywordVolumeByLocationTool = {
  name: "get_keyword_volume_by_location",
  config: {
    title: "Get keyword volume by location",
    description: `Monthly Google search volume (plus CPC and paid competition) for keywords in specific cities, Landkreise or Bundesländer — e.g. "Steuerberater" in Münster, Kreis Coesfeld and Nordrhein-Westfalen. Uses Google Ads data, which unlike get_keyword_metrics (DataForSEO Labs, country only) works for any geotarget; no keyword difficulty or intent. Places are resolved by name or code (see resolve_locations); meta.locationCodes and meta.locations say what was used. Cost: one Google Ads request per place, about $${ADS_SEARCH_VOLUME_TASK_USD} each for up to 1,000 keywords; estimateOnly returns the estimate for free. Small places often report null or 10 for rare keywords. Per-place errors don't fail the batch. Charges credits.`,
    inputSchema: getKeywordVolumeByLocationInputSchema,
    outputSchema: {
      languageCode: z.string(),
      estimatedCostUsd: z.number(),
      estimateOnly: z.boolean(),
      locations: z.array(looseObjectOutputSchema),
      ...optionalMetaOutputSchema,
    },
    annotations: {
      readOnlyHint: false,
      openWorldHint: false,
      destructiveHint: false,
    },
  },
  handler: withMcpProjectAuth(
    async (args: GetKeywordVolumeByLocationArgs, context) => {
      // Resolving first means an unknown place fails the call before any
      // paid request goes out.
      const resolved = await resolvePlaces(
        args.locations,
        args.countryCode,
        context.project,
      );
      const languageCode = args.languageCode ?? context.project.languageCode;
      const keywords = [...new Set(args.keywords)];
      const estimatedCostUsd = Number(
        (resolved.length * ADS_SEARCH_VOLUME_TASK_USD).toFixed(4),
      );
      const meta = {
        ...buildProjectMeta(
          context,
          args.projectId,
          `/p/${args.projectId}/keywords`,
        ),
        ...locationMeta(resolved),
      };

      if (args.estimateOnly) {
        return mcpResponse({
          text: `Estimate: ${resolved.length} Google Ads request(s) × ~$${ADS_SEARCH_VOLUME_TASK_USD} = ~$${estimatedCostUsd} for ${keywords.length} keywords in ${resolved.map(describeLocation).join("; ")}. Nothing was fetched.`,
          meta,
          structuredContent: {
            languageCode,
            estimatedCostUsd,
            estimateOnly: true,
            locations: meta.locations,
          },
        });
      }

      const client = createDataforseoClient(context.billing);
      const includeMonthlyTrends = args.includeMonthlyTrends ?? false;
      const results = await inBatches(
        resolved,
        ADS_CONCURRENCY,
        async (location): Promise<LocationVolumes> => {
          const base = {
            input: location.input,
            locationCode: location.locationCode,
            locationName: location.locationName,
            locationType: location.locationType,
          };
          try {
            const items = await client.keywords.adsSearchVolume({
              keywords,
              locationCode: location.locationCode,
              languageCode,
              creditFeature: "keyword_research",
            });
            return {
              ...base,
              ok: true,
              keywords: items.map((item) =>
                toVolumeRow(item, includeMonthlyTrends),
              ),
            };
          } catch (error) {
            return {
              ...base,
              ok: false,
              error: error instanceof Error ? error.message : String(error),
            };
          }
        },
      );

      const okCount = results.filter((result) => result.ok).length;
      const failures = results
        .filter((result) => !result.ok)
        .map(
          (result) =>
            `- ${result.locationName}: FAILED — ${result.ok ? "" : result.error}`,
        );
      const text = [
        `Monthly Google search volume (Google Ads, language ${languageCode}) for ${keywords.length} keywords in ${okCount} of ${results.length} places. "—" = no data.`,
        okCount > 0 ? volumeMatrix(keywords, results) : "",
        ...failures,
      ]
        .filter(Boolean)
        .join("\n");

      return mcpResponse({
        text,
        meta,
        structuredContent: {
          languageCode,
          estimatedCostUsd,
          estimateOnly: false,
          locations: results,
        },
        isError: okCount === 0,
      });
    },
  ),
};
