import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState, useRef, useCallback, useMemo } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { d as getRankConfigTrend, e as getRankKeywordHistory, f as DeviceRankCell, h as csvChange, i as useRankTrackingColumns, r as removeTrackingKeywords, j as buildRankTrackingExport, k as addTrackingKeywords, l as refreshTrackingKeywordMetrics, t as triggerRankCheck, m as getLatestRankRun, n as EMPTY_FILTERS, o as getLatestRankResults, p as getRankPositionMatrix, q as estimateRankCheckCost, s as applyFilters, v as countActiveFilters, w as exportRankTrackingToSheets, x as exportRankTrackingCsv, F as FilterPanel, y as getRankTrackingConfigs, R as RankTrackingConfigModal } from "./RankTrackingConfigModal-BCOkc8Nj.js";
import { toast } from "sonner";
import { useCustomer } from "autumn-js/react";
import { AlertTriangle, Monitor, Smartphone, Settings, Plus, Loader2, Copy, Download, Trash2, Sheet, FileDown, Play, RefreshCw, MoreHorizontal, ChevronDown, Table, CalendarDays, SlidersHorizontal, Zap, ArrowLeft } from "lucide-react";
import { E as buildCsv, c as captureClientEvent, D as downloadCsv, a3 as useAppTable, p as getStandardErrorMessage, a5 as TableBulkActionBar, a6 as TableBulkActionButton, am as TableBulkExportMenu, a4 as AppDataTable, a8 as exportTableToSheets, u as useSession, t as getCustomerPlanStatus, an as Route } from "./router-BZ-5uDXB.js";
import { aI as SUBSCRIBE_ROUTE, br as LOCATIONS, bf as formatLocationLabel, bs as devicesLabel, bt as scheduleLabel, ar as MAX_TRACKED_KEYWORD_LENGTH, c8 as estimateRankCheckCredits, ce as devicesCount, cf as KEYWORDS_PER_BATCH, cg as SECONDS_PER_BATCH } from "../entry.js";
import { LineChart, CartesianGrid, ReferenceArea, XAxis, YAxis, Tooltip, Line, AreaChart, Area } from "recharts";
import { M as Modal } from "./Modal-81iy_nBW.js";
import "./LocationSelect-DeLtP58P.js";
import "./useProjectMarket-Bj0dmApz.js";
import "./projects-D9ZqZqTc.js";
import "./middleware-CvzXieP6.js";
import "zod";
import "./domain-CvR3nkey.js";
import "./rank-tracking-BD8SoYpX.js";
import "@tanstack/query-core";
import "./selfHostedOAuth-DmcaPqZ5.js";
import "drizzle-orm";
import "jose";
import "./ai-search-BV1mIqc0.js";
import "./audit-SZdMhI6q.js";
import "react-dom";
import "@tanstack/react-form";
import "@better-auth/api-key/client";
import "papaparse";
import "@tanstack/react-table";
import "remeda";
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
function FreePlanAlert({ visible }) {
  if (!visible) return null;
  return /* @__PURE__ */ jsxs("div", { className: "alert alert-warning text-sm py-2", children: [
    /* @__PURE__ */ jsx(AlertTriangle, { className: "size-4" }),
    /* @__PURE__ */ jsxs("span", { children: [
      "We only start to track keyword positions once you",
      " ",
      /* @__PURE__ */ jsx(
        Link,
        {
          to: SUBSCRIBE_ROUTE,
          search: { upgrade: true },
          className: "link font-medium",
          children: "upgrade to the paid plan"
        }
      ),
      "."
    ] })
  ] });
}
function SegmentedToggle({
  items,
  value,
  onChange,
  showLabels = false
}) {
  return /* @__PURE__ */ jsx("div", { className: "inline-flex rounded-lg bg-base-300 p-0.5", children: items.map((item) => /* @__PURE__ */ jsxs(
    "button",
    {
      className: `btn btn-xs gap-1.5 px-2 ${value === item.value ? "bg-primary/20 text-primary shadow-sm" : "btn-ghost text-base-content/40"}`,
      onClick: () => onChange(item.value),
      title: item.label,
      children: [
        item.icon,
        showLabels && item.label
      ]
    },
    item.value
  )) });
}
const COMPARE_PERIODS = /* @__PURE__ */ new Set([
  "1d",
  "7d",
  "30d",
  "90d"
]);
function isComparePeriod(v) {
  return COMPARE_PERIODS.has(v);
}
function RankTrackingDetailHeader({
  config,
  run,
  costEstimate,
  hasBothDevices,
  activeDevice,
  onActiveDeviceChange,
  comparePeriod,
  onComparePeriodChange,
  onEdit,
  onToggleAddKeywords
}) {
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row sm:items-start justify-between gap-2 px-4 pt-4 pb-3", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: config.domain }),
      /* @__PURE__ */ jsxs("p", { className: "text-xs text-base-content/60", children: [
        config.locationName ? formatLocationLabel(config.locationName, 2) : LOCATIONS[config.locationCode] ?? "US",
        " ",
        "· ",
        devicesLabel(config.devices),
        " ·",
        " ",
        scheduleLabel(config.scheduleInterval),
        run?.lastCheckedAt && /* @__PURE__ */ jsxs(Fragment, { children: [
          " ",
          "· Last: ",
          new Date(run.lastCheckedAt).toLocaleDateString()
        ] }),
        costEstimate && costEstimate.keywordCount > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
          " · ~$",
          costEstimate.costUsd.toFixed(2),
          "/check"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
      hasBothDevices && /* @__PURE__ */ jsx(
        SegmentedToggle,
        {
          items: [
            {
              value: "desktop",
              icon: /* @__PURE__ */ jsx(Monitor, { className: "size-3.5" }),
              label: "Desktop"
            },
            {
              value: "mobile",
              icon: /* @__PURE__ */ jsx(Smartphone, { className: "size-3.5" }),
              label: "Mobile"
            }
          ],
          value: activeDevice,
          onChange: onActiveDeviceChange
        }
      ),
      /* @__PURE__ */ jsxs(
        "select",
        {
          className: "select select-bordered select-sm text-xs w-auto",
          title: "Comparison period",
          value: comparePeriod,
          onChange: (e) => {
            if (isComparePeriod(e.target.value))
              onComparePeriodChange(e.target.value);
          },
          children: [
            /* @__PURE__ */ jsx("option", { value: "1d", children: "vs yesterday" }),
            /* @__PURE__ */ jsx("option", { value: "7d", children: "vs last week" }),
            /* @__PURE__ */ jsx("option", { value: "30d", children: "vs last month" }),
            /* @__PURE__ */ jsx("option", { value: "90d", children: "vs 90 days ago" })
          ]
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "hidden sm:block h-6 w-px bg-base-300" }),
      /* @__PURE__ */ jsxs("button", { className: "btn btn-sm gap-1", onClick: onEdit, children: [
        /* @__PURE__ */ jsx(Settings, { className: "size-3.5" }),
        "Configure"
      ] }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          className: "btn btn-primary btn-sm gap-1",
          onClick: onToggleAddKeywords,
          children: [
            /* @__PURE__ */ jsx(Plus, { className: "size-3.5" }),
            "Add Keywords"
          ]
        }
      )
    ] })
  ] });
}
function RankTrendChart({
  data,
  series,
  serpDepth,
  height = 224,
  renderTooltip,
  showBottomBand = false
}) {
  const { containerRef, width: chartWidth } = useChartWidth();
  return /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-[11px] text-base-content/50", children: [
      /* @__PURE__ */ jsx("span", { children: "Google position (1 = best)" }),
      /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1", children: [
        "Better ",
        /* @__PURE__ */ jsx("span", { "aria-hidden": true, children: "↑" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { ref: containerRef, className: "w-full min-w-0", style: { height }, children: chartWidth > 0 ? /* @__PURE__ */ jsxs(
      LineChart,
      {
        width: chartWidth,
        height,
        data,
        margin: { top: 8, right: 8, bottom: 0, left: 0 },
        children: [
          /* @__PURE__ */ jsx(
            CartesianGrid,
            {
              strokeDasharray: "3 3",
              stroke: "currentColor",
              opacity: 0.1,
              vertical: false
            }
          ),
          showBottomBand && /* @__PURE__ */ jsx(
            ReferenceArea,
            {
              y1: serpDepth - 0.5,
              y2: serpDepth,
              fill: "currentColor",
              fillOpacity: 0.06,
              ifOverflow: "extendDomain"
            }
          ),
          /* @__PURE__ */ jsx(
            XAxis,
            {
              dataKey: "checkedAt",
              type: "number",
              scale: "time",
              domain: ["dataMin", "dataMax"],
              tickFormatter: formatDateTick,
              tick: { fontSize: 10, fill: "#888" },
              tickLine: false,
              axisLine: false,
              minTickGap: 32
            }
          ),
          /* @__PURE__ */ jsx(
            YAxis,
            {
              reversed: true,
              domain: [1, serpDepth],
              allowDecimals: false,
              tick: { fontSize: 10, fill: "#888" },
              tickLine: false,
              axisLine: false,
              width: 32
            }
          ),
          /* @__PURE__ */ jsx(
            Tooltip,
            {
              content: (props) => {
                const { active, payload, label } = props;
                if (!active || !payload?.length || typeof label !== "number") {
                  return null;
                }
                const entries = payload.map(
                  (p) => ({
                    dataKey: p.dataKey,
                    name: p.name,
                    value: typeof p.value === "number" ? p.value : null,
                    color: p.color
                  })
                );
                return renderTooltip(label, entries);
              },
              cursor: { stroke: "rgba(150,150,150,0.3)" }
            }
          ),
          series.map((s) => /* @__PURE__ */ jsx(
            Line,
            {
              type: "monotone",
              dataKey: s.dataKey,
              name: s.name,
              stroke: s.color,
              strokeWidth: 2,
              strokeDasharray: s.strokeDasharray,
              dot: { r: 2 },
              activeDot: { r: 4 },
              connectNulls: false,
              isAnimationActive: false
            },
            s.dataKey
          ))
        ]
      }
    ) : null })
  ] });
}
function formatDateTick(value) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric"
  });
}
function useChartWidth() {
  const [width, setWidth] = useState(0);
  const observerRef = useRef(null);
  const containerRef = useCallback((el) => {
    observerRef.current?.disconnect();
    observerRef.current = null;
    if (!el) return;
    setWidth(el.clientWidth);
    const observer = new ResizeObserver(() => setWidth(el.clientWidth));
    observer.observe(el);
    observerRef.current = observer;
  }, []);
  return { containerRef, width };
}
const TREND_RANGES = [
  { label: "30d", sinceDays: 30 },
  { label: "90d", sinceDays: 90 },
  { label: "All", sinceDays: 730 }
];
function TrendRangeToggle({
  value,
  onChange
}) {
  return /* @__PURE__ */ jsx("div", { className: "join", children: TREND_RANGES.map((range) => /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      className: `btn btn-xs join-item ${value === range.sinceDays ? "btn-active" : "btn-ghost"}`,
      onClick: () => onChange(range.sinceDays),
      children: range.label
    },
    range.label
  )) });
}
const BUCKETS = [
  { key: "top3", label: "Top 3", color: "#16a34a" },
  { key: "top4to10", label: "4–10", color: "#2563eb" },
  { key: "top11to20", label: "11–20", color: "#f59e0b" },
  { key: "notRanking", label: "Not in top 20", color: "#6b7280" }
];
function RankTrackingOverview({
  device,
  projectId,
  configId
}) {
  const [sinceDays, setSinceDays] = useState(730);
  const { data: trend, isLoading: trendLoading } = useQuery({
    queryKey: ["rankConfigTrend", projectId, configId, device, sinceDays],
    queryFn: () => getRankConfigTrend({
      data: { projectId, configId, device, sinceDays }
    })
  });
  const chartData = useMemo(
    () => (trend ?? []).map((p) => ({
      checkedAt: new Date(p.checkedAt).getTime(),
      top3: p.top3,
      top4to10: p.top4to10,
      top11to20: p.top11to20,
      notRanking: p.notRanking
    })),
    [trend]
  );
  const { containerRef, width } = useChartWidth();
  return /* @__PURE__ */ jsx("div", { className: "px-4 pt-4 pb-4", children: /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-base-300 p-3 space-y-2", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: "Position distribution" }),
      /* @__PURE__ */ jsx(TrendRangeToggle, { value: sinceDays, onChange: setSinceDays })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-x-3 gap-y-1", children: BUCKETS.map((b) => /* @__PURE__ */ jsxs(
      "span",
      {
        className: "inline-flex items-center gap-1 text-[11px] text-base-content/60",
        children: [
          /* @__PURE__ */ jsx(
            "span",
            {
              className: "size-2 rounded-sm",
              style: { backgroundColor: b.color }
            }
          ),
          b.label
        ]
      },
      b.key
    )) }),
    trendLoading ? /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center p-8", children: /* @__PURE__ */ jsx(Loader2, { className: "size-4 animate-spin text-base-content/50" }) }) : chartData.length <= 1 ? /* @__PURE__ */ jsx("div", { className: "rounded-lg border border-dashed border-base-300 p-8 text-center text-xs text-base-content/60", children: chartData.length === 0 ? "No history yet — run a check to start tracking positions over time." : "Only 1 check so far — the trend fills in after the next check." }) : /* @__PURE__ */ jsx(
      "div",
      {
        ref: containerRef,
        className: "w-full min-w-0",
        style: { height: 220 },
        children: width > 0 ? /* @__PURE__ */ jsxs(
          AreaChart,
          {
            width,
            height: 220,
            data: chartData,
            margin: { top: 8, right: 8, bottom: 0, left: 0 },
            children: [
              /* @__PURE__ */ jsx(
                CartesianGrid,
                {
                  strokeDasharray: "3 3",
                  stroke: "currentColor",
                  opacity: 0.1,
                  vertical: false
                }
              ),
              /* @__PURE__ */ jsx(
                XAxis,
                {
                  dataKey: "checkedAt",
                  type: "number",
                  scale: "time",
                  domain: ["dataMin", "dataMax"],
                  tickFormatter: formatDateTick,
                  tick: { fontSize: 10, fill: "#888" },
                  tickLine: false,
                  axisLine: false,
                  minTickGap: 32
                }
              ),
              /* @__PURE__ */ jsx(
                YAxis,
                {
                  allowDecimals: false,
                  tick: { fontSize: 10, fill: "#888" },
                  tickLine: false,
                  axisLine: false,
                  width: 28
                }
              ),
              /* @__PURE__ */ jsx(
                Tooltip,
                {
                  content: (props) => {
                    const { active, payload, label } = props;
                    if (!active || !payload?.length || typeof label !== "number") {
                      return null;
                    }
                    const byKey = new Map(
                      payload.map((p) => [
                        String(p.dataKey),
                        typeof p.value === "number" ? p.value : 0
                      ])
                    );
                    return /* @__PURE__ */ jsx(DistributionTooltip, { label, byKey });
                  },
                  cursor: { stroke: "rgba(150,150,150,0.3)" }
                }
              ),
              BUCKETS.map((b) => /* @__PURE__ */ jsx(
                Area,
                {
                  type: "monotone",
                  dataKey: b.key,
                  name: b.label,
                  stackId: "positions",
                  stroke: b.color,
                  fill: b.color,
                  fillOpacity: 0.7,
                  isAnimationActive: false
                },
                b.key
              ))
            ]
          }
        ) : null
      }
    )
  ] }) });
}
function DistributionTooltip({
  label,
  byKey
}) {
  return /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-base-300 bg-base-100 px-3 py-2 shadow-sm space-y-0.5", children: [
    /* @__PURE__ */ jsx("p", { className: "text-xs text-base-content/60", children: new Date(label).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    }) }),
    BUCKETS.map((b) => /* @__PURE__ */ jsxs("p", { className: "text-xs flex items-center gap-1.5", children: [
      /* @__PURE__ */ jsx(
        "span",
        {
          className: "size-2 rounded-sm",
          style: { backgroundColor: b.color }
        }
      ),
      /* @__PURE__ */ jsxs("span", { className: "text-base-content/60", children: [
        b.label,
        ":"
      ] }),
      /* @__PURE__ */ jsx("span", { className: "font-medium tabular-nums", children: byKey.get(b.key) ?? 0 })
    ] }, b.key))
  ] });
}
const DEVICE_STYLE = {
  desktop: { label: "Desktop", color: "#2563eb" },
  mobile: { label: "Mobile", color: "#14b8a6" }
};
function KeywordTrendModal({
  target,
  projectId,
  configId,
  domain,
  locationCode,
  locationName,
  serpDepth,
  onClose
}) {
  const [sinceDays, setSinceDays] = useState(730);
  const { data: history, isLoading } = useQuery({
    queryKey: [
      "rankKeywordHistory",
      projectId,
      configId,
      target.trackingKeywordId,
      sinceDays
    ],
    queryFn: () => getRankKeywordHistory({
      data: {
        projectId,
        configId,
        trackingKeywordId: target.trackingKeywordId,
        sinceDays
      }
    })
  });
  const points = useMemo(() => history ?? [], [history]);
  const devices = useMemo(() => deriveDevices(points), [points]);
  const maxPerDevice = useMemo(
    () => devices.length === 0 ? 0 : Math.max(
      ...devices.map((d) => points.filter((p) => p.device === d).length)
    ),
    [points, devices]
  );
  const series = devices.map((device) => ({
    dataKey: device,
    name: DEVICE_STYLE[device].label,
    color: DEVICE_STYLE[device].color,
    strokeDasharray: "4 3"
  }));
  const chartData = useMemo(
    () => buildChartData(points, serpDepth),
    [points, serpDepth]
  );
  const bottomBandKeys = useMemo(() => {
    const keys = /* @__PURE__ */ new Set();
    for (const p of points) {
      if (p.position === null) {
        keys.add(`${new Date(p.checkedAt).getTime()}:${p.device}`);
      }
    }
    return keys;
  }, [points]);
  const historyRows = useMemo(() => buildHistoryRows(points), [points]);
  const exportRows = () => historyRows.map((r) => [
    new Date(r.checkedAt).toISOString(),
    DEVICE_STYLE[r.device].label,
    r.position ?? "",
    csvChange(r.position, r.previousPosition)
  ]);
  const handleCopy = () => {
    const headers = ["Date", "Device", "Position", "Change vs previous"];
    void navigator.clipboard.writeText(buildCsv(headers, exportRows()));
    toast.success("Copied to clipboard");
    captureClientEvent("rank_tracking:keyword_trend_copy");
  };
  const handleExport = () => {
    const headers = ["Date", "Device", "Position", "Change vs previous"];
    downloadCsv(
      `rank-history-${slugify(target.keyword)}.csv`,
      buildCsv(headers, exportRows())
    );
    captureClientEvent("rank_tracking:keyword_trend_export");
  };
  return /* @__PURE__ */ jsxs(
    Modal,
    {
      onClose,
      labelledBy: "keyword-trend-title",
      maxWidth: "max-w-3xl",
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { id: "keyword-trend-title", className: "text-lg font-semibold", children: target.keyword }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-base-content/60", children: [
              domain,
              " ·",
              " ",
              locationName ? formatLocationLabel(locationName, 2) : LOCATIONS[locationCode] ?? "US",
              " ",
              "· Position over time"
            ] })
          ] }),
          /* @__PURE__ */ jsx(TrendRangeToggle, { value: sinceDays, onChange: setSinceDays })
        ] }),
        isLoading ? /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-16", children: /* @__PURE__ */ jsx(Loader2, { className: "size-5 animate-spin text-base-content/50" }) }) : maxPerDevice <= 1 ? /* @__PURE__ */ jsx(EmptyState, { count: maxPerDevice }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(
            RankTrendChart,
            {
              data: chartData,
              series,
              serpDepth,
              showBottomBand: true,
              renderTooltip: (label, entries) => /* @__PURE__ */ jsx(
                ChartTooltip,
                {
                  label,
                  entries,
                  serpDepth,
                  bottomBandKeys
                }
              )
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-2", children: [
            /* @__PURE__ */ jsxs("button", { className: "btn btn-ghost btn-xs gap-1", onClick: handleCopy, children: [
              /* @__PURE__ */ jsx(Copy, { className: "size-3.5" }),
              "Copy"
            ] }),
            /* @__PURE__ */ jsxs(
              "button",
              {
                className: "btn btn-ghost btn-xs gap-1",
                onClick: handleExport,
                children: [
                  /* @__PURE__ */ jsx(Download, { className: "size-3.5" }),
                  "Export CSV"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { className: "max-h-64 overflow-auto rounded-lg border border-base-300", children: /* @__PURE__ */ jsxs("table", { className: "table table-sm", children: [
            /* @__PURE__ */ jsx("thead", { className: "sticky top-0 bg-base-100", children: /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("th", { children: "Date" }),
              devices.length > 1 && /* @__PURE__ */ jsx("th", { children: "Device" }),
              /* @__PURE__ */ jsx("th", { children: "Position" }),
              /* @__PURE__ */ jsx("th", { children: "Δ vs previous check" })
            ] }) }),
            /* @__PURE__ */ jsx("tbody", { children: historyRows.map((r, idx) => {
              const noPrevious = r.position !== null && r.previousPosition === null;
              return /* @__PURE__ */ jsxs("tr", { children: [
                /* @__PURE__ */ jsx("td", { className: "whitespace-nowrap text-xs", children: new Date(r.checkedAt).toLocaleDateString() }),
                devices.length > 1 && /* @__PURE__ */ jsx("td", { className: "text-xs", children: DEVICE_STYLE[r.device].label }),
                /* @__PURE__ */ jsx("td", { children: r.position === null ? /* @__PURE__ */ jsxs("span", { className: "text-base-content/40 text-xs", children: [
                  "Not in top ",
                  serpDepth
                ] }) : /* @__PURE__ */ jsx("span", { className: "font-mono text-sm", children: r.position }) }),
                /* @__PURE__ */ jsx("td", { children: noPrevious ? (
                  // Invisible placeholders matching the "before → after"
                  // layout so the lone pill lines up under the position
                  // badge column instead of floating.
                  /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
                    /* @__PURE__ */ jsx("span", { className: "w-6", "aria-hidden": true }),
                    /* @__PURE__ */ jsx("span", { "aria-hidden": true, className: "opacity-0", children: "→" }),
                    /* @__PURE__ */ jsx("span", { className: "font-mono rounded bg-base-200 px-1.5 py-0.5 text-xs font-semibold text-base-content/70", children: r.position })
                  ] })
                ) : /* @__PURE__ */ jsx(
                  DeviceRankCell,
                  {
                    result: {
                      position: r.position,
                      previousPosition: r.previousPosition,
                      rankingUrl: null,
                      serpFeatures: []
                    }
                  }
                ) })
              ] }, `${r.device}-${r.checkedAt}-${idx}`);
            }) })
          ] }) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsx("button", { className: "btn btn-ghost btn-sm", onClick: onClose, children: "Close" }) })
      ]
    }
  );
}
function EmptyState({ count }) {
  return /* @__PURE__ */ jsx("div", { className: "rounded-lg border border-dashed border-base-300 p-10 text-center text-sm text-base-content/60", children: count === 0 ? "No history yet — run a check to start tracking position over time." : "Only 1 check so far — the trend chart fills in after the next check." });
}
function ChartTooltip({
  label,
  entries,
  serpDepth,
  bottomBandKeys
}) {
  return /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-base-300 bg-base-100 px-3 py-2 shadow-sm space-y-0.5", children: [
    /* @__PURE__ */ jsx("p", { className: "text-xs text-base-content/60", children: new Date(label).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    }) }),
    entries.map((e) => {
      const device = e.dataKey === "desktop" || e.dataKey === "mobile" ? DEVICE_STYLE[e.dataKey].label : String(e.dataKey ?? "");
      const inBottomBand = bottomBandKeys.has(`${label}:${e.dataKey}`);
      return /* @__PURE__ */ jsxs("p", { className: "text-sm font-medium", children: [
        device,
        ":",
        " ",
        inBottomBand ? /* @__PURE__ */ jsxs("span", { className: "text-base-content/60", children: [
          "Not in top ",
          serpDepth
        ] }) : e.value
      ] }, String(e.dataKey));
    })
  ] });
}
function deriveDevices(points) {
  const present = new Set(points.map((p) => p.device));
  return ["desktop", "mobile"].filter((d) => present.has(d));
}
function buildChartData(points, serpDepth) {
  const byTime = /* @__PURE__ */ new Map();
  for (const p of points) {
    const ts = new Date(p.checkedAt).getTime();
    const row = byTime.get(ts) ?? { checkedAt: ts };
    row[p.device] = p.position === null ? serpDepth : p.position;
    byTime.set(ts, row);
  }
  return [...byTime.values()].toSorted((a, b) => a.checkedAt - b.checkedAt);
}
function buildHistoryRows(points) {
  const prevByDevice = /* @__PURE__ */ new Map();
  const rows = [];
  for (const p of points) {
    const hadPrevious = prevByDevice.has(p.device);
    rows.push({
      device: p.device,
      checkedAt: p.checkedAt,
      position: p.position,
      previousPosition: hadPrevious ? prevByDevice.get(p.device) ?? null : null
    });
    prevByDevice.set(p.device, p.position);
  }
  return rows.toReversed();
}
function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
function RankTrackingTable({
  totalCount,
  rows,
  resultsLoading,
  showDesktop,
  showMobile,
  defaultSortId,
  domain,
  configId,
  projectId,
  locationCode,
  locationName,
  serpDepth
}) {
  const queryClient = useQueryClient();
  const [showConfirm, setShowConfirm] = useState(false);
  const [trendTarget, setTrendTarget] = useState(
    null
  );
  const selectAnchorRef = useRef(null);
  const handleKeywordClick = useCallback(
    (row) => setTrendTarget({
      trackingKeywordId: row.trackingKeywordId,
      keyword: row.keyword
    }),
    []
  );
  const columns = useRankTrackingColumns({
    showDesktop,
    showMobile,
    domain,
    selectAnchorRef,
    onKeywordClick: handleKeywordClick,
    locationName
  });
  const table = useAppTable({
    data: rows,
    columns,
    initialState: {
      sorting: [{ id: defaultSortId, desc: false }]
    },
    withSorting: true,
    getRowId: (row) => row.trackingKeywordId,
    enableRowSelection: true
  });
  const selectedRows = table.getSelectedRowModel().rows;
  const selectedCount = selectedRows.length;
  const selectedRankRows = selectedRows.map((row) => row.original);
  const exportSelectionToSheets = () => {
    const { headers, rows: exportRows } = buildRankTrackingExport(
      selectedRankRows,
      showDesktop,
      showMobile
    );
    void exportTableToSheets({
      headers,
      rows: exportRows,
      feature: "rank_tracking"
    });
  };
  const exportSelectionCsv = () => {
    const { headers, rows: exportRows } = buildRankTrackingExport(
      selectedRankRows,
      showDesktop,
      showMobile
    );
    const csvRows = exportRows.map(
      (row) => row.map(
        (cell, idx) => idx === 3 && typeof cell === "number" ? cell.toFixed(2) : cell
      )
    );
    downloadCsv(
      `rank-tracking-${domain}-selected.csv`,
      buildCsv(headers, csvRows)
    );
    captureClientEvent("rank_tracking:export_csv", { scope: "selection" });
  };
  const removeMutation = useMutation({
    mutationFn: (keywordIds) => removeTrackingKeywords({ data: { projectId, configId, keywordIds } }),
    onSuccess: (result) => {
      table.resetRowSelection();
      setShowConfirm(false);
      void queryClient.invalidateQueries({
        queryKey: ["rankTrackingResults", projectId, configId]
      });
      void queryClient.invalidateQueries({
        queryKey: ["rankTrackingCostEstimate", projectId, configId]
      });
      toast.success(
        `${result.removed} keyword${result.removed !== 1 ? "s" : ""} removed`
      );
    },
    onError: (error) => {
      toast.error(getStandardErrorMessage(error, "Failed to remove keywords"));
    }
  });
  if (resultsLoading) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center p-8", children: /* @__PURE__ */ jsx(Loader2, { className: "size-5 animate-spin text-base-content/50" }) });
  }
  if (rows.length === 0) {
    return /* @__PURE__ */ jsx("div", { className: "rounded-xl border border-dashed border-base-300 p-10 text-center text-sm text-base-content/55", children: totalCount === 0 ? 'No rank data yet. Click "Check Now" to run your first check.' : "No keywords match your search." });
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      TableBulkActionBar,
      {
        selectedCount,
        onClear: () => table.resetRowSelection(),
        actions: /* @__PURE__ */ jsxs("div", { className: "flex items-center px-1.5", children: [
          /* @__PURE__ */ jsx(
            TableBulkActionButton,
            {
              icon: /* @__PURE__ */ jsx(Trash2, { className: "size-3.5" }),
              onClick: () => setShowConfirm(true),
              variant: "danger",
              children: "Remove"
            }
          ),
          /* @__PURE__ */ jsx(
            TableBulkExportMenu,
            {
              actions: [
                {
                  label: "Export to Sheets",
                  icon: /* @__PURE__ */ jsx(Sheet, { className: "size-4" }),
                  onClick: exportSelectionToSheets
                },
                {
                  label: "Export CSV",
                  icon: /* @__PURE__ */ jsx(FileDown, { className: "size-4" }),
                  onClick: exportSelectionCsv
                }
              ]
            }
          )
        ] })
      }
    ),
    showConfirm && /* @__PURE__ */ jsxs(
      Modal,
      {
        onClose: () => setShowConfirm(false),
        labelledBy: "remove-keywords-title",
        children: [
          /* @__PURE__ */ jsx("h3", { id: "remove-keywords-title", className: "text-lg font-semibold", children: "Remove keywords?" }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-base-content/70", children: [
            "This will stop tracking ",
            selectedCount,
            " keyword",
            selectedCount !== 1 ? "s" : "",
            ". Historical ranking data is preserved but won't appear in the table."
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                className: "btn btn-ghost btn-sm",
                onClick: () => setShowConfirm(false),
                children: "Cancel"
              }
            ),
            /* @__PURE__ */ jsxs(
              "button",
              {
                className: "btn btn-error btn-sm gap-1",
                onClick: () => removeMutation.mutate(selectedRows.map((r) => r.id)),
                disabled: removeMutation.isPending,
                children: [
                  removeMutation.isPending && /* @__PURE__ */ jsx(Loader2, { className: "size-3 animate-spin" }),
                  "Remove ",
                  selectedCount,
                  " keyword",
                  selectedCount !== 1 ? "s" : ""
                ]
              }
            )
          ] })
        ]
      }
    ),
    trendTarget && /* @__PURE__ */ jsx(
      KeywordTrendModal,
      {
        target: trendTarget,
        projectId,
        configId,
        domain,
        locationCode,
        locationName: locationName ?? void 0,
        serpDepth,
        onClose: () => setTrendTarget(null)
      }
    ),
    /* @__PURE__ */ jsx(AppDataTable, { table, getCellClassName: () => "align-top" }),
    /* @__PURE__ */ jsxs("p", { className: "text-xs text-base-content/60 pt-2", children: [
      rows.length,
      " of ",
      totalCount,
      " keywords"
    ] })
  ] });
}
function RankTrackingHistoryMatrix({
  cells,
  isLoading,
  keywords
}) {
  const { runs, cellByKeyword } = useMemo(() => buildMatrix(cells), [cells]);
  if (isLoading) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center p-8", children: /* @__PURE__ */ jsx(Loader2, { className: "size-5 animate-spin text-base-content/50" }) });
  }
  if (runs.length === 0 || keywords.length === 0) {
    return /* @__PURE__ */ jsx("div", { className: "rounded-xl border border-dashed border-base-300 p-10 text-center text-sm text-base-content/55", children: "No history yet. Run a check to start building the timeline." });
  }
  return /* @__PURE__ */ jsx("div", { className: "overflow-x-auto rounded-lg border border-base-300", children: /* @__PURE__ */ jsxs("table", { className: "table table-sm", children: [
    /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
      /* @__PURE__ */ jsx("th", { className: "sticky left-0 z-10 bg-base-100 w-full", children: "Keyword" }),
      runs.map((r) => /* @__PURE__ */ jsx(
        "th",
        {
          className: "w-24 whitespace-nowrap text-right text-xs font-medium text-base-content/60",
          children: formatDate(r.checkedAt)
        },
        r.runId
      ))
    ] }) }),
    /* @__PURE__ */ jsx("tbody", { children: keywords.map((kw) => {
      const byRun = cellByKeyword.get(kw.trackingKeywordId);
      return /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("td", { className: "sticky left-0 z-10 bg-base-100 whitespace-nowrap font-medium", children: kw.keyword }),
        runs.map((r, i) => {
          const position = byRun?.get(r.runId) ?? null;
          const previous = i > 0 ? byRun?.get(runs[i - 1].runId) ?? null : void 0;
          return /* @__PURE__ */ jsx("td", { className: "text-right", children: /* @__PURE__ */ jsx(MatrixCell, { position, previous }) }, r.runId);
        })
      ] }, kw.trackingKeywordId);
    }) })
  ] }) });
}
function MatrixCell({
  position,
  previous
}) {
  if (position === null) {
    return /* @__PURE__ */ jsx("span", { className: "text-base-content/30", children: "—" });
  }
  const change = previous != null && previous !== void 0 ? previous - position : null;
  return /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center justify-end gap-1 font-mono text-xs", children: [
    /* @__PURE__ */ jsx("span", { children: position }),
    change != null && change > 0 && /* @__PURE__ */ jsxs("span", { className: "text-success", children: [
      "▲",
      change
    ] }),
    change != null && change < 0 && /* @__PURE__ */ jsxs("span", { className: "text-warning", children: [
      "▼",
      -change
    ] })
  ] });
}
function countMatrixRuns(cells) {
  return new Set(cells.map((c) => c.runId)).size;
}
function buildMatrix(cells) {
  const runMap = /* @__PURE__ */ new Map();
  const cellByKeyword = /* @__PURE__ */ new Map();
  for (const c of cells) {
    runMap.set(c.runId, c.checkedAt);
    let byRun = cellByKeyword.get(c.trackingKeywordId);
    if (!byRun) {
      byRun = /* @__PURE__ */ new Map();
      cellByKeyword.set(c.trackingKeywordId, byRun);
    }
    byRun.set(c.runId, c.position);
  }
  const runs = [...runMap.entries()].map(([runId, checkedAt]) => ({ runId, checkedAt })).toSorted((a, b) => a.checkedAt.localeCompare(b.checkedAt));
  return { runs, cellByKeyword };
}
function formatDate(value) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric"
  });
}
function ToolbarMenu({
  label,
  icon,
  title,
  children
}) {
  const [open, setOpen] = useState(false);
  return /* @__PURE__ */ jsxs("div", { className: "relative", children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        className: `btn btn-ghost btn-sm ${label ? "gap-1" : "btn-square"}`,
        onClick: () => setOpen((c) => !c),
        title,
        "aria-label": title ?? label,
        "aria-haspopup": "menu",
        "aria-expanded": open,
        children: [
          icon,
          label,
          label && /* @__PURE__ */ jsx(ChevronDown, { className: "size-3.5 opacity-60" })
        ]
      }
    ),
    open && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-40", onClick: () => setOpen(false) }),
      /* @__PURE__ */ jsx(
        "div",
        {
          role: "menu",
          className: "absolute right-0 top-full mt-1 z-50 rounded-lg border border-base-300 bg-base-100 shadow-lg py-1 min-w-[230px]",
          onClick: () => setOpen(false),
          children
        }
      )
    ] })
  ] });
}
function MenuItem({
  icon,
  label,
  description,
  onClick,
  disabled
}) {
  return /* @__PURE__ */ jsxs(
    "button",
    {
      type: "button",
      role: "menuitem",
      className: "flex w-full items-start gap-2 px-3 py-2 text-sm hover:bg-base-200 disabled:opacity-50",
      onClick,
      disabled,
      children: [
        /* @__PURE__ */ jsx("span", { className: "mt-0.5 shrink-0", children: icon }),
        /* @__PURE__ */ jsxs("span", { className: "flex flex-col items-start text-left", children: [
          /* @__PURE__ */ jsx("span", { children: label }),
          description && /* @__PURE__ */ jsx("span", { className: "text-xs text-base-content/50", children: description })
        ] })
      ]
    }
  );
}
function MoreMenu({
  onCheckNow,
  checkBusy,
  checkDisabled,
  onRefreshMetrics,
  metricsRefreshing,
  hasData
}) {
  return /* @__PURE__ */ jsxs(
    ToolbarMenu,
    {
      icon: /* @__PURE__ */ jsx(MoreHorizontal, { className: "size-4" }),
      title: "More actions",
      children: [
        !checkDisabled && /* @__PURE__ */ jsx(
          MenuItem,
          {
            icon: /* @__PURE__ */ jsx(Play, { className: "size-3.5" }),
            label: checkBusy ? "Running..." : "Check rankings",
            description: "Fetch current Google positions",
            onClick: onCheckNow,
            disabled: checkBusy
          }
        ),
        /* @__PURE__ */ jsx(
          MenuItem,
          {
            icon: /* @__PURE__ */ jsx(
              RefreshCw,
              {
                className: `size-3.5 ${metricsRefreshing ? "animate-spin" : ""}`
              }
            ),
            label: metricsRefreshing ? "Refreshing..." : "Update keyword stats",
            description: "Volume, difficulty & CPC — not rankings",
            onClick: onRefreshMetrics,
            disabled: metricsRefreshing || !hasData
          }
        )
      ]
    }
  );
}
function ExportMenu({
  onExport,
  onExportToSheets,
  onCopyKeywords,
  hasData
}) {
  return /* @__PURE__ */ jsxs(ToolbarMenu, { label: "Export", icon: /* @__PURE__ */ jsx(Download, { className: "size-3.5" }), children: [
    /* @__PURE__ */ jsx(
      MenuItem,
      {
        icon: /* @__PURE__ */ jsx(Sheet, { className: "size-3.5" }),
        label: "Export to Sheets",
        onClick: onExportToSheets,
        disabled: !hasData
      }
    ),
    /* @__PURE__ */ jsx(
      MenuItem,
      {
        icon: /* @__PURE__ */ jsx(FileDown, { className: "size-3.5" }),
        label: "Export CSV",
        onClick: onExport,
        disabled: !hasData
      }
    ),
    /* @__PURE__ */ jsx(
      MenuItem,
      {
        icon: /* @__PURE__ */ jsx(Copy, { className: "size-3.5" }),
        label: "Copy keywords",
        onClick: onCopyKeywords,
        disabled: !hasData
      }
    )
  ] });
}
function RankTrackingTableToolbar({
  showFilters,
  onToggleFilters,
  activeFilterCount,
  isRunning,
  latestRun,
  keywordCount,
  viewMode,
  onViewModeChange,
  historyAvailable,
  onExport,
  onExportToSheets,
  onCopyKeywords,
  onCheckNow,
  onRefreshMetrics,
  metricsRefreshing,
  checkBusy,
  checkDisabled,
  hasData
}) {
  return /* @__PURE__ */ jsxs("div", { className: "shrink-0 flex flex-wrap items-center gap-2 px-4 py-2 border-y border-base-300", children: [
    historyAvailable && /* @__PURE__ */ jsx(
      SegmentedToggle,
      {
        showLabels: true,
        items: [
          {
            value: "table",
            icon: /* @__PURE__ */ jsx(Table, { className: "size-3.5" }),
            label: "Latest"
          },
          {
            value: "history",
            icon: /* @__PURE__ */ jsx(CalendarDays, { className: "size-3.5" }),
            label: "History"
          }
        ],
        value: viewMode,
        onChange: onViewModeChange
      }
    ),
    /* @__PURE__ */ jsxs(
      "button",
      {
        className: `btn btn-ghost btn-sm gap-1.5 ${showFilters ? "btn-active" : ""}`,
        onClick: onToggleFilters,
        title: "Toggle table filters",
        children: [
          /* @__PURE__ */ jsx(SlidersHorizontal, { className: "size-3.5" }),
          "Filters",
          activeFilterCount > 0 && /* @__PURE__ */ jsx("span", { className: "badge badge-xs badge-primary border-0 text-primary-content", children: activeFilterCount })
        ]
      }
    ),
    isRunning && latestRun ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-base-content/70", children: [
      /* @__PURE__ */ jsx(Loader2, { className: "size-3.5 animate-spin text-primary" }),
      /* @__PURE__ */ jsxs("span", { children: [
        latestRun.status === "pending" ? "Preparing..." : `Getting rankings for ${latestRun.keywordsTotal || "?"} keyword${latestRun.keywordsTotal !== 1 ? "s" : ""}...`,
        " ",
        latestRun.keywordsChecked,
        "/",
        latestRun.keywordsTotal || "?"
      ] }),
      latestRun.keywordsTotal > 0 && /* @__PURE__ */ jsx(
        "progress",
        {
          className: "progress progress-primary w-24",
          value: latestRun.keywordsChecked,
          max: latestRun.keywordsTotal
        }
      )
    ] }) : /* @__PURE__ */ jsxs("span", { className: "text-sm text-base-content/60", children: [
      keywordCount,
      " keywords"
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex-1" }),
    /* @__PURE__ */ jsx(
      ExportMenu,
      {
        onExport,
        onExportToSheets,
        onCopyKeywords,
        hasData
      }
    ),
    /* @__PURE__ */ jsx(
      MoreMenu,
      {
        onCheckNow,
        checkBusy,
        checkDisabled,
        onRefreshMetrics,
        metricsRefreshing,
        hasData
      }
    )
  ] });
}
function AddKeywordsPanel({
  configId,
  projectId,
  onSuccess,
  onCancel
}) {
  const [keywordInput, setKeywordInput] = useState("");
  const mutation = useMutation({
    mutationFn: (kws) => addTrackingKeywords({ data: { projectId, configId, keywords: kws } }),
    onSuccess: (result) => {
      setKeywordInput("");
      onSuccess(result);
    },
    onError: (error) => {
      toast.error(getStandardErrorMessage(error, "Failed to add keywords"));
    }
  });
  const isPending = mutation.isPending;
  return /* @__PURE__ */ jsxs("div", { className: "flex gap-2 items-end", children: [
    /* @__PURE__ */ jsx(
      "textarea",
      {
        className: "textarea textarea-bordered textarea-sm flex-1",
        rows: 3,
        placeholder: "Enter keywords, one per line",
        value: keywordInput,
        onChange: (e) => setKeywordInput(e.target.value)
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          className: "btn btn-primary btn-sm",
          onClick: () => {
            const lines = keywordInput.split("\n").map((l) => l.trim()).filter(Boolean);
            if (lines.some((l) => l.length > MAX_TRACKED_KEYWORD_LENGTH)) {
              toast.error(
                `Keywords must be ${MAX_TRACKED_KEYWORD_LENGTH} characters or fewer.`
              );
              return;
            }
            if (lines.length > 0) mutation.mutate(lines);
          },
          disabled: isPending || !keywordInput.trim(),
          children: [
            isPending && /* @__PURE__ */ jsx(Loader2, { className: "size-3 animate-spin" }),
            "Add"
          ]
        }
      ),
      /* @__PURE__ */ jsx("button", { className: "btn btn-ghost btn-sm", onClick: onCancel, children: "Cancel" })
    ] })
  ] });
}
function CheckConfirmModal({
  keywordCount,
  devices,
  serpDepth,
  isPending,
  onRunNow,
  onCancel
}) {
  const { costUsd } = estimateRankCheckCredits(
    keywordCount,
    devices,
    serpDepth,
    "live"
  );
  const dc = devicesCount(devices);
  const totalChecks = keywordCount * dc;
  const liveTime = Math.ceil(totalChecks / KEYWORDS_PER_BATCH) * SECONDS_PER_BATCH;
  return /* @__PURE__ */ jsxs(
    Modal,
    {
      maxWidth: "max-w-md",
      onClose: onCancel,
      labelledBy: "rank-check-confirm-title",
      children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("h3", { id: "rank-check-confirm-title", className: "text-lg font-semibold", children: [
            "Check ",
            keywordCount,
            " keyword",
            keywordCount !== 1 ? "s" : ""
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-base-content/60 mt-1", children: [
            keywordCount,
            " keywords × ",
            dc,
            " device",
            dc !== 1 ? "s" : "",
            " = ",
            totalChecks,
            " SERP checks"
          ] })
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            className: "flex w-full items-center gap-4 rounded-xl border-2 border-base-300 p-4 text-left transition-colors hover:border-primary hover:bg-primary/5",
            onClick: onRunNow,
            disabled: isPending,
            children: [
              /* @__PURE__ */ jsx("div", { className: "flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10", children: /* @__PURE__ */ jsx(Zap, { className: "size-5 text-primary" }) }),
              /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsx("p", { className: "font-medium", children: "Run Now" }),
                /* @__PURE__ */ jsxs("p", { className: "text-xs text-base-content/60", children: [
                  "Results in ~",
                  liveTime < 60 ? `${liveTime}s` : `${Math.ceil(liveTime / 60)} min`
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
                /* @__PURE__ */ jsxs("p", { className: "font-mono font-semibold", children: [
                  "~$",
                  costUsd.toFixed(2)
                ] }),
                isPending && /* @__PURE__ */ jsx(Loader2, { className: "size-3 animate-spin ml-auto" })
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsx("button", { className: "btn btn-ghost btn-sm self-center", onClick: onCancel, children: "Cancel" })
      ]
    }
  );
}
function useMetricsRefresh(projectId, configId) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => refreshTrackingKeywordMetrics({
      data: { projectId, configId }
    }),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({
        queryKey: ["rankTrackingResults", projectId, configId]
      });
      toast.success(`Metrics updated for ${result.updated} keywords`);
    },
    onError: () => {
      toast.error("Failed to refresh keyword metrics");
    }
  });
  return { refresh: mutation.mutate, isRefreshing: mutation.isPending };
}
function useRankCheckTrigger({
  configId,
  isRunning,
  projectId,
  onSuccess
}) {
  const queryClient = useQueryClient();
  const triggerMutation = useMutation({
    mutationFn: (opts) => triggerRankCheck({
      data: {
        projectId,
        configId,
        keywordIds: opts.keywordIds
      }
    }),
    onSuccess: (result) => {
      onSuccess();
      void queryClient.invalidateQueries({
        queryKey: ["rankTrackingLatestRun", projectId, configId]
      });
      if (!result.ok) {
        toast.info("A rank check is already running");
        return;
      }
      captureClientEvent("rank_tracking:check_trigger");
      toast.success("Rank check started");
    },
    onError: (error) => {
      toast.error(getStandardErrorMessage(error, "Failed to start rank check"));
    }
  });
  const startCheck = (opts) => {
    if (triggerMutation.isPending || isRunning) return;
    triggerMutation.mutate(opts);
  };
  return {
    startCheck,
    /** True while the trigger request is in-flight */
    isPending: triggerMutation.isPending,
    /** True when any check activity is happening (running, starting, or pending) */
    isBusy: isRunning || triggerMutation.isPending
  };
}
function useRankRunPolling(projectId, configId) {
  const queryClient = useQueryClient();
  const prevStatusRef = useRef(void 0);
  const { data: latestRun } = useQuery({
    queryKey: ["rankTrackingLatestRun", projectId, configId],
    queryFn: () => getLatestRankRun({ data: { projectId, configId } }),
    refetchInterval: (query) => {
      const run = query.state.data;
      const prev = prevStatusRef.current;
      prevStatusRef.current = run?.status;
      const isTerminal = run?.status === "completed" || run?.status === "failed";
      const wasActive = prev === "running" || prev === "pending";
      if (wasActive && isTerminal) {
        void queryClient.invalidateQueries({
          queryKey: ["rankTrackingResults", projectId, configId]
        });
      }
      if (run?.status === "pending" || run?.status === "running") return 3e3;
      return false;
    }
  });
  return latestRun;
}
function deviceVisibility(devices, activeDevice) {
  if (devices === "both") {
    return {
      showDesktop: activeDevice === "desktop",
      showMobile: activeDevice === "mobile"
    };
  }
  return {
    showDesktop: devices !== "mobile",
    showMobile: devices !== "desktop"
  };
}
function RankTrackingDomainDetail({
  config,
  projectId,
  onBack,
  onEdit
}) {
  const { data: session } = useSession();
  const customerQuery = useCustomer({
    queryOptions: { enabled: Boolean(session?.user?.id) }
  });
  const isFreePlan = !!customerQuery.data && getCustomerPlanStatus(customerQuery.data) === "free";
  const queryClient = useQueryClient();
  const [showAddKeywords, setShowAddKeywords] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [comparePeriod, setComparePeriod] = useState(
    config.scheduleInterval === "daily" ? "1d" : config.scheduleInterval === "monthly" ? "30d" : "7d"
  );
  const [activeDevice, setActiveDevice] = useState(
    config.devices === "mobile" ? "mobile" : "desktop"
  );
  const [viewMode, setViewMode] = useState("table");
  const { data: resultsData, isLoading: resultsLoading } = useQuery({
    queryKey: ["rankTrackingResults", projectId, config.id, comparePeriod],
    queryFn: () => getLatestRankResults({
      data: { projectId, configId: config.id, comparePeriod }
    })
  });
  const latestRun = useRankRunPolling(projectId, config.id);
  const { data: matrixCells, isLoading: matrixLoading } = useQuery({
    queryKey: ["rankPositionMatrix", projectId, config.id, activeDevice],
    queryFn: () => getRankPositionMatrix({
      data: { projectId, configId: config.id, device: activeDevice }
    })
  });
  const historyAvailable = countMatrixRuns(matrixCells ?? []) >= 2;
  const { data: costEstimate } = useQuery({
    queryKey: ["rankTrackingCostEstimate", projectId, config.id],
    queryFn: () => estimateRankCheckCost({ data: { projectId, configId: config.id } })
  });
  const [pendingCheck, setPendingCheck] = useState(null);
  const handleKeywordsAdded = (result) => {
    void queryClient.invalidateQueries({
      queryKey: ["rankTrackingCostEstimate", projectId, config.id]
    });
    void queryClient.invalidateQueries({
      queryKey: ["rankTrackingResults", projectId, config.id]
    });
    void queryClient.invalidateQueries({
      queryKey: ["rankTrackingLatestRun", projectId, config.id]
    });
    setShowAddKeywords(false);
    captureClientEvent("rank_tracking:keywords_add");
    toast.success(
      `${result.added} keyword${result.added !== 1 ? "s" : ""} added`
    );
    if (!result.checkTriggered && result.added > 0) {
      toast.info("Use 'Check Now' to check these keywords");
    }
  };
  const isRunning = (latestRun?.status === "pending" || latestRun?.status === "running") && !latestRun?.maybeStale;
  const { startCheck, isBusy, isPending } = useRankCheckTrigger({
    configId: config.id,
    isRunning,
    projectId,
    onSuccess: () => setPendingCheck(null)
  });
  const { refresh: refreshMetrics, isRefreshing: metricsRefreshing } = useMetricsRefresh(projectId, config.id);
  const requestCheck = (count, keywordIds) => {
    if (count < 50) {
      startCheck({ keywordIds });
      return;
    }
    if (isBusy) return;
    setPendingCheck({ count, keywordIds });
  };
  const rows = resultsData?.rows;
  const run = resultsData?.run;
  const hasBothDevices = config.devices === "both";
  const { showDesktop, showMobile } = deviceVisibility(
    config.devices,
    activeDevice
  );
  const filtered = useMemo(
    () => applyFilters(rows ?? [], filters),
    [rows, filters]
  );
  const activeFilterCount = countActiveFilters(filters);
  const defaultSortId = showDesktop ? "desktopPosition" : "mobilePosition";
  const effectiveViewMode = historyAvailable ? viewMode : "table";
  return /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        className: "btn btn-ghost btn-xs gap-1 -ml-2 text-base-content/60",
        onClick: onBack,
        children: [
          /* @__PURE__ */ jsx(ArrowLeft, { className: "size-3" }),
          "Back to domains"
        ]
      }
    ),
    config.lastSkipReason === "insufficient_credits" && /* @__PURE__ */ jsxs("div", { className: "alert alert-warning text-sm py-2", children: [
      /* @__PURE__ */ jsx(AlertTriangle, { className: "size-4" }),
      /* @__PURE__ */ jsx("span", { children: "Last scheduled check was skipped due to insufficient credits. Top up your balance to resume automatic tracking." })
    ] }),
    latestRun?.maybeStale && /* @__PURE__ */ jsxs("div", { className: "alert alert-warning text-sm py-2", children: [
      /* @__PURE__ */ jsx(AlertTriangle, { className: "size-4" }),
      /* @__PURE__ */ jsx("span", { children: "This run may be unresponsive and will be cleaned up automatically." })
    ] }),
    /* @__PURE__ */ jsx(FreePlanAlert, { visible: isFreePlan }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col min-w-0 border border-base-300 rounded-xl bg-base-100 overflow-hidden", children: [
      /* @__PURE__ */ jsx(
        RankTrackingDetailHeader,
        {
          config,
          run,
          costEstimate,
          hasBothDevices,
          activeDevice,
          onActiveDeviceChange: setActiveDevice,
          comparePeriod,
          onComparePeriodChange: setComparePeriod,
          onEdit,
          onToggleAddKeywords: () => setShowAddKeywords((c) => !c)
        }
      ),
      showAddKeywords && /* @__PURE__ */ jsx("div", { className: "px-4 pb-3", children: /* @__PURE__ */ jsx(
        AddKeywordsPanel,
        {
          configId: config.id,
          projectId,
          onSuccess: handleKeywordsAdded,
          onCancel: () => setShowAddKeywords(false)
        }
      ) }),
      (rows?.length ?? 0) > 0 && /* @__PURE__ */ jsx(
        RankTrackingOverview,
        {
          device: activeDevice,
          projectId,
          configId: config.id
        }
      ),
      /* @__PURE__ */ jsx(
        RankTrackingTableToolbar,
        {
          showFilters,
          onToggleFilters: () => setShowFilters((c) => !c),
          activeFilterCount,
          isRunning,
          latestRun,
          keywordCount: filtered.length,
          viewMode: effectiveViewMode,
          onViewModeChange: setViewMode,
          historyAvailable,
          onExport: () => exportRankTrackingCsv(
            filtered,
            showDesktop,
            showMobile,
            config.domain,
            config.locationName
          ),
          onExportToSheets: () => exportRankTrackingToSheets(
            filtered,
            showDesktop,
            showMobile,
            config.locationName
          ),
          onCopyKeywords: () => {
            void navigator.clipboard.writeText(
              filtered.map((r) => r.keyword).join("\n")
            );
            toast.success("Keywords copied to clipboard");
          },
          onCheckNow: () => {
            const count = costEstimate?.keywordCount ?? rows?.length ?? 0;
            if (count > 0) requestCheck(count);
          },
          onRefreshMetrics: refreshMetrics,
          metricsRefreshing,
          checkBusy: isBusy,
          checkDisabled: isFreePlan,
          hasData: filtered.length > 0
        }
      ),
      showFilters && /* @__PURE__ */ jsx(
        FilterPanel,
        {
          filters,
          setFilters,
          activeFilterCount,
          onReset: () => setFilters(EMPTY_FILTERS)
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "p-4", children: effectiveViewMode === "history" ? /* @__PURE__ */ jsx(
        RankTrackingHistoryMatrix,
        {
          cells: matrixCells ?? [],
          isLoading: matrixLoading,
          keywords: filtered.map((r) => ({
            trackingKeywordId: r.trackingKeywordId,
            keyword: r.keyword
          }))
        }
      ) : /* @__PURE__ */ jsx(
        RankTrackingTable,
        {
          totalCount: rows?.length ?? 0,
          rows: filtered,
          resultsLoading,
          showDesktop,
          showMobile,
          defaultSortId,
          domain: config.domain,
          configId: config.id,
          projectId,
          locationCode: config.locationCode,
          locationName: config.locationName,
          serpDepth: config.serpDepth
        },
        defaultSortId
      ) })
    ] }),
    pendingCheck && /* @__PURE__ */ jsx(
      CheckConfirmModal,
      {
        keywordCount: pendingCheck.count,
        devices: config.devices,
        serpDepth: config.serpDepth,
        isPending,
        onRunNow: () => startCheck({
          keywordIds: pendingCheck.keywordIds
        }),
        onCancel: () => setPendingCheck(null)
      }
    )
  ] });
}
function RankTrackingConfigRoute() {
  const {
    projectId,
    configId
  } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showConfigModal, setShowConfigModal] = useState(false);
  const {
    data: configs,
    isPending
  } = useQuery({
    queryKey: ["rankTrackingConfigs", projectId],
    queryFn: () => getRankTrackingConfigs({
      data: {
        projectId
      }
    })
  });
  const config = configs?.find((c) => c.id === configId) ?? null;
  const invalidateConfigs = () => {
    void queryClient.invalidateQueries({
      queryKey: ["rankTrackingConfigs", projectId]
    });
    void queryClient.invalidateQueries({
      queryKey: ["rankTrackingConfigSummaries", projectId]
    });
  };
  const handleBack = () => {
    void navigate({
      to: "/p/$projectId/rank-tracking",
      params: {
        projectId
      }
    });
  };
  if (isPending) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-20", children: /* @__PURE__ */ jsx("span", { className: "loading loading-spinner loading-lg" }) });
  }
  if (!config) {
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm text-base-content/70", children: "Domain configuration not found." }),
      /* @__PURE__ */ jsx("button", { className: "btn btn-ghost btn-sm", onClick: handleBack, children: "Back to domains" })
    ] });
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(RankTrackingDomainDetail, { config, projectId, onBack: handleBack, onEdit: () => setShowConfigModal(true) }),
    showConfigModal && /* @__PURE__ */ jsx(RankTrackingConfigModal, { projectId, existingConfig: config, onClose: () => setShowConfigModal(false), onSaved: () => {
      setShowConfigModal(false);
      invalidateConfigs();
    } })
  ] });
}
export {
  RankTrackingConfigRoute as component
};
