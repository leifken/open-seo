import { c as createServerRpc } from "./createServerRpc-C4IDcroA.js";
import { a6 as db, bx as auditIssues, by as backlinkSnapshots, aS as Ga4ConnectionRepository, bz as GscConnectionRepository, bA as ActivationRepository, bB as normalizeBacklinksTarget, bC as createDataforseoClient, Y as RankTrackingRepository, _ as getLatestResults, bq as AuditRepository, h as createServerFn } from "../entry.js";
import { countDistinct, eq, desc } from "drizzle-orm";
import { r as requireProjectContext } from "./middleware-Doy-pxkJ.js";
import { d as dashboardProjectInputSchema } from "./dashboard-BcRjxeb9.js";
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
async function getIssueTypePageCountsForAudit(auditId) {
  return db.select({
    issueType: auditIssues.issueType,
    severity: auditIssues.severity,
    pages: countDistinct(auditIssues.pageUrl)
  }).from(auditIssues).where(eq(auditIssues.auditId, auditId)).groupBy(auditIssues.issueType, auditIssues.severity);
}
async function getLatestForProject(projectId) {
  const rows = await db.select().from(backlinkSnapshots).where(eq(backlinkSnapshots.projectId, projectId)).orderBy(desc(backlinkSnapshots.id)).limit(1);
  return rows[0] ?? null;
}
async function insert(values) {
  const [row] = await db.insert(backlinkSnapshots).values(values).returning();
  if (!row) {
    throw new Error("Failed to insert backlink_snapshot");
  }
  return row;
}
const BacklinkSnapshotRepository = {
  getLatestForProject,
  insert
};
const SNAPSHOT_MAX_AGE_MS = 24 * 60 * 60 * 1e3;
const MAX_CONFIGS_FOR_OVERVIEW = 5;
async function getActivation(input) {
  const [ga4, gsc, orgActivation, projectActivation] = await Promise.all([
    Ga4ConnectionRepository.getByProjectId(input.projectId),
    GscConnectionRepository.getByProjectId(input.projectId),
    ActivationRepository.getOrganizationActivation(input.organizationId),
    ActivationRepository.getProjectActivation(input.projectId)
  ]);
  return {
    domain: input.domain,
    ga4: {
      connected: ga4 !== null,
      propertyDisplayName: ga4?.propertyDisplayName ?? null,
      cardDismissedAt: projectActivation?.ga4CardDismissedAt ?? null
    },
    gsc: { connected: gsc !== null, siteUrl: gsc?.siteUrl ?? null },
    mcp: {
      authorizedAt: orgActivation?.firstMcpAuthorizedAt ?? null,
      firstToolCallAt: orgActivation?.firstMcpToolCallAt ?? null,
      cardDismissedAt: projectActivation?.mcpCardDismissedAt ?? null
    },
    competitorClickedAt: projectActivation?.competitorStepClickedAt ?? null
  };
}
async function getOverview(input) {
  const [rank, audit, backlinks] = await Promise.all([
    getRankSummary(input.projectId),
    getAuditSummary(input.projectId),
    getBacklinkSummary(input.projectId, input.domain)
  ]);
  return { rank, audit, backlinks };
}
async function getRankSummary(projectId) {
  const configs = await RankTrackingRepository.getConfigsForProject(projectId);
  if (configs.length === 0) return null;
  const results = await Promise.all(
    configs.slice(0, MAX_CONFIGS_FOR_OVERVIEW).map((config) => getLatestResults(config.id, projectId, "7d"))
  );
  const summary = {
    trackedKeywords: 0,
    improved: 0,
    declined: 0,
    top10: 0,
    lastCheckedAt: null
  };
  for (const result of results) {
    summary.trackedKeywords += result.rows.length;
    if (result.run?.lastCheckedAt && (!summary.lastCheckedAt || result.run.lastCheckedAt > summary.lastCheckedAt)) {
      summary.lastCheckedAt = result.run.lastCheckedAt;
    }
    for (const row of result.rows) {
      for (const device of ["desktop", "mobile"]) {
        const { position, previousPosition } = row[device];
        if (position !== null && position <= 10) summary.top10 += 1;
        if (position === null || previousPosition === null) continue;
        if (position < previousPosition) summary.improved += 1;
        else if (position > previousPosition) summary.declined += 1;
      }
    }
  }
  return summary;
}
async function getAuditSummary(projectId) {
  const audit = await AuditRepository.getLatestAuditForProject(projectId);
  if (!audit) return null;
  const typeRows = await getIssueTypePageCountsForAudit(audit.id);
  const severityRank = { critical: 0, warning: 1, info: 2 };
  const sorted = typeRows.map((row) => ({
    issueType: row.issueType,
    severity: row.severity,
    count: row.pages
  })).toSorted(
    (a, b) => severityRank[a.severity] - severityRank[b.severity] || b.count - a.count
  );
  return {
    status: audit.status,
    pagesCrawled: audit.pagesCrawled,
    startedAt: audit.startedAt,
    topIssues: sorted.slice(0, 3),
    totalIssueTypes: sorted.length
  };
}
function isSnapshotFresh(capturedAt) {
  const capturedMs = Date.parse(capturedAt);
  if (Number.isNaN(capturedMs)) return false;
  return Date.now() - capturedMs < SNAPSHOT_MAX_AGE_MS;
}
async function getBacklinkSummary(projectId, domain) {
  if (!domain) return null;
  const snapshot = await BacklinkSnapshotRepository.getLatestForProject(projectId);
  if (!snapshot || snapshot.domain !== domain) return null;
  return {
    domain: snapshot.domain,
    rank: snapshot.rank,
    backlinks: snapshot.backlinks,
    referringDomains: snapshot.referringDomains,
    newBacklinks: snapshot.newBacklinks,
    lostBacklinks: snapshot.lostBacklinks,
    newReferringDomains: snapshot.newReferringDomains,
    lostReferringDomains: snapshot.lostReferringDomains,
    capturedAt: snapshot.capturedAt,
    stale: !isSnapshotFresh(snapshot.capturedAt)
  };
}
async function ensureBacklinkSnapshot(input) {
  const { projectId, domain } = input;
  if (!domain) return null;
  const latest = await BacklinkSnapshotRepository.getLatestForProject(projectId);
  const latestMatchesDomain = latest !== null && latest.domain === domain;
  if (latest && latestMatchesDomain && isSnapshotFresh(latest.capturedAt)) {
    return getBacklinkSummary(projectId, domain);
  }
  const normalized = normalizeBacklinksTarget(domain, { scope: "subdomains" });
  const dataforseo = createDataforseoClient(input.billingCustomer);
  try {
    const summary = await dataforseo.backlinks.summary({
      target: normalized.apiTarget,
      includeSubdomains: normalized.includeSubdomains
    });
    await BacklinkSnapshotRepository.insert({
      projectId,
      domain,
      rank: summary.rank ?? null,
      backlinks: summary.backlinks ?? null,
      referringDomains: summary.referring_domains ?? null,
      brokenBacklinks: summary.broken_backlinks ?? null,
      newBacklinks: summary.new_backlinks ?? null,
      lostBacklinks: summary.lost_backlinks ?? null,
      newReferringDomains: summary.new_referring_domains ?? summary.new_reffering_domains ?? null,
      lostReferringDomains: summary.lost_referring_domains ?? summary.lost_reffering_domains ?? null,
      capturedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    if (latestMatchesDomain) {
      console.error("dashboard: backlink snapshot refresh failed", error);
      return getBacklinkSummary(projectId, domain);
    }
    throw error;
  }
  return getBacklinkSummary(projectId, domain);
}
const DashboardService = {
  getActivation,
  getOverview,
  ensureBacklinkSnapshot
};
const getDashboardActivation_createServerFn_handler = createServerRpc({
  id: "a966ba8dbd2e5e2548b12a6c770c26da924f90ee327285fecd7df1d7afeafe95",
  name: "getDashboardActivation",
  filename: "src/serverFunctions/dashboard.ts"
}, (opts) => getDashboardActivation.__executeServer(opts));
const getDashboardActivation = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(dashboardProjectInputSchema).handler(getDashboardActivation_createServerFn_handler, ({
  context
}) => DashboardService.getActivation({
  projectId: context.projectId,
  organizationId: context.organizationId,
  domain: context.project.domain
}));
const getDashboardOverview_createServerFn_handler = createServerRpc({
  id: "bf7707a336fe5f1a810d29eb9ddb4ccee4b8a2f0ce88e94d04a295456d7e71d1",
  name: "getDashboardOverview",
  filename: "src/serverFunctions/dashboard.ts"
}, (opts) => getDashboardOverview.__executeServer(opts));
const getDashboardOverview = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(dashboardProjectInputSchema).handler(getDashboardOverview_createServerFn_handler, ({
  context
}) => DashboardService.getOverview({
  projectId: context.projectId,
  domain: context.project.domain
}));
const refreshDashboardBacklinkSnapshot_createServerFn_handler = createServerRpc({
  id: "d8e8c6a9e4e7768403aa7d208c2346921cf9660a816886bf406dc62cd437a155",
  name: "refreshDashboardBacklinkSnapshot",
  filename: "src/serverFunctions/dashboard.ts"
}, (opts) => refreshDashboardBacklinkSnapshot.__executeServer(opts));
const refreshDashboardBacklinkSnapshot = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(dashboardProjectInputSchema).handler(refreshDashboardBacklinkSnapshot_createServerFn_handler, ({
  context
}) => DashboardService.ensureBacklinkSnapshot({
  projectId: context.projectId,
  domain: context.project.domain,
  billingCustomer: context
}));
const markDashboardCompetitorClicked_createServerFn_handler = createServerRpc({
  id: "7c953889116b01175d89dce1f11398e791a804844e06a729e8a40679c8e32137",
  name: "markDashboardCompetitorClicked",
  filename: "src/serverFunctions/dashboard.ts"
}, (opts) => markDashboardCompetitorClicked.__executeServer(opts));
const markDashboardCompetitorClicked = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(dashboardProjectInputSchema).handler(markDashboardCompetitorClicked_createServerFn_handler, async ({
  context
}) => {
  await ActivationRepository.markCompetitorStepClicked(context.projectId);
  return {
    ok: true
  };
});
const dismissDashboardMcpCard_createServerFn_handler = createServerRpc({
  id: "8ea81290b22122bff668b72a4292383130de89933a300adb2f16caed61f53731",
  name: "dismissDashboardMcpCard",
  filename: "src/serverFunctions/dashboard.ts"
}, (opts) => dismissDashboardMcpCard.__executeServer(opts));
const dismissDashboardMcpCard = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(dashboardProjectInputSchema).handler(dismissDashboardMcpCard_createServerFn_handler, async ({
  context
}) => {
  await ActivationRepository.markMcpCardDismissed(context.projectId);
  return {
    ok: true
  };
});
const dismissDashboardGa4Card_createServerFn_handler = createServerRpc({
  id: "39b646e1b210269ed692e316a1456d18b70794e8f2dd13b038ab141fc56de0c7",
  name: "dismissDashboardGa4Card",
  filename: "src/serverFunctions/dashboard.ts"
}, (opts) => dismissDashboardGa4Card.__executeServer(opts));
const dismissDashboardGa4Card = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(dashboardProjectInputSchema).handler(dismissDashboardGa4Card_createServerFn_handler, async ({
  context
}) => {
  await ActivationRepository.markGa4CardDismissed(context.projectId);
  return {
    ok: true
  };
});
export {
  dismissDashboardGa4Card_createServerFn_handler,
  dismissDashboardMcpCard_createServerFn_handler,
  getDashboardActivation_createServerFn_handler,
  getDashboardOverview_createServerFn_handler,
  markDashboardCompetitorClicked_createServerFn_handler,
  refreshDashboardBacklinkSnapshot_createServerFn_handler
};
