import { jsx, jsxs } from "react/jsx-runtime";
import * as React from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { P as ProjectMarketFields } from "./ProjectMarketFields-CTL7QZ2E.js";
import { p as getStandardErrorMessage, L as Route } from "./router-BZ-5uDXB.js";
import { g as getLastProjectId, c as clearLastProjectId } from "./active-project-DUKzBpe_.js";
import { g as getProjects, u as updateProject, d as archiveProject } from "./projects-D9ZqZqTc.js";
import "./LocationSelect-DeLtP58P.js";
import "lucide-react";
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
function ProjectGeneralSettings({ projectId }) {
  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: () => getProjects()
  });
  const projects = projectsQuery.data ?? [];
  const project = projects.find((entry) => entry.id === projectId) ?? null;
  if (!project) {
    return /* @__PURE__ */ jsx("div", { className: "flex justify-center py-10", children: /* @__PURE__ */ jsx("span", { className: "loading loading-spinner loading-md" }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
    /* @__PURE__ */ jsx(GeneralSection, { project }, project.id),
    /* @__PURE__ */ jsx(DangerSection, { project, canArchive: projects.length > 1 })
  ] });
}
function GeneralSection({ project }) {
  const queryClient = useQueryClient();
  const [name, setName] = React.useState(project.name);
  const [domain, setDomain] = React.useState(project.domain ?? "");
  const [market, setMarket] = React.useState({
    locationCode: project.locationCode,
    languageCode: project.languageCode
  });
  const updateMutation = useMutation({
    mutationFn: () => updateProject({
      data: {
        projectId: project.id,
        name: name.trim(),
        domain: domain.trim() || void 0,
        ...market
      }
    }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project updated");
    },
    onError: (error) => toast.error(getStandardErrorMessage(error, "Failed to update project"))
  });
  const isDirty = name.trim() !== project.name || (domain.trim() || "") !== (project.domain ?? "") || market.locationCode !== project.locationCode || market.languageCode !== project.languageCode;
  const handleSubmit = (event) => {
    event.preventDefault();
    if (updateMutation.isPending) return;
    if (!name.trim()) {
      toast.error("Project name is required");
      return;
    }
    updateMutation.mutate();
  };
  return /* @__PURE__ */ jsxs("section", { className: "space-y-3", children: [
    /* @__PURE__ */ jsx("h2", { className: "text-sm font-medium text-base-content/50", children: "General" }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("label", { className: "flex flex-col gap-1.5 text-sm", children: [
        /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Name" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: name,
            onChange: (event) => setName(event.target.value),
            maxLength: 120,
            className: "input input-bordered w-full"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("label", { className: "flex flex-col gap-1.5 text-sm", children: [
        /* @__PURE__ */ jsxs("span", { className: "font-medium", children: [
          "Domain ",
          /* @__PURE__ */ jsx("span", { className: "text-base-content/50", children: "(optional)" })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: domain,
            onChange: (event) => setDomain(event.target.value),
            placeholder: "example.com",
            maxLength: 255,
            className: "input input-bordered w-full"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1.5", children: [
        /* @__PURE__ */ jsx(ProjectMarketFields, { value: market, onChange: setMarket }),
        /* @__PURE__ */ jsx("span", { className: "text-xs text-base-content/50", children: "Keyword, SERP, and domain data uses this country and language unless a call asks for a different one." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsx(
        "button",
        {
          type: "submit",
          className: "btn btn-primary btn-sm",
          disabled: updateMutation.isPending || !isDirty,
          children: "Save changes"
        }
      ) })
    ] })
  ] });
}
function DangerSection({
  project,
  canArchive
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirming, setConfirming] = React.useState(false);
  const archiveMutation = useMutation({
    mutationFn: () => archiveProject({ data: { projectId: project.id } }),
    onSuccess: async () => {
      if (getLastProjectId() === project.id) clearLastProjectId();
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project archived");
      void navigate({ to: "/" });
    },
    onError: (error) => toast.error(getStandardErrorMessage(error, "Failed to archive project"))
  });
  return /* @__PURE__ */ jsxs("section", { className: "space-y-3 border-t border-base-300 pt-8", children: [
    /* @__PURE__ */ jsx("h2", { className: "text-sm font-medium text-base-content/50", children: "Archive project" }),
    confirming ? /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-base-content/70", children: [
        "Archiving",
        " ",
        /* @__PURE__ */ jsx("span", { className: "font-medium text-base-content", children: project.name }),
        " ",
        "removes it from your workspace and stops its scheduled rank tracking. You can restore it later from the Projects page."
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            className: "btn btn-error btn-sm",
            onClick: () => archiveMutation.mutate(),
            disabled: archiveMutation.isPending,
            children: "Yes, archive project"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            className: "btn btn-ghost btn-sm",
            onClick: () => setConfirming(false),
            disabled: archiveMutation.isPending,
            children: "Cancel"
          }
        )
      ] })
    ] }) : /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm text-base-content/60", children: canArchive ? "Archive this project to remove it from your workspace." : "You can't archive your only project." }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          className: "btn btn-outline btn-error btn-sm shrink-0",
          onClick: () => setConfirming(true),
          disabled: !canArchive,
          children: "Archive project"
        }
      )
    ] })
  ] });
}
function ProjectGeneralSettingsRoute() {
  const {
    projectId
  } = Route.useParams();
  return /* @__PURE__ */ jsx(ProjectGeneralSettings, { projectId });
}
export {
  ProjectGeneralSettingsRoute as component
};
