import { z } from "zod";
import { createDataforseoClient } from "@/server/lib/dataforseo";
import type { SerpLiveItem } from "@/server/lib/dataforseo/serp";
import { mcpResponse } from "@/server/mcp/formatters";
import { buildProjectMeta } from "@/server/mcp/context";
import { optionalMetaOutputSchema } from "@/server/mcp/output-schemas";
import { withMcpProjectAuth } from "@/server/mcp/project-auth";
import { resolveMarket } from "@/shared/keyword-locations";
import { formatMcpTable, type McpTableColumn } from "@/server/mcp/table";
import {
  languageCodeSchema,
  locationCodeSchema,
  projectIdSchema,
} from "@/server/mcp/schemas";

type SerpItem = {
  type?: string | null;
  rank: number | null;
  title: string | null;
  url: string | null;
  domain: string | null;
  description: string | null;
};

// ---------------------------------------------------------------------------
// Structured extraction of the three SERP features Oliver's Sofortpaket asks
// for (aiOverview, peopleAlsoAsk, localPack). These read the *full* item list
// DataForSEO returned — before the top-20 trim below — because e.g. a
// local_pack entry or the AI Overview can sit past position 20. Parsed with
// small, permissive (.passthrough()) schemas: DataForSEO's field set for
// these SERP features isn't in the SDK's typed models, only in its docs, and
// a shape we don't expect must degrade to "absent" rather than error the
// whole call.
// ---------------------------------------------------------------------------

const AI_OVERVIEW_TEXT_LIMIT = 600;

const aiOverviewReferenceSchema = z
  .object({
    source: z.string().nullable().optional(),
    domain: z.string().nullable().optional(),
    url: z.string().nullable().optional(),
    title: z.string().nullable().optional(),
  })
  .passthrough();

const aiOverviewItemSchema = z
  .object({
    markdown: z.string().nullable().optional(),
    references: z.array(aiOverviewReferenceSchema).nullable().optional(),
  })
  .passthrough();

type AiOverview =
  | { present: false }
  | {
      present: true;
      text: string;
      sources: Array<{
        domain: string | null;
        url: string | null;
        title: string | null;
      }>;
    };

function extractAiOverview(items: SerpLiveItem[]): AiOverview {
  const raw = items.find((item) => item.type === "ai_overview");
  if (!raw) return { present: false };
  const parsed = aiOverviewItemSchema.safeParse(raw);
  if (!parsed.success) return { present: false };
  const fullText = parsed.data.markdown ?? "";
  const text =
    fullText.length > AI_OVERVIEW_TEXT_LIMIT
      ? `${fullText.slice(0, AI_OVERVIEW_TEXT_LIMIT)}…`
      : fullText;
  const sources = (parsed.data.references ?? [])
    .map((ref) => ({
      domain: ref.domain ?? null,
      url: ref.url ?? null,
      title: ref.title ?? null,
    }))
    .filter((source) => source.domain !== null || source.url !== null);
  return { present: true, text, sources };
}

const peopleAlsoAskExpandedSchema = z
  .object({
    domain: z.string().nullable().optional(),
    url: z.string().nullable().optional(),
    title: z.string().nullable().optional(),
  })
  .passthrough();

const peopleAlsoAskElementSchema = z
  .object({
    title: z.string().nullable().optional(),
    expanded_element: z
      .array(peopleAlsoAskExpandedSchema)
      .nullable()
      .optional(),
  })
  .passthrough();

const peopleAlsoAskItemSchema = z
  .object({
    items: z.array(peopleAlsoAskElementSchema).nullable().optional(),
  })
  .passthrough();

type PeopleAlsoAskQuestion = {
  question: string;
  source: { domain: string | null; url: string | null; title: string | null } | null;
};

