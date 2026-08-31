import { jsxs, jsx } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import { useCustomer } from "autumn-js/react";
import { useState, useEffect } from "react";
import { ArrowRight, User, Settings } from "lucide-react";
import { T as ThemePreferenceMenuItems } from "./ThemePreferenceMenuItems-DiqeZ0dq.js";
import { r as Route, u as useSession, s as getCustomerPlanStatus, c as captureClientEvent, o as getStandardErrorMessage, t as signOutAndRedirect } from "./router-CC5LdN6j.js";
import { aC as isHostedClientAuthMode, aK as AUTUMN_MANAGED_ACCESS_FEATURE_ID, aL as AUTUMN_PAID_PLAN_ID } from "../entry.js";
import { g as getSubscribeRouteState } from "./route-state-BRTeyZpo.js";
import "zod";
import "@tanstack/react-query";
import "./middleware-CwR3-L1M.js";
import "@tanstack/query-core";
import "./selfHostedOAuth-BpCugic0.js";
import "drizzle-orm";
import "jose";
import "./ai-search-B6IOR0fs.js";
import "./audit-D01_HjiI.js";
import "react-dom";
import "@tanstack/react-form";
import "sonner";
import "@better-auth/api-key/client";
import "papaparse";
import "@tanstack/react-table";
import "remeda";
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
const SUPPORT_EMAIL = "ben@openseo.so";
const PLAN_FEATURES = ["Keyword research, backlinks, rank tracking, and site audits", "MCP server and agent skills for Claude, Cursor, and ChatGPT", "Google Search Console Integration", "Includes $10.00 of Usage Credits each month"];
const FINALIZING_TIMEOUT_MS = 3e4;
function SubscribePage() {
  const navigate = useNavigate();
  const {
    upgrade: isUpgradeFlow,
    redirect,
    checkout
  } = Route.useSearch();
  const {
    data: session
  } = useSession();
  const [isAttaching, setIsAttaching] = useState(false);
  const [error, setError] = useState(null);
  const [finalizingTimedOut, setFinalizingTimedOut] = useState(false);
  const checkoutCompleted = checkout === "success";
  const hasSession = Boolean(session?.user?.id);
  const customerQuery = useCustomer({
    queryOptions: {
      enabled: hasSession
    }
  });
  const hasManagedAccess = isHostedClientAuthMode() ? customerQuery.check({
    featureId: AUTUMN_MANAGED_ACCESS_FEATURE_ID
  }).allowed : true;
  const planStatus = getCustomerPlanStatus(customerQuery.data);
  const subscribeRouteState = getSubscribeRouteState({
    hasSession,
    isCustomerLoading: customerQuery.isLoading,
    isCustomerError: customerQuery.isError,
    hasManagedAccess,
    planStatus,
    isUpgradeFlow: isUpgradeFlow === true,
    checkoutCompleted,
    finalizingTimedOut
  });
  const isFinalizing = subscribeRouteState === "finalizing";
  const {
    refetch: refetchCustomer
  } = customerQuery;
  useEffect(() => {
    if (!isFinalizing) return;
    const interval = setInterval(() => {
      void refetchCustomer();
    }, 2e3);
    return () => clearInterval(interval);
  }, [refetchCustomer, isFinalizing]);
  useEffect(() => {
    if (!checkoutCompleted || finalizingTimedOut) return;
    const timeout = setTimeout(() => setFinalizingTimedOut(true), FINALIZING_TIMEOUT_MS);
    return () => clearTimeout(timeout);
  }, [checkoutCompleted, finalizingTimedOut]);
  useEffect(() => {
    if (subscribeRouteState === "redirectToApp") {
      if (checkoutCompleted) {
        captureClientEvent("billing:checkout_success");
      }
      void navigate({
        href: redirect ?? "/",
        replace: true
      });
    }
  }, [checkoutCompleted, navigate, redirect, subscribeRouteState]);
  useEffect(() => {
    if (subscribeRouteState === "showPaywall" && !isUpgradeFlow) {
      captureClientEvent("billing:paywall_viewed");
    }
  }, [isUpgradeFlow, subscribeRouteState]);
  if (subscribeRouteState === "loading" || subscribeRouteState === "redirectToApp") {
    return null;
  }
  if (subscribeRouteState === "finalizing") {
    return /* @__PURE__ */ jsxs("div", { className: "w-full max-w-xs space-y-4 text-center", children: [
      /* @__PURE__ */ jsx("img", { src: "/transparent-logo.png", alt: "OpenSEO", className: "mx-auto size-10 rounded-lg" }),
      /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold", children: "Finalizing your subscription…" }),
      /* @__PURE__ */ jsx("span", { className: "loading loading-spinner loading-md" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-base-content/60", children: "This usually takes a few seconds." }),
      /* @__PURE__ */ jsxs("p", { className: "text-xs text-base-content/50", children: [
        "Taking longer?",
        " ",
        /* @__PURE__ */ jsxs("a", { className: "link", href: `mailto:${SUPPORT_EMAIL}`, children: [
          "Email ",
          SUPPORT_EMAIL
        ] }),
        "."
      ] })
    ] });
  }
  if (subscribeRouteState === "error") {
    return /* @__PURE__ */ jsxs("div", { className: "w-full max-w-xs space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center space-y-3", children: [
        /* @__PURE__ */ jsx("img", { src: "/transparent-logo.png", alt: "OpenSEO", className: "mx-auto size-10 rounded-lg" }),
        /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold", children: "Billing unavailable" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-center text-base-content/70", children: getStandardErrorMessage(customerQuery.error, "We couldn't verify your billing status right now. Please try again.") }),
      /* @__PURE__ */ jsx("button", { type: "button", className: "btn btn-soft w-full", onClick: () => {
        void customerQuery.refetch();
      }, children: "Try again" })
    ] });
  }
  async function handleSubscribe() {
    setError(null);
    setIsAttaching(true);
    try {
      captureClientEvent("billing:checkout_start");
      const successUrl = new URL(window.location.href);
      successUrl.searchParams.set("checkout", "success");
      await customerQuery.attach({
        planId: AUTUMN_PAID_PLAN_ID,
        redirectMode: "always",
        successUrl: successUrl.toString()
      });
    } catch (err) {
      setError(getStandardErrorMessage(err, "We couldn't start the checkout. Please try again."));
      setIsAttaching(false);
    }
  }
  const firstName = session?.user?.name?.split(" ")[0] || "";
  return /* @__PURE__ */ jsxs("div", { className: "w-full max-w-sm space-y-6", children: [
    /* @__PURE__ */ jsx(SubscribePageAccountMenu, { email: session?.user?.email }),
    /* @__PURE__ */ jsxs("div", { className: "text-center space-y-3", children: [
      /* @__PURE__ */ jsx("img", { src: "/transparent-logo.png", alt: "OpenSEO", className: "mx-auto size-10 rounded-lg" }),
      /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold", children: isUpgradeFlow ? "Upgrade your plan" : firstName ? `Welcome to OpenSEO, ${firstName}!` : "Welcome to OpenSEO!" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-base-content/60", children: "SEO on your terms. All your SEO tools in one place at a fair price." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-base-300 p-5 space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between gap-4", children: [
        /* @__PURE__ */ jsx("span", { className: "font-semibold", children: "Base Plan" }),
        /* @__PURE__ */ jsx("span", { className: "text-lg font-semibold tabular-nums", children: "$10/month" })
      ] }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-2", children: [
        PLAN_FEATURES.map((item) => /* @__PURE__ */ jsxs("li", { className: "flex gap-2.5 text-sm text-base-content/70", children: [
          /* @__PURE__ */ jsx("span", { className: "text-base-content/40 mt-[2px] shrink-0", children: "—" }),
          item
        ] }, item)),
        /* @__PURE__ */ jsx("li", { className: "-mt-1 pl-6 text-xs", children: /* @__PURE__ */ jsxs("a", { className: "text-base-content/60 underline decoration-base-content/40 decoration-dotted underline-offset-4 transition-colors hover:text-base-content", href: "https://openseo.so/pricing", target: "_blank", rel: "noreferrer", onClick: () => captureClientEvent("billing:pricing_estimator_click"), children: [
          "How far do usage credits go?",
          " ",
          /* @__PURE__ */ jsx("span", { "aria-hidden": "true", children: "↗" })
        ] }) })
      ] }),
      error ? /* @__PURE__ */ jsx("p", { className: "text-sm text-error", children: error }) : null,
      /* @__PURE__ */ jsx("button", { className: "btn btn-soft w-full", disabled: isAttaching, onClick: () => void handleSubscribe(), children: isAttaching ? "Redirecting..." : "Subscribe" }),
      /* @__PURE__ */ jsxs("p", { className: "text-center text-xs text-base-content/50", children: [
        /* @__PURE__ */ jsx("span", { className: "tooltip before:max-w-60 before:whitespace-normal", "data-tip": `Not for you yet? Email ${SUPPORT_EMAIL} within 30 days of your charge and we'll refund your subscription.`, children: /* @__PURE__ */ jsx("span", { className: "cursor-help underline decoration-dotted", children: "30-day money-back guarantee" }) }),
        ". Cancel anytime. Powered by Stripe."
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "text-center space-y-2", children: [
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-base-content/60", children: [
        "Questions? Email ",
        SUPPORT_EMAIL,
        "."
      ] }),
      isUpgradeFlow ? /* @__PURE__ */ jsxs("button", { type: "button", className: "inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-base-content/70 hover:text-base-content transition-colors", onClick: () => void navigate({
        to: "/",
        replace: true
      }), children: [
        /* @__PURE__ */ jsx(ArrowRight, { className: "size-3.5 rotate-180" }),
        "Back to app"
      ] }) : null
    ] })
  ] });
}
function SubscribePageAccountMenu({
  email
}) {
  if (!email) return null;
  const handleSignOut = () => signOutAndRedirect();
  return /* @__PURE__ */ jsx("div", { className: "fixed top-4 right-4", children: /* @__PURE__ */ jsxs("div", { className: "dropdown dropdown-end", children: [
    /* @__PURE__ */ jsx("button", { type: "button", tabIndex: 0, className: "btn btn-ghost btn-circle", "aria-label": "Open account menu", children: /* @__PURE__ */ jsx(User, { className: "h-5 w-5" }) }),
    /* @__PURE__ */ jsxs("ul", { tabIndex: 0, className: "dropdown-content z-20 menu mt-3 min-w-56 rounded-box border border-base-300 bg-base-100 p-2 shadow-lg", children: [
      /* @__PURE__ */ jsx("li", { className: "menu-title max-w-full", children: /* @__PURE__ */ jsx("span", { className: "truncate text-base-content", "data-ph-mask": true, children: email }) }),
      /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(Link, { to: "/settings", className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Settings, { className: "h-4 w-4" }),
        "Settings"
      ] }) }),
      /* @__PURE__ */ jsx(ThemePreferenceMenuItems, {}),
      /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("button", { type: "button", className: "text-error", onClick: handleSignOut, children: "Sign out" }) })
    ] })
  ] }) });
}
export {
  SubscribePage as component
};
