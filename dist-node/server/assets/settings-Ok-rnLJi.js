import { jsx, jsxs } from "react/jsx-runtime";
import { Link, Outlet } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { g as getProjects } from "./projects-yHwpio5P.js";
import { z as Route } from "./router-CFUJAOTG.js";
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
import "react";
import "@tanstack/react-router/ssr/server";
import "robots-parser";
import "fast-xml-parser";
import "./middleware-CwR3-L1M.js";
import "@tanstack/query-core";
import "./selfHostedOAuth-BpCugic0.js";
import "./ai-search-B6IOR0fs.js";
import "./audit-D01_HjiI.js";
import "autumn-js/react";
import "react-dom";
import "@tanstack/react-form";
import "sonner";
import "@better-auth/api-key/client";
import "papaparse";
import "@tanstack/react-table";
import "recharts";
import "./lighthouse-CiThJE4g.js";
import "./lighthouse-CxIZIYPF.js";
const tabs = [{
  to: "/p/$projectId/settings",
  label: "General",
  exact: true
}, {
  to: "/p/$projectId/settings/context",
  label: "Context"
}, {
  to: "/p/$projectId/settings/integrations",
  label: "Integrations"
}];
function ProjectSettingsLayout() {
  const {
    projectId
  } = Route.useParams();
  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: () => getProjects()
  });
  const project = projectsQuery.data?.find((entry) => entry.id === projectId);
  return /* @__PURE__ */ jsx("div", { className: "h-full overflow-auto bg-base-100", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto w-full max-w-2xl space-y-8 p-4 py-8 pb-24 sm:p-6 md:py-12 md:pb-12", children: [
    /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs(Link, { to: "/projects", className: "inline-flex items-center gap-1 text-sm text-base-content/60 transition-colors hover:text-base-content", children: [
        /* @__PURE__ */ jsx(ChevronLeft, { className: "size-4" }),
        "Projects"
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold tracking-tight", children: "Project settings" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-base-content/60", children: project?.name ?? " " })
      ] }),
      /* @__PURE__ */ jsx("div", { role: "tablist", className: "tabs tabs-border", children: tabs.map((tab) => /* @__PURE__ */ jsx(Link, { role: "tab", to: tab.to, params: {
        projectId
      }, activeOptions: {
        exact: tab.exact ?? false
      }, className: "tab", activeProps: {
        className: "tab-active",
        "aria-selected": true
      }, inactiveProps: {
        "aria-selected": false
      }, children: tab.label }, tab.to)) })
    ] }),
    /* @__PURE__ */ jsx(Outlet, {})
  ] }) });
}
export {
  ProjectSettingsLayout as component
};
