import { i as createServerFn, bu as devicesLabel, bt as LOCATIONS, bh as formatLocationLabel, c5 as isLabsLocationCode, c6 as getIsoCountryCode, aa as getLanguageCode, c7 as SERP_LANGUAGE_OPTIONS, c8 as pagesToDepth, c9 as depthToPages, ca as estimateRankCheckCredits, ap as domainField, ao as normalizeDomain } from "../entry.js";
import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { RotateCcw, Loader2, Search, Sparkles, ArrowUp, ArrowDown, AlertCircle, X, Info } from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { M as Modal } from "./Modal-81iy_nBW.js";
import { L as LocationSelect } from "./LocationSelect-BPALgSkR.js";
import { u as useProjectMarket } from "./useProjectMarket-D9zlqQGO.js";
import { useQuery, useMutation } from "@tanstack/react-query";
import { l as createSsrRpc, a8 as exportTableToSheets, D as downloadCsv, E as buildCsv, c as captureClientEvent, K as makeSelectionColumn, a3 as useAppTable, o as getStandardErrorMessage, a4 as AppDataTable, ai as applyShiftRangeSelection } from "./router-CFUJAOTG.js";
import { z } from "zod";
import { r as requireProjectContext, a as requireAuthenticatedContext } from "./middleware-CwR3-L1M.js";
import { a as getDomainKeywordSuggestions } from "./domain-BmUvf1XM.js";
import { g as getConfigsSchema, u as updateConfigSchema, a as getLatestResultsSchema, j as getPositionMatrixSchema, e as estimateCostSchema, b as getLatestRunSchema, t as triggerCheckSchema, f as refreshMetricsSchema, d as addKeywordsSchema, i as getConfigTrendSchema, r as removeKeywordsSchema, c as createConfigSchema, h as getKeywordHistorySchema } from "./rank-tracking-CDulOYdn.js";
const getRankTrackingConfigs = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(getConfigsSchema).handler(createSsrRpc("2498dc9ae1c9692a93484405a16016aa8af2296e6a6ac6c892aeff22c4154f17"));
const getRankTrackingConfigSummaries = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(getConfigsSchema).handler(createSsrRpc("bb79e98e928653ebc50e8c4bfd905ed74cfd81dc4ad11c40a96e517c7a538648"));
const createRankTrackingConfig = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(createConfigSchema).handler(createSsrRpc("258d28f360a42fb9dc6a60c60b05f23782f2fe2bf58c46d6e683b5d80693aadf"));
const updateRankTrackingConfig = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(updateConfigSchema).handler(createSsrRpc("16b8b61d3cfc645bc36be38a136d9d7ad7096edf8550536a9b522e2833bd5c45"));
const triggerRankCheck = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(triggerCheckSchema).handler(createSsrRpc("0e2299d91fe830180a5418ad53dd35b4fca59a0bcbd2727c9f3eff6680a88592"));
const getLatestRankResults = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(getLatestResultsSchema).handler(createSsrRpc("ddd165935e6b49d3557cb04d17f77f9775c81fbb0c0f735387a032421a266542"));
const getLatestRankRun = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(getLatestRunSchema).handler(createSsrRpc("e07b0dfacb31a403133cc5bf5e671e8b7735dd63c2c993749b4ecd399e779acb"));
const estimateRankCheckCost = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(estimateCostSchema).handler(createSsrRpc("1e3e63b95fa90f1fafbcda79f9999a31747ab722474f0eae185243ffdd1b06ab"));
const addTrackingKeywords = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(addKeywordsSchema).handler(createSsrRpc("9632bd92f3de61b172319c2b693ceaafbbc52f214ba2a4fb93531fefa5b96d74"));
const removeTrackingKeywords = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(removeKeywordsSchema).handler(createSsrRpc("d034f8888a5e1014831023cf2a868291cfd466101140d59d1f4251fd53203037"));
const refreshTrackingKeywordMetrics = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(refreshMetricsSchema).handler(createSsrRpc("17c1167140bde128372935a660b28fd6e0e183774ca3f90271799ba787ecb243"));
const getRankKeywordHistory = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(getKeywordHistorySchema).handler(createSsrRpc("e808431fe24faa5cddaa82ff3cee05037bdd2ddd1ba1ceef693aac01ca8e68bc"));
const getRankConfigTrend = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(getConfigTrendSchema).handler(createSsrRpc("9da63329d53b960da32b79472469175d63f38b5e71bcef0cacabb66cba684931"));
const getRankPositionMatrix = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(getPositionMatrixSchema).handler(createSsrRpc("c6715a7072113d7f7ea076796cf28e47be1bab5e1dfd14502e72467efab53306"));
const EMPTY_FILTERS = {
  include: "",
  exclude: "",
  minDesktopPos: "",
  maxDesktopPos: "",
  minMobilePos: "",
  maxMobilePos: "",
  minVolume: "",
  maxVolume: "",
  minKd: "",
  maxKd: "",
  minCpc: "",
  maxCpc: ""
};
const EMPTY_DOMAIN_LIST_FILTERS = {
  query: "",
  device: "all",
  locationCode: "all"
};
const DEVICE_FILTER_ORDER = [
  "both",
  "desktop",
  "mobile"
];
function applyDomainListFilters(configs, filters) {
  const query = filters.query.trim().toLowerCase();
  const locationCode = filters.locationCode === "all" ? null : Number(filters.locationCode);
  return configs.filter((config) => {
    if (query && !config.domain.toLowerCase().includes(query)) return false;
    if (filters.device !== "all" && config.devices !== filters.device) {
      return false;
    }
    if (locationCode !== null && config.locationCode !== locationCode) {
      return false;
    }
    return true;
  });
}
function getDomainListFilterOptions(configs) {
  const deviceValues = new Set(configs.map((config) => config.devices));
  const devices = DEVICE_FILTER_ORDER.filter(
    (device) => deviceValues.has(device)
  ).map((device) => ({
    value: device,
    label: devicesLabel(device)
  }));
  const locationMap = /* @__PURE__ */ new Map();
  for (const config of configs) {
    locationMap.set(
      config.locationCode,
      LOCATIONS[config.locationCode] ?? String(config.locationCode)
    );
  }
  const locations = Array.from(locationMap, ([code, label]) => ({
    value: String(code),
    label
  })).toSorted((a, b) => a.label.localeCompare(b.label));
  return { devices, locations };
}
function applyFilters(rows, filters) {
  const includeTerms = filters.include ? filters.include.toLowerCase().split(",").map((t) => t.trim()).filter(Boolean) : [];
  const excludeTerms = filters.exclude ? filters.exclude.toLowerCase().split(",").map((t) => t.trim()).filter(Boolean) : [];
  return rows.filter((row) => {
    const kw = row.keyword.toLowerCase();
    if (includeTerms.length > 0 && !includeTerms.some((t) => kw.includes(t)))
      return false;
    if (excludeTerms.some((t) => kw.includes(t))) return false;
    if (!matchesPositionFilter(
      row.desktop.position,
      filters.minDesktopPos,
      filters.maxDesktopPos
    ))
      return false;
    if (!matchesPositionFilter(
      row.mobile.position,
      filters.minMobilePos,
      filters.maxMobilePos
    ))
      return false;
    if (!matchesMetricRangeFilter(
      row.searchVolume,
      filters.minVolume,
      filters.maxVolume
    ))
      return false;
    if (!matchesMetricRangeFilter(
      row.keywordDifficulty,
      filters.minKd,
      filters.maxKd
    ))
      return false;
    if (!matchesMetricRangeFilter(row.cpc, filters.minCpc, filters.maxCpc))
      return false;
    return true;
  });
}
function matchesPositionFilter(position, minValue, maxValue) {
  if (!minValue && !maxValue) return true;
  const max = maxValue === "" ? Infinity : Number(maxValue);
  if (max === 0) return position === null;
  if (position === null) return false;
  const min = minValue === "" ? 0 : Number(minValue);
  return position >= min && position <= max;
}
function matchesMetricRangeFilter(value, minValue, maxValue) {
  if (!minValue && !maxValue) return true;
  if (value === null) return false;
  const min = minValue === "" ? -Infinity : Number(minValue);
  const max = maxValue === "" ? Infinity : Number(maxValue);
  return value >= min && value <= max;
}
function countActiveFilters(filters) {
  let count = 0;
  if (filters.include) count++;
  if (filters.exclude) count++;
  if (filters.minDesktopPos || filters.maxDesktopPos) count++;
  if (filters.minMobilePos || filters.maxMobilePos) count++;
  if (filters.minVolume || filters.maxVolume) count++;
  if (filters.minKd || filters.maxKd) count++;
  if (filters.minCpc || filters.maxCpc) count++;
  return count;
}
function countActiveDomainListFilters(filters) {
  let count = 0;
  if (filters.query.trim()) count++;
  if (filters.device !== "all") count++;
  if (filters.locationCode !== "all") count++;
  return count;
}
function FilterPanel({
  filters,
  setFilters,
  activeFilterCount,
  onReset
}) {
  const update = (key, value) => setFilters({ ...filters, [key]: value });
  return /* @__PURE__ */ jsxs("div", { className: "shrink-0 border-b border-base-300 bg-gradient-to-b from-base-100 to-base-200/30 px-4 py-3 space-y-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold", children: "Refine results" }),
        activeFilterCount > 0 && /* @__PURE__ */ jsxs("span", { className: "badge badge-xs badge-primary border-0 text-primary-content", children: [
          activeFilterCount,
          " active"
        ] })
      ] }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          className: "btn btn-xs btn-ghost gap-1",
          onClick: onReset,
          disabled: activeFilterCount === 0,
          children: [
            /* @__PURE__ */ jsx(RotateCcw, { className: "size-3" }),
            "Clear all"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-3 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsx("p", { className: "text-[11px] font-semibold uppercase tracking-wide text-base-content/60", children: "Include" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            className: "input input-bordered input-sm w-full bg-base-100",
            placeholder: "e.g. seo, tool",
            value: filters.include,
            onChange: (e) => update("include", e.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsx("p", { className: "text-[11px] font-semibold uppercase tracking-wide text-base-content/60", children: "Exclude" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            className: "input input-bordered input-sm w-full bg-base-100",
            placeholder: "e.g. free, cheap",
            value: filters.exclude,
            onChange: (e) => update("exclude", e.target.value)
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-3 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsx(
        RangeFilter,
        {
          title: "Desktop position",
          minValue: filters.minDesktopPos,
          maxValue: filters.maxDesktopPos,
          onMinChange: (v) => update("minDesktopPos", v),
          onMaxChange: (v) => update("maxDesktopPos", v)
        }
      ),
      /* @__PURE__ */ jsx(
        RangeFilter,
        {
          title: "Mobile position",
          minValue: filters.minMobilePos,
          maxValue: filters.maxMobilePos,
          onMinChange: (v) => update("minMobilePos", v),
          onMaxChange: (v) => update("maxMobilePos", v)
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-3 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsx(
        RangeFilter,
        {
          title: "Volume",
          minValue: filters.minVolume,
          maxValue: filters.maxVolume,
          onMinChange: (v) => update("minVolume", v),
          onMaxChange: (v) => update("maxVolume", v)
        }
      ),
      /* @__PURE__ */ jsx(
        RangeFilter,
        {
          title: "Keyword difficulty",
          minValue: filters.minKd,
          maxValue: filters.maxKd,
          onMinChange: (v) => update("minKd", v),
          onMaxChange: (v) => update("maxKd", v)
        }
      ),
      /* @__PURE__ */ jsx(
        RangeFilter,
        {
          title: "CPC",
          minValue: filters.minCpc,
          maxValue: filters.maxCpc,
          onMinChange: (v) => update("minCpc", v),
          onMaxChange: (v) => update("maxCpc", v)
        }
      )
    ] })
  ] });
}
function DomainListFilterBar({
  filters,
  options,
  activeFilterCount,
  onChange,
  onReset
}) {
  return /* @__PURE__ */ jsx("div", { className: "border-t border-base-300 px-5 py-3", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 lg:flex-row lg:items-end", children: [
    /* @__PURE__ */ jsxs("label", { className: "form-control flex-1 gap-1.5", children: [
      /* @__PURE__ */ jsx("span", { className: "text-[11px] font-semibold uppercase tracking-wide text-base-content/60", children: "Search" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          className: "input input-bordered input-sm w-full bg-base-100",
          placeholder: "Domain or website",
          value: filters.query,
          onChange: (event) => onChange({ ...filters, query: event.target.value })
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("label", { className: "form-control gap-1.5 lg:w-44", children: [
      /* @__PURE__ */ jsx("span", { className: "text-[11px] font-semibold uppercase tracking-wide text-base-content/60", children: "Device" }),
      /* @__PURE__ */ jsxs(
        "select",
        {
          className: "select select-bordered select-sm w-full bg-base-100",
          value: filters.device,
          onChange: (event) => {
            const value = event.target.value;
            if (value === "all" || value === "both" || value === "desktop" || value === "mobile") {
              onChange({ ...filters, device: value });
            }
          },
          children: [
            /* @__PURE__ */ jsx("option", { value: "all", children: "All devices" }),
            options.devices.map((option) => /* @__PURE__ */ jsx("option", { value: option.value, children: option.label }, option.value))
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("label", { className: "form-control gap-1.5 lg:w-52", children: [
      /* @__PURE__ */ jsx("span", { className: "text-[11px] font-semibold uppercase tracking-wide text-base-content/60", children: "Country" }),
      /* @__PURE__ */ jsxs(
        "select",
        {
          className: "select select-bordered select-sm w-full bg-base-100",
          value: filters.locationCode,
          onChange: (event) => onChange({ ...filters, locationCode: event.target.value }),
          children: [
            /* @__PURE__ */ jsx("option", { value: "all", children: "All countries" }),
            options.locations.map((option) => /* @__PURE__ */ jsx("option", { value: option.value, children: option.label }, option.value))
          ]
        }
      )
    ] }),
    activeFilterCount > 0 && /* @__PURE__ */ jsxs(
      "button",
      {
        className: "btn btn-ghost btn-sm gap-1.5 self-start lg:self-auto",
        onClick: onReset,
        children: [
          /* @__PURE__ */ jsx(RotateCcw, { className: "size-3" }),
          "Clear",
          /* @__PURE__ */ jsx("span", { className: "badge badge-xs badge-primary border-0 text-primary-content", children: activeFilterCount })
        ]
      }
    )
  ] }) });
}
function RangeFilter({
  title,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange
}) {
  return /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-base-300 bg-base-100 p-2.5 space-y-2", children: [
    /* @__PURE__ */ jsx("p", { className: "text-[11px] font-semibold uppercase tracking-wide text-base-content/60", children: title }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          className: "input input-bordered input-xs bg-base-100",
          placeholder: "Min",
          type: "number",
          value: minValue,
          onChange: (e) => onMinChange(e.target.value)
        }
      ),
      /* @__PURE__ */ jsx(
        "input",
        {
          className: "input input-bordered input-xs bg-base-100",
          placeholder: "Max",
          type: "number",
          value: maxValue,
          onChange: (e) => onMaxChange(e.target.value)
        }
      )
    ] })
  ] });
}
const countryCodeField = z.string().regex(/^[a-z]{2}$/i);
const searchSerpLocationsSchema = z.object({
  query: z.string().min(1).max(100),
  countryCode: countryCodeField
});
const searchSerpLocations = createServerFn({
  method: "POST"
}).middleware(requireAuthenticatedContext).validator(searchSerpLocationsSchema).handler(createSsrRpc("16b95567643a21275b38fde625b8e1428bd2aeaff2440637c2a21009637d64d9"));
const prewarmSerpLocations = createServerFn({
  method: "POST"
}).middleware(requireAuthenticatedContext).validator(z.object({
  countryCode: countryCodeField
})).handler(createSsrRpc("364efb68f010cdd93e01da48b22253ac6e745a792ce18710f489a70100cde203"));
function useDebounce(value, delayMs) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}
function SerpLocationCombobox({
  value,
  onChange,
  countryCode,
  placeholder = "Search cities..."
}) {
  const [inputValue, setInputValue] = useState(
    value ? formatLocationLabel(value) : ""
  );
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);
  const listRef = useRef(null);
  const skipNextFetchRef = useRef(false);
  const debouncedQuery = useDebounce(inputValue, 350);
  useEffect(() => {
    if (!value) {
      setInputValue("");
      setResults([]);
      setOpen(false);
    }
  }, [value]);
  useEffect(() => {
    const trimmed = debouncedQuery.trim();
    if (!trimmed) {
      setResults([]);
      setOpen(false);
      setIsLoading(false);
      return;
    }
    if (skipNextFetchRef.current) {
      skipNextFetchRef.current = false;
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    setIsError(false);
    searchSerpLocations({ data: { query: trimmed, countryCode } }).then((data) => {
      if (cancelled) return;
      setResults(data);
      setOpen(true);
      setActiveIndex(0);
    }).catch(() => {
      if (cancelled) return;
      setIsError(true);
      setOpen(true);
    }).finally(() => {
      if (!cancelled) setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, countryCode]);
  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (e) => {
      if (e.target instanceof Node && !containerRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);
  useEffect(() => {
    if (!open) return;
    listRef.current?.children[activeIndex]?.scrollIntoView({
      block: "nearest"
    });
  }, [activeIndex, open]);
  const select = (loc) => {
    onChange(loc.locationName);
    skipNextFetchRef.current = true;
    setInputValue(loc.displayLabel);
    setResults([]);
    setOpen(false);
  };
  const handleInputChange = (e) => {
    const v = e.target.value;
    setInputValue(v);
    if (!v.trim()) {
      onChange(void 0);
    }
  };
  const handleKeyDown = (e) => {
    if (!open) return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, results.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter": {
        e.preventDefault();
        const loc = results[activeIndex];
        if (loc) select(loc);
        break;
      }
      case "Escape":
        e.preventDefault();
        setOpen(false);
        break;
    }
  };
  return /* @__PURE__ */ jsxs("div", { ref: containerRef, className: "relative w-full", children: [
    /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 input input-bordered w-full pr-3", children: [
      isLoading ? /* @__PURE__ */ jsx(Loader2, { className: "size-4 shrink-0 text-base-content/50 animate-spin" }) : /* @__PURE__ */ jsx(Search, { className: "size-4 shrink-0 text-base-content/50" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          className: "grow min-w-0 bg-transparent outline-none placeholder:text-base-content/40",
          placeholder,
          value: inputValue,
          onChange: handleInputChange,
          onKeyDown: handleKeyDown,
          onFocus: () => {
            if (results.length > 0) setOpen(true);
          },
          autoComplete: "off"
        }
      )
    ] }),
    open && /* @__PURE__ */ jsx("div", { className: "absolute z-30 mt-1 w-full rounded-box border border-base-300 bg-base-100 shadow-lg p-1", children: isError ? /* @__PURE__ */ jsx("p", { className: "px-3 py-2 text-sm text-error", children: "Unable to load locations" }) : results.length === 0 ? /* @__PURE__ */ jsxs("p", { className: "px-3 py-2 text-sm text-base-content/50", children: [
      'No locations found for "',
      debouncedQuery.trim(),
      '"'
    ] }) : /* @__PURE__ */ jsx(
      "ul",
      {
        ref: listRef,
        role: "listbox",
        className: "menu max-h-56 w-full flex-nowrap overflow-y-auto p-0",
        children: results.map((loc, index) => /* @__PURE__ */ jsx(
          "li",
          {
            role: "option",
            "aria-selected": loc.locationName === value,
            children: /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                className: `w-full flex items-center justify-between gap-2 ${index === activeIndex ? "menu-focus" : ""}`,
                onClick: () => select(loc),
                onMouseEnter: () => setActiveIndex(index),
                children: [
                  /* @__PURE__ */ jsx("span", { className: "truncate text-left", children: loc.displayLabel }),
                  /* @__PURE__ */ jsx("span", { className: "badge badge-xs bg-base-300 border-0 text-base-content/60 shrink-0", children: loc.locationType })
                ]
              }
            )
          },
          loc.locationCode
        ))
      }
    ) })
  ] });
}
function SearchTargetingField({
  mode,
  onModeChange,
  locationName,
  onLocationNameChange,
  countryCode
}) {
  useQuery({
    queryKey: ["serp-locations-prewarm", countryCode],
    queryFn: () => prewarmSerpLocations({ data: { countryCode } }),
    enabled: mode === "local",
    staleTime: Infinity,
    retry: false
  });
  return /* @__PURE__ */ jsxs("div", { className: "form-control", children: [
    /* @__PURE__ */ jsx("label", { className: "label", children: /* @__PURE__ */ jsx("span", { className: "label-text font-medium", children: "Search Targeting" }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "radio",
            className: "radio radio-sm",
            checked: mode === "national",
            onChange: () => {
              onModeChange("national");
              onLocationNameChange(void 0);
            }
          }
        ),
        /* @__PURE__ */ jsx("span", { className: "text-sm", children: "National" })
      ] }),
      /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "radio",
            className: "radio radio-sm",
            checked: mode === "local",
            onChange: () => onModeChange("local")
          }
        ),
        /* @__PURE__ */ jsx("span", { className: "text-sm", children: "Local" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("p", { className: "text-xs text-base-content/50 mt-1.5", children: mode === "local" ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("span", { className: "text-success font-medium", children: "Best for:" }),
      ' "near me" queries, city/county keywords, service-area pages.'
    ] }) : /* @__PURE__ */ jsx(Fragment, { children: "Local targeting can understate rankings for non-geo-modified terms." }) }),
    mode === "local" && /* @__PURE__ */ jsx("div", { className: "mt-2", children: /* @__PURE__ */ jsx(
      SerpLocationCombobox,
      {
        value: locationName,
        onChange: onLocationNameChange,
        countryCode,
        placeholder: "Search cities..."
      }
    ) })
  ] });
}
const FEATURE_SHORT_LABELS = {
  featured_snippet: "FS",
  people_also_ask: "PAA",
  ai_overview: "AI",
  local_pack: "Local",
  knowledge_panel: "KP",
  video: "Video",
  images: "Img",
  shopping: "Shop",
  top_stories: "News"
};
const FEATURE_TOOLTIPS = {
  featured_snippet: "Featured Snippet — highlighted answer box at top of results",
  people_also_ask: "People Also Ask — expandable related questions",
  ai_overview: "AI Overview — AI-generated summary at top of search",
  local_pack: "Local Pack — map with local business listings",
  knowledge_panel: "Knowledge Panel — info box about an entity",
  video: "Video — video results shown in the SERP",
  images: "Images — image results shown in the SERP",
  shopping: "Shopping — product listings with prices",
  top_stories: "Top Stories — news articles carousel"
};
function SerpFeatureTags({ features }) {
  const notable = features.filter((f) => f in FEATURE_SHORT_LABELS);
  if (notable.length === 0) return null;
  return /* @__PURE__ */ jsx("div", { className: "flex gap-1 flex-wrap", children: notable.map((f) => /* @__PURE__ */ jsxs(
    "span",
    {
      className: "badge badge-xs gap-0.5 cursor-help bg-base-300 border-0 text-base-content/70",
      title: FEATURE_TOOLTIPS[f] ?? f,
      children: [
        f === "ai_overview" && /* @__PURE__ */ jsx(Sparkles, { className: "size-2.5" }),
        FEATURE_SHORT_LABELS[f]
      ]
    },
    f
  )) });
}
function DeviceRankCell({
  result
}) {
  const { position, previousPosition } = result;
  if (position === null && previousPosition === null) {
    return /* @__PURE__ */ jsx("span", { className: "text-base-content/40", children: "-" });
  }
  if (position === null && previousPosition !== null) {
    return /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
      /* @__PURE__ */ jsx("span", { className: "font-mono text-xs text-base-content/40 w-6 text-right", children: previousPosition }),
      /* @__PURE__ */ jsx("span", { className: "text-base-content/30", children: "→" }),
      /* @__PURE__ */ jsx("span", { className: "font-mono rounded px-1.5 py-0.5 text-xs font-semibold bg-error/20 text-error", children: "lost" })
    ] });
  }
  if (previousPosition === null) {
    return /* @__PURE__ */ jsx("span", { className: "font-mono", children: position });
  }
  const change = previousPosition - position;
  let badgeClass = "bg-base-200 text-base-content";
  if (change > 0) badgeClass = "bg-success/20 text-success";
  if (change < 0) badgeClass = "bg-warning/20 text-warning";
  return /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
    /* @__PURE__ */ jsx("span", { className: "font-mono text-xs text-base-content/40 w-6 text-right", children: previousPosition }),
    /* @__PURE__ */ jsx("span", { className: "text-base-content/30", children: "→" }),
    /* @__PURE__ */ jsx(
      "span",
      {
        className: `font-mono rounded px-1.5 py-0.5 text-xs font-semibold ${badgeClass}`,
        children: position
      }
    )
  ] });
}
function DeviceUrlCell({
  result,
  domain
}) {
  if (!result.rankingUrl) {
    return /* @__PURE__ */ jsx("span", { className: "text-base-content/40 text-xs", children: "-" });
  }
  return /* @__PURE__ */ jsx(
    "a",
    {
      href: toFullUrl(result.rankingUrl, domain),
      target: "_blank",
      rel: "noopener noreferrer",
      className: "link link-hover block truncate text-xs",
      title: result.rankingUrl,
      children: toPath(result.rankingUrl)
    }
  );
}
const compactFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1
});
function VolumeCell({ value }) {
  if (value == null) return /* @__PURE__ */ jsx("span", { className: "text-base-content/40", children: "-" });
  return /* @__PURE__ */ jsx("span", { className: "font-mono text-sm", children: compactFormatter.format(value) });
}
function DifficultyCell({ value }) {
  if (value == null) return /* @__PURE__ */ jsx("span", { className: "text-base-content/40", children: "-" });
  let badgeClass = "bg-success/20 text-success";
  if (value > 60) badgeClass = "bg-error/20 text-error";
  else if (value > 30) badgeClass = "bg-warning/20 text-warning";
  return /* @__PURE__ */ jsx(
    "span",
    {
      className: `font-mono rounded px-1.5 py-0.5 text-xs font-semibold ${badgeClass}`,
      children: value
    }
  );
}
function CpcCell({ value }) {
  if (value == null) return /* @__PURE__ */ jsx("span", { className: "text-base-content/40", children: "-" });
  return /* @__PURE__ */ jsxs("span", { className: "font-mono text-sm", children: [
    "$",
    value.toFixed(2)
  ] });
}
function csvChange(current, previous) {
  if (previous === null) return current !== null ? "new" : "";
  if (current === null) return "lost";
  return previous - current;
}
function buildRankTrackingExport(sorted, showDesktop, showMobile, locationName) {
  const headers = [
    "Keyword",
    // Exports lack the table's tooltip, so name the city inline.
    locationName ? `Local volume (${formatLocationLabel(locationName, 2)})` : "Volume",
    "KD",
    "CPC",
    ...showDesktop ? [
      "Desktop Position",
      "Desktop Change",
      "Desktop URL",
      "Desktop SERP Features"
    ] : [],
    ...showMobile ? [
      "Mobile Position",
      "Mobile Change",
      "Mobile URL",
      "Mobile SERP Features"
    ] : []
  ];
  const rows = sorted.map((row) => [
    row.keyword,
    row.searchVolume ?? "",
    row.keywordDifficulty ?? "",
    row.cpc ?? "",
    ...showDesktop ? [
      row.desktop.position ?? "",
      csvChange(row.desktop.position, row.desktop.previousPosition),
      row.desktop.rankingUrl ?? "",
      row.desktop.serpFeatures.join(", ")
    ] : [],
    ...showMobile ? [
      row.mobile.position ?? "",
      csvChange(row.mobile.position, row.mobile.previousPosition),
      row.mobile.rankingUrl ?? "",
      row.mobile.serpFeatures.join(", ")
    ] : []
  ]);
  return { headers, rows };
}
function exportRankTrackingToSheets(sorted, showDesktop, showMobile, locationName) {
  const { headers, rows } = buildRankTrackingExport(
    sorted,
    showDesktop,
    showMobile,
    locationName
  );
  void exportTableToSheets({ headers, rows, feature: "rank_tracking" });
}
function exportRankTrackingCsv(sorted, showDesktop, showMobile, domain, locationName) {
  if (sorted.length === 0) {
    toast.error("No data to export");
    return;
  }
  const { headers, rows } = buildRankTrackingExport(
    sorted,
    showDesktop,
    showMobile,
    locationName
  );
  const csvRows = rows.map(
    (row) => row.map(
      (cell, idx) => idx === 3 && typeof cell === "number" ? cell.toFixed(2) : cell
    )
  );
  downloadCsv(`rank-tracking-${domain}.csv`, buildCsv(headers, csvRows));
  captureClientEvent("rank_tracking:export_csv");
}
function toPath(url) {
  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
}
function toFullUrl(url, domain) {
  if (url.startsWith("http")) return url;
  return `https://${domain}${url}`;
}
const HEADER_TOOLTIPS = {
  keyword: "The search term being tracked in Google",
  volume: "Estimated monthly search volume from Google",
  kd: "Keyword difficulty score (0-100) — higher means harder to rank",
  cpc: "Average cost per click in Google Ads (USD)",
  desktopPosition: "Current Google ranking position, showing change from the comparison period",
  mobilePosition: "Current Google ranking position, showing change from the comparison period",
  url: "The page on your site that ranks for this keyword",
  serp: "Special result features appearing on the search results page (e.g. AI Overview, People Also Ask)"
};
function SortableHeader({
  column,
  label,
  id,
  tooltip
}) {
  const sorted = column.getIsSorted();
  return /* @__PURE__ */ jsxs(
    "button",
    {
      type: "button",
      className: "inline-flex items-center gap-1 text-xs uppercase tracking-wide font-medium text-base-content/60 transition-colors hover:text-base-content",
      onClick: column.getToggleSortingHandler(),
      title: tooltip ?? HEADER_TOOLTIPS[id],
      "aria-label": `Sort by ${label}`,
      "aria-pressed": !!sorted,
      children: [
        label,
        sorted === "asc" ? /* @__PURE__ */ jsx(ArrowUp, { className: "size-3 shrink-0" }) : sorted === "desc" ? /* @__PURE__ */ jsx(ArrowDown, { className: "size-3 shrink-0" }) : null
      ]
    }
  );
}
function makeVolumeColumn(locationLabel) {
  return {
    id: "volume",
    accessorFn: (row) => row.searchVolume ?? void 0,
    header: ({ column }) => /* @__PURE__ */ jsx(
      SortableHeader,
      {
        column,
        label: locationLabel ? "Local volume" : "Volume",
        id: "volume",
        tooltip: locationLabel ? `Estimated monthly searches in ${locationLabel} from Google Ads` : void 0
      }
    ),
    size: 90,
    cell: ({ getValue }) => /* @__PURE__ */ jsx(VolumeCell, { value: getValue() ?? null }),
    sortUndefined: "last"
  };
}
const kdColumn = {
  id: "kd",
  accessorFn: (row) => row.keywordDifficulty ?? void 0,
  header: ({ column }) => /* @__PURE__ */ jsx(SortableHeader, { column, label: "KD", id: "kd" }),
  size: 70,
  cell: ({ getValue }) => /* @__PURE__ */ jsx(DifficultyCell, { value: getValue() ?? null }),
  sortUndefined: "last"
};
const cpcColumn = {
  id: "cpc",
  accessorFn: (row) => row.cpc ?? void 0,
  header: ({ column }) => /* @__PURE__ */ jsx(SortableHeader, { column, label: "CPC", id: "cpc" }),
  size: 80,
  cell: ({ getValue }) => /* @__PURE__ */ jsx(CpcCell, { value: getValue() ?? null }),
  sortUndefined: "last"
};
function makeKeywordColumn(onKeywordClick) {
  return {
    id: "keyword",
    accessorKey: "keyword",
    header: ({ column }) => /* @__PURE__ */ jsx(SortableHeader, { column, label: "Keyword", id: "keyword" }),
    cell: ({ row }) => /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        className: "font-medium text-left link link-hover decoration-dotted underline-offset-2",
        onClick: () => onKeywordClick(row.original),
        title: "View position history",
        children: row.original.keyword
      }
    ),
    sortingFn: "alphanumeric"
  };
}
function makeDeviceColumn(device) {
  const id = device === "desktop" ? "desktopPosition" : "mobilePosition";
  return {
    id,
    accessorFn: (row) => row[device].position ?? void 0,
    header: ({ column }) => /* @__PURE__ */ jsx(SortableHeader, { column, label: "Position", id }),
    size: 120,
    maxSize: 140,
    cell: ({ row }) => /* @__PURE__ */ jsx(DeviceRankCell, { result: row.original[device] }),
    sortUndefined: "last"
  };
}
function makeUrlColumn(device, domain) {
  return {
    id: device === "desktop" ? "desktopUrl" : "mobileUrl",
    enableSorting: false,
    header: () => /* @__PURE__ */ jsx(
      "span",
      {
        className: "text-xs uppercase tracking-wide font-medium text-base-content/60 cursor-help",
        title: HEADER_TOOLTIPS.url,
        children: "URL"
      }
    ),
    size: 240,
    cell: ({ row }) => /* @__PURE__ */ jsx(DeviceUrlCell, { result: row.original[device], domain })
  };
}
function makeSerpColumn(device) {
  return {
    id: device === "desktop" ? "desktopSerp" : "mobileSerp",
    enableSorting: false,
    header: () => /* @__PURE__ */ jsx(
      "span",
      {
        className: "text-xs uppercase tracking-wide font-medium text-base-content/60 cursor-help",
        title: HEADER_TOOLTIPS.serp,
        children: "SERP Features"
      }
    ),
    cell: ({ row }) => {
      const features = row.original[device].serpFeatures;
      if (features.length === 0) return null;
      return /* @__PURE__ */ jsx(SerpFeatureTags, { features });
    }
  };
}
function useRankTrackingColumns(options) {
  const {
    showDesktop,
    showMobile,
    domain,
    selectAnchorRef,
    onKeywordClick,
    locationName
  } = options;
  const locationLabel = locationName ? formatLocationLabel(locationName, 2) : void 0;
  return useMemo(() => {
    const cols = [
      makeSelectionColumn(selectAnchorRef),
      makeKeywordColumn(onKeywordClick)
    ];
    if (showDesktop) {
      cols.push(makeDeviceColumn("desktop"));
      cols.push(makeUrlColumn("desktop", domain));
    }
    if (showMobile) {
      cols.push(makeDeviceColumn("mobile"));
      cols.push(makeUrlColumn("mobile", domain));
    }
    cols.push(makeVolumeColumn(locationLabel), kdColumn, cpcColumn);
    if (showDesktop) {
      cols.push(makeSerpColumn("desktop"));
    }
    if (showMobile) {
      cols.push(makeSerpColumn("mobile"));
    }
    return cols;
  }, [
    showDesktop,
    showMobile,
    domain,
    selectAnchorRef,
    onKeywordClick,
    locationLabel
  ]);
}
const PRE_SELECT_COUNT = 20;
const baseColumns = [
  {
    id: "keyword",
    accessorKey: "keyword",
    header: ({ column }) => /* @__PURE__ */ jsx(
      SortableHeader,
      {
        column,
        label: "Keyword",
        id: "keyword",
        tooltip: "The search term this domain ranks for"
      }
    ),
    cell: ({ getValue }) => /* @__PURE__ */ jsx("span", { className: "font-medium", children: getValue() }),
    sortingFn: "alphanumeric"
  },
  {
    id: "position",
    accessorKey: "position",
    header: ({ column }) => /* @__PURE__ */ jsx(
      SortableHeader,
      {
        column,
        label: "Position",
        id: "position",
        tooltip: "Current Google ranking position"
      }
    ),
    cell: ({ getValue }) => {
      const pos = getValue();
      return pos != null ? pos : /* @__PURE__ */ jsx("span", { className: "text-base-content/40", children: "—" });
    },
    sortingFn: (rowA, rowB) => {
      const a = rowA.original.position ?? 999;
      const b = rowB.original.position ?? 999;
      return a - b;
    }
  },
  {
    id: "searchVolume",
    accessorKey: "searchVolume",
    header: ({ column }) => /* @__PURE__ */ jsx(
      SortableHeader,
      {
        column,
        label: "Volume",
        id: "searchVolume",
        tooltip: "Monthly search volume"
      }
    ),
    cell: ({ getValue }) => {
      const vol = getValue();
      return vol != null ? vol.toLocaleString() : /* @__PURE__ */ jsx("span", { className: "text-base-content/40", children: "—" });
    },
    sortingFn: (rowA, rowB) => {
      const a = rowA.original.searchVolume ?? 0;
      const b = rowB.original.searchVolume ?? 0;
      return a - b;
    }
  },
  {
    id: "traffic",
    accessorKey: "traffic",
    header: ({ column }) => /* @__PURE__ */ jsx(
      SortableHeader,
      {
        column,
        label: "Traffic",
        id: "traffic",
        tooltip: "Estimated monthly organic traffic"
      }
    ),
    cell: ({ getValue }) => {
      const traffic = getValue();
      return traffic != null ? Math.round(traffic).toLocaleString() : /* @__PURE__ */ jsx("span", { className: "text-base-content/40", children: "—" });
    },
    sortingFn: (rowA, rowB) => {
      const a = rowA.original.traffic ?? 0;
      const b = rowB.original.traffic ?? 0;
      return a - b;
    }
  }
];
function KeywordSuggestionStep({
  configId,
  projectId,
  domain,
  locationCode,
  onDone,
  onClose
}) {
  const [rowSelection, setRowSelection] = useState({});
  const [hasInitialized, setHasInitialized] = useState(false);
  const [sorting, setSorting] = useState([
    { id: "traffic", desc: true }
  ]);
  const selectAnchorRef = useRef(null);
  const columns = useMemo(
    () => [
      makeSelectionColumn(selectAnchorRef),
      ...baseColumns
    ],
    []
  );
  const labsSupported = isLabsLocationCode(locationCode);
  const suggestionsQuery = useQuery({
    queryKey: ["domainKeywordSuggestions", projectId, domain, locationCode],
    queryFn: () => getDomainKeywordSuggestions({
      data: { projectId, domain, locationCode }
    }),
    enabled: labsSupported
  });
  const data = suggestionsQuery.data ?? [];
  useEffect(() => {
    const items = suggestionsQuery.data;
    if (items && items.length > 0 && !hasInitialized) {
      const indexed = items.map((item, i) => ({
        index: i,
        traffic: item.traffic ?? 0
      }));
      indexed.sort((a, b) => b.traffic - a.traffic);
      const initial = {};
      for (let i = 0; i < Math.min(PRE_SELECT_COUNT, indexed.length); i++) {
        initial[indexed[i].index] = true;
      }
      setRowSelection(initial);
      setHasInitialized(true);
    }
  }, [suggestionsQuery.data, hasInitialized]);
  const table = useAppTable({
    data,
    columns,
    state: { rowSelection, sorting },
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    withSorting: true,
    enableRowSelection: true
  });
  const selectedCount = Object.keys(rowSelection).filter(
    (k) => rowSelection[k]
  ).length;
  const addMutation = useMutation({
    mutationFn: (keywords) => addTrackingKeywords({ data: { projectId, configId, keywords } }),
    onSuccess: (result) => {
      toast.success(`Added ${result.added} keywords for tracking`);
      onDone(configId);
    },
    onError: (error) => {
      toast.error(getStandardErrorMessage(error, "Failed to add keywords"));
    }
  });
  const handleAdd = () => {
    const selectedKeywords = table.getSelectedRowModel().rows.map((row) => row.original.keyword);
    if (selectedKeywords.length > 0) {
      addMutation.mutate(selectedKeywords);
    }
  };
  const sectionHeader = (title) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
    /* @__PURE__ */ jsx("h2", { id: "keyword-suggestions-title", className: "text-lg font-semibold", children: title }),
    /* @__PURE__ */ jsx("button", { className: "btn btn-ghost btn-sm btn-square", onClick: onClose, children: /* @__PURE__ */ jsx(X, { className: "size-4" }) })
  ] });
  if (!labsSupported) {
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      sectionHeader("Add keywords manually"),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center gap-3 py-16", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs text-base-content/50", children: "Ranked-keyword suggestions aren't available for this country. Continue and add the keywords you want to track manually." }),
        /* @__PURE__ */ jsx("button", { className: "btn btn-primary btn-sm mt-2", onClick: onClose, children: "Continue" })
      ] })
    ] });
  }
  if (suggestionsQuery.isLoading) {
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      sectionHeader("Finding your top keywords..."),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center gap-3 py-16", children: [
        /* @__PURE__ */ jsx(Loader2, { className: "size-8 animate-spin text-primary" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-base-content/50", children: "This usually takes a few seconds" })
      ] })
    ] });
  }
  if (suggestionsQuery.isError) {
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      sectionHeader("Couldn't fetch keywords"),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center gap-3 py-16", children: [
        /* @__PURE__ */ jsx(AlertCircle, { className: "size-8 text-error" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-base-content/50", children: "You can skip this step and add keywords manually later." }),
        /* @__PURE__ */ jsx("div", { className: "flex gap-2 mt-2", children: /* @__PURE__ */ jsx("button", { className: "btn btn-primary btn-sm", onClick: onClose, children: "Skip" }) })
      ] })
    ] });
  }
  if (data.length === 0) {
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      sectionHeader("No rankings found"),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center gap-3 py-16", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-base-content/50", children: [
          "We couldn't find any keywords ",
          domain,
          " currently ranks for. You can add keywords manually."
        ] }),
        /* @__PURE__ */ jsx("button", { className: "btn btn-primary btn-sm mt-2", onClick: onClose, children: "Skip" })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3", children: [
    sectionHeader("Choose keywords to track"),
    /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxs("p", { className: "text-sm text-base-content/60", children: [
      "We found ",
      data.length,
      " keywords ",
      domain,
      " ranks for."
    ] }) }),
    /* @__PURE__ */ jsx(
      AppDataTable,
      {
        table,
        className: "table table-xs table-pin-rows w-full",
        wrapperClassName: "overflow-y-auto max-h-[400px] border border-base-300 rounded-lg",
        stickyHeader: true,
        getRowProps: (row) => ({
          className: "hover:bg-base-200/50 cursor-pointer",
          onClick: (event) => {
            if (applyShiftRangeSelection(event, row, table, selectAnchorRef)) {
              return;
            }
            row.toggleSelected();
          }
        })
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3 pt-1", children: [
      /* @__PURE__ */ jsxs("p", { className: "text-xs text-base-content/60", children: [
        selectedCount,
        " of ",
        data.length,
        " selected"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("button", { className: "btn btn-ghost btn-sm", onClick: onClose, children: "Skip" }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            className: "btn btn-primary btn-sm",
            onClick: handleAdd,
            disabled: addMutation.isPending || selectedCount === 0,
            children: [
              addMutation.isPending && /* @__PURE__ */ jsx(Loader2, { className: "size-3.5 animate-spin" }),
              "Save Keyword",
              selectedCount !== 1 ? "s" : ""
            ]
          }
        )
      ] })
    ] })
  ] });
}
function useSaveConfigMutations(input) {
  const { projectId, existingConfig, fields, onCreated, onUpdated } = input;
  const common = {
    devices: fields.devices,
    serpDepth: fields.serpDepth,
    locationCode: fields.locationCode,
    languageCode: fields.languageCode,
    scheduleInterval: fields.schedule
  };
  const createMutation = useMutation({
    mutationFn: (normalizedDomain) => createRankTrackingConfig({
      data: {
        projectId,
        domain: normalizedDomain,
        ...common,
        locationName: fields.targetingMode === "local" ? fields.locationName : void 0
      }
    }),
    onSuccess: (result) => {
      captureClientEvent("rank_tracking:config_create");
      toast.success("Domain added for rank tracking");
      onCreated(result.id);
    },
    onError: (error) => {
      toast.error(getStandardErrorMessage(error, "Failed to save config"));
    }
  });
  const updateMutation = useMutation({
    mutationFn: (normalizedDomain) => updateRankTrackingConfig({
      data: {
        projectId,
        configId: existingConfig.id,
        domain: normalizedDomain,
        ...common,
        // null clears a previously-set local target; undefined would leave
        // the old location_name in the DB and silently keep city targeting.
        locationName: fields.targetingMode === "local" ? fields.locationName : null
      }
    }),
    onSuccess: () => {
      captureClientEvent("rank_tracking:config_update");
      toast.success("Configuration updated");
      onUpdated();
    },
    onError: (error) => {
      toast.error(getStandardErrorMessage(error, "Failed to update config"));
    }
  });
  return { createMutation, updateMutation };
}
function RankTrackingConfigModal({
  projectId,
  existingConfig,
  onClose,
  onSaved,
  onConfigCreated
}) {
  const projectMarket = useProjectMarket(projectId);
  if (!existingConfig && !projectMarket) {
    return /* @__PURE__ */ jsxs(
      Modal,
      {
        maxWidth: "max-w-lg",
        onClose,
        labelledBy: "rank-config-modal-title",
        children: [
          /* @__PURE__ */ jsx("h2", { id: "rank-config-modal-title", className: "sr-only", children: "Add Domain" }),
          /* @__PURE__ */ jsx("div", { className: "flex min-h-40 items-center justify-center", children: /* @__PURE__ */ jsx(Loader2, { className: "size-5 animate-spin text-base-content/50" }) })
        ]
      }
    );
  }
  return /* @__PURE__ */ jsx(
    RankTrackingConfigModalContent,
    {
      projectId,
      existingConfig,
      initialMarket: existingConfig ?? projectMarket,
      onClose,
      onSaved,
      onConfigCreated
    }
  );
}
function RankTrackingConfigModalContent({
  projectId,
  existingConfig,
  initialMarket,
  onClose,
  onSaved,
  onConfigCreated
}) {
  const isEdit = !!existingConfig;
  const [step, setStep] = useState("config");
  const [domain, setDomain] = useState(existingConfig?.domain ?? "");
  const [devices, setDevices] = useState(
    existingConfig?.devices ?? "mobile"
  );
  const [locationCode, setLocationCode] = useState(
    existingConfig?.locationCode ?? initialMarket.locationCode
  );
  const [languageCode, setLanguageCode] = useState(
    existingConfig?.languageCode ?? initialMarket.languageCode
  );
  const [serpDepth, setSerpDepth] = useState(existingConfig?.serpDepth ?? 40);
  const [schedule, setSchedule] = useState(existingConfig?.scheduleInterval ?? "weekly");
  const [targetingMode, setTargetingMode] = useState(
    existingConfig?.locationName ? "local" : "national"
  );
  const [locationName, setLocationName] = useState(
    existingConfig?.locationName ?? void 0
  );
  const [createdConfigId, setCreatedConfigId] = useState(null);
  const selectedCountryCode = useMemo(
    () => getIsoCountryCode(locationCode),
    [locationCode]
  );
  const { createMutation, updateMutation } = useSaveConfigMutations({
    projectId,
    existingConfig,
    fields: {
      devices,
      serpDepth,
      locationCode,
      languageCode,
      targetingMode,
      locationName,
      schedule
    },
    onCreated: (configId) => {
      setCreatedConfigId(configId);
      onConfigCreated?.();
      setStep("keywords");
    },
    onUpdated: () => onSaved()
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isPending) return;
    if (!domain.trim()) {
      toast.error("Please enter a domain");
      return;
    }
    if (targetingMode === "local" && !locationName) {
      toast.error("Please select a city or region for local targeting");
      return;
    }
    const parsedDomain = domainField.safeParse(domain);
    if (!parsedDomain.success) {
      toast.error("Please enter a valid domain");
      return;
    }
    setDomain(parsedDomain.data);
    if (isEdit) {
      updateMutation.mutate(parsedDomain.data);
    } else {
      createMutation.mutate(parsedDomain.data);
    }
  };
  const handleDomainBlur = () => {
    try {
      setDomain(normalizeDomain(domain));
    } catch {
    }
  };
  const isPending = createMutation.isPending || updateMutation.isPending;
  if (step === "keywords" && createdConfigId) {
    const closeKeywordStep = () => onSaved(createdConfigId);
    return /* @__PURE__ */ jsx(
      Modal,
      {
        maxWidth: "max-w-3xl",
        onClose: closeKeywordStep,
        labelledBy: "keyword-suggestions-title",
        children: /* @__PURE__ */ jsx(
          KeywordSuggestionStep,
          {
            configId: createdConfigId,
            projectId,
            domain,
            locationCode,
            onDone: (id) => onSaved(id),
            onClose: closeKeywordStep
          }
        )
      }
    );
  }
  return /* @__PURE__ */ jsxs(
    Modal,
    {
      maxWidth: "max-w-lg",
      onClose,
      labelledBy: "rank-config-modal-title",
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("h2", { id: "rank-config-modal-title", className: "text-lg font-semibold", children: isEdit ? "Edit Domain Config" : "Add Domain" }),
          /* @__PURE__ */ jsx("button", { className: "btn btn-ghost btn-sm btn-square", onClick: onClose, children: /* @__PURE__ */ jsx(X, { className: "size-4" }) })
        ] }),
        /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "flex flex-col gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "form-control", children: [
            /* @__PURE__ */ jsx("label", { className: "label", children: /* @__PURE__ */ jsx("span", { className: "label-text font-medium", children: "Target Domain" }) }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                placeholder: "example.com",
                className: "input input-bordered w-full",
                value: domain,
                onChange: (e) => setDomain(e.target.value),
                onBlur: handleDomainBlur
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "form-control", children: [
            /* @__PURE__ */ jsx("label", { className: "label", children: /* @__PURE__ */ jsx("span", { className: "label-text font-medium", children: "Country" }) }),
            /* @__PURE__ */ jsx(
              LocationSelect,
              {
                value: locationCode,
                onChange: (newLocationCode) => {
                  setLocationCode(newLocationCode);
                  setLanguageCode(getLanguageCode(newLocationCode));
                  setLocationName(void 0);
                }
              }
            )
          ] }),
          /* @__PURE__ */ jsx(
            SearchTargetingField,
            {
              mode: targetingMode,
              onModeChange: setTargetingMode,
              locationName,
              onLocationNameChange: setLocationName,
              countryCode: selectedCountryCode
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "form-control", children: [
            /* @__PURE__ */ jsx("label", { className: "label", children: /* @__PURE__ */ jsx("span", { className: "label-text font-medium", children: "Language" }) }),
            /* @__PURE__ */ jsx(
              "select",
              {
                className: "select select-bordered w-full",
                value: languageCode,
                onChange: (e) => setLanguageCode(e.target.value),
                children: SERP_LANGUAGE_OPTIONS.map((language) => /* @__PURE__ */ jsx("option", { value: language.code, children: language.label }, language.code))
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "mt-1.5 text-xs text-base-content/50", children: "Defaults to the country's language. Any language can be tracked in any country — pick the one your customers search in." })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "form-control", children: [
            /* @__PURE__ */ jsx("label", { className: "label", children: /* @__PURE__ */ jsx("span", { className: "label-text font-medium", children: "Devices" }) }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                className: "select select-bordered w-full",
                value: devices,
                onChange: (e) => {
                  const value = e.target.value;
                  if (value === "both" || value === "desktop" || value === "mobile") {
                    setDevices(value);
                  }
                },
                children: [
                  /* @__PURE__ */ jsx("option", { value: "both", children: "Desktop + Mobile" }),
                  /* @__PURE__ */ jsx("option", { value: "desktop", children: "Desktop only" }),
                  /* @__PURE__ */ jsx("option", { value: "mobile", children: "Mobile only" })
                ]
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "mt-1.5 text-xs text-base-content/50", children: "Most Google searches come from mobile, but select this based on your customer." }),
            devices === "both" && /* @__PURE__ */ jsxs("div", { className: "mt-1.5 flex items-start gap-1.5 text-xs text-info", children: [
              /* @__PURE__ */ jsx(Info, { className: "size-3.5 shrink-0 mt-0.5" }),
              /* @__PURE__ */ jsx("span", { children: "Tracking both devices uses 2x credits per keyword check" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "form-control", children: [
            /* @__PURE__ */ jsx("label", { className: "label", children: /* @__PURE__ */ jsx("span", { className: "label-text font-medium", children: "Schedule" }) }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                className: "select select-bordered w-full",
                value: schedule,
                onChange: (e) => {
                  const value = e.target.value;
                  if (value === "daily" || value === "weekly" || value === "monthly" || value === "manual") {
                    setSchedule(value);
                  }
                },
                children: [
                  /* @__PURE__ */ jsx("option", { value: "daily", children: "Daily" }),
                  /* @__PURE__ */ jsx("option", { value: "weekly", children: "Weekly" }),
                  /* @__PURE__ */ jsx("option", { value: "monthly", children: "Monthly (end of month)" }),
                  /* @__PURE__ */ jsx("option", { value: "manual", children: "Manual only" })
                ]
              }
            ),
            schedule === "daily" && /* @__PURE__ */ jsxs("div", { className: "mt-1.5 flex items-start gap-1.5 text-xs text-warning", children: [
              /* @__PURE__ */ jsx(Info, { className: "size-3.5 shrink-0 mt-0.5" }),
              /* @__PURE__ */ jsx("span", { children: "Daily checks use 7x more credits than weekly" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "form-control", children: [
            /* @__PURE__ */ jsx("label", { className: "label", children: /* @__PURE__ */ jsx("span", { className: "label-text font-medium", children: "Search Depth" }) }),
            /* @__PURE__ */ jsx(
              "select",
              {
                className: "select select-bordered w-full",
                value: depthToPages(serpDepth),
                onChange: (e) => setSerpDepth(pagesToDepth(Number(e.target.value))),
                children: Array.from({ length: 10 }, (_, i) => i + 1).map((pages) => /* @__PURE__ */ jsxs("option", { value: pages, children: [
                  pages,
                  " ",
                  pages === 1 ? "page" : "pages",
                  " (top ",
                  pages * 10,
                  " ",
                  "results)"
                ] }, pages))
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "mt-1.5 text-xs text-base-content/50", children: "10 pages is ~8x more expensive than 1 page" })
          ] }),
          (() => {
            const { costUsd: costPerKeyword } = estimateRankCheckCredits(
              1,
              devices,
              serpDepth,
              schedule === "manual" ? "live" : "queued"
            );
            const checksPerMonth = schedule === "daily" ? 30 : schedule === "weekly" ? 4 : 1;
            return /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-base-200/50 px-3 py-2.5 text-xs text-base-content/70 space-y-0.5", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("span", { className: "font-mono font-semibold text-base-content", children: [
                  "~$",
                  costPerKeyword.toFixed(4)
                ] }),
                " ",
                "per keyword per check"
              ] }),
              schedule !== "manual" && /* @__PURE__ */ jsxs("div", { children: [
                "50 keywords would cost",
                " ",
                /* @__PURE__ */ jsxs("span", { className: "font-mono font-semibold text-base-content", children: [
                  "~$",
                  (costPerKeyword * 50 * checksPerMonth).toFixed(2)
                ] }),
                "/month"
              ] })
            ] });
          })(),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2 pt-2", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                className: "btn btn-ghost btn-sm",
                onClick: onClose,
                children: "Cancel"
              }
            ),
            /* @__PURE__ */ jsxs(
              "button",
              {
                type: "submit",
                className: "btn btn-primary btn-sm",
                disabled: isPending || !domain.trim(),
                children: [
                  isPending && /* @__PURE__ */ jsx(Loader2, { className: "size-3.5 animate-spin" }),
                  isEdit ? "Save Changes" : "Add Domain"
                ]
              }
            )
          ] })
        ] })
      ]
    }
  );
}
export {
  DomainListFilterBar as D,
  EMPTY_DOMAIN_LIST_FILTERS as E,
  FilterPanel as F,
  RankTrackingConfigModal as R,
  applyDomainListFilters as a,
  getDomainListFilterOptions as b,
  countActiveDomainListFilters as c,
  getRankConfigTrend as d,
  getRankKeywordHistory as e,
  DeviceRankCell as f,
  getRankTrackingConfigSummaries as g,
  csvChange as h,
  useRankTrackingColumns as i,
  buildRankTrackingExport as j,
  addTrackingKeywords as k,
  refreshTrackingKeywordMetrics as l,
  getLatestRankRun as m,
  EMPTY_FILTERS as n,
  getLatestRankResults as o,
  getRankPositionMatrix as p,
  estimateRankCheckCost as q,
  removeTrackingKeywords as r,
  applyFilters as s,
  triggerRankCheck as t,
  updateRankTrackingConfig as u,
  countActiveFilters as v,
  exportRankTrackingToSheets as w,
  exportRankTrackingCsv as x,
  getRankTrackingConfigs as y
};
