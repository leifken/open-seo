import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { Link, useNavigate } from "@tanstack/react-router";
import { memo, useMemo, useEffect, useState, useCallback, useRef } from "react";
import { useForm, useStore } from "@tanstack/react-form";
import { Globe, History, Clock, X, Search, AlertCircle, ChevronLeft, ChevronRight, ArrowUp, ArrowDown, SlidersHorizontal, Save, Sheet, Download, Copy, FileSpreadsheet, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { aU as jsonCodec, J as researchScopeSchema, bS as parseResearchTarget, aL as RESEARCH_SCOPE_LABELS, cm as LABS_LOCATION_OPTIONS, cn as DOMAIN_KEYWORDS_PAGE_SIZES, bz as MAX_DATAFORSEO_FILTER_CONDITIONS, co as RESEARCH_SCOPE_FILTER_SLOTS, cd as toScopeSearchParam, br as LOCATIONS, cp as DEFAULT_DOMAIN_KEYWORDS_PAGE_SIZE, c3 as isLabsLocationCode, cq as defaultScopeForPath, aF as DEFAULT_LOCATION_CODE, cr as isScopeAllowedForInput } from "../entry.js";
import { z } from "zod";
import { u as useLocalHistoryStore } from "./useLocalHistoryStore-CAiu5gzu.js";
import { ar as createFormValidationErrors, f as getFieldError, e as getFormError, aj as HeaderHelpLabel, a2 as useSelectionAnchor, K as makeSelectionColumn, a3 as useAppTable, a4 as AppDataTable, a9 as TableExportMenu, p as getStandardErrorMessage, c as captureClientEvent, a5 as TableBulkActionBar, a6 as TableBulkActionButton, am as TableBulkExportMenu, a8 as exportTableToSheets, D as downloadCsv, E as buildCsv, aq as shouldValidateFieldOnChange, az as Route } from "./router-BZ-5uDXB.js";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { g as getDomainOverview, b as getDomainKeywordsPage, c as getDomainPagesPage } from "./domain-CvR3nkey.js";
import { L as LocationSelect } from "./LocationSelect-DeLtP58P.js";
import { R as ResearchScopeSelect } from "./ResearchScopeSelect-CEr_gOl-.js";
import { createColumnHelper } from "@tanstack/react-table";
import { E as ExternalUrlCell } from "./url-D1aM6mYO.js";
import { D as DifficultyBadge } from "./DifficultyBadge-C2djn1uR.js";
import { u as useDomainRenderDebug, d as debugDomain, D as DomainFilterPanel } from "./DomainFilterPanel-CFjFALQn.js";
import { s as saveKeywords } from "./keywords-BbbgimDM.js";
import { a as useSearchTabNavigation, S as SearchTabStrip } from "./useSearchTabNavigation-Dxb8Ubsr.js";
import { u as useProjectMarket } from "./useProjectMarket-Bj0dmApz.js";
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
import "@better-auth/api-key/client";
import "papaparse";
import "recharts";
import "./lighthouse-CiThJE4g.js";
import "./lighthouse-CxIZIYPF.js";
import "./keywordControllerActions-DAf9tszu.js";
import "./projects-D9ZqZqTc.js";
const MAX_HISTORY = 20;
const domainSearchHistoryItemSchema = z.object({
  domain: z.string(),
  scope: researchScopeSchema.optional(),
  /** Legacy field: pre-scope history encoded "Include subdomains" here. */
  subdomains: z.boolean().optional(),
  sort: z.enum(["rank", "traffic", "volume", "score", "cpc"]),
  tab: z.enum(["keywords", "pages"]),
  locationCode: z.number().int().positive().optional(),
  timestamp: z.number()
}).transform(
  ({ subdomains, scope, ...item }) => ({
    ...item,
    // Legacy items always carried the boolean, so scope-less means true.
    scope: scope ?? (subdomains === false ? "domain" : "subdomains")
  })
);
const domainSearchHistorySchema = z.array(domainSearchHistoryItemSchema);
const domainSearchHistoryCodec = jsonCodec(domainSearchHistorySchema);
function isSameSearch(a, b) {
  return a.domain === b.domain && a.scope === b.scope && a.sort === b.sort && a.tab === b.tab && a.locationCode === b.locationCode;
}
function useDomainSearchHistory(projectId) {
  const { history, isLoaded, addItem, removeItem, clearItems } = useLocalHistoryStore({
    storageKey: `domain-search-history:${projectId}`,
    maxItems: MAX_HISTORY,
    parse: (raw) => {
      const parsed = domainSearchHistoryCodec.safeParse(raw);
      return parsed.success ? parsed.data : null;
    },
    isSameItem: isSameSearch,
    createItem: (item) => ({
      ...item,
      timestamp: Date.now()
    }),
    getItemKey: (item) => item.timestamp
  });
  return {
    history,
    isLoaded,
    addSearch: addItem,
    clearHistory: clearItems,
    removeHistoryItem: removeItem
  };
}
function getDomainSearchValidationErrors(value) {
  if (!value.domain.trim()) {
    return createFormValidationErrors({
      fields: {
        domain: "Please enter a domain"
      }
    });
  }
  const parsed = parseResearchTarget(value.domain, value.scope);
  if (!parsed.ok) {
    return createFormValidationErrors({
      fields: {
        domain: parsed.message
      }
    });
  }
  return null;
}
function getDomainSearchChangeValidationErrors(value, shouldValidateUntouchedField, shouldValidateFormat) {
  if (!value.domain.trim()) {
    if (!shouldValidateUntouchedField) {
      return null;
    }
    return createFormValidationErrors({
      fields: {
        domain: "Please enter a domain"
      }
    });
  }
  if (!shouldValidateFormat) {
    return null;
  }
  return getDomainSearchValidationErrors(value);
}
function useDomainOverviewQuery(input) {
  const trimmedDomain = input.domain.trim();
  return useQuery({
    enabled: trimmedDomain !== "",
    queryKey: [
      "domain-overview",
      input.projectId,
      trimmedDomain,
      input.scope,
      input.locationCode
    ],
    queryFn: () => getDomainOverview({
      data: {
        projectId: input.projectId,
        domain: trimmedDomain,
        scope: input.scope,
        locationCode: input.locationCode
      }
    }),
    staleTime: 5 * 6e4
  });
}
function DomainOverviewLoadingState() {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", "aria-busy": true, children: [
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: "card bg-base-100 border border-base-300", children: /* @__PURE__ */ jsxs("div", { className: "card-body p-4 space-y-2", children: [
        /* @__PURE__ */ jsx("div", { className: "skeleton h-3 w-36" }),
        /* @__PURE__ */ jsx("div", { className: "skeleton h-8 w-44" })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "card bg-base-100 border border-base-300", children: /* @__PURE__ */ jsxs("div", { className: "card-body p-4 space-y-2", children: [
        /* @__PURE__ */ jsx("div", { className: "skeleton h-3 w-32" }),
        /* @__PURE__ */ jsx("div", { className: "skeleton h-8 w-40" })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "card bg-base-100 border border-base-300", children: /* @__PURE__ */ jsxs("div", { className: "card-body gap-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsx("div", { className: "skeleton h-8 w-48" }),
        /* @__PURE__ */ jsx("div", { className: "skeleton h-8 w-60" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "skeleton h-9 w-64" }),
      /* @__PURE__ */ jsx("div", { className: "space-y-2", children: Array.from({ length: 8 }).map((_, index) => /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-7 gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "skeleton h-4 col-span-2" }),
        /* @__PURE__ */ jsx("div", { className: "skeleton h-4" }),
        /* @__PURE__ */ jsx("div", { className: "skeleton h-4" }),
        /* @__PURE__ */ jsx("div", { className: "skeleton h-4" }),
        /* @__PURE__ */ jsx("div", { className: "skeleton h-4 col-span-2" })
      ] }, index)) })
    ] }) })
  ] });
}
function DomainHistorySection({
  history,
  historyLoaded,
  onRemoveHistoryItem,
  onSelectHistoryItem
}) {
  if (!historyLoaded) {
    return null;
  }
  if (history.length === 0) {
    return /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-dashed border-base-300 bg-base-100/70 p-6 text-center text-base-content/55 space-y-2", children: [
      /* @__PURE__ */ jsx(Globe, { className: "size-9 mx-auto opacity-35" }),
      /* @__PURE__ */ jsx("p", { className: "text-base font-medium text-base-content/80", children: "Enter a domain to get started" })
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
            "button",
            {
              type: "button",
              className: "flex min-w-0 flex-1 items-center gap-3 rounded-md px-1 py-1 text-left transition-colors hover:bg-base-200",
              onClick: () => onSelectHistoryItem(item),
              children: [
                /* @__PURE__ */ jsx(Clock, { className: "size-4 text-base-content/40 shrink-0" }),
                /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                  /* @__PURE__ */ jsx("p", { className: "font-medium text-base-content truncate", children: item.domain }),
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
function toSortMode(value) {
  if (value === "rank" || value === "traffic" || value === "volume" || value === "score" || value === "cpc") {
    return value;
  }
  return void 0;
}
function toSortOrder(value) {
  if (value === "asc" || value === "desc") return value;
  return void 0;
}
function getDefaultSortOrder(sortMode) {
  return sortMode === "rank" ? "asc" : "desc";
}
function resolveSortOrder(sortMode, sortOrder) {
  return sortOrder ?? getDefaultSortOrder(sortMode);
}
function toSortSearchParam(sortMode) {
  return sortMode === "traffic" ? void 0 : sortMode;
}
function toSortOrderSearchParam(sortMode, sortOrder) {
  return sortOrder === getDefaultSortOrder(sortMode) ? void 0 : sortOrder;
}
function toPageSortMode(sortMode) {
  if (sortMode === "volume") return "keywords";
  return "traffic";
}
function getResearchInputPath(input) {
  const parsed = parseResearchTarget(input);
  return parsed.ok ? parsed.target.path : "";
}
function formatNumber(value) {
  if (value == null) return "-";
  return new Intl.NumberFormat().format(value);
}
function formatRounded(value) {
  if (value == null) return "-";
  return new Intl.NumberFormat().format(Math.round(value));
}
function formatMetric(value, hasData) {
  if (!hasData) return "Not enough data";
  return formatRounded(value);
}
function keywordsToTable(rows) {
  return {
    headers: ["Keyword", "Rank", "Volume", "Traffic", "CPC", "URL", "Score"],
    rows: rows.map((row) => [
      row.keyword,
      row.position,
      row.searchVolume,
      row.traffic,
      row.cpc,
      row.url ?? row.relativeUrl,
      row.keywordDifficulty
    ])
  };
}
function pagesToTable(rows) {
  return {
    headers: ["Page", "Organic Traffic", "Keywords"],
    rows: rows.map((row) => [row.page, row.organicTraffic, row.keywords])
  };
}
function DomainSearchCard({
  controlsForm,
  isLoading,
  onSubmit,
  onDomainChange,
  onScopeChange,
  onSortChange,
  onLocationChange
}) {
  return /* @__PURE__ */ jsx("div", { className: "card bg-base-100 border border-base-300", children: /* @__PURE__ */ jsxs("div", { className: "card-body gap-4", children: [
    /* @__PURE__ */ jsxs(
      "form",
      {
        className: "flex flex-col gap-3 lg:flex-row lg:items-center",
        onSubmit,
        children: [
          /* @__PURE__ */ jsx(controlsForm.Field, { name: "domain", children: (field) => {
            const domainError = getFieldError(field.state.meta.errors);
            return /* @__PURE__ */ jsxs(
              "label",
              {
                className: `input input-bordered flex items-center gap-2 w-full lg:flex-1 lg:min-w-0 lg:max-w-md ${domainError ? "input-error" : ""}`,
                children: [
                  /* @__PURE__ */ jsx(Search, { className: "size-4 text-base-content/60" }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      className: "grow min-w-0",
                      placeholder: "Enter a domain or URL",
                      value: field.state.value,
                      onChange: (event) => {
                        field.handleChange(event.target.value);
                        onDomainChange(event.target.value);
                      },
                      "aria-invalid": domainError ? true : void 0,
                      "aria-describedby": domainError ? "domain-input-error" : void 0
                    }
                  )
                ]
              }
            );
          } }),
          /* @__PURE__ */ jsx(controlsForm.Field, { name: "scope", children: (field) => /* @__PURE__ */ jsx(
            ResearchScopeSelect,
            {
              value: field.state.value,
              className: "w-full lg:w-40",
              onChange: (scope) => {
                field.handleChange(scope);
                onScopeChange(scope);
              }
            }
          ) }),
          /* @__PURE__ */ jsx(controlsForm.Field, { name: "locationCode", children: (field) => /* @__PURE__ */ jsx(
            LocationSelect,
            {
              value: field.state.value,
              options: LABS_LOCATION_OPTIONS,
              className: "w-full lg:w-44 lg:shrink-0",
              onChange: (code) => {
                field.handleChange(code);
                onLocationChange(code);
              }
            }
          ) }),
          /* @__PURE__ */ jsx(controlsForm.Field, { name: "sort", children: (field) => /* @__PURE__ */ jsxs(
            "select",
            {
              className: "select select-bordered shrink-0",
              value: field.state.value,
              onChange: (event) => {
                const next = toSortMode(event.target.value) ?? "traffic";
                field.handleChange(next);
                onSortChange(next);
              },
              children: [
                /* @__PURE__ */ jsx("option", { value: "rank", children: "By Rank" }),
                /* @__PURE__ */ jsx("option", { value: "traffic", children: "By Traffic" }),
                /* @__PURE__ */ jsx("option", { value: "volume", children: "By Volume" }),
                /* @__PURE__ */ jsx("option", { value: "score", children: "By Score" }),
                /* @__PURE__ */ jsx("option", { value: "cpc", children: "By CPC" })
              ]
            }
          ) }),
          /* @__PURE__ */ jsx(controlsForm.Subscribe, { selector: (state) => state.isSubmitting, children: (isSubmitting) => /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              className: "btn btn-primary shrink-0 px-6",
              disabled: isLoading || isSubmitting,
              children: isLoading || isSubmitting ? "Loading..." : "Search"
            }
          ) })
        ]
      }
    ),
    /* @__PURE__ */ jsx(controlsForm.Field, { name: "domain", children: (field) => {
      const domainError = getFieldError(field.state.meta.errors);
      return domainError ? /* @__PURE__ */ jsx("p", { id: "domain-input-error", className: "text-sm text-error", children: domainError }) : null;
    } }),
    /* @__PURE__ */ jsx(controlsForm.Subscribe, { selector: (state) => state.errorMap.onSubmit, children: (submitError) => {
      const errorMessage = getFormError(submitError);
      return errorMessage ? /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-error/30 bg-error/10 p-3 text-sm text-error flex items-start gap-2", children: [
        /* @__PURE__ */ jsx(AlertCircle, { className: "size-4 shrink-0 mt-0.5" }),
        /* @__PURE__ */ jsx("span", { children: errorMessage })
      ] }) : null;
    } })
  ] }) });
}
function formatRange(page, pageSize, totalCount) {
  const start = (page - 1) * pageSize + 1;
  if (totalCount == null) {
    return `${start.toLocaleString()}–${(start + pageSize - 1).toLocaleString()}`;
  }
  if (totalCount === 0) return "0";
  const end = Math.min(totalCount, start + pageSize - 1);
  return `${start.toLocaleString()}–${end.toLocaleString()} of ${totalCount.toLocaleString()}`;
}
function DomainKeywordsPagination({
  page,
  pageSize,
  totalCount,
  hasNextPage,
  isLoading,
  onPageChange,
  onPageSizeChange
}) {
  const totalPages = totalCount != null ? Math.max(1, Math.ceil(totalCount / pageSize)) : null;
  const canGoPrev = page > 1;
  const canGoNext = totalPages != null ? page < totalPages : hasNextPage;
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 border-t border-base-300 px-4 py-3 sm:flex-row sm:items-center sm:justify-between", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-base-content/70 tabular-nums", children: [
      /* @__PURE__ */ jsx("span", { children: formatRange(page, pageSize, totalCount) }),
      isLoading ? /* @__PURE__ */ jsx("span", { className: "loading loading-spinner loading-xs" }) : null
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-6", children: [
      /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-sm text-base-content/70", children: [
        /* @__PURE__ */ jsx("span", { className: "whitespace-nowrap", children: "Rows per page" }),
        /* @__PURE__ */ jsx(
          "select",
          {
            className: "select select-bordered select-sm w-20",
            value: pageSize,
            onChange: (event) => onPageSizeChange(Number(event.target.value)),
            children: DOMAIN_KEYWORDS_PAGE_SIZES.map((size) => /* @__PURE__ */ jsx("option", { value: size, children: size }, size))
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxs("span", { className: "whitespace-nowrap text-sm tabular-nums text-base-content/70", children: [
          "Page ",
          page.toLocaleString(),
          totalPages != null ? ` of ${totalPages.toLocaleString()}` : ""
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsx(
            PageLink,
            {
              page: page - 1,
              disabled: !canGoPrev || isLoading,
              onPageChange,
              label: "Previous page",
              children: /* @__PURE__ */ jsx(ChevronLeft, { className: "size-4" })
            }
          ),
          /* @__PURE__ */ jsx(
            PageLink,
            {
              page: page + 1,
              disabled: !canGoNext || isLoading,
              onPageChange,
              label: "Next page",
              children: /* @__PURE__ */ jsx(ChevronRight, { className: "size-4" })
            }
          )
        ] })
      ] })
    ] })
  ] });
}
function PageLink({
  page,
  disabled,
  label,
  children,
  onPageChange
}) {
  return /* @__PURE__ */ jsx(
    Link,
    {
      from: "/p/$projectId/domain",
      to: "/p/$projectId/domain",
      search: (prev) => ({
        ...prev,
        page: page === 1 ? void 0 : page
      }),
      "aria-label": label,
      "aria-disabled": disabled,
      className: `btn btn-ghost btn-sm btn-square ${disabled ? "btn-disabled" : ""}`,
      onClick: (event) => {
        if (disabled) {
          event.preventDefault();
          return;
        }
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
          return;
        }
        event.preventDefault();
        onPageChange(page);
      },
      children
    }
  );
}
function SortableHeader({
  label,
  helpText,
  isActive,
  order,
  onClick
}) {
  return /* @__PURE__ */ jsxs(
    "button",
    {
      type: "button",
      className: "inline-flex items-center gap-1 font-medium hover:text-base-content",
      onClick,
      "aria-label": `Sort by ${label}`,
      "aria-pressed": isActive,
      children: [
        helpText ? /* @__PURE__ */ jsx(HeaderHelpLabel, { label, helpText }) : /* @__PURE__ */ jsx("span", { children: label }),
        isActive ? order === "asc" ? /* @__PURE__ */ jsx(ArrowUp, { className: "size-3" }) : /* @__PURE__ */ jsx(ArrowDown, { className: "size-3" }) : null
      ]
    }
  );
}
const keywordColumnHelper = createColumnHelper();
function DomainKeywordsTableComponent({
  domain,
  rows,
  selectedKeywords,
  visibleKeywords,
  sortMode,
  currentSortOrder,
  onSortClick,
  onToggleKeyword
}) {
  const renderStarted = performance.now();
  const selectAnchorRef = useSelectionAnchor();
  const rowSelection = useMemo(
    () => Object.fromEntries(
      [...selectedKeywords].map((keyword) => [keyword, true])
    ),
    [selectedKeywords]
  );
  const columns = useMemo(
    () => [
      makeSelectionColumn(selectAnchorRef),
      keywordColumnHelper.accessor("keyword", {
        header: () => "Keyword",
        cell: ({ getValue }) => /* @__PURE__ */ jsx("span", { className: "font-medium", children: getValue() })
      }),
      keywordColumnHelper.accessor("position", {
        header: () => /* @__PURE__ */ jsx(
          SortableHeader,
          {
            label: "Rank",
            isActive: sortMode === "rank",
            order: currentSortOrder,
            onClick: () => onSortClick("rank")
          }
        ),
        cell: ({ getValue }) => getValue() ?? "-"
      }),
      keywordColumnHelper.accessor("searchVolume", {
        header: () => /* @__PURE__ */ jsx(
          SortableHeader,
          {
            label: "Volume",
            isActive: sortMode === "volume",
            order: currentSortOrder,
            onClick: () => onSortClick("volume")
          }
        ),
        cell: ({ getValue }) => formatNumber(getValue())
      }),
      keywordColumnHelper.accessor("traffic", {
        header: () => /* @__PURE__ */ jsx(
          SortableHeader,
          {
            label: "Traffic",
            isActive: sortMode === "traffic",
            order: currentSortOrder,
            onClick: () => onSortClick("traffic")
          }
        ),
        cell: ({ getValue }) => formatRounded(getValue())
      }),
      keywordColumnHelper.accessor("cpc", {
        header: () => /* @__PURE__ */ jsx(
          SortableHeader,
          {
            label: "CPC",
            helpText: "Cost per click in USD.",
            isActive: sortMode === "cpc",
            order: currentSortOrder,
            onClick: () => onSortClick("cpc")
          }
        ),
        cell: ({ getValue }) => {
          const value = getValue();
          return value == null ? "-" : `$${value.toFixed(2)}`;
        }
      }),
      keywordColumnHelper.display({
        id: "url",
        header: () => "URL",
        cell: ({ row }) => /* @__PURE__ */ jsx(
          ExternalUrlCell,
          {
            value: row.original.relativeUrl ?? row.original.url,
            label: row.original.relativeUrl ?? row.original.url ?? "",
            baseDomain: domain
          }
        ),
        meta: {
          cellClassName: "max-w-[260px] truncate"
        }
      }),
      keywordColumnHelper.accessor("keywordDifficulty", {
        header: () => /* @__PURE__ */ jsx(
          SortableHeader,
          {
            label: "Score",
            helpText: "Organic ranking difficulty (0-100): higher means harder to reach Google's top 10.",
            isActive: sortMode === "score",
            order: currentSortOrder,
            onClick: () => onSortClick("score")
          }
        ),
        cell: ({ getValue }) => /* @__PURE__ */ jsx(DifficultyBadge, { value: getValue() })
      })
    ],
    [currentSortOrder, domain, onSortClick, selectAnchorRef, sortMode]
  );
  const table = useAppTable({
    data: rows,
    columns,
    state: { rowSelection },
    onRowSelectionChange: (updater) => {
      const next = typeof updater === "function" ? updater(rowSelection) : updater;
      const selected = Object.entries(next).filter(([, value]) => value).map(([keyword]) => keyword);
      for (const keyword of visibleKeywords) {
        const shouldBeSelected = selected.includes(keyword);
        if (selectedKeywords.has(keyword) !== shouldBeSelected) {
          onToggleKeyword(keyword);
        }
      }
    },
    getRowId: (row) => row.keyword,
    enableRowSelection: true
  });
  useDomainRenderDebug("DomainKeywordsTable", {
    rows: rows.length,
    selectedCount: selectedKeywords.size,
    durationMs: Math.round(performance.now() - renderStarted),
    sortMode,
    currentSortOrder
  });
  return /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto", children: [
    /* @__PURE__ */ jsx("div", { className: "mb-2 text-xs text-base-content/60", children: selectedKeywords.size > 0 ? `${selectedKeywords.size} selected` : "Select keywords to save" }),
    /* @__PURE__ */ jsx(
      AppDataTable,
      {
        table,
        className: "table table-sm",
        wrapperClassName: "",
        empty: /* @__PURE__ */ jsx("div", { className: "py-6 text-center text-base-content/60", children: "No keywords match this search." })
      }
    )
  ] });
}
const DomainKeywordsTable = memo(DomainKeywordsTableComponent);
function TableLoadingRows() {
  return /* @__PURE__ */ jsx("div", { className: "space-y-3 py-4", "aria-busy": true, children: Array.from({ length: 8 }).map((_, index) => /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-6 gap-3", children: [
    /* @__PURE__ */ jsx("div", { className: "skeleton h-4 col-span-2" }),
    /* @__PURE__ */ jsx("div", { className: "skeleton h-4" }),
    /* @__PURE__ */ jsx("div", { className: "skeleton h-4" }),
    /* @__PURE__ */ jsx("div", { className: "skeleton h-4" }),
    /* @__PURE__ */ jsx("div", { className: "skeleton h-4" })
  ] }, index)) });
}
function DomainTableTabSurface({
  showFilters,
  onToggleFilters,
  activeFilterCount,
  countLabel,
  totalCount,
  fallbackCount,
  exportActions,
  filterPanel,
  isLoading,
  showTableLoading,
  children,
  pagination
}) {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 px-4 py-2 border-b border-base-300", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          className: `btn btn-ghost btn-sm gap-1.5 ${showFilters ? "btn-active" : ""}`,
          onClick: onToggleFilters,
          title: "Toggle filters",
          type: "button",
          children: [
            /* @__PURE__ */ jsx(SlidersHorizontal, { className: "size-3.5" }),
            "Filters",
            activeFilterCount > 0 ? /* @__PURE__ */ jsx("span", { className: "badge badge-xs badge-primary border-0 text-primary-content", children: activeFilterCount }) : null
          ]
        }
      ),
      /* @__PURE__ */ jsxs("span", { className: "text-sm text-base-content/60", children: [
        (totalCount ?? fallbackCount).toLocaleString(),
        " ",
        countLabel
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex-1" }),
      /* @__PURE__ */ jsx(TableExportMenu, { actions: exportActions })
    ] }),
    filterPanel,
    /* @__PURE__ */ jsx("div", { className: "p-4", children: /* @__PURE__ */ jsx(
      "div",
      {
        className: isLoading && !showTableLoading ? "opacity-60 transition-opacity" : "transition-opacity",
        children: showTableLoading ? /* @__PURE__ */ jsx(TableLoadingRows, {}) : children
      }
    ) }),
    pagination
  ] });
}
function saveSelectedKeywords({
  selectedKeywords,
  filteredKeywords,
  save,
  projectId,
  locationCode
}) {
  if (selectedKeywords.size === 0) {
    toast.error("Select at least one keyword first");
    return;
  }
  const selectedRows = filteredKeywords.filter(
    (row) => selectedKeywords.has(row.keyword)
  );
  save(
    {
      projectId,
      keywords: [...selectedKeywords],
      locationCode,
      metrics: selectedRows.map((row) => ({
        keyword: row.keyword,
        searchVolume: row.searchVolume,
        cpc: row.cpc,
        keywordDifficulty: row.keywordDifficulty
      }))
    },
    {
      onSuccess: () => {
        captureClientEvent("keyword:save", {
          source_feature: "domain_overview",
          keyword_count: selectedKeywords.size
        });
        toast.success(`Saved ${selectedKeywords.size} keywords`);
      },
      onError: (error) => {
        toast.error(getStandardErrorMessage(error, "Save failed."));
      }
    }
  );
}
const KEYWORD_FILTER_FIELDS = [
  "include",
  "exclude",
  "minTraffic",
  "maxTraffic",
  "minVol",
  "maxVol",
  "minCpc",
  "maxCpc",
  "minKd",
  "maxKd",
  "minRank",
  "maxRank"
];
const PAGE_FILTER_FIELDS = [
  "include",
  "exclude",
  "minTraffic",
  "maxTraffic",
  "minVol",
  "maxVol"
];
const PAGE_SEARCH_PARAM_BY_FIELD = {
  include: "pInclude",
  exclude: "pExclude",
  minTraffic: "pMinTraffic",
  maxTraffic: "pMaxTraffic",
  minVol: "pMinVol",
  maxVol: "pMaxVol"
};
function countKeywordFilterConditions(values) {
  return countFilterConditions(values, KEYWORD_FILTER_FIELDS);
}
function countPageFilterConditions(values) {
  return countFilterConditions(values, PAGE_FILTER_FIELDS);
}
function buildKeywordsSearchUpdate(values) {
  return buildFilterSearchUpdate(
    values,
    KEYWORD_FILTER_FIELDS,
    (key) => key
  );
}
function buildPagesSearchUpdate(values) {
  return buildFilterSearchUpdate(
    values,
    PAGE_FILTER_FIELDS,
    (key) => PAGE_SEARCH_PARAM_BY_FIELD[key]
  );
}
function buildPagesClearSearchUpdate() {
  return buildFilterClearSearchUpdate(
    PAGE_FILTER_FIELDS,
    (key) => PAGE_SEARCH_PARAM_BY_FIELD[key]
  );
}
function buildDomainFiltersClearSearchUpdate() {
  const update = buildFilterClearSearchUpdate(
    KEYWORD_FILTER_FIELDS,
    (key) => key
  );
  Object.assign(
    update,
    buildFilterClearSearchUpdate(
      PAGE_FILTER_FIELDS,
      (key) => PAGE_SEARCH_PARAM_BY_FIELD[key]
    )
  );
  return update;
}
function countFilterConditions(values, fields) {
  let n = 0;
  for (const term of values.include.split(/[,+]/)) if (term.trim()) n += 1;
  for (const term of values.exclude.split(/[,+]/)) if (term.trim()) n += 1;
  for (const key of fields) {
    if (key === "include" || key === "exclude") continue;
    if (values[key].trim() !== "") n += 1;
  }
  return n;
}
function buildFilterSearchUpdate(values, fields, getParam) {
  const update = { page: void 0 };
  for (const key of fields) {
    const param = getParam(key);
    const raw = values[key].trim();
    if (raw === "") {
      Object.assign(update, { [param]: void 0 });
      continue;
    }
    if (key === "include" || key === "exclude") {
      Object.assign(update, { [param]: raw });
      continue;
    }
    const parsed = Number(raw);
    Object.assign(update, {
      [param]: Number.isFinite(parsed) ? parsed : void 0
    });
  }
  return update;
}
function buildFilterClearSearchUpdate(fields, getParam) {
  const update = { page: void 0 };
  for (const key of fields)
    Object.assign(update, { [getParam(key)]: void 0 });
  return update;
}
function toNumberOrUndefined(value) {
  const trimmed = value.trim();
  if (trimmed === "") return void 0;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : void 0;
}
function toFiltersPayload(filters) {
  return {
    include: filters.include || void 0,
    exclude: filters.exclude || void 0,
    minTraffic: toNumberOrUndefined(filters.minTraffic),
    maxTraffic: toNumberOrUndefined(filters.maxTraffic),
    minVol: toNumberOrUndefined(filters.minVol),
    maxVol: toNumberOrUndefined(filters.maxVol),
    minCpc: toNumberOrUndefined(filters.minCpc),
    maxCpc: toNumberOrUndefined(filters.maxCpc),
    minKd: toNumberOrUndefined(filters.minKd),
    maxKd: toNumberOrUndefined(filters.maxKd),
    minRank: toNumberOrUndefined(filters.minRank),
    maxRank: toNumberOrUndefined(filters.maxRank)
  };
}
function useDomainKeywordsQuery(input) {
  const filtersPayload = useMemo(
    () => toFiltersPayload(input.appliedFilters),
    [input.appliedFilters]
  );
  const queryKey = useMemo(
    () => [
      "domain-keywords",
      input.projectId,
      input.domain,
      input.scope,
      input.locationCode,
      input.page,
      input.pageSize,
      input.sortMode,
      input.sortOrder,
      filtersPayload
    ],
    [
      filtersPayload,
      input.domain,
      input.scope,
      input.locationCode,
      input.page,
      input.pageSize,
      input.projectId,
      input.sortMode,
      input.sortOrder
    ]
  );
  useEffect(() => {
    debugDomain("useDomainKeywordsQuery:key", {
      queryKey,
      enabled: input.enabled && Boolean(input.domain)
    });
  }, [input.domain, input.enabled, queryKey]);
  const query = useQuery({
    enabled: input.enabled && Boolean(input.domain),
    queryKey,
    queryFn: () => getDomainKeywordsPage({
      data: {
        projectId: input.projectId,
        domain: input.domain,
        scope: input.scope,
        locationCode: input.locationCode,
        page: input.page,
        pageSize: input.pageSize,
        sortMode: input.sortMode,
        sortOrder: input.sortOrder,
        filters: filtersPayload
      }
    }),
    staleTime: 6e4
  });
  useEffect(() => {
    debugDomain("useDomainKeywordsQuery:state", {
      status: query.status,
      fetchStatus: query.fetchStatus,
      isFetching: query.isFetching,
      rows: query.data?.keywords.length ?? 0
    });
  }, [
    query.data?.keywords.length,
    query.fetchStatus,
    query.isFetching,
    query.status
  ]);
  return query;
}
function useSaveKeywordsMutation({
  projectId,
  queryClient
}) {
  return useMutation({
    mutationFn: (data) => saveKeywords({ data }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["savedKeywords", projectId]
      });
    }
  });
}
const EMPTY_DOMAIN_FILTERS = {
  include: "",
  exclude: "",
  minTraffic: "",
  maxTraffic: "",
  minVol: "",
  maxVol: "",
  minCpc: "",
  maxCpc: "",
  minKd: "",
  maxKd: "",
  minRank: "",
  maxRank: ""
};
const STORAGE_KEY_PREFIX = "domain-overview-filter-defaults:";
function isRecord(value) {
  return typeof value === "object" && value !== null;
}
function hasAnyFilter(values) {
  return Object.values(values).some((value) => value.trim() !== "");
}
function getStorageKey(tab, scope) {
  return `${STORAGE_KEY_PREFIX}${scope}:${tab}`;
}
function loadFromStorage(tab, scope, fallback) {
  const result = { ...fallback };
  if (typeof window === "undefined") return result;
  try {
    const raw = window.localStorage.getItem(getStorageKey(tab, scope));
    if (!raw) return result;
    const parsed = JSON.parse(raw);
    if (!isRecord(parsed)) return result;
    for (const key in fallback) {
      const value = parsed[key];
      if (typeof value === "string") {
        Object.assign(result, { [key]: value });
      }
    }
  } catch {
  }
  return result;
}
function saveToStorage(tab, scope, values) {
  if (typeof window === "undefined") return;
  try {
    const key = getStorageKey(tab, scope);
    if (hasAnyFilter(values)) {
      window.localStorage.setItem(key, JSON.stringify(values));
    } else {
      window.localStorage.removeItem(key);
    }
  } catch {
  }
}
function clearStorage(tab, scope) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(getStorageKey(tab, scope));
  } catch {
  }
}
function emptyPageFilters() {
  return {
    include: EMPTY_DOMAIN_FILTERS.include,
    exclude: EMPTY_DOMAIN_FILTERS.exclude,
    minTraffic: EMPTY_DOMAIN_FILTERS.minTraffic,
    maxTraffic: EMPTY_DOMAIN_FILTERS.maxTraffic,
    minVol: EMPTY_DOMAIN_FILTERS.minVol,
    maxVol: EMPTY_DOMAIN_FILTERS.maxVol
  };
}
function loadKeywordFilters(scope) {
  return loadFromStorage("keywords", scope, { ...EMPTY_DOMAIN_FILTERS });
}
function loadPageFilters(scope) {
  return loadFromStorage("pages", scope, emptyPageFilters());
}
function useDomainKeywordFilterPreferences(scope) {
  const [filters, setFilters] = useState(
    () => loadKeywordFilters(scope)
  );
  useEffect(() => {
    setFilters(loadKeywordFilters(scope));
  }, [scope]);
  const save = useCallback(
    (values) => {
      const next = { ...EMPTY_DOMAIN_FILTERS };
      for (const key of KEYWORD_FILTER_FIELDS) next[key] = values[key];
      saveToStorage("keywords", scope, next);
      setFilters(next);
    },
    [scope]
  );
  const clear = useCallback(() => {
    clearStorage("keywords", scope);
    setFilters({ ...EMPTY_DOMAIN_FILTERS });
  }, [scope]);
  return { filters, save, clear };
}
function useDomainPageFilterPreferences(scope) {
  const [filters, setFilters] = useState(
    () => loadPageFilters(scope)
  );
  useEffect(() => {
    setFilters(loadPageFilters(scope));
  }, [scope]);
  const save = useCallback(
    (values) => {
      const next = emptyPageFilters();
      for (const key of PAGE_FILTER_FIELDS) next[key] = values[key];
      saveToStorage("pages", scope, next);
      setFilters(next);
    },
    [scope]
  );
  const clear = useCallback(() => {
    clearStorage("pages", scope);
    setFilters(emptyPageFilters());
  }, [scope]);
  return { filters, save, clear };
}
const EMPTY_KEYWORDS = [];
const KEYWORD_TEXT_FILTERS = [
  {
    key: "include",
    label: "Include Terms",
    placeholder: "audit, checker, template"
  },
  {
    key: "exclude",
    label: "Exclude Terms",
    placeholder: "jobs, salary, course"
  }
];
const KEYWORD_RANGE_FILTERS = [
  { title: "Traffic", minKey: "minTraffic", maxKey: "maxTraffic" },
  { title: "Volume", minKey: "minVol", maxKey: "maxVol" },
  { title: "CPC (USD)", minKey: "minCpc", maxKey: "maxCpc", step: "0.01" },
  { title: "Score (KD)", minKey: "minKd", maxKey: "maxKd" },
  { title: "Rank", minKey: "minRank", maxKey: "maxRank" }
];
function KeywordsTab({
  projectId,
  target,
  hostname,
  scope,
  routeState,
  canSaveKeywords,
  setSearchParams,
  onSortClick,
  onPageChange,
  onPageSizeChange
}) {
  const queryClient = useQueryClient();
  const [selectedKeywords, setSelectedKeywords] = useState(
    /* @__PURE__ */ new Set()
  );
  const [showFilters, setShowFilters] = useState(false);
  const maxConditions = MAX_DATAFORSEO_FILTER_CONDITIONS - RESEARCH_SCOPE_FILTER_SLOTS.keywords[scope];
  const filterPreferences = useDomainKeywordFilterPreferences(
    `${projectId}:${target}`
  );
  const {
    filters: preferredFilters,
    save: savePreferredFilters,
    clear: clearPreferredFilters
  } = filterPreferences;
  const restoredFilters = routeState.hasAppliedKeywordFilters ? routeState.appliedFilters : preferredFilters;
  const filtersOverBudget = countKeywordFilterConditions(restoredFilters) > maxConditions;
  const appliedFilters = filtersOverBudget ? EMPTY_DOMAIN_FILTERS : restoredFilters;
  const query = useDomainKeywordsQuery({
    projectId,
    domain: target,
    scope,
    locationCode: routeState.sentLocationCode,
    page: routeState.page,
    pageSize: routeState.pageSize,
    sortMode: routeState.sort,
    sortOrder: routeState.order,
    appliedFilters,
    enabled: Boolean(target)
  });
  const rows = query.data?.keywords ?? EMPTY_KEYWORDS;
  const totalCount = query.data?.totalCount ?? null;
  const hasNextPage = query.data?.hasMore ?? false;
  const isLoading = query.isFetching;
  const showTableLoading = isLoading && (showFilters || rows.length === 0);
  useDomainRenderDebug("KeywordsTab", {
    showFilters,
    isLoading,
    isPending: query.isPending,
    rows: rows.length,
    totalCount,
    selectedCount: selectedKeywords.size,
    activeTab: routeState.tab,
    page: routeState.page,
    sort: routeState.sort,
    order: routeState.order
  });
  const visibleKeywords = useMemo(() => rows.map((r) => r.keyword), [rows]);
  useEffect(() => {
    const visibleSet = new Set(visibleKeywords);
    setSelectedKeywords((prev) => {
      const next = new Set([...prev].filter((k) => visibleSet.has(k)));
      return next.size === prev.size ? prev : next;
    });
  }, [visibleKeywords]);
  const toggleKeywordSelection = useCallback((keyword) => {
    setSelectedKeywords((prev) => {
      const next = new Set(prev);
      if (next.has(keyword)) next.delete(keyword);
      else next.add(keyword);
      return next;
    });
  }, []);
  const saveMutation = useSaveKeywordsMutation({ projectId, queryClient });
  const handleSaveKeywords = useCallback(() => {
    saveSelectedKeywords({
      selectedKeywords,
      filteredKeywords: rows,
      save: saveMutation.mutate,
      projectId,
      locationCode: routeState.sentLocationCode
    });
  }, [
    projectId,
    routeState.sentLocationCode,
    rows,
    saveMutation.mutate,
    selectedKeywords
  ]);
  const applyFilters = useCallback(
    (values) => {
      if (countKeywordFilterConditions(values) > maxConditions) return;
      const update = buildKeywordsSearchUpdate(values);
      debugDomain("KeywordsTab:apply-filters", { values, update });
      savePreferredFilters(values);
      setSearchParams(update);
    },
    [maxConditions, savePreferredFilters, setSearchParams]
  );
  const resetFilters = useCallback(() => {
    const update = { page: void 0 };
    for (const key of KEYWORD_FILTER_FIELDS) update[key] = void 0;
    debugDomain("KeywordsTab:reset-filters", { update });
    clearPreferredFilters();
    setSearchParams(update);
  }, [clearPreferredFilters, setSearchParams]);
  const activeFilterCount = useMemo(
    () => KEYWORD_FILTER_FIELDS.filter((k) => restoredFilters[k].trim() !== "").length,
    [restoredFilters]
  );
  const exportTable = useMemo(() => keywordsToTable(rows), [rows]);
  const fileNamePrefix = target.replaceAll("/", "-");
  const selectedExportTable = useMemo(
    () => keywordsToTable(rows.filter((r) => selectedKeywords.has(r.keyword))),
    [rows, selectedKeywords]
  );
  const handleCopy = async () => {
    await navigator.clipboard.writeText(JSON.stringify(rows, null, 2));
    toast.success("Copied data");
  };
  const handleExportToSheets = () => {
    void exportTableToSheets({
      headers: exportTable.headers,
      rows: exportTable.rows,
      feature: "domain_overview"
    });
  };
  const handleDownload = (extension) => {
    downloadCsv(
      `${fileNamePrefix}-keywords.${extension}`,
      buildCsv(exportTable.headers, exportTable.rows)
    );
    if (extension === "csv") {
      captureClientEvent("data:export", {
        source_feature: "domain_overview",
        result_count: rows.length
      });
    }
  };
  const handleExportSelectionToSheets = () => {
    void exportTableToSheets({
      headers: selectedExportTable.headers,
      rows: selectedExportTable.rows,
      feature: "domain_overview"
    });
  };
  const handleDownloadSelectionCsv = () => {
    downloadCsv(
      `${fileNamePrefix}-selected-keywords.csv`,
      buildCsv(selectedExportTable.headers, selectedExportTable.rows)
    );
    captureClientEvent("data:export", {
      source_feature: "domain_overview",
      result_count: selectedKeywords.size,
      scope: "selection"
    });
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      TableBulkActionBar,
      {
        selectedCount: selectedKeywords.size,
        onClear: () => setSelectedKeywords(/* @__PURE__ */ new Set()),
        actions: /* @__PURE__ */ jsxs("div", { className: "flex items-center px-1.5", children: [
          /* @__PURE__ */ jsx(
            TableBulkActionButton,
            {
              icon: /* @__PURE__ */ jsx(Save, { className: "size-3.5" }),
              onClick: handleSaveKeywords,
              disabled: !canSaveKeywords,
              children: "Save Keywords"
            }
          ),
          /* @__PURE__ */ jsx(
            TableBulkExportMenu,
            {
              actions: [
                {
                  label: "Export to Sheets",
                  icon: /* @__PURE__ */ jsx(Sheet, { className: "size-4" }),
                  onClick: handleExportSelectionToSheets
                },
                {
                  label: "Download CSV",
                  icon: /* @__PURE__ */ jsx(Download, { className: "size-4" }),
                  onClick: handleDownloadSelectionCsv
                }
              ]
            }
          )
        ] })
      }
    ),
    filtersOverBudget ? /* @__PURE__ */ jsx("div", { className: "alert alert-warning mb-3", children: /* @__PURE__ */ jsxs("span", { children: [
      "Saved filters exceed this scope's ",
      maxConditions,
      "-condition limit and were not applied. Open Filters to trim them."
    ] }) }) : null,
    /* @__PURE__ */ jsx(
      DomainTableTabSurface,
      {
        showFilters,
        onToggleFilters: () => setShowFilters((prev) => !prev),
        activeFilterCount,
        countLabel: "keywords",
        totalCount,
        fallbackCount: rows.length,
        isLoading,
        showTableLoading,
        exportActions: [
          {
            label: "Export to Sheets",
            icon: /* @__PURE__ */ jsx(Sheet, { className: "size-4" }),
            onClick: handleExportToSheets
          },
          {
            label: "Copy data (JSON)",
            icon: /* @__PURE__ */ jsx(Copy, { className: "size-4" }),
            onClick: handleCopy
          },
          {
            label: "Download CSV",
            icon: /* @__PURE__ */ jsx(Download, { className: "size-4" }),
            onClick: () => handleDownload("csv")
          },
          {
            label: "Download Excel",
            icon: /* @__PURE__ */ jsx(FileSpreadsheet, { className: "size-4" }),
            onClick: () => handleDownload("xls")
          }
        ],
        filterPanel: showFilters ? /* @__PURE__ */ jsx(
          DomainFilterPanel,
          {
            debugName: "KeywordsFilterPanel",
            activeFilterCount,
            appliedFilters: restoredFilters,
            fields: KEYWORD_FILTER_FIELDS,
            textFields: KEYWORD_TEXT_FILTERS,
            rangeFields: KEYWORD_RANGE_FILTERS,
            countConditions: countKeywordFilterConditions,
            maxConditions,
            onApply: applyFilters,
            onClear: resetFilters
          }
        ) : null,
        pagination: /* @__PURE__ */ jsx(
          DomainKeywordsPagination,
          {
            page: routeState.page,
            pageSize: routeState.pageSize,
            totalCount,
            hasNextPage,
            isLoading,
            onPageChange,
            onPageSizeChange
          }
        ),
        children: /* @__PURE__ */ jsx(
          DomainKeywordsTable,
          {
            domain: hostname,
            rows,
            selectedKeywords,
            visibleKeywords,
            sortMode: routeState.sort,
            currentSortOrder: routeState.order,
            onSortClick,
            onToggleKeyword: toggleKeywordSelection
          }
        )
      }
    )
  ] });
}
const pageColumnHelper = createColumnHelper();
function DomainPagesTableComponent({
  domain,
  rows,
  sortMode,
  currentSortOrder,
  onSortClick
}) {
  const renderStarted = performance.now();
  const columns = useMemo(
    () => [
      pageColumnHelper.display({
        id: "page",
        header: () => "Page",
        cell: ({ row }) => /* @__PURE__ */ jsx(
          ExternalUrlCell,
          {
            value: row.original.relativePath ?? row.original.page,
            label: row.original.relativePath ?? row.original.page,
            baseDomain: domain,
            className: "link link-primary inline-flex items-center gap-1"
          }
        ),
        meta: {
          cellClassName: "max-w-[420px] truncate"
        }
      }),
      pageColumnHelper.accessor("organicTraffic", {
        header: () => /* @__PURE__ */ jsx(
          SortableHeader,
          {
            label: "Organic Traffic",
            isActive: toPageSortMode(sortMode) === "traffic",
            order: currentSortOrder,
            onClick: () => onSortClick("traffic")
          }
        ),
        cell: ({ getValue }) => formatRounded(getValue())
      }),
      pageColumnHelper.accessor("keywords", {
        header: () => /* @__PURE__ */ jsx(
          SortableHeader,
          {
            label: "Keywords",
            isActive: toPageSortMode(sortMode) === "keywords",
            order: currentSortOrder,
            onClick: () => onSortClick("volume")
          }
        ),
        cell: ({ getValue }) => formatNumber(getValue())
      })
    ],
    [currentSortOrder, domain, onSortClick, sortMode]
  );
  const tableData = useMemo(() => rows.slice(0, 100), [rows]);
  const table = useAppTable({
    data: tableData,
    columns
  });
  useDomainRenderDebug("DomainPagesTable", {
    rows: rows.length,
    durationMs: Math.round(performance.now() - renderStarted),
    sortMode,
    currentSortOrder
  });
  return /* @__PURE__ */ jsx(
    AppDataTable,
    {
      table,
      className: "table table-sm",
      empty: /* @__PURE__ */ jsx("div", { className: "py-6 text-center text-base-content/60", children: "No pages match this search." })
    }
  );
}
const DomainPagesTable = memo(DomainPagesTableComponent);
function useDomainPagesQuery(input) {
  const pageSortMode = toPageSortMode(input.sortMode);
  const queryKey = useMemo(
    () => [
      "domain-pages",
      input.projectId,
      input.domain,
      input.scope,
      input.locationCode,
      input.page,
      input.pageSize,
      pageSortMode,
      input.sortOrder,
      input.appliedFilters
    ],
    [
      input.appliedFilters,
      input.domain,
      input.scope,
      input.locationCode,
      input.page,
      input.pageSize,
      input.projectId,
      input.sortOrder,
      pageSortMode
    ]
  );
  useEffect(() => {
    debugDomain("useDomainPagesQuery:key", {
      queryKey,
      enabled: input.enabled && Boolean(input.domain)
    });
  }, [input.domain, input.enabled, queryKey]);
  const query = useQuery({
    enabled: input.enabled && Boolean(input.domain),
    queryKey,
    queryFn: () => getDomainPagesPage({
      data: {
        projectId: input.projectId,
        domain: input.domain,
        scope: input.scope,
        locationCode: input.locationCode,
        page: input.page,
        pageSize: input.pageSize,
        sortMode: pageSortMode,
        sortOrder: input.sortOrder,
        filters: input.appliedFilters
      }
    }),
    staleTime: 6e4
  });
  useEffect(() => {
    debugDomain("useDomainPagesQuery:state", {
      status: query.status,
      fetchStatus: query.fetchStatus,
      isFetching: query.isFetching,
      rows: query.data?.pages.length ?? 0
    });
  }, [
    query.data?.pages.length,
    query.fetchStatus,
    query.isFetching,
    query.status
  ]);
  return query;
}
const EMPTY_PAGES_ROWS = [];
const PAGE_TEXT_FILTERS = [
  {
    key: "include",
    label: "Include Page Terms",
    placeholder: "pricing, tools, guides"
  },
  {
    key: "exclude",
    label: "Exclude Page Terms",
    placeholder: "blog, tag, archive"
  }
];
const PAGE_RANGE_FILTERS = [
  { title: "Traffic", minKey: "minTraffic", maxKey: "maxTraffic" },
  { title: "Keywords", minKey: "minVol", maxKey: "maxVol" }
];
function PagesTab({
  projectId,
  target,
  hostname,
  scope,
  routeState,
  setSearchParams,
  onSortClick,
  onPageChange,
  onPageSizeChange
}) {
  const [showFilters, setShowFilters] = useState(false);
  const maxConditions = MAX_DATAFORSEO_FILTER_CONDITIONS - RESEARCH_SCOPE_FILTER_SLOTS.pages[scope];
  const filterPreferences = useDomainPageFilterPreferences(
    `${projectId}:${target}`
  );
  const {
    filters: preferredFilters,
    save: savePreferredFilters,
    clear: clearPreferredFilters
  } = filterPreferences;
  const restoredFilters = useMemo(
    () => routeState.hasAppliedPageFilters ? routeState.appliedPageFilters : preferredFilters,
    [
      preferredFilters,
      routeState.appliedPageFilters,
      routeState.hasAppliedPageFilters
    ]
  );
  const filtersOverBudget = countPageFilterConditions(restoredFilters) > maxConditions;
  const appliedPagesFilters = filtersOverBudget ? EMPTY_DOMAIN_FILTERS : restoredFilters;
  const query = useDomainPagesQuery({
    projectId,
    domain: target,
    scope,
    locationCode: routeState.sentLocationCode,
    page: routeState.page,
    pageSize: routeState.pageSize,
    sortMode: routeState.sort,
    sortOrder: routeState.order,
    appliedFilters: appliedPagesFilters,
    enabled: Boolean(target)
  });
  const rows = query.data?.pages ?? EMPTY_PAGES_ROWS;
  const totalCount = query.data?.totalCount ?? null;
  const hasNextPage = query.data?.hasMore ?? false;
  const isLoading = query.isFetching;
  const showTableLoading = isLoading && (showFilters || rows.length === 0);
  useDomainRenderDebug("PagesTab", {
    showFilters,
    isLoading,
    isPending: query.isPending,
    rows: rows.length,
    totalCount,
    activeTab: routeState.tab,
    page: routeState.page,
    sort: routeState.sort,
    order: routeState.order
  });
  const applyFilters = useCallback(
    (values) => {
      if (countPageFilterConditions(values) > maxConditions) return;
      const update = buildPagesSearchUpdate(values);
      debugDomain("PagesTab:apply-filters", { values, update });
      savePreferredFilters(values);
      setSearchParams(update);
    },
    [maxConditions, savePreferredFilters, setSearchParams]
  );
  const resetFilters = useCallback(() => {
    const update = buildPagesClearSearchUpdate();
    debugDomain("PagesTab:reset-filters", { update });
    clearPreferredFilters();
    setSearchParams(update);
  }, [clearPreferredFilters, setSearchParams]);
  const activeFilterCount = useMemo(
    () => PAGE_FILTER_FIELDS.filter((k) => restoredFilters[k].trim() !== "").length,
    [restoredFilters]
  );
  const exportTable = useMemo(() => pagesToTable(rows), [rows]);
  const fileNamePrefix = target.replaceAll("/", "-");
  const handleCopy = async () => {
    await navigator.clipboard.writeText(JSON.stringify(rows, null, 2));
    toast.success("Copied data");
  };
  const handleExportToSheets = () => {
    void exportTableToSheets({
      headers: exportTable.headers,
      rows: exportTable.rows,
      feature: "domain_overview"
    });
  };
  const handleDownload = (extension) => {
    downloadCsv(
      `${fileNamePrefix}-pages.${extension}`,
      buildCsv(exportTable.headers, exportTable.rows)
    );
    if (extension === "csv") {
      captureClientEvent("data:export", {
        source_feature: "domain_overview",
        result_count: rows.length
      });
    }
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    filtersOverBudget ? /* @__PURE__ */ jsx("div", { className: "alert alert-warning mb-3", children: /* @__PURE__ */ jsxs("span", { children: [
      "Saved filters exceed this scope's ",
      maxConditions,
      "-condition limit and were not applied. Open Filters to trim them."
    ] }) }) : null,
    /* @__PURE__ */ jsx(
      DomainTableTabSurface,
      {
        showFilters,
        onToggleFilters: () => setShowFilters((prev) => !prev),
        activeFilterCount,
        countLabel: "pages",
        totalCount,
        fallbackCount: rows.length,
        isLoading,
        showTableLoading,
        exportActions: [
          {
            label: "Export to Sheets",
            icon: /* @__PURE__ */ jsx(Sheet, { className: "size-4" }),
            onClick: handleExportToSheets
          },
          {
            label: "Copy data (JSON)",
            icon: /* @__PURE__ */ jsx(Copy, { className: "size-4" }),
            onClick: handleCopy
          },
          {
            label: "Download CSV",
            icon: /* @__PURE__ */ jsx(Download, { className: "size-4" }),
            onClick: () => handleDownload("csv")
          },
          {
            label: "Download Excel",
            icon: /* @__PURE__ */ jsx(FileSpreadsheet, { className: "size-4" }),
            onClick: () => handleDownload("xls")
          }
        ],
        filterPanel: showFilters ? /* @__PURE__ */ jsx(
          DomainFilterPanel,
          {
            debugName: "PagesFilterPanel",
            activeFilterCount,
            appliedFilters: restoredFilters,
            fields: PAGE_FILTER_FIELDS,
            textFields: PAGE_TEXT_FILTERS,
            rangeFields: PAGE_RANGE_FILTERS,
            countConditions: countPageFilterConditions,
            maxConditions,
            onApply: applyFilters,
            onClear: resetFilters
          }
        ) : null,
        pagination: /* @__PURE__ */ jsx(
          DomainKeywordsPagination,
          {
            page: routeState.page,
            pageSize: routeState.pageSize,
            totalCount,
            hasNextPage,
            isLoading,
            onPageChange,
            onPageSizeChange
          }
        ),
        children: /* @__PURE__ */ jsx(
          DomainPagesTable,
          {
            domain: hostname,
            rows,
            sortMode: routeState.sort,
            currentSortOrder: routeState.order,
            onSortClick
          }
        )
      }
    )
  ] });
}
function StatCard({
  label,
  value,
  hint
}) {
  return /* @__PURE__ */ jsx("div", { className: "card bg-base-100 border border-base-300", children: /* @__PURE__ */ jsxs("div", { className: "card-body p-4", children: [
    /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-wide text-base-content/60", children: label }),
    /* @__PURE__ */ jsx("p", { className: "text-2xl font-semibold", children: value }),
    hint ? /* @__PURE__ */ jsx("p", { className: "text-xs text-base-content/50", children: hint }) : null
  ] }) });
}
const KEYWORDS_ONLY_SORTS = /* @__PURE__ */ new Set([
  "rank",
  "score",
  "cpc"
]);
function getSortSearchUpdate(nextSort, nextOrder) {
  return {
    sort: toSortSearchParam(nextSort),
    order: toSortOrderSearchParam(nextSort, nextOrder),
    page: void 0
  };
}
function getLocationSearchUpdate(nextLocationCode, defaultLocationCode) {
  return {
    loc: nextLocationCode === defaultLocationCode ? void 0 : nextLocationCode,
    page: void 0
  };
}
function getPageSearchUpdate(nextPage) {
  const safe = Math.max(1, Math.floor(nextPage));
  return { page: safe === 1 ? void 0 : safe };
}
function getPageSizeSearchUpdate(nextSize) {
  return {
    size: nextSize === DEFAULT_DOMAIN_KEYWORDS_PAGE_SIZE ? void 0 : nextSize,
    page: void 0
  };
}
function getTabSearchUpdate(nextTab, currentSort) {
  if (nextTab === "keywords") {
    return { tab: void 0, page: void 0 };
  }
  const fallbackSortNeeded = KEYWORDS_ONLY_SORTS.has(currentSort);
  const update = {
    tab: "pages",
    page: void 0
  };
  if (fallbackSortNeeded) {
    update.sort = "traffic";
    update.order = getDefaultSortOrder("traffic");
  }
  return update;
}
function getHistorySearchUpdate(item, defaultLocationCode) {
  const historyLocation = item.locationCode != null && isLabsLocationCode(item.locationCode) ? item.locationCode : defaultLocationCode;
  return {
    ...buildDomainFiltersClearSearchUpdate(),
    domain: item.domain,
    scope: toScopeSearchParam(item.domain, item.scope),
    subdomains: void 0,
    sort: toSortSearchParam(item.sort),
    order: void 0,
    tab: item.tab === "keywords" ? void 0 : item.tab,
    loc: historyLocation === defaultLocationCode ? void 0 : historyLocation,
    size: void 0
  };
}
function getSearchSubmitUpdate({
  domain,
  scope,
  sort,
  locationCode,
  currentOrder,
  activeTab,
  defaultLocationCode
}) {
  return {
    ...buildDomainFiltersClearSearchUpdate(),
    domain,
    scope: toScopeSearchParam(domain, scope),
    subdomains: void 0,
    sort: toSortSearchParam(sort),
    order: toSortOrderSearchParam(sort, currentOrder),
    tab: activeTab === "keywords" ? void 0 : activeTab,
    loc: locationCode === defaultLocationCode ? void 0 : locationCode,
    size: void 0
  };
}
function useDomainOverviewState({
  navigate,
  routeState,
  projectId
}) {
  const lastTrackedKey = useRef("");
  const userPickedScope = useRef(false);
  const {
    history,
    isLoaded: historyLoaded,
    addSearch,
    removeHistoryItem
  } = useDomainSearchHistory(projectId);
  const setSearchParams = useCallback(
    (updates) => {
      navigate({
        search: (prev) => ({ ...prev, ...updates }),
        replace: true
      });
    },
    [navigate]
  );
  const applySort = useCallback(
    (nextSort, nextOrder) => {
      setSearchParams(getSortSearchUpdate(nextSort, nextOrder));
    },
    [setSearchParams]
  );
  const applyLocationChange = useCallback(
    (nextLocationCode) => {
      setSearchParams(
        getLocationSearchUpdate(
          nextLocationCode,
          routeState.defaultLocationCode
        )
      );
    },
    [routeState.defaultLocationCode, setSearchParams]
  );
  const handleSortColumnClick = useCallback(
    (nextSort) => {
      const nextOrder = nextSort === routeState.sort ? routeState.order === "asc" ? "desc" : "asc" : getDefaultSortOrder(nextSort);
      applySort(nextSort, nextOrder);
    },
    [applySort, routeState.order, routeState.sort]
  );
  const goToPage = useCallback(
    (nextPage) => {
      setSearchParams(getPageSearchUpdate(nextPage));
    },
    [setSearchParams]
  );
  const setPageSize = useCallback(
    (nextSize) => {
      setSearchParams(getPageSizeSearchUpdate(nextSize));
    },
    [setSearchParams]
  );
  const handleTabChange = useCallback(
    (nextTab) => {
      setSearchParams(getTabSearchUpdate(nextTab, routeState.sort));
    },
    [routeState.sort, setSearchParams]
  );
  const handleHistorySelect = useCallback(
    (item) => {
      setSearchParams(
        getHistorySearchUpdate(item, routeState.defaultLocationCode)
      );
    },
    [routeState.defaultLocationCode, setSearchParams]
  );
  const overviewQuery = useDomainOverviewQuery({
    projectId,
    domain: routeState.domain,
    scope: routeState.scope,
    locationCode: routeState.sentLocationCode
  });
  const overview = overviewQuery.data ?? null;
  const isLoading = routeState.domain.trim() !== "" && overviewQuery.isLoading;
  const controlsForm = useForm({
    defaultValues: {
      domain: routeState.domain,
      scope: routeState.scope,
      sort: routeState.sort,
      locationCode: routeState.locationCode
    },
    validators: {
      onChange: ({ formApi, value }) => getDomainSearchChangeValidationErrors(
        value,
        shouldValidateFieldOnChange(formApi, "domain"),
        formApi.state.submissionAttempts > 0
      ),
      onSubmit: ({ value }) => getDomainSearchValidationErrors(value)
    },
    onSubmit: ({ formApi, value }) => {
      const parsed = parseResearchTarget(value.domain, value.scope);
      if (!parsed.ok) return;
      const target = parsed.target;
      formApi.setFieldValue("domain", target.display);
      formApi.setFieldValue("scope", target.scope);
      setSearchParams(
        getSearchSubmitUpdate({
          domain: target.display,
          scope: target.scope,
          sort: value.sort,
          locationCode: value.locationCode,
          currentOrder: routeState.order,
          activeTab: routeState.tab,
          defaultLocationCode: routeState.defaultLocationCode
        })
      );
    }
  });
  useEffect(() => {
    userPickedScope.current = false;
    controlsForm.reset({
      domain: routeState.domain,
      scope: routeState.scope,
      sort: routeState.sort,
      locationCode: routeState.locationCode
    });
  }, [
    controlsForm,
    routeState.domain,
    routeState.locationCode,
    routeState.scope,
    routeState.sort
  ]);
  const handleDomainChange = useCallback(
    (nextDomain) => {
      if (userPickedScope.current) return;
      const path = getResearchInputPath(nextDomain);
      const nextScope = defaultScopeForPath(path);
      if (nextScope !== controlsForm.getFieldValue("scope")) {
        controlsForm.setFieldValue("scope", nextScope);
      }
    },
    [controlsForm]
  );
  const handleScopeChange = useCallback(() => {
    userPickedScope.current = true;
  }, []);
  useEffect(() => {
    controlsForm.setErrorMap({
      onSubmit: overviewQuery.error ? createFormValidationErrors({
        form: getStandardErrorMessage(
          overviewQuery.error,
          "Lookup failed."
        )
      }) : void 0
    });
  }, [controlsForm, overviewQuery.error]);
  useEffect(() => {
    if (!overviewQuery.isSuccess || !overview) return;
    const key = `${routeState.domain}|${routeState.scope}|${routeState.locationCode}`;
    if (lastTrackedKey.current === key) return;
    lastTrackedKey.current = key;
    captureClientEvent("domain_overview:search_complete", {
      sort_mode: routeState.sort,
      scope: routeState.scope,
      result_count: overview.organicKeywords ?? 0,
      location_code: routeState.locationCode
    });
    addSearch({
      domain: routeState.domain,
      scope: routeState.scope,
      sort: routeState.sort,
      tab: routeState.tab,
      locationCode: routeState.locationCode
    });
    if (!overview.hasData) {
      toast.info("Not enough data for this domain");
    }
  }, [
    addSearch,
    overview,
    overviewQuery.isSuccess,
    routeState.domain,
    routeState.locationCode,
    routeState.scope,
    routeState.sort,
    routeState.tab
  ]);
  useEffect(() => {
    if (routeState.domain.trim() !== "") return;
    lastTrackedKey.current = "";
  }, [routeState.domain]);
  const controlsLocationCode = useStore(
    controlsForm.store,
    (s) => s.values.locationCode
  );
  const canSaveKeywords = useMemo(
    () => controlsLocationCode === routeState.locationCode && overview !== null && overview.hasData,
    [controlsLocationCode, overview, routeState.locationCode]
  );
  const handleSearchSubmit = useCallback(
    (event) => {
      event.preventDefault();
      void controlsForm.handleSubmit();
    },
    [controlsForm]
  );
  return {
    controlsForm,
    isLoading,
    overview,
    canSaveKeywords,
    history,
    historyLoaded,
    removeHistoryItem,
    setSearchParams,
    applySort,
    applyLocationChange,
    handleDomainChange,
    handleScopeChange,
    handleTabChange,
    handleSortColumnClick,
    handleHistorySelect,
    handleSearchSubmit,
    goToPage,
    setPageSize
  };
}
function DomainOverviewPage({
  projectId,
  routeState,
  navigate,
  onShowRecentSearches
}) {
  const state = useDomainOverviewState({
    navigate,
    routeState,
    projectId
  });
  const urlTabInput = useMemo(() => {
    if (routeState.domain.trim() === "") return null;
    return {
      type: "domain",
      domain: routeState.domain,
      scope: routeState.scope,
      locationCode: routeState.sentLocationCode
    };
  }, [routeState.domain, routeState.scope, routeState.sentLocationCode]);
  const navigateToSearchTab = useCallback(
    (input) => {
      if (input?.type !== "domain") {
        navigate({
          search: () => ({}),
          replace: true
        });
        return;
      }
      navigate({
        search: (prev) => ({
          ...prev,
          ...buildDomainFiltersClearSearchUpdate(),
          domain: input.domain,
          scope: toScopeSearchParam(input.domain, input.scope),
          subdomains: void 0,
          sort: void 0,
          order: void 0,
          tab: void 0,
          page: void 0,
          loc: input.locationCode,
          size: void 0
        }),
        replace: true
      });
    },
    [navigate]
  );
  const searchTabs = useSearchTabNavigation({
    storageKey: `domain:${projectId}`,
    urlInput: urlTabInput,
    getLabel: useCallback(
      (input) => {
        if (input.type !== "domain") return "";
        const locationSuffix = input.locationCode == null || input.locationCode === routeState.defaultLocationCode ? "" : ` ${LOCATIONS[input.locationCode] ?? input.locationCode}`;
        return `${input.domain}${locationSuffix}`;
      },
      [routeState.defaultLocationCode]
    ),
    navigateToInput: navigateToSearchTab
  });
  const overviewMetricsHint = state.overview && state.overview.scope !== "subdomains" ? "Whole domain incl. subdomains" : void 0;
  const tabControls = routeState.domain ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
    /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        className: "btn btn-ghost btn-sm gap-2 px-0 text-base-content/70 hover:bg-transparent",
        onClick: () => {
          searchTabs.setActiveTab(null);
          onShowRecentSearches();
        },
        children: [
          /* @__PURE__ */ jsx(ArrowLeft, { className: "size-4" }),
          "Recent searches"
        ]
      }
    ) }),
    /* @__PURE__ */ jsx(
      SearchTabStrip,
      {
        projectId,
        activeTabId: searchTabs.activeTabId,
        tabs: searchTabs.tabs,
        onSelect: searchTabs.selectTab,
        onClose: searchTabs.closeTab,
        onViewed: searchTabs.markTabViewed
      }
    )
  ] }) : null;
  return /* @__PURE__ */ jsx("div", { className: "px-4 py-4 md:px-6 md:py-6 pb-24 md:pb-8 overflow-auto", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-7xl space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold", children: "Domain Overview" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-base-content/70", children: "Analyze any domain's SEO profile: traffic, keywords, and backlinks." })
    ] }),
    /* @__PURE__ */ jsx(
      DomainSearchCard,
      {
        controlsForm: state.controlsForm,
        isLoading: state.isLoading,
        onSubmit: state.handleSearchSubmit,
        onDomainChange: state.handleDomainChange,
        onScopeChange: state.handleScopeChange,
        onSortChange: (sort) => state.applySort(sort, getDefaultSortOrder(sort)),
        onLocationChange: (locationCode) => state.applyLocationChange(locationCode)
      }
    ),
    state.isLoading ? /* @__PURE__ */ jsxs(Fragment, { children: [
      tabControls,
      /* @__PURE__ */ jsx(DomainOverviewLoadingState, {})
    ] }) : state.overview === null ? /* @__PURE__ */ jsx("div", { className: "space-y-4 pt-1", children: /* @__PURE__ */ jsx(
      DomainHistorySection,
      {
        history: state.history,
        historyLoaded: state.historyLoaded,
        onRemoveHistoryItem: state.removeHistoryItem,
        onSelectHistoryItem: state.handleHistorySelect
      }
    ) }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      tabControls,
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsx("span", { className: "badge badge-ghost font-medium", children: state.overview.displayTarget }),
        /* @__PURE__ */ jsx("span", { className: "badge badge-outline", children: RESEARCH_SCOPE_LABELS[state.overview.scope] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsx(
          StatCard,
          {
            label: "Estimated Organic Traffic",
            value: formatMetric(
              state.overview.organicTraffic,
              state.overview.hasData
            ),
            hint: overviewMetricsHint
          }
        ),
        /* @__PURE__ */ jsx(
          StatCard,
          {
            label: "Organic Keywords",
            value: formatMetric(
              state.overview.organicKeywords,
              state.overview.hasData
            ),
            hint: overviewMetricsHint
          }
        )
      ] }),
      !state.overview.hasData ? /* @__PURE__ */ jsx("div", { className: "alert alert-info", children: /* @__PURE__ */ jsx("span", { children: "Not enough data for this scope yet. Try another domain or a broader scope." }) }) : null,
      /* @__PURE__ */ jsxs("div", { className: "border border-base-300 rounded-xl bg-base-100 overflow-hidden", children: [
        /* @__PURE__ */ jsx("div", { className: "flex flex-col lg:flex-row lg:items-center justify-between gap-3 px-4 py-3 border-b border-base-300", children: /* @__PURE__ */ jsxs("div", { role: "tablist", className: "tabs tabs-border w-fit", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              role: "tab",
              "aria-selected": routeState.tab === "keywords",
              className: `tab ${routeState.tab === "keywords" ? "tab-active" : ""}`,
              onClick: () => state.handleTabChange("keywords"),
              children: "Top Keywords"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              role: "tab",
              "aria-selected": routeState.tab === "pages",
              className: `tab ${routeState.tab === "pages" ? "tab-active" : ""}`,
              onClick: () => state.handleTabChange("pages"),
              children: "Top Pages"
            }
          )
        ] }) }),
        routeState.tab === "keywords" ? /* @__PURE__ */ jsx(
          KeywordsTab,
          {
            projectId,
            target: state.overview.displayTarget,
            hostname: state.overview.domain,
            scope: state.overview.scope,
            routeState,
            canSaveKeywords: state.canSaveKeywords,
            setSearchParams: state.setSearchParams,
            onSortClick: state.handleSortColumnClick,
            onPageChange: state.goToPage,
            onPageSizeChange: state.setPageSize
          },
          "keywords"
        ) : /* @__PURE__ */ jsx(
          PagesTab,
          {
            projectId,
            target: state.overview.displayTarget,
            hostname: state.overview.domain,
            scope: state.overview.scope,
            routeState,
            setSearchParams: state.setSearchParams,
            onSortClick: state.handleSortColumnClick,
            onPageChange: state.goToPage,
            onPageSizeChange: state.setPageSize
          },
          "pages"
        )
      ] })
    ] })
  ] }) });
}
function resolveScope(search) {
  const path = getResearchInputPath(search.domain ?? "");
  if (search.scope && isScopeAllowedForInput(search.scope, path)) {
    return search.scope;
  }
  if (search.subdomains != null) {
    return search.subdomains ? "subdomains" : "domain";
  }
  return defaultScopeForPath(path);
}
function numberToFilterString(value) {
  if (value == null || !Number.isFinite(value)) return "";
  return String(value);
}
function getDomainRouteState(search, projectMarket) {
  const normalizedSort = toSortMode(search.sort ?? null) ?? "traffic";
  const defaultLocationCode = projectMarket && isLabsLocationCode(projectMarket.locationCode) ? projectMarket.locationCode : DEFAULT_LOCATION_CODE;
  const normalizedLocationCode = search.loc != null && isLabsLocationCode(search.loc) ? search.loc : defaultLocationCode;
  return {
    domain: search.domain ?? "",
    scope: resolveScope(search),
    sort: normalizedSort,
    order: resolveSortOrder(normalizedSort, toSortOrder(search.order ?? null)),
    tab: search.tab ?? "keywords",
    defaultLocationCode,
    locationCode: normalizedLocationCode,
    sentLocationCode: search.loc,
    page: search.page != null && search.page > 0 ? search.page : 1,
    pageSize: search.size ?? DEFAULT_DOMAIN_KEYWORDS_PAGE_SIZE,
    appliedFilters: {
      include: search.include ?? EMPTY_DOMAIN_FILTERS.include,
      exclude: search.exclude ?? EMPTY_DOMAIN_FILTERS.exclude,
      minTraffic: numberToFilterString(search.minTraffic),
      maxTraffic: numberToFilterString(search.maxTraffic),
      minVol: numberToFilterString(search.minVol),
      maxVol: numberToFilterString(search.maxVol),
      minCpc: numberToFilterString(search.minCpc),
      maxCpc: numberToFilterString(search.maxCpc),
      minKd: numberToFilterString(search.minKd),
      maxKd: numberToFilterString(search.maxKd),
      minRank: numberToFilterString(search.minRank),
      maxRank: numberToFilterString(search.maxRank)
    },
    appliedPageFilters: {
      include: search.pInclude ?? EMPTY_DOMAIN_FILTERS.include,
      exclude: search.pExclude ?? EMPTY_DOMAIN_FILTERS.exclude,
      minTraffic: numberToFilterString(search.pMinTraffic),
      maxTraffic: numberToFilterString(search.pMaxTraffic),
      minVol: numberToFilterString(search.pMinVol),
      maxVol: numberToFilterString(search.pMaxVol)
    },
    hasAppliedKeywordFilters: hasKeywordSearchFilters(search),
    hasAppliedPageFilters: hasPageSearchFilters(search)
  };
}
function hasKeywordSearchFilters(search) {
  return KEYWORD_FILTER_FIELDS.some(
    (key) => search[key] != null
  );
}
function hasPageSearchFilters(search) {
  return PAGE_FILTER_FIELDS.some(
    (key) => search[PAGE_SEARCH_PARAM_BY_FIELD[key]] != null
  );
}
function DomainOverviewRoute() {
  const {
    projectId
  } = Route.useParams();
  const navigate = useNavigate({
    from: Route.fullPath
  });
  const search = Route.useSearch();
  const projectMarket = useProjectMarket(projectId);
  const routeState = getDomainRouteState(search, projectMarket);
  return /* @__PURE__ */ jsx(DomainOverviewPage, { projectId, onShowRecentSearches: () => {
    void navigate({
      search: () => ({}),
      replace: true
    });
  }, navigate, routeState });
}
export {
  DomainOverviewRoute as component
};
