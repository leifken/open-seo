// Root of the lazily loaded DataForSEO subtree. The section fetchers — and
// the ~3 MB dataforseo-client SDK they statically import — are reached only
// through the single dynamic import in client.ts (loadDataforseoSections), so
// the whole subtree lands in one lazy chunk outside the eager isolate startup
// graph. Never import this barrel or a section file statically from eager
// server code; the leanWorkerBundle vite plugin fails the build if the SDK
// re-enters the eager graph. SDK-free values live in shared.ts instead.

export {
  fetchBusinessDataTaskResult,
  fetchBusinessListingsCategories,
  fetchBusinessListingsSearch,
  fetchMyBusinessInfo,
  fetchQuestionsAnswers,
  postGoogleReviewsTask,
  postMyBusinessInfoTask,
  postMyBusinessUpdatesTask,
} from "@/server/lib/dataforseo/business";

export { fetchUserData } from "@/server/lib/dataforseo/appendix";

export { fetchGeoLocationsForCountry } from "@/server/lib/dataforseo/geo-locations";

export {
  fetchBacklinksHistory,
  fetchBacklinksRows,
  fetchBacklinksSummary,
  fetchDomainPagesSummary,
  fetchReferringDomains,
} from "@/server/lib/dataforseo/backlinks";

export {
  fetchDomainIntersection,
  fetchDomainRankOverview,
  fetchHistoricalRankOverview,
  fetchKeywordIdeas,
  fetchKeywordOverview,
  fetchKeywordsForSite,
  fetchKeywordSuggestions,
  fetchRankedKeywords,
  fetchRelatedKeywords,
  fetchRelevantPages,
  fetchSerpCompetitors,
} from "@/server/lib/dataforseo/labs";

export {
  fetchAdsKeywordIdeas,
  fetchAdsSearchVolume,
} from "@/server/lib/dataforseo/google-ads";

export {
  fetchAutocomplete,
  fetchLiveSerp,
  fetchLocalSerp,
  fetchRankCheckSerp,
  fetchRankCheckTaskResult,
  postRankCheckTasks,
} from "@/server/lib/dataforseo/serp";

export {
  fetchMapsTaskResult,
  postMapsTasks,
} from "@/server/lib/dataforseo/maps-tasks";

export { fetchLighthouseResult } from "@/server/lib/dataforseo/lighthouse";

export {
  fetchLlmAggregatedMetrics,
  fetchLlmCrossAggregatedMetrics,
  fetchLlmMentionsSearch,
  fetchLlmResponse,
  fetchLlmTopPages,
} from "@/server/lib/dataforseo/ai";

export {
  fetchChatGptScrape,
  fetchGoogleAiModeScrape,
} from "@/server/lib/dataforseo/llm-scraper";
