import { createServerFn } from "@tanstack/react-start";
import { ProjectContextDraftService } from "@/server/features/project-context/services/ProjectContextDraftService";
import { ProjectContextService } from "@/server/features/project-context/services/ProjectContextService";
import { requireProjectContext } from "@/serverFunctions/middleware";
import {
  getProjectContextSchema,
  updateProjectContextSchema,
} from "@/types/schemas/projectContext";

export const getProjectContext = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(getProjectContextSchema)
  .handler(async ({ context }) =>
    ProjectContextService.getProjectContext(context.projectId),
  );

// LEIFKEN addition: fill the context from the project's own website instead
// of typing it. Written as "sam" so the provenance line stays honest about
// what a person wrote and what a model drafted.
export const draftProjectContextFromWebsite = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(getProjectContextSchema)
  .handler(async ({ context }) => {
    const updates = await ProjectContextDraftService.draftContextFromWebsite(
      context.project,
      context,
    );
    return ProjectContextService.applyContextUpdates(
      context.projectId,
      updates,
      "sam",
    );
  });

export const updateProjectContext = createServerFn({ method: "POST" })
  .middleware(requireProjectContext)
  .validator(updateProjectContextSchema)
  .handler(async ({ data, context }) =>
    // Everything reaching this entry point is a person editing their own
    // project's memory; SAM and MCP writes go through the same service with
    // their own author.
    ProjectContextService.applyContextUpdates(
      context.projectId,
      data.updates,
      "user",
    ),
  );
