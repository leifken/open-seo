/* eslint-disable max-lines */
import { z } from "zod";
import {
  createDataforseoClient,
  extractMyBusinessInfoProfile,
  fetchBusinessDataTaskResult,
  fetchBusinessListingsCategories,
  fetchMapsTaskResult,
  isRecord,
  type BusinessTaskEndpoint,
  type BusinessTaskOutcome,
} from "@/server/lib/dataforseo";
import { AppError } from "@/server/lib/errors";
import { buildCacheKey, getCached, setCached } from "@/server/lib/r2-cache";
import { buildProjectMeta } from "@/server/mcp/context";
import { mcpResponse } from "@/server/mcp/formatters";
import {
  looseObjectOutputSchema,
  optionalMetaOutputSchema,
} from "@/server/mcp/output-schemas";
import { withMcpProjectAuth } from "@/server/mcp/project-auth";
import {
  languageCodeSchema,
  locationCodeSchema,
  projectIdSchema,
} from "@/server/mcp/schemas";
import {
  formatMcpCell,
  formatMcpTable,
  readPath,
  truncatedCell,
  type McpTableColumn,
} from "@/server/mcp/table";
import {
  businessDataNearSchema,
  businessIdentifierInputSchema,
  businessIdentifierKeyword,
  formatBusinessDataCoordinate,
  formatLocalSerpCoordinate,
  pickRowFields,
  resolveBusinessIdentifier,
} from "@/server/mcp/tools/local-seo-shared";

// ---------------------------------------------------------------------------
// Shared plumbing
// ---------------------------------------------------------------------------

type BusinessLocationArgs = {
  near?: z.infer<typeof businessDataNearSchema>;
  locationCode?: number;
  languageCode?: string;
};

/** Coordinate when `near` is supplied, otherwise the project's market. */
function resolveBusinessLocation(
  args: BusinessLocationArgs,
  project: { locationCode: number; languageCode: string },
) {
  return {
    locationCoordinate: args.near
      ? formatBusinessDataCoordinate(args.near)
      : undefined,
    locationCode: args.near
      ? undefined
      : (args.locationCode ?? project.locationCode),
    languageCode: args.languageCode ?? project.languageCode,
  };
}

const businessLocationInputSchema = {
  near: businessDataNearSchema.optional(),
  locationCode: locationCodeSchema
    .optional()
    .describe(
      "DataForSEO location code. Ignored when `near` is set; otherwise defaults to the project's market.",
    ),
  languageCode: languageCodeSchema.optional(),
} as const;

// DataForSEO queues these tasks; high priority normally settles them inside the
// poll window, and the tool hands back a resumable taskId when it doesn't.
const TASK_POLL_ATTEMPTS = 6;
const TASK_POLL_INTERVAL_MS = 4000;

// LEIFKEN (production incident 21.09.2026): my_business_info occasionally
// needs longer than reviews/updates to resolve a real, existing profile — see
// postMyBusinessInfoTask in business.ts. get_business_profile gets its own,
// longer poll window (9 waits * 5s ≈ 45s) instead of sharing the shorter one
// above; a lookup that still hasn't resolved after that is reported as an
// honest timeout (see getBusinessProfileTool), never as "not found".
const PROFILE_TASK_POLL_ATTEMPTS = 10;
const PROFILE_TASK_POLL_INTERVAL_MS = 5000;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function pollBusinessTask(
  input: { endpoint: BusinessTaskEndpoint; taskId: string },
  publicTaskId: string,
  options: { attempts?: number; intervalMs?: number } = {},
): Promise<BusinessTaskOutcome> {
  const attempts = options.attempts ?? TASK_POLL_ATTEMPTS;
  const intervalMs = options.intervalMs ?? TASK_POLL_INTERVAL_MS;
  try {
    for (let attempt = 0; attempt < attempts; attempt++) {
      if (attempt > 0) await wait(intervalMs);
      const outcome = await fetchBusinessDataTaskResult(input);
      if (outcome.status === "completed") return outcome;
    }
    return { status: "pending", result: null };
  } catch (error) {
    // The task was already paid for at post; don't let a collection failure
    // discard the only handle to it.
    if (error instanceof AppError) {
      throw new AppError(
        error.code,
        `${error.message} The queued task is still collectable — call again with taskId "${publicTaskId}" at no extra cost.`,
      );
    }
    throw error;
  }
}

function readString(source: unknown, key: string): string | null {
  const value = readPath(source, key);
  return typeof value === "string" ? value : null;
}

function resultItems(result: Record<string, unknown> | null): unknown[] {
  const items = result?.items;
  return Array.isArray(items) ? items : [];
}

// ---------------------------------------------------------------------------
// get_business_profile
// ---------------------------------------------------------------------------

const getBusinessProfileInputSchema = {
  projectId: projectIdSchema,
  ...businessIdentifierInputSchema,
  ...businessLocationInputSchema,
  taskId: z
    .string()
    .min(1)
    .max(128)
    .optional()
    .describe(
      'Resume a previous call that returned status "timeout". Pass back the taskId exactly as returned — resuming charges no extra credits and does not need the identifier fields again.',
    ),
  includeTopCompetitors: z
    .boolean()
    .optional()
    .describe(
      "Also look up the 3 strongest nearby competitors on the same Google Maps search and return the same profile fields for each (GOOGLE-UNTERNEHMENSPROFIL.md §4 'Profil-Soll'). Defaults to false — it runs one extra local SERP search plus up to 3 more task-queue profile lookups (in parallel), so it multiplies both cost and latency roughly 4x. Only used when the main lookup resolves to a real profile.",
    ),
  competitorKeyword: z
    .string()
    .min(1)
    .max(120)
    .optional()
    .describe(
      "Search term for finding competitors on Google Maps (e.g. 'Webdesign Nottuln'). Defaults to the resolved profile's own category. Ignored unless includeTopCompetitors is true.",
    ),
} as const;

type GetBusinessProfileArgs = z.infer<
  z.ZodObject<typeof getBusinessProfileInputSchema>
>;

const WEEKDAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

