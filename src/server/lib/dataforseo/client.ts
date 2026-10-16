import { meterDataforseoCall, meterDataforseoCalls } from "./metering";

import { postMapsTasks } from "./maps-tasks";
import { fetchChatGptScrape, fetchGoogleAiModeScrape } from "./llm-scraper";

import {
  type CreditFeature,
  mapDataforseoPathToCreditFeature,
} from "@/shared/billing-credit-features";
import { creditsForProviderUsd } from "@/shared/billing";

import type { BillingCustomerContext } from "@/server/billing/subscription";
import { type DataforseoApiResponse } from "@/server/lib/dataforseo/envelope";
import { dataforseoPricing } from "@/server/lib/dataforseo/pricing";
import {
  fetchBusinessListingsSearch,
  fetchMyBusinessInfo,
  fetchQuestionsAnswers,
  postMyBusinessInfoTask,
  postGoogleReviewsTask,
  postMyBusinessUpdatesTask,
} from "@/server/lib/dataforseo/business";
import {
  fetchBacklinksHistory,
  fetchBacklinksRows,
  fetchBacklinksSummary,
  fetchDomainPagesSummary,
  fetchReferringDomains,
} from "@/server/lib/dataforseo/backlinks";
import {
  fetchDomainIntersection,
  fetchHistoricalRankOverview,
  fetchKeywordsForSite,
  fetchDomainRankOverview,
  fetchKeywordIdeas,
  fetchKeywordOverview,
  fetchKeywordSuggestions,
  fetchRankedKeywords,
  fetchRelatedKeywords,
  fetchRelevantPages,
  fetchSerpCompetitors,
} from "@/server/lib/dataforseo/labs";
import {
  fetchAdsKeywordIdeas,
  fetchAdsSearchVolume,
} from "@/server/lib/dataforseo/google-ads";
import {
  fetchAutocomplete,
  fetchLiveSerp,
  fetchLocalSerp,
  fetchRankCheckSerp,
  postLocalSerpTasks,
  postRankCheckTasks,
} from "@/server/lib/dataforseo/serp";
import { fetchLighthouseResult } from "@/server/lib/dataforseo/lighthouse";
import {
  fetchLlmAggregatedMetrics,
  fetchLlmCrossAggregatedMetrics,
  fetchLlmMentionsSearch,
  fetchLlmResponse,
  fetchLlmTopPages,
} from "@/server/lib/dataforseo/ai";
import {
  fetchAiTrackingLiveAnswer,
  postAiTrackingTasks,
} from "@/server/lib/dataforseo/ai-tracking";

export { mapDataforseoPathToCreditFeature };

/**
 * Wraps a section fetcher with billing metering. Each entry on the client is
 * `meter(customer, fetchX, dataforseoPricing.section.x, defaultFeature?)`,
 * which returns a function with the fetcher's own input type and resolves to
 * its unwrapped `.data`.
 *
 * `estimateRawUsd` is required: it is the upper bound reserved before the
 * call, so an entry cannot be added without a price (see pricing.ts).
 *
 * `defaultFeature` is the fallback credit feature; a caller can override it per
 * call by passing `creditFeature` in the input (e.g. an MCP tool attributing
 * spend to its own feature). The extra field is ignored by the fetchers, which
 * read named fields rather than spreading the input.
 */
function meter<I, T>(
  customer: BillingCustomerContext,
  fetcher: (input: I) => Promise<DataforseoApiResponse<T>>,
  estimateRawUsd: (input: I) => number,
  defaultFeature?: CreditFeature,
): (input: I & { creditFeature?: CreditFeature }) => Promise<T> {
  return (input) =>
    meterDataforseoCall(
      customer,
      () => fetcher(input),
      creditsForProviderUsd(estimateRawUsd(input)),
      input.creditFeature ?? defaultFeature,
    );
}

