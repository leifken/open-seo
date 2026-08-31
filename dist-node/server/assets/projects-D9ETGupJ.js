import { c as createServerRpc } from "./createServerRpc-CXhnBwFB.js";
import { i as createServerFn, R as ProjectService, T as createProjectSchema, U as updateProjectSchema, V as setProjectDomainSchema, W as setProjectMarketSchema, X as archiveProjectSchema, Y as restoreProjectSchema } from "../entry.js";
import { a as requireAuthenticatedContext, r as requireProjectContext } from "./middleware-CwR3-L1M.js";
import { z } from "zod";
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
const projectScopedSchema = z.object({
  projectId: z.string().min(1)
});
const getProjects_createServerFn_handler = createServerRpc({
  id: "278ebde0d517c2ebe20e607d3d88ad2fb75a216d2567a5dfcf5808ab244908f7",
  name: "getProjects",
  filename: "src/serverFunctions/projects.ts"
}, (opts) => getProjects.__executeServer(opts));
const getProjects = createServerFn({
  method: "POST"
}).middleware(requireAuthenticatedContext).handler(getProjects_createServerFn_handler, async ({
  context
}) => ProjectService.listProjectsEnsuringOne(context.organizationId));
const createProject_createServerFn_handler = createServerRpc({
  id: "d1f2d6df775a95682f80a98e2ced1e2c0553c94a8452a94f9241ab709a5fce60",
  name: "createProject",
  filename: "src/serverFunctions/projects.ts"
}, (opts) => createProject.__executeServer(opts));
const createProject = createServerFn({
  method: "POST"
}).middleware(requireAuthenticatedContext).validator(createProjectSchema).handler(createProject_createServerFn_handler, async ({
  data,
  context
}) => ProjectService.createProject(context.organizationId, data));
const updateProject_createServerFn_handler = createServerRpc({
  id: "a652f6f5ac08420a126c8459db2cdb1b3b0da797b0151824db9674012541f2d3",
  name: "updateProject",
  filename: "src/serverFunctions/projects.ts"
}, (opts) => updateProject.__executeServer(opts));
const updateProject = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(updateProjectSchema).handler(updateProject_createServerFn_handler, async ({
  data,
  context
}) => ProjectService.updateProject(context.organizationId, data));
const setProjectDomain_createServerFn_handler = createServerRpc({
  id: "f3b1afadd779b6abc3a38a06587159bb14c03c93475bc4c022b77539dc7dc811",
  name: "setProjectDomain",
  filename: "src/serverFunctions/projects.ts"
}, (opts) => setProjectDomain.__executeServer(opts));
const setProjectDomain = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(setProjectDomainSchema).handler(setProjectDomain_createServerFn_handler, async ({
  data,
  context
}) => ProjectService.setProjectDomain(context.organizationId, data));
const setProjectMarket_createServerFn_handler = createServerRpc({
  id: "f68c75b95b8026da27b760951b2ab7e797bf30f0be879b42fbf17d336034843c",
  name: "setProjectMarket",
  filename: "src/serverFunctions/projects.ts"
}, (opts) => setProjectMarket.__executeServer(opts));
const setProjectMarket = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(setProjectMarketSchema).handler(setProjectMarket_createServerFn_handler, async ({
  data,
  context
}) => ProjectService.setProjectMarket(context.organizationId, data));
const archiveProject_createServerFn_handler = createServerRpc({
  id: "0ca7e7fd914e198e72f6ce0f3a36134fc1ec7b6dedf4da1c013ccd9c2da36595",
  name: "archiveProject",
  filename: "src/serverFunctions/projects.ts"
}, (opts) => archiveProject.__executeServer(opts));
const archiveProject = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(archiveProjectSchema).handler(archiveProject_createServerFn_handler, async ({
  data,
  context
}) => ProjectService.archiveProject(context.organizationId, data));
const getArchivedProjects_createServerFn_handler = createServerRpc({
  id: "9f89caac05689c3f844d5e9fdb4453cd3dbe85e64cddf60d717dad8ccc0ef965",
  name: "getArchivedProjects",
  filename: "src/serverFunctions/projects.ts"
}, (opts) => getArchivedProjects.__executeServer(opts));
const getArchivedProjects = createServerFn({
  method: "POST"
}).middleware(requireAuthenticatedContext).handler(getArchivedProjects_createServerFn_handler, async ({
  context
}) => ProjectService.listArchivedProjects(context.organizationId));
const restoreProject_createServerFn_handler = createServerRpc({
  id: "1c37d6d588141eb6ff4ed0b1776196f3493d263cd15565fc317afeae0f41540c",
  name: "restoreProject",
  filename: "src/serverFunctions/projects.ts"
}, (opts) => restoreProject.__executeServer(opts));
const restoreProject = createServerFn({
  method: "POST"
}).middleware(requireAuthenticatedContext).validator(restoreProjectSchema).handler(restoreProject_createServerFn_handler, async ({
  data,
  context
}) => ProjectService.restoreProject(context.organizationId, data));
const getProjectAccess_createServerFn_handler = createServerRpc({
  id: "de61ac92db2a9949b67232b0b1132b6cbdd66b7f381be8a22e9c245c8126d1f6",
  name: "getProjectAccess",
  filename: "src/serverFunctions/projects.ts"
}, (opts) => getProjectAccess.__executeServer(opts));
const getProjectAccess = createServerFn({
  method: "POST"
}).middleware(requireAuthenticatedContext).validator(projectScopedSchema).handler(getProjectAccess_createServerFn_handler, async ({
  data,
  context
}) => {
  return ProjectService.getProjectForOrganization(context.organizationId, data.projectId);
});
export {
  archiveProject_createServerFn_handler,
  createProject_createServerFn_handler,
  getArchivedProjects_createServerFn_handler,
  getProjectAccess_createServerFn_handler,
  getProjects_createServerFn_handler,
  restoreProject_createServerFn_handler,
  setProjectDomain_createServerFn_handler,
  setProjectMarket_createServerFn_handler,
  updateProject_createServerFn_handler
};
