import { jsxs, jsx } from "react/jsx-runtime";
import { S as SearchConsoleConnectionCard } from "./SearchConsoleConnectionCard-BfDeE1wV.js";
import { G as GoogleAnalyticsConnectionCard } from "./GoogleAnalyticsConnectionCard-BfnjgTt9.js";
import { G as Route } from "./router-CC5LdN6j.js";
import "react";
import "@tanstack/react-query";
import "sonner";
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
import "@tanstack/react-router";
import "@tanstack/react-router/ssr/server";
import "robots-parser";
import "fast-xml-parser";
import "./startGoogleLink-FLOrvW1P.js";
import "./middleware-CwR3-L1M.js";
import "./SitePicker-DlyiKGfz.js";
import "lucide-react";
import "./SafeExternalLink-D1balRwF.js";
import "./url-D1aM6mYO.js";
import "@tanstack/query-core";
import "./selfHostedOAuth-BpCugic0.js";
import "./ai-search-B6IOR0fs.js";
import "./audit-D01_HjiI.js";
import "autumn-js/react";
import "react-dom";
import "@tanstack/react-form";
import "@better-auth/api-key/client";
import "papaparse";
import "@tanstack/react-table";
import "recharts";
import "./lighthouse-CiThJE4g.js";
import "./lighthouse-CxIZIYPF.js";
function ProjectIntegrationsRoute() {
  const {
    projectId
  } = Route.useParams();
  return /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
    /* @__PURE__ */ jsxs("section", { id: "search-console", className: "scroll-mt-6 space-y-3", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-sm font-medium text-base-content/50", children: "Search Console" }),
      /* @__PURE__ */ jsx(SearchConsoleConnectionCard, { projectId })
    ] }),
    /* @__PURE__ */ jsx("section", { id: "google-analytics", className: "scroll-mt-6 space-y-3", children: /* @__PURE__ */ jsx(GoogleAnalyticsConnectionCard, { projectId, heading: /* @__PURE__ */ jsx("h2", { className: "text-sm font-medium text-base-content/50", children: "Analytics" }) }) })
  ] });
}
export {
  ProjectIntegrationsRoute as component
};
