import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState, useMemo } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { bm as LOCATIONS, ba as formatLocationLabel, bn as devicesLabel, bo as scheduleLabel } from "../entry.js";
import { Plus, Globe, Search, Archive, AlertTriangle, ChevronRight } from "lucide-react";
import { E as EMPTY_DOMAIN_LIST_FILTERS, g as getRankTrackingConfigSummaries, a as applyDomainListFilters, b as getDomainListFilterOptions, c as countActiveDomainListFilters, u as updateRankTrackingConfig, D as DomainListFilterBar, R as RankTrackingConfigModal } from "./RankTrackingConfigModal-BywdwPtY.js";
import { M as Modal } from "./Modal-81iy_nBW.js";
import { M as Route } from "./router-DHiBnyXs.js";
import "node:async_hooks";
import "node:crypto";
import "ioredis";
import "node:fs/promises";
import "node:path";
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
import "postgres";
import "drizzle-orm/pg-core";
import "jose/errors";
import "node:fs";
import "node:os";
import "@better-auth/api-key";
import "posthog-node";
import "@modelcontextprotocol/server";
import "remeda";
import "tldts";
import "srvx";
import "@tanstack/react-router/ssr/server";
import "./LocationSelect-D9KloY89.js";
import "./useProjectMarket-Bh8FB1Iw.js";
import "./projects-B08wh0PW.js";
import "./middleware-Doy-pxkJ.js";
import "./domain-CDKzloj_.js";
import "./rank-tracking-BD8SoYpX.js";
import "@tanstack/query-core";
import "./selfHostedOAuth-C3UAQwsK.js";
import "./ai-search-BV1mIqc0.js";
import "./audit-SZdMhI6q.js";
import "autumn-js/react";
import "react-dom";
import "@tanstack/react-form";
import "@better-auth/api-key/client";
import "papaparse";
import "@tanstack/react-table";
import "recharts";
import "./lighthouse-CiThJE4g.js";
import "./lighthouse-CxIZIYPF.js";
const FILTER_BAR_MIN_DOMAINS = 6;
function RankTrackingDomainList({
  projectId,
  onAddDomain
}) {
  const queryClient = useQueryClient();
  const [archiveTarget, setArchiveTarget] = useState(
    null
  );
  const [filters, setFilters] = useState(
    EMPTY_DOMAIN_LIST_FILTERS
  );
  const { data: summaries, isPending } = useQuery({
    queryKey: ["rankTrackingConfigSummaries", projectId],
    queryFn: () => getRankTrackingConfigSummaries({ data: { projectId } })
  });
  const allSummaries = useMemo(() => summaries ?? [], [summaries]);
  const filteredSummaries = useMemo(
    () => applyDomainListFilters(allSummaries, filters),
    [allSummaries, filters]
  );
  const filterOptions = useMemo(
    () => getDomainListFilterOptions(allSummaries),
    [allSummaries]
  );
  const activeFilterCount = countActiveDomainListFilters(filters);
  const archiveMutation = useMutation({
    mutationFn: (configId) => updateRankTrackingConfig({
      data: { projectId, configId, isActive: false }
    }),
    onSuccess: () => {
      setArchiveTarget(null);
      void queryClient.invalidateQueries({
        queryKey: ["rankTrackingConfigSummaries", projectId]
      });
      void queryClient.invalidateQueries({
        queryKey: ["rankTrackingConfigs", projectId]
      });
      toast.success("Domain archived");
    }
  });
  return /* @__PURE__ */ jsxs("div", { className: "card bg-base-100 border border-base-300", children: [
    /* @__PURE__ */ jsxs("div", { className: "card-body gap-0 p-0", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-5 pt-4 pb-3", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold", children: "Tracked Domains" }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            className: "btn btn-primary btn-sm gap-1",
            onClick: onAddDomain,
            children: [
              /* @__PURE__ */ jsx(Plus, { className: "size-3.5" }),
              "Add Domain"
            ]
          }
        )
      ] }),
      (allSummaries.length >= FILTER_BAR_MIN_DOMAINS || activeFilterCount > 0) && /* @__PURE__ */ jsx(
        DomainListFilterBar,
        {
          filters,
          options: filterOptions,
          activeFilterCount,
          onChange: setFilters,
          onReset: () => setFilters(EMPTY_DOMAIN_LIST_FILTERS)
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "divide-y divide-base-300 border-t border-base-300", children: isPending ? /* @__PURE__ */ jsx("div", { className: "space-y-4 px-5 py-4", "aria-busy": true, children: Array.from({ length: 3 }).map((_, index) => /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx("div", { className: "skeleton h-4 w-48" }),
        /* @__PURE__ */ jsx("div", { className: "skeleton h-3 w-72" })
      ] }, index)) }) : allSummaries.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "px-5 py-10 text-center space-y-2", children: [
        /* @__PURE__ */ jsx("div", { className: "mx-auto flex size-10 items-center justify-center rounded-xl bg-base-200", children: /* @__PURE__ */ jsx(Globe, { className: "size-5 text-base-content/40" }) }),
        /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-base-content/70", children: "No tracked domains yet" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-base-content/40", children: "Add a domain to start monitoring keyword rankings over time." })
      ] }) : filteredSummaries.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "px-5 py-10 text-center space-y-3", children: [
        /* @__PURE__ */ jsx("div", { className: "mx-auto flex size-10 items-center justify-center rounded-xl bg-base-200", children: /* @__PURE__ */ jsx(Search, { className: "size-5 text-base-content/40" }) }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-base-content/70", children: "No matching tracked domains" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-base-content/40", children: "Try clearing search or adjusting filters." })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "btn btn-ghost btn-xs",
            onClick: () => setFilters(EMPTY_DOMAIN_LIST_FILTERS),
            disabled: activeFilterCount === 0,
            children: "Clear filters"
          }
        )
      ] }) : filteredSummaries.map((summary) => /* @__PURE__ */ jsx(
        DomainRow,
        {
          projectId,
          summary,
          onArchive: () => setArchiveTarget(summary)
        },
        summary.id
      )) })
    ] }),
    archiveTarget && /* @__PURE__ */ jsxs(
      Modal,
      {
        onClose: () => setArchiveTarget(null),
        labelledBy: "archive-domain-title",
        children: [
          /* @__PURE__ */ jsxs("h3", { id: "archive-domain-title", className: "text-lg font-semibold", children: [
            "Archive ",
            archiveTarget.domain,
            "?"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-base-content/70", children: "Scheduled checks will stop and this domain will be hidden from the list. Ranking history is preserved." }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                className: "btn btn-ghost btn-sm",
                onClick: () => setArchiveTarget(null),
                children: "Cancel"
              }
            ),
            /* @__PURE__ */ jsxs(
              "button",
              {
                className: "btn btn-error btn-sm gap-1",
                onClick: () => archiveMutation.mutate(archiveTarget.id),
                disabled: archiveMutation.isPending,
                children: [
                  /* @__PURE__ */ jsx(Archive, { className: "size-3.5" }),
                  "Archive"
                ]
              }
            )
          ] })
        ]
      }
    )
  ] });
}
function DomainRow({
  projectId,
  summary,
  onArchive
}) {
  return /* @__PURE__ */ jsxs("div", { className: "relative flex w-full items-center gap-4 px-5 py-3.5 transition-colors hover:bg-base-200/50", children: [
    /* @__PURE__ */ jsx(
      Link,
      {
        to: "/p/$projectId/rank-tracking/$configId",
        params: { projectId, configId: summary.id },
        className: "absolute inset-0 z-0",
        "aria-label": `Open ${summary.domain}`
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1 pointer-events-none", children: [
      /* @__PURE__ */ jsx("p", { className: "font-medium truncate", children: summary.domain }),
      /* @__PURE__ */ jsxs("p", { className: "text-xs text-base-content/60", children: [
        summary.locationName ? formatLocationLabel(summary.locationName, 2) : LOCATIONS[summary.locationCode] ?? "US",
        " ",
        "· ",
        devicesLabel(summary.devices),
        " ·",
        " ",
        scheduleLabel(summary.scheduleInterval),
        summary.lastRunCompletedAt && /* @__PURE__ */ jsxs(Fragment, { children: [
          " ",
          "· Last:",
          " ",
          new Date(summary.lastRunCompletedAt).toLocaleDateString()
        ] })
      ] }),
      summary.lastSkipReason === "insufficient_credits" && /* @__PURE__ */ jsxs("p", { className: "flex items-center gap-1 text-xs text-warning", children: [
        /* @__PURE__ */ jsx(AlertTriangle, { className: "size-3" }),
        "Scheduled check skipped — insufficient credits"
      ] }),
      summary.lastSkipReason === "plan_required" && /* @__PURE__ */ jsxs("p", { className: "flex items-center gap-1 text-xs text-warning", children: [
        /* @__PURE__ */ jsx(AlertTriangle, { className: "size-3" }),
        "Scheduled check skipped — paid plan required"
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "hidden sm:flex items-center gap-6 text-sm pointer-events-none", children: summary.keywordCount > 0 && /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-wide text-base-content/60", children: "Keywords" }),
      /* @__PURE__ */ jsx("p", { className: "font-mono font-medium", children: summary.keywordCount })
    ] }) }),
    /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        className: "btn btn-ghost btn-xs text-base-content/40 hover:text-error relative z-10",
        title: "Archive domain",
        onClick: (e) => {
          e.stopPropagation();
          e.preventDefault();
          onArchive();
        },
        children: /* @__PURE__ */ jsx(Archive, { className: "size-4" })
      }
    ),
    /* @__PURE__ */ jsx(ChevronRight, { className: "size-4 shrink-0 text-base-content/40 pointer-events-none" })
  ] });
}
function RankTrackingIndex() {
  const {
    projectId
  } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showConfigModal, setShowConfigModal] = useState(false);
  const invalidateConfigs = () => {
    void queryClient.invalidateQueries({
      queryKey: ["rankTrackingConfigs", projectId]
    });
    void queryClient.invalidateQueries({
      queryKey: ["rankTrackingConfigSummaries", projectId]
    });
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(RankTrackingDomainList, { projectId, onAddDomain: () => setShowConfigModal(true) }),
    showConfigModal && /* @__PURE__ */ jsx(RankTrackingConfigModal, { projectId, existingConfig: null, onClose: () => setShowConfigModal(false), onConfigCreated: invalidateConfigs, onSaved: (createdConfigId) => {
      setShowConfigModal(false);
      invalidateConfigs();
      if (createdConfigId) {
        void navigate({
          to: "/p/$projectId/rank-tracking/$configId",
          params: {
            projectId,
            configId: createdConfigId
          }
        });
      }
    } })
  ] });
}
export {
  RankTrackingIndex as component
};
