import { c as createServerRpc } from "./createServerRpc-C4IDcroA.js";
import { h as createServerFn, Y as RankTrackingRepository, Z as RankTrackingService, E as waitUntil, F as captureServerEvent, _ as getLatestResults, $ as asAppError, a0 as AppError } from "../entry.js";
import { r as requireProjectContext } from "./middleware-Doy-pxkJ.js";
import { g as getConfigsSchema, c as createConfigSchema, u as updateConfigSchema, t as triggerCheckSchema, a as getLatestResultsSchema, b as getLatestRunSchema, e as estimateCostSchema, d as addKeywordsSchema, r as removeKeywordsSchema, f as refreshMetricsSchema, h as getKeywordHistorySchema, i as getConfigTrendSchema, j as getPositionMatrixSchema } from "./rank-tracking-BD8SoYpX.js";
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
async function requireConfig(configId, projectId) {
  const config = await RankTrackingRepository.getConfigById({
    configId,
    projectId
  });
  if (!config) {
    throw new AppError("INTERNAL_ERROR", "Rank tracking config not found");
  }
  return config;
}
const getRankTrackingConfigs_createServerFn_handler = createServerRpc({
  id: "2498dc9ae1c9692a93484405a16016aa8af2296e6a6ac6c892aeff22c4154f17",
  name: "getRankTrackingConfigs",
  filename: "src/serverFunctions/rank-tracking.ts"
}, (opts) => getRankTrackingConfigs.__executeServer(opts));
const getRankTrackingConfigs = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(getConfigsSchema).handler(getRankTrackingConfigs_createServerFn_handler, async ({
  context
}) => {
  return RankTrackingRepository.getConfigsForProject(context.projectId);
});
const getRankTrackingConfigSummaries_createServerFn_handler = createServerRpc({
  id: "bb79e98e928653ebc50e8c4bfd905ed74cfd81dc4ad11c40a96e517c7a538648",
  name: "getRankTrackingConfigSummaries",
  filename: "src/serverFunctions/rank-tracking.ts"
}, (opts) => getRankTrackingConfigSummaries.__executeServer(opts));
const getRankTrackingConfigSummaries = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(getConfigsSchema).handler(getRankTrackingConfigSummaries_createServerFn_handler, async ({
  context
}) => {
  return RankTrackingRepository.getConfigSummaries(context.projectId);
});
const createRankTrackingConfig_createServerFn_handler = createServerRpc({
  id: "258d28f360a42fb9dc6a60c60b05f23782f2fe2bf58c46d6e683b5d80693aadf",
  name: "createRankTrackingConfig",
  filename: "src/serverFunctions/rank-tracking.ts"
}, (opts) => createRankTrackingConfig.__executeServer(opts));
const createRankTrackingConfig = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(createConfigSchema).handler(createRankTrackingConfig_createServerFn_handler, async ({
  data,
  context
}) => {
  const result = await RankTrackingService.createConfig({
    projectId: context.projectId,
    projectMarket: context.project,
    domain: data.domain,
    locationCode: data.locationCode,
    languageCode: data.languageCode,
    locationName: data.locationName,
    devices: data.devices,
    serpDepth: data.serpDepth,
    scheduleInterval: data.scheduleInterval
  });
  waitUntil(captureServerEvent({
    distinctId: context.userId,
    event: "rank_tracking:config_create",
    organizationId: context.organizationId,
    properties: {
      project_id: context.projectId,
      domain: data.domain,
      devices: data.devices ?? "both",
      schedule: data.scheduleInterval ?? "weekly"
    }
  }));
  return result;
});
const updateRankTrackingConfig_createServerFn_handler = createServerRpc({
  id: "16b8b61d3cfc645bc36be38a136d9d7ad7096edf8550536a9b522e2833bd5c45",
  name: "updateRankTrackingConfig",
  filename: "src/serverFunctions/rank-tracking.ts"
}, (opts) => updateRankTrackingConfig.__executeServer(opts));
const updateRankTrackingConfig = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(updateConfigSchema).handler(updateRankTrackingConfig_createServerFn_handler, async ({
  data,
  context
}) => {
  await RankTrackingService.updateConfig(data.configId, context.projectId, {
    domain: data.domain,
    locationCode: data.locationCode,
    languageCode: data.languageCode,
    locationName: data.locationName,
    devices: data.devices,
    serpDepth: data.serpDepth,
    scheduleInterval: data.scheduleInterval,
    isActive: data.isActive
  });
  return {
    success: true
  };
});
const triggerRankCheck_createServerFn_handler = createServerRpc({
  id: "0e2299d91fe830180a5418ad53dd35b4fca59a0bcbd2727c9f3eff6680a88592",
  name: "triggerRankCheck",
  filename: "src/serverFunctions/rank-tracking.ts"
}, (opts) => triggerRankCheck.__executeServer(opts));
const triggerRankCheck = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(triggerCheckSchema).handler(triggerRankCheck_createServerFn_handler, async ({
  data,
  context
}) => {
  const result = await RankTrackingService.triggerCheck({
    configId: data.configId,
    projectId: context.projectId,
    billingCustomer: context,
    keywordIds: data.keywordIds
  });
  if (result.ok) {
    waitUntil(captureServerEvent({
      distinctId: context.userId,
      event: "rank_tracking:check_trigger",
      organizationId: context.organizationId,
      properties: {
        project_id: context.projectId,
        config_id: data.configId,
        run_id: result.runId
      }
    }));
  }
  return result;
});
const getLatestRankResults_createServerFn_handler = createServerRpc({
  id: "ddd165935e6b49d3557cb04d17f77f9775c81fbb0c0f735387a032421a266542",
  name: "getLatestRankResults",
  filename: "src/serverFunctions/rank-tracking.ts"
}, (opts) => getLatestRankResults.__executeServer(opts));
const getLatestRankResults = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(getLatestResultsSchema).handler(getLatestRankResults_createServerFn_handler, async ({
  data,
  context
}) => {
  return getLatestResults(data.configId, context.projectId, data.comparePeriod);
});
const getLatestRankRun_createServerFn_handler = createServerRpc({
  id: "e07b0dfacb31a403133cc5bf5e671e8b7735dd63c2c993749b4ecd399e779acb",
  name: "getLatestRankRun",
  filename: "src/serverFunctions/rank-tracking.ts"
}, (opts) => getLatestRankRun.__executeServer(opts));
const getLatestRankRun = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(getLatestRunSchema).handler(getLatestRankRun_createServerFn_handler, async ({
  data,
  context
}) => {
  return RankTrackingService.getLatestRun(data.configId, context.projectId);
});
const estimateRankCheckCost_createServerFn_handler = createServerRpc({
  id: "1e3e63b95fa90f1fafbcda79f9999a31747ab722474f0eae185243ffdd1b06ab",
  name: "estimateRankCheckCost",
  filename: "src/serverFunctions/rank-tracking.ts"
}, (opts) => estimateRankCheckCost.__executeServer(opts));
const estimateRankCheckCost = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(estimateCostSchema).handler(estimateRankCheckCost_createServerFn_handler, async ({
  data,
  context
}) => {
  return RankTrackingService.estimateCost(data.configId, context.projectId);
});
function logAutoActionFailure(action, err) {
  const appErr = asAppError(err);
  if (appErr?.code === "PAYMENT_REQUIRED") {
    console.info(`[rank-tracking] ${action} skipped: paid plan required`);
  } else if (appErr?.code === "INSUFFICIENT_CREDITS") {
    console.info(`[rank-tracking] ${action} skipped: insufficient credits`);
  } else {
    console.error(`[rank-tracking] ${action} failed:`, err);
  }
}
const addTrackingKeywords_createServerFn_handler = createServerRpc({
  id: "9632bd92f3de61b172319c2b693ceaafbbc52f214ba2a4fb93531fefa5b96d74",
  name: "addTrackingKeywords",
  filename: "src/serverFunctions/rank-tracking.ts"
}, (opts) => addTrackingKeywords.__executeServer(opts));
const addTrackingKeywords = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(addKeywordsSchema).handler(addTrackingKeywords_createServerFn_handler, async ({
  data,
  context
}) => {
  const result = await RankTrackingService.addKeywords(data.configId, context.projectId, data.keywords, {
    kind: "direct_user_action"
  });
  let checkTriggered = false;
  if (result.addedIds.length > 0) {
    try {
      const triggerResult = await RankTrackingService.triggerCheck({
        configId: data.configId,
        projectId: context.projectId,
        billingCustomer: context,
        keywordIds: result.addedIds
      });
      checkTriggered = triggerResult.ok;
      if (!triggerResult.ok) {
        console.info("[rank-tracking] auto-check skipped: %s", triggerResult.reason);
      }
    } catch (err) {
      logAutoActionFailure("auto-check", err);
    }
  }
  if (result.added > 0) {
    try {
      await RankTrackingService.refreshKeywordMetrics(data.configId, context.projectId, context);
    } catch (err) {
      logAutoActionFailure("auto-metrics-refresh", err);
    }
  }
  return {
    ...result,
    checkTriggered
  };
});
const removeTrackingKeywords_createServerFn_handler = createServerRpc({
  id: "d034f8888a5e1014831023cf2a868291cfd466101140d59d1f4251fd53203037",
  name: "removeTrackingKeywords",
  filename: "src/serverFunctions/rank-tracking.ts"
}, (opts) => removeTrackingKeywords.__executeServer(opts));
const removeTrackingKeywords = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(removeKeywordsSchema).handler(removeTrackingKeywords_createServerFn_handler, async ({
  data,
  context
}) => {
  return RankTrackingService.removeKeywords(data.configId, context.projectId, data.keywordIds);
});
const refreshTrackingKeywordMetrics_createServerFn_handler = createServerRpc({
  id: "17c1167140bde128372935a660b28fd6e0e183774ca3f90271799ba787ecb243",
  name: "refreshTrackingKeywordMetrics",
  filename: "src/serverFunctions/rank-tracking.ts"
}, (opts) => refreshTrackingKeywordMetrics.__executeServer(opts));
const refreshTrackingKeywordMetrics = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(refreshMetricsSchema).handler(refreshTrackingKeywordMetrics_createServerFn_handler, async ({
  data,
  context
}) => {
  const result = await RankTrackingService.refreshKeywordMetrics(data.configId, context.projectId, context);
  waitUntil(captureServerEvent({
    distinctId: context.userId,
    event: "rank_tracking:metrics_refresh",
    organizationId: context.organizationId,
    properties: {
      project_id: context.projectId,
      config_id: data.configId,
      updated: result.updated
    }
  }));
  return result;
});
const getRankKeywordHistory_createServerFn_handler = createServerRpc({
  id: "e808431fe24faa5cddaa82ff3cee05037bdd2ddd1ba1ceef693aac01ca8e68bc",
  name: "getRankKeywordHistory",
  filename: "src/serverFunctions/rank-tracking.ts"
}, (opts) => getRankKeywordHistory.__executeServer(opts));
const getRankKeywordHistory = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(getKeywordHistorySchema).handler(getRankKeywordHistory_createServerFn_handler, async ({
  data,
  context
}) => {
  await requireConfig(data.configId, context.projectId);
  return RankTrackingRepository.getKeywordHistory(data.configId, data.trackingKeywordId, data.sinceDays);
});
const getRankConfigTrend_createServerFn_handler = createServerRpc({
  id: "9da63329d53b960da32b79472469175d63f38b5e71bcef0cacabb66cba684931",
  name: "getRankConfigTrend",
  filename: "src/serverFunctions/rank-tracking.ts"
}, (opts) => getRankConfigTrend.__executeServer(opts));
const getRankConfigTrend = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(getConfigTrendSchema).handler(getRankConfigTrend_createServerFn_handler, async ({
  data,
  context
}) => {
  await requireConfig(data.configId, context.projectId);
  const rows = await RankTrackingRepository.getConfigTrend(data.configId, data.device, data.sinceDays);
  return rows.map((row) => {
    const top3 = Number(row.top3) || 0;
    const top4to10 = Number(row.top4to10) || 0;
    const top11to20 = Number(row.top11to20) || 0;
    const total = Number(row.total) || 0;
    return {
      runId: row.runId,
      checkedAt: row.checkedAt,
      top3,
      top4to10,
      top11to20,
      notRanking: Math.max(0, total - top3 - top4to10 - top11to20)
    };
  });
});
const getRankPositionMatrix_createServerFn_handler = createServerRpc({
  id: "c6715a7072113d7f7ea076796cf28e47be1bab5e1dfd14502e72467efab53306",
  name: "getRankPositionMatrix",
  filename: "src/serverFunctions/rank-tracking.ts"
}, (opts) => getRankPositionMatrix.__executeServer(opts));
const getRankPositionMatrix = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(getPositionMatrixSchema).handler(getRankPositionMatrix_createServerFn_handler, async ({
  data,
  context
}) => {
  await requireConfig(data.configId, context.projectId);
  return RankTrackingRepository.getPositionMatrix(data.configId, data.device, data.runLimit);
});
export {
  addTrackingKeywords_createServerFn_handler,
  createRankTrackingConfig_createServerFn_handler,
  estimateRankCheckCost_createServerFn_handler,
  getLatestRankResults_createServerFn_handler,
  getLatestRankRun_createServerFn_handler,
  getRankConfigTrend_createServerFn_handler,
  getRankKeywordHistory_createServerFn_handler,
  getRankPositionMatrix_createServerFn_handler,
  getRankTrackingConfigSummaries_createServerFn_handler,
  getRankTrackingConfigs_createServerFn_handler,
  refreshTrackingKeywordMetrics_createServerFn_handler,
  removeTrackingKeywords_createServerFn_handler,
  triggerRankCheck_createServerFn_handler,
  updateRankTrackingConfig_createServerFn_handler
};
