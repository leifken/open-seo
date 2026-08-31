import { c as createServerRpc } from "./createServerRpc-C4IDcroA.js";
import { bg as organization, a7 as db, b4 as getAuthMode, a5 as env, a0 as AppError, a8 as projects, bh as organizationActivationState, bi as SHARED_WORKSPACE_ORGANIZATION_ID, bj as runBatch, ac as userOnboardingAnswers, bk as gscConnections, bl as ga4Connections, h as createServerFn } from "../entry.js";
import { like, and, inArray, eq, isNull } from "drizzle-orm";
import { a as requireAuthenticatedContext } from "./middleware-CvzXieP6.js";
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
function earliest(values) {
  return values.filter((value) => value !== null).toSorted()[0] ?? null;
}
const legacyWorkspaceFilter = like(organization.id, "delegated-%");
async function countLegacyWorkspaces() {
  const rows = await db.select({ id: organization.id }).from(organization).where(legacyWorkspaceFilter);
  return rows.length;
}
async function mergeLegacyWorkspaces$1() {
  if (getAuthMode(env.AUTH_MODE) !== "cloudflare_access") {
    throw new AppError(
      "FORBIDDEN",
      "Workspace merge is only available in cloudflare_access auth mode."
    );
  }
  const legacyOrgs = await db.select({ id: organization.id, name: organization.name }).from(organization).where(legacyWorkspaceFilter);
  if (legacyOrgs.length === 0) {
    return { mergedWorkspaces: 0 };
  }
  const legacyIds = legacyOrgs.map((org) => org.id);
  const ownerLabelByOrgId = new Map(
    legacyOrgs.map((org) => [org.id, org.name.replace(/ workspace$/, "")])
  );
  const conflictingDefaults = await db.select({ id: projects.id, organizationId: projects.organizationId }).from(projects).where(
    and(
      inArray(projects.organizationId, legacyIds),
      eq(projects.name, "Default"),
      isNull(projects.domain),
      isNull(projects.archivedAt)
    )
  );
  const activationRows = await db.select().from(organizationActivationState).where(
    inArray(organizationActivationState.organizationId, [
      SHARED_WORKSPACE_ORGANIZATION_ID,
      ...legacyIds
    ])
  );
  const mergedActivation = {
    firstMcpAuthorizedAt: earliest(
      activationRows.map((row) => row.firstMcpAuthorizedAt)
    ),
    firstMcpToolCallAt: earliest(
      activationRows.map((row) => row.firstMcpToolCallAt)
    )
  };
  const repointToShared = { organizationId: SHARED_WORKSPACE_ORGANIZATION_ID };
  await runBatch((tx) => [
    ...conflictingDefaults.map(
      (project) => tx.update(projects).set({
        name: `Default (${ownerLabelByOrgId.get(project.organizationId) ?? "imported"})`
      }).where(eq(projects.id, project.id))
    ),
    tx.update(projects).set(repointToShared).where(inArray(projects.organizationId, legacyIds)),
    tx.update(userOnboardingAnswers).set(repointToShared).where(inArray(userOnboardingAnswers.organizationId, legacyIds)),
    tx.update(gscConnections).set(repointToShared).where(inArray(gscConnections.organizationId, legacyIds)),
    tx.update(ga4Connections).set(repointToShared).where(inArray(ga4Connections.organizationId, legacyIds)),
    ...activationRows.length > 0 ? [
      tx.insert(organizationActivationState).values({
        organizationId: SHARED_WORKSPACE_ORGANIZATION_ID,
        ...mergedActivation
      }).onConflictDoUpdate({
        target: organizationActivationState.organizationId,
        set: mergedActivation
      })
    ] : [],
    // Everything user-visible is repointed above; deleting the legacy orgs
    // cascades away only the per-org leftovers (members, billing status,
    // legacy activation rows).
    tx.delete(organization).where(inArray(organization.id, legacyIds))
  ]);
  return { mergedWorkspaces: legacyOrgs.length };
}
const WorkspaceMergeService = {
  countLegacyWorkspaces,
  mergeLegacyWorkspaces: mergeLegacyWorkspaces$1
};
function isCloudflareAccessMode() {
  return getAuthMode(env.AUTH_MODE) === "cloudflare_access";
}
const getWorkspaceMergeStatus_createServerFn_handler = createServerRpc({
  id: "bae0716c278ff567d6fca6035b6fc999ec74301979582cb6eb930ca66771f85f",
  name: "getWorkspaceMergeStatus",
  filename: "src/serverFunctions/workspace.ts"
}, (opts) => getWorkspaceMergeStatus.__executeServer(opts));
const getWorkspaceMergeStatus = createServerFn({
  method: "POST"
}).middleware(requireAuthenticatedContext).handler(getWorkspaceMergeStatus_createServerFn_handler, async () => {
  if (!isCloudflareAccessMode()) {
    return {
      legacyWorkspaceCount: 0
    };
  }
  return {
    legacyWorkspaceCount: await WorkspaceMergeService.countLegacyWorkspaces()
  };
});
const mergeLegacyWorkspaces_createServerFn_handler = createServerRpc({
  id: "dd3518eb8d7349f47f651bb345e6a70e7b48073f2557d873f09c577b0deab0bb",
  name: "mergeLegacyWorkspaces",
  filename: "src/serverFunctions/workspace.ts"
}, (opts) => mergeLegacyWorkspaces.__executeServer(opts));
const mergeLegacyWorkspaces = createServerFn({
  method: "POST"
}).middleware(requireAuthenticatedContext).handler(mergeLegacyWorkspaces_createServerFn_handler, async () => WorkspaceMergeService.mergeLegacyWorkspaces());
export {
  getWorkspaceMergeStatus_createServerFn_handler,
  mergeLegacyWorkspaces_createServerFn_handler
};