export function createDataforseoClient(customer: BillingCustomerContext) {
  return {
    business: {
      myBusinessInfoTaskPost: meter(
        customer,
        postMyBusinessInfoTask,
        dataforseoPricing.business.myBusinessInfoTaskPost,
        "local_seo",
      ),
      businessListings: meter(
        customer,
        fetchBusinessListingsSearch,
        dataforseoPricing.business.businessListings,
        "local_seo",
      ),
      questionsAnswers: meter(
        customer,
        fetchQuestionsAnswers,
        dataforseoPricing.business.questionsAnswers,
        "local_seo",
      ),
      myBusinessInfo: meter(
        customer,
        fetchMyBusinessInfo,
        dataforseoPricing.business.myBusinessInfo,
        "local_seo",
      ),
      // task_post is where DataForSEO charges; collection runs unmetered
      // through fetchBusinessDataTaskResult (see index.ts).
      reviewsTaskPost: meter(
        customer,
        postGoogleReviewsTask,
        dataforseoPricing.business.reviewsTaskPost,
        "local_seo",
      ),
      updatesTaskPost: meter(
        customer,
        postMyBusinessUpdatesTask,
        dataforseoPricing.business.updatesTaskPost,
        "local_seo",
      ),
    },
    backlinks: {
      summary: meter(
        customer,
        fetchBacklinksSummary,
        dataforseoPricing.backlinks.summary,
      ),
      rows: meter(
        customer,
        fetchBacklinksRows,
        dataforseoPricing.backlinks.rows,
      ),
      referringDomains: meter(
        customer,
        fetchReferringDomains,
        dataforseoPricing.backlinks.referringDomains,
      ),
      domainPages: meter(
        customer,
        fetchDomainPagesSummary,
        dataforseoPricing.backlinks.domainPages,
      ),
      history: meter(
        customer,
        fetchBacklinksHistory,
        dataforseoPricing.backlinks.history,
      ),
    },
    keywords: {
      related: meter(
        customer,
        fetchRelatedKeywords,
        dataforseoPricing.keywords.related,
      ),
      suggestions: meter(
        customer,
        fetchKeywordSuggestions,
        dataforseoPricing.keywords.suggestions,
      ),
      ideas: meter(
        customer,
        fetchKeywordIdeas,
        dataforseoPricing.keywords.ideas,
      ),
      // Google Ads endpoints for countries Labs doesn't support.
      adsIdeas: meter(
        customer,
        fetchAdsKeywordIdeas,
        dataforseoPricing.keywords.adsIdeas,
      ),
      adsSearchVolume: meter(
        customer,
        fetchAdsSearchVolume,
        dataforseoPricing.keywords.adsSearchVolume,
      ),
    },
    domain: {
      intersection: meter(
        customer,
        fetchDomainIntersection,
        dataforseoPricing.domain.intersection,
      ),
      historicalRankOverview: meter(
        customer,
        fetchHistoricalRankOverview,
        dataforseoPricing.domain.historicalRankOverview,
      ),
      keywordsForSite: meter(
        customer,
        fetchKeywordsForSite,
        dataforseoPricing.domain.keywordsForSite,
      ),
      rankOverview: meter(
        customer,
        fetchDomainRankOverview,
        dataforseoPricing.domain.rankOverview,
      ),
      rankedKeywords: meter(
        customer,
        fetchRankedKeywords,
        dataforseoPricing.domain.rankedKeywords,
      ),
      relevantPages: meter(
        customer,
        fetchRelevantPages,
        dataforseoPricing.domain.relevantPages,
      ),
    },
    serp: {
      mapsTaskPost: meter(
        customer,
        postMapsTasks,
        dataforseoPricing.serp.mapsTaskPost,
        "local_seo",
      ),
      autocomplete: meter(
        customer,
        fetchAutocomplete,
        dataforseoPricing.serp.autocomplete,
      ),
      live: meter(customer, fetchLiveSerp, dataforseoPricing.serp.live),
      // A rank check batch shares one credit hold and one settle across its
      // live calls (see meterDataforseoCalls). Resolves per call, in order.
      rankCheckBatch: (inputs: Parameters<typeof fetchRankCheckSerp>[0][]) =>
        meterDataforseoCalls(
          customer,
          inputs.map((input) => () => fetchRankCheckSerp(input)),
          inputs.map((input) =>
            creditsForProviderUsd(dataforseoPricing.serp.rankCheck(input)),
          ),
          "rank_tracking",
        ),
      // Posts up to 100 queued rank check tasks; one metered charge covers the
      // whole batch (DataForSEO bills task_post at post time, collection is
      // free).
      rankCheckTaskPost: meter(
        customer,
        postRankCheckTasks,
        dataforseoPricing.serp.rankCheckTaskPost,
        "rank_tracking",
      ),
      local: meter(
        customer,
        fetchLocalSerp,
        dataforseoPricing.serp.local,
        "local_seo",
      ),
      // One queued Maps task per rank grid point; one metered charge covers
      // them all (DataForSEO bills task_post, collection is free).
      localTaskPost: meter(
        customer,
        postLocalSerpTasks,
        dataforseoPricing.serp.localTaskPost,
        "local_seo",
      ),
    },
    labs: {
      // Callers (e.g. the keyword-metrics MCP tool) can attribute the spend to
      // their own feature by passing `creditFeature` in the input; defaults to
      // rank_tracking when omitted.
      keywordOverview: meter(
        customer,
        fetchKeywordOverview,
        dataforseoPricing.labs.keywordOverview,
        "rank_tracking",
      ),
      serpCompetitors: meter(
        customer,
        fetchSerpCompetitors,
        dataforseoPricing.labs.serpCompetitors,
      ),
    },
    lighthouse: {
      live: meter(
        customer,
        fetchLighthouseResult,
        dataforseoPricing.lighthouse.live,
      ),
    },
    aiSearch: {
      chatGptScrape: meter(
        customer,
        fetchChatGptScrape,
        dataforseoPricing.aiSearch.chatGptScrape,
      ),
      googleAiModeScrape: meter(
        customer,
        fetchGoogleAiModeScrape,
        dataforseoPricing.aiSearch.googleAiModeScrape,
      ),
      mentionsSearch: meter(
        customer,
        fetchLlmMentionsSearch,
        dataforseoPricing.aiSearch.mentionsSearch,
      ),
      aggregatedMetrics: meter(
        customer,
        fetchLlmAggregatedMetrics,
        dataforseoPricing.aiSearch.aggregatedMetrics,
      ),
      topPages: meter(
        customer,
        fetchLlmTopPages,
        dataforseoPricing.aiSearch.topPages,
      ),
      crossAggregatedMetrics: meter(
        customer,
        fetchLlmCrossAggregatedMetrics,
        dataforseoPricing.aiSearch.crossAggregatedMetrics,
      ),
      llmResponse: meter(
        customer,
        fetchLlmResponse,
        dataforseoPricing.aiSearch.llmResponse,
      ),
      // Posts up to 100 tracked prompts for one engine; one metered charge
      // covers the batch (DataForSEO bills task_post, collection is free).
      trackingTaskPost: meter(
        customer,
        postAiTrackingTasks,
        dataforseoPricing.aiSearch.trackingTaskPost,
        "ai_prompt_responses",
      ),
      // A manual run's live answers share one credit hold and one settle (see
      // meterDataforseoCalls). Resolves per call, in order.
      trackingLiveBatch: (
        inputs: Parameters<typeof fetchAiTrackingLiveAnswer>[0][],
      ) =>
        meterDataforseoCalls(
          customer,
          inputs.map((input) => () => fetchAiTrackingLiveAnswer(input)),
          inputs.map((input) =>
            creditsForProviderUsd(
              dataforseoPricing.aiSearch.trackingLive(input),
            ),
          ),
          "ai_prompt_responses",
        ),
    },
  } as const;
}
