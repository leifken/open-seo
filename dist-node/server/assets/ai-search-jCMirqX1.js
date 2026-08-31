import { c as createServerRpc } from "./createServerRpc-CXhnBwFB.js";
import { bQ as urlMatchesResearchTarget, bR as buildCacheKey, bS as getCached, F as waitUntil, bT as setCached, bU as parseResearchTarget, a1 as AppError, bH as createDataforseoClient, bV as AI_SEARCH_PROMPT_CACHE_NAMESPACE, i as createServerFn, C as isHostedServerAuthMode, bW as customerHasPaidPlan } from "../entry.js";
import { sortBy } from "remeda";
import { d as detectTarget } from "./targetDetection-BYxiYw0Q.js";
import { a as brandLookupResultSchema, c as promptExplorerModelResultSchema, b as brandLookupInputSchema, p as promptExplorerInputSchema } from "./ai-search-B6IOR0fs.js";
import { r as requireProjectContext } from "./middleware-CwR3-L1M.js";
import "node:async_hooks";
import "node:crypto";
import "ioredis";
import "node:fs/promises";
import "node:path";
import "node:fs";
import "better-sqlite3";
import "bullmq";
import "postgres";
import "zod";
import "@modelcontextprotocol/client";
import "@modelcontextprotocol/client/validators/cf-worker";
import "@modelcontextprotocol/sdk/types.js";
import "node:diagnostics_channel";
import "jose";
import "drizzle-orm/d1";
import "drizzle-orm/sqlite-core";
import "drizzle-orm";
import "drizzle-orm/postgres-js";
import "drizzle-orm/pg-core";
import "jose/errors";
import "node:os";
import "@better-auth/api-key";
import "posthog-node";
import "@modelcontextprotocol/server";
import "tldts";
import "srvx";
import "react";
import "@tanstack/react-router";
import "react/jsx-runtime";
import "@tanstack/react-router/ssr/server";
import "robots-parser";
import "fast-xml-parser";
const CHATGPT_LOCATION_CODE = 2840;
const CHATGPT_LANGUAGE_CODE = "en";
function buildLlmTarget(input) {
  if (input.type === "domain") {
    return {
      domain: input.value,
      include_subdomains: input.includeSubdomains ?? true,
      search_filter: "include",
      search_scope: ["any"]
    };
  }
  return {
    keyword: input.value,
    search_filter: "include",
    search_scope: ["any", "brand_entities"],
    match_type: "word_match"
  };
}
function resolveCompetitorGroups(targetValue, competitors) {
  const seen = /* @__PURE__ */ new Set([targetValue.toLowerCase()]);
  const groups = [];
  for (const competitor of competitors) {
    const detected = detectTarget(competitor);
    const dedupeKey = detected.value.toLowerCase();
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    groups.push({ label: detected.value, detected });
  }
  return groups;
}
function computeShareOfVoice(crossOutcomes, targetKey, competitorKeys) {
  if (competitorKeys.length === 0) return null;
  const successful = crossOutcomes.filter((c) => c.status === "success");
  if (successful.length === 0) return null;
  const requestedKeys = [targetKey, ...competitorKeys];
  const labelByKey = new Map(
    requestedKeys.map((key) => [key.toLowerCase(), key])
  );
  const mentionsByKey = new Map(
    requestedKeys.map((key) => [key.toLowerCase(), null])
  );
  for (const outcome of successful) {
    for (const item of outcome.items) {
      if (item.key == null) continue;
      const key = item.key.toLowerCase();
      if (!labelByKey.has(key)) continue;
      const platformMentions = sumNullable(
        (item.platform ?? []).map((entry) => roundOrNull(entry.mentions))
      );
      const prior = mentionsByKey.get(key) ?? null;
      mentionsByKey.set(key, sumNullable([prior, platformMentions]));
    }
  }
  const denominator = sumNullable(Array.from(mentionsByKey.values())) ?? 0;
  const targetLower = targetKey.toLowerCase();
  const entries = sortBy(
    Array.from(mentionsByKey.entries()).map(([key, mentions]) => ({
      label: labelByKey.get(key) ?? key,
      isTarget: key === targetLower,
      mentions,
      sharePct: mentions == null || denominator <= 0 ? null : mentions / denominator * 100
    })),
    [(entry) => entry.mentions ?? -1, "desc"]
  );
  return { platforms: successful.map((outcome) => outcome.platform), entries };
}
function sumNullable(values) {
  let total = 0;
  let hasValue = false;
  for (const value of values) {
    if (value != null) {
      total += value;
      hasValue = true;
    }
  }
  return hasValue ? total : null;
}
function roundOrNull(value) {
  if (value == null) return null;
  return Math.round(value);
}
function safeHttpUrl(value) {
  if (typeof value !== "string" || value.length === 0) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (url.username || url.password) return null;
    return value;
  } catch {
    return null;
  }
}
function safeHostname(value) {
  const url = safeHttpUrl(value);
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}
const MAX_URL_LENGTH$1 = 2048;
const MAX_QUESTION_LENGTH$1 = 500;
function deriveCitedSources(bundles, limits, pageFilter = null) {
  const promptExamples = buildPromptExamples(bundles);
  const rows = bundles.flatMap(
    (bundle) => bundle.topPages.map((page) => {
      const url = safeHttpUrl(page.key);
      if (!url || url.length > MAX_URL_LENGTH$1) return null;
      if (pageFilter && !urlMatchesResearchTarget(url, pageFilter)) {
        return null;
      }
      const platformGroup = page.platform?.find(
        (entry) => entry.key === bundle.platform
      );
      const key = sourceKey(bundle.platform, url);
      const examples = promptExamples.get(key) ?? /* @__PURE__ */ new Map();
      return {
        url,
        domain: safeHostname(url),
        platform: bundle.platform,
        mentions: roundOrNull(platformGroup?.mentions),
        capturedVolume: roundOrNull(platformGroup?.ai_search_volume),
        keywords: sortBy(
          Array.from(examples.entries()).map(
            ([question, aiSearchVolume]) => ({
              question,
              aiSearchVolume
            })
          ),
          [(keyword) => keyword.aiSearchVolume ?? 0, "desc"]
        ).slice(0, limits.keywordsPerSource)
      };
    }).filter((row) => row !== null)
  );
  const byPlatform = /* @__PURE__ */ new Map();
  for (const row of rows) {
    const list = byPlatform.get(row.platform) ?? [];
    list.push(row);
    byPlatform.set(row.platform, list);
  }
  const capped = Array.from(byPlatform.values()).flatMap(
    (list) => sortBy(list, [(row) => row.capturedVolume ?? 0, "desc"]).slice(
      0,
      limits.sourcesPerPlatform
    )
  );
  return sortBy(
    capped,
    [(row) => row.capturedVolume ?? 0, "desc"],
    [(row) => row.mentions ?? 0, "desc"]
  );
}
function buildPromptExamples(bundles) {
  const examples = /* @__PURE__ */ new Map();
  for (const bundle of bundles) {
    for (const mention of bundle.mentions) {
      const question = typeof mention.question === "string" ? truncate$1(mention.question, MAX_QUESTION_LENGTH$1) : "";
      if (question.length === 0) continue;
      const volume = roundOrNull(mention.ai_search_volume);
      for (const source of mention.sources ?? []) {
        const url = safeHttpUrl(source.url);
        if (!url) continue;
        const key = sourceKey(bundle.platform, url);
        const existing = examples.get(key) ?? /* @__PURE__ */ new Map();
        if (!existing.has(question)) existing.set(question, volume);
        examples.set(key, existing);
      }
    }
  }
  return examples;
}
function sourceKey(platform, url) {
  return `${platform}::${url}`;
}
function truncate$1(value, maxLength) {
  return value.length <= maxLength ? value : value.slice(0, maxLength);
}
const TOP_QUERIES_PER_PLATFORM = 25;
const TOP_SOURCES_PER_PLATFORM$1 = 10;
const KEYWORDS_PER_SOURCE = 50;
const MAX_URL_LENGTH = 2048;
const MAX_TITLE_LENGTH = 300;
const MAX_QUESTION_LENGTH = 500;
const MAX_BRAND_ENTITY_LENGTH = 200;
function shapeResult(args) {
  const scope = args.researchTarget?.scope;
  const pageFilter = scope === "exact_url" || scope === "subfolder" ? args.researchTarget : null;
  const successfulBundles = args.platformBundles.filter(
    (b) => b.status === "success" && b.bundle !== null
  );
  const primaryLanguage = args.userLanguageCode.toLowerCase().split(/[-_]/)[0];
  const chatGptLocaleMatches = args.userLocationCode === CHATGPT_LOCATION_CODE && primaryLanguage === CHATGPT_LANGUAGE_CODE;
  const perPlatform = args.platformBundles.map((outcome) => {
    if (outcome.status === "error" || !outcome.bundle) {
      return {
        platform: outcome.platform,
        status: "error",
        mentions: null,
        aiSearchVolume: null
      };
    }
    const platformGroup = outcome.bundle.aggregated.platform?.find(
      (entry) => entry.key === outcome.platform
    );
    return {
      platform: outcome.platform,
      status: "success",
      mentions: roundOrNull(platformGroup?.mentions),
      aiSearchVolume: roundOrNull(platformGroup?.ai_search_volume)
    };
  });
  const aggregatablePlatforms = perPlatform.filter(
    (p) => chatGptLocaleMatches || p.platform !== "chat_gpt"
  );
  const totalMentions = sumNullable(
    aggregatablePlatforms.map((p) => p.mentions)
  );
  const totalAiSearchVolume = sumNullable(
    aggregatablePlatforms.map((p) => p.aiSearchVolume)
  );
  const topPages = deriveCitedSources(
    successfulBundles.map((bundle) => ({
      platform: bundle.platform,
      topPages: bundle.bundle.topPages,
      mentions: bundle.bundle.mentions
    })),
    {
      sourcesPerPlatform: TOP_SOURCES_PER_PLATFORM$1,
      keywordsPerSource: KEYWORDS_PER_SOURCE
    },
    pageFilter
  );
  const topQueries = shapeTopQueries(successfulBundles, pageFilter);
  const trendBundles = chatGptLocaleMatches ? successfulBundles : successfulBundles.filter((b) => b.platform !== "chat_gpt");
  const monthlyVolume = aggregateMonthlyVolume(trendBundles);
  const shareOfVoice = computeShareOfVoice(
    chatGptLocaleMatches ? args.crossOutcomes : args.crossOutcomes.filter((outcome) => outcome.platform !== "chat_gpt"),
    args.detected.value,
    args.competitorKeys
  );
  const hasData = (totalMentions ?? 0) > 0 || topPages.length > 0 || topQueries.length > 0 || monthlyVolume.length > 0 || (shareOfVoice?.entries.some((e) => e.mentions != null) ?? false);
  return {
    query: args.query,
    detectedTargetType: args.detected.type,
    resolvedTarget: args.researchTarget?.display ?? args.detected.value,
    scope: args.researchTarget?.scope ?? null,
    aggregatesAreDomainLevel: pageFilter !== null,
    fetchedAt: (/* @__PURE__ */ new Date()).toISOString(),
    hasData,
    totalMentions,
    totalAiSearchVolume,
    perPlatform,
    shareOfVoice,
    topPages,
    topQueries,
    monthlyVolume
  };
}
function shapeTopQueries(bundles, pageFilter) {
  return sortBy(
    bundles.flatMap(
      (bundle) => sortBy(
        bundle.bundle.mentions.filter(
          (item) => typeof item.question === "string" && item.question.length > 0
        ).filter(
          (item) => pageFilter === null || (item.sources ?? []).some((source) => {
            const url = safeHttpUrl(source.url);
            return url != null && urlMatchesResearchTarget(url, pageFilter);
          })
        ).map((item) => ({
          question: truncate(item.question, MAX_QUESTION_LENGTH),
          platform: bundle.platform,
          aiSearchVolume: roundOrNull(item.ai_search_volume),
          firstSeenAt: item.first_response_at ?? null,
          lastSeenAt: item.last_response_at ?? null,
          citedSources: shapeQuerySources(item),
          brandsMentioned: (item.brand_entities ?? []).map((entity) => entity.title ?? "").filter((title) => title.length > 0).map((title) => truncate(title, MAX_BRAND_ENTITY_LENGTH)).slice(0, 20)
        })),
        [(query) => query.aiSearchVolume ?? 0, "desc"]
      ).slice(0, TOP_QUERIES_PER_PLATFORM)
    ),
    [(query) => query.aiSearchVolume ?? 0, "desc"]
  );
}
function shapeQuerySources(item) {
  return (item.sources ?? []).map((src) => {
    const safeUrl = safeHttpUrl(src.url);
    if (!safeUrl || safeUrl.length > MAX_URL_LENGTH) return null;
    return {
      url: safeUrl,
      domain: safeHostname(safeUrl),
      title: typeof src.title === "string" ? truncate(src.title, MAX_TITLE_LENGTH) : null
    };
  }).filter((src) => src !== null).slice(0, 10);
}
function aggregateMonthlyVolume(bundles) {
  const totals = /* @__PURE__ */ new Map();
  for (const outcome of bundles) {
    for (const mention of outcome.bundle.mentions) {
      for (const monthly of mention.monthly_searches ?? []) {
        if (monthly.search_volume == null) continue;
        const key = `${monthly.year}-${monthly.month}`;
        totals.set(key, (totals.get(key) ?? 0) + monthly.search_volume);
      }
    }
  }
  const entries = Array.from(totals.entries()).map(([key, volume]) => {
    const [yearStr, monthStr] = key.split("-");
    return {
      year: Number(yearStr),
      month: Number(monthStr),
      volume: Math.round(volume)
    };
  });
  return sortBy(
    entries,
    [(entry) => entry.year, "asc"],
    [(entry) => entry.month, "asc"]
  ).slice(-12);
}
function truncate(value, maxLength) {
  return value.length <= maxLength ? value : value.slice(0, maxLength);
}
const BRAND_LOOKUP_TTL_SECONDS = 24 * 60 * 60;
const PLATFORMS = ["chat_gpt", "google"];
const MENTIONS_PER_PLATFORM = 100;
const TOP_SOURCES_PER_PLATFORM = 10;
async function getBrandLookup(input, billingCustomer) {
  const detected = detectTarget(input.query);
  const researchTarget = resolveResearchTarget(input, detected);
  const includeSubdomains = researchTarget === null || researchTarget.scope === "subdomains";
  const competitorGroups = resolveCompetitorGroups(
    detected.value,
    input.competitors
  );
  const cacheKey = await buildCacheKey("ai-search:brand-lookup", {
    organizationId: billingCustomer.organizationId,
    projectId: input.projectId,
    targetType: detected.type,
    // Values are lowercased for DataForSEO's matching semantics. Competitors
    // are canonical detected values too, so equivalent casing/order shares one
    // paid cache entry.
    targetValue: detected.value.toLowerCase(),
    competitors: competitorGroups.map((g) => g.detected.value.toLowerCase()).toSorted().join("|"),
    locationCode: input.locationCode,
    languageCode: input.languageCode,
    // Scope changes both the provider call (include_subdomains) and the
    // page-level filtering, so it must not share a cache entry. The path only
    // affects output under URL scopes — keying it for domain/subdomains would
    // re-buy identical fan-outs for example.com vs example.com/blog.
    scope: researchTarget?.scope ?? null,
    path: researchTarget?.scope === "exact_url" || researchTarget?.scope === "subfolder" ? researchTarget.path : ""
  });
  const cached = brandLookupResultSchema.safeParse(await getCached(cacheKey));
  if (cached.success) {
    return {
      ...cached.data,
      query: input.query,
      resolvedTarget: researchTarget?.display ?? detected.value
    };
  }
  const dataforseo = createDataforseoClient(billingCustomer);
  const settled = [];
  for (const platform of PLATFORMS) {
    settled.push(
      await settle(
        () => fetchPlatformData(
          platform,
          detected,
          includeSubdomains,
          input,
          dataforseo
        )
      )
    );
  }
  rethrowIfBlockingAiSearchError(settled);
  const crossSettled = competitorGroups.length > 0 ? await settle(
    () => fetchCrossAggregated(
      detected,
      competitorGroups,
      includeSubdomains,
      input,
      dataforseo
    )
  ) : { status: "fulfilled", value: [] };
  if (crossSettled.status === "rejected") throw crossSettled.reason;
  const crossOutcomes = crossSettled.value;
  const platformBundles = settled.map((settledResult, i) => {
    const platform = PLATFORMS[i];
    if (settledResult.status === "fulfilled") {
      return { platform, status: "success", bundle: settledResult.value };
    }
    console.error(
      `ai-search.brand-lookup.${platform}.error:`,
      settledResult.reason
    );
    return { platform, status: "error", bundle: null };
  });
  const result = shapeResult({
    query: input.query,
    detected,
    researchTarget,
    platformBundles,
    crossOutcomes,
    competitorKeys: competitorGroups.map((g) => g.label),
    userLocationCode: input.locationCode,
    userLanguageCode: input.languageCode
  });
  const allSucceeded = platformBundles.every(
    (b) => b.status === "success" && b.bundle?.complete
  ) && crossOutcomes.every((c) => c.status === "success");
  if (allSucceeded && result.hasData) {
    waitUntil(
      setCached(cacheKey, result, BRAND_LOOKUP_TTL_SECONDS).catch((err) => {
        console.error("ai-search.brand-lookup.cache-write failed:", err);
      })
    );
  }
  return result;
}
function resolveResearchTarget(input, detected) {
  if (detected.type !== "domain") return null;
  const parsed = parseResearchTarget(input.query, input.scope);
  if (!parsed.ok) {
    if (input.scope) throw new AppError("VALIDATION_ERROR", parsed.message);
    return null;
  }
  return parsed.target;
}
async function settle(execute) {
  try {
    return { status: "fulfilled", value: await execute() };
  } catch (reason) {
    return { status: "rejected", reason };
  }
}
async function fetchPlatformData(platform, detected, includeSubdomains, input, dataforseo) {
  const target = buildLlmTarget({
    type: detected.type,
    value: detected.value,
    includeSubdomains
  });
  const locationCode = platform === "chat_gpt" ? CHATGPT_LOCATION_CODE : input.locationCode;
  const languageCode = platform === "chat_gpt" ? CHATGPT_LANGUAGE_CODE : input.languageCode;
  const aggregated = await settle(
    () => dataforseo.aiSearch.aggregatedMetrics({
      target,
      platform,
      locationCode,
      languageCode,
      internalListLimit: 20
    })
  );
  const topPages = await settle(
    () => dataforseo.aiSearch.topPages({
      target,
      platform,
      locationCode,
      languageCode,
      itemsListLimit: TOP_SOURCES_PER_PLATFORM
    })
  );
  const mentions = await settle(
    () => dataforseo.aiSearch.mentionsSearch({
      target,
      platform,
      locationCode,
      languageCode,
      limit: MENTIONS_PER_PLATFORM
    })
  );
  rethrowIfBlockingAiSearchError([aggregated, topPages, mentions]);
  const allRejected = aggregated.status === "rejected" && topPages.status === "rejected" && mentions.status === "rejected";
  if (allRejected) throw aggregated.reason;
  return {
    aggregated: fulfilledOr(aggregated, () => ({}), platform, "aggregated"),
    topPages: fulfilledOr(topPages, () => [], platform, "topPages"),
    mentions: fulfilledOr(mentions, () => [], platform, "mentions"),
    complete: aggregated.status === "fulfilled" && topPages.status === "fulfilled" && mentions.status === "fulfilled"
  };
}
async function fetchCrossAggregated(detected, competitors, includeSubdomains, input, dataforseo) {
  const groups = [
    {
      key: detected.value,
      target: buildLlmTarget({
        type: detected.type,
        value: detected.value,
        includeSubdomains
      })
    },
    ...competitors.map((competitor) => ({
      key: competitor.label,
      target: buildLlmTarget({
        type: competitor.detected.type,
        value: competitor.detected.value,
        includeSubdomains
      })
    }))
  ];
  const settled = [];
  for (const platform of PLATFORMS) {
    settled.push(
      await settle(
        () => dataforseo.aiSearch.crossAggregatedMetrics({
          groups,
          platform,
          // ChatGPT mentions DB only contains US/en data per DataForSEO docs.
          locationCode: platform === "chat_gpt" ? CHATGPT_LOCATION_CODE : input.locationCode,
          languageCode: platform === "chat_gpt" ? CHATGPT_LANGUAGE_CODE : input.languageCode
        })
      )
    );
  }
  rethrowIfBlockingAiSearchError(settled);
  return settled.map((result, i) => {
    const platform = PLATFORMS[i];
    if (result.status === "fulfilled") {
      return { platform, status: "success", items: result.value };
    }
    console.error(
      `ai-search.brand-lookup.${platform}.cross-aggregated.error:`,
      result.reason
    );
    return { platform, status: "error", items: [] };
  });
}
function rethrowIfBlockingAiSearchError(results) {
  for (const result of results) {
    if (result.status === "rejected" && result.reason instanceof AppError && (result.reason.code === "INSUFFICIENT_CREDITS" || result.reason.code === "AI_SEARCH_BILLING_ISSUE")) {
      throw result.reason;
    }
  }
}
function fulfilledOr(result, fallback, platform, label) {
  if (result.status === "fulfilled") return result.value;
  console.error(
    `ai-search.brand-lookup.${platform}.${label}.error:`,
    result.reason
  );
  return fallback();
}
const PROMPT_RESPONSE_TTL_SECONDS = 7 * 24 * 60 * 60;
const PROMPT_RESPONSE_MAX_TOKENS = 4096;
async function explorePrompt$1(input, billingCustomer) {
  const dataforseo = createDataforseoClient(billingCustomer);
  const highlightBrand = input.highlightBrand?.trim() || null;
  const uniqueModels = Array.from(new Set(input.models));
  const settled = await Promise.allSettled(
    uniqueModels.map(
      (model) => runModel({
        model,
        input,
        highlightBrand,
        billingCustomer,
        dataforseo
      })
    )
  );
  const results = settled.map(
    (settledResult, index) => {
      const model = uniqueModels[index];
      if (settledResult.status === "fulfilled") return settledResult.value;
      return mapErrorToResult(model, settledResult.reason);
    }
  );
  return {
    prompt: input.prompt,
    highlightBrand,
    fetchedAt: (/* @__PURE__ */ new Date()).toISOString(),
    results
  };
}
async function runModel(args) {
  const cacheKey = await buildCacheKey(AI_SEARCH_PROMPT_CACHE_NAMESPACE, {
    organizationId: args.billingCustomer.organizationId,
    projectId: args.input.projectId,
    model: args.model,
    // Collapse only whitespace differences. Casing is deliberately preserved:
    // prompts like "Compare Go vs go" or case-sensitive code snippets must
    // not collide with their lowercase twins.
    prompt: normalizePromptForCache(args.input.prompt),
    webSearch: args.input.webSearch,
    webSearchCountryCode: args.input.webSearchCountryCode ?? null,
    // Bumped when prompt/payload shape changes — busts stale cache entries.
    systemPromptV: 5
  });
  const cached = promptExplorerModelResultSchema.safeParse(
    await getCached(cacheKey)
  );
  if (cached.success && cached.data.status === "success") {
    return reapplyHighlightBrand(cached.data, args.highlightBrand);
  }
  const rawResponse = await fetchModelResponse(args);
  const shaped = shapeSuccess(args.model, rawResponse);
  waitUntil(
    setCached(cacheKey, shaped, PROMPT_RESPONSE_TTL_SECONDS, {
      organizationId: args.billingCustomer.organizationId
    }).catch((err) => {
      console.error("ai-search.prompt-response.cache-write failed:", err);
    })
  );
  return reapplyHighlightBrand(shaped, args.highlightBrand);
}
const MODEL_NAMES = {
  chat_gpt: "gpt-5",
  claude: "claude-sonnet-4-5",
  gemini: "gemini-2.5-pro",
  perplexity: "sonar-reasoning-pro"
};
function fetchModelResponse(args) {
  return args.dataforseo.aiSearch.llmResponse({
    modelSlug: args.model,
    modelName: MODEL_NAMES[args.model],
    userPrompt: args.input.prompt,
    webSearch: args.input.webSearch,
    webSearchCountryCode: args.input.webSearchCountryCode,
    maxOutputTokens: PROMPT_RESPONSE_MAX_TOKENS
  });
}
function shapeSuccess(model, response) {
  const text = extractText(response);
  const citations = extractCitations(response);
  const fanOutQueries = (response.fan_out_queries ?? []).slice(0, 20);
  return {
    status: "success",
    model,
    modelName: response.model_name ?? null,
    text,
    citations,
    fanOutQueries,
    brandMentioned: null,
    outputTokens: response.output_tokens != null ? Math.round(response.output_tokens) : null,
    webSearch: response.web_search ?? false
  };
}
function reapplyHighlightBrand(result, highlightBrand) {
  if (result.status !== "success") return result;
  const citations = result.citations.map((citation) => ({
    ...citation,
    matchedBrand: matchesBrand(citation.url, citation.title, highlightBrand)
  }));
  return {
    ...result,
    citations,
    brandMentioned: computeBrandMentioned(
      result.text,
      citations,
      highlightBrand
    )
  };
}
function extractText(response) {
  const textParts = [];
  for (const item of response.items ?? []) {
    if (item.type !== "message") continue;
    for (const section of item.sections ?? []) {
      if (typeof section.text === "string" && section.text.length > 0) {
        textParts.push(section.text);
      }
    }
  }
  return textParts.join("\n\n").trim();
}
function extractCitations(response) {
  const seen = /* @__PURE__ */ new Set();
  const citations = [];
  for (const item of response.items ?? []) {
    if (item.type !== "message") continue;
    for (const section of item.sections ?? []) {
      for (const annotation of section.annotations ?? []) {
        const safeUrl = safeHttpUrl(annotation.url);
        if (!safeUrl || seen.has(safeUrl)) continue;
        seen.add(safeUrl);
        citations.push({
          url: safeUrl,
          domain: safeHostname(safeUrl),
          title: annotation.title ?? null,
          matchedBrand: false
        });
      }
    }
  }
  return citations.slice(0, 25);
}
function computeBrandMentioned(text, citations, highlightBrand) {
  if (!highlightBrand) return null;
  if (citations.some((c) => c.matchedBrand)) return true;
  return mentionRegex(highlightBrand).test(text);
}
function matchesBrand(url, title, highlightBrand) {
  if (!highlightBrand) return false;
  const needle = highlightBrand.toLowerCase();
  const haystack = `${url} ${title ?? ""}`.toLowerCase();
  return haystack.includes(needle);
}
function mentionRegex(brand) {
  const escaped = brand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const firstEscaped = brand[0].replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const lastEscaped = brand[brand.length - 1].replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
  const leading = /^\w/.test(brand) ? "\\b" : `(?<!${firstEscaped})`;
  const trailing = /\w$/.test(brand) ? "\\b" : `(?!${lastEscaped})`;
  return new RegExp(`${leading}${escaped}${trailing}`, "i");
}
function normalizePromptForCache(prompt) {
  return prompt.trim().replace(/\s+/g, " ");
}
function mapErrorToResult(model, reason) {
  if (reason instanceof AppError && (reason.code === "INSUFFICIENT_CREDITS" || reason.code === "AI_SEARCH_BILLING_ISSUE")) {
    throw reason;
  }
  console.error(`ai-search.prompt-response.${model}.error:`, reason);
  return {
    status: "error",
    model,
    errorCode: "UPSTREAM_ERROR",
    message: "This model is temporarily unavailable. Please try again."
  };
}
async function assertPaidPlan(organizationId) {
  if (!await isHostedServerAuthMode()) return;
  if (await customerHasPaidPlan(organizationId)) return;
  throw new AppError("PAYMENT_REQUIRED", "Upgrade to the paid plan to use AI Visibility");
}
const lookupBrand_createServerFn_handler = createServerRpc({
  id: "06c91e3888f8bcec4a820827c04796cd80041afad39d1b5549be4e2cf810951b",
  name: "lookupBrand",
  filename: "src/serverFunctions/ai-search.ts"
}, (opts) => lookupBrand.__executeServer(opts));
const lookupBrand = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(brandLookupInputSchema).handler(lookupBrand_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertPaidPlan(context.organizationId);
  return getBrandLookup({
    ...data,
    projectId: context.projectId
  }, context);
});
const explorePrompt_createServerFn_handler = createServerRpc({
  id: "e2b5146b78833600dfd30aa3bda214dfa8c480278644dcff1698db1e51e5759a",
  name: "explorePrompt",
  filename: "src/serverFunctions/ai-search.ts"
}, (opts) => explorePrompt.__executeServer(opts));
const explorePrompt = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(promptExplorerInputSchema).handler(explorePrompt_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertPaidPlan(context.organizationId);
  return explorePrompt$1({
    ...data,
    projectId: context.projectId
  }, context);
});
export {
  explorePrompt_createServerFn_handler,
  lookupBrand_createServerFn_handler
};
