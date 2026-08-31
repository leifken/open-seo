import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useRef, useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { l as createSsrRpc, c as captureClientEvent, o as getStandardErrorMessage, ah as Route } from "./router-CC5LdN6j.js";
import { S as SearchConsoleConnectionCard } from "./SearchConsoleConnectionCard-BfDeE1wV.js";
import { c4 as AUDIT_ISSUE_TYPES, i as createServerFn, aC as isHostedClientAuthMode } from "../entry.js";
import { g as getSearchPerformanceReport, f as formatCount, a as formatCtr, b as formatPosition } from "./searchPerformance-CyCQ7Yl4.js";
import { ResponsiveContainer, AreaChart, XAxis, YAxis, Tooltip, Area } from "recharts";
import { G as GoogleAnalyticsConnectionCard } from "./GoogleAnalyticsConnectionCard-BfnjgTt9.js";
import { r as requireProjectContext, a as requireAuthenticatedContext } from "./middleware-CwR3-L1M.js";
import { d as dashboardProjectInputSchema } from "./dashboard-BcRjxeb9.js";
import { j as getGa4DashboardReport } from "./startGoogleLink-FLOrvW1P.js";
import { C as CopyButton } from "./SetupControls-CIzHWqFw.js";
import { e as setProjectDomain } from "./projects-DdfbVHsT.js";
import "zod";
import "@tanstack/query-core";
import "./selfHostedOAuth-BpCugic0.js";
import "drizzle-orm";
import "jose";
import "./ai-search-B6IOR0fs.js";
import "./audit-D01_HjiI.js";
import "autumn-js/react";
import "react-dom";
import "@tanstack/react-form";
import "@better-auth/api-key/client";
import "papaparse";
import "@tanstack/react-table";
import "remeda";
import "./lighthouse-CiThJE4g.js";
import "./lighthouse-CxIZIYPF.js";
import "./SitePicker-DlyiKGfz.js";
import "./SafeExternalLink-D1balRwF.js";
import "./url-D1aM6mYO.js";
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
import "./search-performance-DEaTIWHa.js";
const STEP_ORDER = [
  "domain",
  "mcp",
  "gsc",
  "competitor"
];
function isStepDone(activation, step) {
  switch (step) {
    case "domain":
      return activation.domain !== null;
    case "mcp":
      return activation.mcp.authorizedAt !== null || activation.mcp.cardDismissedAt !== null;
    case "gsc":
      return activation.gsc.connected;
    case "competitor":
      return activation.competitorClickedAt !== null;
  }
}
function computeNextStep(activation) {
  for (const step of STEP_ORDER) {
    if (!isStepDone(activation, step)) return step;
  }
  return null;
}
function CardShell({
  title,
  stamp,
  action,
  children
}) {
  return /* @__PURE__ */ jsxs("div", { className: "overflow-hidden rounded-xl border border-base-300 bg-base-100 shadow-sm", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4 px-5 py-4", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-base font-semibold leading-tight", children: title }),
      action
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "border-t border-base-300 p-5", children: [
      children,
      stamp ? /* @__PURE__ */ jsx("p", { className: "mt-4 text-[11px] text-base-content/45", children: stamp }) : null
    ] })
  ] });
}
function EmptyCardBody({
  message,
  cta
}) {
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-start gap-3", children: [
    /* @__PURE__ */ jsx("p", { className: "text-sm text-base-content/70", children: message }),
    cta
  ] });
}
function Stat({
  label,
  value,
  tone,
  sub
}) {
  const toneClass = tone === "success" ? "text-success" : tone === "error" ? "text-error" : "";
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-wide text-base-content/60", children: label }),
    /* @__PURE__ */ jsx("p", { className: `text-2xl font-semibold tabular-nums ${toneClass}`, children: value }),
    sub
  ] });
}
function PercentDelta({
  current,
  previous
}) {
  if (previous <= 0) return null;
  const pct = (current - previous) / previous * 100;
  if (!Number.isFinite(pct)) return null;
  const rounded = Math.round(pct);
  const tone = rounded > 0 ? "text-success" : rounded < 0 ? "text-error" : "";
  return /* @__PURE__ */ jsxs("p", { className: `text-xs tabular-nums ${tone}`, children: [
    rounded > 0 ? "▲" : rounded < 0 ? "▼" : "",
    " ",
    Math.abs(rounded),
    "%"
  ] });
}
const moreDetailsClass = "btn btn-ghost btn-xs";
function newLost(value) {
  return value === null ? "—" : String(value);
}
function formatDay(timestamp) {
  const ms = Date.parse(
    // SQLite's current_timestamp default has no timezone marker; treat it as
    // UTC rather than letting the browser parse it as local time.
    /^\d{4}-\d{2}-\d{2} /.test(timestamp) ? `${timestamp.replace(" ", "T")}Z` : timestamp
  );
  if (Number.isNaN(ms)) return timestamp;
  return new Date(ms).toLocaleDateString(void 0, {
    month: "short",
    day: "numeric"
  });
}
const issueTitles = Object.fromEntries(
  Object.entries(AUDIT_ISSUE_TYPES).map(([key, value]) => [key, value.title])
);
function GscCard({
  projectId,
  connected
}) {
  const reportQuery = useQuery({
    queryKey: ["dashboardGscReport", projectId],
    queryFn: () => getSearchPerformanceReport({
      data: { projectId, dateRange: "last_28_days" }
    }),
    enabled: connected
  });
  if (!connected || reportQuery.data && !reportQuery.data.connected) {
    return /* @__PURE__ */ jsx("div", { id: "connect-gsc", children: /* @__PURE__ */ jsx(SearchConsoleConnectionCard, { projectId }) });
  }
  const report = reportQuery.data;
  return /* @__PURE__ */ jsx(
    CardShell,
    {
      title: "Search performance",
      stamp: "Google Search Console · last 28 days",
      action: /* @__PURE__ */ jsx(
        Link,
        {
          to: "/p/$projectId/search-performance",
          params: { projectId },
          className: moreDetailsClass,
          children: "More details"
        }
      ),
      children: reportQuery.isPending ? /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-3", "aria-busy": true, children: Array.from({ length: 4 }, (_, i) => /* @__PURE__ */ jsx("div", { className: "skeleton h-20" }, i)) }) : reportQuery.isError ? /* @__PURE__ */ jsx("p", { className: "text-sm text-base-content/60", children: "Couldn’t load Search Console data. Try again shortly." }) : report?.connected ? /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsx(
          Stat,
          {
            label: "Clicks",
            value: formatCount(report.totals.clicks),
            sub: /* @__PURE__ */ jsx(
              PercentDelta,
              {
                current: report.totals.clicks,
                previous: report.prevTotals.clicks
              }
            )
          }
        ),
        /* @__PURE__ */ jsx(
          Stat,
          {
            label: "Impressions",
            value: formatCount(report.totals.impressions),
            sub: /* @__PURE__ */ jsx(
              PercentDelta,
              {
                current: report.totals.impressions,
                previous: report.prevTotals.impressions
              }
            )
          }
        ),
        /* @__PURE__ */ jsx(Stat, { label: "CTR", value: formatCtr(report.totals.ctr) }),
        /* @__PURE__ */ jsx(
          Stat,
          {
            label: "Avg position",
            value: formatPosition(report.totals.position)
          }
        )
      ] }) : null
    }
  );
}
function AuditHealthCard({
  projectId,
  audit
}) {
  if (!audit) {
    return /* @__PURE__ */ jsx(CardShell, { title: "Site audit", children: /* @__PURE__ */ jsx(
      EmptyCardBody,
      {
        message: "Crawl your site for broken links, missing tags and indexability problems.",
        cta: /* @__PURE__ */ jsx(
          Link,
          {
            to: "/p/$projectId/audit",
            params: { projectId },
            className: "btn btn-primary btn-sm",
            children: "Run an audit"
          }
        )
      }
    ) });
  }
  return /* @__PURE__ */ jsx(
    CardShell,
    {
      title: "Site audit",
      stamp: `Site audit · ${audit.status === "completed" ? `crawled ${audit.pagesCrawled} pages · ${formatDay(audit.startedAt)}` : audit.status === "running" ? "crawl in progress" : "last crawl failed"}`,
      action: /* @__PURE__ */ jsx(
        Link,
        {
          to: "/p/$projectId/audit",
          params: { projectId },
          className: moreDetailsClass,
          children: "More details"
        }
      ),
      children: audit.topIssues.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-base-content/70", children: [
        /* @__PURE__ */ jsx(Check, { className: "size-4 text-success" }),
        "No issues found — your site looks healthy."
      ] }) : /* @__PURE__ */ jsxs("ul", { className: "space-y-2", children: [
        audit.topIssues.map((issue) => /* @__PURE__ */ jsxs(
          "li",
          {
            className: "flex items-center justify-between gap-2 text-sm",
            children: [
              /* @__PURE__ */ jsxs("span", { className: "flex min-w-0 items-center gap-2", children: [
                /* @__PURE__ */ jsx(
                  "span",
                  {
                    className: `size-2 shrink-0 rounded-full ${issue.severity === "critical" ? "bg-error" : issue.severity === "warning" ? "bg-warning" : "bg-base-content/30"}`
                  }
                ),
                /* @__PURE__ */ jsx("span", { className: "truncate", children: issueTitles[issue.issueType] ?? issue.issueType })
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "shrink-0 tabular-nums text-base-content/60", children: [
                issue.count,
                " ",
                issue.count === 1 ? "page" : "pages"
              ] })
            ]
          },
          issue.issueType
        )),
        audit.totalIssueTypes > audit.topIssues.length ? /* @__PURE__ */ jsxs("li", { className: "text-xs text-base-content/50", children: [
          "+ ",
          audit.totalIssueTypes - audit.topIssues.length,
          " more issue",
          audit.totalIssueTypes - audit.topIssues.length === 1 ? "" : "s"
        ] }) : null
      ] })
    }
  );
}
function BacklinkPulseCard({
  projectId,
  backlinks,
  refreshing
}) {
  if (!backlinks && refreshing) {
    return /* @__PURE__ */ jsx(CardShell, { title: "Backlink pulse", stamp: "Taking your first snapshot…", children: /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-3", "aria-busy": true, children: Array.from({ length: 4 }, (_, i) => /* @__PURE__ */ jsx("div", { className: "skeleton h-20" }, i)) }) });
  }
  if (!backlinks) {
    return /* @__PURE__ */ jsx(CardShell, { title: "Backlink pulse", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-base-content/60", children: "We’ll snapshot who links to your domain — nothing to set up." }) });
  }
  return /* @__PURE__ */ jsx(
    CardShell,
    {
      title: "Backlink pulse",
      stamp: `Backlinks · snapshot ${formatDay(backlinks.capturedAt)}${refreshing ? " · refreshing…" : ""}`,
      action: /* @__PURE__ */ jsx(
        Link,
        {
          to: "/p/$projectId/backlinks",
          params: { projectId },
          search: { target: backlinks.domain, scope: "domain" },
          className: moreDetailsClass,
          children: "More details"
        }
      ),
      children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsx(
          Stat,
          {
            label: "Ref. domains",
            value: backlinks.referringDomains === null ? "—" : backlinks.referringDomains.toLocaleString()
          }
        ),
        /* @__PURE__ */ jsx(
          Stat,
          {
            label: "Backlinks",
            value: backlinks.backlinks === null ? "—" : backlinks.backlinks.toLocaleString()
          }
        ),
        /* @__PURE__ */ jsx(
          Stat,
          {
            label: "New links",
            value: `▲ ${newLost(backlinks.newBacklinks)}`,
            tone: backlinks.newBacklinks && backlinks.newBacklinks > 0 ? "success" : void 0
          }
        ),
        /* @__PURE__ */ jsx(
          Stat,
          {
            label: "Lost links",
            value: `▼ ${newLost(backlinks.lostBacklinks)}`,
            tone: backlinks.lostBacklinks && backlinks.lostBacklinks > 0 ? "error" : void 0
          }
        )
      ] })
    }
  );
}
const getDashboardActivation = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(dashboardProjectInputSchema).handler(createSsrRpc("a966ba8dbd2e5e2548b12a6c770c26da924f90ee327285fecd7df1d7afeafe95"));
const getDashboardOverview = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(dashboardProjectInputSchema).handler(createSsrRpc("bf7707a336fe5f1a810d29eb9ddb4ccee4b8a2f0ce88e94d04a295456d7e71d1"));
const refreshDashboardBacklinkSnapshot = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(dashboardProjectInputSchema).handler(createSsrRpc("d8e8c6a9e4e7768403aa7d208c2346921cf9660a816886bf406dc62cd437a155"));
const markDashboardCompetitorClicked = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(dashboardProjectInputSchema).handler(createSsrRpc("7c953889116b01175d89dce1f11398e791a804844e06a729e8a40679c8e32137"));
const dismissDashboardMcpCard = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(dashboardProjectInputSchema).handler(createSsrRpc("8ea81290b22122bff668b72a4292383130de89933a300adb2f16caed61f53731"));
const dismissDashboardGa4Card = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(dashboardProjectInputSchema).handler(createSsrRpc("39b646e1b210269ed692e316a1456d18b70794e8f2dd13b038ab141fc56de0c7"));
function Ga4ConnectCard({
  projectId,
  connected
}) {
  const queryClient = useQueryClient();
  const dismissMutation = useMutation({
    mutationFn: () => dismissDashboardGa4Card({ data: { projectId } }),
    onSuccess: () => void queryClient.invalidateQueries({
      queryKey: ["dashboardActivation", projectId]
    })
  });
  return /* @__PURE__ */ jsx(
    GoogleAnalyticsConnectionCard,
    {
      projectId,
      onDismiss: connected ? void 0 : () => {
        captureClientEvent("dashboard:ga4_dismiss");
        dismissMutation.mutate();
      },
      dismissing: dismissMutation.isPending
    }
  );
}
function formatTrendDay(date) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(void 0, {
    month: "short",
    day: "numeric"
  });
}
function statValue(value, format) {
  return value === null ? "—" : format(value);
}
function statDelta(current, previous) {
  return current !== null && previous !== null ? /* @__PURE__ */ jsx(PercentDelta, { current, previous }) : void 0;
}
function SessionsTooltip({
  active,
  payload,
  label
}) {
  if (!active || !payload?.length) return null;
  return /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-base-300 bg-base-100 px-3 py-2 shadow-sm", children: [
    /* @__PURE__ */ jsx("p", { className: "text-xs text-base-content/60", children: label ? formatTrendDay(label) : "" }),
    /* @__PURE__ */ jsxs("p", { className: "text-sm font-medium tabular-nums", children: [
      formatCount(payload[0].value),
      " sessions"
    ] })
  ] });
}
function Ga4Card({
  projectId,
  connected
}) {
  const reportQuery = useQuery({
    queryKey: ["dashboardGa4Report", projectId],
    queryFn: () => getGa4DashboardReport({ data: { projectId } }),
    enabled: connected
  });
  if (!connected || reportQuery.data && !reportQuery.data.connected) {
    return /* @__PURE__ */ jsx(Ga4ConnectCard, { projectId, connected });
  }
  const report = reportQuery.data;
  return /* @__PURE__ */ jsx(
    CardShell,
    {
      title: "Organic traffic",
      stamp: "Google Analytics · last 28 days",
      action: /* @__PURE__ */ jsx(
        Link,
        {
          to: "/p/$projectId/settings",
          params: { projectId },
          hash: "google-analytics",
          className: moreDetailsClass,
          children: "Manage"
        }
      ),
      children: reportQuery.isPending ? /* @__PURE__ */ jsxs("div", { className: "space-y-3", "aria-busy": true, children: [
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-3", children: Array.from({ length: 4 }, (_, i) => /* @__PURE__ */ jsx("div", { className: "skeleton h-16" }, i)) }),
        /* @__PURE__ */ jsx("div", { className: "skeleton h-24" })
      ] }) : reportQuery.isError ? /* @__PURE__ */ jsx("p", { className: "text-sm text-base-content/60", children: "Couldn’t load Google Analytics data. Try again shortly." }) : report?.connected ? (
        // Covers null (no report row) and 0: a zero-session period would
        // otherwise render an all-zero flatline chart in an empty box.
        !report.totals.sessions ? /* @__PURE__ */ jsx("p", { className: "text-sm text-base-content/60", children: "No organic search traffic recorded in the last 28 days yet." }) : /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsx(
              Stat,
              {
                label: "Sessions",
                value: statValue(report.totals.sessions, formatCount),
                sub: statDelta(
                  report.totals.sessions,
                  report.prevTotals.sessions
                )
              }
            ),
            /* @__PURE__ */ jsx(
              Stat,
              {
                label: "Active users",
                value: statValue(report.totals.activeUsers, formatCount),
                sub: statDelta(
                  report.totals.activeUsers,
                  report.prevTotals.activeUsers
                )
              }
            ),
            /* @__PURE__ */ jsx(
              Stat,
              {
                label: "Engagement rate",
                value: statValue(report.totals.engagementRate, formatCtr)
              }
            ),
            /* @__PURE__ */ jsx(
              Stat,
              {
                label: "Key events",
                value: statValue(report.totals.keyEvents, formatCount),
                sub: statDelta(
                  report.totals.keyEvents,
                  report.prevTotals.keyEvents
                )
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { className: "h-24", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(
            AreaChart,
            {
              data: report.trend,
              margin: { top: 4, right: 0, bottom: 0, left: 0 },
              children: [
                /* @__PURE__ */ jsx(XAxis, { dataKey: "date", hide: true }),
                /* @__PURE__ */ jsx(YAxis, { hide: true, domain: [0, "auto"] }),
                /* @__PURE__ */ jsx(
                  Tooltip,
                  {
                    content: /* @__PURE__ */ jsx(SessionsTooltip, {}),
                    cursor: { stroke: "currentColor", strokeOpacity: 0.2 }
                  }
                ),
                /* @__PURE__ */ jsx(
                  Area,
                  {
                    type: "monotone",
                    dataKey: "sessions",
                    stroke: "var(--color-primary)",
                    strokeWidth: 2,
                    fill: "var(--color-primary)",
                    fillOpacity: 0.08
                  }
                )
              ]
            }
          ) }) })
        ] })
      ) : null
    }
  );
}
function firstPrompts(domain) {
  const site = domain ?? "my site";
  return [
    `Review ${site}. Ideas for what keywords we could target? Use OpenSEO`,
    "Research my competitors top pages and keywords and tell me what's working. Use OpenSEO"
  ];
}
function McpConnectCard({
  projectId,
  activation
}) {
  const queryClient = useQueryClient();
  const dismissMutation = useMutation({
    mutationFn: () => dismissDashboardMcpCard({ data: { projectId } }),
    onSuccess: () => void queryClient.invalidateQueries({
      queryKey: ["dashboardActivation", projectId]
    })
  });
  if (activation.mcp.firstToolCallAt || activation.mcp.cardDismissedAt) {
    return null;
  }
  const connected = activation.mcp.authorizedAt !== null;
  return /* @__PURE__ */ jsxs("div", { className: "overflow-hidden rounded-xl border border-base-300 bg-base-100 shadow-sm", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4 px-5 py-4", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-base font-semibold leading-tight", children: "Connect your AI agent" }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        connected ? /* @__PURE__ */ jsx("span", { className: "badge badge-success badge-outline badge-sm", children: "Connected" }) : null,
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            className: "btn btn-ghost btn-xs text-base-content/60",
            disabled: dismissMutation.isPending,
            onClick: () => {
              captureClientEvent("dashboard:mcp_already_connected");
              dismissMutation.mutate();
            },
            children: "I already connected"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "space-y-3 border-t border-base-300 p-5", children: connected ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm text-base-content/70", children: "Your agent is connected. Try asking it:" }),
      /* @__PURE__ */ jsx("ul", { className: "space-y-2", children: firstPrompts(activation.domain).map((prompt) => /* @__PURE__ */ jsxs(
        "li",
        {
          className: "flex items-center justify-between gap-2 rounded-md border border-base-300 bg-base-200/50 px-3 py-2",
          children: [
            /* @__PURE__ */ jsx("span", { className: "min-w-0 truncate text-xs text-base-content/80", children: prompt }),
            /* @__PURE__ */ jsx(
              CopyButton,
              {
                value: prompt,
                successMessage: "Prompt copied",
                iconOnly: true,
                onCopy: () => captureClientEvent("dashboard:mcp_prompt_copy")
              }
            )
          ]
        },
        prompt
      )) }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-base-content/50", children: "Waiting for your first call — this card disappears once your agent talks to OpenSEO." })
    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-sm text-base-content/70", children: [
        /* @__PURE__ */ jsx("p", { children: "OpenSEO is designed to give your AI agent the data it needs to build a great SEO strategy and help you execute it." }),
        /* @__PURE__ */ jsx("p", { children: "This way you aren’t limited on “AI credits”." }),
        /* @__PURE__ */ jsx("p", { children: "You can work with your agent to figure out what automations make sense for you and it can help you write content too." })
      ] }),
      /* @__PURE__ */ jsx(
        Link,
        {
          to: "/ai",
          className: "link link-primary text-sm font-medium",
          onClick: () => captureClientEvent("dashboard:mcp_setup_open"),
          children: "Set up in AI & MCP →"
        }
      )
    ] }) })
  ] });
}
const getWorkspaceMergeStatus = createServerFn({
  method: "POST"
}).middleware(requireAuthenticatedContext).handler(createSsrRpc("bae0716c278ff567d6fca6035b6fc999ec74301979582cb6eb930ca66771f85f"));
const mergeLegacyWorkspaces = createServerFn({
  method: "POST"
}).middleware(requireAuthenticatedContext).handler(createSsrRpc("dd3518eb8d7349f47f651bb345e6a70e7b48073f2557d873f09c577b0deab0bb"));
function WorkspaceMergeBanner() {
  const queryClient = useQueryClient();
  const statusQuery = useQuery({
    queryKey: ["workspaceMergeStatus"],
    queryFn: () => getWorkspaceMergeStatus(),
    enabled: !isHostedClientAuthMode()
  });
  const mergeMutation = useMutation({
    mutationFn: () => mergeLegacyWorkspaces(),
    onSuccess: ({ mergedWorkspaces }) => {
      toast.success(
        `Migrated ${mergedWorkspaces} workspace${mergedWorkspaces === 1 ? "" : "s"} into the shared workspace.`
      );
      void queryClient.invalidateQueries();
    },
    onError: (error) => toast.error(
      getStandardErrorMessage(
        error,
        "Couldn't migrate the workspaces. Try again."
      )
    )
  });
  if (!statusQuery.data || statusQuery.data.legacyWorkspaceCount === 0) {
    return null;
  }
  return /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-warning/40 bg-warning/10 p-5", children: [
    /* @__PURE__ */ jsx("p", { className: "max-w-3xl text-sm", children: "When self-hosting on Cloudflare, there was a bug where each user had their own workspace. It was intended for all users to be in one workspace. Clicking the button below will migrate everyone's previous work into this shared workspace." }),
    /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        className: "btn btn-primary btn-sm mt-4",
        disabled: mergeMutation.isPending,
        onClick: () => mergeMutation.mutate(),
        children: mergeMutation.isPending ? "Migrating…" : "Migrate workspaces"
      }
    )
  ] });
}
const HERO_COPY = {
  domain: {
    title: "What site are you working on?",
    body: "Set your project's domain and every card on this page starts working for it — backlinks and audits.",
    cta: "Save"
  },
  mcp: {
    title: "Connect your AI agent",
    body: "OpenSEO is built to be used from agents like Claude. Connect once, then ask it to use OpenSEO to help build your SEO strategy.",
    cta: "Show me how"
  },
  gsc: {
    title: "Connect Search Console",
    body: "Your real queries and clicks, straight from Google.",
    cta: "Connect"
  },
  competitor: {
    title: "Size up a competitor",
    body: "Paste a competitor's domain to see what they rank for and who links to them.",
    cta: "Open domain lookup"
  }
};
function scrollToCard(id) {
  document.getElementById(id)?.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
}
function normalizeDomainInput(value) {
  return value.trim().replace(/^https?:\/\//i, "").replace(/\/.*$/, "");
}
function OnboardingChecklist({
  projectId,
  activation
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [domainInput, setDomainInput] = useState("");
  const [viewedIndex, setViewedIndex] = useState(null);
  const invalidateActivation = () => void queryClient.invalidateQueries({
    queryKey: ["dashboardActivation", projectId]
  });
  const competitorClickMutation = useMutation({
    mutationFn: () => markDashboardCompetitorClicked({ data: { projectId } }),
    onSuccess: invalidateActivation
  });
  const domainMutation = useMutation({
    mutationFn: (domain) => setProjectDomain({ data: { projectId, domain } }),
    onSuccess: () => {
      invalidateActivation();
      void queryClient.invalidateQueries({
        queryKey: ["dashboardOverview", projectId]
      });
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (error) => toast.error(
      getStandardErrorMessage(error, "Couldn't save the domain. Try again.")
    )
  });
  const nextStep = computeNextStep(activation);
  if (!nextStep) return null;
  const index = viewedIndex ?? STEP_ORDER.indexOf(nextStep);
  const step = STEP_ORDER[index];
  const copy = HERO_COPY[step];
  const done = isStepDone(activation, step);
  const page = (delta) => setViewedIndex(Math.min(Math.max(index + delta, 0), STEP_ORDER.length - 1));
  const onSubmitDomain = () => {
    const domain = normalizeDomainInput(domainInput);
    if (!domain) return;
    captureClientEvent("dashboard:next_move_click", { step: "domain" });
    domainMutation.mutate(domain);
  };
  const onCta = () => {
    captureClientEvent("dashboard:next_move_click", { step });
    if (step === "gsc") {
      scrollToCard("connect-gsc");
    } else if (step === "competitor") {
      competitorClickMutation.mutate();
      void navigate({ to: "/p/$projectId/domain", params: { projectId } });
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-primary/25 bg-primary/5 shadow-sm", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4 px-5 pt-4", children: [
      /* @__PURE__ */ jsx("p", { className: "text-xs font-medium uppercase tracking-wide text-primary", children: "Onboarding checklist" }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            className: `btn btn-ghost btn-xs btn-square ${index === 0 ? "invisible" : ""}`,
            "aria-label": "Previous step",
            disabled: index === 0,
            onClick: () => page(-1),
            children: /* @__PURE__ */ jsx(ChevronLeft, { className: "size-4" })
          }
        ),
        /* @__PURE__ */ jsxs("span", { className: "text-xs tabular-nums text-base-content/60", children: [
          index + 1,
          " / ",
          STEP_ORDER.length
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            className: `btn btn-ghost btn-xs btn-square ${index === STEP_ORDER.length - 1 ? "invisible" : ""}`,
            "aria-label": "Next step",
            disabled: index === STEP_ORDER.length - 1,
            onClick: () => page(1),
            children: /* @__PURE__ */ jsx(ChevronRight, { className: "size-4" })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-row flex-wrap items-center justify-between gap-4 p-5 pt-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: copy.title }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 max-w-xl text-sm text-base-content/70", children: copy.body })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex shrink-0 flex-wrap items-center gap-3", children: done ? /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5 text-sm font-medium text-success", children: [
        /* @__PURE__ */ jsx(Check, { className: "size-4" }),
        "Done"
      ] }) : step === "domain" ? /* @__PURE__ */ jsxs(
        "form",
        {
          className: "join",
          onSubmit: (event) => {
            event.preventDefault();
            onSubmitDomain();
          },
          children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                className: "input input-bordered join-item w-52",
                placeholder: "acme.com",
                value: domainInput,
                onChange: (event) => setDomainInput(event.target.value),
                "aria-label": "Your site's domain"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "submit",
                className: "btn btn-primary join-item",
                disabled: domainMutation.isPending || normalizeDomainInput(domainInput) === "",
                children: copy.cta
              }
            )
          ]
        }
      ) : step === "mcp" ? /* @__PURE__ */ jsxs(
        Link,
        {
          to: "/ai",
          className: "link link-primary text-sm font-medium",
          onClick: () => captureClientEvent("dashboard:next_move_click", { step }),
          children: [
            copy.cta,
            " →"
          ]
        }
      ) : /* @__PURE__ */ jsx("button", { type: "button", className: "btn btn-primary", onClick: onCta, children: copy.cta }) })
    ] })
  ] });
}
function DashboardPage({ projectId }) {
  const queryClient = useQueryClient();
  const activationQuery = useQuery({
    queryKey: ["dashboardActivation", projectId],
    queryFn: () => getDashboardActivation({ data: { projectId } })
  });
  const overviewQuery = useQuery({
    queryKey: ["dashboardOverview", projectId],
    queryFn: () => getDashboardOverview({ data: { projectId } })
  });
  const activation = activationQuery.data;
  const overview = overviewQuery.data;
  const refreshMutation = useMutation({
    mutationFn: () => refreshDashboardBacklinkSnapshot({ data: { projectId } }),
    onSuccess: () => void queryClient.invalidateQueries({
      queryKey: ["dashboardOverview", projectId]
    })
  });
  const refreshFiredRef = useRef(false);
  const needsSnapshot = activation?.domain != null && overview !== void 0 && (overview.backlinks === null || overview.backlinks.stale);
  useEffect(() => {
    if (!needsSnapshot || refreshFiredRef.current) return;
    refreshFiredRef.current = true;
    refreshMutation.mutate();
  }, [needsSnapshot, refreshMutation]);
  if (activationQuery.isError) {
    return /* @__PURE__ */ jsx("div", { className: "px-4 py-4 md:px-6 md:py-6", children: /* @__PURE__ */ jsx("div", { className: "alert alert-error", children: getStandardErrorMessage(activationQuery.error) }) });
  }
  if (!activation || overviewQuery.isPending) {
    return /* @__PURE__ */ jsxs(
      "div",
      {
        className: "mx-auto flex max-w-5xl flex-col gap-5 px-4 py-4 md:px-6 md:py-6",
        "aria-busy": true,
        children: [
          /* @__PURE__ */ jsx("div", { className: "skeleton h-8 w-52" }),
          /* @__PURE__ */ jsx("div", { className: "skeleton h-36" }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-5 lg:grid-cols-2", children: [
            /* @__PURE__ */ jsx("div", { className: "skeleton h-44" }),
            /* @__PURE__ */ jsx("div", { className: "skeleton h-44" })
          ] })
        ]
      }
    );
  }
  const showBacklinks = activation.domain !== null;
  const gscConnected = activation.gsc.connected;
  const ga4Connected = activation.ga4.connected;
  return /* @__PURE__ */ jsx("div", { className: "px-4 py-4 pb-24 md:px-6 md:py-6 md:pb-8", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto flex max-w-5xl flex-col gap-5", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold", children: "Dashboard" }),
    /* @__PURE__ */ jsx(WorkspaceMergeBanner, {}),
    /* @__PURE__ */ jsx(OnboardingChecklist, { projectId, activation }),
    /* @__PURE__ */ jsx("div", { className: "grid items-start gap-5 lg:grid-cols-2", children: [
      // Array order is the within-bucket order after the data-first sort:
      // the MCP pitch leads the setup cards.
      ...activation.mcp.firstToolCallAt || activation.mcp.cardDismissedAt ? [] : [
        {
          key: "mcp",
          hasData: false,
          node: /* @__PURE__ */ jsx(
            McpConnectCard,
            {
              projectId,
              activation
            }
          )
        }
      ],
      {
        key: "gsc",
        hasData: gscConnected,
        node: /* @__PURE__ */ jsx(GscCard, { projectId, connected: gscConnected })
      },
      ...ga4Connected || !activation.ga4.cardDismissedAt ? [
        {
          key: "ga4",
          hasData: ga4Connected,
          node: /* @__PURE__ */ jsx(Ga4Card, { projectId, connected: ga4Connected })
        }
      ] : [],
      {
        key: "audit",
        hasData: overview?.audit != null,
        node: /* @__PURE__ */ jsx(
          AuditHealthCard,
          {
            projectId,
            audit: overview?.audit ?? null
          }
        )
      },
      ...showBacklinks ? [
        {
          key: "backlinks",
          hasData: overview?.backlinks != null || refreshMutation.isPending,
          node: /* @__PURE__ */ jsx(
            BacklinkPulseCard,
            {
              projectId,
              backlinks: overview?.backlinks ?? null,
              refreshing: refreshMutation.isPending
            }
          )
        }
      ] : []
    ].toSorted((a, b) => Number(b.hasData) - Number(a.hasData)).map((card) => /* @__PURE__ */ jsx("div", { children: card.node }, card.key)) })
  ] }) });
}
function DashboardRoute() {
  const {
    projectId
  } = Route.useParams();
  return /* @__PURE__ */ jsx(DashboardPage, { projectId });
}
export {
  DashboardRoute as component
};
