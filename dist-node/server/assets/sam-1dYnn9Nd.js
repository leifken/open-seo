import { c as createServerRpc } from "./createServerRpc-C4IDcroA.js";
import { h as createServerFn, a1 as SamSessionRepository, a0 as AppError, a2 as ProjectRepository } from "../entry.js";
import { z } from "zod";
import { r as requireProjectContext, a as requireAuthenticatedContext } from "./middleware-Doy-pxkJ.js";
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
import "remeda";
import "tldts";
import "srvx";
import "react";
import "@tanstack/react-router";
import "react/jsx-runtime";
import "@tanstack/react-router/ssr/server";
const projectScopedSchema = z.object({
  projectId: z.string().min(1)
});
const listSamSessions_createServerFn_handler = createServerRpc({
  id: "1d147786bb4efc50107e0030500c0d345b524d45211d5b5a8496b06fa13b2b18",
  name: "listSamSessions",
  filename: "src/serverFunctions/sam.ts"
}, (opts) => listSamSessions.__executeServer(opts));
const listSamSessions = createServerFn({
  method: "GET"
}).middleware(requireProjectContext).validator(projectScopedSchema).handler(listSamSessions_createServerFn_handler, async ({
  context
}) => {
  return SamSessionRepository.listSessionsForProject(context.projectId, context.userId);
});
const createSamSession_createServerFn_handler = createServerRpc({
  id: "5508a7b8c2ede1eee34a3696a25fb1813f0d30238ed1d48ca28dfbbbe7f5ac14",
  name: "createSamSession",
  filename: "src/serverFunctions/sam.ts"
}, (opts) => createSamSession.__executeServer(opts));
const createSamSession = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(projectScopedSchema).handler(createSamSession_createServerFn_handler, async ({
  context
}) => {
  const session = await SamSessionRepository.createSession({
    projectId: context.projectId,
    userId: context.userId
  });
  if (!session) {
    throw new AppError("INTERNAL_ERROR", "Failed to create chat session");
  }
  return {
    id: session.id
  };
});
const archiveSchema = z.object({
  sessionId: z.string().min(1)
});
const archiveSamSession_createServerFn_handler = createServerRpc({
  id: "273ab5dcd2c400c13c6eaf49ea723e422c6435074e7b455c4fa0d0bd03df362a",
  name: "archiveSamSession",
  filename: "src/serverFunctions/sam.ts"
}, (opts) => archiveSamSession.__executeServer(opts));
const archiveSamSession = createServerFn({
  method: "POST"
}).middleware(requireAuthenticatedContext).validator(archiveSchema).handler(archiveSamSession_createServerFn_handler, async ({
  data,
  context
}) => {
  const session = await SamSessionRepository.getActiveSession(data.sessionId, context.userId);
  const project = session ? await ProjectRepository.getProjectForOrganization(session.projectId, context.organizationId) : null;
  if (!session || !project) {
    throw new AppError("NOT_FOUND", "Chat session not found");
  }
  await SamSessionRepository.archiveSession(data.sessionId);
  return {
    ok: true
  };
});
export {
  archiveSamSession_createServerFn_handler,
  createSamSession_createServerFn_handler,
  listSamSessions_createServerFn_handler
};
