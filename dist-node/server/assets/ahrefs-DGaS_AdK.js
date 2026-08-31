import { c as createServerRpc } from "./createServerRpc-C4IDcroA.js";
import { h as createServerFn, a3 as normalizeDomainInput, a4 as env } from "../entry.js";
import { chunk } from "remeda";
import { z } from "zod";
import { r as requireProjectContext } from "./middleware-Doy-pxkJ.js";
import "node:async_hooks";
import "node:crypto";
import "ioredis";
import "node:fs/promises";
import "node:path";
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
import "tldts";
import "srvx";
import "react";
import "@tanstack/react-router";
import "react/jsx-runtime";
import "@tanstack/react-router/ssr/server";
const AHREFS_DR_ENDPOINT = "https://api.ahrefs.com/v3/public/domain-rating-free";
const CACHE_PREFIX = "ahrefs-dr:";
const CACHE_TTL_SECONDS = 86400;
const FETCH_TIMEOUT_MS = 5e3;
const FETCH_BATCH_SIZE = 20;
const MAX_DOMAINS_PER_CALL = 100;
const domainRatingsInputSchema = z.object({
  projectId: z.string().min(1),
  domains: z.array(z.string().trim().min(1).max(253)).max(MAX_DOMAINS_PER_CALL)
});
const ahrefsResponseSchema = z.object({
  domain_rating: z.object({
    domain_rating: z.number().min(0).max(100)
  })
});
const getAhrefsDomainRatings_createServerFn_handler = createServerRpc({
  id: "319d82ec75b2b49399d07e97a0efffd36bd56066017d95b692e7074cae6b1272",
  name: "getAhrefsDomainRatings",
  filename: "src/serverFunctions/ahrefs.ts"
}, (opts) => getAhrefsDomainRatings.__executeServer(opts));
const getAhrefsDomainRatings = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(domainRatingsInputSchema).handler(getAhrefsDomainRatings_createServerFn_handler, async ({
  data
}) => {
  const result = {};
  const originalsByDomain = /* @__PURE__ */ new Map();
  for (const original of data.domains) {
    const domain = normalizeDomainInput(original, true);
    const existing = originalsByDomain.get(domain);
    if (existing) existing.push(original);
    else originalsByDomain.set(domain, [original]);
  }
  const ratings = /* @__PURE__ */ new Map();
  for (const batch of chunk([...originalsByDomain.keys()], FETCH_BATCH_SIZE)) {
    const resolved = await Promise.all(batch.map(async (domain) => {
      try {
        return [domain, await resolveDomainRating(domain)];
      } catch {
        return [domain, null];
      }
    }));
    for (const [domain, dr] of resolved) ratings.set(domain, dr);
  }
  for (const [domain, originals] of originalsByDomain) {
    const dr = ratings.get(domain) ?? null;
    for (const original of originals) result[original] = dr;
  }
  return result;
});
async function resolveDomainRating(domain) {
  const cacheKey = `${CACHE_PREFIX}${domain}`;
  const cached = await env.KV.get(cacheKey);
  if (cached !== null) return parseCachedRating(cached);
  const dr = await fetchDomainRating(domain);
  await env.KV.put(cacheKey, JSON.stringify(dr), {
    expirationTtl: CACHE_TTL_SECONDS
  });
  return dr;
}
async function fetchDomainRating(domain) {
  const response = await fetch(`${AHREFS_DR_ENDPOINT}?target=${encodeURIComponent(domain)}`, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)
  });
  if (!response.ok) {
    throw new Error(`Ahrefs DR lookup failed with status ${response.status}`);
  }
  const parsed = ahrefsResponseSchema.safeParse(await response.json());
  if (!parsed.success) {
    throw new Error("Ahrefs DR lookup returned an unexpected response");
  }
  const dr = parsed.data.domain_rating.domain_rating;
  return dr > 0 ? dr : null;
}
function parseCachedRating(raw) {
  try {
    const value = JSON.parse(raw);
    return typeof value === "number" && value > 0 ? value : null;
  } catch {
    return null;
  }
}
export {
  getAhrefsDomainRatings_createServerFn_handler
};