function extractPeopleAlsoAsk(items: SerpLiveItem[]): PeopleAlsoAskQuestion[] {
  const raw = items.find((item) => item.type === "people_also_ask");
  if (!raw) return [];
  const parsed = peopleAlsoAskItemSchema.safeParse(raw);
  if (!parsed.success) return [];
  return (parsed.data.items ?? [])
    .filter((q) => q.title)
    .map((q) => {
      const firstSource = q.expanded_element?.[0];
      return {
        question: q.title ?? "",
        source: firstSource
          ? {
              domain: firstSource.domain ?? null,
              url: firstSource.url ?? null,
              title: firstSource.title ?? null,
            }
          : null,
      };
    });
}

const localPackItemSchema = z
  .object({
    rank_group: z.number().nullable().optional(),
    title: z.string().nullable().optional(),
    domain: z.string().nullable().optional(),
    rating: z
      .object({
        value: z.number().nullable().optional(),
        votes_count: z.number().nullable().optional(),
      })
      .passthrough()
      .nullable()
      .optional(),
  })
  .passthrough();

type LocalPackEntry = {
  name: string | null;
  domain: string | null;
  rating: number | null;
  ratingCount: number | null;
  rank: number | null;
};

function extractLocalPack(items: SerpLiveItem[]): LocalPackEntry[] {
  return items
    .filter((item) => item.type === "local_pack")
    .map((raw): LocalPackEntry | null => {
      const parsed = localPackItemSchema.safeParse(raw);
      if (!parsed.success) return null;
      return {
        name: parsed.data.title ?? null,
        domain: parsed.data.domain ?? null,
        rating: parsed.data.rating?.value ?? null,
        ratingCount: parsed.data.rating?.votes_count ?? null,
        rank: parsed.data.rank_group ?? null,
      };
    })
    .filter((entry): entry is LocalPackEntry => entry !== null);
}

const SERP_ITEM_COLUMNS: McpTableColumn<SerpItem>[] = [
  { header: "rank", value: (item) => item.rank },
  { header: "domain", value: (item) => item.domain },
  { header: "title", value: (item) => item.title },
  { header: "url", value: (item) => item.url },
];

const querySchema = z.object({
  keyword: z.string().min(1).describe("Search query to fetch the SERP for."),
  locationCode: locationCodeSchema.optional(),
  languageCode: languageCodeSchema.optional(),
  depth: z
    .number()
    .int()
    .min(10)
    .max(100)
    .optional()
    .describe(
      "Rows to crawl (clamped to 10-100, rounded up to the nearest 10 — DataForSEO bills per page of 10). Defaults to 20, matching the results actually returned; raise it only when you need to look deeper than position 20.",
    ),
});

const inputSchema = {
  projectId: projectIdSchema,
  queries: z
    .array(querySchema)
    .min(1)
    .max(10)
    .describe(
      "1-10 queries. Bulk-friendly — prefer this over multiple single-query calls.",
    ),
} as const;

type Args = z.infer<z.ZodObject<typeof inputSchema>>;

