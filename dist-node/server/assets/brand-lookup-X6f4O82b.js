import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { RotateCcw, Sparkles, ExternalLink, Download, ChevronDown, Sheet, SlidersHorizontal, Info, Search, TrendingUp, Quote, BarChart3, AlertCircle, ArrowLeft } from "lucide-react";
import { c as formatCount, d as formatPlatformLabel, P as PLATFORM_SHORT_LABEL, h as PLATFORM_DOT_CLASS, S as SearchHistorySection, H as HISTORY_ITEM_LINK_CLASS, u as useTimestampedSearchHistory, b as HostedPlanGate, l as lookupBrand, A as AiSearchPaidPlanGate } from "./useTimestampedSearchHistory-LScZJ_Mt.js";
import { D as downloadCsv, E as buildCsv, S as SortableHeader, aj as HeaderHelpLabel, a4 as AppDataTable, ak as parseTerms, a3 as useAppTable, a8 as exportTableToSheets, p as getStandardErrorMessage, al as Route } from "./router-BZ-5uDXB.js";
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line } from "recharts";
import { createColumnHelper } from "@tanstack/react-table";
import { f as formatUrlForDisplay } from "./url-D1aM6mYO.js";
import { useForm, useStore } from "@tanstack/react-form";
import { aL as RESEARCH_SCOPE_LABELS, aB as isHostedClientAuthMode, cc as applyBillingMarkupUsd, J as researchScopeSchema, bS as parseResearchTarget, cd as toScopeSearchParam } from "../entry.js";
import { R as ResearchScopeSelect } from "./ResearchScopeSelect-CEr_gOl-.js";
import { B as BRAND_LOOKUP_MAX_INPUT_LENGTH, f as parseCompetitorList } from "./ai-search-BV1mIqc0.js";
import { z } from "zod";
import { d as detectTarget } from "./targetDetection-CbNqXYEw.js";
import "./middleware-CvzXieP6.js";
import "autumn-js/react";
import "./useLocalHistoryStore-CAiu5gzu.js";
import "@tanstack/query-core";
import "./selfHostedOAuth-DmcaPqZ5.js";
import "drizzle-orm";
import "jose";
import "./audit-SZdMhI6q.js";
import "react-dom";
import "sonner";
import "@better-auth/api-key/client";
import "papaparse";
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
function BrandLookupMentionTrendCard({ result }) {
  const chartData = useMemo(
    () => result.monthlyVolume.map((entry) => ({
      label: `${entry.year}-${String(entry.month).padStart(2, "0")}`,
      volume: entry.volume ?? 0
    })),
    [result.monthlyVolume]
  );
  if (chartData.length === 0) {
    return /* @__PURE__ */ jsx("div", { className: "flex h-56 items-center justify-center text-sm text-base-content/60", children: "Not enough historical data yet." });
  }
  return /* @__PURE__ */ jsx("div", { className: "h-56", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(
    LineChart,
    {
      data: chartData,
      margin: { top: 12, right: 12, bottom: 4, left: 0 },
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
            dataKey: "label",
            tick: { fontSize: 11, fill: "#888" },
            tickLine: false,
            axisLine: false
          }
        ),
        /* @__PURE__ */ jsx(
          YAxis,
          {
            tick: { fontSize: 11, fill: "#888" },
            tickLine: false,
            axisLine: false,
            allowDecimals: false
          }
        ),
        /* @__PURE__ */ jsx(
          Tooltip,
          {
            content: /* @__PURE__ */ jsx(MentionTooltip, {}),
            cursor: { stroke: "currentColor", strokeOpacity: 0.2 }
          }
        ),
        /* @__PURE__ */ jsx(
          Line,
          {
            type: "monotone",
            dataKey: "volume",
            stroke: "hsl(220 70% 50%)",
            strokeWidth: 2,
            dot: false
          }
        )
      ]
    }
  ) }) });
}
function MentionTooltip({
  active,
  payload,
  label
}) {
  if (!active || !payload?.length) return null;
  return /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-base-300 bg-base-100 px-3 py-2 shadow-sm", children: [
    /* @__PURE__ */ jsx("p", { className: "text-xs text-base-content/60", children: label }),
    /* @__PURE__ */ jsxs("p", { className: "text-sm font-medium tabular-nums", children: [
      formatCount(payload[0].value),
      " mentions"
    ] })
  ] });
}
function BrandLookupShareOfVoice({
  shareOfVoice,
  isDomainLevel
}) {
  const target = shareOfVoice.entries.find((entry) => entry.isTarget) ?? null;
  const maxPct = Math.max(
    0,
    ...shareOfVoice.entries.map((entry) => entry.sharePct ?? 0)
  );
  return /* @__PURE__ */ jsxs("section", { className: "flex h-full flex-col overflow-hidden rounded-xl border border-base-300 bg-base-100", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between gap-2 border-b border-base-300 px-4 py-3", children: [
      /* @__PURE__ */ jsxs("h3", { className: "flex items-center gap-2 text-sm font-semibold", children: [
        "Share of Voice",
        isDomainLevel ? /* @__PURE__ */ jsx(
          "span",
          {
            className: "tooltip badge badge-ghost badge-sm shrink-0 font-normal",
            "data-tip": "Share of Voice compares whole domains — it is not narrowed to the page or folder you searched.",
            children: "Domain-level"
          }
        ) : null
      ] }),
      target ? /* @__PURE__ */ jsxs("span", { className: "text-xs text-base-content/50", children: [
        /* @__PURE__ */ jsx("span", { className: "font-medium text-base-content/80", children: target.label }),
        " ",
        target.sharePct == null ? "· no comparable data" : `· ${Math.round(target.sharePct)}%`
      ] }) : null
    ] }),
    /* @__PURE__ */ jsx("ul", { className: "flex-1 divide-y divide-base-200", children: shareOfVoice.entries.map((entry, index) => /* @__PURE__ */ jsx(
      LeaderboardRow,
      {
        entry,
        rank: index + 1,
        maxPct
      },
      entry.label
    )) }),
    /* @__PURE__ */ jsxs("p", { className: "border-t border-base-200 px-4 py-2 text-[11px] text-base-content/50", children: [
      "Mentions share across",
      " ",
      shareOfVoice.platforms.map(formatPlatformLabel).join(" and "),
      " · bars relative to the leader."
    ] })
  ] });
}
function LeaderboardRow({
  entry,
  rank,
  maxPct
}) {
  const hasData = entry.mentions != null && entry.sharePct != null;
  const barWidth = hasData && maxPct > 0 ? (entry.sharePct ?? 0) / maxPct * 100 : 0;
  return /* @__PURE__ */ jsxs(
    "li",
    {
      className: `grid grid-cols-[1.25rem_minmax(0,1fr)_2.75rem] items-center gap-3 px-4 py-2.5 ${entry.isTarget ? "bg-primary/5" : ""}`,
      children: [
        /* @__PURE__ */ jsx("span", { className: "text-xs tabular-nums text-base-content/40", children: rank }),
        /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "truncate text-sm", children: entry.label }),
            entry.isTarget ? /* @__PURE__ */ jsx("span", { className: "badge badge-primary badge-xs border-0", children: "You" }) : null,
            /* @__PURE__ */ jsx("span", { className: "ml-auto shrink-0 text-xs tabular-nums text-base-content/50", children: entry.mentions == null ? "—" : formatCount(entry.mentions) })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "mt-1.5 h-1.5 overflow-hidden rounded-full bg-base-200", children: /* @__PURE__ */ jsx(
            "div",
            {
              className: `h-full rounded-full ${entry.isTarget ? "bg-primary" : "bg-base-content/25"}`,
              style: { width: `${barWidth}%` }
            }
          ) })
        ] }),
        /* @__PURE__ */ jsx("span", { className: "text-right text-sm font-medium tabular-nums", children: hasData ? `${Math.round(entry.sharePct ?? 0)}%` : "—" })
      ]
    }
  );
}
function buildBrandLookupExport(tab, sortedPages, sortedQueries) {
  if (tab === "pages") {
    return {
      headers: [
        "URL",
        "Domain",
        "Platform",
        "Source mentions",
        "Source AI search volume",
        "Fetched-sample prompt examples"
      ],
      rows: sortedPages.map((row) => [
        row.url,
        row.domain ?? "",
        formatPlatformLabel(row.platform),
        row.mentions ?? "",
        row.capturedVolume ?? "",
        row.keywords.map((keyword) => keyword.question).join("; ")
      ])
    };
  }
  return {
    headers: [
      "Query",
      "Platform",
      "AI search volume",
      "First seen",
      "Last seen"
    ],
    rows: sortedQueries.map((row) => [
      row.question,
      formatPlatformLabel(row.platform),
      row.aiSearchVolume ?? "",
      row.firstSeenAt ?? "",
      row.lastSeenAt ?? ""
    ])
  };
}
function downloadBrandLookupCsv(tab, resolvedTarget, table) {
  const slug = slugify(resolvedTarget);
  const filename = tab === "pages" ? `ai-brand-lookup-pages-${slug}.csv` : `ai-brand-lookup-queries-${slug}.csv`;
  downloadCsv(filename, buildCsv(table.headers, table.rows));
}
function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
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
        className: "input input-bordered input-sm w-full bg-base-100",
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
  maxName
}) {
  return /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-base-300 bg-base-100 p-2.5 space-y-2", children: [
    /* @__PURE__ */ jsx("p", { className: "text-[11px] font-semibold uppercase tracking-wide text-base-content/60", children: title }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
      /* @__PURE__ */ jsx(CompactRangeInput, { form, name: minName, placeholder: "Min" }),
      /* @__PURE__ */ jsx(CompactRangeInput, { form, name: maxName, placeholder: "Max" })
    ] })
  ] });
}
function CompactRangeInput({
  form,
  name,
  placeholder
}) {
  return /* @__PURE__ */ jsx(form.Field, { name, children: (field) => /* @__PURE__ */ jsx(
    "input",
    {
      className: "input input-bordered input-xs bg-base-100",
      placeholder,
      type: "number",
      value: field.state.value,
      onChange: (event) => field.handleChange(event.target.value)
    }
  ) });
}
function PlatformToggle({ form }) {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsx("p", { className: "text-[11px] font-semibold uppercase tracking-wide text-base-content/60", children: "Platform" }),
    /* @__PURE__ */ jsx(form.Field, { name: "platform", children: (field) => /* @__PURE__ */ jsx("div", { className: "flex flex-wrap items-center gap-1", children: ["", "chat_gpt", "google"].map((value) => /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        className: `btn btn-xs ${field.state.value === value ? "btn-soft" : "btn-ghost"}`,
        onClick: () => field.handleChange(value),
        children: value === "" ? "All" : formatPlatformLabel(value)
      },
      value || "all"
    )) }) })
  ] });
}
function TopPagesFilters({
  form
}) {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-3 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsx(
        FilterTextInput,
        {
          form,
          name: "include",
          label: "Include Terms",
          placeholder: "reddit, forbes"
        }
      ),
      /* @__PURE__ */ jsx(
        FilterTextInput,
        {
          form,
          name: "exclude",
          label: "Exclude Terms",
          placeholder: "pinterest, /tag"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-end gap-4", children: [
      /* @__PURE__ */ jsx(PlatformToggle, { form }),
      /* @__PURE__ */ jsx("div", { className: "min-w-[220px]", children: /* @__PURE__ */ jsx(
        FilterRangeInputs,
        {
          form,
          title: "Source mentions",
          minName: "minMentions",
          maxName: "maxMentions"
        }
      ) })
    ] })
  ] });
}
function QueriesFilters({
  form
}) {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-3 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsx(
        FilterTextInput,
        {
          form,
          name: "include",
          label: "Include Terms",
          placeholder: "pricing, reviews"
        }
      ),
      /* @__PURE__ */ jsx(
        FilterTextInput,
        {
          form,
          name: "exclude",
          label: "Exclude Terms",
          placeholder: "login, download"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-end gap-4", children: [
      /* @__PURE__ */ jsx(PlatformToggle, { form }),
      /* @__PURE__ */ jsx("div", { className: "min-w-[220px]", children: /* @__PURE__ */ jsx(
        FilterRangeInputs,
        {
          form,
          title: "AI search volume",
          minName: "minVolume",
          maxName: "maxVolume"
        }
      ) })
    ] })
  ] });
}
function BrandLookupFilterPanel({
  activeTab,
  filters
}) {
  const current = filters[activeTab];
  return /* @__PURE__ */ jsxs("div", { className: "shrink-0 border-b border-base-300 bg-gradient-to-b from-base-100 to-base-200/30 px-4 py-3 space-y-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold", children: "Refine results" }),
        current.activeFilterCount > 0 ? /* @__PURE__ */ jsxs("span", { className: "badge badge-xs badge-primary border-0 text-primary-content", children: [
          current.activeFilterCount,
          " active"
        ] }) : null
      ] }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          className: "btn btn-xs btn-ghost gap-1",
          onClick: current.reset,
          disabled: current.activeFilterCount === 0,
          children: [
            /* @__PURE__ */ jsx(RotateCcw, { className: "size-3" }),
            "Clear all"
          ]
        }
      )
    ] }),
    activeTab === "pages" ? /* @__PURE__ */ jsx(TopPagesFilters, { form: filters.pages.form }) : null,
    activeTab === "queries" ? /* @__PURE__ */ jsx(QueriesFilters, { form: filters.queries.form }) : null
  ] });
}
function isDescending(row, columnId) {
  const cell = row.getAllCells().find((c) => c.column.id === columnId);
  return cell?.column.getIsSorted() === "desc";
}
function compareNumericNullsLast(a, b, descending) {
  if (a == null && b == null) return 0;
  if (a == null || b == null) {
    const sign = descending ? -1 : 1;
    return (a == null ? 1 : -1) * sign;
  }
  return a - b;
}
function numericNullsLast(rowA, rowB, columnId) {
  return compareNumericNullsLast(
    rowA.getValue(columnId),
    rowB.getValue(columnId),
    isDescending(rowA, columnId)
  );
}
function HeaderWithHelp({
  label,
  helpText
}) {
  return /* @__PURE__ */ jsx("span", { className: "uppercase tracking-wider", children: /* @__PURE__ */ jsx(HeaderHelpLabel, { label, helpText }) });
}
const PLATFORM_HELP = "Which AI surface produced the answer — ChatGPT or Google AI Overview.";
function PlatformCell({ platform }) {
  return /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5 text-xs text-base-content/70", children: [
    /* @__PURE__ */ jsx(
      "span",
      {
        className: `size-1.5 rounded-full ${PLATFORM_DOT_CLASS[platform]}`
      }
    ),
    PLATFORM_SHORT_LABEL[platform]
  ] });
}
function urlPath(rawUrl) {
  try {
    const url = new URL(rawUrl);
    const path = `${url.pathname}${url.search}`;
    return path === "/" ? "" : path;
  } catch {
    return "";
  }
}
function normalizeDomain(value) {
  return value.replace(/^www\./i, "").toLowerCase();
}
function isTargetDomain(domain, targetDomain) {
  const candidate = normalizeDomain(domain);
  const target = normalizeDomain(targetDomain);
  return candidate === target || candidate.endsWith(`.${target}`);
}
function PageUrlCell({
  row,
  targetDomain
}) {
  const path = urlPath(row.url);
  const isOwn = targetDomain != null && row.domain != null && isTargetDomain(row.domain, targetDomain);
  return /* @__PURE__ */ jsxs(
    "a",
    {
      href: row.url,
      target: "_blank",
      rel: "noreferrer",
      className: "group block max-w-xl",
      children: [
        /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsx("span", { className: "font-medium text-base-content group-hover:underline", children: row.domain ?? formatUrlForDisplay(row.url) }),
          isOwn ? /* @__PURE__ */ jsx("span", { className: "badge badge-primary badge-xs border-0", children: "You" }) : null,
          /* @__PURE__ */ jsx(ExternalLink, { className: "size-3 shrink-0 text-base-content/40" })
        ] }),
        path ? /* @__PURE__ */ jsx("span", { className: "block truncate text-xs text-base-content/50", children: path }) : null
      ]
    }
  );
}
function KeywordsCell({
  keywords,
  projectId,
  brand
}) {
  const [expanded, setExpanded] = useState(false);
  if (keywords.length === 0) {
    return /* @__PURE__ */ jsx("span", { className: "text-base-content/40", children: "—" });
  }
  const visible = expanded ? keywords : keywords.slice(0, 3);
  const remaining = keywords.length - visible.length;
  return /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
    /* @__PURE__ */ jsx("ul", { className: "space-y-0.5", children: visible.map((keyword) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
      Link,
      {
        to: "/p/$projectId/prompt-explorer",
        params: { projectId },
        search: { q: keyword.question, hb: brand || void 0 },
        className: "group/kw inline-flex items-baseline gap-2 text-xs",
        title: "Run this prompt in Prompt Explorer",
        children: [
          /* @__PURE__ */ jsx("span", { className: "text-base-content/80 group-hover/kw:underline", children: keyword.question }),
          /* @__PURE__ */ jsxs(
            "span",
            {
              className: "shrink-0 tabular-nums text-base-content/40",
              title: "Prompt volume in the fetched sample",
              children: [
                formatCount(keyword.aiSearchVolume),
                " vol."
              ]
            }
          )
        ]
      }
    ) }, keyword.question)) }),
    keywords.length > 3 ? /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: () => setExpanded((current) => !current),
        className: "text-xs text-base-content/50 hover:text-base-content",
        children: expanded ? "Show less" : `+${remaining} more`
      }
    ) : null
  ] });
}
const pagesHelper = createColumnHelper();
const queriesHelper = createColumnHelper();
function buildTopPagesColumns({
  showPlatform,
  targetDomain,
  projectId,
  brand
}) {
  return [
    pagesHelper.accessor("url", {
      id: "url",
      header: () => /* @__PURE__ */ jsx(
        HeaderWithHelp,
        {
          label: "Source",
          helpText: "A page cited as a source in AI answers where the searched brand or domain appears."
        }
      ),
      enableSorting: false,
      cell: ({ row }) => /* @__PURE__ */ jsx(PageUrlCell, { row: row.original, targetDomain })
    }),
    ...showPlatform ? [
      pagesHelper.accessor("platform", {
        id: "platform",
        header: () => /* @__PURE__ */ jsx(HeaderWithHelp, { label: "Platform", helpText: PLATFORM_HELP }),
        enableSorting: false,
        cell: ({ getValue }) => /* @__PURE__ */ jsx(PlatformCell, { platform: getValue() })
      })
    ] : [],
    pagesHelper.display({
      id: "keywords",
      header: () => /* @__PURE__ */ jsx(
        HeaderWithHelp,
        {
          label: "Cited for",
          helpText: "Example prompts from the fetched sample where this page was cited."
        }
      ),
      cell: ({ row }) => /* @__PURE__ */ jsx(
        KeywordsCell,
        {
          keywords: row.original.keywords,
          projectId,
          brand
        }
      )
    }),
    pagesHelper.accessor("capturedVolume", {
      id: "capturedVolume",
      header: ({ column }) => /* @__PURE__ */ jsx(
        SortableHeader,
        {
          column,
          label: "Source vol.",
          helpText: "Estimated monthly prompt demand DataForSEO reports for this cited source, across prompts where the searched brand or domain appears.",
          align: "right"
        }
      ),
      cell: ({ getValue }) => /* @__PURE__ */ jsx("span", { className: "tabular-nums", children: formatCount(getValue()) }),
      sortingFn: numericNullsLast,
      sortDescFirst: true
    })
  ];
}
function buildTopQueriesColumns({
  showPlatform,
  projectId,
  brand
}) {
  return [
    queriesHelper.accessor("question", {
      id: "question",
      header: () => /* @__PURE__ */ jsx(
        HeaderWithHelp,
        {
          label: "Query",
          helpText: "A sampled user prompt whose AI answer cited the searched brand or domain in its text or sources. The prompt itself may not name the brand."
        }
      ),
      enableSorting: false,
      cell: ({ row }) => /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("p", { className: "break-words font-medium", children: row.original.question }),
        row.original.brandsMentioned.length > 0 ? /* @__PURE__ */ jsxs("p", { className: "mt-0.5 text-xs text-base-content/50", children: [
          "Brands: ",
          row.original.brandsMentioned.slice(0, 5).join(", ")
        ] }) : null
      ] })
    }),
    ...showPlatform ? [
      queriesHelper.accessor("platform", {
        id: "platform",
        header: () => /* @__PURE__ */ jsx(HeaderWithHelp, { label: "Platform", helpText: PLATFORM_HELP }),
        enableSorting: false,
        cell: ({ getValue }) => /* @__PURE__ */ jsx(PlatformCell, { platform: getValue() })
      })
    ] : [],
    queriesHelper.accessor("aiSearchVolume", {
      id: "aiSearchVolume",
      header: ({ column }) => /* @__PURE__ */ jsx(
        SortableHeader,
        {
          column,
          label: "AI search vol.",
          helpText: "Estimated monthly search demand for this prompt's topic. This is prompt demand, not the number of brand mentions.",
          align: "right"
        }
      ),
      cell: ({ getValue }) => /* @__PURE__ */ jsx("span", { className: "tabular-nums", children: formatCount(getValue()) }),
      sortingFn: numericNullsLast,
      sortDescFirst: true
    }),
    queriesHelper.display({
      id: "action",
      header: () => /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Actions" }),
      meta: { cellClassName: "w-px whitespace-nowrap text-right align-top" },
      cell: ({ row }) => /* @__PURE__ */ jsx(
        "span",
        {
          className: "tooltip tooltip-left opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100",
          "data-tip": "Run this prompt in Prompt Explorer",
          children: /* @__PURE__ */ jsx(
            Link,
            {
              to: "/p/$projectId/prompt-explorer",
              params: { projectId },
              search: { q: row.original.question, hb: brand || void 0 },
              className: "btn btn-ghost btn-xs gap-1",
              "aria-label": "Run this prompt in Prompt Explorer",
              children: /* @__PURE__ */ jsx(Sparkles, { className: "size-3.5" })
            }
          )
        }
      )
    })
  ];
}
function TopPagesTable({
  table,
  emptyMessage = "No cited sources to show."
}) {
  if (table.getRowModel().rows.length === 0) {
    return /* @__PURE__ */ jsx("p", { className: "p-6 text-center text-sm text-base-content/60", children: emptyMessage });
  }
  return /* @__PURE__ */ jsx(BrandLookupTable, { table, urlLikeColumnId: "url" });
}
function TopQueriesTable({
  table,
  emptyMessage = "No matching queries found."
}) {
  if (table.getRowModel().rows.length === 0) {
    return /* @__PURE__ */ jsx("p", { className: "p-6 text-center text-sm text-base-content/60", children: emptyMessage });
  }
  return /* @__PURE__ */ jsx(BrandLookupTable, { table, urlLikeColumnId: "question" });
}
function BrandLookupTable({
  table,
  urlLikeColumnId
}) {
  return /* @__PURE__ */ jsx(
    AppDataTable,
    {
      table,
      getRowClassName: () => "group transition-colors hover:bg-base-200/40",
      getCellClassName: (_, columnId) => cellClassName(
        columnId,
        urlLikeColumnId,
        table.getColumn(columnId)?.getCanSort() ?? false
      )
    }
  );
}
function cellClassName(columnId, urlLikeColumnId, isNumeric) {
  if (columnId === urlLikeColumnId) {
    return "min-w-80 max-w-2xl align-top";
  }
  if (columnId === "keywords") {
    return "max-w-lg align-top";
  }
  if (isNumeric) {
    return "whitespace-nowrap text-right align-top";
  }
  return "whitespace-nowrap align-top";
}
function passesNumericFilter(value, min, max) {
  if (value == null) return true;
  const minN = Number(min);
  if (min && !Number.isNaN(minN) && value < minN) return false;
  const maxN = Number(max);
  if (max && !Number.isNaN(maxN) && value > maxN) return false;
  return true;
}
function passesTextFilter(haystack, includeTerms, excludeTerms) {
  const lower = haystack.toLowerCase();
  if (includeTerms.length > 0 && !includeTerms.some((term) => lower.includes(term))) {
    return false;
  }
  if (excludeTerms.some((term) => lower.includes(term))) {
    return false;
  }
  return true;
}
function filterTopPages(rows, filters) {
  const includeTerms = parseTerms(filters.include);
  const excludeTerms = parseTerms(filters.exclude);
  return rows.filter((row) => {
    const textFields = [
      row.url,
      row.domain,
      ...row.keywords.map((keyword) => keyword.question)
    ].filter((v) => Boolean(v)).join(" ");
    if (!passesTextFilter(textFields, includeTerms, excludeTerms)) return false;
    if (filters.platform && row.platform !== filters.platform) return false;
    if (!passesNumericFilter(
      row.mentions,
      filters.minMentions,
      filters.maxMentions
    )) {
      return false;
    }
    return true;
  });
}
function filterQueries(rows, filters) {
  const includeTerms = parseTerms(filters.include);
  const excludeTerms = parseTerms(filters.exclude);
  return rows.filter((row) => {
    const textFields = [row.question, ...row.brandsMentioned].join(" ");
    if (!passesTextFilter(textFields, includeTerms, excludeTerms)) return false;
    if (filters.platform && row.platform !== filters.platform) return false;
    if (!passesNumericFilter(
      row.aiSearchVolume,
      filters.minVolume,
      filters.maxVolume
    )) {
      return false;
    }
    return true;
  });
}
function countActiveFilters(values) {
  return Object.values(values).filter((v) => v.trim() !== "").length;
}
const EMPTY_TOP_PAGES_FILTERS = {
  include: "",
  exclude: "",
  platform: "",
  minMentions: "",
  maxMentions: ""
};
const EMPTY_QUERIES_FILTERS = {
  include: "",
  exclude: "",
  platform: "",
  minVolume: "",
  maxVolume: ""
};
const STORAGE_KEY_PREFIX = "brand-lookup-filters-v3:";
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
  const [defaultValues] = useState(
    () => loadFromStorage(tab, { ...emptyValues })
  );
  const form = useForm({ defaultValues });
  const values = useStore(form.store, (state) => state.values);
  useEffect(() => {
    saveToStorage(tab, values);
  }, [tab, values]);
  const reset = useCallback(() => {
    form.reset({ ...emptyValues }, { keepDefaultValues: true });
  }, [emptyValues, form]);
  return {
    form,
    values,
    reset,
    activeFilterCount: countActiveFilters(values)
  };
}
function useBrandLookupFilters() {
  const [showFilters, setShowFilters] = useState(false);
  const pages = useTabFilters(
    "pages",
    EMPTY_TOP_PAGES_FILTERS
  );
  const queries = useTabFilters(
    "queries",
    EMPTY_QUERIES_FILTERS
  );
  return {
    pages,
    queries,
    showFilters,
    setShowFilters
  };
}
const DEFAULT_PAGES_SORT = [{ id: "capturedVolume", desc: true }];
const DEFAULT_QUERIES_SORT = [
  { id: "aiSearchVolume", desc: true }
];
function closeExportMenu() {
  const active = document.activeElement;
  if (active instanceof HTMLElement) active.blur();
}
function CitationTabsCard({
  result,
  projectId
}) {
  const [activeTab, setActiveTab] = useState("queries");
  const [pagesSort, setPagesSort] = useState(DEFAULT_PAGES_SORT);
  const [queriesSort, setQueriesSort] = useState(DEFAULT_QUERIES_SORT);
  const filters = useBrandLookupFilters();
  const queryPlatforms = [
    ...new Set(result.topQueries.map((query) => query.platform))
  ];
  const pagePlatforms = [
    ...new Set(result.topPages.map((page) => page.platform))
  ];
  const showQueryPlatform = queryPlatforms.length > 1;
  const showPagePlatform = pagePlatforms.length > 1;
  const targetDomain = result.detectedTargetType === "domain" ? result.resolvedTarget.split("/")[0] : null;
  const brand = targetDomain ?? result.resolvedTarget;
  const isUrlScoped = result.aggregatesAreDomainLevel;
  const filteredPages = useMemo(
    () => filterTopPages(result.topPages, filters.pages.values),
    [result.topPages, filters.pages.values]
  );
  const filteredQueries = useMemo(
    () => filterQueries(result.topQueries, filters.queries.values),
    [result.topQueries, filters.queries.values]
  );
  const pagesColumns = useMemo(
    () => buildTopPagesColumns({
      showPlatform: showPagePlatform,
      targetDomain,
      projectId,
      brand
    }),
    [showPagePlatform, targetDomain, projectId, brand]
  );
  const queriesColumns = useMemo(
    () => buildTopQueriesColumns({
      showPlatform: showQueryPlatform,
      projectId,
      brand
    }),
    [showQueryPlatform, projectId, brand]
  );
  const pagesTable = useAppTable({
    data: filteredPages,
    columns: pagesColumns,
    state: { sorting: pagesSort },
    onSortingChange: setPagesSort,
    withSorting: true,
    // Stable identity (default is the array index): KeywordsCell holds
    // expanded state, which must follow the page when filtering/sorting
    // reorders rows, not stick to whatever row lands in the same slot.
    getRowId: (row) => `${row.platform}:${row.url}`
  });
  const queriesTable = useAppTable({
    data: filteredQueries,
    columns: queriesColumns,
    state: { sorting: queriesSort },
    onSortingChange: setQueriesSort,
    withSorting: true
  });
  const exportTable = buildBrandLookupExport(
    activeTab,
    pagesTable.getSortedRowModel().rows.map((row) => row.original),
    queriesTable.getSortedRowModel().rows.map((row) => row.original)
  );
  const handleExportCsv = () => {
    downloadBrandLookupCsv(activeTab, result.resolvedTarget, exportTable);
    closeExportMenu();
  };
  const handleExportSheets = () => {
    void exportTableToSheets({
      headers: exportTable.headers,
      rows: exportTable.rows,
      feature: `brand_lookup_${activeTab}`
    });
    closeExportMenu();
  };
  const canExport = exportTable.rows.length > 0;
  const currentFilterCount = filters[activeTab].activeFilterCount;
  const queriesActive = activeTab === "queries";
  const pagesActive = activeTab === "pages";
  const activePlatforms = pagesActive ? pagePlatforms : queryPlatforms;
  const captionPlatform = activePlatforms.length === 1 ? activePlatforms[0] : null;
  return /* @__PURE__ */ jsxs("section", { className: "overflow-hidden rounded-xl border border-base-300 bg-base-100", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3 border-b border-base-300 px-4 py-3", children: [
      /* @__PURE__ */ jsxs("div", { role: "tablist", className: "tabs tabs-border w-fit", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            role: "tab",
            "aria-selected": queriesActive,
            className: `tab ${queriesActive ? "tab-active" : ""}`,
            onClick: () => setActiveTab("queries"),
            children: "Queries"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            role: "tab",
            "aria-selected": pagesActive,
            className: `tab ${pagesActive ? "tab-active" : ""}`,
            onClick: () => setActiveTab("pages"),
            children: "Cited sources"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "dropdown dropdown-end", children: [
        /* @__PURE__ */ jsxs(
          "div",
          {
            tabIndex: 0,
            role: "button",
            className: `btn btn-ghost btn-sm gap-1.5 ${canExport ? "" : "btn-disabled"}`,
            children: [
              /* @__PURE__ */ jsx(Download, { className: "size-3.5" }),
              "Export",
              /* @__PURE__ */ jsx(ChevronDown, { className: "size-3.5" })
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "ul",
          {
            tabIndex: 0,
            className: "menu dropdown-content z-10 mt-1 w-48 rounded-box border border-base-300 bg-base-100 p-1 shadow",
            children: [
              /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  onClick: handleExportSheets,
                  disabled: !canExport,
                  children: [
                    /* @__PURE__ */ jsx(Sheet, { className: "size-4" }),
                    "Google Sheets"
                  ]
                }
              ) }),
              /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  onClick: handleExportCsv,
                  disabled: !canExport,
                  children: [
                    /* @__PURE__ */ jsx(Download, { className: "size-4" }),
                    "CSV"
                  ]
                }
              ) })
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2 border-b border-base-300 px-4 py-2", children: /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        className: `btn btn-ghost btn-sm gap-1.5 ${filters.showFilters ? "btn-active" : ""}`,
        onClick: () => filters.setShowFilters((current) => !current),
        title: "Toggle table filters",
        children: [
          /* @__PURE__ */ jsx(SlidersHorizontal, { className: "size-3.5" }),
          "Filters",
          currentFilterCount > 0 ? /* @__PURE__ */ jsx("span", { className: "badge badge-xs badge-primary border-0 text-primary-content", children: currentFilterCount }) : null
        ]
      }
    ) }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3 border-b border-base-300 px-4 py-2 text-xs text-base-content/60", children: [
      /* @__PURE__ */ jsx("span", { children: activeTab === "pages" ? /* @__PURE__ */ jsxs(Fragment, { children: [
        isUrlScoped ? "Cited pages within " : "Pages cited alongside ",
        /* @__PURE__ */ jsx("strong", { className: "text-base-content/80", children: result.resolvedTarget }),
        isUrlScoped ? "." : " in AI answers.",
        " Prompt examples come from the fetched sample."
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        "Fetched sample of prompts whose AI answer cited",
        " ",
        isUrlScoped ? "a page within " : null,
        /* @__PURE__ */ jsx("strong", { className: "text-base-content/80", children: result.resolvedTarget }),
        isUrlScoped ? "." : " in its text or sources."
      ] }) }),
      captionPlatform ? /* @__PURE__ */ jsxs("span", { className: "inline-flex shrink-0 items-center gap-1.5 text-base-content/70", children: [
        /* @__PURE__ */ jsx(
          "span",
          {
            className: `size-1.5 rounded-full ${PLATFORM_DOT_CLASS[captionPlatform]}`
          }
        ),
        formatPlatformLabel(captionPlatform)
      ] }) : null
    ] }),
    filters.showFilters ? /* @__PURE__ */ jsx(BrandLookupFilterPanel, { activeTab, filters }) : null,
    activeTab === "pages" ? /* @__PURE__ */ jsx(
      TopPagesTable,
      {
        table: pagesTable,
        emptyMessage: isUrlScoped ? `None of this domain's top cited pages fall under ${result.resolvedTarget}. Broaden the scope to see domain-level citations.` : void 0
      }
    ) : /* @__PURE__ */ jsx(
      TopQueriesTable,
      {
        table: queriesTable,
        emptyMessage: isUrlScoped ? `No sampled prompts cited a page under ${result.resolvedTarget}. Broaden the scope to see domain-level prompts.` : void 0
      }
    )
  ] });
}
const DOMAIN_LEVEL_TIP = "AI search providers report mentions per domain, not per page. This number covers the whole domain — the cited pages below are limited to your scope.";
function DomainLevelBadge() {
  return /* @__PURE__ */ jsx(
    "span",
    {
      className: "tooltip badge badge-ghost badge-sm shrink-0 normal-case",
      "data-tip": DOMAIN_LEVEL_TIP,
      children: "Domain-level"
    }
  );
}
function BrandLookupResults({ result, projectId }) {
  if (!result.hasData) {
    const erroredPlatforms = result.perPlatform.filter(
      (p) => p.status === "error"
    );
    const allPlatformsErrored = erroredPlatforms.length === result.perPlatform.length && result.perPlatform.length > 0;
    if (allPlatformsErrored) {
      return /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-warning/30 bg-warning/10 p-4 text-sm", children: [
        "AI mention data is temporarily unavailable for",
        " ",
        /* @__PURE__ */ jsx("strong", { children: result.resolvedTarget }),
        ". Please try again shortly."
      ] });
    }
    return /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-info/30 bg-info/10 p-4 text-sm", children: [
        "No AI mentions found for ",
        /* @__PURE__ */ jsx("strong", { children: result.resolvedTarget }),
        "."
      ] }),
      erroredPlatforms.length > 0 ? /* @__PURE__ */ jsxs("p", { className: "text-xs text-base-content/60", children: [
        "Note:",
        " ",
        erroredPlatforms.map((p) => formatPlatformLabel(p.platform)).join(" and "),
        " ",
        erroredPlatforms.length === 1 ? "was" : "were",
        " unavailable — some mentions may be missing."
      ] }) : null
    ] });
  }
  const hasTrendData = result.monthlyVolume.length > 0;
  const sov = result.shareOfVoice;
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsx(BrandHeader, { result }),
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: hasTrendData || sov ? "grid gap-4 lg:grid-cols-2" : void 0,
        children: [
          /* @__PURE__ */ jsx(StatsCard, { result }),
          hasTrendData ? /* @__PURE__ */ jsx(MentionTrendCard, { result }) : null,
          sov ? /* @__PURE__ */ jsx(
            BrandLookupShareOfVoice,
            {
              shareOfVoice: sov,
              isDomainLevel: result.aggregatesAreDomainLevel
            }
          ) : null
        ]
      }
    ),
    /* @__PURE__ */ jsx(CitationTabsCard, { result, projectId })
  ] });
}
function BrandHeader({ result }) {
  return /* @__PURE__ */ jsxs("section", { className: "flex flex-wrap items-baseline justify-between gap-2", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-baseline gap-3", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-3xl font-semibold tracking-tight", children: result.resolvedTarget }),
      /* @__PURE__ */ jsx("span", { className: "badge badge-ghost badge-sm", children: result.detectedTargetType }),
      result.scope ? /* @__PURE__ */ jsx("span", { className: "badge badge-ghost badge-sm", children: RESEARCH_SCOPE_LABELS[result.scope] }) : null
    ] }),
    /* @__PURE__ */ jsxs("p", { className: "text-xs text-base-content/50", children: [
      "Updated ",
      formatRelative(result.fetchedAt)
    ] })
  ] });
}
function StatsCard({ result }) {
  return /* @__PURE__ */ jsx("section", { className: "rounded-xl border border-base-300 bg-base-100", children: /* @__PURE__ */ jsxs("div", { className: "flex h-full flex-col divide-y divide-base-200", children: [
    /* @__PURE__ */ jsx(
      StatBlock,
      {
        label: "Mentions",
        tooltip: "Estimated count of AI answers where the searched brand or domain appeared in the answer text or cited sources.",
        value: result.totalMentions,
        perPlatform: result.perPlatform,
        metric: "mentions",
        isDomainLevel: result.aggregatesAreDomainLevel
      }
    ),
    /* @__PURE__ */ jsx(
      StatBlock,
      {
        label: "AI search volume",
        tooltip: "Estimated monthly search demand for prompts where the searched brand or domain appears in AI answers. This is prompt demand, not mention count.",
        value: result.totalAiSearchVolume,
        perPlatform: result.perPlatform,
        metric: "aiSearchVolume",
        isDomainLevel: result.aggregatesAreDomainLevel
      }
    )
  ] }) });
}
function StatBlock({
  label,
  tooltip,
  value,
  perPlatform,
  metric,
  isDomainLevel
}) {
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-1 flex-col justify-center p-4", children: [
    /* @__PURE__ */ jsxs("p", { className: "inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-base-content/50", children: [
      label,
      /* @__PURE__ */ jsx("span", { className: "tooltip inline-flex normal-case", "data-tip": tooltip, children: /* @__PURE__ */ jsx(Info, { className: "size-3 text-base-content/40" }) }),
      isDomainLevel ? /* @__PURE__ */ jsx(DomainLevelBadge, {}) : null
    ] }),
    /* @__PURE__ */ jsx("p", { className: "mt-1 text-3xl font-semibold tabular-nums", children: formatCount(value) }),
    /* @__PURE__ */ jsx("div", { className: "mt-3 space-y-1 border-t border-base-200 pt-2.5", children: perPlatform.map((row) => /* @__PURE__ */ jsx(PlatformStatRow, { row, metric }, row.platform)) })
  ] });
}
function PlatformStatRow({
  row,
  metric
}) {
  const value = row.status === "error" ? null : row[metric];
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-xs", children: [
    /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5 text-base-content/70", children: [
      /* @__PURE__ */ jsx(
        "span",
        {
          className: `size-1.5 rounded-full ${PLATFORM_DOT_CLASS[row.platform]}`
        }
      ),
      formatPlatformLabel(row.platform),
      row.platform === "chat_gpt" ? /* @__PURE__ */ jsx(
        "span",
        {
          className: "tooltip z-20 inline-flex",
          "data-tip": "DataForSEO indexes ChatGPT mentions for US English only — country selection is not available for this platform.",
          children: /* @__PURE__ */ jsx(Info, { className: "size-3 text-base-content/40" })
        }
      ) : null,
      row.status === "error" ? /* @__PURE__ */ jsx("span", { className: "text-error", children: "unavailable" }) : null
    ] }),
    /* @__PURE__ */ jsx("span", { className: "font-medium tabular-nums text-base-content/90", children: formatCount(value) })
  ] });
}
function MentionTrendCard({ result }) {
  return /* @__PURE__ */ jsxs("section", { className: "overflow-hidden rounded-xl border border-base-300 bg-base-100", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2 border-b border-base-300 px-4 py-3", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold", children: "Mention trend (last 12 months)" }),
      result.aggregatesAreDomainLevel ? /* @__PURE__ */ jsx(DomainLevelBadge, {}) : null
    ] }),
    /* @__PURE__ */ jsx("div", { className: "p-4", children: /* @__PURE__ */ jsx(BrandLookupMentionTrendCard, { result }) })
  ] });
}
function formatRelative(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "just now";
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 6e4);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}
const BRAND_LOOKUP_RAW_COST_USD = 0.85;
const BRAND_LOOKUP_COMPETITOR_RAW_COST_USD = 0.2;
const markup = (rawUsd) => isHostedClientAuthMode() ? applyBillingMarkupUsd(rawUsd) : rawUsd;
const BRAND_LOOKUP_DISPLAYED_COST_USD = markup(BRAND_LOOKUP_RAW_COST_USD);
const BRAND_LOOKUP_COMPETITOR_DISPLAYED_COST_USD = markup(
  BRAND_LOOKUP_COMPETITOR_RAW_COST_USD
);
function BrandLookupSearchCard({
  query,
  onQueryChange,
  scope,
  onScopeChange,
  scopeDisabledReason,
  competitors,
  onCompetitorsChange,
  onSubmit,
  isLoading,
  validationError
}) {
  const hasCompetitors = competitors.trim().length > 0;
  const queryError = validationError?.field === "query";
  const competitorsError = validationError?.field === "competitors";
  return /* @__PURE__ */ jsx("div", { className: "card border border-base-300 bg-base-100", children: /* @__PURE__ */ jsxs("div", { className: "card-body gap-4", children: [
    /* @__PURE__ */ jsxs("form", { onSubmit, className: "flex flex-col gap-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 lg:flex-row lg:items-center", children: [
        /* @__PURE__ */ jsxs(
          "label",
          {
            className: `input input-bordered flex flex-1 items-center gap-2 ${queryError ? "input-error" : ""}`,
            children: [
              /* @__PURE__ */ jsx(Search, { className: "size-4 text-base-content/60" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  placeholder: "Enter a brand name or domain",
                  value: query,
                  maxLength: BRAND_LOOKUP_MAX_INPUT_LENGTH,
                  onChange: (event) => onQueryChange(event.target.value),
                  "aria-invalid": queryError || void 0,
                  "aria-describedby": queryError ? "brand-lookup-input-error" : void 0,
                  autoComplete: "off",
                  spellCheck: false,
                  className: "grow"
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          ResearchScopeSelect,
          {
            value: scope,
            onChange: onScopeChange,
            disabledReason: scopeDisabledReason
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            className: "btn btn-primary shrink-0 px-6",
            disabled: isLoading,
            children: isLoading ? "Looking up..." : "Look up"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            placeholder: "Add competitors (comma-separated)",
            value: competitors,
            onChange: (event) => onCompetitorsChange(event.target.value),
            autoComplete: "off",
            spellCheck: false,
            className: `input input-bordered w-full ${competitorsError ? "input-error" : ""}`,
            "aria-label": "Competitors",
            "aria-invalid": competitorsError || void 0,
            "aria-describedby": competitorsError ? "brand-lookup-input-error" : void 0
          }
        ),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-base-content/60", children: "Add up to 5 competitor brands or domains to see your Share of Voice." })
      ] })
    ] }),
    validationError ? /* @__PURE__ */ jsx("p", { id: "brand-lookup-input-error", className: "text-sm text-error", children: validationError.message }) : null,
    /* @__PURE__ */ jsx("div", { className: "flex flex-wrap items-center gap-3 text-xs text-base-content/60", children: /* @__PURE__ */ jsxs("p", { className: "tabular-nums", children: [
      "Est.",
      " ",
      /* @__PURE__ */ jsxs("span", { className: "font-medium text-base-content/80", children: [
        "$",
        BRAND_LOOKUP_DISPLAYED_COST_USD.toFixed(2)
      ] }),
      hasCompetitors ? /* @__PURE__ */ jsxs("span", { children: [
        " ",
        "plus ~$",
        BRAND_LOOKUP_COMPETITOR_DISPLAYED_COST_USD.toFixed(2),
        " to compare competitors"
      ] }) : null
    ] }) })
  ] }) });
}
function BrandLookupHistorySection({ projectId, ...props }) {
  return /* @__PURE__ */ jsx(
    SearchHistorySection,
    {
      ...props,
      emptyIcon: Sparkles,
      emptyMessage: "Search a brand name or domain to see how AI cites it",
      noun: "lookup",
      renderItemLink: (item, content) => /* @__PURE__ */ jsx(
        Link,
        {
          from: "/p/$projectId/brand-lookup",
          to: "/p/$projectId/brand-lookup",
          params: { projectId },
          search: {
            q: item.query,
            c: item.competitors.length > 0 ? item.competitors.join(",") : void 0,
            scope: item.scope
          },
          replace: true,
          className: HISTORY_ITEM_LINK_CLASS,
          children: content
        }
      ),
      renderItem: (item) => /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxs("p", { className: "flex items-center gap-2 truncate font-medium text-base-content", children: [
          item.query,
          item.scope ? /* @__PURE__ */ jsx("span", { className: "badge badge-ghost badge-sm shrink-0", children: RESEARCH_SCOPE_LABELS[item.scope] }) : null
        ] }),
        item.competitors.length > 0 ? /* @__PURE__ */ jsxs("p", { className: "truncate text-xs text-base-content/50", children: [
          "vs ",
          item.competitors.join(", ")
        ] }) : null
      ] })
    }
  );
}
function AiSearchLoadingState() {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-8", "aria-busy": true, children: [
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-base-300 bg-base-300 sm:grid-cols-3", children: Array.from({ length: 3 }).map((_, index) => /* @__PURE__ */ jsxs("div", { className: "space-y-2 bg-base-100 p-5", children: [
      /* @__PURE__ */ jsx("div", { className: "skeleton h-3 w-24" }),
      /* @__PURE__ */ jsx("div", { className: "skeleton h-8 w-32" }),
      /* @__PURE__ */ jsx("div", { className: "skeleton h-3 w-40" })
    ] }, index)) }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsx("div", { className: "skeleton h-4 w-32" }),
      /* @__PURE__ */ jsx("div", { className: "space-y-2 rounded-lg border border-base-300 p-4", children: Array.from({ length: 6 }).map((_, index) => /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-6 gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "skeleton col-span-3 h-4" }),
        /* @__PURE__ */ jsx("div", { className: "skeleton h-4" }),
        /* @__PURE__ */ jsx("div", { className: "skeleton h-4" }),
        /* @__PURE__ */ jsx("div", { className: "skeleton h-4" })
      ] }, index)) })
    ] })
  ] });
}
const brandLookupSearchBodySchema = z.object({
  query: z.string(),
  // Optional/defaulted so pre-existing history entries (query only) still parse.
  competitors: z.array(z.string()).optional().default([]),
  // Absent on entries saved before scopes existed, and on lookups that used
  // the query's default scope — both re-derive the default on restore.
  scope: researchScopeSchema.optional()
});
function useBrandLookupSearchHistory(projectId) {
  return useTimestampedSearchHistory({
    storageKey: `brand-lookup-search-history:${projectId}`,
    bodySchema: brandLookupSearchBodySchema,
    // Competitor set is part of the identity: a plain lookup must not replace
    // the saved (already paid for) Share-of-Voice comparison of the same brand.
    isSame: (a, b) => a.query === b.query && a.competitors.join(",") === b.competitors.join(",") && a.scope === b.scope
  });
}
const KEYWORD_SCOPE_REASON = "Scopes apply to domain lookups";
const BRAND_LOOKUP_BULLETS = [
  {
    icon: TrendingUp,
    title: "Track AI visibility",
    body: "See estimated counts for ChatGPT and Google AI Overview answers that cite your brand, and watch the trend month over month."
  },
  {
    icon: Quote,
    title: "See the prompts",
    body: "View sample user questions where LLMs reference your brand or domain."
  },
  {
    icon: BarChart3,
    title: "Map the competition",
    body: "Spot the pages LLMs cite alongside you so you know who's competing for attention in AI answers."
  }
];
function BrandLookupPage(props) {
  return /* @__PURE__ */ jsx(HostedPlanGate, { children: (planGate) => /* @__PURE__ */ jsx(BrandLookupPageInner, { ...props, planGate }) });
}
function BrandLookupPageInner({
  projectId,
  initialQuery,
  initialCompetitors,
  initialScope,
  onSearchChange,
  planGate
}) {
  const [query, setQuery] = useState(initialQuery);
  const [scopeChoice, setScopeChoice] = useState(
    initialScope
  );
  const [competitorsInput, setCompetitorsInput] = useState(
    initialCompetitors.join(", ")
  );
  const [validationError, setValidationError] = useState(null);
  const trimmedInitialQuery = initialQuery.trim();
  const hasActiveQuery = trimmedInitialQuery.length > 0;
  const competitorKey = initialCompetitors.join(",");
  const scopeTarget = useMemo(() => {
    if (detectTarget(query).type !== "domain") return null;
    const parsed = parseResearchTarget(query);
    return parsed.ok ? parsed.target : null;
  }, [query]);
  const selectedScope = scopeChoice ?? scopeTarget?.scope ?? "domain";
  const scopeDisabledReason = query.trim() !== "" && !scopeTarget ? KEYWORD_SCOPE_REASON : void 0;
  const lookupQuery = useQuery({
    queryKey: [
      "brand-lookup",
      projectId,
      trimmedInitialQuery,
      competitorKey,
      initialScope ?? ""
    ],
    queryFn: () => lookupBrand({
      data: {
        projectId,
        query: trimmedInitialQuery,
        competitors: initialCompetitors,
        scope: initialScope,
        locationCode: 2840,
        languageCode: "en"
      }
    }),
    // Client-side gate is a UX optimization only; the paywall is enforced
    // server-side (lookupBrand → assertPaidPlan) before any DataForSEO spend,
    // so a stale free-plan window here just yields a rejected request, not cost.
    enabled: hasActiveQuery && !planGate.isFreePlan,
    staleTime: 5 * 60 * 1e3,
    retry: false
  });
  const {
    history,
    isLoaded: historyLoaded,
    addSearch,
    removeHistoryItem
  } = useBrandLookupSearchHistory(projectId);
  const lastAddedKeyRef = useRef(null);
  useEffect(() => {
    if (!hasActiveQuery || !lookupQuery.isSuccess) return;
    const addedKey = `${trimmedInitialQuery}::${competitorKey}::${initialScope ?? ""}`;
    if (lastAddedKeyRef.current === addedKey) return;
    lastAddedKeyRef.current = addedKey;
    addSearch({
      query: trimmedInitialQuery,
      competitors: competitorKey ? competitorKey.split(",") : [],
      scope: initialScope
    });
  }, [
    hasActiveQuery,
    lookupQuery.isSuccess,
    trimmedInitialQuery,
    competitorKey,
    initialScope,
    addSearch
  ]);
  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length === 0) {
      setValidationError({
        field: "query",
        message: "Enter a brand name or domain"
      });
      return;
    }
    if (trimmed.length > BRAND_LOOKUP_MAX_INPUT_LENGTH) {
      setValidationError({
        field: "query",
        message: `Keep it under ${BRAND_LOOKUP_MAX_INPUT_LENGTH} characters`
      });
      return;
    }
    const competitors = parseCompetitorList(competitorsInput);
    const tooLong = competitors.find(
      (competitor) => competitor.length > BRAND_LOOKUP_MAX_INPUT_LENGTH
    );
    if (tooLong) {
      setValidationError({
        field: "competitors",
        message: `Keep each competitor under ${BRAND_LOOKUP_MAX_INPUT_LENGTH} characters`
      });
      return;
    }
    const targetValue = detectTarget(trimmed).value.toLowerCase();
    const matchesTarget = competitors.find(
      (competitor) => detectTarget(competitor).value.toLowerCase() === targetValue
    );
    if (matchesTarget) {
      setValidationError({
        field: "competitors",
        message: `"${matchesTarget}" matches the brand you're looking up — remove it from competitors`
      });
      return;
    }
    if (scopeTarget && selectedScope === "subfolder" && scopeTarget.path === "") {
      setValidationError({
        field: "query",
        message: "Add a path to use Subfolder (e.g. example.com/blog)"
      });
      return;
    }
    setValidationError(null);
    const explicitScope = scopeTarget ? toScopeSearchParam(trimmed, selectedScope) : void 0;
    onSearchChange(trimmed, competitors, explicitScope);
  };
  useEffect(() => {
    setQuery(initialQuery);
    setCompetitorsInput(competitorKey.split(",").join(", "));
    setScopeChoice(initialScope);
    setValidationError(null);
  }, [initialQuery, competitorKey, initialScope]);
  const isLoading = hasActiveQuery && lookupQuery.isPending;
  const errorMessage = hasActiveQuery && lookupQuery.isError ? getStandardErrorMessage(lookupQuery.error) : null;
  const resultData = hasActiveQuery ? lookupQuery.data : void 0;
  return /* @__PURE__ */ jsx("div", { className: "px-4 py-4 pb-24 overflow-auto md:px-6 md:py-6 md:pb-8", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-7xl space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold", children: "Brand Lookup" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-base-content/70", children: "See how AI search cites any brand name or domain." })
    ] }),
    planGate.isFreePlan ? /* @__PURE__ */ jsx(
      AiSearchPaidPlanGate,
      {
        feature: "Brand Lookup",
        description: "See how ChatGPT and Google AI Overview cite any brand or domain — total mentions, sample prompts where it appears, and the pages cited alongside it.",
        bullets: BRAND_LOOKUP_BULLETS
      }
    ) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(
        BrandLookupSearchCard,
        {
          query,
          onQueryChange: (next) => {
            setQuery(next);
            if (validationError) setValidationError(null);
          },
          scope: selectedScope,
          onScopeChange: setScopeChoice,
          scopeDisabledReason,
          competitors: competitorsInput,
          onCompetitorsChange: (next) => {
            setCompetitorsInput(next);
            if (validationError) setValidationError(null);
          },
          onSubmit: handleSubmit,
          isLoading,
          validationError
        }
      ),
      errorMessage ? /* @__PURE__ */ jsxs(
        "div",
        {
          role: "alert",
          className: "flex items-start gap-2 rounded-lg border border-error/30 bg-error/10 p-3 text-sm text-error",
          children: [
            /* @__PURE__ */ jsx(AlertCircle, { className: "mt-0.5 size-4 shrink-0" }),
            /* @__PURE__ */ jsx("span", { children: errorMessage })
          ]
        }
      ) : null,
      isLoading ? /* @__PURE__ */ jsx(AiSearchLoadingState, {}) : resultData ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs(
          Link,
          {
            from: "/p/$projectId/brand-lookup",
            to: "/p/$projectId/brand-lookup",
            params: { projectId },
            search: { q: void 0, c: void 0, scope: void 0 },
            replace: true,
            className: "btn btn-ghost btn-sm gap-2 px-0 text-base-content/70 hover:bg-transparent",
            children: [
              /* @__PURE__ */ jsx(ArrowLeft, { className: "size-4" }),
              "Recent searches"
            ]
          }
        ) }),
        /* @__PURE__ */ jsx(BrandLookupResults, { result: resultData, projectId })
      ] }) : !errorMessage ? /* @__PURE__ */ jsx(
        BrandLookupHistorySection,
        {
          projectId,
          history,
          historyLoaded,
          onRemoveHistoryItem: removeHistoryItem
        }
      ) : null
    ] })
  ] }) });
}
function BrandLookupRoute() {
  const {
    projectId
  } = Route.useParams();
  const navigate = useNavigate({
    from: Route.fullPath
  });
  const {
    q = "",
    c = [],
    scope
  } = Route.useSearch();
  return /* @__PURE__ */ jsx(BrandLookupPage, { projectId, initialQuery: q, initialCompetitors: c, initialScope: scope, onSearchChange: (nextQuery, nextCompetitors, nextScope) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        q: nextQuery.trim() || void 0,
        // One serialization site: comma-join the competitor list.
        c: nextCompetitors.length > 0 ? nextCompetitors.join(",") : void 0,
        // The page passes a scope only when it differs from the default
        // derived from `q`.
        scope: nextScope
      }),
      replace: true
    });
  } });
}
export {
  BrandLookupRoute as component
};
