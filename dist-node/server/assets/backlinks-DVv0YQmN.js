import { c as createServerRpc } from "./createServerRpc-C4IDcroA.js";
import { h as createServerFn, L as backlinksOverviewInputSchema, M as BacklinksService, N as backlinksRowsPageRequestSchema, O as referringDomainsPageRequestSchema, P as topPagesPageRequestSchema } from "../entry.js";
import { r as requireProjectContext } from "./middleware-CvzXieP6.js";
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
const WEB_SPAM_OPTIONS = {
  hideSpam: false
};
const getBacklinksOverview_createServerFn_handler = createServerRpc({
  id: "a49c4261f3f65e415401c7162c49edf3e6134bc3554b0b96f1230779dcdebd9b",
  name: "getBacklinksOverview",
  filename: "src/serverFunctions/backlinks.ts"
}, (opts) => getBacklinksOverview.__executeServer(opts));
const getBacklinksOverview = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(backlinksOverviewInputSchema).handler(getBacklinksOverview_createServerFn_handler, async ({
  data,
  context
}) => {
  const profile = await BacklinksService.profileOverview({
    target: data.target,
    scope: data.scope
  }, context);
  return profile.overview;
});
const getBacklinksRows_createServerFn_handler = createServerRpc({
  id: "a4a9247a2916093ffa4adf9b4628e1d7f55af8b119ae1f0147a8b5ef5fd08691",
  name: "getBacklinksRows",
  filename: "src/serverFunctions/backlinks.ts"
}, (opts) => getBacklinksRows.__executeServer(opts));
const getBacklinksRows = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(backlinksRowsPageRequestSchema).handler(getBacklinksRows_createServerFn_handler, ({
  data,
  context
}) => BacklinksService.profileBacklinksPage(data, context, WEB_SPAM_OPTIONS));
const getBacklinksReferringDomains_createServerFn_handler = createServerRpc({
  id: "0c268077775b1f812d23756142e5d64fff541f1240b6328a92da446160513af2",
  name: "getBacklinksReferringDomains",
  filename: "src/serverFunctions/backlinks.ts"
}, (opts) => getBacklinksReferringDomains.__executeServer(opts));
const getBacklinksReferringDomains = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(referringDomainsPageRequestSchema).handler(getBacklinksReferringDomains_createServerFn_handler, ({
  data,
  context
}) => BacklinksService.profileReferringDomainsPage(data, context, WEB_SPAM_OPTIONS));
const getBacklinksTopPages_createServerFn_handler = createServerRpc({
  id: "47f4e168632e9bfd56794677badebb717fc5ce10103810690f0c3bdc5d098227",
  name: "getBacklinksTopPages",
  filename: "src/serverFunctions/backlinks.ts"
}, (opts) => getBacklinksTopPages.__executeServer(opts));
const getBacklinksTopPages = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(topPagesPageRequestSchema).handler(getBacklinksTopPages_createServerFn_handler, ({
  data,
  context
}) => BacklinksService.profileTopPagesPage(data, context));
export {
  getBacklinksOverview_createServerFn_handler,
  getBacklinksReferringDomains_createServerFn_handler,
  getBacklinksRows_createServerFn_handler,
  getBacklinksTopPages_createServerFn_handler
};