function formatClock(span: unknown, key: "open" | "close"): string {
  const hour = readPath(span, key, "hour");
  const minute = readPath(span, key, "minute");
  if (typeof hour !== "number") return "?";
  const minutes = typeof minute === "number" ? minute : 0;
  return `${String(hour).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function formatTimetable(profile: Record<string, unknown>): string {
  const timetable = readPath(profile, "work_time", "work_hours", "timetable");
  if (timetable == null) return "—";
  const days = WEEKDAYS.map((day) => {
    const spans = readPath(timetable, day);
    if (!Array.isArray(spans) || spans.length === 0) {
      return `${day.slice(0, 3)} closed`;
    }
    const hours = spans
      .map(
        (span) => `${formatClock(span, "open")}-${formatClock(span, "close")}`,
      )
      .join(",");
    return `${day.slice(0, 3)} ${hours}`;
  });
  return days.join(" | ");
}

function formatRatingDistribution(profile: Record<string, unknown>): string {
  const distribution = readPath(profile, "rating_distribution");
  if (distribution == null) return "—";
  const stars = [5, 4, 3, 2, 1].map((star) => {
    const count = readPath(distribution, String(star));
    return `${star}★ ${typeof count === "number" ? count : 0}`;
  });
  return stars.join(", ");
}

// DataForSEO reports attributes as "yes/no" checks (e.g. "Accessibility":
// ["Wheelchair accessible entrance"]), split into available/unavailable maps
// keyed by category — flatten both into one readable list, marking the
// unavailable ones.
function formatAttributes(profile: Record<string, unknown>): string {
  const available = readPath(profile, "attributes", "available_attributes");
  const unavailable = readPath(profile, "attributes", "unavailable_attributes");
  const flatten = (group: unknown, suffix: string): string[] => {
    if (!isRecord(group)) return [];
    return Object.values(group).flatMap((values) =>
      Array.isArray(values)
        ? values.map((value) => `${formatMcpCell(value)}${suffix}`)
        : [],
    );
  };
  const entries = [...flatten(available, ""), ...flatten(unavailable, " (no)")];
  return entries.length === 0 ? "—" : entries.join(", ");
}

// GOOGLE-UNTERNEHMENSPROFIL.md §4 also wants "Leistungen" (a services/products
// list), special/holiday opening hours, and per-photo age — none of which
// DataForSEO's business_data/google/my_business_info exposes (verified
// against the SDK's GoogleBusinessInfo/WorkHours models, which carry no
// services, special_hours, or per-photo fields). Reported honestly as gaps
// rather than guessed at, per this repo's "missing data is not a finding"
// rule (SEITEN-COCKPIT.md §3).
const BUSINESS_PROFILE_DATA_GAPS = [
  "services/products list (Leistungen) — not exposed by DataForSEO's business_data/google/my_business_info",
  "special or holiday opening hours (Sonderöffnungszeiten) — not exposed by DataForSEO's business_data/google/my_business_info",
  "individual photo ages — only total_photos (a count) is exposed, not per-photo timestamps",
] as const;

function formatProfileText(profile: Record<string, unknown>): string {
  const additional = readPath(profile, "additional_categories");
  const category = formatMcpCell(readPath(profile, "category"));
  const lines: Array<[string, string]> = [
    ["title", formatMcpCell(readPath(profile, "title"))],
    [
      "category",
      Array.isArray(additional) && additional.length > 0
        ? `${category} (+ ${additional.map(formatMcpCell).join(", ")})`
        : category,
    ],
    [
      "description",
      formatMcpCell(
        readPath(profile, "description") ?? readPath(profile, "snippet"),
      ),
    ],
    ["attributes", formatAttributes(profile)],
    [
      "rating",
      `${formatMcpCell(readPath(profile, "rating", "value"))} from ${formatMcpCell(readPath(profile, "rating", "votes_count"))} reviews`,
    ],
    ["rating breakdown", formatRatingDistribution(profile)],
    ["address", formatMcpCell(readPath(profile, "address"))],
    ["phone", formatMcpCell(readPath(profile, "phone"))],
    ["website", formatMcpCell(readPath(profile, "url"))],
    ["domain", formatMcpCell(readPath(profile, "domain"))],
    ["claimed", formatMcpCell(readPath(profile, "is_claimed"))],
    [
      "status now",
      formatMcpCell(
        readPath(profile, "work_time", "work_hours", "current_status"),
      ),
    ],
    ["hours", formatTimetable(profile)],
    ["photos (count)", formatMcpCell(readPath(profile, "total_photos"))],
    ["cid", formatMcpCell(readPath(profile, "cid"))],
    ["place_id", formatMcpCell(readPath(profile, "place_id"))],
    ["check_url", formatMcpCell(readPath(profile, "check_url"))],
  ];
  return lines.map(([label, value]) => `- ${label}: ${value}`).join("\n");
}

// ---------------------------------------------------------------------------
// Competitors (GOOGLE-UNTERNEHMENSPROFIL.md §4 "Profil-Soll": the 3 strongest
// local competitors get the same fields as the target profile).
// ---------------------------------------------------------------------------

type CompetitorLookup = {
  rank: number | null;
  cid: string | null;
  placeId: string | null;
  title: string | null;
  status: "completed" | "timeout";
  profile: Record<string, unknown> | null;
};

const COMPETITOR_SEARCH_DEPTH = 10;
const COMPETITOR_COUNT = 3;

function matchesTarget(
  item: unknown,
  target: { cid: string | null; placeId: string | null },
): boolean {
  const itemCid = readString(item, "cid");
  const itemPlaceId = readString(item, "place_id");
  return (
    (target.cid != null && itemCid === target.cid) ||
    (target.placeId != null && itemPlaceId === target.placeId)
  );
}

/**
 * Runs one local SERP search near the target's own coordinates to find the
 * COMPETITOR_COUNT strongest nearby competitors (Maps is already rank-ordered,
 * so "strongest" = highest-ranked, excluding the target itself), then fetches
 * each one's full profile the same way as the target — in parallel, so the
 * added wall time stays bounded to roughly one profile poll window rather
 * than stacking three of them.
 */
async function findTopLocalCompetitors(
  client: ReturnType<typeof createDataforseoClient>,
  input: {
    keyword: string;
    latitude: number;
    longitude: number;
    languageCode: string;
    target: { cid: string | null; placeId: string | null };
  },
): Promise<CompetitorLookup[]> {
  const items = await client.serp.local({
    keyword: input.keyword,
    locationCoordinate: formatLocalSerpCoordinate({
      latitude: input.latitude,
      longitude: input.longitude,
    }),
    languageCode: input.languageCode,
    searchType: "maps",
    device: "desktop",
    depth: COMPETITOR_SEARCH_DEPTH,
    searchPlaces: false,
  });

  const candidates = items
    .filter((item) => !matchesTarget(item, input.target))
    .slice(0, COMPETITOR_COUNT);

  return Promise.all(
    candidates.map(async (item): Promise<CompetitorLookup> => {
      const rank =
        readPath(item, "rank_group") ?? readPath(item, "rank_absolute");
      const cid = readString(item, "cid");
      const placeId = readString(item, "place_id");
      const title = readString(item, "title");
      const identifierKeyword = cid
        ? `cid:${cid}`
        : placeId
          ? `place_id:${placeId}`
          : null;
      if (!identifierKeyword) {
        // Nothing precise enough to look up — report what the SERP itself had.
        return {
          rank: typeof rank === "number" ? rank : null,
          cid,
          placeId,
          title,
          status: "completed",
          profile: null,
        };
      }

      const taskId = await client.business.myBusinessInfoTaskPost({
        keyword: identifierKeyword,
        locationCoordinate: formatBusinessDataCoordinate({
          latitude: input.latitude,
          longitude: input.longitude,
        }),
        languageCode: input.languageCode,
      });
      const outcome = await pollBusinessTask(
        { endpoint: "my_business_info", taskId },
        taskId,
        {
          attempts: PROFILE_TASK_POLL_ATTEMPTS,
          intervalMs: PROFILE_TASK_POLL_INTERVAL_MS,
        },
      );
      return {
        rank: typeof rank === "number" ? rank : null,
        cid,
        placeId,
        title,
        status: outcome.status === "pending" ? "timeout" : "completed",
        profile:
          outcome.status === "pending"
            ? null
            : extractMyBusinessInfoProfile(outcome.result),
      };
    }),
  );
}

const COMPETITOR_COLUMNS: McpTableColumn<CompetitorLookup>[] = [
  { header: "#", value: (row) => row.rank },
  { header: "title", value: (row) => row.title },
  { header: "status", value: (row) => row.status },
  {
    header: "rating",
    value: (row) => readPath(row.profile, "rating", "value"),
  },
  {
    header: "reviews",
    value: (row) => readPath(row.profile, "rating", "votes_count"),
  },
  { header: "photos", value: (row) => readPath(row.profile, "total_photos") },
  { header: "claimed", value: (row) => readPath(row.profile, "is_claimed") },
  { header: "cid", value: (row) => row.cid },
];

export const getBusinessProfileTool = {
  name: "get_business_profile",
  config: {
    title: "Get business profile",
    description:
      'Reads one Google Business Profile: categories, description, attributes, rating and review count, rating breakdown, address, phone, website, claimed status, opening hours, and photo count — plus, with includeTopCompetitors, the 3 strongest nearby competitors on the same fields (GOOGLE-UNTERNEHMENSPROFIL.md §4 \'Profil-Soll\'). Note: DataForSEO does not expose a services/products list, special/holiday opening hours, or per-photo ages for this endpoint — dataGaps in the response says so explicitly rather than omitting them silently. Runs over DataForSEO\'s task queue (not the live endpoint), polling for up to ~45s — a cid or placeId (from get_local_serp_results) resolves fastest and most reliably; an ambiguous business name can take longer or fail to match. A lookup that is still unresolved after the poll window returns status "timeout" (isError, code zeitueberschreitung) with a taskId to resume for free — never reported as "not found", which only status "completed" with profile: null means. Charges credits.',
    inputSchema: getBusinessProfileInputSchema,
    outputSchema: {
      status: z.enum(["completed", "timeout"]),
      taskId: z.string(),
      errorCode: z.literal("zeitueberschreitung").optional(),
      profile: looseObjectOutputSchema.nullable(),
      dataGaps: z.array(z.string()).optional(),
      competitors: z.array(looseObjectOutputSchema).optional(),
      ...optionalMetaOutputSchema,
    },
    annotations: {
      readOnlyHint: false,
      openWorldHint: false,
      destructiveHint: false,
    },
  },
  handler: withMcpProjectAuth(async (args: GetBusinessProfileArgs, context) => {
    const client = createDataforseoClient(context.billing);
    let taskId: string;
    if (args.taskId) {
      taskId = args.taskId;
    } else {
      const identifier = resolveBusinessIdentifier(args);
      taskId = await client.business.myBusinessInfoTaskPost({
        keyword: businessIdentifierKeyword(identifier),
        ...resolveBusinessLocation(args, context.project),
      });
    }

    const outcome = await pollBusinessTask(
      { endpoint: "my_business_info", taskId },
      taskId,
      {
        attempts: PROFILE_TASK_POLL_ATTEMPTS,
        intervalMs: PROFILE_TASK_POLL_INTERVAL_MS,
      },
    );

    if (outcome.status === "pending") {
      const waitedSeconds = Math.round(
        ((PROFILE_TASK_POLL_ATTEMPTS - 1) * PROFILE_TASK_POLL_INTERVAL_MS) /
          1000,
      );
      return mcpResponse({
        text: `DataForSEO did not resolve this Google Business Profile lookup within ~${waitedSeconds}s. This is a timeout, not a confirmed "not found" — call get_business_profile again with taskId "${taskId}" to keep waiting at no extra cost, or narrow the search with a cid/placeId from get_local_serp_results.`,
        meta: buildProjectMeta(context, args.projectId, `/p/${args.projectId}`),
        isError: true,
        structuredContent: {
          status: "timeout",
          errorCode: "zeitueberschreitung",
          taskId,
          profile: null,
        },
      });
    }

    const profile = extractMyBusinessInfoProfile(outcome.result);
    if (!profile) {
      return mcpResponse({
        text: "No Google Business Profile matched that identifier (confirmed empty result, not a timeout). Try a cid or placeId from get_local_serp_results.",
        meta: buildProjectMeta(context, args.projectId, `/p/${args.projectId}`),
        structuredContent: { status: "completed", taskId, profile: null },
      });
    }

    let competitors: CompetitorLookup[] | undefined;
    if (args.includeTopCompetitors) {
      const latitude = readPath(profile, "latitude");
      const longitude = readPath(profile, "longitude");
      const competitorKeyword =
        args.competitorKeyword ?? readString(profile, "category");
      competitors =
        typeof latitude === "number" &&
        typeof longitude === "number" &&
        competitorKeyword
          ? await findTopLocalCompetitors(client, {
              keyword: competitorKeyword,
              latitude,
              longitude,
              languageCode: args.languageCode ?? context.project.languageCode,
              target: {
                cid: readString(profile, "cid"),
                placeId: readString(profile, "place_id"),
              },
            })
          : [];
    }
    const competitorKeywordUsed =
      args.competitorKeyword ?? readString(profile, "category");

    const text = [
      `Google Business Profile:\n${formatProfileText(profile)}`,
      `\nNot available from DataForSEO for this endpoint: ${BUSINESS_PROFILE_DATA_GAPS.join("; ")}.`,
      ...(competitors
        ? competitors.length > 0
          ? [
              `\nTop ${competitors.length} nearby competitor(s) for "${competitorKeywordUsed}":`,
              formatMcpTable(competitors, COMPETITOR_COLUMNS),
            ]
          : [
              "\nNo competitors looked up (missing coordinates or a search keyword — pass competitorKeyword explicitly).",
            ]
        : []),
    ].join("\n");

    return mcpResponse({
      text,
      meta: buildProjectMeta(context, args.projectId, `/p/${args.projectId}`),
      structuredContent: {
        status: "completed",
        taskId,
        profile,
        dataGaps: [...BUSINESS_PROFILE_DATA_GAPS],
        ...(competitors ? { competitors } : {}),
      },
    });
  }),
};

// ---------------------------------------------------------------------------
// get_business_reviews
// ---------------------------------------------------------------------------

const getBusinessReviewsInputSchema = {
  projectId: projectIdSchema,
  ...businessIdentifierInputSchema,
  ...businessLocationInputSchema,
  depth: z
    .number()
    .int()
    .min(10)
    .max(200)
    .optional()
    .describe(
      "Number of reviews to collect (10-200). Defaults to 20. Billed per 10 reviews (per 20 when includeOtherSources is true).",
    ),
  sortBy: z
    .enum(["newest", "highest_rating", "lowest_rating", "relevant"])
    .optional()
    .describe(
      "Review sort order. Defaults to newest. Ignored when includeOtherSources is true — the extended endpoint has no sort option.",
    ),
  includeOtherSources: z
    .boolean()
    .optional()
    .describe(
      "Also collect the reviews Google shows from other sites (Yelp, Tripadvisor, Trustpilot). Defaults to false. Costs more per review and cannot be sorted.",
    ),
  taskId: z
    .string()
    .min(1)
    .max(128)
    .optional()
    .describe(
      'Resume a previous call that returned status "processing". Pass back the taskId exactly as returned (format "google:<id>" or "extended:<id>"); it selects the right endpoint on its own. Resuming charges no extra credits.',
    ),
} as const;

type GetBusinessReviewsArgs = z.infer<
  z.ZodObject<typeof getBusinessReviewsInputSchema>
>;

const REVIEWS_TASK_ID_PATTERN = /^(google|extended):(.+)$/;

function encodeReviewsTaskId(includeOtherSources: boolean, id: string): string {
  return `${includeOtherSources ? "extended" : "google"}:${id}`;
}

function parseReviewsTaskId(taskId: string): {
  endpoint: BusinessTaskEndpoint;
  taskId: string;
} {
  const match = REVIEWS_TASK_ID_PATTERN.exec(taskId);
  if (!match) {
    throw new AppError(
      "VALIDATION_ERROR",
      'taskId must be the value this tool returned, formatted as "google:<id>" or "extended:<id>".',
    );
  }
  return {
    endpoint: match[1] === "extended" ? "extended_reviews" : "reviews",
    taskId: match[2] ?? "",
  };
}

// Full review rows carry ~200-char base64 review URLs, avatar URLs, and
// xpaths; the fields below are what review-gap analysis actually reads.
const REVIEW_ROW_FIELDS = [
  "rank_absolute",
  "time_ago",
  "timestamp",
  "rating",
  "review_text",
  "original_review_text",
  "original_language",
  "profile_name",
  "local_guide",
  "reviews_count",
  "photos_count",
  "review_highlights",
  "source",
  "owner_answer",
  "owner_time_ago",
  "owner_timestamp",
  "review_id",
] as const;

const REVIEW_COLUMNS: McpTableColumn<unknown>[] = [
  { header: "#", value: (row) => readPath(row, "rank_absolute") },
  {
    header: "when",
    value: (row) => readPath(row, "time_ago") ?? readPath(row, "timestamp"),
  },
  { header: "rating", value: (row) => readPath(row, "rating", "value") },
  { header: "author", value: (row) => readPath(row, "profile_name") },
  {
    header: "source",
    value: (row) => readPath(row, "source", "title") ?? "Google",
  },
  {
    header: "review",
    value: (row) => readPath(row, "review_text"),
    format: truncatedCell(120),
  },
  {
    header: "owner replied",
    value: (row) => readPath(row, "owner_answer") != null,
  },
];

export const getBusinessReviewsTool = {
  name: "get_business_reviews",
  config: {
    title: "Get business reviews",
    description:
      "Collects Google reviews for a business, with rating, author, text, and whether the owner replied. Use it for review-gap analysis against competitors and to spot unanswered reviews. Usually completes within this call; if the queued job is still running you get status 'processing' plus a taskId — call again with that taskId in 30-60 seconds to collect the result at no extra cost. Charges credits.",
    inputSchema: getBusinessReviewsInputSchema,
    outputSchema: {
      status: z.enum(["completed", "processing"]),
      taskId: z.string(),
      reviews: z.array(looseObjectOutputSchema).optional(),
      totals: looseObjectOutputSchema.nullable().optional(),
      ...optionalMetaOutputSchema,
    },
    annotations: {
      readOnlyHint: false,
      openWorldHint: false,
      destructiveHint: false,
    },
  },
  handler: withMcpProjectAuth(async (args: GetBusinessReviewsArgs, context) => {
    const includeOtherSources = args.includeOtherSources ?? false;
    let task: { endpoint: BusinessTaskEndpoint; taskId: string };
    let publicTaskId: string;

    if (args.taskId) {
      task = parseReviewsTaskId(args.taskId);
      publicTaskId = args.taskId;
    } else {
      const identifier = resolveBusinessIdentifier(args);
      const client = createDataforseoClient(context.billing);
      // Only the post is metered; the polling below collects for free.
      const postedId = await client.business.reviewsTaskPost({
        ...identifier,
        ...resolveBusinessLocation(args, context.project),
        depth: args.depth ?? 20,
        // The fetcher's extended branch has no sort_by and ignores this.
        sortBy: args.sortBy ?? "newest",
        includeOtherSources,
      });
      task = {
        endpoint: includeOtherSources ? "extended_reviews" : "reviews",
        taskId: postedId,
      };
      publicTaskId = encodeReviewsTaskId(includeOtherSources, postedId);
    }

    const outcome = await pollBusinessTask(task, publicTaskId);
    if (outcome.status === "pending") {
      return mcpResponse({
        text: `Review collection is still running. Call get_business_reviews again with taskId "${publicTaskId}" in 30-60 seconds — resuming charges no extra credits.`,
        meta: buildProjectMeta(context, args.projectId, `/p/${args.projectId}`),
        structuredContent: { status: "processing", taskId: publicTaskId },
      });
    }

    const reviews = resultItems(outcome.result).map((row) =>
      pickRowFields(row, REVIEW_ROW_FIELDS),
    );
    const totals = outcome.result
      ? {
          title: outcome.result.title ?? null,
          reviews_count: outcome.result.reviews_count ?? null,
          rating: outcome.result.rating ?? null,
          cid: outcome.result.cid ?? null,
          place_id: outcome.result.place_id ?? null,
        }
      : null;

    const header = `Collected ${reviews.length} reviews${typeof totals?.reviews_count === "number" ? ` of ${totals.reviews_count} total` : ""}.`;
    return mcpResponse({
      text:
        reviews.length === 0
          ? `${header} This profile has no reviews matching the request.`
          : `${header} Review text is truncated in this table; full text is in the structured result.\n${formatMcpTable(reviews, REVIEW_COLUMNS)}`,
      meta: buildProjectMeta(context, args.projectId, `/p/${args.projectId}`),
      structuredContent: {
        status: "completed",
        taskId: publicTaskId,
        reviews,
        totals,
      },
    });
  }),
};

// ---------------------------------------------------------------------------
// get_business_updates
// ---------------------------------------------------------------------------

const getBusinessUpdatesInputSchema = {
  projectId: projectIdSchema,
  ...businessIdentifierInputSchema,
  ...businessLocationInputSchema,
  depth: z
    .number()
    .int()
    .min(10)
    .max(100)
    .optional()
    .describe("Number of posts to collect (10-100). Defaults to 10."),
  taskId: z
    .string()
    .min(1)
    .max(128)
    .optional()
    .describe(
      'Resume a previous call that returned status "processing". Pass back the taskId exactly as returned. Resuming charges no extra credits.',
    ),
} as const;

type GetBusinessUpdatesArgs = z.infer<
  z.ZodObject<typeof getBusinessUpdatesInputSchema>
>;

// Post rows ship image CDN URLs and xpaths nothing downstream reads.
const BUSINESS_UPDATE_ROW_FIELDS = [
  "rank_absolute",
  "author",
  "post_date",
  "timestamp",
  "post_text",
  "snippet",
  "url",
  "links",
] as const;

const BUSINESS_UPDATE_COLUMNS: McpTableColumn<unknown>[] = [
  { header: "#", value: (row) => readPath(row, "rank_absolute") },
  {
    header: "posted",
    value: (row) => readPath(row, "post_date") ?? readPath(row, "timestamp"),
  },
  {
    header: "post",
    value: (row) => readPath(row, "post_text") ?? readPath(row, "snippet"),
    format: truncatedCell(120),
  },
  { header: "url", value: (row) => readPath(row, "url") },
];

export const getBusinessUpdatesTool = {
  name: "get_business_updates",
  config: {
    title: "Get business updates",
    description:
      "Collects the posts (updates, offers, events) published on a Google Business Profile. Use it to check posting activity and recency on your profile or a competitor's. Usually completes within this call; a 'processing' response returns a taskId to call back with in 30-60 seconds at no extra cost. Charges credits.",
    inputSchema: getBusinessUpdatesInputSchema,
    outputSchema: {
      status: z.enum(["completed", "processing"]),
      taskId: z.string(),
      updates: z.array(looseObjectOutputSchema).optional(),
      ...optionalMetaOutputSchema,
    },
    annotations: {
      readOnlyHint: false,
      openWorldHint: false,
      destructiveHint: false,
    },
  },
  handler: withMcpProjectAuth(async (args: GetBusinessUpdatesArgs, context) => {
    let taskId: string;
    if (args.taskId) {
      if (args.taskId.includes(":")) {
        throw new AppError(
          "VALIDATION_ERROR",
          "That looks like a get_business_reviews taskId; pass the bare taskId this tool returned.",
        );
      }
      taskId = args.taskId;
    } else {
      const identifier = resolveBusinessIdentifier(args);
      const client = createDataforseoClient(context.billing);
      taskId = await client.business.updatesTaskPost({
        keyword: businessIdentifierKeyword(identifier),
        ...resolveBusinessLocation(args, context.project),
        depth: args.depth ?? 10,
      });
    }

    const outcome = await pollBusinessTask(
      { endpoint: "my_business_updates", taskId },
      taskId,
    );
    if (outcome.status === "pending") {
      return mcpResponse({
        text: `Post collection is still running. Call get_business_updates again with taskId "${taskId}" in 30-60 seconds — resuming charges no extra credits.`,
        meta: buildProjectMeta(context, args.projectId, `/p/${args.projectId}`),
        structuredContent: { status: "processing", taskId },
      });
    }

    const updates = resultItems(outcome.result).map((row) =>
      pickRowFields(row, BUSINESS_UPDATE_ROW_FIELDS),
    );
    const header = `Collected ${updates.length} Google Business posts.`;
    return mcpResponse({
      text:
        updates.length === 0
          ? `${header} This profile has published no posts.`
          : `${header}\n${formatMcpTable(updates, BUSINESS_UPDATE_COLUMNS)}`,
      meta: buildProjectMeta(context, args.projectId, `/p/${args.projectId}`),
      structuredContent: { status: "completed", taskId, updates },
    });
  }),
};

// ---------------------------------------------------------------------------
// list_business_categories
// ---------------------------------------------------------------------------

const BUSINESS_CATEGORIES_CACHE_NAMESPACE = "local:business-categories";
const BUSINESS_CATEGORIES_TTL_SECONDS = 7 * 24 * 60 * 60;

const cachedCategoriesSchema = z.array(
  z.object({ category: z.string(), businessCount: z.number().nullable() }),
);

const listBusinessCategoriesInputSchema = {
  projectId: projectIdSchema,
  query: z
    .string()
    .min(1)
    .max(80)
    .optional()
    .describe(
      "Case-insensitive substring to match against category slugs (e.g. 'plumb').",
    ),
  limit: z
    .number()
    .int()
    .min(1)
    .max(200)
    .optional()
    .describe("Maximum categories to return (1-200). Defaults to 50."),
} as const;

type ListBusinessCategoriesArgs = z.infer<
  z.ZodObject<typeof listBusinessCategoriesInputSchema>
>;

const BUSINESS_CATEGORY_COLUMNS: McpTableColumn<{
  category: string;
  businessCount: number | null;
}>[] = [
  { header: "category", value: (row) => row.category },
  { header: "businesses", value: (row) => row.businessCount },
];

export const listBusinessCategoriesTool = {
  name: "list_business_categories",
  config: {
    title: "List business categories",
    description:
      "Lists the Google Business categories DataForSEO recognizes, ranked by how many businesses use them. Use it to find valid category slugs for search_local_businesses (e.g. 'pizza_restaurant'). Uses no credits (the full list is cached for 7 days).",
    inputSchema: listBusinessCategoriesInputSchema,
    outputSchema: {
      categories: z.array(
        z.object({
          category: z.string(),
          businessCount: z.number().nullable(),
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
  handler: withMcpProjectAuth(
    async (args: ListBusinessCategoriesArgs, context) => {
      // The upstream list takes no parameters, so one cache entry serves every
      // query/limit combination; filtering happens below, in memory.
      const cacheKey = await buildCacheKey(
        BUSINESS_CATEGORIES_CACHE_NAMESPACE,
        {},
      );
      const cached = cachedCategoriesSchema.safeParse(
        await getCached(cacheKey),
      );
      let all = cached.success ? cached.data : null;
      if (!all) {
        // Free at DataForSEO, so this skips the metered client — see index.ts.
        all = (await fetchBusinessListingsCategories()).data;
        await setCached(cacheKey, all, BUSINESS_CATEGORIES_TTL_SECONDS);
      }

      const query = args.query?.toLowerCase();
      const matched = query
        ? all.filter((row) => row.category.toLowerCase().includes(query))
        : all;
      const categories = matched.slice(0, args.limit ?? 50);

      const header = `Found ${matched.length} categories${query ? ` matching "${args.query}"` : ""}; showing ${categories.length}.`;
      return mcpResponse({
        text:
          categories.length === 0
            ? header
            : `${header}\n${formatMcpTable(categories, BUSINESS_CATEGORY_COLUMNS)}`,
        meta: buildProjectMeta(context, args.projectId, `/p/${args.projectId}`),
        structuredContent: { categories },
      });
    },
  ),
};

// ---------------------------------------------------------------------------
// get_local_rank_grid
// ---------------------------------------------------------------------------

// Degrees per kilometre. Longitude degrees shrink with latitude; the cosine is
// floored so a near-polar center can't blow the spacing up.
const KM_PER_DEGREE_LATITUDE = 110.574;
const KM_PER_DEGREE_LONGITUDE = 111.32;
const MIN_LONGITUDE_COSINE = 0.01;
const RANK_GRID_DEPTH = 20;
const RANK_GRID_CONCURRENCY = 3;
// Without an explicit zoom DataForSEO infers one per coordinate, which yields
// "No Search Results" for some points and makes ranks incomparable across the
// grid. A fixed zoom fails the other way: a mobile viewport at zoom 14 spans
// only ~±1.5 km east-west at mid latitudes, so a business one 2-3 km grid step
// to the side falls outside the viewport and reads as "not ranked" (verified
// live: a rank-3 business vanished at zoom 14 and reappeared at zoom 12).
// Derive the zoom from the spacing instead: a world tile is 40075·cos(lat)/2^z
// km wide and a portrait viewport ~1.5 tiles, so the largest zoom whose
// viewport still spans ~1.25× the spacing is log2(24045·cos(lat)/spacing).
const RANK_GRID_ZOOM_NUMERATOR_KM = 24045;
const MIN_RANK_GRID_ZOOM = 4;
const MAX_RANK_GRID_ZOOM = 18;

function rankGridZoom(spacingKm: number, latitude: number): number {
  const cosine = Math.max(
    Math.abs(Math.cos((latitude * Math.PI) / 180)),
    MIN_LONGITUDE_COSINE,
  );
  const zoom = Math.floor(
    Math.log2((RANK_GRID_ZOOM_NUMERATOR_KM * cosine) / spacingKm),
  );
  return Math.min(MAX_RANK_GRID_ZOOM, Math.max(MIN_RANK_GRID_ZOOM, zoom));
}

// LEIFKEN (SEO-5): grid cost per point. Maps bills one SERP (up to 100 rows)
// per point; depth 20 is one SERP. Live $0.002 (list price, as in
// shared/rank-tracking.ts); queue high priority $0.0012 (measured 21.09.2026),
// normal priority $0.0006 (list price). Estimates only — meta.costUsd is real.
const RANK_GRID_COST_PER_POINT_USD = {
  live: 0.002,
  high: 0.0012,
  normal: 0.0006,
} as const;
const MIN_GRID_SIZE = 3;
const MAX_GRID_SIZE = 7;
const DEFAULT_SPACING_KM = 2;
// Queue collection: same window as get_business_profile (10 polls, 5 s apart,
// ~45 s). High-priority Maps tasks settled in under 5 s when measured.
const GRID_POLL_ATTEMPTS = 10;
const GRID_POLL_INTERVAL_MS = 5000;
const GRID_COLLECT_CONCURRENCY = 10;

const gridTaskSchema = z.object({
  row: z
    .number()
    .int()
    .min(0)
    .max(MAX_GRID_SIZE - 1),
  col: z
    .number()
    .int()
    .min(0)
    .max(MAX_GRID_SIZE - 1),
  taskId: z.string().min(1).max(128),
});

const getLocalRankGridInputSchema = {
  projectId: projectIdSchema,
  keyword: z
    .string()
    .min(1)
    .max(120)
    .describe("Search query to run on Google Maps at every grid point."),
  target: z
    .object({
      cid: z
        .string()
        .min(1)
        .max(64)
        .optional()
        .describe("Match rows whose cid equals this value (most reliable)."),
      placeId: z
        .string()
        .min(1)
        .max(256)
        .optional()
        .describe("Match rows whose place_id equals this value."),
      name: z
        .string()
        .min(1)
        .max(200)
        .optional()
        .describe(
          "Match rows whose title contains this text (case-insensitive). Used only when cid/placeId do not match.",
        ),
    })
    .describe(
      "The business to locate in each result set. Supply at least one of cid, placeId, or name.",
    ),
  center: z
    .object({
      latitude: z.number().min(-90).max(90).describe("Latitude of the center."),
      longitude: z
        .number()
        .min(-180)
        .max(180)
        .describe("Longitude of the center."),
    })
    .describe("Coordinate the grid is centered on (usually the storefront)."),
  gridSize: z
    .number()
    .int()
    .min(MIN_GRID_SIZE)
    .max(MAX_GRID_SIZE)
    .optional()
    .describe(
      "Grid width 3-7 (3 = 9 points, 5 = 25, 7 = 49). Odd sizes put a point on the center. Defaults to 3.",
    ),
  spacingKm: z
    .number()
    .min(0.25)
    .max(10)
    .optional()
    .describe(
      "Distance between neighbouring grid points, in km. Defaults to 2. Use either spacingKm or radiusKm.",
    ),
  radiusKm: z
    .number()
    .min(0.25)
    .max(30)
    .optional()
    .describe(
      "Distance from the center to the outermost row/column, in km (e.g. 5 km with gridSize 5 = 2.5 km spacing). Alternative to spacingKm.",
    ),
  device: z
    .enum(["desktop", "mobile"])
    .optional()
    .describe("Device the SERP is rendered for. Defaults to mobile."),
  zoom: z
    .number()
    .int()
    .min(4)
    .max(18)
    .optional()
    .describe(
      "Map zoom every point is searched at. Defaults to a zoom derived from spacingKm and latitude so each point's viewport spans the grid spacing; override only when you need a specific viewport.",
    ),
  languageCode: languageCodeSchema.optional(),
  mode: z
    .enum(["queue", "live"])
    .optional()
    .describe(
      'How the searches run. "queue" (default) posts all points as one DataForSEO task batch and collects them — cheaper and resumable; "live" runs one live search per point, 3 at a time.',
    ),
  priority: z
    .enum(["high", "normal"])
    .optional()
    .describe(
      'Queue priority. "high" (default, ~$0.0012 per point) usually settles within seconds; "normal" (~$0.0006) can take minutes, so expect status "processing" and a resume call. Ignored in live mode.',
    ),
  estimateOnly: z
    .boolean()
    .optional()
    .describe(
      "Return the grid geometry and cost estimate without searching (free).",
    ),
  maxCostUsd: z
    .number()
    .positive()
    .optional()
    .describe(
      "Refuse to run (VALIDATION_ERROR, nothing charged) when the estimate exceeds this many USD.",
    ),
  resumeTasks: z
    .array(gridTaskSchema)
    .min(1)
    .max(MAX_GRID_SIZE * MAX_GRID_SIZE)
    .optional()
    .describe(
      'Collect a queued grid that returned status "processing": pass back `tasks` exactly as returned, with the same keyword, target, center, gridSize and spacing. Collecting is free (tasks stay available at DataForSEO for 30 days).',
    ),
} as const;

type GetLocalRankGridArgs = z.infer<
  z.ZodObject<typeof getLocalRankGridInputSchema>
>;

type GridPoint = {
  row: number;
  col: number;
  latitude: number;
  longitude: number;
};

type GridBusiness = { title: string | null; cid: string | null };

type GridPointResult = GridPoint & {
  rank: number | null;
  // How many businesses the SERP returned there, and who ranked first: a null
  // rank with a full result set means outranked; with a near-empty one it
  // means a sparse SERP. Both absent when the point's search failed.
  resultsCount?: number;
  topResult?: GridBusiness | null;
  /** LEIFKEN (SEO-5): the three businesses ranked first at this point. */
  top3?: Array<GridBusiness & { rank: number | null }>;
  error?: boolean;
  /** LEIFKEN (SEO-5): queued task not settled yet — resume with `tasks`. */
  pending?: boolean;
};

type GridTask = z.infer<typeof gridTaskSchema>;

type GridStructuredContent = {
  status: "completed" | "processing" | "estimate";
  grid: GridPointResult[];
  summary: {
    pointsSearched: number;
    pointsFound: number;
    averageRank: number | null;
    top3Count: number;
    top10Count: number;
    pointsPending?: number;
  };
  matchedBusiness: (GridBusiness & { placeId: string | null }) | null;
  settings: {
    gridSize: number;
    spacingKm: number;
    radiusKm: number;
    zoom: number;
    mode: "queue" | "live";
    priority: "high" | "normal" | null;
  };
  estimate: {
    points: number;
    costPerPointUsd: number;
    estimatedCostUsd: number;
  };
  tasks?: GridTask[];
};

function buildRankGridPoints(
  center: { latitude: number; longitude: number },
  gridSize: number,
  spacingKm: number,
): GridPoint[] {
  const middle = (gridSize - 1) / 2;
  const latitudeStep = spacingKm / KM_PER_DEGREE_LATITUDE;
  const longitudeStep =
    spacingKm /
    (KM_PER_DEGREE_LONGITUDE *
      Math.max(
        Math.abs(Math.cos((center.latitude * Math.PI) / 180)),
        MIN_LONGITUDE_COSINE,
      ));

  const points: GridPoint[] = [];
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      points.push({
        row,
        col,
        // Row 0 is the northernmost line so the rendered grid reads like a map.
        latitude: Number(
          (center.latitude + (middle - row) * latitudeStep).toFixed(7),
        ),
        longitude: Number(
          (center.longitude + (col - middle) * longitudeStep).toFixed(7),
        ),
      });
    }
  }
  return points;
}

function matchGridItem(
  items: unknown[],
  target: { cid?: string; placeId?: string; name?: string },
) {
  const name = target.name?.toLowerCase();
  return items.find((item) => {
    if (target.cid != null && readPath(item, "cid") === target.cid) return true;
    if (target.placeId != null && readPath(item, "place_id") === target.placeId)
      return true;
    if (name == null) return false;
    const title = readPath(item, "title");
    return typeof title === "string" && title.toLowerCase().includes(name);
  });
}

// A per-point failure usually means only that point's SERP failed, but these
// codes mean every remaining call would fail (and possibly bill) the same way —
// surface them instead of rendering a misleading grid.
const GRID_ABORT_ERROR_CODES = new Set<string>([
  "INSUFFICIENT_CREDITS",
  "DATAFORSEO_AUTH_FAILED",
]);

function renderGrid(results: GridPointResult[], gridSize: number): string {
  const lines: string[] = [];
  for (let row = 0; row < gridSize; row++) {
    // buildRankGridPoints emits row-major order and results keep it.
    const cells = results
      .slice(row * gridSize, (row + 1) * gridSize)
      .map((point) =>
        (point.pending
          ? "?"
          : point.error
            ? "x"
            : (point.rank?.toString() ?? "–")
        ).padStart(2, " "),
      );
    lines.push(cells.join(" "));
  }
  return lines.join("\n");
}

function gridBusiness(item: unknown): GridBusiness {
  return { title: readString(item, "title"), cid: readString(item, "cid") };
}

function itemRank(item: unknown): number | null {
  const rank = readPath(item, "rank_absolute") ?? readPath(item, "rank_group");
  return typeof rank === "number" ? rank : null;
}

/** One point's SERP rows → its grid cell. */
function scoreGridPoint(
  point: GridPoint,
  items: unknown[],
  target: GetLocalRankGridArgs["target"],
): { result: GridPointResult; match: unknown } {
  const match = matchGridItem(items, target);
  const first = items[0];
  return {
    match,
    result: {
      ...point,
      rank: match ? itemRank(match) : null,
      resultsCount: items.length,
      topResult: first == null ? null : gridBusiness(first),
      top3: items
        .slice(0, 3)
        .map((item) => ({ rank: itemRank(item), ...gridBusiness(item) })),
    },
  };
}

function gridTag(point: { row: number; col: number }): string {
  return `${point.row}:${point.col}`;
}

function resolveGridSpacing(args: GetLocalRankGridArgs, gridSize: number) {
  if (args.spacingKm != null && args.radiusKm != null) {
    throw new AppError(
      "VALIDATION_ERROR",
      "Use either spacingKm or radiusKm, not both.",
    );
  }
  if (args.radiusKm == null) return args.spacingKm ?? DEFAULT_SPACING_KM;
  return Number((args.radiusKm / ((gridSize - 1) / 2)).toFixed(4));
}

async function runLiveGrid(
  client: ReturnType<typeof createDataforseoClient>,
  points: GridPoint[],
  args: GetLocalRankGridArgs,
  search: { zoom: number; languageCode: string },
): Promise<{ grid: GridPointResult[]; matches: unknown[] }> {
  let lastError: unknown = null;
  const matches: unknown[] = [];
  const searchPoint = async (point: GridPoint): Promise<GridPointResult> => {
    try {
      const items = await client.serp.local({
        keyword: args.keyword,
        locationCoordinate: formatLocalSerpCoordinate({
          ...point,
          zoom: search.zoom,
        }),
        languageCode: search.languageCode,
        searchType: "maps",
        device: args.device ?? "mobile",
        depth: RANK_GRID_DEPTH,
        searchPlaces: false,
      });
      const scored = scoreGridPoint(point, items, args.target);
      if (scored.match) matches.push(scored.match);
      return scored.result;
    } catch (error) {
      if (error instanceof AppError && GRID_ABORT_ERROR_CODES.has(error.code))
        throw error;
      lastError = error;
      return { ...point, rank: null, error: true };
    }
  };

  // A few points at a time; an abort-worthy failure rejects its batch and
  // stops later batches from dispatching (and billing).
  const grid: GridPointResult[] = [];
  for (let i = 0; i < points.length; i += RANK_GRID_CONCURRENCY) {
    const batch = points.slice(i, i + RANK_GRID_CONCURRENCY);
    grid.push(...(await Promise.all(batch.map(searchPoint))));
  }

  // Every point failing means a systemic failure (auth, balance, bad market),
  // not a business that simply doesn't rank — surface it instead of an empty grid.
  if (grid.every((point) => point.error)) throw lastError;
  return { grid, matches };
}

async function collectGridTasks(
  points: GridPoint[],
  tasks: GridTask[],
  target: GetLocalRankGridArgs["target"],
): Promise<{ grid: GridPointResult[]; matches: unknown[] }> {
  const taskByTag = new Map(tasks.map((task) => [gridTag(task), task.taskId]));
  const settled = new Map<string, GridPointResult>();
  const matches: unknown[] = [];

  for (let attempt = 0; attempt < GRID_POLL_ATTEMPTS; attempt++) {
    const open = points.filter(
      (point) => taskByTag.has(gridTag(point)) && !settled.has(gridTag(point)),
    );
    if (open.length === 0) break;
    if (attempt > 0) await wait(GRID_POLL_INTERVAL_MS);
    for (let i = 0; i < open.length; i += GRID_COLLECT_CONCURRENCY) {
      await Promise.all(
        open.slice(i, i + GRID_COLLECT_CONCURRENCY).map(async (point) => {
          const taskId = taskByTag.get(gridTag(point)) ?? "";
          try {
            const outcome = await fetchMapsTaskResult(taskId);
            if (outcome.status === "pending") return;
            if (outcome.status === "failed") {
              settled.set(gridTag(point), {
                ...point,
                rank: null,
                error: true,
              });
              return;
            }
            const scored = scoreGridPoint(point, outcome.items, target);
            if (scored.match) matches.push(scored.match);
            settled.set(gridTag(point), scored.result);
          } catch {
            // Collection is free and the task stays collectable; a transient
            // task_get failure just leaves the point open for the next poll.
          }
        }),
      );
    }
  }

  const grid = points.map(
    (point): GridPointResult =>
      settled.get(gridTag(point)) ??
      (taskByTag.has(gridTag(point))
        ? { ...point, rank: null, pending: true }
        : // DataForSEO rejected this point's task at post time.
          { ...point, rank: null, error: true }),
  );
  return { grid, matches };
}

export const getLocalRankGridTool = {
  name: "get_local_rank_grid",
  config: {
    title: "Get local rank grid",
    description:
      'Runs one Google Maps search per point of a square grid (3x3 to 7x7) around a coordinate and reports where the target business ranks at each point — plus each point\'s result count and top 3 businesses — revealing how far its Maps visibility reaches. Size the area with gridSize and either spacingKm or radiusKm. Default mode "queue" posts all points as one DataForSEO task batch (high priority ~$0.0012 per point: 3x3 ~$0.011, 5x5 ~$0.03, 7x7 ~$0.059) and collects them for up to ~45 s; points still open come back as pending with status "processing" and a `tasks` list to resume for free. mode "live" costs ~$0.002 per point. estimateOnly returns the estimate without searching; maxCostUsd refuses a run above a budget. Charges credits per grid point.',
    inputSchema: getLocalRankGridInputSchema,
    outputSchema: {
      status: z.enum(["completed", "processing", "estimate"]).optional(),
      grid: z.array(
        z.object({
          row: z.number(),
          col: z.number(),
          latitude: z.number(),
          longitude: z.number(),
          rank: z.number().nullable(),
          resultsCount: z.number().optional(),
          topResult: z
            .object({
              title: z.string().nullable(),
              cid: z.string().nullable(),
            })
            .nullable()
            .optional(),
          top3: z
            .array(
              z.object({
                rank: z.number().nullable(),
                title: z.string().nullable(),
                cid: z.string().nullable(),
              }),
            )
            .optional(),
          error: z.boolean().optional(),
          pending: z.boolean().optional(),
        }),
      ),
      summary: z.object({
        pointsSearched: z.number(),
        pointsFound: z.number(),
        averageRank: z.number().nullable(),
        top3Count: z.number(),
        top10Count: z.number(),
        pointsPending: z.number().optional(),
      }),
      matchedBusiness: z
        .object({
          title: z.string().nullable(),
          cid: z.string().nullable(),
          placeId: z.string().nullable(),
        })
        .nullable(),
      settings: z
        .object({
          gridSize: z.number(),
          spacingKm: z.number(),
          radiusKm: z.number(),
          zoom: z.number(),
          mode: z.enum(["queue", "live"]),
          priority: z.enum(["high", "normal"]).nullable(),
        })
        .optional(),
      estimate: z
        .object({
          points: z.number(),
          costPerPointUsd: z.number(),
          estimatedCostUsd: z.number(),
        })
        .optional(),
      tasks: z.array(gridTaskSchema).optional(),
      ...optionalMetaOutputSchema,
    },
    annotations: {
      readOnlyHint: false,
      openWorldHint: false,
      destructiveHint: false,
    },
  },
  handler: withMcpProjectAuth(async (args: GetLocalRankGridArgs, context) => {
    if (
      args.target.cid == null &&
      args.target.placeId == null &&
      args.target.name == null
    ) {
      throw new AppError(
        "VALIDATION_ERROR",
        "target needs at least one of cid, placeId, or name.",
      );
    }

    const gridSize = args.gridSize ?? 3;
    const spacingKm = resolveGridSpacing(args, gridSize);
    const zoom = args.zoom ?? rankGridZoom(spacingKm, args.center.latitude);
    const points = buildRankGridPoints(args.center, gridSize, spacingKm);
    const languageCode = args.languageCode ?? context.project.languageCode;
    const mode = args.mode ?? "queue";
    const priority = mode === "queue" ? (args.priority ?? "high") : null;
    const settings = {
      gridSize,
      spacingKm,
      radiusKm: Number((spacingKm * ((gridSize - 1) / 2)).toFixed(4)),
      zoom,
      mode,
      priority,
    };
    const costPerPointUsd = RANK_GRID_COST_PER_POINT_USD[priority ?? "live"];
    // Resuming only collects already-paid tasks.
    const estimate = {
      points: points.length,
      costPerPointUsd: args.resumeTasks ? 0 : costPerPointUsd,
      estimatedCostUsd: args.resumeTasks
        ? 0
        : Number((points.length * costPerPointUsd).toFixed(4)),
    };
    const meta = buildProjectMeta(
      context,
      args.projectId,
      `/p/${args.projectId}`,
    );
    const settingsText = `${gridSize}x${gridSize}, ${spacingKm} km spacing (radius ${settings.radiusKm} km), zoom ${zoom}, top ${RANK_GRID_DEPTH} checked, ${mode}${priority ? ` (${priority} priority)` : ""}`;

    if (args.estimateOnly) {
      return mcpResponse<GridStructuredContent>({
        text: `Estimate for "${args.keyword}" (${settingsText}): ${estimate.points} points × ~$${estimate.costPerPointUsd} = ~$${estimate.estimatedCostUsd}. Nothing was searched.`,
        meta,
        structuredContent: {
          status: "estimate",
          grid: points.map((point) => ({ ...point, rank: null })),
          summary: {
            pointsSearched: 0,
            pointsFound: 0,
            averageRank: null,
            top3Count: 0,
            top10Count: 0,
          },
          matchedBusiness: null,
          settings,
          estimate,
        },
      });
    }
    if (
      args.maxCostUsd != null &&
      estimate.estimatedCostUsd > args.maxCostUsd
    ) {
      throw new AppError(
        "VALIDATION_ERROR",
        `Estimated cost ~$${estimate.estimatedCostUsd} (${estimate.points} points × ~$${costPerPointUsd}) exceeds maxCostUsd $${args.maxCostUsd}. Nothing was charged; use a smaller gridSize, mode "queue" or priority "normal".`,
      );
    }
    if (args.resumeTasks && args.resumeTasks.length !== points.length) {
      throw new AppError(
        "VALIDATION_ERROR",
        `resumeTasks has ${args.resumeTasks.length} entries but a ${gridSize}x${gridSize} grid has ${points.length} points. Pass back the full tasks list with the same gridSize.`,
      );
    }

    const client = createDataforseoClient(context.billing);
    let run: { grid: GridPointResult[]; matches: unknown[] };
    let tasks: GridTask[] | undefined;
    if (mode === "live" && !args.resumeTasks) {
      run = await runLiveGrid(client, points, args, { zoom, languageCode });
    } else {
      if (args.resumeTasks) {
        tasks = args.resumeTasks;
      } else {
        const posted = await client.serp.mapsTaskPost({
          keyword: args.keyword,
          languageCode,
          device: args.device ?? "mobile",
          depth: RANK_GRID_DEPTH,
          priority: priority ?? "high",
          points: points.map((point) => ({
            tag: gridTag(point),
            locationCoordinate: formatLocalSerpCoordinate({ ...point, zoom }),
          })),
        });
        tasks = posted.flatMap((task) => {
          const [row, col] = task.tag.split(":").map(Number);
          return row == null || col == null || Number.isNaN(row + col)
            ? []
            : [{ row, col, taskId: task.taskId }];
        });
        if (tasks.length === 0) {
          throw new AppError(
            "INTERNAL_ERROR",
            "DataForSEO accepted none of the grid's Maps tasks.",
          );
        }
      }
      run = await collectGridTasks(points, tasks, args.target);
      if (run.grid.every((point) => point.error)) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Every grid point's Maps task failed at DataForSEO.",
        );
      }
    }

    const { grid } = run;
    const firstMatch = run.matches[0];
    const matchedBusiness =
      firstMatch == null
        ? null
        : {
            ...gridBusiness(firstMatch),
            placeId: readString(firstMatch, "place_id"),
          };
    const pendingCount = grid.filter((point) => point.pending).length;
    const found = grid.filter((point) => point.rank != null);
    const ranks = found.map((point) => point.rank ?? 0);
    const summary = {
      pointsSearched: grid.filter((point) => !point.pending).length,
      pointsFound: found.length,
      averageRank: ranks.length
        ? Number(
            (ranks.reduce((sum, rank) => sum + rank, 0) / ranks.length).toFixed(
              2,
            ),
          )
        : null,
      top3Count: ranks.filter((rank) => rank <= 3).length,
      top10Count: ranks.filter((rank) => rank <= 10).length,
      ...(pendingCount > 0 ? { pointsPending: pendingCount } : {}),
    };
    const status =
      pendingCount > 0 ? ("processing" as const) : ("completed" as const);

    const text = [
      `Local rank grid for "${args.keyword}" (${settingsText}).`,
      `Rank per point, north at the top ("–" = not among the results returned there; check that point's resultsCount and top3 before reading it as outranked, "x" = search failed but may still be charged, "?" = queued task not finished yet):`,
      renderGrid(grid, gridSize),
      `- ranked at ${summary.pointsFound} of ${summary.pointsSearched} points`,
      `- average rank where found: ${summary.averageRank ?? "—"}`,
      `- top 3 at ${summary.top3Count} points, top 10 at ${summary.top10Count} points`,
      ...(pendingCount > 0
        ? [
            `- ${pendingCount} point(s) still processing at DataForSEO: call get_local_rank_grid again with the same arguments plus resumeTasks = structuredContent.tasks to collect them at no extra cost.`,
          ]
        : []),
    ].join("\n");

    return mcpResponse<GridStructuredContent>({
      text,
      meta,
      structuredContent: {
        status,
        grid,
        summary,
        matchedBusiness,
        settings,
        estimate,
        ...(tasks ? { tasks } : {}),
      },
    });
  }),
};
