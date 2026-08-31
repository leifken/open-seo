import { c as createServerRpc } from "./createServerRpc-C4IDcroA.js";
import { h as createServerFn, Q as ProjectService, a0 as AppError, a2 as ProjectRepository, a5 as isSupportedLocationCode, a3 as normalizeDomainInput, a6 as db, a7 as projects, a8 as getLanguageCode } from "../entry.js";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { a as requireAuthenticatedContext } from "./middleware-Doy-pxkJ.js";
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
const getOnboardingChatState_createServerFn_handler = createServerRpc({
  id: "3dbeccce043161813d8711ff4113fda42d161033a0efa91044658e370c98be80",
  name: "getOnboardingChatState",
  filename: "src/serverFunctions/onboardingChat.ts"
}, (opts) => getOnboardingChatState.__executeServer(opts));
const getOnboardingChatState = createServerFn({
  method: "GET"
}).middleware(requireAuthenticatedContext).handler(getOnboardingChatState_createServerFn_handler, async ({
  context
}) => {
  const [project] = await ProjectService.listProjectsEnsuringOne(context.organizationId);
  if (!project) {
    throw new AppError("NOT_FOUND");
  }
  return {
    projectId: project.id,
    domain: project.domain
  };
});
const saveSiteSchema = z.object({
  projectId: z.string().min(1),
  domain: z.string().min(1),
  locationCode: z.number().int()
});
const saveOnboardingSite_createServerFn_handler = createServerRpc({
  id: "a6e76ddc449222a502da7b7425f361fcfb4df793782aee76909707bf70ee90d4",
  name: "saveOnboardingSite",
  filename: "src/serverFunctions/onboardingChat.ts"
}, (opts) => saveOnboardingSite.__executeServer(opts));
const saveOnboardingSite = createServerFn({
  method: "POST"
}).middleware(requireAuthenticatedContext).validator(saveSiteSchema).handler(saveOnboardingSite_createServerFn_handler, async ({
  data,
  context
}) => {
  const project = await ProjectRepository.getProjectForOrganization(data.projectId, context.organizationId);
  if (!project) {
    throw new AppError("NOT_FOUND");
  }
  if (!isSupportedLocationCode(data.locationCode)) {
    throw new AppError("VALIDATION_ERROR", "Unsupported location");
  }
  const newDomain = normalizeDomainInput(data.domain, false);
  await db.update(projects).set({
    domain: newDomain,
    locationCode: data.locationCode,
    languageCode: getLanguageCode(data.locationCode)
  }).where(and(eq(projects.id, data.projectId), eq(projects.organizationId, context.organizationId)));
  return {
    ok: true
  };
});
export {
  getOnboardingChatState_createServerFn_handler,
  saveOnboardingSite_createServerFn_handler
};
