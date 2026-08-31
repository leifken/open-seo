import { jsx } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { g as getProjects } from "./projects-yHwpio5P.js";
import { g as getLastProjectId, c as clearLastProjectId } from "./active-project-DUKzBpe_.js";
import { p as getErrorCode, q as AuthConfigErrorCard, o as getStandardErrorMessage, U as UnauthenticatedErrorCard } from "./router-CFUJAOTG.js";
import { aJ as SUBSCRIBE_ROUTE } from "../entry.js";
import "./middleware-CwR3-L1M.js";
import "zod";
import "lucide-react";
import "@tanstack/query-core";
import "./selfHostedOAuth-BpCugic0.js";
import "drizzle-orm";
import "jose";
import "./ai-search-B6IOR0fs.js";
import "./audit-D01_HjiI.js";
import "autumn-js/react";
import "react-dom";
import "@tanstack/react-form";
import "sonner";
import "@better-auth/api-key/client";
import "papaparse";
import "@tanstack/react-table";
import "remeda";
import "recharts";
import "./lighthouse-CiThJE4g.js";
import "./lighthouse-CxIZIYPF.js";
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
import "drizzle-orm/d1";
import "drizzle-orm/sqlite-core";
import "drizzle-orm/postgres-js";
import "drizzle-orm/pg-core";
import "jose/errors";
import "node:os";
import "@better-auth/api-key";
import "posthog-node";
import "@modelcontextprotocol/server";
import "tldts";
import "srvx";
import "@tanstack/react-router/ssr/server";
import "robots-parser";
import "fast-xml-parser";
function IndexRedirect() {
  const navigate = useNavigate();
  const {
    data,
    error,
    isError,
    refetch
  } = useQuery({
    queryKey: ["projects"],
    queryFn: () => getProjects(),
    retry: false
  });
  useEffect(() => {
    if (!data || data.length === 0) return;
    const lastProjectId = getLastProjectId();
    const target = data.find((project) => project.id === lastProjectId);
    if (lastProjectId && !target) {
      clearLastProjectId();
    }
    void navigate({
      to: "/p/$projectId",
      params: {
        projectId: (target ?? data[0]).id
      }
    });
  }, [data, navigate]);
  useEffect(() => {
    if (getErrorCode(error) !== "PAYMENT_REQUIRED") {
      return;
    }
    void navigate({
      href: SUBSCRIBE_ROUTE
    });
  }, [error, navigate]);
  if (isError) {
    const errorCode = getErrorCode(error);
    if (errorCode === "AUTH_CONFIG_MISSING") {
      return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-full p-4", children: /* @__PURE__ */ jsx(AuthConfigErrorCard, { message: getStandardErrorMessage(error, "An unexpected error occurred. Please check server logs."), onRetry: () => {
        void refetch();
      } }) });
    }
    if (errorCode === "UNAUTHENTICATED") {
      return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-full p-4", children: /* @__PURE__ */ jsx(UnauthenticatedErrorCard, { message: "Please sign in to access your OpenSEO workspace.", onRetry: () => {
        void refetch();
      } }) });
    }
    if (errorCode === "PAYMENT_REQUIRED") {
      return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-full p-4", children: /* @__PURE__ */ jsx("div", { className: "flex flex-col items-center gap-3 max-w-xl text-center", children: /* @__PURE__ */ jsx("p", { className: "text-base-content/80", children: "Redirecting you to billing so you can start a hosted subscription." }) }) });
    }
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-full p-4", children: /* @__PURE__ */ jsx("div", { className: "flex flex-col items-center gap-3 max-w-xl", children: /* @__PURE__ */ jsx("p", { className: "text-error text-center", children: getStandardErrorMessage(error, "An unexpected error occurred. Please check server logs.") }) }) });
  }
  return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-full", children: /* @__PURE__ */ jsx("span", { className: "loading loading-spinner loading-md" }) });
}
export {
  IndexRedirect as component
};
