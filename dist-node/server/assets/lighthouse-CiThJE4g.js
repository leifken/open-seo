import { z } from "zod";
import { L as LIGHTHOUSE_CATEGORY_TABS, a as LIGHTHOUSE_CATEGORIES } from "./lighthouse-CxIZIYPF.js";
const lighthouseAuditIssueSchema = z.object({
  projectId: z.string().min(1, "Project id is required"),
  resultId: z.string().min(1, "Result id is required")
});
const lighthouseAuditExportSchema = z.object({
  projectId: z.string().min(1, "Project id is required"),
  resultId: z.string().min(1, "Result id is required"),
  mode: z.enum(["full", "issues", "category"]),
  category: z.enum(LIGHTHOUSE_CATEGORIES).optional()
});
const lighthouseIssuesSearchSchema = z.object({
  auditId: z.string().optional().catch(void 0),
  category: z.enum(LIGHTHOUSE_CATEGORY_TABS).catch("all").default("all")
});
export {
  lighthouseAuditExportSchema as a,
  lighthouseIssuesSearchSchema as b,
  lighthouseAuditIssueSchema as l
};
