import { c as createServerRpc } from "./createServerRpc-CXhnBwFB.js";
import { i as createServerFn, a6 as env } from "../entry.js";
import { a as requireAuthenticatedContext } from "./middleware-CwR3-L1M.js";
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
const getSeoApiKeyStatus_createServerFn_handler = createServerRpc({
  id: "b5858986f4b26fbc7f2cea62479e3b4d97d5c4af0a61b218af88501443a3939c",
  name: "getSeoApiKeyStatus",
  filename: "src/serverFunctions/config.ts"
}, (opts) => getSeoApiKeyStatus.__executeServer(opts));
const getSeoApiKeyStatus = createServerFn({
  method: "GET"
}).middleware(requireAuthenticatedContext).handler(getSeoApiKeyStatus_createServerFn_handler, () => {
  const configured = Boolean(env.DATAFORSEO_API_KEY?.trim());
  return {
    configured
  };
});
export {
  getSeoApiKeyStatus_createServerFn_handler
};
