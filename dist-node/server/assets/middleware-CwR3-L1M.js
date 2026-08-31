import { aR as createMiddleware, a1 as AppError, a0 as asAppError, bw as shouldCaptureAppErrorCode, g as getRequest, F as waitUntil, bx as captureServerError, by as toClientError, bz as resolveUserContextFromHeaders, a4 as ProjectRepository } from "../entry.js";
import { z } from "zod";
function isValidatorError(error) {
  if (!error.message.startsWith("[")) return false;
  try {
    const issues = JSON.parse(error.message);
    if (!Array.isArray(issues) || issues.length === 0) return false;
    return issues.every(
      (issue) => typeof issue === "object" && issue !== null && "message" in issue && typeof issue.message === "string"
    );
  } catch {
    return false;
  }
}
const errorHandlingMiddleware = createMiddleware({
  type: "function"
}).server(async (c) => {
  const { next } = c;
  try {
    return await next();
  } catch (error) {
    if (!(error instanceof Error)) {
      throw new Error("INTERNAL_ERROR", { cause: error });
    }
    const appError = isValidatorError(error) ? new AppError("VALIDATION_ERROR") : asAppError(error);
    if (shouldCaptureAppErrorCode(appError?.code)) {
      const request = getRequest();
      const url = new URL(request.url);
      console.error("server.function error:", error);
      waitUntil(
        captureServerError(error, {
          errorCode: appError?.code ?? "INTERNAL_ERROR",
          method: request.method,
          path: url.pathname,
          ...appError?.details
        })
      );
    }
    throw toClientError(appError ?? error);
  }
});
function extractProjectId(data) {
  if (!data || typeof data !== "object" || !("projectId" in data)) {
    return null;
  }
  const projectId = data.projectId;
  return typeof projectId === "string" && projectId.length > 0 ? projectId : null;
}
const ensureUserMiddleware = createMiddleware({
  type: "function"
}).server(async ({ next, data }) => {
  const context = await resolveUserContextFromHeaders(getRequest().headers);
  const projectId = extractProjectId(data);
  let project;
  if (projectId) {
    project = await ProjectRepository.getProjectForOrganization(
      projectId,
      context.organizationId
    );
    if (!project) {
      throw new AppError("NOT_FOUND");
    }
  }
  return next({
    context: {
      ...context,
      project
    }
  });
});
const ensuredUserContextSchema = z.object({
  userId: z.string(),
  userEmail: z.string(),
  emailVerified: z.boolean(),
  organizationId: z.string(),
  project: z.any().optional()
});
function getAuthenticatedContext(context) {
  const result = ensuredUserContextSchema.safeParse(context);
  if (!result.success) {
    throw new AppError(
      "INTERNAL_ERROR",
      "Authenticated server function context missing"
    );
  }
  return result.data;
}
const globalServerFunctionMiddleware = [
  errorHandlingMiddleware,
  ensureUserMiddleware
];
const requireAuthenticatedContext = [
  createMiddleware({ type: "function" }).server(async ({ next, context }) => {
    const authenticatedContext = getAuthenticatedContext(context);
    return next({
      context: authenticatedContext
    });
  })
];
const requireProjectContext = [
  createMiddleware({ type: "function" }).server(async ({ next, context }) => {
    const authenticatedContext = getAuthenticatedContext(context);
    if (!authenticatedContext.project) {
      throw new AppError(
        "INTERNAL_ERROR",
        "Project context missing from authenticated server function"
      );
    }
    return next({
      context: {
        ...authenticatedContext,
        project: authenticatedContext.project,
        projectId: authenticatedContext.project.id
      }
    });
  })
];
export {
  requireAuthenticatedContext as a,
  globalServerFunctionMiddleware as g,
  requireProjectContext as r
};
