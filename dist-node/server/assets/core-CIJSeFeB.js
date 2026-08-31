import { KeywordsDataApi, BacklinksApi, BusinessDataApi, DataforseoLabsApi, OnPageApi, SerpApi, AiOptimizationApi } from "dataforseo-client";
import { a9 as getRequiredEnvValue, a0 as AppError } from "../entry.js";
const API_BASE = "https://api.dataforseo.com";
const MAX_DATAFORSEO_ERROR_PAYLOAD_LENGTH = 1600;
const DATAFORSEO_REQUEST_TIMEOUT_MS = 6e4;
const DATAFORSEO_MAX_RETRIES = 2;
const DATAFORSEO_RETRY_BACKOFF_MS = 250;
function formatDataforseoErrorPayload(value) {
  const text = typeof value === "string" ? value : (() => {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  })();
  return text.length > MAX_DATAFORSEO_ERROR_PAYLOAD_LENGTH ? `${text.slice(0, MAX_DATAFORSEO_ERROR_PAYLOAD_LENGTH)}... [truncated]` : text;
}
function formatDataforseoRequestPath(url) {
  const rawUrl = typeof url === "string" ? url : url.url;
  try {
    return new URL(rawUrl).pathname;
  } catch {
    return rawUrl;
  }
}
function createAuthenticatedFetch(classify, maxServerErrorRetries = DATAFORSEO_MAX_RETRIES) {
  return async (url, init) => {
    const apiKey = await getRequiredEnvValue("DATAFORSEO_API_KEY");
    const headers = new Headers(init?.headers);
    headers.set("Authorization", `Basic ${apiKey}`);
    const signal = init?.signal ?? AbortSignal.timeout(DATAFORSEO_REQUEST_TIMEOUT_MS);
    for (let attempt = 0; ; attempt++) {
      const response = await fetch(url, { ...init, headers, signal });
      if (response.ok) return response;
      if (response.status >= 500 && attempt < maxServerErrorRetries) {
        await new Promise(
          (resolve) => setTimeout(resolve, DATAFORSEO_RETRY_BACKOFF_MS * (attempt + 1))
        );
        continue;
      }
      const rawText = await response.text();
      const path = formatDataforseoRequestPath(url);
      const classified = classify?.(response.status, rawText, path);
      if (classified) throw classified;
      const code = response.status >= 500 ? "UPSTREAM_UNAVAILABLE" : response.status === 429 ? "RATE_LIMITED" : response.status === 401 ? "DATAFORSEO_AUTH_FAILED" : "INTERNAL_ERROR";
      const error = new AppError(
        code,
        `DataForSEO HTTP ${response.status} on ${path}`,
        {
          provider: "dataforseo",
          providerStatus: String(response.status),
          providerPath: path,
          responseBody: formatDataforseoErrorPayload(rawText)
        }
      );
      error.name = "DataForSEOHttpError";
      throw error;
    }
  };
}
function http(classify, maxServerErrorRetries = DATAFORSEO_MAX_RETRIES) {
  return { fetch: createAuthenticatedFetch(classify, maxServerErrorRetries) };
}
const labsApi = () => new DataforseoLabsApi(API_BASE, http());
const keywordsDataApi = () => new KeywordsDataApi(API_BASE, http());
const serpApi = () => new SerpApi(API_BASE, http());
const businessDataApi = () => new BusinessDataApi(API_BASE, http());
const businessDataTaskApi = () => new BusinessDataApi(API_BASE, http(void 0, 0));
const onPageApi = () => new OnPageApi(API_BASE, http(void 0, 0));
const backlinksApi = (classify) => new BacklinksApi(API_BASE, http(classify));
const aiOptimizationApi = (classify) => new AiOptimizationApi(API_BASE, http(classify));
export {
  businessDataTaskApi as a,
  businessDataApi as b,
  backlinksApi as c,
  aiOptimizationApi as d,
  keywordsDataApi as k,
  labsApi as l,
  onPageApi as o,
  serpApi as s
};
