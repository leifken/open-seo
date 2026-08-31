import { z } from "zod";
import { ao as domainField, ap as rankTrackingConfigs, aq as isSupportedLanguageCode, ar as MAX_TRACKED_KEYWORD_LENGTH } from "../entry.js";
const devicesEnum = z.enum(rankTrackingConfigs.devices.enumValues);
const scheduleEnum = z.enum(rankTrackingConfigs.scheduleInterval.enumValues);
const languageCodeField = z.string().max(10).refine(isSupportedLanguageCode, "Unsupported language code");
const getConfigsSchema = z.object({
  projectId: z.string().uuid()
});
const createConfigSchema = z.object({
  projectId: z.string().uuid(),
  domain: domainField,
  locationCode: z.number().int().positive().optional(),
  languageCode: languageCodeField.optional(),
  locationName: z.string().min(1).max(200).optional(),
  devices: devicesEnum.optional(),
  serpDepth: z.number().int().min(10).max(100).multipleOf(10),
  scheduleInterval: scheduleEnum.optional()
});
const updateConfigSchema = z.object({
  projectId: z.string().uuid(),
  configId: z.string().uuid(),
  domain: domainField.optional(),
  locationCode: z.number().int().positive().optional(),
  languageCode: languageCodeField.optional(),
  locationName: z.string().min(1).max(200).nullable().optional(),
  devices: devicesEnum.optional(),
  serpDepth: z.number().int().min(10).max(100).multipleOf(10).optional(),
  scheduleInterval: scheduleEnum.optional(),
  isActive: z.boolean().optional()
});
const triggerCheckSchema = z.object({
  projectId: z.string().uuid(),
  configId: z.string().uuid(),
  keywordIds: z.array(z.string().uuid()).max(2e3).optional()
});
const comparePeriodSchema = z.enum(["1d", "7d", "30d", "90d"]);
const getLatestResultsSchema = z.object({
  projectId: z.string().uuid(),
  configId: z.string().uuid(),
  comparePeriod: comparePeriodSchema.optional()
});
const getLatestRunSchema = z.object({
  projectId: z.string().uuid(),
  configId: z.string().uuid()
});
const estimateCostSchema = z.object({
  projectId: z.string().uuid(),
  configId: z.string().uuid()
});
const addKeywordsSchema = z.object({
  projectId: z.string().uuid(),
  configId: z.string().uuid(),
  keywords: z.array(z.string().min(1).max(MAX_TRACKED_KEYWORD_LENGTH)).min(1).max(2e3)
});
const removeKeywordsSchema = z.object({
  projectId: z.string().uuid(),
  configId: z.string().uuid(),
  keywordIds: z.array(z.string().uuid()).min(1).max(2e3)
});
const refreshMetricsSchema = z.object({
  projectId: z.string().uuid(),
  configId: z.string().uuid()
});
const deviceEnum = z.enum(["desktop", "mobile"]);
const sinceDaysField = z.number().int().positive().max(730).default(365);
const getKeywordHistorySchema = z.object({
  projectId: z.string().uuid(),
  configId: z.string().uuid(),
  trackingKeywordId: z.string().uuid(),
  sinceDays: sinceDaysField
});
const getConfigTrendSchema = z.object({
  projectId: z.string().uuid(),
  configId: z.string().uuid(),
  device: deviceEnum,
  sinceDays: sinceDaysField
});
const getPositionMatrixSchema = z.object({
  projectId: z.string().uuid(),
  configId: z.string().uuid(),
  device: deviceEnum,
  runLimit: z.number().int().positive().max(26).default(12)
});
export {
  getLatestResultsSchema as a,
  getLatestRunSchema as b,
  createConfigSchema as c,
  addKeywordsSchema as d,
  estimateCostSchema as e,
  refreshMetricsSchema as f,
  getConfigsSchema as g,
  getKeywordHistorySchema as h,
  getConfigTrendSchema as i,
  getPositionMatrixSchema as j,
  removeKeywordsSchema as r,
  triggerCheckSchema as t,
  updateConfigSchema as u
};
