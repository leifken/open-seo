import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useForm } from "@tanstack/react-form";
import { Search, ArrowLeft, ChevronRight, Download, ChevronDown, Sheet, MoreHorizontal, Gauge, SlidersHorizontal, ShieldAlert, Link2, History, Clock, X } from "lucide-react";
import { aq as shouldValidateFieldOnChange, f as getFieldError, e as getFormError, ar as createFormValidationErrors, aj as HeaderHelpLabel, S as SortableHeader, a3 as useAppTable, a4 as AppDataTable, D as downloadCsv, E as buildCsv, a8 as exportTableToSheets, l as createSsrRpc, o as getStandardErrorMessage, p as getErrorCode, aA as Route } from "./router-CFUJAOTG.js";
import { R as ResearchScopeSelect } from "./ResearchScopeSelect-C8OJw5kN.js";
import { cu as defaultScopeForInput, bU as parseResearchTarget, aN as RESEARCH_SCOPE_LABELS, i as createServerFn, bB as MAX_DATAFORSEO_FILTER_CONDITIONS, cv as BACKLINKS_SUBFOLDER_FILTER_CONDITIONS, cw as BACKLINKS_PAGE_SIZES, cf as toScopeSearchParam, cx as backlinksRowsSortFieldSchema, cy as referringDomainsSortFieldSchema, cz as topPagesSortFieldSchema, cA as BACKLINKS_DEFAULT_SORT, aW as jsonCodec, L as researchScopeSchema, cB as DEFAULT_BACKLINKS_PAGE_SIZE } from "../entry.js";
import { LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from "recharts";
import { D as DomainFilterPanel } from "./DomainFilterPanel-C23amKrZ.js";
import { S as SafeExternalLink } from "./SafeExternalLink-D1balRwF.js";
import { createColumnHelper } from "@tanstack/react-table";
import { unique, chunk } from "remeda";
import { toast } from "sonner";
import { z } from "zod";
import { r as requireProjectContext } from "./middleware-CwR3-L1M.js";
import { T as TablePagination } from "./TablePagination-1S-MRQ9e.js";
import { S as SearchTabStrip, g as getBacklinksOverview, b as getBacklinksRows, c as getBacklinksReferringDomains, d as getBacklinksTopPages, a as useSearchTabNavigation } from "./useSearchTabNavigation-DcT5d5P6.js";
import { useQuery, useQueries } from "@tanstack/react-query";
import { u as useLocalHistoryStore } from "./useLocalHistoryStore-CAiu5gzu.js";
import "@tanstack/query-core";
import "./selfHostedOAuth-BpCugic0.js";
import "drizzle-orm";
import "jose";
import "./ai-search-B6IOR0fs.js";
import "./audit-D01_HjiI.js";
import "autumn-js/react";
import "react-dom";
import "@better-auth/api-key/client";
import "papaparse";
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
import "./url-D1aM6mYO.js";
import "./keywordControllerActions-B5s4B91s.js";
import "./keywords-7hmfv47m.js";
import "./domain-BmUvf1XM.js";
function getBacklinksValidationErrors(value, shouldValidateUntouchedField, validateFormat = false) {
  if (!value.target.trim()) {
    if (!shouldValidateUntouchedField) {
      return null;
    }
    return createFormValidationErrors({
      fields: {
        target: "Enter a domain or URL to analyze."
      }
    });
  }
  if (validateFormat) {
    const parsed = parseResearchTarget(value.target, value.scope);
    if (!parsed.ok) {
      return createFormValidationErrors({
        fields: { target: parsed.message }
      });
    }
  }
  return null;
}
function BacklinksSearchCard({
  errorMessage,
  initialValues,
  onSubmit
}) {
  const [userSelectedScope, setUserSelectedScope] = useState(false);
  const form = useForm({
    defaultValues: initialValues,
    validators: {
      onChange: ({ formApi, value }) => getBacklinksValidationErrors(
        value,
        shouldValidateFieldOnChange(formApi, "target")
      ),
      onSubmit: ({ value }) => getBacklinksValidationErrors(value, true, true)
    },
    onSubmit: ({ value }) => {
      onSubmit({ ...value, target: value.target.trim() });
    }
  });
  useEffect(() => {
    form.reset(initialValues);
    setUserSelectedScope(false);
  }, [form, initialValues]);
  return /* @__PURE__ */ jsx("div", { className: "card bg-base-100 border border-base-300", children: /* @__PURE__ */ jsxs("div", { className: "card-body gap-4", children: [
    /* @__PURE__ */ jsx(
      "form",
      {
        className: "space-y-3",
        onSubmit: (event) => {
          event.preventDefault();
          void form.handleSubmit();
        },
        children: /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 lg:flex-row", children: [
            /* @__PURE__ */ jsx(form.Field, { name: "target", children: (field) => {
              const targetError = getFieldError(field.state.meta.errors);
              return /* @__PURE__ */ jsxs(
                "label",
                {
                  className: `input input-bordered flex flex-1 items-center gap-2 ${targetError ? "input-error" : ""}`,
                  children: [
                    /* @__PURE__ */ jsx(Search, { className: "size-4 text-base-content/60" }),
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        placeholder: "Enter a domain or URL",
                        value: field.state.value,
                        onChange: (event) => {
                          const nextTarget = event.target.value;
                          field.handleChange(nextTarget);
                          if (!userSelectedScope) {
                            form.setFieldValue(
                              "scope",
                              defaultScopeForInput(nextTarget)
                            );
                          }
                        }
                      }
                    )
                  ]
                }
              );
            } }),
            /* @__PURE__ */ jsx(form.Field, { name: "scope", children: (field) => /* @__PURE__ */ jsx(
              ResearchScopeSelect,
              {
                value: field.state.value,
                onChange: (scope) => {
                  setUserSelectedScope(true);
                  field.handleChange(scope);
                }
              }
            ) }),
            /* @__PURE__ */ jsx(form.Subscribe, { selector: (state) => state.isSubmitting, children: (isSubmitting) => /* @__PURE__ */ jsx(
              "button",
              {
                type: "submit",
                className: "btn btn-primary shrink-0 px-6",
                disabled: isSubmitting,
                children: isSubmitting ? "Loading..." : "Search"
              }
            ) })
          ] }),
          /* @__PURE__ */ jsx(form.Field, { name: "target", children: (field) => {
            const targetError = getFieldError(field.state.meta.errors);
            return targetError ? /* @__PURE__ */ jsx("p", { className: "text-sm text-error", children: targetError }) : null;
          } }),
          /* @__PURE__ */ jsx(form.Subscribe, { selector: (state) => state.errorMap.onSubmit, children: (submitError) => {
            const formError = getFormError(submitError);
            return formError ? /* @__PURE__ */ jsx("p", { className: "text-sm text-error", children: formError }) : null;
          } })
        ] })
      }
    ),
    errorMessage ? /* @__PURE__ */ jsx("div", { className: "rounded-lg border border-error/30 bg-error/10 p-3 text-sm text-error", children: errorMessage }) : null
  ] }) });
}
const TAB_DESCRIPTIONS = {
  backlinks: "See the individual links pointing to your target, including source page, anchor text, and link quality signals.",
  domains: "View the unique domains linking to your target, grouped at the site level instead of by individual link.",
  pages: "See which pages on the target site attract the most backlinks and referring domains."
};
function buildSummaryStats(data) {
  if (!data) return [];
  return [
    {
      label: "Backlinks",
      value: formatNumber(data.summary.backlinks),
      description: "Total links pointing to this site or page."
    },
    {
      label: "Referring Domains",
      value: formatNumber(data.summary.referringDomains),
      description: "Unique domains linking to this site or page."
    },
    {
      label: "Referring Pages",
      value: formatNumber(data.summary.referringPages),
      description: "Unique pages linking to this site or page."
    },
    {
      label: "Rank",
      value: formatNumber(data.summary.rank),
      description: "DataForSEO's 0-100 authority score."
    },
    {
      label: "Backlink Spam Score",
      value: formatDecimal(data.summary.backlinksSpamScore),
      description: "Estimated spam risk of links pointing here."
    },
    {
      label: "Broken Backlinks",
      value: formatNumber(data.summary.brokenBacklinks),
      description: "Links pointing to broken pages here."
    },
    {
      label: "Broken Pages",
      value: formatNumber(data.summary.brokenPages),
      description: "Broken pages here that still have backlinks."
    },
    {
      label: "Target Spam Score",
      value: formatDecimal(data.summary.targetSpamScore),
      description: "Estimated spam risk of this site or page."
    }
  ];
}
function formatNumber(value) {
  if (value == null) return "-";
  return new Intl.NumberFormat().format(Math.round(value));
}
function formatDecimal(value) {
  if (value == null) return "-";
  return value.toFixed(value >= 100 ? 0 : 1);
}
function formatTooltipValue(value) {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "number") return formatNumber(value);
  if (typeof value === "string") return value;
  return "-";
}
function formatCompactDate(value) {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString(void 0, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}
function formatMonthLabel(value) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString(void 0, {
    month: "short",
    year: "2-digit"
  });
}
function formatRelativeTimestamp(value) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "recently";
  return parsed.toLocaleString(void 0, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}
