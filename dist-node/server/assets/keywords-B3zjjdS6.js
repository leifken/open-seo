import { c as createServerRpc } from "./createServerRpc-C4IDcroA.js";
import { h as createServerFn, i as researchKeywordsSchema, j as resolveMarket, K as KeywordResearchService, l as saveKeywordsSchema, m as getSavedKeywordsSchema, n as exportSavedKeywordsSchema, u as updateSavedKeywordTagsSchema, o as updateSavedKeywordTagSchema, p as deleteSavedKeywordTagSchema, q as removeSavedKeywordsSchema, t as refreshSavedKeywordMetricsSchema, v as serpAnalysisSchema } from "../entry.js";
import { r as requireProjectContext } from "./middleware-Doy-pxkJ.js";
import "node:async_hooks";
import "node:crypto";
import "ioredis";
import "node:fs/promises";
import "node:path";
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
const researchKeywords_createServerFn_handler = createServerRpc({
  id: "fa088bd63c78c66cb4de7e8be1d7567e0ec901107ad1afe33e0ffbeecc57bfbc",
  name: "researchKeywords",
  filename: "src/serverFunctions/keywords.ts"
}, (opts) => researchKeywords.__executeServer(opts));
const researchKeywords = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(researchKeywordsSchema).handler(researchKeywords_createServerFn_handler, async ({
  data,
  context
}) => {
  const input = {
    ...data,
    ...resolveMarket(data, context.project),
    projectId: context.projectId
  };
  return KeywordResearchService.research(input, context);
});
const saveKeywords_createServerFn_handler = createServerRpc({
  id: "1d75d4deb3fcbaf04305fae69c64722313c46f5620de0ece3b950cff9346e099",
  name: "saveKeywords",
  filename: "src/serverFunctions/keywords.ts"
}, (opts) => saveKeywords.__executeServer(opts));
const saveKeywords = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(saveKeywordsSchema).handler(saveKeywords_createServerFn_handler, async ({
  data,
  context
}) => {
  return KeywordResearchService.saveKeywords({
    ...data,
    ...resolveMarket(data, context.project),
    projectId: context.projectId
  });
});
const getSavedKeywords_createServerFn_handler = createServerRpc({
  id: "8acb99c0e5b1aed5cfb75318e78747749f8c2c54884ba18ff1c945a9b06a9375",
  name: "getSavedKeywords",
  filename: "src/serverFunctions/keywords.ts"
}, (opts) => getSavedKeywords.__executeServer(opts));
const getSavedKeywords = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(getSavedKeywordsSchema).handler(getSavedKeywords_createServerFn_handler, async ({
  data,
  context
}) => {
  return KeywordResearchService.getSavedKeywords({
    ...data,
    projectId: context.projectId
  });
});
const exportSavedKeywords_createServerFn_handler = createServerRpc({
  id: "0146a46bbe4471991fcb6663852023dad568931c1314b55cc81892ca37f08e45",
  name: "exportSavedKeywords",
  filename: "src/serverFunctions/keywords.ts"
}, (opts) => exportSavedKeywords.__executeServer(opts));
const exportSavedKeywords = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(exportSavedKeywordsSchema).handler(exportSavedKeywords_createServerFn_handler, async ({
  data,
  context
}) => {
  return KeywordResearchService.exportSavedKeywords({
    ...data,
    projectId: context.projectId
  });
});
const updateSavedKeywordTags_createServerFn_handler = createServerRpc({
  id: "0f196e5eafbe1adb2d3f31aa7558728e7648574a837571aa8f8f35b94a56d562",
  name: "updateSavedKeywordTags",
  filename: "src/serverFunctions/keywords.ts"
}, (opts) => updateSavedKeywordTags.__executeServer(opts));
const updateSavedKeywordTags = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(updateSavedKeywordTagsSchema).handler(updateSavedKeywordTags_createServerFn_handler, async ({
  data,
  context
}) => {
  return KeywordResearchService.updateSavedKeywordTags({
    ...data,
    projectId: context.projectId
  });
});
const updateSavedKeywordTag_createServerFn_handler = createServerRpc({
  id: "3b7a7d39821bb858a8e568dde7f4b7c984fdcbb1b94e2a1b26d91fdf25ff537f",
  name: "updateSavedKeywordTag",
  filename: "src/serverFunctions/keywords.ts"
}, (opts) => updateSavedKeywordTag.__executeServer(opts));
const updateSavedKeywordTag = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(updateSavedKeywordTagSchema).handler(updateSavedKeywordTag_createServerFn_handler, async ({
  data,
  context
}) => {
  return KeywordResearchService.updateSavedKeywordTag({
    ...data,
    projectId: context.projectId
  });
});
const deleteSavedKeywordTag_createServerFn_handler = createServerRpc({
  id: "9ce7a2858b82783ef908f4396d61f4645b09ab4cbc435936a1495f8c23bcdb8d",
  name: "deleteSavedKeywordTag",
  filename: "src/serverFunctions/keywords.ts"
}, (opts) => deleteSavedKeywordTag.__executeServer(opts));
const deleteSavedKeywordTag = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(deleteSavedKeywordTagSchema).handler(deleteSavedKeywordTag_createServerFn_handler, async ({
  data,
  context
}) => {
  return KeywordResearchService.deleteSavedKeywordTag({
    ...data,
    projectId: context.projectId
  });
});
const removeSavedKeywords_createServerFn_handler = createServerRpc({
  id: "1e8f375975f9b25f935c01e1ed6d63147b5a7fe8693c2737dcc1869d8ef97f3b",
  name: "removeSavedKeywords",
  filename: "src/serverFunctions/keywords.ts"
}, (opts) => removeSavedKeywords.__executeServer(opts));
const removeSavedKeywords = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(removeSavedKeywordsSchema).handler(removeSavedKeywords_createServerFn_handler, async ({
  data,
  context
}) => {
  return KeywordResearchService.removeSavedKeywords(context.projectId, data);
});
const refreshSavedKeywordMetrics_createServerFn_handler = createServerRpc({
  id: "0a0791b200d03eb44d9630e461ef914d1da85bde9c95b201dcbeb94624848971",
  name: "refreshSavedKeywordMetrics",
  filename: "src/serverFunctions/keywords.ts"
}, (opts) => refreshSavedKeywordMetrics.__executeServer(opts));
const refreshSavedKeywordMetrics = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(refreshSavedKeywordMetricsSchema).handler(refreshSavedKeywordMetrics_createServerFn_handler, async ({
  context
}) => {
  return KeywordResearchService.refreshSavedKeywordMetrics({
    projectId: context.projectId
  }, context);
});
const getSerpAnalysis_createServerFn_handler = createServerRpc({
  id: "a19f7c4228fdbf301aeba791a8732ae65a0018a25d353bdeed6343876396dd0d",
  name: "getSerpAnalysis",
  filename: "src/serverFunctions/keywords.ts"
}, (opts) => getSerpAnalysis.__executeServer(opts));
const getSerpAnalysis = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(serpAnalysisSchema).handler(getSerpAnalysis_createServerFn_handler, async ({
  data,
  context
}) => KeywordResearchService.getSerpAnalysis({
  ...data,
  ...resolveMarket(data, context.project),
  projectId: context.projectId
}, context));
export {
  deleteSavedKeywordTag_createServerFn_handler,
  exportSavedKeywords_createServerFn_handler,
  getSavedKeywords_createServerFn_handler,
  getSerpAnalysis_createServerFn_handler,
  refreshSavedKeywordMetrics_createServerFn_handler,
  removeSavedKeywords_createServerFn_handler,
  researchKeywords_createServerFn_handler,
  saveKeywords_createServerFn_handler,
  updateSavedKeywordTag_createServerFn_handler,
  updateSavedKeywordTags_createServerFn_handler
};
