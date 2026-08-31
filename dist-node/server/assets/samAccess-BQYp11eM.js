import { c as createServerRpc } from "./createServerRpc-C4IDcroA.js";
import { h as createServerFn, B as isHostedServerAuthMode, ai as getOptionalEnvValue } from "../entry.js";
import { z } from "zod";
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
const OPENROUTER_KEY_MISSING_MESSAGE = "OPENROUTER_API_KEY is not set for this deployment yet. Add it to your environment, restart OpenSEO, then confirm here.";
const projectScopedSchema = z.object({
  projectId: z.string().min(1)
});
const getSamAccessSetupStatus_createServerFn_handler = createServerRpc({
  id: "57eebe4b148ecd8baeab46c7dc1c92b78de5e9a45d9f805e437b74cda250d02e",
  name: "getSamAccessSetupStatus",
  filename: "src/serverFunctions/samAccess.ts"
}, (opts) => getSamAccessSetupStatus.__executeServer(opts));
const getSamAccessSetupStatus = createServerFn({
  method: "GET"
}).middleware(requireProjectContext).validator(projectScopedSchema).handler(getSamAccessSetupStatus_createServerFn_handler, async () => {
  if (await isHostedServerAuthMode()) {
    return {
      enabled: true,
      errorMessage: null
    };
  }
  const enabled = Boolean(await getOptionalEnvValue("OPENROUTER_API_KEY"));
  return {
    enabled,
    errorMessage: enabled ? null : OPENROUTER_KEY_MISSING_MESSAGE
  };
});
export {
  getSamAccessSetupStatus_createServerFn_handler
};
