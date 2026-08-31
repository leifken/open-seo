import { c as createServerRpc } from "./createServerRpc-CXhnBwFB.js";
import { i as createServerFn, ak as getProjectContextSchema, al as ProjectContextService, am as updateProjectContextSchema } from "../entry.js";
import { r as requireProjectContext } from "./middleware-CwR3-L1M.js";
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
const getProjectContext_createServerFn_handler = createServerRpc({
  id: "7a3ccd49a583d669523ebc977678f95cac97fe4eaa09a3151a6af5732a78eb03",
  name: "getProjectContext",
  filename: "src/serverFunctions/projectContext.ts"
}, (opts) => getProjectContext.__executeServer(opts));
const getProjectContext = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(getProjectContextSchema).handler(getProjectContext_createServerFn_handler, async ({
  context
}) => ProjectContextService.getProjectContext(context.projectId));
const updateProjectContext_createServerFn_handler = createServerRpc({
  id: "a2d6a29497c1bebbf28ef40173a2712df71d7f163b0d27ba172aa05b8d2bd882",
  name: "updateProjectContext",
  filename: "src/serverFunctions/projectContext.ts"
}, (opts) => updateProjectContext.__executeServer(opts));
const updateProjectContext = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(updateProjectContextSchema).handler(updateProjectContext_createServerFn_handler, async ({
  data,
  context
}) => (
  // Everything reaching this entry point is a person editing their own
  // project's memory; SAM and MCP writes go through the same service with
  // their own author.
  ProjectContextService.applyContextUpdates(context.projectId, data.updates, "user")
));
export {
  getProjectContext_createServerFn_handler,
  updateProjectContext_createServerFn_handler
};