function extractUrlPath(url) {
  try {
    const parsed = new URL(url);
    return parsed.pathname + parsed.search + parsed.hash;
  } catch {
    return url;
  }
}
const ELLIPSIS = "...";
function truncateMiddle(value, maxLength) {
  if (value.length <= maxLength) return value;
  if (maxLength <= ELLIPSIS.length)
    return value.slice(0, Math.max(maxLength, 0));
  const sideLength = Math.floor((maxLength - ELLIPSIS.length) / 2);
  if (sideLength <= 0) {
    return `${value.slice(0, maxLength - ELLIPSIS.length)}${ELLIPSIS}`;
  }
  return `${value.slice(0, sideLength)}${ELLIPSIS}${value.slice(-sideLength)}`;
}
function BacklinksTrendChart({
  data
}) {
  const { containerRef, chartWidth } = useChartWidth();
  if (data.length === 0) {
    return /* @__PURE__ */ jsx(EmptyChartState, {});
  }
  return /* @__PURE__ */ jsx(
    "div",
    {
      ref: containerRef,
      className: "h-56 min-w-0",
      "aria-label": "Backlink trend chart",
      children: chartWidth > 0 ? /* @__PURE__ */ jsxs(
        LineChart,
        {
          width: chartWidth,
          height: 224,
          data,
          margin: { left: 8, right: 8, top: 8, bottom: 0 },
          children: [
            /* @__PURE__ */ jsx(
              CartesianGrid,
              {
                strokeDasharray: "3 3",
                stroke: "currentColor",
                opacity: 0.12
              }
            ),
            /* @__PURE__ */ jsx(
              XAxis,
              {
                dataKey: "date",
                tickFormatter: formatChartTick,
                minTickGap: 24
              }
            ),
            /* @__PURE__ */ jsx(YAxis, { yAxisId: "left", tickFormatter: formatAxisValue, width: 60 }),
            /* @__PURE__ */ jsx(
              YAxis,
              {
                yAxisId: "right",
                orientation: "right",
                tickFormatter: formatAxisValue,
                width: 60
              }
            ),
            /* @__PURE__ */ jsx(
              Tooltip,
              {
                formatter: formatTooltipValue,
                labelFormatter: formatChartLabel
              }
            ),
            /* @__PURE__ */ jsx(Legend, {}),
            /* @__PURE__ */ jsx(
              Line,
              {
                yAxisId: "left",
                type: "monotone",
                dataKey: "backlinks",
                stroke: "#2563eb",
                strokeWidth: 2,
                dot: false,
                name: "Backlinks"
              }
            ),
            /* @__PURE__ */ jsx(
              Line,
              {
                yAxisId: "right",
                type: "monotone",
                dataKey: "referringDomains",
                stroke: "#14b8a6",
                strokeWidth: 2,
                dot: false,
                name: "Referring domains"
              }
            )
          ]
        }
      ) : null
    }
  );
}
function BacklinksNewLostChart({
  data
}) {
  const { containerRef, chartWidth } = useChartWidth();
  if (data.length === 0) {
    return /* @__PURE__ */ jsx(EmptyChartState, {});
  }
  return /* @__PURE__ */ jsx(
    "div",
    {
      ref: containerRef,
      className: "h-56 min-w-0",
      "aria-label": "New and lost backlinks chart",
      children: chartWidth > 0 ? /* @__PURE__ */ jsxs(
        LineChart,
        {
          width: chartWidth,
          height: 224,
          data,
          margin: { left: 8, right: 8, top: 8, bottom: 0 },
          children: [
            /* @__PURE__ */ jsx(
              CartesianGrid,
              {
                strokeDasharray: "3 3",
                stroke: "currentColor",
                opacity: 0.12
              }
            ),
            /* @__PURE__ */ jsx(
              XAxis,
              {
                dataKey: "date",
                tickFormatter: formatChartTick,
                minTickGap: 24
              }
            ),
            /* @__PURE__ */ jsx(YAxis, { tickFormatter: formatAxisValue, width: 60 }),
            /* @__PURE__ */ jsx(
              Tooltip,
              {
                formatter: formatTooltipValue,
                labelFormatter: formatChartLabel
              }
            ),
            /* @__PURE__ */ jsx(Legend, {}),
            /* @__PURE__ */ jsx(
              Line,
              {
                type: "monotone",
                dataKey: "lostBacklinks",
                stroke: "#ef4444",
                strokeWidth: 2,
                dot: false,
                name: "Lost backlinks"
              }
            ),
            /* @__PURE__ */ jsx(
              Line,
              {
                type: "monotone",
                dataKey: "newBacklinks",
                stroke: "#16a34a",
                strokeWidth: 2,
                dot: false,
                name: "New backlinks"
              }
            )
          ]
        }
      ) : null
    }
  );
}
function useChartWidth() {
  const containerRef = useRef(null);
  const [chartWidth, setChartWidth] = useState(0);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    const updateWidth = () => {
      setChartWidth(container.clientWidth);
    };
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(container);
    return () => {
      observer.disconnect();
    };
  }, []);
  return { containerRef, chartWidth };
}
function EmptyChartState() {
  return /* @__PURE__ */ jsx("div", { className: "flex h-56 items-center justify-center rounded-xl border border-dashed border-base-300 text-sm text-base-content/55", children: "Not enough historical data yet." });
}
function formatAxisValue(value) {
  if (typeof value !== "number") return "";
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(0)}K`;
  return String(value);
}
function formatChartTick(value) {
  return typeof value === "string" ? formatMonthLabel(value) : "";
}
function formatChartLabel(value) {
  return typeof value === "string" ? formatCompactDate(value) : "";
}
function BacklinksOverviewPanels({
  projectId,
  data,
  summaryStats
}) {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs(
      Link,
      {
        to: "/p/$projectId/backlinks",
        params: { projectId },
        search: {
          target: void 0,
          scope: void 0,
          tab: void 0,
          page: void 0,
          size: void 0,
          sort: void 0,
          order: void 0
        },
        replace: true,
        className: "btn btn-ghost btn-sm gap-2 px-0 text-base-content/70 hover:bg-transparent",
        children: [
          /* @__PURE__ */ jsx(ArrowLeft, { className: "size-4" }),
          "Recent searches"
        ]
      }
    ) }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2 text-sm text-base-content/65", children: [
      /* @__PURE__ */ jsx("span", { className: "badge badge-outline", children: RESEARCH_SCOPE_LABELS[data.scope] }),
      /* @__PURE__ */ jsxs("span", { children: [
        "Target: ",
        data.displayTarget
      ] }),
      /* @__PURE__ */ jsx("span", { children: "-" }),
      /* @__PURE__ */ jsxs("span", { children: [
        "Updated ",
        formatRelativeTimestamp(data.fetchedAt)
      ] }),
      data.scope === "domain" ? /* @__PURE__ */ jsx("span", { children: "- Trends include subdomains" }) : null
    ] }),
    /* @__PURE__ */ jsx(OverviewGrid, { data, summaryStats }),
    data.scope === "exact_url" ? /* @__PURE__ */ jsx("div", { className: "alert alert-info", children: /* @__PURE__ */ jsx("span", { children: "Showing backlinks for this exact page. Switch the scope to Domain or Subdomains for site-wide results — trend charts need one of those." }) }) : null,
    data.scope === "subfolder" ? /* @__PURE__ */ jsx("div", { className: "alert alert-info", children: /* @__PURE__ */ jsx("span", { children: "Showing backlinks pointing into this subfolder. Counts come from filtered backlink totals; rank, trends, and the referring-domains breakdown need Domain or Subdomains scope." }) }) : null
  ] });
}
function OverviewGrid({
  data,
  summaryStats
}) {
  const domainScope = data.scope === "domain" || data.scope === "subdomains";
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: `grid grid-cols-1 gap-3 ${domainScope ? "md:grid-cols-2 xl:grid-cols-3" : ""}`,
      children: [
        /* @__PURE__ */ jsx(SummaryStatsGrid, { data, summaryStats }),
        domainScope ? /* @__PURE__ */ jsx(TrendPanels, { data }) : null
      ]
    }
  );
}
function SummaryStatsGrid({
  data,
  summaryStats
}) {
  const hasTrendPanels = data.scope === "domain" || data.scope === "subdomains";
  const cardClassName = `card bg-base-100 border border-base-300 ${hasTrendPanels ? "md:col-span-2 xl:col-span-1" : ""}`;
  return /* @__PURE__ */ jsx("div", { className: cardClassName, children: /* @__PURE__ */ jsx("div", { className: "card-body p-4 xl:h-full", children: /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-x-6 gap-y-5 xl:gap-y-6", children: summaryStats.map((item) => /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("div", { className: "text-xs uppercase tracking-wide text-base-content/55", children: /* @__PURE__ */ jsx(
      HeaderHelpLabel,
      {
        label: item.label,
        helpText: item.description
      }
    ) }),
    /* @__PURE__ */ jsx("p", { className: "text-2xl font-semibold", children: item.value })
  ] }, item.label)) }) }) });
}
function TrendPanels({ data }) {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      TrendCard,
      {
        title: "Backlink growth",
        description: "Backlinks and referring domains over the last year",
        children: /* @__PURE__ */ jsx(BacklinksTrendChart, { data: data.trends })
      }
    ),
    /* @__PURE__ */ jsx(
      TrendCard,
      {
        title: "New vs lost",
        description: "Backlink acquisition and attrition",
        children: /* @__PURE__ */ jsx(BacklinksNewLostChart, { data: data.newLostTrends })
      }
    )
  ] });
}
function TrendCard({
  children,
  description,
  title
}) {
  return /* @__PURE__ */ jsx("div", { className: "card bg-base-100 border border-base-300", children: /* @__PURE__ */ jsxs("div", { className: "card-body gap-2 p-4", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h2", { className: "text-sm font-medium", children: title }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-base-content/55", children: description })
    ] }),
    children
  ] }) });
}
const EMPTY_BACKLINKS_FILTERS = {
  include: "",
  exclude: "",
  minDomainRank: "",
  maxDomainRank: "",
  minLinkAuthority: "",
  maxLinkAuthority: "",
  minSpamScore: "",
  maxSpamScore: "",
  linkType: "",
  hideLost: "",
  hideBroken: ""
};
const EMPTY_REFERRING_DOMAINS_FILTERS = {
  include: "",
  exclude: "",
  minBacklinks: "",
  maxBacklinks: "",
  minRank: "",
  maxRank: "",
  minSpamScore: "",
  maxSpamScore: ""
};
const EMPTY_TOP_PAGES_FILTERS = {
  include: "",
  exclude: "",
  minBacklinks: "",
  maxBacklinks: "",
  minReferringDomains: "",
  maxReferringDomains: "",
  minRank: "",
  maxRank: ""
};
const BACKLINKS_FILTER_FIELDS = [
  "include",
  "exclude",
  "minDomainRank",
  "maxDomainRank",
  "minLinkAuthority",
  "maxLinkAuthority",
  "minSpamScore",
  "maxSpamScore",
  "linkType",
  "hideLost",
  "hideBroken"
];
const REFERRING_DOMAINS_FILTER_FIELDS = [
  "include",
  "exclude",
  "minBacklinks",
  "maxBacklinks",
  "minRank",
  "maxRank",
  "minSpamScore",
  "maxSpamScore"
];
const TOP_PAGES_FILTER_FIELDS = [
  "include",
  "exclude",
  "minBacklinks",
  "maxBacklinks",
  "minReferringDomains",
  "maxReferringDomains",
  "minRank",
  "maxRank"
];
function countActiveFilters(values) {
  return Object.values(values).filter((v) => v.trim() !== "").length;
}
function countFilterConditions(values) {
  let n = 0;
  for (const [key, value] of Object.entries(values)) {
    if (key === "include" || key === "exclude") {
      for (const term of value.split(/[,+]/)) if (term.trim()) n += 1;
      continue;
    }
    if (value.trim() !== "") n += 1;
  }
  return n;
}
function toNumberOrUndefined(value) {
  const trimmed = value.trim();
  if (trimmed === "") return void 0;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : void 0;
}
function toBacklinksFiltersPayload(values) {
  return {
    include: values.include.trim() || void 0,
    exclude: values.exclude.trim() || void 0,
    minDomainRank: toNumberOrUndefined(values.minDomainRank),
    maxDomainRank: toNumberOrUndefined(values.maxDomainRank),
    minLinkAuthority: toNumberOrUndefined(values.minLinkAuthority),
    maxLinkAuthority: toNumberOrUndefined(values.maxLinkAuthority),
    minSpamScore: toNumberOrUndefined(values.minSpamScore),
    maxSpamScore: toNumberOrUndefined(values.maxSpamScore),
    linkType: values.linkType === "dofollow" || values.linkType === "nofollow" ? values.linkType : void 0,
    hideLost: values.hideLost === "true" ? true : void 0,
    hideBroken: values.hideBroken === "true" ? true : void 0
  };
}
function toReferringDomainsFiltersPayload(values) {
  return {
    include: values.include.trim() || void 0,
    exclude: values.exclude.trim() || void 0,
    minBacklinks: toNumberOrUndefined(values.minBacklinks),
    maxBacklinks: toNumberOrUndefined(values.maxBacklinks),
    minRank: toNumberOrUndefined(values.minRank),
    maxRank: toNumberOrUndefined(values.maxRank),
    minSpamScore: toNumberOrUndefined(values.minSpamScore),
    maxSpamScore: toNumberOrUndefined(values.maxSpamScore)
  };
}
function toTopPagesFiltersPayload(values) {
  return {
    include: values.include.trim() || void 0,
    exclude: values.exclude.trim() || void 0,
    minBacklinks: toNumberOrUndefined(values.minBacklinks),
    maxBacklinks: toNumberOrUndefined(values.maxBacklinks),
    minReferringDomains: toNumberOrUndefined(values.minReferringDomains),
    maxReferringDomains: toNumberOrUndefined(values.maxReferringDomains),
    minRank: toNumberOrUndefined(values.minRank),
    maxRank: toNumberOrUndefined(values.maxRank)
  };
}
function BacklinksFilterPanel({
  activeTab,
  filters,
  onApplied,
  maxConditions
}) {
  if (activeTab === "backlinks") {
    const state2 = filters.backlinks;
    return /* @__PURE__ */ jsx(
      DomainFilterPanel,
      {
        debugName: "BacklinksFilterPanel",
        appliedFilters: state2.values,
        fields: BACKLINKS_FILTER_FIELDS,
        activeFilterCount: state2.activeFilterCount,
        countConditions: countFilterConditions,
        maxConditions,
        textFields: [
          {
            key: "include",
            label: "Source URL Contains",
            placeholder: "example.com, blog"
          },
          {
            key: "exclude",
            label: "Source URL Excludes",
            placeholder: "spam, forum"
          }
        ],
        rangeFields: [
          {
            title: "Domain Authority",
            minKey: "minDomainRank",
            maxKey: "maxDomainRank"
          },
          {
            title: "Link Authority",
            minKey: "minLinkAuthority",
            maxKey: "maxLinkAuthority"
          },
          {
            title: "Spam Score",
            minKey: "minSpamScore",
            maxKey: "maxSpamScore",
            step: "0.1"
          }
        ],
        onApply: (values) => {
          state2.apply(values);
          onApplied();
        },
        onClear: () => {
          state2.reset();
          onApplied();
        },
        renderExtra: (draft, setValue) => /* @__PURE__ */ jsx(BacklinksToggleControls, { draft, setValue })
      },
      "backlinks"
    );
  }
  if (activeTab === "domains") {
    const state2 = filters.domains;
    return /* @__PURE__ */ jsx(
      DomainFilterPanel,
      {
        debugName: "ReferringDomainsFilterPanel",
        appliedFilters: state2.values,
        fields: REFERRING_DOMAINS_FILTER_FIELDS,
        activeFilterCount: state2.activeFilterCount,
        countConditions: countFilterConditions,
        maxConditions,
        textFields: [
          {
            key: "include",
            label: "Domain Contains",
            placeholder: "example.com, blog"
          },
          {
            key: "exclude",
            label: "Domain Excludes",
            placeholder: "spam, forum"
          }
        ],
        rangeFields: [
          {
            title: "Backlinks",
            minKey: "minBacklinks",
            maxKey: "maxBacklinks"
          },
          { title: "Rank", minKey: "minRank", maxKey: "maxRank" },
          {
            title: "Spam Score",
            minKey: "minSpamScore",
            maxKey: "maxSpamScore",
            step: "0.1"
          }
        ],
        onApply: (values) => {
          state2.apply(values);
          onApplied();
        },
        onClear: () => {
          state2.reset();
          onApplied();
        }
      },
      "domains"
    );
  }
  const state = filters.pages;
  return /* @__PURE__ */ jsx(
    DomainFilterPanel,
    {
      debugName: "TopPagesFilterPanel",
      appliedFilters: state.values,
      fields: TOP_PAGES_FILTER_FIELDS,
      activeFilterCount: state.activeFilterCount,
      countConditions: countFilterConditions,
      maxConditions,
      textFields: [
        {
          key: "include",
          label: "Page URL Contains",
          placeholder: "/blog, /products"
        },
        {
          key: "exclude",
          label: "Page URL Excludes",
          placeholder: "/tag, /author"
        }
      ],
      rangeFields: [
        { title: "Backlinks", minKey: "minBacklinks", maxKey: "maxBacklinks" },
        {
          title: "Referring Domains",
          minKey: "minReferringDomains",
          maxKey: "maxReferringDomains"
        },
        { title: "Rank", minKey: "minRank", maxKey: "maxRank" }
      ],
      onApply: (values) => {
        state.apply(values);
        onApplied();
      },
      onClear: () => {
        state.reset();
        onApplied();
      }
    },
    "pages"
  );
}
function BacklinksToggleControls({
  draft,
  setValue
}) {
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsx("p", { className: "text-[11px] font-semibold uppercase tracking-wide text-base-content/60", children: "Link Type" }),
      /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1", children: ["", "dofollow", "nofollow"].map((value) => /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          className: `btn btn-xs ${draft.linkType === value ? "btn-soft" : "btn-ghost"}`,
          onClick: () => setValue("linkType", value),
          children: value === "" ? "All" : value === "dofollow" ? "Dofollow" : "Nofollow"
        },
        value || "all"
      )) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsx("p", { className: "text-[11px] font-semibold uppercase tracking-wide text-base-content/60", children: "Visibility" }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-1.5 cursor-pointer", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              className: "checkbox checkbox-xs",
              checked: draft.hideLost === "true",
              onChange: (event) => setValue("hideLost", event.target.checked ? "true" : "")
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "text-xs", children: "Hide lost" })
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-1.5 cursor-pointer", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              className: "checkbox checkbox-xs",
              checked: draft.hideBroken === "true",
              onChange: (event) => setValue("hideBroken", event.target.checked ? "true" : "")
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "text-xs", children: "Hide broken" })
        ] })
      ] })
    ] })
  ] });
}
function EmptyTableState({ label }) {
  return /* @__PURE__ */ jsx("div", { className: "rounded-xl border border-dashed border-base-300 p-10 text-center text-sm text-base-content/55", children: label });
}
function BacklinksSourceLink({
  url,
  maxLength,
  muted = false
}) {
  return /* @__PURE__ */ jsx(
    SafeExternalLink,
    {
      url,
      label: truncateMiddle(extractUrlPath(url), maxLength),
      className: `link link-hover break-all inline-flex items-center gap-1 ${muted ? "text-xs text-base-content/55" : "text-sm"}`
    }
  );
}
function BacklinkFlags({ row }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-1", children: [
    row.isLost ? /* @__PURE__ */ jsx("span", { className: "badge badge-sm badge-error badge-outline", children: "Lost" }) : null,
    row.isBroken ? /* @__PURE__ */ jsx("span", { className: "badge badge-sm badge-warning badge-outline", children: "Broken" }) : null,
    row.isDofollow === false ? /* @__PURE__ */ jsx("span", { className: "badge badge-sm badge-outline", children: "Nofollow" }) : null,
    row.linksCount != null && row.linksCount > 1 ? /* @__PURE__ */ jsxs("span", { className: "badge badge-sm badge-outline min-w-fit whitespace-nowrap", children: [
      row.linksCount,
      " links"
    ] }) : null
  ] });
}
function StatusCell({ status }) {
  if (status === "loading") {
    return /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2 pl-6 text-sm text-base-content/60", children: [
      /* @__PURE__ */ jsx("span", { className: "loading loading-spinner loading-xs" }),
      "Loading links…"
    ] });
  }
  return /* @__PURE__ */ jsx("span", { className: "pl-6 text-sm text-base-content/60", children: status === "error" ? "Couldn't load this domain's links." : "No other links from this domain." });
}
function SourceCell({
  displayRow,
  onToggleDomain
}) {
  if (displayRow.kind === "status") {
    return /* @__PURE__ */ jsx(StatusCell, { status: displayRow.status });
  }
  const { row, depth, expandable, expanded } = displayRow;
  if (depth > 0) {
    return /* @__PURE__ */ jsx("div", { className: "break-all pl-6", children: row.urlFrom ? /* @__PURE__ */ jsx(BacklinksSourceLink, { url: row.urlFrom, maxLength: 48, muted: true }) : /* @__PURE__ */ jsx("span", { className: "text-base-content/55", children: "-" }) });
  }
  const domainLabel = row.domainFrom?.replace(/^www\./, "") ?? "-";
  return /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-1.5 break-all", children: [
    expandable && row.domainFrom && onToggleDomain ? /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        className: "btn btn-ghost btn-xs btn-square shrink-0 -ml-1",
        "aria-label": `${expanded ? "Hide" : "Show"} all links from ${domainLabel}`,
        "aria-expanded": expanded,
        onClick: () => onToggleDomain(row.domainFrom ?? ""),
        children: /* @__PURE__ */ jsx(
          ChevronRight,
          {
            className: `size-4 transition-transform ${expanded ? "rotate-90" : ""}`
          }
        )
      }
    ) : null,
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("div", { className: "font-semibold", children: domainLabel }),
      row.urlFrom ? /* @__PURE__ */ jsx(BacklinksSourceLink, { url: row.urlFrom, maxLength: 48, muted: true }) : null
    ] })
  ] });
}
function linkCell(render) {
  return ({ row }) => row.original.kind === "link" ? render(row.original.row) : null;
}
function buildBaseColumns(onToggleDomain) {
  return [
    {
      id: "source",
      enableSorting: false,
      header: () => /* @__PURE__ */ jsx(HeaderHelpLabel, { label: "Source", helpText: "Page linking to you" }),
      size: 250,
      minSize: 180,
      cell: ({ row }) => /* @__PURE__ */ jsx(SourceCell, { displayRow: row.original, onToggleDomain })
    },
    {
      id: "target",
      enableSorting: false,
      header: () => /* @__PURE__ */ jsx(HeaderHelpLabel, { label: "Target", helpText: "Destination on your site" }),
      size: 220,
      minSize: 150,
      cell: linkCell((row) => /* @__PURE__ */ jsx("div", { className: "break-all", children: row.urlTo ? /* @__PURE__ */ jsx(BacklinksSourceLink, { url: row.urlTo, maxLength: 40 }) : "-" }))
    },
    {
      id: "anchor",
      enableSorting: false,
      header: () => /* @__PURE__ */ jsx(HeaderHelpLabel, { label: "Anchor", helpText: "Text or format of the link" }),
      size: 150,
      minSize: 100,
      cell: linkCell((row) => /* @__PURE__ */ jsxs("div", { className: "space-y-0.5 break-words", children: [
        /* @__PURE__ */ jsx("span", { className: "text-sm", children: row.anchor || "No anchor text" }),
        row.itemType ? /* @__PURE__ */ jsx("div", { className: "text-xs text-base-content/55", children: row.itemType }) : null
      ] }))
    },
    {
      id: "flags",
      enableSorting: false,
      header: () => /* @__PURE__ */ jsx(
        HeaderHelpLabel,
        {
          label: "Flags",
          helpText: "Special backlink attributes, such as lost, broken, nofollow, or multiple links from the same source."
        }
      ),
      size: 130,
      minSize: 80,
      cell: linkCell((row) => /* @__PURE__ */ jsx(BacklinkFlags, { row }))
    },
    {
      id: "rank",
      accessorFn: (displayRow) => displayRow.kind === "link" ? displayRow.row.rank : null,
      header: ({ column }) => /* @__PURE__ */ jsx(
        SortableHeader,
        {
          column,
          label: "Link",
          helpText: "Authority of the linking page",
          align: "right"
        }
      ),
      size: 70,
      minSize: 50,
      sortDescFirst: true,
      cell: linkCell((row) => /* @__PURE__ */ jsx("div", { className: "text-right tabular-nums text-sm", children: formatNumber(row.rank) }))
    },
    {
      id: "domainRank",
      accessorFn: (displayRow) => displayRow.kind === "link" ? displayRow.row.domainFromRank : null,
      header: ({ column }) => /* @__PURE__ */ jsx(
        SortableHeader,
        {
          column,
          label: "DA",
          helpText: "Authority of the linking domain",
          align: "right"
        }
      ),
      size: 70,
      minSize: 50,
      sortDescFirst: true,
      cell: linkCell((row) => /* @__PURE__ */ jsx("div", { className: "text-right tabular-nums text-sm", children: formatNumber(row.domainFromRank) }))
    },
    {
      id: "spamScore",
      accessorFn: (displayRow) => displayRow.kind === "link" ? displayRow.row.spamScore : null,
      header: ({ column }) => /* @__PURE__ */ jsx(
        SortableHeader,
        {
          column,
          label: "Spam",
          helpText: "Estimated spam risk for this backlink. Higher scores are more likely to be manipulative or low quality.",
          align: "right"
        }
      ),
      size: 70,
      minSize: 50,
      sortDescFirst: true,
      cell: linkCell((row) => {
        const value = row.spamScore;
        return /* @__PURE__ */ jsx("div", { className: "text-right tabular-nums text-sm", children: value != null && value > 0 ? Math.round(value) : null });
      })
    },
    {
      id: "firstSeen",
      accessorFn: (displayRow) => displayRow.kind === "link" ? displayRow.row.firstSeen : null,
      header: ({ column }) => /* @__PURE__ */ jsx(
        SortableHeader,
        {
          column,
          label: "First Seen",
          helpText: "When this link was first discovered by the crawler"
        }
      ),
      size: 110,
      minSize: 80,
      sortDescFirst: true,
      cell: linkCell((row) => /* @__PURE__ */ jsxs("div", { className: "whitespace-nowrap text-sm", children: [
        /* @__PURE__ */ jsx("div", { children: formatCompactDate(row.firstSeen) }),
        row.lastSeen ? /* @__PURE__ */ jsxs("div", { className: "text-xs text-base-content/55", children: [
          "Last ",
          formatCompactDate(row.lastSeen)
        ] }) : null
      ] }))
    }
  ];
}
function buildBacklinksColumns(domainRatings, onToggleDomain) {
  const baseColumns2 = buildBaseColumns(onToggleDomain);
  if (!domainRatings) return baseColumns2;
  const ratings = domainRatings;
  const drColumn = {
    id: "ahrefsDr",
    enableSorting: false,
    header: () => /* @__PURE__ */ jsx("span", { className: "flex w-full justify-end", children: /* @__PURE__ */ jsx(
      HeaderHelpLabel,
      {
        label: "Ahrefs DR",
        helpText: "Ahrefs Domain Rating (0-100) for the linking domain."
      }
    ) }),
    size: 90,
    minSize: 70,
    cell: linkCell((row) => {
      const domain = row.domainFrom?.replace(/^www\./, "");
      const dr = domain ? ratings[domain] ?? null : null;
      return /* @__PURE__ */ jsx("div", { className: "text-right tabular-nums text-sm", children: dr == null ? "—" : formatDecimal(dr) });
    })
  };
  const insertAt = baseColumns2.findIndex((column) => column.id === "domainRank") + 1;
  return [
    ...baseColumns2.slice(0, insertAt),
    drColumn,
    ...baseColumns2.slice(insertAt)
  ];
}
function buildDisplayRows(rows, expansion) {
  if (!expansion) {
    return rows.map((row) => ({
      kind: "link",
      row,
      depth: 0,
      expandable: false,
      expanded: false
    }));
  }
  const out = [];
  for (const row of rows) {
    const domain = row.domainFrom;
    const expanded = Boolean(domain && expansion.expandedDomains.has(domain));
    out.push({
      kind: "link",
      row,
      depth: 0,
      expandable: Boolean(domain),
      expanded
    });
    if (!expanded || !domain) continue;
    const entry = expansion.entriesByDomain[domain];
    if (!entry || entry.status === "loading") {
      out.push({ kind: "status", domain, status: "loading" });
    } else if (entry.status === "error") {
      out.push({ kind: "status", domain, status: "error" });
    } else {
      const children = entry.rows.filter(
        (child) => !(child.urlFrom === row.urlFrom && child.urlTo === row.urlTo && child.anchor === row.anchor)
      );
      if (children.length === 0) {
        out.push({ kind: "status", domain, status: "empty" });
      } else {
        for (const child of children) {
          out.push({
            kind: "link",
            row: child,
            depth: 1,
            expandable: false,
            expanded: false
          });
        }
      }
    }
  }
  return out;
}
function BacklinksTable({
  rows,
  domainRatings,
  sorting,
  onSortingChange,
  expansion
}) {
  const columns2 = useMemo(
    () => buildBacklinksColumns(domainRatings, expansion?.toggleDomain),
    [domainRatings, expansion?.toggleDomain]
  );
  const displayRows = useMemo(
    () => buildDisplayRows(rows, expansion),
    [rows, expansion]
  );
  const table = useAppTable({
    data: displayRows,
    columns: columns2,
    state: { sorting },
    onSortingChange,
    manualSorting: true
  });
  if (rows.length === 0) {
    return /* @__PURE__ */ jsx(EmptyTableState, { label: "No backlinks match this filter." });
  }
  return /* @__PURE__ */ jsx(
    AppDataTable,
    {
      table,
      fixedLayout: true,
      getRowClassName: (row) => row.original.kind !== "link" || row.original.depth > 0 ? "bg-base-200/30" : void 0
    }
  );
}
const columnHelper$1 = createColumnHelper();
const baseColumns = [
  columnHelper$1.accessor("domain", {
    id: "domain",
    header: ({ column }) => /* @__PURE__ */ jsx(
      SortableHeader,
      {
        column,
        label: "Domain",
        helpText: "The referring site linking to your target."
      }
    ),
    cell: ({ getValue }) => {
      const domain = getValue();
      if (!domain) return "-";
      return /* @__PURE__ */ jsx(
        SafeExternalLink,
        {
          url: getDomainWebsiteHref(domain),
          label: domain,
          className: "link link-primary link-hover break-all inline-flex items-center gap-1"
        }
      );
    }
  }),
  columnHelper$1.accessor("backlinks", {
    id: "backlinks",
    header: ({ column }) => /* @__PURE__ */ jsx(
      SortableHeader,
      {
        column,
        label: "Backlinks",
        helpText: "Total backlinks found from this domain."
      }
    ),
    cell: ({ getValue }) => formatNumber(getValue()),
    sortDescFirst: true
  }),
  columnHelper$1.accessor("referringPages", {
    id: "referringPages",
    header: ({ column }) => /* @__PURE__ */ jsx(
      SortableHeader,
      {
        column,
        label: "Referring Pages",
        helpText: "Unique pages on this domain that link to your target."
      }
    ),
    cell: ({ getValue }) => formatNumber(getValue()),
    sortDescFirst: true
  }),
  columnHelper$1.accessor("rank", {
    id: "rank",
    header: ({ column }) => /* @__PURE__ */ jsx(
      SortableHeader,
      {
        column,
        label: "Rank",
        helpText: "Authority score for the referring domain."
      }
    ),
    cell: ({ getValue }) => formatNumber(getValue()),
    sortDescFirst: true
  }),
  columnHelper$1.accessor("spamScore", {
    id: "spamScore",
    header: ({ column }) => /* @__PURE__ */ jsx(
      SortableHeader,
      {
        column,
        label: "Spam",
        helpText: "Spam risk score for this referring domain."
      }
    ),
    cell: ({ getValue }) => formatDecimal(getValue()),
    sortDescFirst: true
  }),
  columnHelper$1.accessor("firstSeen", {
    id: "firstSeen",
    header: ({ column }) => /* @__PURE__ */ jsx(
      SortableHeader,
      {
        column,
        label: "First Seen",
        helpText: "When this domain was first discovered linking to your target."
      }
    ),
    cell: ({ getValue }) => formatCompactDate(getValue()),
    sortDescFirst: true
  }),
  columnHelper$1.accessor("brokenBacklinks", {
    id: "brokenBacklinks",
    header: ({ column }) => /* @__PURE__ */ jsx(
      SortableHeader,
      {
        column,
        label: "Issues",
        helpText: "Broken link and broken page counts tied to this domain."
      }
    ),
    cell: ({ row }) => /* @__PURE__ */ jsxs("div", { className: "text-sm", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        "Broken links: ",
        formatNumber(row.original.brokenBacklinks)
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "text-base-content/55", children: [
        "Broken pages: ",
        formatNumber(row.original.brokenPages)
      ] })
    ] }),
    sortDescFirst: true
  })
];
function buildReferringDomainColumns(domainRatings) {
  if (!domainRatings) return baseColumns;
  const ratings = domainRatings;
  const drColumn = columnHelper$1.display({
    id: "ahrefsDr",
    header: () => /* @__PURE__ */ jsx(
      HeaderHelpLabel,
      {
        label: "Ahrefs DR",
        helpText: "Ahrefs Domain Rating (0-100) for this referring domain."
      }
    ),
    cell: ({ row }) => {
      const domain = row.original.domain;
      const dr = domain ? ratings[domain] ?? null : null;
      return dr == null ? "—" : formatDecimal(dr);
    }
  });
  const insertAt = baseColumns.findIndex((column) => column.id === "rank") + 1;
  return [
    ...baseColumns.slice(0, insertAt),
    drColumn,
    ...baseColumns.slice(insertAt)
  ];
}
function getDomainWebsiteHref(domain) {
  try {
    return new URL(domain).toString();
  } catch {
    return `https://${domain}`;
  }
}
function ReferringDomainsTable({
  rows,
  domainRatings,
  sorting,
  onSortingChange
}) {
  const columns2 = useMemo(
    () => buildReferringDomainColumns(domainRatings),
    [domainRatings]
  );
  const table = useAppTable({
    data: rows,
    columns: columns2,
    state: { sorting },
    onSortingChange,
    manualSorting: true
  });
  if (rows.length === 0) {
    return /* @__PURE__ */ jsx(EmptyTableState, { label: "No referring domains match this filter." });
  }
  return /* @__PURE__ */ jsx(
    AppDataTable,
    {
      table,
      getCellClassName: (_, columnId) => columnId === "domain" ? "font-medium break-all" : void 0
    }
  );
}
const columnHelper = createColumnHelper();
const columns = [
  columnHelper.accessor("page", {
    id: "page",
    enableSorting: false,
    header: () => /* @__PURE__ */ jsx(
      HeaderHelpLabel,
      {
        label: "Page",
        helpText: "Page on the target site receiving backlinks."
      }
    ),
    cell: ({ getValue }) => {
      const page = getValue();
      return page ? /* @__PURE__ */ jsx(
        SafeExternalLink,
        {
          url: page,
          label: page,
          className: "link link-hover break-all inline-flex items-center gap-1"
        }
      ) : "-";
    }
  }),
  columnHelper.accessor("backlinks", {
    id: "backlinks",
    header: ({ column }) => /* @__PURE__ */ jsx(
      SortableHeader,
      {
        column,
        label: "Backlinks",
        helpText: "Total backlinks pointing to this page."
      }
    ),
    cell: ({ getValue }) => formatNumber(getValue()),
    sortDescFirst: true
  }),
  columnHelper.accessor("referringDomains", {
    id: "referringDomains",
    header: ({ column }) => /* @__PURE__ */ jsx(
      SortableHeader,
      {
        column,
        label: "Referring Domains",
        helpText: "Unique domains linking to this page."
      }
    ),
    cell: ({ getValue }) => formatNumber(getValue()),
    sortDescFirst: true
  }),
  columnHelper.accessor("rank", {
    id: "rank",
    header: ({ column }) => /* @__PURE__ */ jsx(
      SortableHeader,
      {
        column,
        label: "Rank",
        helpText: "Authority score for this target page."
      }
    ),
    cell: ({ getValue }) => formatNumber(getValue()),
    sortDescFirst: true
  }),
  columnHelper.accessor("brokenBacklinks", {
    id: "brokenBacklinks",
    header: ({ column }) => /* @__PURE__ */ jsx(
      SortableHeader,
      {
        column,
        label: "Broken Backlinks",
        helpText: "Backlinks pointing here that are currently broken."
      }
    ),
    cell: ({ getValue }) => formatNumber(getValue()),
    sortDescFirst: true
  })
];
function TopPagesTable({
  rows,
  sorting,
  onSortingChange
}) {
  const table = useAppTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange,
    manualSorting: true
  });
  if (rows.length === 0) {
    return /* @__PURE__ */ jsx(EmptyTableState, { label: "No top pages match this filter." });
  }
  return /* @__PURE__ */ jsx(
    AppDataTable,
    {
      table,
      getCellClassName: (_, columnId) => columnId === "page" ? "min-w-80" : void 0
    }
  );
}
function buildBacklinksTabExport(args) {
  const { tab, rows, domainRatings } = args;
  const ratingFor = (domain) => {
    if (!domainRatings || !domain) return null;
    return domainRatings[domain.replace(/^www\./, "")] ?? null;
  };
  if (tab === "backlinks") {
    return {
      headers: [
        "Domain",
        "Source URL",
        "Target URL",
        "Anchor",
        "Type",
        "Dofollow",
        "Rel Attributes",
        "Domain Rank",
        ...domainRatings ? ["Ahrefs DR"] : [],
        "Source Page Rank",
        "Target Rank",
        "Spam Score",
        "First Seen",
        "Last Seen",
        "Lost",
        "Broken",
        "Links Count"
      ],
      rows: rows.backlinks.map((row) => [
        row.domainFrom,
        row.urlFrom,
        row.urlTo,
        row.anchor,
        row.itemType,
        row.isDofollow,
        row.relAttributes.join(", "),
        row.domainFromRank,
        ...domainRatings ? [ratingFor(row.domainFrom)] : [],
        row.pageFromRank,
        row.rank,
        row.spamScore,
        row.firstSeen,
        row.lastSeen,
        row.isLost,
        row.isBroken,
        row.linksCount
      ])
    };
  }
  if (tab === "domains") {
    return {
      headers: [
        "Domain",
        "Backlinks",
        "Referring Pages",
        "Rank",
        ...domainRatings ? ["Ahrefs DR"] : [],
        "Spam Score",
        "First Seen",
        "Broken Backlinks",
        "Broken Pages"
      ],
      rows: rows.referringDomains.map((row) => [
        row.domain,
        row.backlinks,
        row.referringPages,
        row.rank,
        ...domainRatings ? [ratingFor(row.domain)] : [],
        row.spamScore,
        row.firstSeen,
        row.brokenBacklinks,
        row.brokenPages
      ])
    };
  }
  return {
    headers: [
      "Page",
      "Backlinks",
      "Referring Domains",
      "Rank",
      "Broken Backlinks"
    ],
    rows: rows.topPages.map((row) => [
      row.page,
      row.backlinks,
      row.referringDomains,
      row.rank,
      row.brokenBacklinks
    ])
  };
}
function exportBacklinksTabCsv(args) {
  downloadCsv(
    buildBacklinksTabCsvFilename(args.tab, args.target),
    buildCsv(args.headers, args.rows)
  );
}
function buildBacklinksTabCsvFilename(tab, target) {
  const tabPrefix = tab === "backlinks" ? "backlinks" : tab === "domains" ? "referring-domains" : "top-pages";
  const normalizedTarget = target.toLowerCase().trim().replace(/https?:\/\//g, "").replace(/[^a-z0-9.-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
  return `backlinks-${tabPrefix}${normalizedTarget ? `-${normalizedTarget}` : ""}.csv`;
}
function BacklinksExportMenu({
  activeTab,
  exportTarget,
  headers,
  rows
}) {
  const [isExportingSheets, setIsExportingSheets] = useState(false);
  const canExport = rows.length > 0 && !isExportingSheets;
  const handleExportToSheets = async () => {
    if (!canExport) return;
    setIsExportingSheets(true);
    try {
      await exportTableToSheets({
        headers,
        rows,
        feature: `backlinks_${activeTab}`
      });
    } finally {
      setIsExportingSheets(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "dropdown dropdown-end", children: [
    /* @__PURE__ */ jsxs(
      "div",
      {
        tabIndex: 0,
        role: "button",
        className: `btn btn-sm btn-ghost gap-1 ${rows.length === 0 ? "btn-disabled" : ""}`,
        "aria-label": "Export backlinks table",
        children: [
          /* @__PURE__ */ jsx(Download, { className: "size-4" }),
          "Export",
          /* @__PURE__ */ jsx(ChevronDown, { className: "size-3 opacity-60" })
        ]
      }
    ),
    /* @__PURE__ */ jsxs(
      "ul",
      {
        tabIndex: 0,
        role: "menu",
        className: "dropdown-content z-10 menu p-2 shadow-lg bg-base-100 border border-base-300 rounded-box w-56",
        children: [
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: () => void handleExportToSheets(),
              disabled: !canExport,
              children: [
                isExportingSheets ? /* @__PURE__ */ jsx("span", { className: "loading loading-spinner loading-xs" }) : /* @__PURE__ */ jsx(Sheet, { className: "size-4" }),
                "Export to Sheets"
              ]
            }
          ) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: () => exportBacklinksTabCsv({
                tab: activeTab,
                target: exportTarget,
                headers,
                rows
              }),
              disabled: rows.length === 0,
              children: [
                /* @__PURE__ */ jsx(Download, { className: "size-4" }),
                "Export CSV"
              ]
            }
          ) })
        ]
      }
    )
  ] });
}
function BacklinksActionsMenu({
  isLoadingRatings,
  loadRatings,
  ratableDomains
}) {
  return /* @__PURE__ */ jsxs("div", { className: "dropdown dropdown-end", children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        tabIndex: 0,
        role: "button",
        className: "btn btn-sm btn-ghost btn-square",
        "aria-label": "Backlinks table actions",
        title: "Backlinks table actions",
        children: /* @__PURE__ */ jsx(MoreHorizontal, { className: "size-4" })
      }
    ),
    /* @__PURE__ */ jsx(
      "ul",
      {
        tabIndex: 0,
        role: "menu",
        className: "dropdown-content z-10 menu p-2 shadow-lg bg-base-100 border border-base-300 rounded-box w-52",
        children: /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: () => void loadRatings(ratableDomains),
            disabled: isLoadingRatings,
            title: "Look up Ahrefs Domain Rating for each domain in the table",
            children: [
              isLoadingRatings ? /* @__PURE__ */ jsx("span", { className: "loading loading-spinner loading-xs" }) : /* @__PURE__ */ jsx(Gauge, { className: "size-4" }),
              "Ahrefs DR"
            ]
          }
        ) })
      }
    )
  ] });
}
const MAX_DOMAINS_PER_CALL = 100;
const domainRatingsInputSchema = z.object({
  projectId: z.string().min(1),
  domains: z.array(z.string().trim().min(1).max(253)).max(MAX_DOMAINS_PER_CALL)
});
const getAhrefsDomainRatings = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(domainRatingsInputSchema).handler(createSsrRpc("319d82ec75b2b49399d07e97a0efffd36bd56066017d95b692e7074cae6b1272"));
const DOMAINS_PER_REQUEST = 100;
function useAhrefsDomainRatings(projectId) {
  const [ratings, setRatings] = useState(null);
  const ratingsRef = useRef(null);
  const pendingDomainsRef = useRef(/* @__PURE__ */ new Set());
  const [activeLoadCount, setActiveLoadCount] = useState(0);
  useEffect(() => {
    ratingsRef.current = ratings;
  }, [ratings]);
  const loadRatings = useCallback(
    async (domains) => {
      const currentRatings = ratingsRef.current;
      const pendingDomains = pendingDomainsRef.current;
      const targets = unique(domains.filter(Boolean)).filter(
        (domain) => !Object.hasOwn(currentRatings ?? {}, domain) && !pendingDomains.has(domain)
      );
      if (targets.length === 0) return;
      for (const domain of targets) pendingDomains.add(domain);
      setActiveLoadCount((count) => count + 1);
      const fetched = {};
      try {
        for (const batch of chunk(targets, DOMAINS_PER_REQUEST)) {
          Object.assign(
            fetched,
            await getAhrefsDomainRatings({
              data: { projectId, domains: batch }
            })
          );
        }
      } catch (error) {
        toast.error(
          getStandardErrorMessage(error, "Could not load Ahrefs DR.")
        );
      } finally {
        if (Object.keys(fetched).length > 0) {
          const nextRatings = { ...ratingsRef.current, ...fetched };
          ratingsRef.current = nextRatings;
          setRatings(nextRatings);
        }
        for (const domain of targets) pendingDomains.delete(domain);
        setActiveLoadCount((count) => Math.max(0, count - 1));
      }
    },
    [projectId]
  );
  return { ratings, isLoading: activeLoadCount > 0, loadRatings };
}
const BACKLINKS_RESULTS_TABS = [
  { tab: "backlinks", label: "Backlinks" },
  { tab: "domains", label: "Referring Domains" },
  { tab: "pages", label: "Top Pages" }
];
function BacklinksResultsCard({
  projectId,
  activeTab,
  scope,
  tabRows,
  filters,
  sorting,
  view,
  domainExpansion,
  isTabLoading,
  tabErrorMessage,
  exportTarget,
  pagination,
  onPageChange,
  onPageSizeChange,
  onSortingChange,
  onTabChange,
  onViewChange
}) {
  const {
    ratings: domainRatings,
    isLoading: isLoadingRatings,
    loadRatings
  } = useAhrefsDomainRatings(projectId);
  const activeFilterCount = filters[activeTab].activeFilterCount;
  const exportTable = useMemo(
    () => buildBacklinksTabExport({ tab: activeTab, rows: tabRows, domainRatings }),
    [activeTab, domainRatings, tabRows]
  );
  const ratableDomains = useMemo(
    () => collectRatableDomains(tabRows),
    [tabRows]
  );
  useEffect(() => {
    if (!domainRatings) return;
    const missing = ratableDomains.filter(
      (domain) => !Object.hasOwn(domainRatings, domain)
    );
    if (missing.length > 0) void loadRatings(missing);
  }, [domainRatings, ratableDomains, loadRatings]);
  return /* @__PURE__ */ jsxs("div", { className: "border border-base-300 rounded-xl bg-base-100 overflow-hidden", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col lg:flex-row lg:items-center justify-between gap-3 px-4 py-3 border-b border-base-300", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx("div", { role: "tablist", className: "tabs tabs-border w-fit", children: BACKLINKS_RESULTS_TABS.filter(
          // Referring domains can't be filtered to a path prefix.
          ({ tab }) => !(scope === "subfolder" && tab === "domains")
        ).map(({ label, tab }) => /* @__PURE__ */ jsx(
          TabLink,
          {
            activeTab,
            label,
            onSelect: onTabChange,
            tab
          },
          tab
        )) }),
        /* @__PURE__ */ jsx("p", { className: "max-w-xl text-sm text-base-content/60", children: TAB_DESCRIPTIONS[activeTab] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsx(
          BacklinksExportMenu,
          {
            activeTab,
            exportTarget,
            headers: exportTable.headers,
            rows: exportTable.rows
          }
        ),
        activeTab !== "pages" ? /* @__PURE__ */ jsx(
          BacklinksActionsMenu,
          {
            isLoadingRatings,
            loadRatings,
            ratableDomains
          }
        ) : null
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2 px-4 py-2 border-b border-base-300", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          className: `btn btn-ghost btn-sm gap-1.5 ${filters.showFilters ? "btn-active" : ""}`,
          onClick: () => filters.setShowFilters((current) => !current),
          title: "Toggle table filters",
          children: [
            /* @__PURE__ */ jsx(SlidersHorizontal, { className: "size-3.5" }),
            "Filters",
            activeFilterCount > 0 ? /* @__PURE__ */ jsx("span", { className: "badge badge-xs badge-primary border-0 text-primary-content", children: activeFilterCount }) : null
          ]
        }
      ),
      activeTab === "backlinks" ? /* @__PURE__ */ jsxs(
        "div",
        {
          role: "tablist",
          "aria-label": "Backlinks view",
          className: "ml-auto tabs tabs-border tabs-xs w-fit",
          children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                role: "tab",
                "aria-selected": view !== "all",
                className: `tab ${view !== "all" ? "tab-active" : ""}`,
                title: "Show each referring domain's strongest link; expand a row for the rest",
                onClick: () => onViewChange(void 0),
                children: "One per domain"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                role: "tab",
                "aria-selected": view === "all",
                className: `tab ${view === "all" ? "tab-active" : ""}`,
                title: "List every individual backlink",
                onClick: () => onViewChange("all"),
                children: "All links"
              }
            )
          ]
        }
      ) : null
    ] }),
    filters.showFilters ? /* @__PURE__ */ jsx(
      BacklinksFilterPanel,
      {
        activeTab,
        filters,
        onApplied: () => onPageChange(1),
        maxConditions: scope === "subfolder" ? MAX_DATAFORSEO_FILTER_CONDITIONS - BACKLINKS_SUBFOLDER_FILTER_CONDITIONS - (activeTab === "pages" ? 0 : 1) : void 0
      }
    ) : null,
    /* @__PURE__ */ jsxs("div", { className: "p-4", children: [
      tabErrorMessage ? /* @__PURE__ */ jsx("div", { className: "alert alert-error mb-3", children: /* @__PURE__ */ jsx("span", { children: tabErrorMessage }) }) : null,
      isTabLoading && !tabErrorMessage ? /* @__PURE__ */ jsx(TabLoadingState, { label: TAB_LOADING_LABELS[activeTab] }) : null,
      !isTabLoading && !tabErrorMessage ? /* @__PURE__ */ jsxs(Fragment, { children: [
        activeTab === "backlinks" ? /* @__PURE__ */ jsx(
          BacklinksTable,
          {
            rows: tabRows.backlinks,
            domainRatings,
            sorting,
            onSortingChange,
            expansion: view === "all" ? null : domainExpansion
          }
        ) : null,
        activeTab === "domains" ? /* @__PURE__ */ jsx(
          ReferringDomainsTable,
          {
            rows: tabRows.referringDomains,
            domainRatings,
            sorting,
            onSortingChange
          }
        ) : null,
        activeTab === "pages" ? /* @__PURE__ */ jsx(
          TopPagesTable,
          {
            rows: tabRows.topPages,
            sorting,
            onSortingChange
          }
        ) : null
      ] }) : null
    ] }),
    /* @__PURE__ */ jsx(
      TablePagination,
      {
        page: pagination.page,
        pageSize: pagination.pageSize,
        pageSizes: BACKLINKS_PAGE_SIZES,
        totalCount: pagination.totalCount,
        hasNextPage: pagination.hasNextPage,
        isLoading: pagination.isFetching,
        onPageChange,
        onPageSizeChange
      }
    )
  ] });
}
const TAB_LOADING_LABELS = {
  backlinks: "Loading backlinks",
  domains: "Loading referring domains",
  pages: "Loading top pages"
};
function collectRatableDomains(tabRows) {
  const domains = [
    ...tabRows.backlinks.map((row) => row.domainFrom?.replace(/^www\./, "")),
    ...tabRows.referringDomains.map((row) => row.domain)
  ];
  return [
    ...new Set(domains.filter((domain) => Boolean(domain)))
  ];
}
function TabLink({
  activeTab,
  label,
  onSelect,
  tab
}) {
  const isActive = activeTab === tab;
  return /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      role: "tab",
      "aria-selected": isActive,
      className: `tab ${isActive ? "tab-active" : ""}`,
      onClick: () => onSelect(tab),
      children: label
    }
  );
}
function TabLoadingState({ label }) {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-3 py-2", children: [
    /* @__PURE__ */ jsxs("p", { className: "text-sm text-base-content/60", children: [
      label,
      "..."
    ] }),
    /* @__PURE__ */ jsx("div", { className: "skeleton h-10 w-full" }),
    /* @__PURE__ */ jsx("div", { className: "skeleton h-10 w-full" }),
    /* @__PURE__ */ jsx("div", { className: "skeleton h-10 w-full" })
  ] });
}
function BacklinksLoadingState() {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4", children: Array.from({ length: 8 }).map((_, index) => /* @__PURE__ */ jsx("div", { className: "card bg-base-100 border border-base-300", children: /* @__PURE__ */ jsxs("div", { className: "card-body gap-3 p-4", children: [
      /* @__PURE__ */ jsx("div", { className: "skeleton h-3 w-24" }),
      /* @__PURE__ */ jsx("div", { className: "skeleton h-8 w-28" })
    ] }) }, index)) }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-3 xl:grid-cols-2", children: Array.from({ length: 2 }).map((_, index) => /* @__PURE__ */ jsx("div", { className: "card bg-base-100 border border-base-300", children: /* @__PURE__ */ jsxs("div", { className: "card-body gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: "skeleton h-4 w-32" }),
      /* @__PURE__ */ jsx("div", { className: "skeleton h-64 w-full" })
    ] }) }, index)) }),
    /* @__PURE__ */ jsx("div", { className: "card bg-base-100 border border-base-300", children: /* @__PURE__ */ jsxs("div", { className: "card-body gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: "skeleton h-8 w-60" }),
      /* @__PURE__ */ jsx("div", { className: "skeleton h-80 w-full" })
    ] }) })
  ] });
}
function BacklinksErrorState({
  errorMessage,
  onRetry
}) {
  return /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-error/30 bg-error/5 p-6 space-y-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: "rounded-xl bg-error/10 p-2.5 text-error shrink-0", children: /* @__PURE__ */ jsx(ShieldAlert, { className: "size-5" }) }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: "Could not load backlinks" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-base-content/70", children: errorMessage ?? "Please try again in a moment." })
      ] })
    ] }),
    /* @__PURE__ */ jsx("button", { className: "btn btn-sm", onClick: onRetry, children: "Retry" })
  ] });
}
function BacklinksHistorySection({
  projectId,
  history,
  historyLoaded,
  onRemoveHistoryItem
}) {
  if (!historyLoaded) {
    return null;
  }
  if (history.length === 0) {
    return /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-dashed border-base-300 bg-base-100/70 p-6 text-center text-base-content/55 space-y-2", children: [
      /* @__PURE__ */ jsx(Link2, { className: "size-9 mx-auto opacity-35" }),
      /* @__PURE__ */ jsx("p", { className: "text-base font-medium text-base-content/80", children: "Enter a domain or URL to get started" })
    ] });
  }
  return /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-base-300 bg-base-100 p-5 md:p-6", children: [
    /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between mb-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx(History, { className: "size-4 text-base-content/45" }),
      /* @__PURE__ */ jsxs("span", { className: "text-sm text-base-content/60", children: [
        history.length,
        " recent search",
        history.length !== 1 ? "es" : ""
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "grid gap-2", children: history.map((item) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: "group flex items-center gap-2 rounded-lg border border-base-300 bg-base-100 p-2",
        children: [
          /* @__PURE__ */ jsxs(
            Link,
            {
              to: "/p/$projectId/backlinks",
              params: { projectId },
              search: (prev) => ({
                ...prev,
                target: item.target,
                scope: toScopeSearchParam(item.target, item.scope),
                tab: void 0,
                page: void 0,
                sort: void 0,
                order: void 0
              }),
              replace: true,
              className: "flex min-w-0 flex-1 items-center gap-3 rounded-md px-1 py-1 text-left transition-colors hover:bg-base-200",
              children: [
                /* @__PURE__ */ jsx(Clock, { className: "size-4 text-base-content/40 shrink-0" }),
                /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                  /* @__PURE__ */ jsx("p", { className: "font-medium text-base-content truncate", children: item.target }),
                  /* @__PURE__ */ jsx("p", { className: "text-sm text-base-content/60 truncate", children: RESEARCH_SCOPE_LABELS[item.scope] })
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xs text-base-content/40", children: new Date(item.timestamp).toLocaleDateString(void 0, {
              month: "short",
              day: "numeric"
            }) }),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                className: "btn btn-ghost btn-xs opacity-0 group-hover:opacity-100 p-1",
                onClick: () => onRemoveHistoryItem(item.timestamp),
                children: /* @__PURE__ */ jsx(X, { className: "size-3" })
              }
            )
          ] })
        ]
      },
      item.timestamp
    )) })
  ] });
}
function BacklinksBody({
  projectId,
  history,
  historyLoaded,
  overviewData,
  overviewError,
  overviewLoading,
  backlinksRowsPage,
  referringDomainsPage,
  topPagesPage,
  searchState,
  filters,
  sorting,
  domainExpansion,
  tabErrorMessage,
  tabLoading,
  tabFetching,
  onPageChange,
  onPageSizeChange,
  onRemoveHistoryItem,
  onRetryOverview,
  onSortingChange,
  onTabChange,
  onViewChange,
  searchTabs
}) {
  const tabRows = useMemo(
    () => ({
      backlinks: backlinksRowsPage?.rows ?? [],
      referringDomains: referringDomainsPage?.rows ?? [],
      topPages: topPagesPage?.rows ?? []
    }),
    [backlinksRowsPage, referringDomainsPage, topPagesPage]
  );
  const activeTabPage = searchState.tab === "backlinks" ? backlinksRowsPage : searchState.tab === "domains" ? referringDomainsPage : topPagesPage;
  const summaryStats = useMemo(
    () => buildSummaryStats(overviewData),
    [overviewData]
  );
  const tabStrip = searchTabs ? /* @__PURE__ */ jsx(
    SearchTabStrip,
    {
      projectId,
      activeTabId: searchTabs.activeTabId,
      tabs: searchTabs.tabs,
      onSelect: searchTabs.onSelect,
      onClose: searchTabs.onClose,
      onViewed: searchTabs.onViewed
    }
  ) : null;
  if (!searchState.target) {
    return /* @__PURE__ */ jsx(
      BacklinksHistorySection,
      {
        projectId,
        history,
        historyLoaded,
        onRemoveHistoryItem
      }
    );
  }
  if (overviewLoading) {
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      tabStrip,
      /* @__PURE__ */ jsx(BacklinksLoadingState, {})
    ] });
  }
  if (!overviewData) {
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      tabStrip,
      /* @__PURE__ */ jsx(
        BacklinksErrorState,
        {
          errorMessage: overviewError,
          onRetry: onRetryOverview
        }
      )
    ] });
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    tabStrip,
    /* @__PURE__ */ jsx(
      BacklinksOverviewPanels,
      {
        projectId,
        data: overviewData,
        summaryStats
      }
    ),
    /* @__PURE__ */ jsx(
      BacklinksResultsCard,
      {
        projectId,
        activeTab: searchState.tab,
        scope: searchState.scope,
        tabRows,
        filters,
        sorting,
        view: searchState.view,
        domainExpansion,
        isTabLoading: tabLoading,
        tabErrorMessage,
        exportTarget: overviewData.displayTarget || searchState.target,
        pagination: {
          page: searchState.page,
          pageSize: searchState.pageSize,
          totalCount: activeTabPage?.totalCount ?? null,
          hasNextPage: activeTabPage?.hasMore ?? false,
          isFetching: tabFetching
        },
        onPageChange,
        onPageSizeChange,
        onSortingChange,
        onTabChange,
        onViewChange
      }
    )
  ] });
}
const BACKLINKS_QUERY_STALE_TIME_MS = 5 * 60 * 1e3;
function getBacklinksErrorMessage(error, fallback) {
  if (!error) return null;
  if (getErrorCode(error) === "VALIDATION_ERROR") {
    return "Enter a valid domain or page URL.";
  }
  return getStandardErrorMessage(error, fallback);
}
function toSort(sortParam, orderParam, allowedFields, fallback) {
  const field = sortParam ? allowedFields.find((candidate) => candidate === sortParam) : void 0;
  if (!field) return fallback;
  return { field, order: orderParam ?? "desc" };
}
function useBacklinksPageData({
  projectId,
  searchState,
  filters
}) {
  const searchCardInitialValues = useMemo(
    () => ({
      target: searchState.target,
      scope: searchState.scope
    }),
    [searchState.scope, searchState.target]
  );
  const { target, scope, tab, page, pageSize, sort, order, view } = searchState;
  const rowsMode = view === "all" ? "as_is" : "one_per_domain";
  const targetReady = Boolean(target);
  const baseQueryKeyParts = [projectId, scope, target];
  const pageInputBase = { projectId, target, scope, page, pageSize };
  const overviewQuery = useQuery({
    queryKey: ["backlinksOverview", ...baseQueryKeyParts],
    enabled: targetReady,
    staleTime: BACKLINKS_QUERY_STALE_TIME_MS,
    queryFn: () => getBacklinksOverview({ data: { projectId, target, scope } })
  });
  const rowsSort = toSort(
    sort,
    order,
    backlinksRowsSortFieldSchema.options,
    BACKLINKS_DEFAULT_SORT.backlinks
  );
  const rowsFilters = useMemo(
    () => toBacklinksFiltersPayload(filters.backlinks.values),
    [filters.backlinks.values]
  );
  const rowsQuery = useQuery({
    queryKey: [
      "backlinksRows",
      ...baseQueryKeyParts,
      page,
      pageSize,
      rowsSort.field,
      rowsSort.order,
      rowsFilters,
      rowsMode
    ],
    enabled: targetReady && tab === "backlinks",
    staleTime: BACKLINKS_QUERY_STALE_TIME_MS,
    queryFn: () => getBacklinksRows({
      data: {
        ...pageInputBase,
        sortField: rowsSort.field,
        sortOrder: rowsSort.order,
        filters: rowsFilters,
        mode: rowsMode
      }
    })
  });
  const domainsSort = toSort(
    sort,
    order,
    referringDomainsSortFieldSchema.options,
    BACKLINKS_DEFAULT_SORT.domains
  );
  const domainsFilters = useMemo(
    () => toReferringDomainsFiltersPayload(filters.domains.values),
    [filters.domains.values]
  );
  const referringDomainsQuery = useQuery({
    queryKey: [
      "backlinksReferringDomains",
      ...baseQueryKeyParts,
      page,
      pageSize,
      domainsSort.field,
      domainsSort.order,
      domainsFilters
    ],
    enabled: targetReady && tab === "domains",
    staleTime: BACKLINKS_QUERY_STALE_TIME_MS,
    queryFn: () => getBacklinksReferringDomains({
      data: {
        ...pageInputBase,
        sortField: domainsSort.field,
        sortOrder: domainsSort.order,
        filters: domainsFilters
      }
    })
  });
  const pagesSort = toSort(
    sort,
    order,
    topPagesSortFieldSchema.options,
    BACKLINKS_DEFAULT_SORT.pages
  );
  const pagesFilters = useMemo(
    () => toTopPagesFiltersPayload(filters.pages.values),
    [filters.pages.values]
  );
  const topPagesQuery = useQuery({
    queryKey: [
      "backlinksTopPages",
      ...baseQueryKeyParts,
      page,
      pageSize,
      pagesSort.field,
      pagesSort.order,
      pagesFilters
    ],
    enabled: targetReady && tab === "pages",
    staleTime: BACKLINKS_QUERY_STALE_TIME_MS,
    queryFn: () => getBacklinksTopPages({
      data: {
        ...pageInputBase,
        sortField: pagesSort.field,
        sortOrder: pagesSort.order,
        filters: pagesFilters
      }
    })
  });
  const overviewErrorMessage = getBacklinksErrorMessage(
    overviewQuery.error,
    "Could not load backlinks data."
  );
  const activeTabQuery = tab === "backlinks" ? rowsQuery : tab === "domains" ? referringDomainsQuery : topPagesQuery;
  const activeTabErrorMessage = getBacklinksErrorMessage(
    activeTabQuery.error,
    "Could not load this tab."
  );
  return {
    activeTabErrorMessage,
    activeTabQuery,
    overviewErrorMessage,
    overviewQuery,
    referringDomainsQuery,
    rowsQuery,
    searchCardInitialValues,
    topPagesQuery
  };
}
function navigateToBacklinksSearch(navigate, values) {
  navigate({
    search: (prev) => ({
      ...prev,
      target: values.target,
      scope: toScopeSearchParam(values.target, values.scope),
      tab: void 0,
      page: void 0,
      sort: void 0,
      order: void 0
    }),
    replace: true
  });
}
const DOMAIN_LINKS_PAGE_SIZE = 100;
const DOMAIN_LINKS_STALE_TIME_MS = 5 * 60 * 1e3;
function useBacklinksDomainExpansion({
  projectId,
  searchState
}) {
  const { target, scope } = searchState;
  const [expanded, setExpanded] = useState([]);
  useEffect(() => {
    setExpanded([]);
  }, [projectId, target, scope]);
  const queries = useQueries({
    queries: expanded.map((domain) => ({
      queryKey: [
        "backlinksDomainLinks",
        projectId,
        scope,
        target,
        domain
      ],
      staleTime: DOMAIN_LINKS_STALE_TIME_MS,
      queryFn: () => getBacklinksRows({
        data: {
          projectId,
          target,
          scope,
          page: 1,
          pageSize: DOMAIN_LINKS_PAGE_SIZE,
          sortField: "rank",
          sortOrder: "desc",
          filters: { domainFrom: domain },
          mode: "as_is"
        }
      })
    }))
  });
  const entriesByDomain = useMemo(() => {
    const map = {};
    expanded.forEach((domain, index) => {
      const query = queries[index];
      if (!query) return;
      map[domain] = query.data ? { status: "ready", rows: query.data.rows } : query.error ? { status: "error" } : { status: "loading" };
    });
    return map;
  }, [expanded, queries]);
  const expandedDomains = useMemo(() => new Set(expanded), [expanded]);
  const toggleDomain = useCallback((domain) => {
    setExpanded(
      (current) => current.includes(domain) ? current.filter((entry) => entry !== domain) : [...current, domain]
    );
  }, []);
  return { expandedDomains, entriesByDomain, toggleDomain };
}
const STORAGE_KEY_PREFIX = "backlinks-filters:";
function isRecord(value) {
  return typeof value === "object" && value !== null;
}
function loadFromStorage(tab, fallback) {
  const fallbackClone = { ...fallback };
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${tab}`);
    if (!raw) return fallbackClone;
    const parsed = JSON.parse(raw);
    if (!isRecord(parsed)) return fallbackClone;
    const result = { ...fallbackClone };
    for (const key in fallback) {
      const value = parsed[key];
      if (typeof value === "string") {
        Object.assign(result, { [key]: value });
      }
    }
    if (countFilterConditions(result) > MAX_DATAFORSEO_FILTER_CONDITIONS) {
      return fallbackClone;
    }
    return result;
  } catch {
    return fallbackClone;
  }
}
function saveToStorage(tab, values) {
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${tab}`, JSON.stringify(values));
  } catch {
  }
}
function useTabFilters(tab, emptyValues) {
  const [values, setValues] = useState(
    () => loadFromStorage(tab, { ...emptyValues })
  );
  const apply = useCallback(
    (next) => {
      setValues(next);
      saveToStorage(tab, next);
    },
    [tab]
  );
  const reset = useCallback(() => {
    apply({ ...emptyValues });
  }, [apply, emptyValues]);
  return {
    values,
    apply,
    reset,
    activeFilterCount: countActiveFilters(values)
  };
}
function useBacklinksFilters() {
  const [showFilters, setShowFilters] = useState(false);
  const backlinks = useTabFilters(
    "backlinks",
    EMPTY_BACKLINKS_FILTERS
  );
  const domains = useTabFilters(
    "domains",
    EMPTY_REFERRING_DOMAINS_FILTERS
  );
  const pages = useTabFilters(
    "pages",
    EMPTY_TOP_PAGES_FILTERS
  );
  return {
    backlinks,
    domains,
    pages,
    showFilters,
    setShowFilters
  };
}
const MAX_HISTORY = 20;
const SCOPE_VERSION = 2;
const LEGACY_SCOPES = {
  domain: "subdomains",
  page: "exact_url"
};
const backlinksSearchHistoryItemSchema = z.object({
  target: z.string(),
  scope: z.string(),
  scopeVersion: z.literal(SCOPE_VERSION).optional(),
  timestamp: z.number()
}).transform((item, ctx) => {
  const scope = researchScopeSchema.safeParse(
    item.scopeVersion === SCOPE_VERSION ? item.scope : LEGACY_SCOPES[item.scope]
  );
  if (!scope.success) {
    ctx.addIssue({ code: "custom", message: "Unknown backlinks scope" });
    return z.NEVER;
  }
  return {
    target: item.target,
    scope: scope.data,
    timestamp: item.timestamp,
    scopeVersion: SCOPE_VERSION
  };
});
const backlinksSearchHistorySchema = z.array(backlinksSearchHistoryItemSchema);
const backlinksSearchHistoryCodec = jsonCodec(backlinksSearchHistorySchema);
function isSameSearch(a, b) {
  return a.target === b.target && a.scope === b.scope;
}
function useBacklinksSearchHistory(projectId) {
  const { history, isLoaded, addItem, removeItem } = useLocalHistoryStore({
    storageKey: `backlinks-search-history:${projectId}`,
    maxItems: MAX_HISTORY,
    parse: (raw) => {
      const parsed = backlinksSearchHistoryCodec.safeParse(raw);
      return parsed.success ? parsed.data : null;
    },
    isSameItem: isSameSearch,
    createItem: (item) => ({
      ...item,
      timestamp: Date.now(),
      scopeVersion: SCOPE_VERSION
    }),
    getItemKey: (item) => item.timestamp
  });
  return {
    history,
    isLoaded,
    addSearch: addItem,
    removeHistoryItem: removeItem
  };
}
function BacklinksPage({
  projectId,
  searchState,
  navigate
}) {
  const filters = useBacklinksFilters();
  const sorting = useMemo(() => {
    const fallback = BACKLINKS_DEFAULT_SORT[searchState.tab];
    const field = searchState.sort ?? fallback.field;
    const order = searchState.order ?? (searchState.sort ? "desc" : fallback.order);
    return [{ id: field, desc: order === "desc" }];
  }, [searchState.order, searchState.sort, searchState.tab]);
  const handleSortingChange = useCallback(
    (updater) => {
      const next = typeof updater === "function" ? updater(sorting) : updater;
      const first = next[0];
      navigate({
        search: (prev) => ({
          ...prev,
          sort: first?.id,
          order: first ? first.desc ? "desc" : "asc" : void 0,
          page: void 0
        }),
        replace: true
      });
    },
    [navigate, sorting]
  );
  const handlePageChange = useCallback(
    (nextPage) => {
      navigate({
        search: (prev) => ({
          ...prev,
          page: nextPage === 1 ? void 0 : nextPage
        }),
        replace: true
      });
    },
    [navigate]
  );
  const handlePageSizeChange = useCallback(
    (nextPageSize) => {
      navigate({
        search: (prev) => ({
          ...prev,
          size: nextPageSize === DEFAULT_BACKLINKS_PAGE_SIZE ? void 0 : nextPageSize,
          page: void 0
        }),
        replace: true
      });
    },
    [navigate]
  );
  const handleViewChange = useCallback(
    (nextView) => {
      navigate({
        search: (prev) => ({ ...prev, view: nextView, page: void 0 }),
        replace: true
      });
    },
    [navigate]
  );
  const domainExpansion = useBacklinksDomainExpansion({
    projectId,
    searchState
  });
  const {
    activeTabErrorMessage,
    activeTabQuery,
    overviewErrorMessage,
    overviewQuery,
    referringDomainsQuery,
    rowsQuery,
    searchCardInitialValues,
    topPagesQuery
  } = useBacklinksPageData({
    projectId,
    searchState,
    filters
  });
  const {
    history,
    isLoaded: historyLoaded,
    addSearch,
    removeHistoryItem
  } = useBacklinksSearchHistory(projectId);
  const urlTabInput = useMemo(() => {
    if (searchState.target.trim() === "") return null;
    return {
      type: "backlinks",
      target: searchState.target,
      scope: searchState.scope
    };
  }, [searchState.scope, searchState.target]);
  const navigateToTab = useCallback(
    (input) => {
      if (input?.type !== "backlinks") {
        navigate({
          search: () => ({}),
          replace: true
        });
        return;
      }
      navigateToBacklinksSearch(navigate, {
        target: input.target,
        scope: input.scope
      });
    },
    [navigate]
  );
  const handleResultTabChange = useCallback(
    (tab) => {
      navigate({
        search: (prev) => ({
          ...prev,
          tab: tab === "backlinks" ? void 0 : tab,
          page: void 0,
          sort: void 0,
          order: void 0
        }),
        replace: true
      });
    },
    [navigate]
  );
  const searchTabs = useSearchTabNavigation({
    storageKey: `backlinks:${projectId}`,
    urlInput: urlTabInput,
    getLabel: useCallback(
      (input) => input.type === "backlinks" ? input.target : "",
      []
    ),
    navigateToInput: navigateToTab
  });
  const toBacklinksTabInput = useCallback(
    (values) => ({
      type: "backlinks",
      target: values.target,
      scope: values.scope
    }),
    []
  );
  return /* @__PURE__ */ jsx("div", { className: "px-4 py-4 pb-24 overflow-auto md:px-6 md:py-6 md:pb-8", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-7xl space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold", children: "Backlinks" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-base-content/70", children: "Understand who links to a site, what changed recently, and which pages attract links." })
    ] }),
    /* @__PURE__ */ jsx(
      BacklinksSearchCard,
      {
        errorMessage: overviewErrorMessage,
        initialValues: searchCardInitialValues,
        onSubmit: (values) => {
          searchTabs.openTab(toBacklinksTabInput(values));
          navigateToBacklinksSearch(navigate, values);
          addSearch({ target: values.target, scope: values.scope });
        }
      }
    ),
    /* @__PURE__ */ jsx(
      BacklinksBody,
      {
        projectId,
        history,
        historyLoaded,
        overviewData: overviewQuery.data,
        overviewError: overviewErrorMessage,
        overviewLoading: overviewQuery.isLoading,
        backlinksRowsPage: rowsQuery.data,
        referringDomainsPage: referringDomainsQuery.data,
        topPagesPage: topPagesQuery.data,
        searchState,
        filters,
        sorting,
        domainExpansion,
        tabErrorMessage: activeTabErrorMessage,
        tabLoading: activeTabQuery.isLoading,
        tabFetching: activeTabQuery.isFetching,
        onPageChange: handlePageChange,
        onPageSizeChange: handlePageSizeChange,
        onRemoveHistoryItem: removeHistoryItem,
        onRetryOverview: () => void overviewQuery.refetch(),
        onSortingChange: handleSortingChange,
        onTabChange: handleResultTabChange,
        onViewChange: handleViewChange,
        searchTabs: searchState.target ? {
          activeTabId: searchTabs.activeTabId,
          tabs: searchTabs.tabs,
          onSelect: searchTabs.selectTab,
          onClose: searchTabs.closeTab,
          onViewed: searchTabs.markTabViewed
        } : null
      }
    )
  ] }) });
}
function BacklinksRoute() {
  const {
    projectId
  } = Route.useParams();
  const navigate = useNavigate({
    from: Route.fullPath
  });
  const {
    target = "",
    scope: rawScope,
    tab = "backlinks",
    page = 1,
    size = DEFAULT_BACKLINKS_PAGE_SIZE,
    sort,
    order,
    view
  } = Route.useSearch();
  const scope = rawScope ?? defaultScopeForInput(target);
  return /* @__PURE__ */ jsx(BacklinksPage, { projectId, navigate, searchState: {
    target,
    scope,
    // Referring domains can't be filtered to a subfolder.
    tab: scope === "subfolder" && tab === "domains" ? "backlinks" : tab,
    page,
    pageSize: size,
    sort,
    order,
    view
  } });
}
export {
  BacklinksRoute as component
};
