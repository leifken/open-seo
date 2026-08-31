import { c as createServerRpc } from "./createServerRpc-CXhnBwFB.js";
import { i as createServerFn, af as AuditService, F as waitUntil, I as captureServerEvent } from "../entry.js";
import { r as requireProjectContext } from "./middleware-CwR3-L1M.js";
import { s as startAuditSchema, g as getAuditStatusSchema, a as getAuditResultsSchema, b as getAuditHistorySchema, c as getCrawlProgressSchema, d as deleteAuditSchema } from "./audit-D01_HjiI.js";
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
import "remeda";
import "tldts";
import "srvx";
import "react";
import "@tanstack/react-router";
import "react/jsx-runtime";
import "@tanstack/react-router/ssr/server";
import "robots-parser";
import "fast-xml-parser";
const startAudit_createServerFn_handler = createServerRpc({
  id: "e239daa45c0dc82d2216f3ac9a60781ba3bad43f9837cb6779399d0c3d87885c",
  name: "startAudit",
  filename: "src/serverFunctions/audit.ts"
}, (opts) => startAudit.__executeServer(opts));
const startAudit = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(startAuditSchema).handler(startAudit_createServerFn_handler, async ({
  data,
  context
}) => {
  const limitTier = await AuditService.resolveAuditLimitTier(context.organizationId);
  const result = await AuditService.startAudit({
    actorUserId: context.userId,
    billingCustomer: context,
    projectId: context.projectId,
    startUrl: data.startUrl,
    maxPages: data.maxPages,
    lighthouseStrategy: data.lighthouseStrategy,
    limitTier
  });
  waitUntil(captureServerEvent({
    distinctId: context.userId,
    event: "site_audit:start",
    organizationId: context.organizationId,
    properties: {
      project_id: context.projectId,
      max_pages: data.maxPages ?? 50,
      run_lighthouse: data.lighthouseStrategy !== "none",
      plan_tier: limitTier
    }
  }));
  return result;
});
const getAuditStatus_createServerFn_handler = createServerRpc({
  id: "75f7965168786313e194a1941f91dd242a6b8c06b1cf69463eae0e9ce5dd6773",
  name: "getAuditStatus",
  filename: "src/serverFunctions/audit.ts"
}, (opts) => getAuditStatus.__executeServer(opts));
const getAuditStatus = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(getAuditStatusSchema).handler(getAuditStatus_createServerFn_handler, async ({
  data,
  context
}) => {
  return AuditService.getStatus(data.auditId, context.projectId);
});
const getAuditResults_createServerFn_handler = createServerRpc({
  id: "b85790a9585d03d2f8132b707c468c39db0e8f6c3f9921647d221ec8a3aa7a60",
  name: "getAuditResults",
  filename: "src/serverFunctions/audit.ts"
}, (opts) => getAuditResults.__executeServer(opts));
const getAuditResults = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(getAuditResultsSchema).handler(getAuditResults_createServerFn_handler, async ({
  data,
  context
}) => {
  return AuditService.getResults(data.auditId, context.projectId);
});
const getAuditHistory_createServerFn_handler = createServerRpc({
  id: "8e1e5f26a194415159d9074271d62e81c5b365b4c35612f4e23581af549700cf",
  name: "getAuditHistory",
  filename: "src/serverFunctions/audit.ts"
}, (opts) => getAuditHistory.__executeServer(opts));
const getAuditHistory = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(getAuditHistorySchema).handler(getAuditHistory_createServerFn_handler, async ({
  context
}) => {
  return AuditService.getHistory(context.projectId);
});
const getCrawlProgress_createServerFn_handler = createServerRpc({
  id: "a28e240f440a737b1ba00fa06c35615836e9658df9c6a9b04b18bd57f4533a93",
  name: "getCrawlProgress",
  filename: "src/serverFunctions/audit.ts"
}, (opts) => getCrawlProgress.__executeServer(opts));
const getCrawlProgress = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(getCrawlProgressSchema).handler(getCrawlProgress_createServerFn_handler, async ({
  data,
  context
}) => {
  return AuditService.getCrawlProgress(data.auditId, context.projectId);
});
const deleteAudit_createServerFn_handler = createServerRpc({
  id: "516782e359aa3cdba9ed9ea54db3d5b889263ae7b7a025542320a44198af7371",
  name: "deleteAudit",
  filename: "src/serverFunctions/audit.ts"
}, (opts) => deleteAudit.__executeServer(opts));
const deleteAudit = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(deleteAuditSchema).handler(deleteAudit_createServerFn_handler, async ({
  data,
  context
}) => {
  await AuditService.remove(data.auditId, context.projectId);
  return {
    success: true
  };
});
export {
  deleteAudit_createServerFn_handler,
  getAuditHistory_createServerFn_handler,
  getAuditResults_createServerFn_handler,
  getAuditStatus_createServerFn_handler,
  getCrawlProgress_createServerFn_handler,
  startAudit_createServerFn_handler
};
