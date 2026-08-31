import { m as createSsrRpc } from "./router-DHiBnyXs.js";
import { h as createServerFn, X as restoreProjectSchema, R as createProjectSchema, U as setProjectDomainSchema, V as setProjectMarketSchema, T as updateProjectSchema, W as archiveProjectSchema } from "../entry.js";
import { a as requireAuthenticatedContext, r as requireProjectContext } from "./middleware-Doy-pxkJ.js";
import { z } from "zod";
const projectScopedSchema = z.object({
  projectId: z.string().min(1)
});
const getProjects = createServerFn({
  method: "POST"
}).middleware(requireAuthenticatedContext).handler(createSsrRpc("278ebde0d517c2ebe20e607d3d88ad2fb75a216d2567a5dfcf5808ab244908f7"));
const createProject = createServerFn({
  method: "POST"
}).middleware(requireAuthenticatedContext).validator(createProjectSchema).handler(createSsrRpc("d1f2d6df775a95682f80a98e2ced1e2c0553c94a8452a94f9241ab709a5fce60"));
const updateProject = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(updateProjectSchema).handler(createSsrRpc("a652f6f5ac08420a126c8459db2cdb1b3b0da797b0151824db9674012541f2d3"));
const setProjectDomain = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(setProjectDomainSchema).handler(createSsrRpc("f3b1afadd779b6abc3a38a06587159bb14c03c93475bc4c022b77539dc7dc811"));
const setProjectMarket = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(setProjectMarketSchema).handler(createSsrRpc("f68c75b95b8026da27b760951b2ab7e797bf30f0be879b42fbf17d336034843c"));
const archiveProject = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(archiveProjectSchema).handler(createSsrRpc("0ca7e7fd914e198e72f6ce0f3a36134fc1ec7b6dedf4da1c013ccd9c2da36595"));
const getArchivedProjects = createServerFn({
  method: "POST"
}).middleware(requireAuthenticatedContext).handler(createSsrRpc("9f89caac05689c3f844d5e9fdb4453cd3dbe85e64cddf60d717dad8ccc0ef965"));
const restoreProject = createServerFn({
  method: "POST"
}).middleware(requireAuthenticatedContext).validator(restoreProjectSchema).handler(createSsrRpc("1c37d6d588141eb6ff4ed0b1776196f3493d263cd15565fc317afeae0f41540c"));
const getProjectAccess = createServerFn({
  method: "POST"
}).middleware(requireAuthenticatedContext).validator(projectScopedSchema).handler(createSsrRpc("de61ac92db2a9949b67232b0b1132b6cbdd66b7f381be8a22e9c245c8126d1f6"));
export {
  getArchivedProjects as a,
  getProjectAccess as b,
  createProject as c,
  archiveProject as d,
  setProjectDomain as e,
  getProjects as g,
  restoreProject as r,
  setProjectMarket as s,
  updateProject as u
};
