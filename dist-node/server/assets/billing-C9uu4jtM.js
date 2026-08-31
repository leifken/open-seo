import { c as createServerRpc } from "./createServerRpc-C4IDcroA.js";
import { h as createServerFn, B as isHostedServerAuthMode, a1 as getRequiredEnvValue, aa as AUTUMN_SEO_DATA_BALANCE_FEATURE_ID, ab as AUTUMN_SEO_DATA_TOPUP_BALANCE_FEATURE_ID, a0 as AppError } from "../entry.js";
import { z } from "zod";
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
const AUTUMN_EVENTS_LIST_URL = "https://api.useautumn.com/v1/events.list";
const EVENT_PAGE_LIMIT = 1e3;
const AUTUMN_MAX_RETRIES = 3;
const AUTUMN_RETRY_BACKOFF_MS = 250;
const AUTUMN_MAX_RETRY_DELAY_MS = 5e3;
const BILLING_USAGE_FEATURE_IDS = [AUTUMN_SEO_DATA_BALANCE_FEATURE_ID, AUTUMN_SEO_DATA_TOPUP_BALANCE_FEATURE_ID];
const billingUsageRangeSchema = z.object({
  start: z.number(),
  end: z.number()
});
const billingUsagePropertySchema = z.json();
const autumnEventSchema = z.object({
  value: z.number(),
  properties: z.record(z.string(), billingUsagePropertySchema).optional().default({})
}).passthrough();
const autumnEventsListResponseSchema = z.object({
  list: z.array(autumnEventSchema),
  has_more: z.boolean().optional(),
  hasMore: z.boolean().optional()
}).passthrough();
const getBillingUsageEvents_createServerFn_handler = createServerRpc({
  id: "4f6a59af64bb95847828f645f342cfbb203858ef0caca7ddb96adebcce44b7a0",
  name: "getBillingUsageEvents",
  filename: "src/serverFunctions/billing.ts"
}, (opts) => getBillingUsageEvents.__executeServer(opts));
const getBillingUsageEvents = createServerFn({
  method: "POST"
}).middleware(requireAuthenticatedContext).validator(billingUsageRangeSchema).handler(getBillingUsageEvents_createServerFn_handler, async ({
  data,
  context
}) => {
  if (!await isHostedServerAuthMode()) {
    return [];
  }
  const events = [];
  let offset = 0;
  for (; ; ) {
    const page = await fetchAutumnEventsPage({
      customerId: context.organizationId,
      end: data.end,
      offset,
      start: data.start
    });
    events.push(...page.list);
    if (!page.hasMore || page.list.length === 0) {
      return events;
    }
    offset += page.list.length;
  }
});
async function fetchAutumnEventsPage(args) {
  const secretKey = await getRequiredEnvValue("AUTUMN_SECRET_KEY");
  let response;
  for (let attempt = 0; ; attempt++) {
    response = await fetch(AUTUMN_EVENTS_LIST_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        customer_id: args.customerId,
        custom_range: {
          end: args.end,
          start: args.start
        },
        feature_id: BILLING_USAGE_FEATURE_IDS,
        limit: EVENT_PAGE_LIMIT,
        offset: args.offset
      })
    });
    if (response.ok) break;
    if (response.status === 429 && attempt < AUTUMN_MAX_RETRIES) {
      const retryAfterHeader = response.headers.get("Retry-After");
      const retryAfter = retryAfterHeader ? Number(retryAfterHeader) : NaN;
      const delayMs = Number.isFinite(retryAfter) ? Math.min(retryAfter * 1e3, AUTUMN_MAX_RETRY_DELAY_MS) : AUTUMN_RETRY_BACKOFF_MS * (attempt + 1);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      continue;
    }
    throw new AppError(response.status === 429 ? "RATE_LIMITED" : "INTERNAL_ERROR", `Autumn events.list failed with status ${response.status}`);
  }
  const parsed = autumnEventsListResponseSchema.parse(await response.json());
  return {
    hasMore: parsed.has_more ?? parsed.hasMore ?? false,
    list: parsed.list.map((event) => ({
      value: event.value,
      properties: event.properties
    }))
  };
}
export {
  getBillingUsageEvents_createServerFn_handler
};
