import { z } from "zod";
import { J as researchScopeSchema } from "../entry.js";
const BRAND_LOOKUP_MAX_INPUT_LENGTH = 250;
const BRAND_LOOKUP_MAX_COMPETITORS = 5;
function parseCompetitorList(raw) {
  return Array.from(
    new Set(
      raw.split(",").map((part) => part.trim()).filter((part) => part.length > 0)
    )
  ).slice(0, BRAND_LOOKUP_MAX_COMPETITORS);
}
const brandLookupInputSchema = z.object({
  projectId: z.string().min(1),
  query: z.string().trim().min(1).max(BRAND_LOOKUP_MAX_INPUT_LENGTH),
  // Optional competitor brands/domains to compare Share of Voice against.
  // cross_aggregated_metrics caps groups at 10 (target + 9); we cap at 5.
  competitors: z.array(z.string().trim().min(1).max(BRAND_LOOKUP_MAX_INPUT_LENGTH)).max(BRAND_LOOKUP_MAX_COMPETITORS).default([]),
  // Research scope for domain/URL queries. Ignored for brand keywords, which
  // have no URL to scope. Omitted = derive from the query (root → domain, path
  // → subfolder).
  scope: researchScopeSchema.optional(),
  locationCode: z.number().int().positive().default(2840),
  languageCode: z.string().min(2).max(8).default("en")
});
const brandPlatformBreakdownSchema = z.object({
  platform: z.enum(["chat_gpt", "google"]),
  status: z.enum(["success", "error"]),
  mentions: z.number().int().nonnegative().nullable(),
  aiSearchVolume: z.number().int().nonnegative().nullable()
});
const brandShareOfVoiceSchema = z.object({
  // The platforms whose cross_aggregated call succeeded and are summed into
  // the entries — so the UI can caption a single-platform leaderboard honestly
  // when the other platform's call failed.
  platforms: z.array(z.enum(["chat_gpt", "google"])),
  entries: z.array(
    z.object({
      label: z.string().max(BRAND_LOOKUP_MAX_INPUT_LENGTH),
      isTarget: z.boolean(),
      mentions: z.number().int().nonnegative().nullable(),
      sharePct: z.number().nullable()
    })
  )
});
const brandTopPageKeywordSchema = z.object({
  question: z.string().max(500),
  aiSearchVolume: z.number().int().nonnegative().nullable()
});
const brandTopPageSchema = z.object({
  url: z.string().max(2048),
  domain: z.string().max(253).nullable(),
  platform: z.enum(["chat_gpt", "google"]),
  // Page-level citation mentions from DataForSEO top_pages.
  mentions: z.number().int().nonnegative().nullable(),
  // Page-level AI search volume from DataForSEO top_pages.
  capturedVolume: z.number().int().nonnegative().nullable(),
  // Example prompts from the fetched mentions sample that cited this page.
  keywords: z.array(brandTopPageKeywordSchema).max(50)
});
const brandTopQuerySchema = z.object({
  question: z.string().max(500),
  platform: z.enum(["chat_gpt", "google"]),
  aiSearchVolume: z.number().int().nonnegative().nullable(),
  firstSeenAt: z.string().nullable(),
  lastSeenAt: z.string().nullable(),
  citedSources: z.array(
    z.object({
      url: z.string().max(2048),
      domain: z.string().max(253).nullable(),
      title: z.string().max(300).nullable()
    })
  ).max(10),
  brandsMentioned: z.array(z.string().max(200)).max(20)
});
const brandMonthlyVolumeSchema = z.object({
  year: z.number().int(),
  month: z.number().int().min(1).max(12),
  volume: z.number().int().nonnegative().nullable()
});
const brandLookupResultSchema = z.object({
  query: z.string(),
  detectedTargetType: z.enum(["domain", "keyword"]),
  /** Hostname for domain scopes, hostname + path for URL scopes. */
  resolvedTarget: z.string(),
  // Resolved scope, or null for keyword lookups. Defaulted so cache entries
  // written before scopes existed still parse.
  scope: researchScopeSchema.nullable().default(null),
  /**
   * True under exact_url/subfolder scope: the LLM mentions API has no
   * URL-level targeting, so totals, per-platform counts, monthly volume and
   * Share of Voice stay domain-wide and the UI must say so. Page-level rows
   * are filtered to the scope.
   */
  aggregatesAreDomainLevel: z.boolean().default(false),
  fetchedAt: z.string(),
  hasData: z.boolean(),
  totalMentions: z.number().int().nonnegative().nullable(),
  totalAiSearchVolume: z.number().int().nonnegative().nullable(),
  perPlatform: z.array(brandPlatformBreakdownSchema),
  // Competitor Share of Voice — null when no competitors were supplied or both
  // cross_aggregated calls failed. No legacy-cache shim: pre-SoV cache entries
  // are unreachable anyway (the cache key's param set changed), see the
  // buildCacheKey comment in brandLookup.ts.
  shareOfVoice: brandShareOfVoiceSchema.nullable(),
  topPages: z.array(brandTopPageSchema).max(40),
  topQueries: z.array(brandTopQuerySchema).max(50),
  monthlyVolume: z.array(brandMonthlyVolumeSchema)
});
const PROMPT_EXPLORER_MAX_PROMPT_LENGTH = 500;
const PROMPT_EXPLORER_MODELS = [
  "chat_gpt",
  "claude",
  "gemini",
  "perplexity"
];
const promptExplorerModelSchema = z.enum(PROMPT_EXPLORER_MODELS);
const WEB_SEARCH_COUNTRY_CODES = [
  "US",
  "GB",
  "CA",
  "AU",
  "IE",
  "DE",
  "FR",
  "ES",
  "IT",
  "NL",
  "PT",
  "PL",
  "SE",
  "NO",
  "DK",
  "BR",
  "MX",
  "IN",
  "JP",
  "KR",
  "SG",
  "HK",
  "TW",
  "ZA"
];
const webSearchCountryCodeSchema = z.enum(WEB_SEARCH_COUNTRY_CODES);
const promptExplorerInputSchema = z.object({
  projectId: z.string().min(1),
  prompt: z.string().trim().min(1).max(PROMPT_EXPLORER_MAX_PROMPT_LENGTH),
  models: z.array(promptExplorerModelSchema).min(1).max(4),
  highlightBrand: z.string().trim().min(1).max(BRAND_LOOKUP_MAX_INPUT_LENGTH).optional(),
  webSearch: z.boolean().default(true),
  webSearchCountryCode: webSearchCountryCodeSchema.optional()
});
const promptExplorerCitationSchema = z.object({
  url: z.string(),
  domain: z.string().nullable(),
  title: z.string().nullable(),
  matchedBrand: z.boolean()
});
const promptExplorerModelResultSchema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("success"),
    model: promptExplorerModelSchema,
    modelName: z.string().nullable(),
    text: z.string(),
    citations: z.array(promptExplorerCitationSchema),
    fanOutQueries: z.array(z.string()),
    brandMentioned: z.boolean().nullable(),
    outputTokens: z.number().int().nonnegative().nullable(),
    webSearch: z.boolean()
  }),
  z.object({
    status: z.literal("error"),
    model: promptExplorerModelSchema,
    errorCode: z.literal("UPSTREAM_ERROR"),
    message: z.string()
  })
]);
z.object({
  prompt: z.string(),
  highlightBrand: z.string().nullable(),
  fetchedAt: z.string(),
  results: z.array(promptExplorerModelResultSchema)
});
const brandLookupSearchSchema = z.object({
  q: z.string().optional(),
  scope: researchScopeSchema.optional().catch(void 0),
  c: z.union([z.string(), z.array(z.string())]).optional().transform(
    (value) => value === void 0 ? void 0 : parseCompetitorList(Array.isArray(value) ? value.join(",") : value)
  )
});
const promptExplorerSearchSchema = z.object({
  q: z.string().optional(),
  models: z.union([promptExplorerModelSchema, z.array(promptExplorerModelSchema)]).optional().transform(
    (value) => value === void 0 ? void 0 : Array.isArray(value) ? value : [value]
  ),
  web: z.union([z.boolean(), z.enum(["true", "false"])]).optional().transform(
    (value) => value === void 0 ? void 0 : value === true || value === "true"
  ),
  cc: webSearchCountryCodeSchema.optional(),
  hb: z.string().optional()
});
export {
  BRAND_LOOKUP_MAX_INPUT_LENGTH as B,
  PROMPT_EXPLORER_MAX_PROMPT_LENGTH as P,
  WEB_SEARCH_COUNTRY_CODES as W,
  brandLookupResultSchema as a,
  brandLookupInputSchema as b,
  promptExplorerModelResultSchema as c,
  PROMPT_EXPLORER_MODELS as d,
  promptExplorerModelSchema as e,
  parseCompetitorList as f,
  promptExplorerSearchSchema as g,
  brandLookupSearchSchema as h,
  promptExplorerInputSchema as p,
  webSearchCountryCodeSchema as w
};