export const getSerpResultsTool = {
  name: "get_serp_results",
  config: {
    title: "Get Google SERP results",
    description:
      "Fetch live Google organic search results for 1-10 keywords. Use this to inspect who ranks for a query, verify competitors, compare SERPs across keywords, or gather source URLs before content planning. Charges credits per keyword (~30-60 each). Does not save results to OpenSEO. Per-keyword errors don't fail the batch.",
    inputSchema,
    outputSchema: {
      results: z.array(
        z.union([
          z
            .object({
              keyword: z.string(),
              ok: z.literal(true),
              // Set only when DataForSEO could only retrieve some of the
              // requested pages; the items above are still the real, billed
              // rows it did return (see isPartialResultsTask).
              teilweise: z.boolean().optional(),
              grund: z.string().optional(),
              items: z.array(
                z
                  .object({
                    type: z.string().nullable().optional(),
                    rank: z.number().nullable(),
                    title: z.string().nullable(),
                    url: z.string().nullable(),
                    domain: z.string().nullable(),
                    description: z.string().nullable(),
                  })
                  .passthrough(),
              ),
              aiOverview: z.union([
                z.object({ present: z.literal(false) }),
                z.object({
                  present: z.literal(true),
                  text: z.string(),
                  sources: z.array(
                    z.object({
                      domain: z.string().nullable(),
                      url: z.string().nullable(),
                      title: z.string().nullable(),
                    }),
                  ),
                }),
              ]),
              peopleAlsoAsk: z.array(
                z.object({
                  question: z.string(),
                  source: z
                    .object({
                      domain: z.string().nullable(),
                      url: z.string().nullable(),
                      title: z.string().nullable(),
                    })
                    .nullable(),
                }),
              ),
              localPack: z.array(
                z.object({
                  name: z.string().nullable(),
                  domain: z.string().nullable(),
                  rating: z.number().nullable(),
                  ratingCount: z.number().nullable(),
                  rank: z.number().nullable(),
                }),
              ),
            })
            .passthrough(),
          z
            .object({
              keyword: z.string(),
              ok: z.literal(false),
              error: z.string(),
            })
            .passthrough(),
        ]),
      ),
      ...optionalMetaOutputSchema,
    },
    annotations: {
      readOnlyHint: false,
      openWorldHint: false,
      destructiveHint: false,
    },
  },
  handler: withMcpProjectAuth(async (args: Args, context) => {
    const client = createDataforseoClient(context.billing);
    const results = await Promise.all(
      args.queries.map(async (q) => {
        try {
          const depth = q.depth
            ? Math.ceil(q.depth / 10) * 10
            : undefined;
          const serp = await client.serp.live({
            keyword: q.keyword,
            depth: depth ?? 20,
            ...resolveMarket(q, context.project),
          });

          // Partial with nothing retrieved at all is a real failure — same
          // treatment as any other empty/erroring keyword (isError semantics
          // for this per-keyword shape). Partial with SOME rows retrieved is
          // a success: DataForSEO billed and returned real results, it just
          // couldn't crawl every requested page.
          if (serp.partial && serp.items.length === 0) {
            return {
              keyword: q.keyword,
              ok: false as const,
              error:
                serp.partialReason ??
                "DataForSEO returned partial results with no retrievable pages.",
            };
          }

          // Trim noise — return only essentials per item. aiOverview /
          // peopleAlsoAsk / localPack are extracted from the full list below,
          // not the trim, since they can rank past position 20.
          const trimmed = serp.items.slice(0, 20).map((item) => ({
            type: item.type,
            rank: item.rank_absolute ?? item.rank_group ?? null,
            title: item.title ?? null,
            url: item.url ?? null,
            domain: item.domain ?? null,
            description: item.description ?? null,
          }));
          return {
            keyword: q.keyword,
            ok: true as const,
            ...(serp.partial
              ? { teilweise: true, grund: serp.partialReason }
              : {}),
            items: trimmed,
            aiOverview: extractAiOverview(serp.items),
            peopleAlsoAsk: extractPeopleAlsoAsk(serp.items),
            localPack: extractLocalPack(serp.items),
          };
        } catch (error) {
          return {
            keyword: q.keyword,
            ok: false as const,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      }),
    );

    const okCount = results.filter((r) => r.ok).length;
    const text =
      results
        .map((r) => {
          if (!r.ok) {
            return `"${r.keyword}": FAILED — ${r.error}`;
          }
          const partialNote = r.teilweise ? ` (partial: ${r.grund})` : "";
          if (r.items.length === 0) {
            return `"${r.keyword}" (0 results)${partialNote}`;
          }
          return `"${r.keyword}" (${r.items.length} results)${partialNote}:\n${formatMcpTable(r.items, SERP_ITEM_COLUMNS)}`;
        })
        .join("\n\n") +
      `\n\n${okCount} of ${results.length} queries succeeded.`;

    return mcpResponse({
      text,
      meta: buildProjectMeta(
        context,
        args.projectId,
        `/p/${args.projectId}/keywords`,
      ),
      structuredContent: { results },
      // Same rule as research_keywords: every query failing is a call
      // failure, not a 200 full of "FAILED" text; a partial failure with at
      // least one usable SERP stays a success.
      isError: okCount === 0,
    });
  }),
};
