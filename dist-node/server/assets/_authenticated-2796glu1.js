import { jsx } from "react/jsx-runtime";
import { Outlet } from "@tanstack/react-router";
import { A as AuthPageShell } from "./router-CFUJAOTG.js";
import { u as useHostedAuthRouteGuard } from "./useHostedAuthRouteGuard-CMle0TBp.js";
import "react";
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
import "lucide-react";
import "@tanstack/react-query";
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
function AuthenticatedShellLayout() {
  const authGate = useHostedAuthRouteGuard();
  if (!authGate.isHostedMode || !authGate.canRenderAuthenticatedContent) {
    return null;
  }
  return /* @__PURE__ */ jsx(AuthPageShell, { children: /* @__PURE__ */ jsx(Outlet, {}) });
}
export {
  AuthenticatedShellLayout as component
};
