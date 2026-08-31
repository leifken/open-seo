import { jsxs, jsx } from "react/jsx-runtime";
import { useAggregateEvents, useCustomer } from "autumn-js/react";
import { useRef, useState, useEffect } from "react";
import { m as createSsrRpc, u as useSession, t as getCustomerPlanStatus, p as getStandardErrorMessage, c as captureClientEvent } from "./router-BZ-5uDXB.js";
import { b as buildCheckoutSuccessUrl } from "./checkout-url-BnQlItFV.js";
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from "recharts";
import { aa as AUTUMN_SEO_DATA_BALANCE_FEATURE_ID, ab as AUTUMN_SEO_DATA_TOPUP_BALANCE_FEATURE_ID, bn as autumnSeoDataCreditsToUsd, h as createServerFn, bG as mapDataforseoPathToCreditFeature, bH as creditFeatureLabel, bp as LOW_CREDITS_THRESHOLD_USD, bI as AUTUMN_SEO_DATA_CREDITS_PER_USD, bJ as AUTUMN_SEO_DATA_TOP_UP_PLAN_ID, aK as AUTUMN_PAID_PLAN_ID, bo as BILLING_ROUTE } from "../entry.js";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { a as requireAuthenticatedContext } from "./middleware-CvzXieP6.js";
import { a as getBillingRouteState } from "./route-state-BRTeyZpo.js";
import "@tanstack/react-router";
import "lucide-react";
import "@tanstack/query-core";
import "./selfHostedOAuth-DmcaPqZ5.js";
import "drizzle-orm";
import "jose";
import "./ai-search-BV1mIqc0.js";
import "./audit-SZdMhI6q.js";
import "react-dom";
import "@tanstack/react-form";
import "sonner";
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
const BILLING_USAGE_FEATURE_IDS$1 = [
  AUTUMN_SEO_DATA_BALANCE_FEATURE_ID,
  AUTUMN_SEO_DATA_TOPUP_BALANCE_FEATURE_ID
];
function BillingUsageChart() {
  const containerRef = useRef(null);
  const [chartWidth, setChartWidth] = useState(0);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setChartWidth(el.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const eventsQuery = useAggregateEvents({
    featureId: BILLING_USAGE_FEATURE_IDS$1,
    range: "30d",
    binSize: "day"
  });
  const chartData = (eventsQuery.list ?? []).map((row) => ({
    date: row.period,
    credits: autumnSeoDataCreditsToUsd(
      BILLING_USAGE_FEATURE_IDS$1.reduce(
        (sum, featureId) => sum + (row.values?.[featureId] ?? 0),
        0
      )
    )
  }));
  const totalSpend = chartData.reduce((sum, d) => sum + d.credits, 0);
  return /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-base-300 bg-base-100 p-4 space-y-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between gap-4", children: [
      /* @__PURE__ */ jsx("span", { className: "font-semibold", children: "Usage" }),
      /* @__PURE__ */ jsx("span", { className: "text-xs text-base-content/50", children: "Last 30 days" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "text-2xl font-semibold tabular-nums", children: [
      "$",
      totalSpend.toFixed(2)
    ] }),
    /* @__PURE__ */ jsx("div", { ref: containerRef, className: "w-full h-32 min-w-0", children: eventsQuery.isLoading ? null : chartData.length === 0 ? /* @__PURE__ */ jsx("div", { className: "flex h-full items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "text-sm text-base-content/40", children: "No usage recorded yet" }) }) : chartWidth > 0 ? /* @__PURE__ */ jsxs(
      BarChart,
      {
        width: chartWidth,
        height: 128,
        data: chartData,
        margin: { top: 4, right: 0, bottom: 0, left: 0 },
        children: [
          /* @__PURE__ */ jsx(
            CartesianGrid,
            {
              strokeDasharray: "3 3",
              stroke: "currentColor",
              opacity: 0.06,
              vertical: false
            }
          ),
          /* @__PURE__ */ jsx(
            XAxis,
            {
              dataKey: "date",
              tickFormatter: formatShortDate,
              tick: { fontSize: 10, fill: "#888" },
              tickLine: false,
              axisLine: false,
              minTickGap: 40
            }
          ),
          /* @__PURE__ */ jsx(
            YAxis,
            {
              tickFormatter: formatUsdAxis,
              tick: { fontSize: 10, fill: "#888" },
              tickLine: false,
              axisLine: false,
              width: 44
            }
          ),
          /* @__PURE__ */ jsx(
            Tooltip,
            {
              content: /* @__PURE__ */ jsx(UsageTooltip, {}),
              cursor: { fill: "rgba(150,150,150,0.1)" }
            }
          ),
          /* @__PURE__ */ jsx(
            Bar,
            {
              dataKey: "credits",
              fill: "#7c3aed",
              radius: [2, 2, 0, 0],
              maxBarSize: 12
            }
          )
        ]
      }
    ) : null })
  ] });
}
function UsageTooltip({
  active,
  payload,
  label
}) {
  if (!active || !payload?.length || label == null) return null;
  return /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-base-300 bg-base-100 px-3 py-2 shadow-sm", children: [
    /* @__PURE__ */ jsx("p", { className: "text-xs text-base-content/60", children: new Date(label).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric"
    }) }),
    /* @__PURE__ */ jsxs("p", { className: "text-sm font-medium tabular-nums", children: [
      "$",
      payload[0].value.toFixed(2)
    ] })
  ] });
}
function formatShortDate(timestamp) {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric"
  });
}
function formatUsdAxis(value) {
  return `$${value % 1 === 0 ? value : value.toFixed(2)}`;
}
const billingUsageRangeSchema = z.object({
  start: z.number(),
  end: z.number()
});
const getBillingUsageEvents = createServerFn({
  method: "POST"
}).middleware(requireAuthenticatedContext).validator(billingUsageRangeSchema).handler(createSsrRpc("4f6a59af64bb95847828f645f342cfbb203858ef0caca7ddb96adebcce44b7a0"));
const BILLING_USAGE_FEATURE_IDS = [
  AUTUMN_SEO_DATA_BALANCE_FEATURE_ID,
  AUTUMN_SEO_DATA_TOPUP_BALANCE_FEATURE_ID
];
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1e3;
function getLast30DayUsageRange() {
  const end = Date.now();
  return {
    start: end - THIRTY_DAYS_MS,
    end
  };
}
function isRecord(value) {
  return typeof value === "object" && value !== null;
}
function getPathSegmentsFromProperties(properties) {
  const paths = properties.paths ?? properties.path;
  if (Array.isArray(paths)) {
    const stringPaths = paths.filter(
      (value) => typeof value === "string"
    );
    if (stringPaths.length > 1 && stringPaths.every((segment) => !segment.includes("/"))) {
      return stringPaths;
    }
    const path = stringPaths[0];
    if (!path) return null;
    const parsedPath2 = parseJsonEncodedPath(path);
    return parsedPath2 ?? path.split("/").filter(Boolean);
  }
  if (typeof paths !== "string") return null;
  const parsedPath = parseJsonEncodedPath(paths);
  return parsedPath ?? paths.split("/").filter(Boolean);
}
function parseJsonEncodedPath(path) {
  if (!path.startsWith("[")) return null;
  try {
    const parsed = JSON.parse(path);
    if (!Array.isArray(parsed)) return null;
    const stringPaths = parsed.filter(
      (value) => typeof value === "string"
    );
    if (stringPaths.length > 1 && stringPaths.every((segment) => !segment.includes("/"))) {
      return stringPaths;
    }
    const firstPath = stringPaths[0];
    return firstPath ? firstPath.split("/").filter(Boolean) : null;
  } catch {
    return null;
  }
}
function getCreditFeatureFromUsageEvent(event) {
  const properties = isRecord(event.properties) ? event.properties : {};
  const explicitFeature = properties.creditFeature ?? properties.credit_feature;
  if (typeof explicitFeature === "string" && explicitFeature.length > 0) {
    return explicitFeature;
  }
  const path = getPathSegmentsFromProperties(properties);
  return path ? mapDataforseoPathToCreditFeature(path) : null;
}
function getBillingFeatureBreakdownRows(events) {
  const creditsByLabel = /* @__PURE__ */ new Map();
  for (const event of events) {
    const feature = getCreditFeatureFromUsageEvent(event);
    const label = feature ? creditFeatureLabel(feature) : "Other";
    creditsByLabel.set(label, (creditsByLabel.get(label) ?? 0) + event.value);
  }
  return [...creditsByLabel.entries()].map(([label, credits]) => ({
    label,
    usd: autumnSeoDataCreditsToUsd(credits)
  })).filter((row) => row.usd > 0).toSorted((a, b) => b.usd - a.usd);
}
function BillingFeatureBreakdown() {
  const eventsQuery = useQuery({
    queryKey: ["billing", "usage-events", BILLING_USAGE_FEATURE_IDS, "30d"],
    queryFn: () => getBillingUsageEvents({ data: getLast30DayUsageRange() }),
    staleTime: 6e4
  });
  const rows = getBillingFeatureBreakdownRows(eventsQuery.data ?? []);
  const total = rows.reduce((sum, row) => sum + row.usd, 0);
  return /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-base-300 bg-base-100 p-4 space-y-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between gap-4", children: [
      /* @__PURE__ */ jsx("span", { className: "font-semibold", children: "Usage by feature" }),
      /* @__PURE__ */ jsx("span", { className: "text-xs text-base-content/50", children: "Last 30 days" })
    ] }),
    eventsQuery.isLoading ? /* @__PURE__ */ jsx("div", { className: "space-y-3", children: [0, 1, 2, 3].map((i) => /* @__PURE__ */ jsx("div", { className: "skeleton h-4 w-full" }, i)) }) : rows.length === 0 ? /* @__PURE__ */ jsx("div", { className: "text-sm text-base-content/40", children: "No usage recorded yet" }) : /* @__PURE__ */ jsx("ul", { className: "space-y-2.5", children: rows.map((row) => /* @__PURE__ */ jsxs("li", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between gap-4 text-sm", children: [
        /* @__PURE__ */ jsx("span", { children: row.label }),
        /* @__PURE__ */ jsxs("span", { className: "tabular-nums text-base-content/70", children: [
          "$",
          row.usd.toFixed(2)
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "h-1.5 w-full overflow-hidden rounded-full bg-base-200", children: /* @__PURE__ */ jsx(
        "div",
        {
          className: "h-full rounded-full bg-[#7c3aed]",
          style: { width: `${row.usd / total * 100}%` }
        }
      ) })
    ] }, row.label)) })
  ] });
}
function parseTopUpAmount(value) {
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) {
    return {
      isValid: false,
      parsed: 20
    };
  }
  const parsed = Number(trimmed);
  const isValid = Number.isInteger(parsed) && parsed >= 10 && parsed <= 99;
  return {
    isValid,
    parsed: isValid ? parsed : 20
  };
}
function BillingPage() {
  const {
    data: session,
    isPending: isSessionPending
  } = useSession();
  const [topUpAmount, setTopUpAmount] = useState("20");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState(null);
  const customerQuery = useCustomer({
    queryOptions: {
      enabled: Boolean(session?.user?.id)
    }
  });
  const planStatus = getCustomerPlanStatus(customerQuery.data);
  const isFreePlan = planStatus === "free";
  const billingRouteState = getBillingRouteState({
    hasSession: Boolean(session?.user?.id),
    isSessionPending,
    isCustomerLoading: customerQuery.isLoading,
    isCustomerError: customerQuery.isError
  });
  const monthlyRemaining = autumnSeoDataCreditsToUsd(customerQuery.data?.balances?.[AUTUMN_SEO_DATA_BALANCE_FEATURE_ID]?.remaining ?? 0);
  const topUpRemaining = autumnSeoDataCreditsToUsd(customerQuery.data?.balances?.[AUTUMN_SEO_DATA_TOPUP_BALANCE_FEATURE_ID]?.remaining ?? 0);
  const totalRemaining = monthlyRemaining + topUpRemaining;
  const {
    isValid: isValidTopUp,
    parsed: parsedTopUpAmount
  } = parseTopUpAmount(topUpAmount);
  if (billingRouteState === "loading") {
    return null;
  }
  if (billingRouteState === "error") {
    return /* @__PURE__ */ jsxs("div", { className: "mx-auto w-full max-w-2xl space-y-4 p-4 py-10 md:p-6 md:py-12", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold", children: "Billing unavailable" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-base-content/70", children: getStandardErrorMessage(customerQuery.error, "We couldn't load your billing details right now. Please try again.") }),
      /* @__PURE__ */ jsx("button", { type: "button", className: "btn btn-soft btn-sm", onClick: () => {
        void customerQuery.refetch();
      }, children: "Try again" })
    ] });
  }
  function startUpgradeCheckout() {
    captureClientEvent("billing:checkout_start");
    return customerQuery.attach({
      planId: AUTUMN_PAID_PLAN_ID,
      redirectMode: "always",
      successUrl: buildCheckoutSuccessUrl(BILLING_ROUTE)
    });
  }
  async function runAction(callback, fallbackMessage) {
    setError(null);
    setIsPending(true);
    try {
      await callback();
      await customerQuery.refetch();
    } catch (err) {
      setError(getStandardErrorMessage(err, fallbackMessage));
    } finally {
      setIsPending(false);
    }
  }
  if (isPending) {
    return /* @__PURE__ */ jsx("div", { className: "flex h-full items-center justify-center", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-base-content/50", children: "Redirecting to Stripe..." }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto w-full max-w-2xl space-y-5 p-4 py-10 md:p-6 md:py-12", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold", children: "Billing" }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-5 md:grid-cols-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col justify-between rounded-lg border border-base-300 bg-base-100 p-4 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "text-2xl font-semibold tabular-nums", children: [
            "$",
            totalRemaining.toFixed(2),
            " ",
            /* @__PURE__ */ jsx("span", { className: "text-sm font-normal text-base-content/50", children: "remaining" })
          ] }),
          !isFreePlan ? /* @__PURE__ */ jsxs("div", { className: "mt-1 flex gap-3 text-xs text-base-content/50", children: [
            /* @__PURE__ */ jsxs("span", { className: "tabular-nums", children: [
              "Monthly $",
              monthlyRemaining.toFixed(2)
            ] }),
            /* @__PURE__ */ jsx("span", { children: "·" }),
            /* @__PURE__ */ jsxs("span", { className: "tabular-nums", children: [
              "Top-ups $",
              topUpRemaining.toFixed(2)
            ] })
          ] }) : null,
          totalRemaining <= 0 ? /* @__PURE__ */ jsxs("p", { className: "mt-2 text-xs text-error", children: [
            "You’ve used all your credits.",
            " ",
            isFreePlan ? "Upgrade your plan to continue." : "Buy more credits below to continue."
          ] }) : totalRemaining < LOW_CREDITS_THRESHOLD_USD ? /* @__PURE__ */ jsxs("p", { className: "mt-2 text-xs text-amber-600", children: [
            "You’re running low on credits.",
            " ",
            isFreePlan ? "Upgrade to get $10/month." : "Buy more credits below."
          ] }) : null
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Plan" }),
          " ",
          /* @__PURE__ */ jsx("span", { className: "text-base-content/50", children: isFreePlan ? "Free Plan" : "Base Plan" })
        ] }),
        isFreePlan ? /* @__PURE__ */ jsxs("div", { className: "space-y-3 border-t border-base-300 pt-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between gap-4", children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: "Base Plan" }),
            /* @__PURE__ */ jsx("span", { className: "text-sm font-medium tabular-nums", children: "$10/month" })
          ] }),
          /* @__PURE__ */ jsx("ul", { className: "space-y-1.5", children: ["Access to all OpenSEO features", "Includes $10.00 of Usage Credits each month"].map((item) => /* @__PURE__ */ jsxs("li", { className: "flex gap-2 text-xs text-base-content/60", children: [
            /* @__PURE__ */ jsx("span", { className: "text-base-content/30 mt-[1px] shrink-0", children: "—" }),
            item
          ] }, item)) }),
          /* @__PURE__ */ jsx("button", { className: "btn btn-soft btn-sm w-full", disabled: isPending, onClick: () => void runAction(startUpgradeCheckout, "We couldn't start the checkout. Please try again."), children: "Upgrade Plan" })
        ] }) : /* @__PURE__ */ jsx("button", { className: "btn btn-soft btn-sm w-full", disabled: isPending, onClick: () => void runAction(() => customerQuery.openCustomerPortal({
          returnUrl: window.location.href
        }), "We couldn't open the billing portal. Please try again."), children: "Manage subscription" })
      ] }),
      !isFreePlan ? /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-base-300 bg-base-100 p-4 space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { className: "font-semibold", children: "Buy credits" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-base-content/60", children: "Top-up credits never expire and are used after your monthly credits." })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm text-base-content/60", children: "$" }),
            /* @__PURE__ */ jsx("input", { type: "number", min: 10, max: 99, step: 1, inputMode: "numeric", className: "input input-bordered input-sm w-full", value: topUpAmount, onChange: (e) => setTopUpAmount(e.target.value) })
          ] }),
          topUpAmount.trim() !== "" && !isValidTopUp ? /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-error", children: "Enter between $10–$99." }) : null
        ] }),
        /* @__PURE__ */ jsx("button", { className: "btn btn-soft btn-sm w-full", disabled: isPending || !isValidTopUp, onClick: () => void runAction(() => customerQuery.attach({
          planId: AUTUMN_SEO_DATA_TOP_UP_PLAN_ID,
          redirectMode: "always",
          successUrl: window.location.href,
          featureQuantities: [{
            featureId: AUTUMN_SEO_DATA_TOPUP_BALANCE_FEATURE_ID,
            quantity: Math.round(parsedTopUpAmount * AUTUMN_SEO_DATA_CREDITS_PER_USD)
          }]
        }), "We couldn't start the checkout. Please try again."), children: "Buy credits" })
      ] }) : null
    ] }),
    /* @__PURE__ */ jsx(BillingUsageChart, {}),
    /* @__PURE__ */ jsx(BillingFeatureBreakdown, {}),
    error ? /* @__PURE__ */ jsx("p", { className: "text-sm text-error", children: error }) : null,
    /* @__PURE__ */ jsx("p", { className: "text-xs text-base-content/40", children: "Billing is powered by Stripe." })
  ] });
}
export {
  BillingPage as component
};
