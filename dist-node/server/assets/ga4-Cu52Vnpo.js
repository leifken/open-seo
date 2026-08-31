import { c as createServerRpc } from "./createServerRpc-CXhnBwFB.js";
import { aZ as Ga4ConnectionRepository, a1 as AppError, a_ as createGa4AdminClient, a$ as Ga4AdminApiError, a8 as db, b0 as account, b1 as GA4_OAUTH_PROVIDER_ID, b2 as Ga4TokenError, i as createServerFn, C as isHostedServerAuthMode, E as hasSelfHostedGoogleOAuthConfig, b3 as Ga4OrganicOverviewService, b4 as Ga4ReportError, F as waitUntil, I as captureServerEvent, J as getPublicOrigin, g as getRequest, b5 as shiftGa4Date } from "../entry.js";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { c as createSelfHostedGoogleAuthorizationUrl, a as GA4_INTEGRATION } from "./selfHostedOAuth-BpCugic0.js";
import { r as requireProjectContext, a as requireAuthenticatedContext } from "./middleware-CwR3-L1M.js";
import "node:async_hooks";
import "node:crypto";
import "ioredis";
import "node:fs/promises";
import "node:path";
import "node:fs";
import "better-sqlite3";
import "bullmq";
import "postgres";
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
async function getConnection(projectId) {
  return Ga4ConnectionRepository.getByProjectId(projectId);
}
async function listGrantsForUser(userId) {
  return db.select({ id: account.id, accountId: account.accountId }).from(account).where(
    and(
      eq(account.userId, userId),
      eq(account.providerId, GA4_OAUTH_PROVIDER_ID)
    )
  );
}
async function userHasGrant(userId) {
  const grants = await listGrantsForUser(userId);
  return grants.length > 0;
}
function requiresReconnect(error) {
  return error instanceof Ga4TokenError || error instanceof Ga4AdminApiError && error.status === 401;
}
async function listPropertiesForUserWithGrantStatus(userId) {
  const grants = await listGrantsForUser(userId);
  const accounts = await Promise.all(
    grants.map(async (grant) => {
      const client = createGa4AdminClient({
        userId,
        ga4AccountId: grant.accountId
      });
      try {
        const properties = await client.listProperties();
        let email = null;
        try {
          email = await client.getUserInfoEmail();
        } catch {
          email = null;
        }
        return {
          accountId: grant.accountId,
          email,
          requiresReconnect: false,
          propertiesUnavailable: false,
          properties
        };
      } catch (error) {
        const reconnect = requiresReconnect(error);
        if (!reconnect) {
          console.error("ga4.property_discovery_failed", {
            errorName: error instanceof Error ? error.name : "UnknownError",
            status: error instanceof Ga4AdminApiError ? error.status : void 0
          });
        }
        return {
          accountId: grant.accountId,
          email: null,
          requiresReconnect: reconnect,
          propertiesUnavailable: !reconnect,
          properties: []
        };
      }
    })
  );
  return { accounts };
}
async function setProperty(input) {
  const grants = await listGrantsForUser(input.userId);
  if (!grants.some((grant) => grant.accountId === input.accountId)) {
    throw new AppError(
      "NOT_FOUND",
      "That Google account isn't connected to your OpenSEO account."
    );
  }
  const client = createGa4AdminClient({
    userId: input.userId,
    ga4AccountId: input.accountId
  });
  const properties = await client.listProperties();
  if (!properties.some((property2) => property2.propertyId === input.propertyId)) {
    throw new AppError(
      "NOT_FOUND",
      "That Google Analytics property isn't available on your connected Google account."
    );
  }
  const property = await client.getProperty(input.propertyId);
  let connectedAccountEmail = null;
  try {
    connectedAccountEmail = await client.getUserInfoEmail();
  } catch {
    connectedAccountEmail = null;
  }
  return Ga4ConnectionRepository.upsert({
    projectId: input.projectId,
    organizationId: input.organizationId,
    propertyId: property.name,
    propertyDisplayName: property.displayName,
    propertyTimeZone: property.timeZone,
    propertyCurrencyCode: property.currencyCode,
    connectedByUserId: input.userId,
    ga4AccountId: input.accountId,
    connectedAccountEmail
  });
}
async function unlinkUserGrant(userId, ga4AccountId) {
  await db.delete(account).where(
    and(
      eq(account.userId, userId),
      eq(account.providerId, GA4_OAUTH_PROVIDER_ID),
      eq(account.accountId, ga4AccountId)
    )
  );
}
async function disconnect(input) {
  const connection = await Ga4ConnectionRepository.getByProjectId(
    input.projectId
  );
  await Ga4ConnectionRepository.deleteByProjectId(input.projectId);
  if (connection?.ga4AccountId && connection.connectedByUserId === input.userId) {
    const stillUsed = await Ga4ConnectionRepository.existsForConnectorAccount(
      input.userId,
      connection.ga4AccountId
    );
    if (!stillUsed) {
      await unlinkUserGrant(input.userId, connection.ga4AccountId);
    }
  }
}
const Ga4Service = {
  getConnection,
  userHasGrant,
  listPropertiesForUserWithGrantStatus,
  setProperty,
  disconnect
};
const projectScopedSchema = z.object({
  projectId: z.string().min(1)
});
const setPropertySchema = projectScopedSchema.extend({
  accountId: z.string().min(1),
  propertyId: z.string().regex(/^properties\/\d+$/)
});
const startSelfHostedLinkSchema = z.object({
  callbackURL: z.string().min(1)
});
const getGa4Connection_createServerFn_handler = createServerRpc({
  id: "a4c5ccb6a409cc77e5e7b9193c9dc297024a48793fcd4437e01eb3aa2e1e71ea",
  name: "getGa4Connection",
  filename: "src/serverFunctions/ga4.ts"
}, (opts) => getGa4Connection.__executeServer(opts));
const getGa4Connection = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(projectScopedSchema).handler(getGa4Connection_createServerFn_handler, async ({
  context
}) => {
  const [connection, currentUserHasGrant, hosted, ga4Configured] = await Promise.all([Ga4Service.getConnection(context.projectId), Ga4Service.userHasGrant(context.userId), isHostedServerAuthMode(), hasSelfHostedGoogleOAuthConfig()]);
  return {
    connected: Boolean(connection),
    currentUserHasGrant,
    googleOAuthConfigured: hosted || ga4Configured,
    propertyId: connection?.propertyId ?? null,
    propertyDisplayName: connection?.propertyDisplayName ?? null,
    propertyTimeZone: connection?.propertyTimeZone ?? null,
    propertyCurrencyCode: connection?.propertyCurrencyCode ?? null,
    connectedByEmail: connection?.connectedAccountEmail ?? null,
    connectedAt: connection?.createdAt ?? null
  };
});
function overviewMetric(row, name) {
  const value = row?.[name];
  return typeof value === "number" ? value : null;
}
function fillDailySessions(rows, range) {
  const sessionsByDate = /* @__PURE__ */ new Map();
  for (const row of rows) {
    if (typeof row.date !== "string" || typeof row.sessions !== "number") {
      continue;
    }
    const iso = `${row.date.slice(0, 4)}-${row.date.slice(4, 6)}-${row.date.slice(6, 8)}`;
    sessionsByDate.set(iso, row.sessions);
  }
  const days = [];
  for (let date = range.startDate; date <= range.endDate; date = shiftGa4Date(date, 1)) {
    days.push({
      date,
      sessions: sessionsByDate.get(date) ?? 0
    });
  }
  return days;
}
const getGa4DashboardReport_createServerFn_handler = createServerRpc({
  id: "aef09a57d39104b1d10659a92003c6f2a2a124fab74bdfc9358f984506751295",
  name: "getGa4DashboardReport",
  filename: "src/serverFunctions/ga4.ts"
}, (opts) => getGa4DashboardReport.__executeServer(opts));
const getGa4DashboardReport = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(projectScopedSchema).handler(getGa4DashboardReport_createServerFn_handler, async ({
  context
}) => {
  try {
    const overview = await Ga4OrganicOverviewService.getOrganicOverview({
      projectId: context.projectId
    });
    const totals = (row) => ({
      sessions: overviewMetric(row, "sessions"),
      activeUsers: overviewMetric(row, "activeUsers"),
      engagementRate: overviewMetric(row, "engagementRate"),
      keyEvents: overviewMetric(row, "keyEvents")
    });
    return {
      connected: true,
      totals: totals(overview.current),
      prevTotals: totals(overview.previous),
      trend: fillDailySessions(overview.trend, overview.request.resolvedDateRange)
    };
  } catch (error) {
    if (error instanceof Ga4ReportError && (error.code === "ga4_not_connected" || error.code === "ga4_reconnect_required" || error.code === "ga4_property_inaccessible")) {
      return {
        connected: false
      };
    }
    throw error;
  }
});
const listGa4Properties_createServerFn_handler = createServerRpc({
  id: "afea34b6bf4da665d300c562fed995ffb979fe6ebb3bdb7d08c7ce493506a148",
  name: "listGa4Properties",
  filename: "src/serverFunctions/ga4.ts"
}, (opts) => listGa4Properties.__executeServer(opts));
const listGa4Properties = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(projectScopedSchema).handler(listGa4Properties_createServerFn_handler, async ({
  context
}) => {
  const [propertyList, connection] = await Promise.all([Ga4Service.listPropertiesForUserWithGrantStatus(context.userId), Ga4Service.getConnection(context.projectId)]);
  return {
    accounts: propertyList.accounts.map((grant) => ({
      ...grant,
      properties: grant.properties.map((property) => ({
        ...property,
        isSelected: connection?.ga4AccountId === grant.accountId && connection.propertyId === property.propertyId
      }))
    }))
  };
});
const setGa4Property_createServerFn_handler = createServerRpc({
  id: "131f47ab2c8b293725f7a4013737cb0d5e77f8ac22c985f4952b7140820a6430",
  name: "setGa4Property",
  filename: "src/serverFunctions/ga4.ts"
}, (opts) => setGa4Property.__executeServer(opts));
const setGa4Property = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(setPropertySchema).handler(setGa4Property_createServerFn_handler, async ({
  data,
  context
}) => {
  const connection = await Ga4Service.setProperty({
    projectId: context.projectId,
    organizationId: context.organizationId,
    accountId: data.accountId,
    propertyId: data.propertyId,
    userId: context.userId
  });
  waitUntil(captureServerEvent({
    distinctId: context.userId,
    event: "ga4:property_select",
    organizationId: context.organizationId,
    properties: {
      project_id: context.projectId
    }
  }));
  return {
    connected: true,
    propertyId: connection.propertyId,
    propertyDisplayName: connection.propertyDisplayName
  };
});
const disconnectGa4_createServerFn_handler = createServerRpc({
  id: "9d62c976afd0592ac01d146421e81b4b46e99090b01e75b15797fba6d6af5e1d",
  name: "disconnectGa4",
  filename: "src/serverFunctions/ga4.ts"
}, (opts) => disconnectGa4.__executeServer(opts));
const disconnectGa4 = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(projectScopedSchema).handler(disconnectGa4_createServerFn_handler, async ({
  context
}) => {
  await Ga4Service.disconnect({
    projectId: context.projectId,
    userId: context.userId
  });
  waitUntil(captureServerEvent({
    distinctId: context.userId,
    event: "ga4:disconnect",
    organizationId: context.organizationId,
    properties: {
      project_id: context.projectId
    }
  }));
  return {
    connected: false
  };
});
const startSelfHostedGa4Link_createServerFn_handler = createServerRpc({
  id: "c36a03514a4a30b2f2aad7b77bba4606e70547fefc757782bb3f12ae4c226619",
  name: "startSelfHostedGa4Link",
  filename: "src/serverFunctions/ga4.ts"
}, (opts) => startSelfHostedGa4Link.__executeServer(opts));
const startSelfHostedGa4Link = createServerFn({
  method: "POST"
}).middleware(requireAuthenticatedContext).validator(startSelfHostedLinkSchema).handler(startSelfHostedGa4Link_createServerFn_handler, async ({
  data,
  context
}) => ({
  url: await createSelfHostedGoogleAuthorizationUrl({
    integration: GA4_INTEGRATION,
    user: {
      userId: context.userId,
      userEmail: context.userEmail
    },
    callbackURL: data.callbackURL,
    publicOrigin: getPublicOrigin(getRequest())
  })
}));
export {
  disconnectGa4_createServerFn_handler,
  getGa4Connection_createServerFn_handler,
  getGa4DashboardReport_createServerFn_handler,
  listGa4Properties_createServerFn_handler,
  setGa4Property_createServerFn_handler,
  startSelfHostedGa4Link_createServerFn_handler
};
