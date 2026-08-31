import { z } from "zod";
import { BusinessDataBusinessListingsSearchLiveRequestInfo, BusinessDataGoogleMyBusinessInfoLiveRequestInfo, BusinessDataGoogleQuestionsAndAnswersLiveRequestInfo, BusinessDataGoogleExtendedReviewsTaskPostRequestInfo, BusinessDataGoogleReviewsTaskPostRequestInfo, BusinessDataGoogleMyBusinessUpdatesTaskPostRequestInfo, BacklinksHistoryLiveRequestInfo, BacklinksBacklinksLiveRequestInfo, BacklinksSummaryLiveRequestInfo, BacklinksDomainPagesSummaryLiveRequestInfo, BacklinksReferringDomainsLiveRequestInfo, DataforseoLabsGoogleDomainRankOverviewLiveRequestInfo, DataforseoLabsGoogleKeywordIdeasLiveRequestInfo, DataforseoLabsGoogleKeywordOverviewLiveRequestInfo, DataforseoLabsGoogleKeywordSuggestionsLiveRequestInfo, DataforseoLabsGoogleRankedKeywordsLiveRequestInfo, DataforseoLabsGoogleRelatedKeywordsLiveRequestInfo, DataforseoLabsGoogleRelevantPagesLiveRequestInfo, DataforseoLabsGoogleSerpCompetitorsLiveRequestInfo, KeywordsDataGoogleAdsKeywordsForKeywordsLiveRequestInfo, KeywordsDataGoogleAdsSearchVolumeLiveRequestInfo, SerpGoogleOrganicLiveAdvancedRequestInfo, SerpGoogleMapsLiveAdvancedRequestInfo, SerpGoogleLocalFinderLiveAdvancedRequestInfo, SerpGoogleOrganicTaskPostRequestInfo, SerpApiStopCrawlOnMatchInfo, OnPageLighthouseLiveJsonRequestInfo, AiOptimizationLlmMentionsAggregatedMetricsLiveRequestInfo, AiOptimizationLlmMentionsCrossAggregatedMetricsLiveRequestInfo, AiOptimizationLLmMentionsCrossAggregateMetricsTargetInfo, AiOptimizationLlmMentionsSearchLiveRequestInfo, AiOptimizationChatGptLlmResponsesLiveRequestInfo, AiOptimizationClaudeLlmResponsesLiveRequestInfo, AiOptimizationGeminiLlmResponsesLiveRequestInfo, AiOptimizationLlmMentionsTopPagesLiveRequestInfo, AiOptimizationLLmMentionsDomainElement, AiOptimizationLLmMentionsKeywordElement } from "dataforseo-client";
import { b as businessDataApi, a as businessDataTaskApi, c as backlinksApi, l as labsApi, k as keywordsDataApi, s as serpApi, o as onPageApi, d as aiOptimizationApi } from "./core-CIJSeFeB.js";
import { a0 as AppError, bS as isTaskInProgress, bT as isNoResultsTask, bU as isRecord, b9 as assertOk, bV as buildTaskBilling, bW as parseTaskItems, bX as normalizeBacklinksSpamFilterOptions, bY as parseTaskTotalCount, bZ as MAX_TASKS_PER_POST, b_ as DataforseoChargedTaskError } from "../entry.js";
import { b as buildStoredLighthouseIssues, a as buildStoredLighthouseMetrics, c as scoreToPercent } from "./lighthouseStoredPayload-fQQSiRJH.js";
import "node:async_hooks";
import "node:crypto";
import "ioredis";
import "node:fs/promises";
import "node:path";
import "@modelcontextprotocol/client";
import "@modelcontextprotocol/client/validators/cf-worker";
import "@modelcontextprotocol/sdk/types.js";
import "node:diagnostics_channel";
import "jose";
import "drizzle-orm/d1";
import "drizzle-orm/sqlite-core";
import "drizzle-orm";
import "drizzle-orm/postgres-js";
import "postgres";
import "drizzle-orm/pg-core";
import "jose/errors";
import "node:fs";
import "node:os";
import "@better-auth/api-key";
import "posthog-node";
import "@modelcontextprotocol/server";
import "remeda";
import "tldts";
import "srvx";
import "react";
import "@tanstack/react-router";
import "react/jsx-runtime";
import "@tanstack/react-router/ssr/server";
import "./lighthouse-CxIZIYPF.js";
function locationParams(input) {
  return input.locationCoordinate ? { location_coordinate: input.locationCoordinate } : { location_code: input.locationCode };
}
async function fetchBusinessListingsSearch(input) {
  const response = await businessDataApi().businessListingsSearchLive([
    new BusinessDataBusinessListingsSearchLiveRequestInfo({
      categories: input.categories,
      title: input.title,
      location_coordinate: input.locationCoordinate,
      is_claimed: input.isClaimed,
      filters: input.filters,
      order_by: input.orderBy,
      limit: input.limit,
      offset: input.offset
    })
  ]);
  const task = assertOk(response, { treatNoResultsAsEmpty: true });
  return {
    data: task.result?.[0]?.items ?? [],
    billing: buildTaskBilling(task)
  };
}
const questionsResultSchema = z.object({
  items: z.array(z.record(z.string(), z.unknown())).nullable().optional(),
  items_without_answers: z.array(z.record(z.string(), z.unknown())).nullable().optional()
}).passthrough();
function combinedQuestionItems(results) {
  const list = Array.isArray(results) ? results : [];
  return list.flatMap((result) => {
    const parsed = questionsResultSchema.safeParse(result ?? {});
    if (!parsed.success) return [];
    return [
      ...parsed.data.items ?? [],
      ...parsed.data.items_without_answers ?? []
    ];
  });
}
async function fetchQuestionsAnswers(input) {
  const response = await businessDataApi().googleQuestionsAndAnswersLive([
    new BusinessDataGoogleQuestionsAndAnswersLiveRequestInfo({
      keyword: input.keyword,
      location_coordinate: input.locationCoordinate,
      language_code: input.languageCode,
      depth: input.depth
    })
  ]);
  const task = assertOk(response, { treatNoResultsAsEmpty: true });
  return {
    data: combinedQuestionItems(task.result),
    billing: buildTaskBilling(task)
  };
}
async function fetchMyBusinessInfo(input) {
  const response = await businessDataApi().googleMyBusinessInfoLive([
    new BusinessDataGoogleMyBusinessInfoLiveRequestInfo({
      keyword: input.keyword,
      ...locationParams(input),
      language_code: input.languageCode
    })
  ]);
  const task = assertOk(response, { treatNoResultsAsEmpty: true });
  const entry = task.result?.[0];
  const item = entry?.items?.[0];
  if (!isRecord(item)) {
    return { data: null, billing: buildTaskBilling(task) };
  }
  if (item.check_url == null) item.check_url = entry?.check_url;
  return { data: item, billing: buildTaskBilling(task) };
}
const TASK_PRIORITY_HIGH = 2;
function postedTaskId(response) {
  const task = assertOk(response, { okTaskStatusCode: 20100 });
  if (!task.id) {
    throw new AppError("INTERNAL_ERROR", "DataForSEO did not return a task id");
  }
  return { data: task.id, billing: buildTaskBilling(task) };
}
async function postGoogleReviewsTask(input) {
  if (input.includeOtherSources) {
    return postedTaskId(
      await businessDataTaskApi().googleExtendedReviewsTaskPost([
        new BusinessDataGoogleExtendedReviewsTaskPostRequestInfo({
          keyword: input.keyword,
          cid: input.cid,
          place_id: input.placeId,
          ...locationParams(input),
          language_code: input.languageCode,
          depth: input.depth,
          priority: TASK_PRIORITY_HIGH
        })
      ])
    );
  }
  return postedTaskId(
    await businessDataTaskApi().googleReviewsTaskPost([
      new BusinessDataGoogleReviewsTaskPostRequestInfo({
        keyword: input.keyword,
        cid: input.cid,
        place_id: input.placeId,
        ...locationParams(input),
        language_code: input.languageCode,
        depth: input.depth,
        sort_by: input.sortBy,
        priority: TASK_PRIORITY_HIGH
      })
    ])
  );
}
async function postMyBusinessUpdatesTask(input) {
  return postedTaskId(
    await businessDataTaskApi().googleMyBusinessUpdatesTaskPost([
      new BusinessDataGoogleMyBusinessUpdatesTaskPostRequestInfo({
        keyword: input.keyword,
        ...locationParams(input),
        language_code: input.languageCode,
        depth: input.depth,
        priority: TASK_PRIORITY_HIGH
      })
    ])
  );
}
async function fetchBusinessDataTaskResult(input) {
  const api = businessDataApi();
  const response = input.endpoint === "reviews" ? await api.googleReviewsTaskGet(input.taskId) : input.endpoint === "extended_reviews" ? await api.googleExtendedReviewsTaskGet(input.taskId) : await api.googleMyBusinessUpdatesTaskGet(input.taskId);
  const task = response?.tasks?.[0];
  if (!response || response.status_code !== 2e4 || !task) {
    throw new AppError(
      "INTERNAL_ERROR",
      response?.status_message || "DataForSEO task_get failed"
    );
  }
  if (isTaskInProgress(task)) return { status: "pending", result: null };
  if (task.status_code !== 2e4) {
    if (!isNoResultsTask(task)) {
      throw new AppError(
        "INTERNAL_ERROR",
        task.status_message || `DataForSEO task failed (${task.status_code})`
      );
    }
    return { status: "completed", result: null };
  }
  const first = task.result?.[0];
  return { status: "completed", result: isRecord(first) ? first : null };
}
const businessCategorySchema = z.object({
  category_name: z.string(),
  business_count: z.number().nullable().optional()
}).passthrough();
async function fetchBusinessListingsCategories() {
  const response = await businessDataApi().businessListingsCategories();
  const task = assertOk(response);
  const rows = (task.result ?? []).flatMap((entry) => {
    const parsed = businessCategorySchema.safeParse(entry);
    if (!parsed.success) return [];
    return [
      {
        category: parsed.data.category_name,
        businessCount: parsed.data.business_count ?? null
      }
    ];
  });
  return { data: rows, billing: buildTaskBilling(task) };
}
const BILLING_SIGNALS = [
  "insufficient funds",
  "balance is too low",
  "payment required",
  "billing",
  "balance",
  "problem billing",
  "recharged"
];
const BILLING_STATUS_CODES = /* @__PURE__ */ new Set([40200, 40210, 402]);
function createDataforseoBillingClassifier(config) {
  return (status, details, path) => {
    if (!path.includes(config.pathPrefix)) return null;
    const text = details.toLowerCase();
    const matchesBillingStatus = status != null && BILLING_STATUS_CODES.has(status);
    const matchesBillingText = BILLING_SIGNALS.some(
      (signal) => text.includes(signal)
    );
    if (matchesBillingStatus || matchesBillingText) {
      return new AppError(config.billingIssueCode, config.billingIssueMessage);
    }
    return null;
  };
}
const classifyBacklinksError = createDataforseoBillingClassifier({
  pathPrefix: "/backlinks/",
  billingIssueCode: "BACKLINKS_BILLING_ISSUE",
  billingIssueMessage: "The connected DataForSEO account has a billing or balance issue"
});
const backlinksSummaryItemSchema = z.object({
  target: z.string().optional(),
  rank: z.number().nullable().optional(),
  backlinks: z.number().nullable().optional(),
  referring_pages: z.number().nullable().optional(),
  referring_domains: z.number().nullable().optional(),
  broken_backlinks: z.number().nullable().optional(),
  broken_pages: z.number().nullable().optional(),
  new_backlinks: z.number().nullable().optional(),
  lost_backlinks: z.number().nullable().optional(),
  new_reffering_domains: z.number().nullable().optional(),
  lost_reffering_domains: z.number().nullable().optional(),
  new_referring_domains: z.number().nullable().optional(),
  lost_referring_domains: z.number().nullable().optional(),
  backlinks_spam_score: z.number().nullable().optional(),
  info: z.object({ target_spam_score: z.number().nullable().optional() }).passthrough().nullable().optional()
}).passthrough();
const backlinksItemSchema = z.object({
  domain_from: z.string().nullable().optional(),
  url_from: z.string().nullable().optional(),
  url_to: z.string().nullable().optional(),
  anchor: z.string().nullable().optional(),
  item_type: z.string().nullable().optional(),
  dofollow: z.boolean().nullable().optional(),
  rank: z.number().nullable().optional(),
  domain_from_rank: z.number().nullable().optional(),
  page_from_rank: z.number().nullable().optional(),
  backlinks_spam_score: z.number().nullable().optional(),
  backlink_spam_score: z.number().nullable().optional(),
  first_seen: z.string().nullable().optional(),
  last_visited: z.string().nullable().optional(),
  lost_date: z.string().nullable().optional(),
  is_new: z.boolean().nullable().optional(),
  is_lost: z.boolean().nullable().optional(),
  is_broken: z.boolean().nullable().optional(),
  links_count: z.number().nullable().optional(),
  rel_attributes: z.array(z.string()).nullable().optional(),
  attributes: z.array(z.string()).nullable().optional()
}).passthrough();
const referringDomainItemSchema = z.object({
  domain: z.string().nullable().optional(),
  backlinks: z.number().nullable().optional(),
  referring_pages: z.number().nullable().optional(),
  rank: z.number().nullable().optional(),
  first_seen: z.string().nullable().optional(),
  broken_backlinks: z.number().nullable().optional(),
  broken_pages: z.number().nullable().optional(),
  backlinks_spam_score: z.number().nullable().optional(),
  target_spam_score: z.number().nullable().optional()
}).passthrough();
const domainPageSummaryItemSchema = z.object({
  page: z.string().nullable().optional(),
  url: z.string().nullable().optional(),
  backlinks: z.number().nullable().optional(),
  referring_domains: z.number().nullable().optional(),
  rank: z.number().nullable().optional(),
  broken_backlinks: z.number().nullable().optional()
}).passthrough();
const backlinksHistoryItemSchema = z.object({
  date: z.string().nullable().optional(),
  rank: z.number().nullable().optional(),
  backlinks: z.number().nullable().optional(),
  referring_domains: z.number().nullable().optional(),
  new_backlinks: z.number().nullable().optional(),
  lost_backlinks: z.number().nullable().optional(),
  new_reffering_domains: z.number().nullable().optional(),
  lost_reffering_domains: z.number().nullable().optional(),
  new_referring_domains: z.number().nullable().optional(),
  lost_referring_domains: z.number().nullable().optional()
}).passthrough();
function buildCommonPayload(input) {
  return {
    target: input.target,
    include_subdomains: input.includeSubdomains ?? true,
    include_indirect_links: true,
    exclude_internal_backlinks: true,
    backlinks_status_type: "live",
    rank_scale: "one_hundred"
  };
}
const assertOptions$1 = (path) => ({ classify: classifyBacklinksError, classifyPath: path });
function combineFilters(userFilters, spamCondition) {
  const merged = [];
  if (userFilters && userFilters.length > 0) merged.push(...userFilters);
  if (spamCondition) {
    if (merged.length > 0) merged.push("and");
    merged.push(spamCondition);
  }
  return merged.length > 0 ? merged : void 0;
}
async function fetchBacklinksSummary(input) {
  const response = await backlinksApi(classifyBacklinksError).summaryLive([
    new BacklinksSummaryLiveRequestInfo(buildCommonPayload(input))
  ]);
  const task = assertOk(response, assertOptions$1("/v3/backlinks/summary/live"));
  const firstResult2 = task.result?.[0];
  if (firstResult2) {
    const parsed = backlinksSummaryItemSchema.safeParse(firstResult2);
    if (!parsed.success) {
      console.error(
        "dataforseo.backlinks-summary-live.invalid-result",
        parsed.error.issues.slice(0, 5)
      );
      throw new AppError(
        "INTERNAL_ERROR",
        "DataForSEO backlinks-summary-live returned an invalid response shape"
      );
    }
    return {
      data: parsed.data,
      billing: buildTaskBilling(task)
    };
  }
  return {
    data: {},
    billing: buildTaskBilling(task)
  };
}
async function fetchBacklinksRows(input) {
  const spamFilterOptions = normalizeBacklinksSpamFilterOptions(input);
  const filters = combineFilters(
    input.filters,
    spamFilterOptions.hideSpam ? ["backlink_spam_score", "<=", spamFilterOptions.spamThreshold] : void 0
  );
  const response = await backlinksApi(classifyBacklinksError).backlinksLive([
    new BacklinksBacklinksLiveRequestInfo({
      ...buildCommonPayload(input),
      limit: input.limit ?? 100,
      offset: input.offset,
      order_by: input.orderBy ?? ["rank,desc"],
      mode: input.mode,
      ...filters ? { filters } : {}
    })
  ]);
  const task = assertOk(
    response,
    assertOptions$1("/v3/backlinks/backlinks/live")
  );
  return {
    data: {
      items: parseTaskItems("backlinks-live", task, backlinksItemSchema),
      totalCount: parseTaskTotalCount(task)
    },
    billing: buildTaskBilling(task)
  };
}
async function fetchReferringDomains(input) {
  const spamFilterOptions = normalizeBacklinksSpamFilterOptions(input);
  const filters = combineFilters(
    input.filters,
    spamFilterOptions.hideSpam ? ["backlinks_spam_score", "<=", spamFilterOptions.spamThreshold] : void 0
  );
  const response = await backlinksApi(
    classifyBacklinksError
  ).referringDomainsLive([
    new BacklinksReferringDomainsLiveRequestInfo({
      ...buildCommonPayload(input),
      limit: input.limit ?? 100,
      offset: input.offset,
      order_by: input.orderBy ?? ["backlinks,desc"],
      ...filters ? { filters } : {}
    })
  ]);
  const task = assertOk(
    response,
    assertOptions$1("/v3/backlinks/referring_domains/live")
  );
  return {
    data: {
      items: parseTaskItems(
        "referring-domains-live",
        task,
        referringDomainItemSchema
      ),
      totalCount: parseTaskTotalCount(task)
    },
    billing: buildTaskBilling(task)
  };
}
async function fetchDomainPagesSummary(input) {
  const filters = input.filters && input.filters.length > 0 ? input.filters : void 0;
  const response = await backlinksApi(
    classifyBacklinksError
  ).domainPagesSummaryLive([
    new BacklinksDomainPagesSummaryLiveRequestInfo({
      ...buildCommonPayload(input),
      limit: input.limit ?? 100,
      offset: input.offset,
      order_by: input.orderBy ?? ["backlinks,desc"],
      ...filters ? { filters } : {}
    })
  ]);
  const task = assertOk(
    response,
    assertOptions$1("/v3/backlinks/domain_pages_summary/live")
  );
  return {
    data: {
      items: parseTaskItems(
        "domain-pages-summary-live",
        task,
        domainPageSummaryItemSchema
      ),
      totalCount: parseTaskTotalCount(task)
    },
    billing: buildTaskBilling(task)
  };
}
async function fetchBacklinksHistory(input) {
  const response = await backlinksApi(classifyBacklinksError).historyLive([
    new BacklinksHistoryLiveRequestInfo({
      target: input.target,
      date_from: input.dateFrom,
      date_to: input.dateTo,
      rank_scale: "one_hundred"
    })
  ]);
  const task = assertOk(response, assertOptions$1("/v3/backlinks/history/live"));
  return {
    data: parseTaskItems(
      "backlinks-history-live",
      task,
      backlinksHistoryItemSchema
    ),
    billing: buildTaskBilling(task)
  };
}
const rankedSerpItemSchema = z.object({
  url: z.string().nullable().optional(),
  relative_url: z.string().nullable().optional(),
  rank_absolute: z.number().nullable().optional(),
  etv: z.number().nullable().optional()
}).passthrough();
const domainRankedKeywordItemSchema = z.object({
  keyword_data: z.object({
    keyword: z.string().nullable().optional(),
    keyword_info: z.object({
      search_volume: z.number().nullable().optional(),
      cpc: z.number().nullable().optional(),
      keyword_difficulty: z.number().nullable().optional()
    }).passthrough().nullable().optional(),
    keyword_properties: z.object({
      keyword_difficulty: z.number().nullable().optional()
    }).passthrough().nullable().optional()
  }).passthrough().nullable().optional(),
  ranked_serp_element: z.object({
    serp_item: rankedSerpItemSchema.nullable().optional(),
    url: z.string().nullable().optional(),
    relative_url: z.string().nullable().optional(),
    rank_absolute: z.number().nullable().optional(),
    etv: z.number().nullable().optional()
  }).passthrough().nullable().optional(),
  keyword: z.string().nullable().optional()
}).passthrough();
async function fetchRelatedKeywords(input) {
  const response = await labsApi().googleRelatedKeywordsLive([
    new DataforseoLabsGoogleRelatedKeywordsLiveRequestInfo({
      keyword: input.keyword,
      location_code: input.locationCode,
      language_code: input.languageCode,
      limit: input.limit,
      depth: input.depth ?? 3,
      // Clickstream-refined volumes DOUBLE the request cost, so they are
      // opt-in — see specs/0004-keyword-data-source-routing.md.
      include_clickstream_data: input.includeClickstreamData ?? false,
      include_serp_info: false
    })
  ]);
  const task = assertOk(response);
  return {
    data: task.result?.[0]?.items ?? [],
    billing: buildTaskBilling(task)
  };
}
async function fetchKeywordSuggestions(input) {
  const response = await labsApi().googleKeywordSuggestionsLive([
    new DataforseoLabsGoogleKeywordSuggestionsLiveRequestInfo({
      keyword: input.keyword,
      location_code: input.locationCode,
      language_code: input.languageCode,
      limit: input.limit,
      include_clickstream_data: input.includeClickstreamData ?? false,
      include_serp_info: false,
      include_seed_keyword: true,
      ignore_synonyms: false,
      exact_match: false
    })
  ]);
  const task = assertOk(response);
  return {
    data: task.result?.[0]?.items ?? [],
    billing: buildTaskBilling(task)
  };
}
async function fetchKeywordIdeas(input) {
  const response = await labsApi().googleKeywordIdeasLive([
    new DataforseoLabsGoogleKeywordIdeasLiveRequestInfo({
      keywords: [input.keyword],
      location_code: input.locationCode,
      language_code: input.languageCode,
      limit: input.limit,
      include_clickstream_data: input.includeClickstreamData ?? false,
      include_serp_info: false,
      ignore_synonyms: false,
      closely_variants: false
    })
  ]);
  const task = assertOk(response);
  return {
    data: task.result?.[0]?.items ?? [],
    billing: buildTaskBilling(task)
  };
}
async function fetchDomainRankOverview(input) {
  const response = await labsApi().googleDomainRankOverviewLive([
    new DataforseoLabsGoogleDomainRankOverviewLiveRequestInfo({
      target: input.target,
      location_code: input.locationCode,
      language_code: input.languageCode,
      limit: 1
    })
  ]);
  const task = assertOk(response);
  return {
    data: task.result?.[0]?.items ?? [],
    billing: buildTaskBilling(task)
  };
}
async function fetchRankedKeywords(input) {
  const response = await labsApi().googleRankedKeywordsLive([
    new DataforseoLabsGoogleRankedKeywordsLiveRequestInfo({
      target: input.target,
      location_code: input.locationCode,
      language_code: input.languageCode,
      limit: input.limit,
      offset: input.offset,
      order_by: input.orderBy,
      filters: input.filters,
      item_types: input.itemTypes
    })
  ]);
  const task = assertOk(response);
  return {
    data: {
      items: parseTaskItems(
        "google-ranked-keywords-live",
        task,
        domainRankedKeywordItemSchema
      ),
      totalCount: task.result?.[0]?.total_count ?? null
    },
    billing: buildTaskBilling(task)
  };
}
async function fetchRelevantPages(input) {
  const response = await labsApi().googleRelevantPagesLive([
    new DataforseoLabsGoogleRelevantPagesLiveRequestInfo({
      target: input.target,
      location_code: input.locationCode,
      language_code: input.languageCode,
      limit: input.limit,
      offset: input.offset,
      order_by: input.orderBy,
      filters: input.filters
    })
  ]);
  const task = assertOk(response);
  return {
    data: {
      items: task.result?.[0]?.items ?? [],
      totalCount: task.result?.[0]?.total_count ?? null
    },
    billing: buildTaskBilling(task)
  };
}
async function fetchKeywordOverview(input) {
  const response = await labsApi().googleKeywordOverviewLive([
    new DataforseoLabsGoogleKeywordOverviewLiveRequestInfo({
      keywords: input.keywords,
      location_code: input.locationCode,
      language_code: input.languageCode,
      include_clickstream_data: input.includeClickstreamData ?? false
    })
  ]);
  const task = assertOk(response);
  return {
    data: task.result?.[0]?.items ?? [],
    billing: buildTaskBilling(task)
  };
}
async function fetchSerpCompetitors(input) {
  const response = await labsApi().googleSerpCompetitorsLive([
    new DataforseoLabsGoogleSerpCompetitorsLiveRequestInfo({
      keywords: input.keywords,
      location_code: input.locationCode,
      language_code: input.languageCode,
      item_types: input.itemTypes,
      include_subdomains: input.includeSubdomains,
      limit: input.limit,
      offset: input.offset
    })
  ]);
  const task = assertOk(response);
  return {
    data: task.result?.[0]?.items ?? [],
    billing: buildTaskBilling(task)
  };
}
function taskItems(task) {
  return task.result ?? [];
}
async function fetchAdsSearchVolume(input) {
  const locationParams2 = input.locationName ? { location_name: input.locationName } : { location_code: input.locationCode };
  const response = await keywordsDataApi().googleAdsSearchVolumeLive([
    new KeywordsDataGoogleAdsSearchVolumeLiveRequestInfo({
      keywords: input.keywords,
      ...locationParams2,
      language_code: input.languageCode
    })
  ]);
  const task = assertOk(response);
  return {
    data: taskItems(task),
    billing: buildTaskBilling(task)
  };
}
async function fetchAdsKeywordIdeas(input) {
  const response = await keywordsDataApi().googleAdsKeywordsForKeywordsLive([
    new KeywordsDataGoogleAdsKeywordsForKeywordsLiveRequestInfo({
      keywords: [input.keyword],
      location_code: input.locationCode,
      language_code: input.languageCode,
      sort_by: "search_volume"
    })
  ]);
  const task = assertOk(response);
  return {
    data: taskItems(task).slice(0, input.limit),
    billing: buildTaskBilling(task)
  };
}
function clampSerpDepth(depth) {
  return Math.min(100, Math.max(10, depth));
}
function stopCrawlOnTarget(targetDomain) {
  return {
    stop_crawl_on_match: [
      new SerpApiStopCrawlOnMatchInfo({
        match_value: targetDomain,
        match_type: "with_subdomains"
      })
    ],
    find_targets_in: ["organic"]
  };
}
const serpSnapshotItemSchema = z.object({
  type: z.string(),
  rank_group: z.number().nullable().optional(),
  rank_absolute: z.number().nullable().optional(),
  domain: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  url: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  breadcrumb: z.string().nullable().optional(),
  etv: z.number().nullable().optional(),
  estimated_paid_traffic_cost: z.number().nullable().optional(),
  backlinks_info: z.object({
    referring_domains: z.number().nullable().optional(),
    backlinks: z.number().nullable().optional()
  }).passthrough().nullable().optional(),
  rank_changes: z.object({
    previous_rank_absolute: z.number().nullable().optional(),
    is_new: z.boolean().nullable().optional(),
    is_up: z.boolean().nullable().optional(),
    is_down: z.boolean().nullable().optional()
  }).passthrough().nullable().optional()
}).passthrough();
async function fetchLiveSerp(input) {
  const response = await serpApi().googleOrganicLiveAdvanced([
    new SerpGoogleOrganicLiveAdvancedRequestInfo({
      keyword: input.keyword,
      location_code: input.locationCode,
      language_code: input.languageCode,
      device: "desktop",
      os: "windows",
      depth: 100
    })
  ]);
  const task = assertOk(response);
  return {
    data: parseTaskItems(
      "google-organic-live-advanced",
      task,
      serpSnapshotItemSchema
    ),
    billing: buildTaskBilling(task)
  };
}
function buildRankCheckResult(input, items) {
  const target = input.targetDomain.toLowerCase();
  const organicMatch = items.find((item) => {
    if (item.type !== "organic" || item.domain == null) return false;
    const domain = item.domain.toLowerCase();
    return domain === target || domain.endsWith(`.${target}`);
  });
  return {
    keywordId: input.keywordId,
    keyword: input.keyword,
    // rank_group = position among organic results only (what users count as
    // "my ranking"). rank_absolute would also count SERP features (local
    // pack, PAA, AI overviews) and reads as worse than what users see.
    position: organicMatch ? organicMatch.rank_group ?? organicMatch.rank_absolute ?? null : null,
    url: organicMatch?.url ?? null,
    serpFeatures: [...new Set(items.map((item) => item.type).filter(Boolean))]
  };
}
async function fetchRankCheckSerp(input) {
  const depth = clampSerpDepth(input.depth);
  const locationParams2 = input.locationName ? { location_name: input.locationName } : { location_code: input.locationCode };
  const response = await serpApi().googleOrganicLiveAdvanced([
    new SerpGoogleOrganicLiveAdvancedRequestInfo({
      keyword: input.keyword,
      ...locationParams2,
      language_code: input.languageCode,
      device: input.device,
      os: input.device === "desktop" ? "windows" : "android",
      depth,
      ...stopCrawlOnTarget(input.targetDomain)
    })
  ]);
  const task = assertOk(response, { treatNoResultsAsEmpty: true });
  const items = parseTaskItems(
    "google-organic-live-advanced",
    task,
    serpSnapshotItemSchema
  );
  return {
    data: buildRankCheckResult(input, items),
    billing: buildTaskBilling(task)
  };
}
async function postRankCheckTasks(input) {
  if (input.tasks.length === 0 || input.tasks.length > MAX_TASKS_PER_POST) {
    throw new AppError(
      "INTERNAL_ERROR",
      `task_post accepts 1-${MAX_TASKS_PER_POST} tasks, got ${input.tasks.length}`
    );
  }
  const depth = clampSerpDepth(input.depth);
  const locationParams2 = input.locationName ? { location_name: input.locationName } : { location_code: input.locationCode };
  const response = await serpApi().googleOrganicTaskPost(
    input.tasks.map(
      (task) => new SerpGoogleOrganicTaskPostRequestInfo({
        keyword: task.keyword,
        ...locationParams2,
        language_code: input.languageCode,
        device: task.device,
        os: task.device === "desktop" ? "windows" : "android",
        depth,
        // Queued tasks are billed provisionally at full depth at post time;
        // task_get later reports the reduced actual cost when the crawl
        // stopped early. We meter customers on the post-time amount —
        // collection-time metering is a possible future optimization.
        ...stopCrawlOnTarget(input.targetDomain),
        // Echoed back on the response entry and task_get; used to map a
        // DataForSEO task id back to our keyword without relying on order.
        tag: `${task.keywordId}:${task.device}`
      })
    )
  );
  if (!response || response.status_code !== 2e4) {
    throw new AppError(
      "INTERNAL_ERROR",
      response?.status_message || "DataForSEO task_post failed"
    );
  }
  const byTag = new Map(
    input.tasks.map((task) => [`${task.keywordId}:${task.device}`, task])
  );
  const posted = [];
  let costUsd = 0;
  for (const entry of response.tasks ?? []) {
    costUsd += entry.cost ?? 0;
    const tag = entry.data?.tag;
    const task = typeof tag === "string" ? byTag.get(tag) : void 0;
    if (entry.status_code !== 20100 || !entry.id || !task) {
      console.warn(
        `dataforseo.task_post.rejected-entry (${entry.status_code}): ${entry.status_message}`
      );
      continue;
    }
    posted.push({ ...task, taskId: entry.id });
  }
  return {
    data: posted,
    billing: {
      path: ["v3", "serp", "google", "organic", "task_post"],
      costUsd
    }
  };
}
async function fetchRankCheckTaskResult(input) {
  const response = await serpApi().googleOrganicTaskGetAdvanced(input.taskId);
  const task = response?.tasks?.[0];
  if (!response || response.status_code !== 2e4 || !task) {
    throw new AppError(
      "INTERNAL_ERROR",
      response?.status_message || "DataForSEO task_get failed"
    );
  }
  if (isTaskInProgress(task)) {
    return { status: "pending" };
  }
  if (task.status_code !== 2e4) {
    if (!isNoResultsTask(task)) {
      return {
        status: "failed",
        message: task.status_message || `DataForSEO task failed (${task.status_code})`
      };
    }
    return {
      status: "completed",
      result: buildRankCheckResult(input, [])
    };
  }
  const items = parseTaskItems(
    "google-organic-task-get-advanced",
    task,
    serpSnapshotItemSchema
  );
  return { status: "completed", result: buildRankCheckResult(input, items) };
}
async function fetchLocalSerp(input) {
  const os = input.device === "desktop" ? "windows" : "android";
  if (input.searchType === "maps") {
    const response2 = await serpApi().googleMapsLiveAdvanced([
      new SerpGoogleMapsLiveAdvancedRequestInfo({
        keyword: input.keyword,
        location_coordinate: input.locationCoordinate,
        language_code: input.languageCode,
        device: input.device,
        os,
        depth: input.depth,
        search_places: input.searchPlaces
      })
    ]);
    const task2 = assertOk(response2, { treatNoResultsAsEmpty: true });
    return {
      data: task2.result?.[0]?.items ?? [],
      billing: buildTaskBilling(task2)
    };
  }
  const response = await serpApi().googleLocalFinderLiveAdvanced([
    new SerpGoogleLocalFinderLiveAdvancedRequestInfo({
      keyword: input.keyword,
      location_coordinate: input.locationCoordinate,
      language_code: input.languageCode,
      device: input.device,
      os,
      depth: input.depth
    })
  ]);
  const task = assertOk(response, { treatNoResultsAsEmpty: true });
  return {
    data: task.result?.[0]?.items ?? [],
    billing: buildTaskBilling(task)
  };
}
const requestCategories = [
  "performance",
  "accessibility",
  "best_practices",
  "seo"
];
const lighthouseAuditItemsSchema = z.union([
  z.array(z.record(z.string(), z.unknown())),
  z.record(z.string(), z.unknown())
]).transform((items) => Array.isArray(items) ? items : [items]);
const lighthouseAuditSchema = z.object({
  score: z.number().nullable().optional(),
  displayValue: z.string().optional(),
  numericValue: z.number().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  scoreDisplayMode: z.string().optional(),
  details: z.object({
    overallSavingsMs: z.number().optional(),
    overallSavingsBytes: z.number().optional(),
    items: lighthouseAuditItemsSchema.optional()
  }).passthrough().optional()
}).passthrough();
const lighthouseCategorySchema = z.object({
  score: z.number().nullable().optional(),
  auditRefs: z.array(
    z.object({
      id: z.string().optional()
    }).passthrough()
  ).optional()
}).passthrough();
const lighthouseResponseSchema = z.object({
  requestedUrl: z.string().optional(),
  finalUrl: z.string().optional(),
  lighthouseVersion: z.string().optional(),
  categories: z.record(z.string(), lighthouseCategorySchema).optional().default({}),
  audits: z.record(z.string(), lighthouseAuditSchema).optional().default({})
}).passthrough();
const dataforseoTaskSchema = z.object({
  id: z.string().optional(),
  cost: z.number().optional(),
  status_code: z.number().optional(),
  status_message: z.string().optional(),
  result: z.array(lighthouseResponseSchema).optional()
}).passthrough();
const dataforseoLighthouseResponseSchema = z.object({
  status_code: z.number().optional(),
  status_message: z.string().optional(),
  tasks: z.array(dataforseoTaskSchema).optional()
}).passthrough();
function summarizeZodIssues(error, maxIssues = 3) {
  return error.issues.slice(0, maxIssues).map((issue) => {
    const path = issue.path.length > 0 ? issue.path.join(".") : "<root>";
    return `${path}: ${issue.message}`;
  }).join("; ");
}
function parseDataforseoLighthousePayload(payload, input) {
  const parsed = dataforseoLighthouseResponseSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error(
      `DataForSEO Lighthouse returned an invalid response: ${summarizeZodIssues(parsed.error)}`
    );
  }
  if (parsed.data.status_code !== 2e4) {
    throw new Error(
      parsed.data.status_message ?? "DataForSEO Lighthouse request failed"
    );
  }
  const task = parsed.data.tasks?.[0];
  if (!task) {
    throw new Error("DataForSEO Lighthouse response missing task");
  }
  if (task.status_code !== 2e4) {
    throw new Error(task.status_message ?? "DataForSEO Lighthouse task failed");
  }
  const result = task.result?.[0];
  if (!result) {
    throw new Error("DataForSEO Lighthouse response missing result");
  }
  const fetchedAt = (/* @__PURE__ */ new Date()).toISOString();
  const categories = result.categories ?? {};
  const audits = result.audits ?? {};
  const issueReport = buildStoredLighthouseIssues({ audits, categories });
  const metrics = buildStoredLighthouseMetrics({ audits });
  const storedPayload = {
    version: 2,
    source: "dataforseo-lighthouse",
    hasIssueDetails: issueReport.hasIssueDetails,
    metadata: {
      requestedUrl: result.requestedUrl ?? input.url,
      finalUrl: result.finalUrl ?? input.url,
      strategy: input.strategy,
      fetchedAt,
      lighthouseVersion: result.lighthouseVersion ?? null,
      taskId: task.id ?? null,
      cost: task.cost ?? null
    },
    scores: {
      performance: scoreToPercent(categories.performance?.score),
      accessibility: scoreToPercent(categories.accessibility?.score),
      "best-practices": scoreToPercent(categories["best-practices"]?.score),
      seo: scoreToPercent(categories.seo?.score)
    },
    metrics,
    issues: issueReport.issues
  };
  const allScoresMissing = Object.values(storedPayload.scores).every(
    (score) => score == null
  );
  if (allScoresMissing) {
    throw new Error(
      `DataForSEO Lighthouse returned no category scores for ${storedPayload.metadata.finalUrl}`
    );
  }
  return storedPayload;
}
async function fetchLighthouseResult(input) {
  const response = await onPageApi().lighthouseLiveJson([
    new OnPageLighthouseLiveJsonRequestInfo({
      url: input.url,
      for_mobile: input.strategy === "mobile",
      categories: [...requestCategories]
    })
  ]);
  const task = assertOk(response);
  const billing = buildTaskBilling(task);
  try {
    const data = parseDataforseoLighthousePayload(response, input);
    return { data, billing };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new DataforseoChargedTaskError(message, billing);
  }
}
const monthlyVolumeSchema = z.object({
  year: z.number().int(),
  month: z.number().int().min(1).max(12),
  search_volume: z.number().nullable().optional()
}).passthrough();
const mentionSourceSchema = z.object({
  url: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  domain: z.string().nullable().optional()
}).passthrough();
const brandEntitySchema = z.object({
  title: z.string().nullable().optional()
}).passthrough();
const llmMentionItemSchema = z.object({
  question: z.string().nullable().optional(),
  sources: z.array(mentionSourceSchema).nullable().optional(),
  ai_search_volume: z.number().nullable().optional(),
  monthly_searches: z.array(monthlyVolumeSchema).nullable().optional(),
  first_response_at: z.string().nullable().optional(),
  last_response_at: z.string().nullable().optional(),
  brand_entities: z.array(brandEntitySchema).nullable().optional()
}).passthrough();
const groupElementSchema = z.object({
  type: z.string().nullable().optional(),
  key: z.string().nullable().optional(),
  mentions: z.number().nullable().optional(),
  ai_search_volume: z.number().nullable().optional(),
  impressions: z.number().nullable().optional()
}).passthrough();
const llmAggregatedTotalSchema = z.object({
  platform: z.array(groupElementSchema).nullable().optional()
}).passthrough();
const llmTopPagesItemSchema = z.object({
  key: z.string().nullable().optional(),
  platform: z.array(groupElementSchema).nullable().optional()
}).passthrough();
const llmCrossAggregatedItemSchema = z.object({
  // The shared SDK type AiOptimizationLlmMentionssLiveItem documents `key` as
  // the URL of a found page, but for cross_aggregated `key` is the request
  // aggregation_key (the brand label).
  key: z.string().nullable().optional(),
  platform: z.array(groupElementSchema).nullable().optional()
}).passthrough();
const responseAnnotationSchema = z.object({
  type: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  url: z.string().nullable().optional()
}).passthrough();
const responseSectionSchema = z.object({
  type: z.string().nullable().optional(),
  text: z.string().nullable().optional(),
  annotations: z.array(responseAnnotationSchema).nullable().optional()
}).passthrough();
const responseItemSchema = z.object({
  type: z.string().nullable().optional(),
  sections: z.array(responseSectionSchema).nullable().optional()
}).passthrough();
const llmResponseResultSchema = z.object({
  model_name: z.string().nullable().optional(),
  output_tokens: z.number().nullable().optional(),
  web_search: z.boolean().nullable().optional(),
  items: z.array(responseItemSchema).nullable().optional(),
  fan_out_queries: z.array(z.string()).nullable().optional()
}).passthrough();
const classifyAiSearchError = createDataforseoBillingClassifier({
  pathPrefix: "/ai_optimization/",
  billingIssueCode: "AI_SEARCH_BILLING_ISSUE",
  billingIssueMessage: "The connected DataForSEO account has a billing or balance issue"
});
const assertOptions = (path) => ({ classify: classifyAiSearchError, classifyPath: path });
function clampLimit(value, min, max) {
  return Math.min(max, Math.max(min, Math.floor(value)));
}
function targetList(target) {
  return [
    "domain" in target ? new AiOptimizationLLmMentionsDomainElement(target) : new AiOptimizationLLmMentionsKeywordElement(target)
  ];
}
function firstResult(task) {
  const first = task.result?.[0];
  return isRecord(first) ? first : null;
}
async function fetchLlmMentionsSearch(input) {
  const response = await aiOptimizationApi(
    classifyAiSearchError
  ).llmMentionsSearchLive([
    new AiOptimizationLlmMentionsSearchLiveRequestInfo({
      target: targetList(input.target),
      platform: input.platform,
      location_code: input.locationCode,
      language_code: input.languageCode,
      limit: clampLimit(input.limit ?? 100, 1, 1e3)
    })
  ]);
  const task = assertOk(
    response,
    assertOptions("/v3/ai_optimization/llm_mentions/search/live")
  );
  const items = z.array(llmMentionItemSchema).safeParse(firstResult(task)?.items ?? []);
  if (!items.success) {
    throw new AppError(
      "INTERNAL_ERROR",
      "DataForSEO llm_mentions/search returned an invalid mention items shape"
    );
  }
  return { data: items.data, billing: buildTaskBilling(task) };
}
async function fetchLlmAggregatedMetrics(input) {
  const response = await aiOptimizationApi(
    classifyAiSearchError
  ).llmMentionsAggregatedMetricsLive([
    new AiOptimizationLlmMentionsAggregatedMetricsLiveRequestInfo({
      target: targetList(input.target),
      platform: input.platform,
      location_code: input.locationCode,
      language_code: input.languageCode,
      internal_list_limit: clampLimit(input.internalListLimit ?? 10, 1, 20)
    })
  ]);
  const task = assertOk(
    response,
    assertOptions("/v3/ai_optimization/llm_mentions/aggregated_metrics/live")
  );
  const total = llmAggregatedTotalSchema.safeParse(
    firstResult(task)?.total ?? {}
  );
  if (!total.success) {
    throw new AppError(
      "INTERNAL_ERROR",
      "DataForSEO llm_mentions/aggregated_metrics returned an invalid shape"
    );
  }
  return { data: total.data, billing: buildTaskBilling(task) };
}
async function fetchLlmTopPages(input) {
  const response = await aiOptimizationApi(
    classifyAiSearchError
  ).llmMentionsTopPagesLive([
    new AiOptimizationLlmMentionsTopPagesLiveRequestInfo({
      target: targetList(input.target),
      platform: input.platform,
      location_code: input.locationCode,
      language_code: input.languageCode,
      links_scope: "sources",
      items_list_limit: clampLimit(input.itemsListLimit ?? 10, 1, 10),
      internal_list_limit: 5
    })
  ]);
  const task = assertOk(
    response,
    assertOptions("/v3/ai_optimization/llm_mentions/top_pages/live")
  );
  const items = z.array(llmTopPagesItemSchema).safeParse(firstResult(task)?.items ?? []);
  if (!items.success) {
    throw new AppError(
      "INTERNAL_ERROR",
      "DataForSEO llm_mentions/top_pages returned an invalid shape"
    );
  }
  return { data: items.data, billing: buildTaskBilling(task) };
}
async function fetchLlmCrossAggregatedMetrics(input) {
  if (input.groups.length < 2 || input.groups.length > 10) {
    throw new AppError(
      "VALIDATION_ERROR",
      "DataForSEO llm_mentions/cross_aggregated_metrics requires 2 to 10 target groups"
    );
  }
  const response = await aiOptimizationApi(
    classifyAiSearchError
  ).llmMentionsCrossAggregatedMetricsLive([
    new AiOptimizationLlmMentionsCrossAggregatedMetricsLiveRequestInfo({
      targets: input.groups.map(
        (group) => new AiOptimizationLLmMentionsCrossAggregateMetricsTargetInfo({
          aggregation_key: group.key,
          target: targetList(group.target)
        })
      ),
      platform: input.platform,
      location_code: input.locationCode,
      language_code: input.languageCode,
      internal_list_limit: clampLimit(input.internalListLimit ?? 5, 1, 10)
    })
  ]);
  const task = assertOk(
    response,
    assertOptions(
      "/v3/ai_optimization/llm_mentions/cross_aggregated_metrics/live"
    )
  );
  const items = z.array(llmCrossAggregatedItemSchema).safeParse(firstResult(task)?.items ?? []);
  if (!items.success) {
    throw new AppError(
      "INTERNAL_ERROR",
      "DataForSEO llm_mentions/cross_aggregated_metrics returned an invalid shape"
    );
  }
  return { data: items.data, billing: buildTaskBilling(task) };
}
const ACCEPTED_LLM_MODEL_NAMES = {
  chat_gpt: /* @__PURE__ */ new Set(["gpt-5"]),
  claude: /* @__PURE__ */ new Set(["claude-sonnet-4-5", "claude-sonnet-4-6"]),
  gemini: /* @__PURE__ */ new Set(["gemini-2.5-pro"]),
  perplexity: /* @__PURE__ */ new Set(["sonar-reasoning-pro", "sonar-pro", "sonar"])
};
function buildPerplexityLlmResponseRequest(fields) {
  return {
    ...fields,
    init(data) {
      if (isRecord(data)) Object.assign(this, data);
    },
    toJSON(data) {
      return {
        ...isRecord(data) ? data : {},
        ...fields
      };
    }
  };
}
async function fetchLlmResponse(input) {
  if (!ACCEPTED_LLM_MODEL_NAMES[input.modelSlug].has(input.modelName)) {
    throw new AppError(
      "VALIDATION_ERROR",
      `Unsupported DataForSEO model_name "${input.modelName}" for ${input.modelSlug}`
    );
  }
  const supportsCountry = input.modelSlug !== "gemini";
  const fields = {
    user_prompt: input.userPrompt,
    model_name: input.modelName,
    web_search: input.webSearch ?? true,
    max_output_tokens: clampLimit(input.maxOutputTokens ?? 1024, 256, 4096),
    ...supportsCountry && input.webSearchCountryCode ? { web_search_country_iso_code: input.webSearchCountryCode } : {}
  };
  const api = aiOptimizationApi(classifyAiSearchError);
  const response = input.modelSlug === "chat_gpt" ? await api.chatGptLlmResponsesLive([
    new AiOptimizationChatGptLlmResponsesLiveRequestInfo(fields)
  ]) : input.modelSlug === "claude" ? await api.claudeLlmResponsesLive([
    new AiOptimizationClaudeLlmResponsesLiveRequestInfo(fields)
  ]) : input.modelSlug === "gemini" ? await api.geminiLlmResponsesLive([
    new AiOptimizationGeminiLlmResponsesLiveRequestInfo(fields)
  ]) : await api.perplexityLlmResponsesLive([
    // The generated Perplexity request class drops `web_search` in
    // toJSON(), while the SDK method only JSON.stringify's this body.
    buildPerplexityLlmResponseRequest(fields)
  ]);
  const task = assertOk(
    response,
    assertOptions(`/v3/ai_optimization/${input.modelSlug}/llm_responses/live`)
  );
  const result = llmResponseResultSchema.safeParse(firstResult(task) ?? {});
  if (!result.success) {
    throw new AppError(
      "INTERNAL_ERROR",
      "DataForSEO llm_responses returned an invalid response shape"
    );
  }
  return { data: result.data, billing: buildTaskBilling(task) };
}
export {
  fetchAdsKeywordIdeas,
  fetchAdsSearchVolume,
  fetchBacklinksHistory,
  fetchBacklinksRows,
  fetchBacklinksSummary,
  fetchBusinessDataTaskResult,
  fetchBusinessListingsCategories,
  fetchBusinessListingsSearch,
  fetchDomainPagesSummary,
  fetchDomainRankOverview,
  fetchKeywordIdeas,
  fetchKeywordOverview,
  fetchKeywordSuggestions,
  fetchLighthouseResult,
  fetchLiveSerp,
  fetchLlmAggregatedMetrics,
  fetchLlmCrossAggregatedMetrics,
  fetchLlmMentionsSearch,
  fetchLlmResponse,
  fetchLlmTopPages,
  fetchLocalSerp,
  fetchMyBusinessInfo,
  fetchQuestionsAnswers,
  fetchRankCheckSerp,
  fetchRankCheckTaskResult,
  fetchRankedKeywords,
  fetchReferringDomains,
  fetchRelatedKeywords,
  fetchRelevantPages,
  fetchSerpCompetitors,
  postGoogleReviewsTask,
  postMyBusinessUpdatesTask,
  postRankCheckTasks
};
