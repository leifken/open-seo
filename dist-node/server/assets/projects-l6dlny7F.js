import { jsxs, jsx } from "react/jsx-runtime";
import * as React from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Plus, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { g as getProjects, a as getArchivedProjects, r as restoreProject } from "./projects-D9ZqZqTc.js";
import { p as getStandardErrorMessage } from "./router-BZ-5uDXB.js";
import { g as getLastProjectId } from "./active-project-DUKzBpe_.js";
import { C as CreateProjectModal } from "./CreateProjectModal-DAKgOvnC.js";
import "../entry.js";
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
import "@tanstack/react-router/ssr/server";
import "robots-parser";
import "fast-xml-parser";
import "./middleware-CvzXieP6.js";
import "@tanstack/query-core";
import "./selfHostedOAuth-DmcaPqZ5.js";
import "./ai-search-BV1mIqc0.js";
import "./audit-SZdMhI6q.js";
import "autumn-js/react";
import "react-dom";
import "@tanstack/react-form";
import "@better-auth/api-key/client";
import "papaparse";
import "@tanstack/react-table";
import "recharts";
import "./lighthouse-CiThJE4g.js";
import "./lighthouse-CxIZIYPF.js";
import "./Modal-81iy_nBW.js";
import "./ProjectMarketFields-CTL7QZ2E.js";
import "./LocationSelect-DeLtP58P.js";
function ProjectsPage() {
  const [creating, setCreating] = React.useState(false);
  const [currentProjectId, setCurrentProjectId] = React.useState(null);
  React.useEffect(() => {
    setCurrentProjectId(getLastProjectId());
  }, []);
  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: () => getProjects()
  });
  const projects = projectsQuery.data ?? [];
  return /* @__PURE__ */ jsxs("div", { className: "h-full overflow-auto bg-base-100 px-4 py-8 pb-24 md:px-6 md:py-12 md:pb-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "mx-auto w-full max-w-2xl space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold tracking-tight", children: "Projects" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-base-content/60", children: "Each project is a separate workspace with its own Search Console, rank tracking, and audits." })
        ] }),
        /* @__PURE__ */ jsxs("button", { type: "button", className: "btn btn-primary btn-sm shrink-0", onClick: () => setCreating(true), children: [
          /* @__PURE__ */ jsx(Plus, { className: "size-4" }),
          "New project"
        ] })
      ] }),
      projectsQuery.isLoading ? /* @__PURE__ */ jsx("div", { className: "flex justify-center py-10", children: /* @__PURE__ */ jsx("span", { className: "loading loading-spinner loading-md" }) }) : /* @__PURE__ */ jsx("ul", { className: "divide-y divide-base-300 overflow-hidden rounded-lg border border-base-300", children: projects.map((project) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(Link, { to: "/p/$projectId/settings", params: {
        projectId: project.id
      }, className: "flex items-center justify-between gap-3 p-3 transition-colors hover:bg-base-200/40", children: [
        /* @__PURE__ */ jsxs("span", { className: "flex min-w-0 flex-col", children: [
          /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "truncate font-medium", children: project.name }),
            project.id === currentProjectId ? /* @__PURE__ */ jsx("span", { className: "shrink-0 rounded-full bg-base-300/70 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-base-content/60", children: "Current" }) : null
          ] }),
          /* @__PURE__ */ jsx("span", { className: "truncate text-xs text-base-content/50", children: project.domain ?? "No domain set" })
        ] }),
        /* @__PURE__ */ jsx(ChevronRight, { className: "size-4 shrink-0 text-base-content/40" })
      ] }) }, project.id)) }),
      /* @__PURE__ */ jsx(ArchivedProjects, {})
    ] }),
    creating ? /* @__PURE__ */ jsx(CreateProjectModal, { onClose: () => setCreating(false) }) : null
  ] });
}
function ArchivedProjects() {
  const queryClient = useQueryClient();
  const archivedQuery = useQuery({
    queryKey: ["projects", "archived"],
    queryFn: () => getArchivedProjects()
  });
  const archived = archivedQuery.data ?? [];
  const restoreMutation = useMutation({
    mutationFn: (projectId) => restoreProject({
      data: {
        archivedProjectId: projectId
      }
    }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["projects"]
      });
      toast.success("Project restored");
    },
    onError: (error) => toast.error(getStandardErrorMessage(error, "Failed to restore project"))
  });
  if (archived.length === 0) return null;
  return /* @__PURE__ */ jsxs("section", { className: "space-y-3", children: [
    /* @__PURE__ */ jsx("h2", { className: "text-sm font-medium text-base-content/50", children: "Archived" }),
    /* @__PURE__ */ jsx("ul", { className: "divide-y divide-base-300 overflow-hidden rounded-lg border border-base-300", children: archived.map((project) => /* @__PURE__ */ jsxs("li", { className: "flex items-center justify-between gap-3 p-3", children: [
      /* @__PURE__ */ jsxs("span", { className: "flex min-w-0 flex-col", children: [
        /* @__PURE__ */ jsx("span", { className: "truncate font-medium text-base-content/70", children: project.name }),
        /* @__PURE__ */ jsx("span", { className: "truncate text-xs text-base-content/50", children: project.domain ?? "No domain set" })
      ] }),
      /* @__PURE__ */ jsx("button", { type: "button", className: "btn btn-ghost btn-sm shrink-0", onClick: () => restoreMutation.mutate(project.id), disabled: restoreMutation.isPending, children: "Restore" })
    ] }, project.id)) })
  ] });
}
export {
  ProjectsPage as component
};
