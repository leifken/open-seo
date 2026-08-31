import { jsxs, jsx } from "react/jsx-runtime";
import { Link, useMatch, Outlet, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { s as setLastProjectId } from "./active-project-DUKzBpe_.js";
import { u as useHostedAuthRouteGuard } from "./useHostedAuthRouteGuard-BWztiKJU.js";
import { useCustomer } from "autumn-js/react";
import { u as useSession, t as getCustomerPlanStatus, J as Route, q as getErrorCode, g as getSignInSearch, i as getCurrentAuthRedirectFromHref } from "./router-BZ-5uDXB.js";
import { bn as autumnSeoDataCreditsToUsd, aa as AUTUMN_SEO_DATA_BALANCE_FEATURE_ID, ab as AUTUMN_SEO_DATA_TOPUP_BALANCE_FEATURE_ID, aI as SUBSCRIBE_ROUTE, bo as BILLING_ROUTE, bp as LOW_CREDITS_THRESHOLD_USD } from "../entry.js";
import { u as useOnboardingRedirect, A as AuthenticatedAppLayout } from "./useOnboardingRedirect-JTwKP2jR.js";
import { b as getProjectAccess } from "./projects-D9ZqZqTc.js";
import "lucide-react";
import "zod";
import "./middleware-CvzXieP6.js";
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
import "./startGoogleLink-CNjAawsm.js";
import "./CreateProjectModal-DAKgOvnC.js";
import "./Modal-81iy_nBW.js";
import "./ProjectMarketFields-CTL7QZ2E.js";
import "./LocationSelect-DeLtP58P.js";
import "./samQueries-DoyXZlCQ.js";
import "./ThemePreferenceMenuItems-BM32tjA5.js";
function FreePlanBanner() {
  const { data: session } = useSession();
  const customerQuery = useCustomer({
    queryOptions: {
      enabled: Boolean(session?.user?.id)
    }
  });
  if (customerQuery.isLoading || !customerQuery.data) {
    return null;
  }
  const planStatus = getCustomerPlanStatus(customerQuery.data);
  const isFreePlan = planStatus === "free";
  const monthlyRemaining = autumnSeoDataCreditsToUsd(
    customerQuery.data.balances?.[AUTUMN_SEO_DATA_BALANCE_FEATURE_ID]?.remaining ?? 0
  );
  const topUpRemaining = autumnSeoDataCreditsToUsd(
    customerQuery.data.balances?.[AUTUMN_SEO_DATA_TOPUP_BALANCE_FEATURE_ID]?.remaining ?? 0
  );
  const totalRemaining = monthlyRemaining + topUpRemaining;
  const isOutOfCredits = totalRemaining <= 0;
  const isLowCredits = !isOutOfCredits && totalRemaining < LOW_CREDITS_THRESHOLD_USD;
  const creditsActionLink = isFreePlan ? /* @__PURE__ */ jsx(
    Link,
    {
      to: SUBSCRIBE_ROUTE,
      search: { upgrade: true },
      className: "link link-primary font-medium",
      children: "Upgrade your plan"
    }
  ) : /* @__PURE__ */ jsx(Link, { to: BILLING_ROUTE, className: "link link-primary font-medium", children: "Buy more credits" });
  if (isOutOfCredits) {
    return /* @__PURE__ */ jsxs(BannerShell, { variant: "error", children: [
      "You’ve used all your credits. ",
      creditsActionLink,
      " to continue using OpenSEO."
    ] });
  }
  if (isLowCredits) {
    return /* @__PURE__ */ jsxs(BannerShell, { variant: "warning", children: [
      "You’re running low on credits. ",
      creditsActionLink,
      " to keep using OpenSEO."
    ] });
  }
  if (isFreePlan) {
    return /* @__PURE__ */ jsxs(BannerShell, { variant: "info", children: [
      "We hope you’re enjoying OpenSEO!",
      " ",
      /* @__PURE__ */ jsx(
        Link,
        {
          to: SUBSCRIBE_ROUTE,
          search: { upgrade: true },
          className: "link link-primary font-medium",
          children: "Upgrade anytime"
        }
      ),
      " ",
      "or",
      " ",
      /* @__PURE__ */ jsx(Link, { to: "/support", className: "link link-primary font-medium", children: "reach out with questions" }),
      "."
    ] });
  }
  return null;
}
function BannerShell({
  variant,
  children
}) {
  const alertClass = variant === "error" ? "alert-error" : variant === "warning" ? "alert-warning" : "alert-info";
  return /* @__PURE__ */ jsx("div", { className: "shrink-0 px-4 py-2.5 md:px-6", children: /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-7xl", children: /* @__PURE__ */ jsx("div", { className: `alert text-sm ${alertClass}`, children: /* @__PURE__ */ jsx("span", { children }) }) }) });
}
function useProjectAccessRedirect(projectId) {
  const navigate = useNavigate();
  const access = useQuery({
    queryKey: ["projectAccess", projectId],
    queryFn: () => getProjectAccess({
      data: {
        projectId
      }
    }),
    // A failed check redirects away — retrying would just delay it.
    retry: false,
    // One check per project per tab; a revoked project still dead-ends at
    // every data call, so there's nothing to re-validate here.
    staleTime: Infinity
  });
  const error = access.error;
  useEffect(() => {
    if (!error) return;
    if (getErrorCode(error) === "UNAUTHENTICATED") {
      void navigate({
        to: "/sign-in",
        search: getSignInSearch(getCurrentAuthRedirectFromHref(window.location.href)),
        replace: true
      });
      return;
    }
    void navigate({
      to: "/",
      replace: true
    });
  }, [error, navigate]);
}
function ProjectLayout() {
  const {
    projectId
  } = Route.useParams();
  const authGate = useHostedAuthRouteGuard();
  useOnboardingRedirect();
  useProjectAccessRedirect(projectId);
  const isSettingsPage = useMatch({
    from: "/_project/p/$projectId/settings",
    shouldThrow: false,
    select: () => true
  }) ?? false;
  useEffect(() => {
    if (isSettingsPage) return;
    setLastProjectId(projectId);
  }, [projectId, isSettingsPage]);
  if (!authGate.canRenderAuthenticatedContent) {
    return null;
  }
  return /* @__PURE__ */ jsx(AuthenticatedAppLayout, { projectId, banner: authGate.isHostedMode ? /* @__PURE__ */ jsx(FreePlanBanner, {}) : void 0, children: /* @__PURE__ */ jsx(Outlet, {}) });
}
export {
  ProjectLayout as component
};
