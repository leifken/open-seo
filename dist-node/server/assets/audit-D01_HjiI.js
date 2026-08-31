import { z } from "zod";
import { ag as MIN_AUDIT_PAGES, ah as PAID_MAX_AUDIT_PAGES, ai as DEFAULT_AUDIT_PAGES } from "../entry.js";
const startAuditSchema = z.object({
  projectId: z.string().min(1),
  startUrl: z.string().min(1, "URL is required").max(2048),
  maxPages: z.number().int().min(MIN_AUDIT_PAGES).max(PAID_MAX_AUDIT_PAGES).optional().default(DEFAULT_AUDIT_PAGES),
  lighthouseStrategy: z.enum(["auto", "none"]).optional().default("auto")
});
const getAuditStatusSchema = z.object({
  projectId: z.string().min(1),
  auditId: z.string().min(1)
});
const getAuditResultsSchema = z.object({
  projectId: z.string().min(1),
  auditId: z.string().min(1)
});
const getAuditHistorySchema = z.object({
  projectId: z.string().min(1)
});
const deleteAuditSchema = z.object({
  projectId: z.string().min(1),
  auditId: z.string().min(1)
});
const getCrawlProgressSchema = z.object({
  projectId: z.string().min(1),
  auditId: z.string().min(1)
});
const auditTabs = ["issues", "pages", "performance"];
const auditSearchSchema = z.object({
  auditId: z.string().optional().catch(void 0),
  tab: z.enum(auditTabs).catch("issues").default("issues")
});
export {
  getAuditResultsSchema as a,
  getAuditHistorySchema as b,
  getCrawlProgressSchema as c,
  deleteAuditSchema as d,
  auditSearchSchema as e,
  getAuditStatusSchema as g,
  startAuditSchema as s
};
