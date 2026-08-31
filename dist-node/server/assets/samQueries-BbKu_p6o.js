import { queryOptions } from "@tanstack/react-query";
import { l as createSsrRpc, H as queryClient } from "./router-CFUJAOTG.js";
import { i as createServerFn } from "../entry.js";
import { z } from "zod";
import { r as requireProjectContext, a as requireAuthenticatedContext } from "./middleware-CwR3-L1M.js";
const projectScopedSchema = z.object({
  projectId: z.string().min(1)
});
const listSamSessions = createServerFn({
  method: "GET"
}).middleware(requireProjectContext).validator(projectScopedSchema).handler(createSsrRpc("1d147786bb4efc50107e0030500c0d345b524d45211d5b5a8496b06fa13b2b18"));
const createSamSession = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(projectScopedSchema).handler(createSsrRpc("5508a7b8c2ede1eee34a3696a25fb1813f0d30238ed1d48ca28dfbbbe7f5ac14"));
const archiveSchema = z.object({
  sessionId: z.string().min(1)
});
const archiveSamSession = createServerFn({
  method: "POST"
}).middleware(requireAuthenticatedContext).validator(archiveSchema).handler(createSsrRpc("273ab5dcd2c400c13c6eaf49ea723e422c6435074e7b455c4fa0d0bd03df362a"));
const samSessionsQueryOptions = (projectId) => queryOptions({
  queryKey: ["samSessions", projectId],
  queryFn: () => listSamSessions({ data: { projectId } })
});
function invalidateSamSessions(projectId) {
  void queryClient.invalidateQueries({ queryKey: ["samSessions", projectId] });
}
export {
  archiveSamSession as a,
  createSamSession as c,
  invalidateSamSessions as i,
  samSessionsQueryOptions as s
};
