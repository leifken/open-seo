import { jsxs, jsx } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Sheet, ExternalLink, ChevronLeft, ChevronRight, Globe, History, Clock, X, Search, SlidersHorizontal, Download, ChevronDown, FileDown, Save, RotateCcw, Info, ArrowLeft, AlertCircle } from "lucide-react";
import { a8 as exportTableToSheets, ap as formatNumber, B as scoreTierClass, aq as shouldValidateFieldOnChange, ar as createFormValidationErrors, ak as parseTerms, o as getStandardErrorMessage, c as captureClientEvent, a2 as useSelectionAnchor, K as makeSelectionColumn, as as SortHeader, a3 as useAppTable, a4 as AppDataTable, at as AreaTrendChart, a5 as TableBulkActionBar, a6 as TableBulkActionButton, am as TableBulkExportMenu, f as getFieldError, au as isResultLimit, av as normalizeKeywordMode, p as getErrorCode, aw as Route, ax as normalizeSortDir, ay as normalizeSortField } from "./router-CFUJAOTG.js";
import { aW as jsonCodec, aG as DEFAULT_LOCATION_CODE, a7 as isSupportedLocationCode, bt as LOCATIONS, c5 as isLabsLocationCode, bq as BILLING_ROUTE } from "../entry.js";
import { useForm, useStore } from "@tanstack/react-form";
import { p as parseKeywordInput, b as buildKeywordSearchKey, g as getNextSortParams, u as useSaveAndExportActions, k as keywordResearchExportRow, K as KEYWORD_RESEARCH_HEADERS, d as downloadKeywordResearchCsv } from "./keywordControllerActions-B5s4B91s.js";
import { sortBy } from "remeda";
import { z } from "zod";
import { u as useKeywordResearchData, a as useSearchTabNavigation, t as tabInputKey, S as SearchTabStrip } from "./useSearchTabNavigation-DcT5d5P6.js";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { f as getSerpAnalysis, s as saveKeywords } from "./keywords-7hmfv47m.js";
import { u as useLocalHistoryStore } from "./useLocalHistoryStore-CAiu5gzu.js";
import { u as useProjectMarket } from "./useProjectMarket-D9zlqQGO.js";
import { I as IntentBadge, a as INTENT_LABELS } from "./IntentBadge-DhvAHZUw.js";
import { createColumnHelper } from "@tanstack/react-table";
import { D as DifficultyBadge } from "./DifficultyBadge-BWAqA-J9.js";
import { L as LocationSelect } from "./LocationSelect-BPALgSkR.js";
import "./middleware-CwR3-L1M.js";
import "@tanstack/query-core";
import "./selfHostedOAuth-BpCugic0.js";
import "drizzle-orm";
import "jose";
import "./ai-search-B6IOR0fs.js";
import "./audit-D01_HjiI.js";
import "autumn-js/react";
import "react-dom";
import "sonner";
import "@better-auth/api-key/client";
import "papaparse";
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
import "./domain-BmUvf1XM.js";
import "./projects-yHwpio5P.js";
function ExportToSheetsButton({
  headers,
  rows,
  feature,
  disabled,
  label = "Export to Sheets",
  iconOnly,
  className
}) {
  const [busy, setBusy] = useState(false);
  const handleClick = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await exportTableToSheets({ headers, rows, feature });
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ jsxs(
    "button",
    {
      type: "button",
      className: `btn btn-ghost btn-xs gap-1 ${className ?? ""}`,
      onClick: handleClick,
      disabled: disabled || rows.length === 0 || busy,
      title: "Copy table and open a new Google Sheet",
      "aria-label": iconOnly ? "Export to Sheets" : void 0,
      children: [
        /* @__PURE__ */ jsx(Sheet, { className: "size-3.5" }),
        iconOnly ? null : label
      ]
    }
  );
}
function SerpAnalysisCard({
  items,
  keyword,
  loading,
  error,
  onRetry,
  page,
  pageSize,
  onPageChange
}) {
  const totalPages = Math.ceil(items.length / pageSize);
  const pageItems = items.slice(page * pageSize, (page + 1) * pageSize);
  if (loading) return /* @__PURE__ */ jsx(SerpAnalysisLoadingState, {});
  if (error) {
    return /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-error/30 bg-error/10 p-3 text-sm text-error space-y-2", children: [
      /* @__PURE__ */ jsx("p", { children: error }),
      onRetry ? /* @__PURE__ */ jsx("button", { className: "btn btn-xs", onClick: onRetry, children: "Retry" }) : null
    ] });
  }
  if (items.length === 0) return /* @__PURE__ */ jsx(SerpAnalysisEmptyState, { keyword });
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-xs text-base-content/50", children: [
        items.length,
        " organic results"
      ] }),
      /* @__PURE__ */ jsx(
        ExportToSheetsButton,
        {
          headers: ["Rank", "Title", "URL", "Domain"],
          rows: items.map((item) => [
            item.rank,
            item.title ?? "",
            item.url,
            item.domain
          ]),
          feature: "serp_analysis"
        }
      )
    ] }),
    /* @__PURE__ */ jsx(SerpAnalysisTable, { items: pageItems }),
    /* @__PURE__ */ jsx(
      SerpAnalysisPagination,
      {
        page,
        totalPages,
        onPageChange
      }
    )
  ] });
}
function SerpAnalysisTable({ items }) {
  return /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "table table-xs w-full", children: [
    /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "text-xs text-base-content/60", children: [
      /* @__PURE__ */ jsx("th", { className: "w-8", children: "#" }),
      /* @__PURE__ */ jsx("th", { children: "Page" })
    ] }) }),
    /* @__PURE__ */ jsx("tbody", { children: items.map((item) => /* @__PURE__ */ jsxs(
      "tr",
      {
        className: "hover:bg-base-200/50",
        children: [
          /* @__PURE__ */ jsx("td", { className: "font-mono text-base-content/50 text-xs", children: item.rank }),
          /* @__PURE__ */ jsx("td", { className: "min-w-0 max-w-0", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-0.5", children: [
            /* @__PURE__ */ jsxs(
              "a",
              {
                href: item.url,
                target: "_blank",
                rel: "noopener noreferrer",
                className: "font-medium text-primary hover:underline truncate flex items-center gap-1",
                title: item.title,
                children: [
                  item.title || item.url,
                  /* @__PURE__ */ jsx(ExternalLink, { className: "size-3 shrink-0 opacity-40" })
                ]
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "text-xs text-base-content/40 truncate", children: item.domain })
          ] }) })
        ]
      },
      `${item.rank}-${item.url}`
    )) })
  ] }) });
}
function SerpAnalysisPagination({
  page,
  totalPages,
  onPageChange
}) {
  if (totalPages <= 1) return null;
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mt-3 pt-3 border-t border-base-200", children: [
    /* @__PURE__ */ jsxs("span", { className: "text-xs text-base-content/50", children: [
      "Page ",
      page + 1,
      " of ",
      totalPages
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-1", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          className: "btn btn-ghost btn-xs",
          disabled: page === 0,
          onClick: () => onPageChange(page - 1),
          children: [
            /* @__PURE__ */ jsx(ChevronLeft, { className: "size-3.5" }),
            "Prev"
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          className: "btn btn-ghost btn-xs",
          disabled: page >= totalPages - 1,
          onClick: () => onPageChange(page + 1),
          children: [
            "Next",
            /* @__PURE__ */ jsx(ChevronRight, { className: "size-3.5" })
          ]
        }
      )
    ] })
  ] });
}
function SerpAnalysisLoadingState() {
  return /* @__PURE__ */ jsx("div", { className: "space-y-2", children: Array.from({ length: 8 }).map((_, index) => /* @__PURE__ */ jsx(
    "div",
    {
      className: "h-8 rounded bg-base-200 animate-pulse",
      style: { animationDelay: `${index * 50}ms` }
    },
    index
  )) });
}
function SerpAnalysisEmptyState({ keyword }) {
  return /* @__PURE__ */ jsxs("div", { className: "text-sm text-base-content/50 text-center py-8", children: [
    /* @__PURE__ */ jsx("p", { children: "No SERP details available for this keyword yet." }),
    keyword ? /* @__PURE__ */ jsx("p", { className: "mt-1", children: "Try clicking another keyword to load data." }) : null
  ] });
}
function OverviewStats({ keyword }) {
  return /* @__PURE__ */ jsxs("div", { className: "shrink-0 bg-base-100 border border-base-300 rounded-xl px-4 py-2.5 flex items-center gap-4 min-h-[48px]", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 min-w-0 shrink-0", children: [
      /* @__PURE__ */ jsx("span", { className: "font-bold text-base truncate max-w-[240px] capitalize", children: keyword.keyword }),
      /* @__PURE__ */ jsx(ScoreBadge, { value: keyword.keywordDifficulty })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "w-px h-6 bg-base-300 shrink-0" }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 text-sm flex-wrap min-w-0", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsx("span", { className: "text-base-content/50", children: "Vol" }),
        /* @__PURE__ */ jsx("span", { className: "font-semibold tabular-nums", children: formatNumber(keyword.searchVolume) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsx("span", { className: "text-base-content/50", children: "CPC" }),
        /* @__PURE__ */ jsx("span", { className: "font-semibold tabular-nums", children: keyword.cpc == null ? "-" : `$${keyword.cpc.toFixed(2)}` })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsx("span", { className: "text-base-content/50", children: "Comp" }),
        /* @__PURE__ */ jsx("span", { className: "font-semibold tabular-nums", children: keyword.competition == null ? "-" : keyword.competition.toFixed(2) })
      ] }),
      /* @__PURE__ */ jsx(IntentBadge, { intent: keyword.intent })
    ] })
  ] });
}
function ScoreBadge({ value }) {
  if (value == null) return null;
  const tierClass = scoreTierClass(value);
  return /* @__PURE__ */ jsx(
    "span",
    {
      className: `score-badge ${tierClass} inline-flex items-center justify-center rounded-full size-6 text-[10px] font-semibold`,
      children: value
    }
  );
}
const MAX_KEYWORDS_PER_SUBMIT = 5;
const RESULT_LIMITS = [150, 300, 500];
const EMPTY_FILTERS = {
  include: "",
  exclude: "",
  minVol: "",
  maxVol: "",
  minCpc: "",
  maxCpc: "",
  minKd: "",
  maxKd: "",
  intents: ""
};
const KEYWORD_INTENT_ORDER = [
  "informational",
  "commercial",
  "transactional",
  "navigational",
  "unknown"
];
const KEYWORD_INTENT_SET = new Set(KEYWORD_INTENT_ORDER);
function parseIntentFilter(value) {
  if (!value) return [];
  const selected = new Set(
    value.split(",").map((part) => part.trim()).filter((part) => KEYWORD_INTENT_SET.has(part))
  );
  return KEYWORD_INTENT_ORDER.filter((intent) => selected.has(intent));
}
function toggleIntentFilter(value, intent) {
  const selected = new Set(parseIntentFilter(value));
  if (selected.has(intent)) {
    selected.delete(intent);
  } else {
    selected.add(intent);
  }
  return KEYWORD_INTENT_ORDER.filter((item) => selected.has(item)).join(",");
}
function getKeywordSearchValidationErrors(value, shouldValidateUntouchedField, validateEmptyKeyword) {
  const keywords = parseKeywordInput(value.keyword);
  if (keywords.length === 0) {
    if (!validateEmptyKeyword) return null;
    return createFormValidationErrors({
      fields: {
        keyword: "Please enter at least one keyword."
      }
    });
  }
  if (!shouldValidateUntouchedField) return null;
  if (keywords.length > MAX_KEYWORDS_PER_SUBMIT) {
    return createFormValidationErrors({
      fields: {
        keyword: `Please enter no more than ${MAX_KEYWORDS_PER_SUBMIT} keywords (one per line).`
      }
    });
  }
  return null;
}
function useKeywordControlsForm(input, onSubmit) {
  const form = useForm({
    defaultValues: {
      keyword: input.keywordInput,
      locationCode: input.locationCode,
      resultLimit: input.resultLimit,
      mode: input.keywordMode,
      clickstream: input.clickstream
    },
    validators: {
      onChange: ({ formApi, value }) => getKeywordSearchValidationErrors(
        value,
        shouldValidateFieldOnChange(formApi, "keyword"),
        false
      ),
      onSubmit: ({ value }) => getKeywordSearchValidationErrors(value, true, true)
    },
    onSubmit: ({ value }) => {
      onSubmit(value);
    }
  });
  useEffect(() => {
    form.reset({
      keyword: input.keywordInput,
      locationCode: input.locationCode,
      resultLimit: input.resultLimit,
      mode: input.keywordMode,
      clickstream: input.clickstream
    });
  }, [
    form,
    input.keywordInput,
    input.keywordMode,
    input.locationCode,
    input.resultLimit,
    input.clickstream
  ]);
  return form;
}
function applyKeywordFiltersAndSort(params) {
  const includeTerms = parseTerms(params.filters.include);
  const excludeTerms = parseTerms(params.filters.exclude);
  const selectedIntents = parseIntentFilter(params.filters.intents);
  const filtered = params.rows.filter((row) => {
    const haystack = row.keyword.toLowerCase();
    if (includeTerms.length > 0 && !includeTerms.every((term) => haystack.includes(term))) {
      return false;
    }
    if (excludeTerms.some((term) => haystack.includes(term))) {
      return false;
    }
    if (selectedIntents.length > 0 && !selectedIntents.includes(row.intent)) {
      return false;
    }
    const vol = row.searchVolume ?? 0;
    const cpc = row.cpc ?? 0;
    const kd = row.keywordDifficulty ?? 0;
    if (params.filters.minVol && vol < Number(params.filters.minVol))
      return false;
    if (params.filters.maxVol && vol > Number(params.filters.maxVol))
      return false;
    if (params.filters.minCpc && cpc < Number(params.filters.minCpc))
      return false;
    if (params.filters.maxCpc && cpc > Number(params.filters.maxCpc))
      return false;
    if (params.filters.minKd && kd < Number(params.filters.minKd)) return false;
    if (params.filters.maxKd && kd > Number(params.filters.maxKd)) return false;
    return true;
  });
  if (params.sortField === "keyword") {
    return sortBy(filtered, [(row) => row.keyword, params.sortDir]);
  }
  if (params.sortField === "searchVolume") {
    return sortBy(filtered, [(row) => row.searchVolume ?? -1, params.sortDir]);
  }
  if (params.sortField === "cpc") {
    return sortBy(filtered, [(row) => row.cpc ?? -1, params.sortDir]);
  }
  if (params.sortField === "competition") {
    return sortBy(filtered, [(row) => row.competition ?? -1, params.sortDir]);
  }
  return sortBy(filtered, [
    (row) => row.keywordDifficulty ?? -1,
    params.sortDir
  ]);
}
function useKeywordFiltering(params) {
  const filteredRows = useMemo(
    () => applyKeywordFiltersAndSort({
      rows: params.rows,
      filters: params.filters,
      sortField: params.sortField,
      sortDir: params.sortDir
    }),
    [params.filters, params.rows, params.sortDir, params.sortField]
  );
  const activeFilterCount = useMemo(
    () => Object.values(params.filters).filter((value) => value.trim() !== "").length,
    [params.filters]
  );
  return {
    filteredRows,
    activeFilterCount
  };
}
const STORAGE_KEY = "keyword-default-filters";
const filterValuesSchema = z.object({
  include: z.string(),
  exclude: z.string(),
  minVol: z.string(),
  maxVol: z.string(),
  minCpc: z.string(),
  maxCpc: z.string(),
  minKd: z.string(),
  maxKd: z.string(),
  // Defaulted so filter blobs persisted before the intent filter existed still
  // parse (missing key -> "") instead of discarding the user's saved filters.
  intents: z.string().default("")
});
function loadFiltersFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_FILTERS;
    return filterValuesSchema.parse(JSON.parse(raw));
  } catch {
    return EMPTY_FILTERS;
  }
}
function saveFiltersToStorage(filters) {
  try {
    const hasAnyFilter = Object.values(filters).some((v) => v.trim() !== "");
    if (hasAnyFilter) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
  }
}
function useLocalKeywordFilters() {
  const filtersForm = useForm({
    defaultValues: loadFiltersFromStorage()
  });
  const values = useStore(filtersForm.store, (s) => s.values);
  useEffect(() => {
    saveFiltersToStorage(values);
  }, [values]);
  const resetFilters = useCallback(() => {
    const keys = [
      "include",
      "exclude",
      "minVol",
      "maxVol",
      "minCpc",
      "maxCpc",
      "minKd",
      "maxKd",
      "intents"
    ];
    for (const key of keys) {
      filtersForm.setFieldValue(key, "");
    }
  }, [filtersForm]);
  return {
    filtersForm,
    values,
    resetFilters
  };
}
function getNextSelectionSet(current, allVisibleKeywords) {
  const allVisibleSelected = allVisibleKeywords.length > 0 && allVisibleKeywords.every((keyword) => current.has(keyword));
  if (allVisibleSelected) {
    return /* @__PURE__ */ new Set();
  }
  return new Set(allVisibleKeywords);
}
function useKeywordSelection() {
  const [selectedRows, setSelectedRows] = useState(/* @__PURE__ */ new Set());
  const clearSelection = useCallback(() => {
    setSelectedRows(/* @__PURE__ */ new Set());
  }, []);
  const toggleRowSelection = useCallback((keyword) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(keyword)) next.delete(keyword);
      else next.add(keyword);
      return next;
    });
  }, []);
  const toggleAllRows = useCallback((allVisibleKeywords) => {
    setSelectedRows((prev) => getNextSelectionSet(prev, allVisibleKeywords));
  }, []);
  return {
    selectedRows,
    setSelectedRows,
    clearSelection,
    toggleRowSelection,
    toggleAllRows
  };
}
function useKeywordSerpAnalysis(projectId, locationCode) {
  const [serpKeyword, setSerpKeyword] = useState(null);
  const [serpPage, setSerpPage] = useState(0);
  const SERP_PAGE_SIZE = 10;
  const serpQuery = useQuery({
    queryKey: ["serpAnalysis", projectId, serpKeyword, locationCode],
    queryFn: () => getSerpAnalysis({
      data: {
        projectId,
        keyword: serpKeyword,
        locationCode
      }
    }),
    enabled: !!serpKeyword
  });
  const serpResults = serpQuery.data?.items ?? [];
  const activeSerpKeyword = serpKeyword ?? serpQuery.data?.requestedKeyword ?? null;
  const serpLoading = !!serpKeyword && serpQuery.isLoading;
  const serpError = serpQuery.isError ? getStandardErrorMessage(serpQuery.error, "Failed to load SERP data.") : null;
  return {
    serpKeyword,
    setSerpKeyword,
    serpPage,
    setSerpPage,
    SERP_PAGE_SIZE,
    serpQuery,
    serpResults,
    activeSerpKeyword,
    serpLoading,
    serpError
  };
}
const MAX_HISTORY = 20;
const searchHistoryItemSchema = z.object({
  keyword: z.string(),
  locationCode: z.number(),
  locationName: z.string(),
  timestamp: z.number()
});
const searchHistorySchema = z.array(searchHistoryItemSchema);
const searchHistoryCodec = jsonCodec(searchHistorySchema);
function useSearchHistory(projectId) {
  const { history, isLoaded, addItem, removeItem, clearItems } = useLocalHistoryStore({
    storageKey: `search-history:${projectId}`,
    maxItems: MAX_HISTORY,
    parse: (raw) => {
      const parsed = searchHistoryCodec.safeParse(raw);
      return parsed.success ? parsed.data : null;
    },
    isSameItem: (existing, next) => existing.keyword === next.keyword && existing.locationCode === next.locationCode,
    createItem: (item) => ({
      ...item,
      timestamp: Date.now()
    }),
    getItemKey: (item) => item.timestamp
  });
  return {
    history,
    isLoaded,
    addSearch: (keyword, locationCode, locationName) => addItem({ keyword, locationCode, locationName }),
    clearHistory: clearItems,
    removeHistoryItem: removeItem
  };
}
const storageKey = (projectId) => `keyword-preferred-location:${projectId}`;
const locationCodeSchema = z.number().int().positive();
function loadPreferredLocationCode(projectId) {
  try {
    const raw = localStorage.getItem(storageKey(projectId));
    if (!raw) return null;
    const parsed = locationCodeSchema.parse(JSON.parse(raw));
    return isSupportedLocationCode(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
function savePreferredLocationCode(projectId, locationCode) {
  try {
    localStorage.setItem(storageKey(projectId), JSON.stringify(locationCode));
  } catch {
  }
}
function usePreferredKeywordLocation(projectId, projectDefaultLocationCode) {
  const [preference, setPreference] = useState(() => ({
    projectId,
    locationCode: loadPreferredLocationCode(projectId)
  }));
  const chosenLocationCode = preference.projectId === projectId ? preference.locationCode : loadPreferredLocationCode(projectId);
  useEffect(() => {
    if (preference.projectId === projectId) return;
    setPreference({ projectId, locationCode: chosenLocationCode });
  }, [chosenLocationCode, preference.projectId, projectId]);
  const preferredLocationCode = chosenLocationCode ?? projectDefaultLocationCode ?? DEFAULT_LOCATION_CODE;
  function setPreferredLocationCode(locationCode) {
    if (!isSupportedLocationCode(locationCode)) return;
    setPreference({ projectId, locationCode });
    savePreferredLocationCode(projectId, locationCode);
  }
  return {
    preferredLocationCode,
    selectedLocationCode: chosenLocationCode ?? void 0,
    setPreferredLocationCode
  };
}
function useResolvedKeywordLocation(input) {
  const projectMarket = useProjectMarket(input.projectId);
  const {
    preferredLocationCode,
    selectedLocationCode,
    setPreferredLocationCode
  } = usePreferredKeywordLocation(input.projectId, projectMarket?.locationCode);
  const locationCode = input.locationCode ?? selectedLocationCode;
  const displayedLocationCode = input.locationCode ?? preferredLocationCode;
  return { locationCode, displayedLocationCode, setPreferredLocationCode };
}
function useKeywordUiState(initialShowFilters) {
  const [showFilters, setShowFilters] = useState(initialShowFilters);
  const [selectedKeyword, setSelectedKeyword] = useState(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [mobileTab, setMobileTab] = useState("keywords");
  return {
    mobileTab,
    selectedKeyword,
    setMobileTab,
    setSelectedKeyword,
    setShowFilters,
    setShowSaveDialog,
    showFilters,
    showSaveDialog
  };
}
function useKeywordSearchParams() {
  const navigate = useNavigate({ from: "/p/$projectId/keywords" });
  return useCallback(
    (updates) => {
      void navigate({
        search: (prev) => ({ ...prev, ...updates }),
        replace: true
      });
    },
    [navigate]
  );
}
function useKeywordSaveMutation(projectId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => saveKeywords({ data }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["savedKeywords", projectId]
      });
    }
  });
}
function useKeywordOverviewState({
  rows,
  searchedKeyword,
  selectedKeyword,
  hasSearched,
  isLoading,
  lastSearchError,
  keywordMode
}) {
  const hasExactMatchInResults = useMemo(() => {
    const normalizedSeed = searchedKeyword.trim().toLowerCase();
    if (!normalizedSeed || rows.length === 0) return false;
    return rows.some(
      (row) => row.keyword.trim().toLowerCase() === normalizedSeed
    );
  }, [rows, searchedKeyword]);
  const showApproximateMatchNotice = hasSearched && !isLoading && !lastSearchError && rows.length > 0 && searchedKeyword.trim() !== "" && !hasExactMatchInResults && keywordMode !== "auto";
  const overviewKeyword = useMemo(() => {
    if (selectedKeyword) return selectedKeyword;
    if (searchedKeyword && rows.length > 0) {
      const seed = rows.find(
        (row) => row.keyword.toLowerCase() === searchedKeyword.toLowerCase()
      );
      if (seed) return seed;
    }
    return rows.length > 0 ? rows[0] : null;
  }, [selectedKeyword, searchedKeyword, rows]);
  return { showApproximateMatchNotice, overviewKeyword };
}
function useKeywordResearchController(input) {
  const { displayedLocationCode, locationCode, setPreferredLocationCode } = input;
  const {
    filtersForm,
    values: filterValues,
    resetFilters
  } = useLocalKeywordFilters();
  const uiState = useKeywordUiState(
    Object.values(filterValues).some((v) => v.trim() !== "")
  );
  const {
    selectedRows,
    setSelectedRows,
    clearSelection,
    toggleRowSelection,
    toggleAllRows
  } = useKeywordSelection();
  const {
    setSerpKeyword,
    serpPage,
    setSerpPage,
    SERP_PAGE_SIZE,
    serpQuery,
    serpResults,
    activeSerpKeyword,
    serpLoading,
    serpError
  } = useKeywordSerpAnalysis(input.projectId, locationCode);
  const {
    history,
    isLoaded: historyLoaded,
    addSearch,
    removeHistoryItem
  } = useSearchHistory(input.projectId);
  const {
    rows,
    hasSearched,
    lastSearchError,
    lastResultSource,
    lastUsedFallback,
    lastSearchKeyword,
    lastSearchLocationCode,
    researchError,
    researchMutationError,
    researchQuery,
    searchedKeyword,
    isLoading,
    retryResearch
  } = useKeywordResearchData(
    {
      projectId: input.projectId,
      keywordInput: input.keywordInput,
      locationCode,
      displayedLocationCode,
      resultLimit: input.resultLimit,
      mode: input.keywordMode,
      clickstream: input.clickstream
    },
    addSearch
  );
  const setSearchParams = useKeywordSearchParams();
  const saveMutation = useKeywordSaveMutation(input.projectId);
  const activeSearchKey = input.keywordInput.trim() ? buildKeywordSearchKey({
    keyword: input.keywordInput,
    locationCode,
    resultLimit: input.resultLimit,
    mode: input.keywordMode,
    clickstream: input.clickstream
  }) : null;
  const previousSearchKeyRef = useRef(null);
  const handledSerpSearchKeyRef = useRef(null);
  const clearActiveKeywordResult = useCallback(() => {
    clearSelection();
    uiState.setSelectedKeyword(null);
    setSerpKeyword(null);
    setSerpPage(0);
  }, [clearSelection, setSerpKeyword, setSerpPage, uiState]);
  const onFormSubmit = input.onFormSubmit;
  const controlsForm = useKeywordControlsForm(
    {
      ...input,
      locationCode: displayedLocationCode
    },
    (value) => {
      setPreferredLocationCode(value.locationCode);
      onFormSubmit(value);
    }
  );
  useEffect(() => {
    if (activeSearchKey === previousSearchKeyRef.current) return;
    previousSearchKeyRef.current = activeSearchKey;
    handledSerpSearchKeyRef.current = null;
    clearActiveKeywordResult();
  }, [activeSearchKey, clearActiveKeywordResult]);
  useEffect(() => {
    if (!activeSearchKey || !researchQuery.isSuccess) return;
    if (handledSerpSearchKeyRef.current === activeSearchKey) return;
    handledSerpSearchKeyRef.current = activeSearchKey;
    setSerpKeyword(rows.length > 0 ? searchedKeyword : null);
    setSerpPage(0);
  }, [
    activeSearchKey,
    researchQuery.isSuccess,
    rows.length,
    searchedKeyword,
    setSerpKeyword,
    setSerpPage
  ]);
  const { filteredRows, activeFilterCount } = useKeywordFiltering({
    rows,
    filters: filterValues,
    sortField: input.sortField,
    sortDir: input.sortDir
  });
  const { showApproximateMatchNotice, overviewKeyword } = useKeywordOverviewState({
    rows,
    searchedKeyword,
    selectedKeyword: uiState.selectedKeyword,
    hasSearched,
    isLoading,
    lastSearchError,
    keywordMode: input.keywordMode
  });
  const retrySearch = useCallback(() => {
    void retryResearch();
  }, [retryResearch]);
  const handleSearchSubmit = useCallback(
    (event) => {
      event.preventDefault();
      void controlsForm.handleSubmit();
    },
    [controlsForm]
  );
  const toggleSort = useCallback(
    (field) => {
      setSearchParams(getNextSortParams(input.sortField, input.sortDir, field));
    },
    [input.sortDir, input.sortField, setSearchParams]
  );
  const { handleSaveKeywords, confirmSave, exportCsv, sheetsExportRows } = useSaveAndExportActions({
    selectedRows,
    rows,
    filteredRows,
    input,
    saveKeywordsMutate: saveMutation.mutate,
    setShowSaveDialog: uiState.setShowSaveDialog
  });
  const handleToggleAllRows = () => {
    toggleAllRows(filteredRows.map((row) => row.keyword));
  };
  const handleRowClick = (row) => {
    captureClientEvent("keyword_research:serp_open");
    uiState.setSelectedKeyword(row);
    setSerpKeyword(row.keyword);
    setSerpPage(0);
  };
  return {
    activeFilterCount,
    activeSerpKeyword,
    confirmSave,
    controlsForm,
    exportCsv,
    sheetsExportRows,
    filteredRows,
    filtersForm,
    handleRowClick,
    handleSaveKeywords,
    handleSearchSubmit,
    hasSearched,
    history,
    historyLoaded,
    isLoading,
    lastResultSource,
    lastSearchError,
    lastSearchKeyword,
    lastSearchLocationCode,
    lastUsedFallback,
    mobileTab: uiState.mobileTab,
    overviewKeyword,
    removeHistoryItem,
    researchError,
    researchMutationError,
    retrySearch,
    resetFilters,
    rows,
    searchedKeyword,
    selectedRows,
    serpError,
    serpLoading,
    serpPage,
    serpQuery,
    serpResults,
    setMobileTab: uiState.setMobileTab,
    setSelectedRows,
    setSerpPage,
    setShowFilters: uiState.setShowFilters,
    setShowSaveDialog: uiState.setShowSaveDialog,
    showApproximateMatchNotice,
    showFilters: uiState.showFilters,
    showSaveDialog: uiState.showSaveDialog,
    sortDir: input.sortDir,
    sortField: input.sortField,
    toggleAllRows: handleToggleAllRows,
    toggleRowSelection,
    toggleSort,
    SERP_PAGE_SIZE
  };
}
function KeywordResearchEmptyState({ controller, projectId }) {
  const { hasSearched, isLoading, lastSearchError } = controller;
  if (hasSearched && !isLoading && !lastSearchError) {
    return /* @__PURE__ */ jsx(NoResultsState, { controller });
  }
  return /* @__PURE__ */ jsx(SearchHistoryState, { controller, projectId });
}
function NoResultsState({
  controller
}) {
  const { lastSearchKeyword, lastSearchLocationCode } = controller;
  return /* @__PURE__ */ jsx("div", { className: "pt-1", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-2xl rounded-2xl border border-base-300 bg-base-100 p-6 md:p-8 text-center space-y-4 mx-auto", children: [
    /* @__PURE__ */ jsx(Globe, { className: "size-10 mx-auto text-base-content/40" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx("p", { className: "text-lg font-semibold text-base-content", children: "Not enough keyword data for this query yet" }),
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-base-content/70", children: [
        "We could not find keyword opportunities for",
        /* @__PURE__ */ jsx("span", { className: "font-medium text-base-content", children: ` "${lastSearchKeyword}" ` }),
        "in",
        /* @__PURE__ */ jsx("span", { className: "font-medium text-base-content", children: ` ${LOCATIONS[lastSearchLocationCode] || "this location"}` }),
        "."
      ] })
    ] })
  ] }) });
}
function SearchHistoryState({
  controller,
  projectId
}) {
  const { history, historyLoaded, removeHistoryItem } = controller;
  if (!historyLoaded) {
    return null;
  }
  return /* @__PURE__ */ jsx("div", { className: "space-y-4 pt-1", children: history.length > 0 ? /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-base-300 bg-base-100 p-5 md:p-6", children: [
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
              from: "/p/$projectId/keywords",
              to: "/p/$projectId/keywords",
              params: { projectId },
              search: {
                q: item.keyword,
                loc: item.locationCode
              },
              replace: true,
              className: "flex min-w-0 flex-1 items-center gap-3 rounded-md px-1 py-1 text-left transition-colors hover:bg-base-200",
              children: [
                /* @__PURE__ */ jsx(Clock, { className: "size-4 shrink-0 text-base-content/40" }),
                /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                  /* @__PURE__ */ jsx("p", { className: "truncate font-medium text-base-content", children: item.keyword }),
                  /* @__PURE__ */ jsx("p", { className: "truncate text-sm text-base-content/60", children: item.locationName })
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex shrink-0 items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xs text-base-content/40", children: new Date(item.timestamp).toLocaleDateString(void 0, {
              month: "short",
              day: "numeric"
            }) }),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                className: "btn btn-ghost btn-xs opacity-0 group-hover:opacity-100 p-1",
                onClick: () => removeHistoryItem(item.timestamp),
                children: /* @__PURE__ */ jsx(X, { className: "size-3" })
              }
            )
          ] })
        ]
      },
      item.timestamp
    )) })
  ] }) : /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-dashed border-base-300 bg-base-100/70 p-6 text-center text-base-content/50 space-y-3", children: [
    /* @__PURE__ */ jsx(Search, { className: "size-10 mx-auto opacity-40" }),
    /* @__PURE__ */ jsx("p", { className: "text-lg font-medium text-base-content/80", children: "Enter a keyword to get started" }),
    /* @__PURE__ */ jsx("p", { className: "text-sm max-w-md mx-auto", children: "Search for any keyword to see volume, difficulty, CPC, and related keyword ideas." })
  ] }) });
}
function KeywordResearchLoadingState() {
  return /* @__PURE__ */ jsxs("div", { className: "flex-1 w-full", children: [
    /* @__PURE__ */ jsxs("div", { className: "hidden md:flex h-full gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col min-w-0 gap-2", children: [
        /* @__PURE__ */ jsx("div", { className: "rounded-xl border border-base-300 bg-base-100 p-4", children: /* @__PURE__ */ jsx("div", { className: "skeleton h-5 w-56" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 rounded-xl border border-base-300 bg-base-100 overflow-hidden", children: [
          /* @__PURE__ */ jsxs("div", { className: "border-b border-base-300 px-4 py-3 flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "skeleton h-8 w-24" }),
            /* @__PURE__ */ jsx("div", { className: "skeleton h-4 w-40" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "p-4 space-y-3", children: Array.from({ length: 10 }).map((_, index) => /* @__PURE__ */ jsxs(
            "div",
            {
              className: "grid grid-cols-[24px_minmax(0,1fr)_64px_56px_48px_40px] items-center gap-3",
              children: [
                /* @__PURE__ */ jsx("div", { className: "skeleton h-3 w-3" }),
                /* @__PURE__ */ jsx("div", { className: "skeleton h-4 w-10/12" }),
                /* @__PURE__ */ jsx("div", { className: "skeleton h-3 w-12 justify-self-end" }),
                /* @__PURE__ */ jsx("div", { className: "skeleton h-3 w-10 justify-self-end" }),
                /* @__PURE__ */ jsx("div", { className: "skeleton h-3 w-10 justify-self-end" }),
                /* @__PURE__ */ jsx("div", { className: "skeleton h-6 w-6 rounded-full justify-self-end" })
              ]
            },
            index
          )) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col min-w-0 gap-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-base-300 bg-base-100 p-4 space-y-3", children: [
          /* @__PURE__ */ jsx("div", { className: "skeleton h-4 w-36" }),
          /* @__PURE__ */ jsx("div", { className: "skeleton h-56 w-full" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 rounded-xl border border-base-300 bg-base-100 p-4 space-y-3", children: [
          /* @__PURE__ */ jsx("div", { className: "skeleton h-4 w-44" }),
          Array.from({ length: 6 }).map((_, index) => /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-[24px_1fr_72px] gap-2", children: [
            /* @__PURE__ */ jsx("div", { className: "skeleton h-3 w-4" }),
            /* @__PURE__ */ jsx("div", { className: "skeleton h-3 w-10/12" }),
            /* @__PURE__ */ jsx("div", { className: "skeleton h-3 w-12 justify-self-end" })
          ] }, index))
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "md:hidden space-y-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-base-300 bg-base-100 p-4 space-y-3", children: [
        /* @__PURE__ */ jsx("div", { className: "skeleton h-8 w-full" }),
        /* @__PURE__ */ jsx("div", { className: "skeleton h-8 w-2/3" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "rounded-xl border border-base-300 bg-base-100 p-4 space-y-2", children: Array.from({ length: 8 }).map((_, index) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: "space-y-2 rounded-lg border border-base-300 p-3",
          children: [
            /* @__PURE__ */ jsx("div", { className: "skeleton h-4 w-9/12" }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-2", children: [
              /* @__PURE__ */ jsx("div", { className: "skeleton h-3 w-full" }),
              /* @__PURE__ */ jsx("div", { className: "skeleton h-3 w-full" }),
              /* @__PURE__ */ jsx("div", { className: "skeleton h-3 w-full" })
            ] })
          ]
        },
        index
      )) })
    ] })
  ] });
}
function FilterIntentSelect({
  form
}) {
  return /* @__PURE__ */ jsxs(
    "div",
    {
      role: "group",
      "aria-labelledby": "keyword-intent-filter-label",
      className: "rounded-lg border border-base-300 bg-base-100 p-2.5 space-y-2",
      children: [
        /* @__PURE__ */ jsx(
          "p",
          {
            id: "keyword-intent-filter-label",
            className: "text-[11px] font-semibold uppercase tracking-wide text-base-content/60",
            children: "Intent"
          }
        ),
        /* @__PURE__ */ jsx(form.Field, { name: "intents", children: (field) => {
          const selected = parseIntentFilter(field.state.value);
          return /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1.5", children: KEYWORD_INTENT_ORDER.map((intent) => {
            const isActive = selected.includes(intent);
            return /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                "aria-pressed": isActive,
                className: `btn btn-xs ${isActive ? "btn-primary" : "btn-ghost border border-base-300"}`,
                onClick: () => field.handleChange(
                  toggleIntentFilter(field.state.value, intent)
                ),
                children: INTENT_LABELS[intent]
              },
              intent
            );
          }) });
        } })
      ]
    }
  );
}
function FilterTextInput({
  form,
  name,
  label,
  placeholder
}) {
  return /* @__PURE__ */ jsxs("label", { className: "form-control gap-1.5", children: [
    /* @__PURE__ */ jsx("span", { className: "text-[11px] font-semibold uppercase tracking-wide text-base-content/60", children: label }),
    /* @__PURE__ */ jsx(form.Field, { name, children: (field) => /* @__PURE__ */ jsx(
      "input",
      {
        className: "input input-bordered input-sm bg-base-100",
        placeholder,
        value: field.state.value,
        onChange: (event) => field.handleChange(event.target.value)
      }
    ) })
  ] });
}
function FilterRangeInputs({
  form,
  title,
  minName,
  maxName,
  step
}) {
  return /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-base-300 bg-base-100 p-2.5 space-y-2", children: [
    /* @__PURE__ */ jsx("p", { className: "text-[11px] font-semibold uppercase tracking-wide text-base-content/60", children: title }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
      /* @__PURE__ */ jsx(
        CompactRangeInput,
        {
          form,
          name: minName,
          placeholder: "Min",
          step
        }
      ),
      /* @__PURE__ */ jsx(
        CompactRangeInput,
        {
          form,
          name: maxName,
          placeholder: "Max",
          step
        }
      )
    ] })
  ] });
}
function CompactRangeInput({
  form,
  name,
  placeholder,
  step
}) {
  return /* @__PURE__ */ jsx(form.Field, { name, children: (field) => /* @__PURE__ */ jsx(
    "input",
    {
      className: "input input-bordered input-xs bg-base-100",
      placeholder,
      type: "number",
      step,
      value: field.state.value,
      onChange: (event) => field.handleChange(event.target.value)
    }
  ) });
}
function EmptyFilterResults({
  activeFilterCount,
  resetFilters
}) {
  return /* @__PURE__ */ jsxs("div", { className: "h-full flex flex-col items-center justify-center text-center px-4 text-base-content/50 gap-3", children: [
    /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: "No keywords match your current filters." }),
    activeFilterCount > 0 ? /* @__PURE__ */ jsx("button", { className: "btn btn-ghost btn-sm", onClick: resetFilters, children: "Clear filters" }) : null
  ] });
}
const keywordColumnHelper = createColumnHelper();
function KeywordResearchDesktopTable({
  activeFilterCount,
  filteredRows,
  overviewKeyword,
  selectedRows,
  setSelectedRows,
  sortDir,
  sortField,
  toggleSort,
  resetFilters,
  handleRowClick
}) {
  const selectAnchorRef = useSelectionAnchor();
  const rowSelection = useMemo(
    () => Object.fromEntries(
      [...selectedRows].map((keyword) => [keyword, true])
    ),
    [selectedRows]
  );
  const columns = useMemo(
    () => [
      makeSelectionColumn(selectAnchorRef),
      keywordColumnHelper.accessor("keyword", {
        header: () => /* @__PURE__ */ jsx(
          SortHeader,
          {
            label: "Keyword",
            field: "keyword",
            current: sortField,
            dir: sortDir,
            onToggle: toggleSort,
            className: "min-w-48 md:min-w-0"
          }
        ),
        cell: ({ row }) => /* @__PURE__ */ jsx(
          "span",
          {
            className: "block min-w-48 whitespace-normal break-words font-medium capitalize md:min-w-0 md:truncate",
            title: row.original.keyword,
            children: row.original.keyword
          }
        ),
        meta: {
          headerClassName: "min-w-48 md:min-w-0",
          cellClassName: "min-w-48 md:min-w-0"
        }
      }),
      keywordColumnHelper.accessor("searchVolume", {
        header: () => /* @__PURE__ */ jsx(
          SortHeader,
          {
            label: "Volume",
            field: "searchVolume",
            current: sortField,
            dir: sortDir,
            onToggle: toggleSort,
            className: "justify-end"
          }
        ),
        cell: ({ getValue }) => formatNumber(getValue()),
        meta: {
          headerClassName: "text-right",
          cellClassName: "whitespace-nowrap text-right tabular-nums text-base-content/70"
        }
      }),
      keywordColumnHelper.accessor("cpc", {
        header: () => /* @__PURE__ */ jsx(
          SortHeader,
          {
            label: "CPC",
            helpText: "Cost per click in USD.",
            field: "cpc",
            current: sortField,
            dir: sortDir,
            onToggle: toggleSort,
            className: "justify-end"
          }
        ),
        cell: ({ getValue }) => {
          const value = getValue();
          return value == null ? "-" : value.toFixed(2);
        },
        meta: {
          headerClassName: "text-right",
          cellClassName: "whitespace-nowrap text-right tabular-nums text-base-content/70"
        }
      }),
      keywordColumnHelper.accessor("competition", {
        header: () => /* @__PURE__ */ jsx(
          SortHeader,
          {
            label: "Comp.",
            helpText: "Paid-search competition from Google Ads (0-1): higher means more advertisers bidding.",
            field: "competition",
            current: sortField,
            dir: sortDir,
            onToggle: toggleSort,
            className: "justify-end"
          }
        ),
        cell: ({ getValue }) => {
          const value = getValue();
          return value == null ? "-" : value.toFixed(2);
        },
        meta: {
          headerClassName: "text-right",
          cellClassName: "whitespace-nowrap text-right tabular-nums text-base-content/70"
        }
      }),
      keywordColumnHelper.accessor("keywordDifficulty", {
        header: () => /* @__PURE__ */ jsx(
          SortHeader,
          {
            label: "Score",
            helpText: "Organic ranking difficulty (0-100): higher means harder to reach Google's top 10.",
            field: "keywordDifficulty",
            current: sortField,
            dir: sortDir,
            onToggle: toggleSort,
            className: "justify-end"
          }
        ),
        cell: ({ getValue }) => /* @__PURE__ */ jsx(DifficultyBadge, { value: getValue() }),
        meta: { headerClassName: "text-right", cellClassName: "text-right" }
      }),
      keywordColumnHelper.accessor("intent", {
        header: "Intent",
        cell: ({ getValue }) => /* @__PURE__ */ jsx(IntentBadge, { intent: getValue() }),
        meta: {
          headerClassName: "text-center",
          cellClassName: "whitespace-nowrap text-center"
        }
      })
    ],
    [selectAnchorRef, sortDir, sortField, toggleSort]
  );
  const table = useAppTable({
    data: filteredRows,
    columns,
    state: { rowSelection },
    onRowSelectionChange: (updater) => {
      const next = typeof updater === "function" ? updater(rowSelection) : updater;
      setSelectedRows(
        new Set(
          Object.entries(next).filter(([, selected]) => selected).map(([keyword]) => keyword)
        )
      );
    },
    getRowId: (row) => row.keyword,
    enableRowSelection: true
  });
  return /* @__PURE__ */ jsx("div", { className: "flex-1 min-h-0", children: filteredRows.length === 0 ? /* @__PURE__ */ jsx(
    EmptyFilterResults,
    {
      activeFilterCount,
      resetFilters
    }
  ) : /* @__PURE__ */ jsx(
    AppDataTable,
    {
      table,
      className: "table table-xs min-w-max md:w-full",
      wrapperClassName: "h-full overflow-auto",
      getRowProps: (row) => ({
        className: `cursor-pointer border-b border-base-200 hover:bg-base-200/50 ${overviewKeyword?.keyword === row.original.keyword ? "bg-primary/5 border-l-2 border-l-primary" : ""}`,
        onClick: () => handleRowClick(row.original)
      })
    }
  ) });
}
const KEYWORD_RESEARCH_PAGE_SIZES = [50, 100, 300, 500];
const DEFAULT_KEYWORD_RESEARCH_PAGE_SIZE = 50;
const KEYWORD_RESEARCH_PAGE_SIZE_STORAGE_KEY = "keyword-research-table-page-size";
function KeywordResearchPagination({
  page,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange
}) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const start = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(totalCount, page * pageSize);
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 border-t border-base-300 px-4 py-3 sm:flex-row sm:items-center sm:justify-between", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-sm tabular-nums text-base-content/70", children: [
      start.toLocaleString(),
      "-",
      end.toLocaleString(),
      " of",
      " ",
      totalCount.toLocaleString()
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-6", children: [
      /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-sm text-base-content/70", children: [
        /* @__PURE__ */ jsx("span", { className: "whitespace-nowrap", children: "Rows per page" }),
        /* @__PURE__ */ jsx(
          "select",
          {
            className: "select select-bordered select-sm w-20",
            value: pageSize,
            onChange: (event) => onPageSizeChange(parseKeywordResearchPageSize(event.target.value)),
            children: KEYWORD_RESEARCH_PAGE_SIZES.map((size) => /* @__PURE__ */ jsx("option", { value: size, children: size }, size))
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxs("span", { className: "whitespace-nowrap text-sm tabular-nums text-base-content/70", children: [
          "Page ",
          page.toLocaleString(),
          " of ",
          totalPages.toLocaleString()
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "btn btn-ghost btn-sm btn-square",
              disabled: page <= 1,
              onClick: () => onPageChange(page - 1),
              "aria-label": "Previous page",
              children: /* @__PURE__ */ jsx(ChevronLeft, { className: "size-4" })
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "btn btn-ghost btn-sm btn-square",
              disabled: page >= totalPages,
              onClick: () => onPageChange(page + 1),
              "aria-label": "Next page",
              children: /* @__PURE__ */ jsx(ChevronRight, { className: "size-4" })
            }
          )
        ] })
      ] })
    ] })
  ] });
}
function parseKeywordResearchPageSize(value) {
  const parsed = Number(value);
  return KEYWORD_RESEARCH_PAGE_SIZES.find((size) => size === parsed) ?? DEFAULT_KEYWORD_RESEARCH_PAGE_SIZE;
}
function useKeywordResearchPagination(rows) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(
    () => getStoredKeywordResearchPageSize()
  );
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  useEffect(() => {
    setPage(1);
  }, [rows]);
  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);
  const pageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [page, pageSize, rows]);
  return {
    page,
    pageSize,
    pageRows,
    setPage,
    setPageSize: (nextPageSize) => {
      setPageSize(nextPageSize);
      persistKeywordResearchPageSize(nextPageSize);
      setPage(1);
    },
    totalPages
  };
}
function getStoredKeywordResearchPageSize() {
  if (typeof window === "undefined") return DEFAULT_KEYWORD_RESEARCH_PAGE_SIZE;
  try {
    const stored = window.localStorage.getItem(
      KEYWORD_RESEARCH_PAGE_SIZE_STORAGE_KEY
    );
    return stored ? parseKeywordResearchPageSize(stored) : DEFAULT_KEYWORD_RESEARCH_PAGE_SIZE;
  } catch {
    return DEFAULT_KEYWORD_RESEARCH_PAGE_SIZE;
  }
}
function persistKeywordResearchPageSize(pageSize) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      KEYWORD_RESEARCH_PAGE_SIZE_STORAGE_KEY,
      String(pageSize)
    );
  } catch {
  }
}
const MONTH_SHORT_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec"
];
function formatTrendRangeLabel(trend) {
  if (trend.length === 0) return "Last 12 available months";
  const sorted = trend.toSorted(
    (a, b) => a.year * 100 + a.month - (b.year * 100 + b.month)
  );
  const last12 = sorted.slice(-12);
  const start = last12[0];
  const end = last12[last12.length - 1];
  const toLabel = (month, year) => {
    const monthLabel = MONTH_SHORT_LABELS[month - 1] ?? `M${month}`;
    return `${monthLabel} ${year}`;
  };
  const startLabel = toLabel(start.month, start.year);
  const endLabel = toLabel(end.month, end.year);
  return startLabel === endLabel ? startLabel : `${startLabel} - ${endLabel}`;
}
function KeywordResearchDesktopResults({ controller }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex-1 hidden md:flex flex-col xl:flex-row overflow-y-auto xl:overflow-hidden gap-4", children: [
    /* @__PURE__ */ jsx(DesktopKeywordPanel, { controller }),
    /* @__PURE__ */ jsx(DesktopSerpPanel, { controller })
  ] });
}
function DesktopKeywordPanel({ controller }) {
  const {
    lastResultSource,
    lastUsedFallback,
    searchedKeyword,
    showApproximateMatchNotice
  } = controller;
  return /* @__PURE__ */ jsxs("div", { className: "order-2 xl:order-1 flex flex-col min-w-0 gap-2 xl:basis-3/5", children: [
    showApproximateMatchNotice ? /* @__PURE__ */ jsxs(
      "div",
      {
        className: "rounded-lg border border-warning/40 bg-warning/15 px-3 py-2 text-sm text-base-content",
        role: "status",
        children: [
          "No exact match for",
          " ",
          /* @__PURE__ */ jsxs("span", { className: "font-medium", children: [
            '"',
            searchedKeyword,
            '"'
          ] }),
          ". Showing closest related keywords instead.",
          lastUsedFallback ? /* @__PURE__ */ jsxs("span", { className: "text-base-content/75", children: [
            " ",
            "Source: ",
            lastResultSource,
            " fallback."
          ] }) : null
        ]
      }
    ) : null,
    controller.overviewKeyword ? /* @__PURE__ */ jsx(OverviewStats, { keyword: controller.overviewKeyword }) : null,
    /* @__PURE__ */ jsx(DesktopTableCard, { controller })
  ] });
}
function DesktopTableCard({ controller }) {
  const {
    activeFilterCount,
    filteredRows,
    rows,
    selectedRows,
    sheetsExportRows,
    showFilters
  } = controller;
  const { page, pageSize, pageRows, setPage, setPageSize } = useKeywordResearchPagination(filteredRows);
  const keywordCountLabel = selectedRows.size > 0 ? `${selectedRows.size} of ${filteredRows.length} selected` : activeFilterCount > 0 ? `Showing ${filteredRows.length} of ${rows.length} keywords` : `Showing ${filteredRows.length} keywords`;
  const canExport = filteredRows.length > 0;
  const selectedExportRows = filteredRows.filter((row) => selectedRows.has(row.keyword)).map(keywordResearchExportRow);
  const handleExportToSheets = () => {
    void exportTableToSheets({
      headers: KEYWORD_RESEARCH_HEADERS,
      rows: sheetsExportRows,
      feature: "keyword_research"
    });
  };
  const handleExportSelectionToSheets = () => {
    void exportTableToSheets({
      headers: KEYWORD_RESEARCH_HEADERS,
      rows: selectedExportRows,
      feature: "keyword_research"
    });
  };
  const handleExportSelectionCsv = () => {
    downloadKeywordResearchCsv(selectedExportRows);
    captureClientEvent("data:export", {
      source_feature: "keyword_research",
      result_count: selectedExportRows.length,
      scope: "selection"
    });
  };
  return /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col min-w-0 border border-base-300 rounded-xl bg-base-100 overflow-hidden", children: [
    /* @__PURE__ */ jsxs("div", { className: "shrink-0 flex items-center gap-2 px-4 py-2 border-b border-base-300", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          className: `btn btn-ghost btn-sm gap-1.5 ${showFilters ? "btn-active" : ""}`,
          onClick: () => controller.setShowFilters((current) => !current),
          title: "Toggle table filters",
          children: [
            /* @__PURE__ */ jsx(SlidersHorizontal, { className: "size-3.5" }),
            "Filters",
            activeFilterCount > 0 ? /* @__PURE__ */ jsx("span", { className: "badge badge-xs badge-primary border-0 text-primary-content", children: activeFilterCount }) : null
          ]
        }
      ),
      /* @__PURE__ */ jsx("span", { className: "text-sm text-base-content/60", children: keywordCountLabel }),
      /* @__PURE__ */ jsx("div", { className: "flex-1" }),
      /* @__PURE__ */ jsxs("div", { className: "dropdown dropdown-end", children: [
        /* @__PURE__ */ jsxs(
          "div",
          {
            tabIndex: 0,
            role: "button",
            className: `btn btn-ghost btn-sm gap-1 ${!canExport ? "btn-disabled" : ""}`,
            children: [
              /* @__PURE__ */ jsx(Download, { className: "size-3.5" }),
              /* @__PURE__ */ jsx("span", { className: "hidden lg:inline", children: "Export" }),
              /* @__PURE__ */ jsx(ChevronDown, { className: "size-3 opacity-60" })
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "ul",
          {
            tabIndex: 0,
            className: "dropdown-content z-10 menu p-2 shadow-lg bg-base-100 border border-base-300 rounded-box w-56",
            children: [
              /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs("button", { onClick: handleExportToSheets, disabled: !canExport, children: [
                /* @__PURE__ */ jsx(Sheet, { className: "size-4" }),
                "Export to Sheets"
              ] }) }),
              /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs("button", { onClick: controller.exportCsv, disabled: !canExport, children: [
                /* @__PURE__ */ jsx(FileDown, { className: "size-4" }),
                "Export CSV"
              ] }) })
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      TableBulkActionBar,
      {
        selectedCount: selectedRows.size,
        onClear: () => controller.setSelectedRows(/* @__PURE__ */ new Set()),
        actions: /* @__PURE__ */ jsxs("div", { className: "flex items-center px-1.5", children: [
          /* @__PURE__ */ jsx(
            TableBulkActionButton,
            {
              icon: /* @__PURE__ */ jsx(Save, { className: "size-3.5" }),
              onClick: controller.handleSaveKeywords,
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
                  label: "Export CSV",
                  icon: /* @__PURE__ */ jsx(FileDown, { className: "size-4" }),
                  onClick: handleExportSelectionCsv
                }
              ]
            }
          )
        ] })
      }
    ),
    showFilters ? /* @__PURE__ */ jsx(DesktopFilters, { controller }) : null,
    /* @__PURE__ */ jsx(
      KeywordResearchDesktopTable,
      {
        activeFilterCount: controller.activeFilterCount,
        filteredRows: pageRows,
        overviewKeyword: controller.overviewKeyword,
        selectedRows: controller.selectedRows,
        setSelectedRows: controller.setSelectedRows,
        sortDir: controller.sortDir,
        sortField: controller.sortField,
        toggleSort: controller.toggleSort,
        resetFilters: controller.resetFilters,
        handleRowClick: controller.handleRowClick
      }
    ),
    filteredRows.length > 0 ? /* @__PURE__ */ jsx(
      KeywordResearchPagination,
      {
        page,
        pageSize,
        totalCount: filteredRows.length,
        onPageChange: setPage,
        onPageSizeChange: setPageSize
      }
    ) : null
  ] });
}
function DesktopFilters({ controller }) {
  const { activeFilterCount, filtersForm } = controller;
  return /* @__PURE__ */ jsxs("div", { className: "shrink-0 border-b border-base-300 bg-gradient-to-b from-base-100 to-base-200/30 px-4 py-3 space-y-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold", children: "Refine table results" }),
        activeFilterCount > 0 ? /* @__PURE__ */ jsxs("span", { className: "badge badge-xs badge-primary border-0 text-primary-content", children: [
          activeFilterCount,
          " active"
        ] }) : null
      ] }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          className: "btn btn-xs btn-ghost gap-1",
          onClick: controller.resetFilters,
          disabled: activeFilterCount === 0,
          children: [
            /* @__PURE__ */ jsx(RotateCcw, { className: "size-3" }),
            "Clear all"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-3 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsx(
        FilterTextInput,
        {
          form: filtersForm,
          name: "include",
          label: "Include Terms",
          placeholder: "audit, checker, template"
        }
      ),
      /* @__PURE__ */ jsx(
        FilterTextInput,
        {
          form: filtersForm,
          name: "exclude",
          label: "Exclude Terms",
          placeholder: "jobs, salary, course"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-2 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsx(
        FilterRangeInputs,
        {
          form: filtersForm,
          title: "Search Volume",
          minName: "minVol",
          maxName: "maxVol"
        }
      ),
      /* @__PURE__ */ jsx(
        FilterRangeInputs,
        {
          form: filtersForm,
          title: "CPC (USD)",
          minName: "minCpc",
          maxName: "maxCpc",
          step: "0.01"
        }
      ),
      /* @__PURE__ */ jsx(
        FilterRangeInputs,
        {
          form: filtersForm,
          title: "Difficulty",
          minName: "minKd",
          maxName: "maxKd"
        }
      )
    ] }),
    /* @__PURE__ */ jsx(FilterIntentSelect, { form: filtersForm })
  ] });
}
function DesktopSerpPanel({ controller }) {
  const { overviewKeyword } = controller;
  const trendRangeLabel = overviewKeyword ? formatTrendRangeLabel(overviewKeyword.trend) : "Last 12 available months";
  return /* @__PURE__ */ jsxs("div", { className: "order-1 xl:order-2 flex flex-col min-w-0 gap-2 xl:basis-2/5 xl:overflow-y-auto", children: [
    overviewKeyword && overviewKeyword.trend.length > 0 ? /* @__PURE__ */ jsxs("div", { className: "shrink-0 overflow-hidden border border-base-300 rounded-xl bg-base-100 px-4 py-3", children: [
      /* @__PURE__ */ jsxs("h4", { className: "text-sm font-semibold mb-1", children: [
        "Search Trends",
        " ",
        /* @__PURE__ */ jsx("span", { className: "font-normal text-base-content/50", children: trendRangeLabel })
      ] }),
      /* @__PURE__ */ jsx(AreaTrendChart, { trend: overviewKeyword.trend })
    ] }) : null,
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col overflow-hidden border border-base-300 rounded-xl bg-base-100", children: [
      /* @__PURE__ */ jsx("div", { className: "shrink-0 px-4 py-3 border-b border-base-300", children: /* @__PURE__ */ jsxs("h3", { className: "text-sm font-semibold flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsx(Globe, { className: "size-3.5" }),
        "SERP Analysis",
        controller.activeSerpKeyword ? /* @__PURE__ */ jsxs("span", { className: "font-normal text-base-content/50 truncate", children: [
          ": ",
          controller.activeSerpKeyword
        ] }) : null
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "p-4", children: /* @__PURE__ */ jsx(
        SerpAnalysisCard,
        {
          items: controller.serpResults,
          keyword: controller.activeSerpKeyword,
          loading: controller.serpLoading,
          error: controller.serpError,
          onRetry: () => void controller.serpQuery.refetch(),
          page: controller.serpPage,
          pageSize: controller.SERP_PAGE_SIZE,
          onPageChange: controller.setSerpPage
        }
      ) })
    ] })
  ] });
}
function KeywordResearchMobileResults({ controller }) {
  const { filteredRows, mobileTab } = controller;
  return /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col overflow-hidden md:hidden", children: [
    /* @__PURE__ */ jsxs("div", { className: "shrink-0 flex border-b border-base-300 bg-base-100", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          className: `flex-1 py-2 text-sm font-medium text-center border-b-2 transition-colors ${mobileTab === "keywords" ? "border-primary text-primary" : "border-transparent text-base-content/60"}`,
          onClick: () => controller.setMobileTab("keywords"),
          children: [
            "Keywords (",
            filteredRows.length,
            ")"
          ]
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          className: `flex-1 py-2 text-sm font-medium text-center border-b-2 transition-colors ${mobileTab === "serp" ? "border-primary text-primary" : "border-transparent text-base-content/60"}`,
          onClick: () => controller.setMobileTab("serp"),
          children: "SERP Analysis"
        }
      )
    ] }),
    mobileTab === "keywords" ? /* @__PURE__ */ jsx(MobileKeywordResults, { controller }) : /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto p-4", children: /* @__PURE__ */ jsx(
      SerpAnalysisCard,
      {
        items: controller.serpResults,
        keyword: controller.activeSerpKeyword,
        loading: controller.serpLoading,
        error: controller.serpError,
        onRetry: () => void controller.serpQuery.refetch(),
        page: controller.serpPage,
        pageSize: controller.SERP_PAGE_SIZE,
        onPageChange: controller.setSerpPage
      }
    ) })
  ] });
}
function MobileKeywordResults({ controller }) {
  const {
    activeFilterCount,
    filteredRows,
    rows,
    selectedRows,
    sheetsExportRows,
    showFilters
  } = controller;
  const { page, pageSize, pageRows, setPage, setPageSize } = useKeywordResearchPagination(filteredRows);
  const keywordCountLabel = selectedRows.size > 0 ? `${selectedRows.size} selected` : activeFilterCount > 0 ? `Showing ${filteredRows.length} of ${rows.length}` : `Showing ${filteredRows.length} keywords`;
  const canExport = filteredRows.length > 0;
  const selectedExportRows = filteredRows.filter((row) => selectedRows.has(row.keyword)).map(keywordResearchExportRow);
  const handleExportToSheets = () => {
    void exportTableToSheets({
      headers: KEYWORD_RESEARCH_HEADERS,
      rows: sheetsExportRows,
      feature: "keyword_research"
    });
  };
  const handleExportSelectionToSheets = () => {
    void exportTableToSheets({
      headers: KEYWORD_RESEARCH_HEADERS,
      rows: selectedExportRows,
      feature: "keyword_research"
    });
  };
  const handleExportSelectionCsv = () => {
    downloadKeywordResearchCsv(selectedExportRows);
    captureClientEvent("data:export", {
      source_feature: "keyword_research",
      result_count: selectedExportRows.length,
      scope: "selection"
    });
  };
  return /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col overflow-hidden", children: [
    controller.showApproximateMatchNotice ? /* @__PURE__ */ jsxs(
      "div",
      {
        className: "mx-4 mt-2 rounded-lg border border-warning/40 bg-warning/15 px-3 py-2 text-xs text-base-content",
        role: "status",
        children: [
          "No exact match for",
          " ",
          /* @__PURE__ */ jsxs("span", { className: "font-medium", children: [
            '"',
            controller.searchedKeyword,
            '"'
          ] }),
          ". Showing closest related keywords."
        ]
      }
    ) : null,
    /* @__PURE__ */ jsxs("div", { className: "shrink-0 flex items-center gap-2 px-4 py-2 border-b border-base-300 bg-base-100", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          className: `btn btn-ghost btn-xs gap-1 ${showFilters ? "btn-active" : ""}`,
          onClick: () => controller.setShowFilters((current) => !current),
          children: [
            /* @__PURE__ */ jsx(SlidersHorizontal, { className: "size-3.5" }),
            "Filters",
            activeFilterCount > 0 ? /* @__PURE__ */ jsx("span", { className: "badge badge-xs badge-primary border-0 text-primary-content", children: activeFilterCount }) : null
          ]
        }
      ),
      /* @__PURE__ */ jsx("span", { className: "text-xs text-base-content/60", children: keywordCountLabel }),
      /* @__PURE__ */ jsx("div", { className: "flex-1" }),
      /* @__PURE__ */ jsxs("div", { className: "dropdown dropdown-end", children: [
        /* @__PURE__ */ jsxs(
          "div",
          {
            tabIndex: 0,
            role: "button",
            className: `btn btn-ghost btn-xs gap-1 ${!canExport ? "btn-disabled" : ""}`,
            "aria-label": "Export",
            children: [
              /* @__PURE__ */ jsx(Download, { className: "size-3.5" }),
              /* @__PURE__ */ jsx(ChevronDown, { className: "size-3 opacity-60" })
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "ul",
          {
            tabIndex: 0,
            className: "dropdown-content z-10 menu p-2 shadow-lg bg-base-100 border border-base-300 rounded-box w-56",
            children: [
              /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs("button", { onClick: handleExportToSheets, disabled: !canExport, children: [
                /* @__PURE__ */ jsx(Sheet, { className: "size-4" }),
                "Export to Sheets"
              ] }) }),
              /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs("button", { onClick: controller.exportCsv, disabled: !canExport, children: [
                /* @__PURE__ */ jsx(FileDown, { className: "size-4" }),
                "Export CSV"
              ] }) })
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      TableBulkActionBar,
      {
        selectedCount: selectedRows.size,
        onClear: () => controller.setSelectedRows(/* @__PURE__ */ new Set()),
        actions: /* @__PURE__ */ jsxs("div", { className: "flex items-center px-1.5", children: [
          /* @__PURE__ */ jsx(
            TableBulkActionButton,
            {
              icon: /* @__PURE__ */ jsx(Save, { className: "size-3.5" }),
              onClick: controller.handleSaveKeywords,
              children: "Save"
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
                  label: "Export CSV",
                  icon: /* @__PURE__ */ jsx(FileDown, { className: "size-4" }),
                  onClick: handleExportSelectionCsv
                }
              ]
            }
          )
        ] })
      }
    ),
    showFilters ? /* @__PURE__ */ jsx(MobileFilters, { controller }) : null,
    /* @__PURE__ */ jsx(
      KeywordResearchDesktopTable,
      {
        activeFilterCount: controller.activeFilterCount,
        filteredRows: pageRows,
        overviewKeyword: controller.overviewKeyword,
        selectedRows: controller.selectedRows,
        setSelectedRows: controller.setSelectedRows,
        sortDir: controller.sortDir,
        sortField: controller.sortField,
        toggleSort: controller.toggleSort,
        resetFilters: controller.resetFilters,
        handleRowClick: controller.handleRowClick
      }
    ),
    filteredRows.length > 0 ? /* @__PURE__ */ jsx(
      KeywordResearchPagination,
      {
        page,
        pageSize,
        totalCount: filteredRows.length,
        onPageChange: setPage,
        onPageSizeChange: setPageSize
      }
    ) : null
  ] });
}
function MobileFilters({ controller }) {
  const { activeFilterCount, filtersForm } = controller;
  return /* @__PURE__ */ jsxs("div", { className: "shrink-0 border-b border-base-300 bg-gradient-to-b from-base-100 to-base-200/30 px-4 py-3 space-y-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold", children: "Refine table results" }),
        activeFilterCount > 0 ? /* @__PURE__ */ jsx("span", { className: "badge badge-xs badge-primary border-0 text-primary-content", children: activeFilterCount }) : null
      ] }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          className: "btn btn-xs btn-ghost gap-1",
          onClick: controller.resetFilters,
          disabled: activeFilterCount === 0,
          children: [
            /* @__PURE__ */ jsx(RotateCcw, { className: "size-3" }),
            "Clear"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-2", children: [
      /* @__PURE__ */ jsx(filtersForm.Field, { name: "include", children: (field) => /* @__PURE__ */ jsx(
        "input",
        {
          className: "input input-bordered input-sm bg-base-100",
          placeholder: "Include terms (audit, checker)",
          value: field.state.value,
          onChange: (event) => field.handleChange(event.target.value)
        }
      ) }),
      /* @__PURE__ */ jsx(filtersForm.Field, { name: "exclude", children: (field) => /* @__PURE__ */ jsx(
        "input",
        {
          className: "input input-bordered input-sm bg-base-100",
          placeholder: "Exclude terms (jobs, course)",
          value: field.state.value,
          onChange: (event) => field.handleChange(event.target.value)
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
      /* @__PURE__ */ jsx(
        MobileRangeInput,
        {
          form: filtersForm,
          name: "minVol",
          placeholder: "Min volume"
        }
      ),
      /* @__PURE__ */ jsx(
        MobileRangeInput,
        {
          form: filtersForm,
          name: "maxVol",
          placeholder: "Max volume"
        }
      ),
      /* @__PURE__ */ jsx(
        MobileRangeInput,
        {
          form: filtersForm,
          name: "minCpc",
          placeholder: "Min CPC",
          step: "0.01"
        }
      ),
      /* @__PURE__ */ jsx(
        MobileRangeInput,
        {
          form: filtersForm,
          name: "maxCpc",
          placeholder: "Max CPC",
          step: "0.01"
        }
      ),
      /* @__PURE__ */ jsx(
        MobileRangeInput,
        {
          form: filtersForm,
          name: "minKd",
          placeholder: "Min difficulty"
        }
      ),
      /* @__PURE__ */ jsx(
        MobileRangeInput,
        {
          form: filtersForm,
          name: "maxKd",
          placeholder: "Max difficulty"
        }
      )
    ] }),
    /* @__PURE__ */ jsx(FilterIntentSelect, { form: filtersForm })
  ] });
}
function MobileRangeInput({
  form,
  name,
  placeholder,
  step
}) {
  return /* @__PURE__ */ jsx(form.Field, { name, children: (field) => /* @__PURE__ */ jsx(
    "input",
    {
      className: "input input-bordered input-sm bg-base-100",
      placeholder,
      type: "number",
      step,
      value: field.state.value,
      onChange: (event) => field.handleChange(event.target.value)
    }
  ) });
}
function KeywordResearchResults({ controller }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col overflow-hidden w-full", children: [
    /* @__PURE__ */ jsx(KeywordResearchDesktopResults, { controller }),
    /* @__PURE__ */ jsx(KeywordResearchMobileResults, { controller })
  ] });
}
function getTextareaRows(value) {
  const newlines = (value.match(/\n/g) ?? []).length;
  const lines = newlines + 1;
  return Math.min(MAX_KEYWORDS_PER_SUBMIT, Math.max(1, lines));
}
function KeywordResearchSearchBar({ controller }) {
  const { controlsForm, handleSearchSubmit } = controller;
  return /* @__PURE__ */ jsx("div", { className: "card border border-base-300 bg-base-100", children: /* @__PURE__ */ jsxs("div", { className: "card-body gap-2", children: [
    /* @__PURE__ */ jsxs(
      "form",
      {
        className: "flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-start lg:gap-2",
        onSubmit: handleSearchSubmit,
        children: [
          /* @__PURE__ */ jsx(controlsForm.Field, { name: "keyword", children: (field) => {
            const keywordError = getFieldError(field.state.meta.errors);
            const rows = getTextareaRows(field.state.value);
            return /* @__PURE__ */ jsxs(
              "label",
              {
                className: `flex w-full lg:flex-1 lg:min-w-0 lg:max-w-md items-start gap-2 rounded-lg border bg-base-100 px-4 py-3 transition-colors focus-within:border-primary ${keywordError ? "border-error" : "border-base-300"}`,
                children: [
                  /* @__PURE__ */ jsx(Search, { className: "mt-0.5 size-4 shrink-0 text-base-content/60" }),
                  /* @__PURE__ */ jsx(
                    "textarea",
                    {
                      className: "grow min-w-0 resize-none bg-transparent text-sm leading-6 outline-none placeholder:text-base-content/40",
                      rows,
                      placeholder: "Enter a keyword",
                      value: field.state.value,
                      onChange: (event) => field.handleChange(event.target.value),
                      onKeyDown: (event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault();
                          void controlsForm.handleSubmit();
                        }
                      }
                    }
                  )
                ]
              }
            );
          } }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2 lg:contents", children: [
            /* @__PURE__ */ jsx(controlsForm.Field, { name: "locationCode", children: (field) => /* @__PURE__ */ jsx(
              LocationSelect,
              {
                value: field.state.value,
                onChange: (code) => field.handleChange(code),
                className: "w-full lg:w-44 lg:shrink-0"
              }
            ) }),
            /* @__PURE__ */ jsx(controlsForm.Field, { name: "resultLimit", children: (field) => /* @__PURE__ */ jsx(
              "select",
              {
                className: "select select-bordered w-full lg:w-auto lg:shrink-0",
                value: field.state.value,
                onChange: (event) => {
                  const next = Number(event.target.value);
                  field.handleChange(isResultLimit(next) ? next : 150);
                },
                children: RESULT_LIMITS.map((limit) => /* @__PURE__ */ jsxs("option", { value: limit, children: [
                  limit,
                  " results"
                ] }, limit))
              }
            ) }),
            /* @__PURE__ */ jsx(controlsForm.Field, { name: "mode", children: (field) => /* @__PURE__ */ jsxs(
              "select",
              {
                className: "select select-bordered w-full lg:w-auto lg:shrink-0",
                value: field.state.value,
                onChange: (event) => field.handleChange(normalizeKeywordMode(event.target.value)),
                children: [
                  /* @__PURE__ */ jsx("option", { value: "auto", children: "Auto" }),
                  /* @__PURE__ */ jsx("option", { value: "related", children: "Related keywords" }),
                  /* @__PURE__ */ jsx("option", { value: "suggestions", children: "Suggestions" }),
                  /* @__PURE__ */ jsx("option", { value: "ideas", children: "Ideas" })
                ]
              }
            ) }),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "submit",
                className: "btn btn-primary w-full px-6 lg:w-auto lg:shrink-0",
                children: "Search"
              }
            )
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsx(controlsForm.Field, { name: "keyword", children: (field) => {
      const keywordError = getFieldError(field.state.meta.errors);
      return keywordError ? /* @__PURE__ */ jsx("p", { className: "text-sm text-error", children: keywordError }) : null;
    } }),
    /* @__PURE__ */ jsx(controlsForm.Field, { name: "locationCode", children: (locationField) => isLabsLocationCode(locationField.state.value) ? /* @__PURE__ */ jsx(controlsForm.Field, { name: "clickstream", children: (field) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxs("label", { className: "label cursor-pointer justify-start gap-2 p-0", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "checkbox",
            className: "toggle toggle-sm toggle-primary",
            checked: field.state.value,
            onChange: (event) => field.handleChange(event.target.checked)
          }
        ),
        /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-base-content/80", children: "Clickstream-refined volumes" })
      ] }),
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "tooltip tooltip-right",
          "data-tip": "Google reports one combined search volume for similar keywords (e.g. 'seo tool' and 'seo tools'). Turn this on to estimate each keyword's own volume. Costs 2x the credits.",
          children: /* @__PURE__ */ jsx(Info, { className: "size-3.5 text-base-content/50" })
        }
      )
    ] }) }) : /* @__PURE__ */ jsxs(
      "div",
      {
        className: "flex items-start gap-2 rounded-lg border border-info/30 bg-info/10 px-3 py-2 text-sm text-base-content/80",
        role: "status",
        children: [
          /* @__PURE__ */ jsx(Info, { className: "mt-0.5 size-4 shrink-0 text-info" }),
          /* @__PURE__ */ jsx("span", { children: "Keyword data for this country comes from Google Ads — search volume, CPC, and trends are available, but difficulty and intent are not." })
        ]
      }
    ) })
  ] }) });
}
function isKeywordSearchTab(tab) {
  return tab.input.type === "keyword";
}
function KeywordResearchPage(input) {
  const setSearchParams = useKeywordSearchParams();
  const projectId = input.projectId;
  const { locationCode, displayedLocationCode, setPreferredLocationCode } = useResolvedKeywordLocation({
    projectId,
    locationCode: input.locationCode
  });
  const navigateToKeywordInput = useCallback(
    (tabInput) => {
      if (!tabInput) {
        setSearchParams({
          q: void 0,
          loc: void 0,
          kLimit: void 0,
          mode: void 0,
          cs: void 0
        });
        return;
      }
      setSearchParams({
        q: tabInput.keyword,
        loc: tabInput.locationCode,
        kLimit: tabInput.resultLimit === 150 ? void 0 : tabInput.resultLimit,
        mode: tabInput.mode === "auto" ? void 0 : tabInput.mode,
        cs: tabInput.clickstream ? true : void 0
      });
    },
    [setSearchParams]
  );
  const urlInput = useMemo(() => {
    const keywords = parseKeywordInput(input.keywordInput);
    const keyword = keywords[0];
    if (!keyword) return null;
    return {
      type: "keyword",
      keyword,
      locationCode,
      resultLimit: input.resultLimit,
      mode: input.keywordMode,
      clickstream: input.clickstream
    };
  }, [
    input.clickstream,
    input.keywordInput,
    input.keywordMode,
    locationCode,
    input.resultLimit
  ]);
  const searchTabs = useSearchTabNavigation({
    storageKey: `keyword:${projectId}`,
    urlInput,
    getLabel: useCallback(
      (tabInput) => tabInput.type === "keyword" ? tabInput.keyword : "",
      []
    ),
    navigateToInput: useCallback(
      (tabInput) => {
        navigateToKeywordInput(tabInput?.type === "keyword" ? tabInput : null);
      },
      [navigateToKeywordInput]
    )
  });
  const activeTab = useMemo(() => {
    if (!urlInput) return null;
    const tab = searchTabs.tabs.find(
      (candidate) => candidate.id === searchTabs.activeTabId
    );
    return tab && isKeywordSearchTab(tab) && tabInputKey(tab.input) === tabInputKey(urlInput) ? tab : null;
  }, [searchTabs.activeTabId, searchTabs.tabs, urlInput]);
  const onFormSubmit = useCallback(
    (value) => {
      const keywords = parseKeywordInput(value.keyword);
      if (keywords.length === 0) return;
      const inputs = keywords.map((keyword) => ({
        type: "keyword",
        keyword,
        locationCode: value.locationCode,
        resultLimit: value.resultLimit,
        mode: value.mode,
        clickstream: value.clickstream
      }));
      for (const tabInput of inputs) {
        searchTabs.openTab(tabInput);
      }
      navigateToKeywordInput(inputs.at(-1) ?? null);
    },
    [navigateToKeywordInput, searchTabs]
  );
  const showRecentSearches = useCallback(() => {
    searchTabs.setActiveTab(null);
    navigateToKeywordInput(null);
  }, [navigateToKeywordInput, searchTabs]);
  const controllerInput = useMemo(
    () => activeTab ? {
      ...input,
      keywordInput: activeTab.input.keyword,
      locationCode: activeTab.input.locationCode,
      displayedLocationCode: activeTab.input.locationCode ?? displayedLocationCode,
      setPreferredLocationCode,
      resultLimit: activeTab.input.resultLimit,
      keywordMode: activeTab.input.mode,
      clickstream: activeTab.input.clickstream
    } : {
      ...input,
      locationCode,
      displayedLocationCode,
      setPreferredLocationCode
    },
    [
      activeTab,
      input,
      displayedLocationCode,
      locationCode,
      setPreferredLocationCode
    ]
  );
  const controller = useKeywordResearchController({
    ...controllerInput,
    onFormSubmit
  });
  return /* @__PURE__ */ jsx("div", { className: "px-4 py-4 md:px-6 md:py-6 pb-24 md:pb-8 overflow-auto", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto flex max-w-7xl flex-col gap-5", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold", children: "Keyword Research" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-base-content/70", children: "Discover keyword ideas, search demand, and ranking opportunities." })
    ] }),
    /* @__PURE__ */ jsx(KeywordResearchSearchBar, { controller }),
    controller.hasSearched ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          "data-testid": "keyword-research-recent-searches",
          className: "btn btn-ghost btn-sm w-fit gap-2 px-0 text-base-content/70 hover:bg-transparent",
          onClick: showRecentSearches,
          children: [
            /* @__PURE__ */ jsx(ArrowLeft, { className: "size-4" }),
            "Recent searches"
          ]
        }
      ),
      /* @__PURE__ */ jsx(
        SearchTabStrip,
        {
          projectId,
          tabs: searchTabs.tabs,
          activeTabId: searchTabs.activeTabId,
          onSelect: searchTabs.selectTab,
          onClose: searchTabs.closeTab,
          onViewed: searchTabs.markTabViewed
        }
      )
    ] }) : null,
    /* @__PURE__ */ jsx(
      KeywordResearchContent,
      {
        controller,
        projectId: input.projectId
      }
    ),
    /* @__PURE__ */ jsx(KeywordSaveDialog, { controller })
  ] }) });
}
function KeywordResearchContent({
  controller,
  projectId
}) {
  if (controller.isLoading) {
    return /* @__PURE__ */ jsx(KeywordResearchLoadingState, {});
  }
  if (controller.researchError) {
    const isCreditsError = getErrorCode(controller.researchMutationError) === "INSUFFICIENT_CREDITS";
    return /* @__PURE__ */ jsx("div", { className: "flex-1 flex items-center justify-center pt-1", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-xl rounded-xl border border-error/30 bg-error/10 p-5 text-error space-y-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2", children: [
        /* @__PURE__ */ jsx(AlertCircle, { className: "mt-0.5 size-4 shrink-0" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm", children: controller.researchError })
      ] }),
      isCreditsError ? /* @__PURE__ */ jsx(Link, { to: BILLING_ROUTE, className: "btn btn-sm", children: "Go to Billing" }) : /* @__PURE__ */ jsx("button", { className: "btn btn-sm", onClick: controller.retrySearch, children: "Try again" })
    ] }) });
  }
  if (controller.rows.length === 0) {
    return /* @__PURE__ */ jsx(
      KeywordResearchEmptyState,
      {
        controller,
        projectId
      }
    );
  }
  return /* @__PURE__ */ jsx(KeywordResearchResults, { controller });
}
function KeywordSaveDialog({
  controller
}) {
  if (!controller.showSaveDialog) return null;
  return /* @__PURE__ */ jsxs("div", { className: "modal modal-open", children: [
    /* @__PURE__ */ jsxs("div", { className: "modal-box", children: [
      /* @__PURE__ */ jsxs("h3", { className: "font-bold text-lg", children: [
        "Save ",
        controller.selectedRows.size,
        " Keywords"
      ] }),
      /* @__PURE__ */ jsx("div", { className: "py-4", children: /* @__PURE__ */ jsx("p", { className: "text-base-content/70 text-sm", children: "These keywords will be saved to your current project." }) }),
      /* @__PURE__ */ jsxs("div", { className: "modal-action", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "btn",
            onClick: () => controller.setShowSaveDialog(false),
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsx("button", { className: "btn btn-primary", onClick: controller.confirmSave, children: "Save" })
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "modal-backdrop",
        onClick: () => controller.setShowSaveDialog(false)
      }
    )
  ] });
}
function KeywordResearchPageRoute() {
  const {
    projectId
  } = Route.useParams();
  const search = Route.useSearch();
  const {
    q: keywordInput = "",
    loc: locationCode,
    kLimit: resultLimit = 150,
    mode: keywordMode = "auto",
    sort: sortField = "searchVolume",
    order: sortDir = "desc"
  } = search;
  return /* @__PURE__ */ jsx(KeywordResearchPage, { projectId, keywordInput, locationCode, resultLimit: isResultLimit(resultLimit) ? resultLimit : 150, keywordMode: normalizeKeywordMode(keywordMode), clickstream: search.cs ?? false, sortField: normalizeSortField(sortField), sortDir: normalizeSortDir(sortDir) });
}
export {
  KeywordResearchPageRoute as component
};
