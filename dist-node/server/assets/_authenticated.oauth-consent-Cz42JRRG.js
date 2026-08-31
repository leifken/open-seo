import { jsxs, jsx } from "react/jsx-runtime";
import { User, Database, KeyRound, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { u as useSession, c as captureClientEvent } from "./router-BZ-5uDXB.js";
import "@tanstack/react-router";
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
import "@tanstack/react-query";
import "./middleware-CvzXieP6.js";
import "@tanstack/query-core";
import "./selfHostedOAuth-DmcaPqZ5.js";
import "./ai-search-BV1mIqc0.js";
import "./audit-SZdMhI6q.js";
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
const SCOPES = [{
  icon: Database,
  label: "Read your OpenSEO data",
  description: "Projects, keyword reports, and audit results."
}, {
  icon: KeyRound,
  label: "Act on your behalf via MCP",
  description: "Run tools and write results back to your workspace."
}];
function OAuthConsentPage() {
  const {
    data: session
  } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const userEmail = session?.user?.email ?? null;
  useEffect(() => {
    captureClientEvent("mcp:consent_viewed");
  }, []);
  async function respond(accept) {
    setError(null);
    setIsSubmitting(true);
    if (!accept) {
      captureClientEvent("mcp:consent_denied");
    }
    const response = await fetch("/api/oauth/consent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        accept,
        query: window.location.search
      })
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "Unable to complete authorization.");
      setIsSubmitting(false);
      return;
    }
    if (data.redirectTo) {
      window.location.assign(data.redirectTo);
      return;
    }
    setError("Authorization response did not include a redirect URL.");
    setIsSubmitting(false);
  }
  return /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md rounded-2xl border border-base-300 bg-base-100 p-8 shadow-sm", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center text-center", children: [
      /* @__PURE__ */ jsx("img", { src: "/transparent-logo.png", alt: "OpenSEO", className: "size-10 rounded-lg" }),
      /* @__PURE__ */ jsx("h1", { className: "mt-5 text-xl font-semibold", children: "Authorize MCP access" }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-base-content/70", children: "An MCP client is requesting access to your OpenSEO workspace." })
    ] }),
    userEmail ? /* @__PURE__ */ jsxs("div", { className: "mt-6 flex items-center gap-3 rounded-lg border border-base-300 bg-base-200/50 px-3 py-2 text-sm", children: [
      /* @__PURE__ */ jsx("div", { className: "flex size-7 items-center justify-center rounded-full bg-base-300", children: /* @__PURE__ */ jsx(User, { className: "size-4" }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsx("div", { className: "text-xs text-base-content/60", children: "Signed in as" }),
        /* @__PURE__ */ jsx("div", { className: "font-medium", children: userEmail })
      ] })
    ] }) : null,
    /* @__PURE__ */ jsxs("div", { className: "mt-6", children: [
      /* @__PURE__ */ jsx("div", { className: "text-xs font-medium uppercase tracking-wide text-base-content/60", children: "This will allow it to" }),
      /* @__PURE__ */ jsx("ul", { className: "mt-3 space-y-3", children: SCOPES.map((scope) => /* @__PURE__ */ jsxs("li", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsx(Check, { className: "mt-0.5 size-4 shrink-0 text-primary" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: "text-sm font-medium", children: scope.label }),
          /* @__PURE__ */ jsx("div", { className: "text-xs text-base-content/60", children: scope.description })
        ] })
      ] }, scope.label)) })
    ] }),
    error ? /* @__PURE__ */ jsx("div", { className: "mt-6 rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-sm text-error", children: error }) : null,
    /* @__PURE__ */ jsxs("div", { className: "mt-8 flex gap-2", children: [
      /* @__PURE__ */ jsx("button", { type: "button", className: "btn btn-ghost flex-1", disabled: isSubmitting, onClick: () => void respond(false), children: "Cancel" }),
      /* @__PURE__ */ jsx("button", { type: "button", className: "btn btn-primary flex-1", disabled: isSubmitting, onClick: () => void respond(true), children: isSubmitting ? "Authorizing..." : "Authorize" })
    ] }),
    /* @__PURE__ */ jsx("p", { className: "mt-6 text-center text-xs text-base-content/50", children: "You can revoke access at any time in Settings." })
  ] });
}
export {
  OAuthConsentPage as component
};
