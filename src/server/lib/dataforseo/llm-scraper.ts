import { z } from "zod";
import {
  AiOptimizationChatGptLlmScraperLiveAdvancedRequestInfo,
  SerpGoogleAiModeLiveAdvancedRequestInfo,
} from "dataforseo-client";
import { aiOptimizationApi, serpApi } from "@/server/lib/dataforseo/core";
import { createDataforseoBillingClassifier } from "@/server/lib/dataforseoBillingClassification";
import { AppError } from "@/server/lib/errors";
import {
  assertOk,
  buildTaskBilling,
  isRecord,
  type DataforseoApiResponse,
  type DataforseoTaskLike,
} from "@/server/lib/dataforseo/envelope";

/**
 * LEIFKEN (RankMeister SEO-4 Punkt 5): thin wrappers around two real-browser
 * AI-answer scrapers, checked against the DataForSEO SDK before building
 * (dataforseo-client@2.0.19's AiOptimizationApi/SerpApi method lists) rather
 * than assumed:
 *
 *  - ChatGPT: `ai_optimization/chat_gpt/llm_scraper/live/advanced` is a real
 *    scrape of chatgpt.com with location_code/language_code — exactly what
 *    was asked for.
 *  - "Gemini": DataForSEO has no Gemini *scraper* (no chatgpt-style browser
 *    scrape of gemini.google.com) and Gemini's own `llm_responses` endpoint
 *    (already used by explore_ai_prompt) explicitly rejects location/country
 *    targeting (`web_search_country_iso_code` → 40501 Invalid Field,
 *    confirmed in fetchLlmResponse). The closest real substitute with
 *    genuine location_code/language_code support is Google's AI Mode SERP
 *    feature (`serp/google/ai_mode/live/advanced`), which is Gemini-powered
 *    and returns the same markdown + references shape. get_gemini_ai_answer
 *    below is explicit about using AI Mode rather than silently mislabeling
 *    it as a dedicated Gemini scraper.
 */

const classifyAiSearchError = createDataforseoBillingClassifier({
  pathPrefix: "/ai_optimization/",
  billingIssueCode: "AI_SEARCH_BILLING_ISSUE",
  billingIssueMessage:
    "The connected DataForSEO account has a billing or balance issue",
});

function firstResult(task: DataforseoTaskLike): Record<string, unknown> | null {
  const first = task.result?.[0];
  return isRecord(first) ? first : null;
}

// ---------------------------------------------------------------------------
// ChatGPT LLM Scraper
// ---------------------------------------------------------------------------

const chatGptScrapeSourceSchema = z
  .object({
    url: z.string().nullable().optional(),
    title: z.string().nullable().optional(),
    domain: z.string().nullable().optional(),
  })
  .passthrough();

const chatGptScrapeBrandEntitySchema = z
  .object({
    title: z.string().nullable().optional(),
  })
  .passthrough();

export const chatGptScrapeResultSchema = z
  .object({
    keyword: z.string().nullable().optional(),
    location_code: z.number().nullable().optional(),
    language_code: z.string().nullable().optional(),
    model: z.string().nullable().optional(),
    check_url: z.string().nullable().optional(),
    markdown: z.string().nullable().optional(),
    sources: z.array(chatGptScrapeSourceSchema).nullable().optional(),
    fan_out_queries: z.array(z.string()).nullable().optional(),
    brand_entities: z.array(chatGptScrapeBrandEntitySchema).nullable().optional(),
  })
  .passthrough();

export type ChatGptScrapeResult = z.infer<typeof chatGptScrapeResultSchema>;

export async function fetchChatGptScrape(input: {
  keyword: string;
  locationCode?: number;
  languageCode?: string;
  forceWebSearch?: boolean;
}): Promise<DataforseoApiResponse<ChatGptScrapeResult>> {
  const response = await aiOptimizationApi(
    classifyAiSearchError,
  ).chatGptLlmScraperLiveAdvanced([
    new AiOptimizationChatGptLlmScraperLiveAdvancedRequestInfo({
      keyword: input.keyword,
      location_code: input.locationCode,
      language_code: input.languageCode,
      force_web_search: input.forceWebSearch,
    }),
  ]);
  const task = assertOk(response, {
    classify: classifyAiSearchError,
    classifyPath: "/v3/ai_optimization/chat_gpt/llm_scraper/live/advanced",
  });
  const parsed = chatGptScrapeResultSchema.safeParse(firstResult(task) ?? {});
  if (!parsed.success) {
    throw new AppError(
      "INTERNAL_ERROR",
      "DataForSEO chat_gpt/llm_scraper returned an invalid response shape",
    );
  }
  return { data: parsed.data, billing: buildTaskBilling(task) };
}

// ---------------------------------------------------------------------------
// Google AI Mode (Gemini-powered) — see the file-level note on why this
// stands in for a "Gemini scraper".
// ---------------------------------------------------------------------------

const aiModeReferenceSchema = z
  .object({
    url: z.string().nullable().optional(),
    title: z.string().nullable().optional(),
    domain: z.string().nullable().optional(),
  })
  .passthrough();

const aiModeOverviewItemSchema = z
  .object({
    markdown: z.string().nullable().optional(),
    references: z.array(aiModeReferenceSchema).nullable().optional(),
  })
  .passthrough();

export const googleAiModeScrapeResultSchema = z
  .object({
    keyword: z.string().nullable().optional(),
    location_code: z.number().nullable().optional(),
    language_code: z.string().nullable().optional(),
    check_url: z.string().nullable().optional(),
    items: z.array(aiModeOverviewItemSchema).nullable().optional(),
  })
  .passthrough();

export type GoogleAiModeScrapeResult = z.infer<
  typeof googleAiModeScrapeResultSchema
>;

export async function fetchGoogleAiModeScrape(input: {
  keyword: string;
  locationCode?: number;
  languageCode?: string;
  device?: "desktop" | "mobile";
}): Promise<DataforseoApiResponse<GoogleAiModeScrapeResult>> {
  const response = await serpApi().googleAiModeLiveAdvanced([
    new SerpGoogleAiModeLiveAdvancedRequestInfo({
      keyword: input.keyword,
      location_code: input.locationCode,
      language_code: input.languageCode,
      device: input.device,
    }),
  ]);
  // "No Search Results" (40501) — AI Mode has no answer for some keywords or
  // is unavailable in that market; a valid empty result, still billed.
  const task = assertOk(response, { treatNoResultsAsEmpty: true });
  const parsed = googleAiModeScrapeResultSchema.safeParse(firstResult(task) ?? {});
  if (!parsed.success) {
    throw new AppError(
      "INTERNAL_ERROR",
      "DataForSEO serp/google/ai_mode returned an invalid response shape",
    );
  }
  return { data: parsed.data, billing: buildTaskBilling(task) };
}
