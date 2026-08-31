import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useRouter, useMatch, rootRouteId, Link, createRootRoute, HeadContent, ClientOnly, Scripts, Outlet, createFileRoute, lazyRouteComponent, notFound, redirect, stripSearchParams, useNavigate, createRouter } from "@tanstack/react-router";
import * as React from "react";
import { useEffect, useState, useRef, useCallback, useSyncExternalStore, useMemo, useId } from "react";
import { cx as isErrorCode, cy as FREE_MAX_AUDIT_PAGES, az as isHostedClientAuthMode, br as shouldCaptureAppErrorCode, b0 as isHostedAuthMode, a4 as env, am as TSS_SERVER_FUNCTION, cz as getServerFnById, h as createServerFn, cA as resolveHostedContext, cB as hasHostedAuthConfig, b4 as getAuth, cC as keywordsSearchSchema, cD as domainSearchSchema, cm as DEFAULT_DOMAIN_KEYWORDS_PAGE_SIZE, cE as backlinksSearchSchema, ah as DEFAULT_AUDIT_PAGES, af as MIN_AUDIT_PAGES, ag as PAID_MAX_AUDIT_PAGES, aG as SUBSCRIBE_ROUTE, cF as AUTUMN_PAID_PLAN_FEATURE_ID, cG as isSafeUrlScheme, cH as getBaseURL, cI as createFetch, cJ as defu, cK as parseJSON, cL as toKebabCase, cM as capitalizeFirstLetter, cN as PACKAGE_VERSION, cO as GENERIC_OAUTH_ERROR_CODES, cP as ORGANIZATION_ERROR_CODES, cQ as hasPermissionFn, cR as defaultRoles, cS as ownerAc, cT as memberAc, cU as adminAc, cV as getIssueDescriptor, cW as ISSUE_SEVERITY_ORDER } from "../entry.js";
import { ShieldAlert, MoreHorizontal, Loader2, CheckCircle, AlertCircle, ScanSearch, Trash2, ChevronRight, ChevronUp, ChevronDown, ArrowUp, ArrowDown, SlidersHorizontal, RotateCcw, ExternalLink, Download, X } from "lucide-react";
import { z } from "zod";
import { queryOptions, useQuery, useMutation } from "@tanstack/react-query";
import { a as requireAuthenticatedContext, r as requireProjectContext } from "./middleware-Doy-pxkJ.js";
import { QueryClient } from "@tanstack/query-core";
import { h as handleSelfHostedGoogleOAuthCallbackRequest, G as GSC_INTEGRATION, a as GA4_INTEGRATION } from "./selfHostedOAuth-C3UAQwsK.js";
import { g as promptExplorerSearchSchema, h as brandLookupSearchSchema } from "./ai-search-BV1mIqc0.js";
import { g as getAuditStatusSchema, a as getAuditResultsSchema, c as getCrawlProgressSchema, b as getAuditHistorySchema, s as startAuditSchema, d as deleteAuditSchema, e as auditSearchSchema } from "./audit-SZdMhI6q.js";
import { useCustomer } from "autumn-js/react";
import { createPortal } from "react-dom";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { apiKeyClient } from "@better-auth/api-key/client";
import Papa from "papaparse";
import { useReactTable, getPaginationRowModel, getExpandedRowModel, getSortedRowModel, getCoreRowModel, flexRender, createColumnHelper } from "@tanstack/react-table";
import { sortBy } from "remeda";
import { AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Area } from "recharts";
import { b as lighthouseIssuesSearchSchema } from "./lighthouse-CiThJE4g.js";
const STANDARD_MESSAGES = {
  UNAUTHENTICATED: "Please sign in and try again.",
  AUTH_CONFIG_MISSING: "OpenSEO auth is not configured. Follow the README setup steps for Cloudflare Access.",
  PAYMENT_REQUIRED: "An active hosted subscription is required before you can use OpenSEO.",
  INSUFFICIENT_CREDITS: "You've run out of credits. Add more credits or upgrade your plan to continue.",
  FORBIDDEN: "You do not have access to this resource.",
  NOT_FOUND: "The requested resource was not found.",
  AUDIT_CAPACITY_REACHED: "You've reached audit capacity for your account. Delete old audits from your projects to start a new one.",
  AUDIT_PAGE_LIMIT_EXCEEDED: `Free plan audits are limited to ${FREE_MAX_AUDIT_PAGES} pages. Upgrade to run larger audits.`,
  AUDIT_ALREADY_RUNNING: "You already have an audit running. Wait for it to finish or delete it before starting another.",
  VALIDATION_ERROR: "Please check your input and try again.",
  CRAWL_TARGET_BLOCKED: "This crawl target is blocked by security policy.",
  BACKLINKS_BILLING_ISSUE: "The connected DataForSEO account has a billing or balance issue.",
  AI_SEARCH_BILLING_ISSUE: "The connected DataForSEO account has a billing or balance issue.",
  DATAFORSEO_AUTH_FAILED: "DataForSEO rejected the API key. Check that DATAFORSEO_API_KEY is the base64 of your DataForSEO login:password.",
  RATE_LIMITED: "Too many requests. Please wait and try again.",
  UPSTREAM_UNAVAILABLE: "The data provider is temporarily unavailable. Please retry in a moment.",
  CONFLICT: "This request conflicts with existing data.",
  INTERNAL_ERROR: "An unexpected error occurred. Please check server logs and try again."
};
function splitCodedMessage(message) {
  const separatorIndex = message.indexOf(": ");
  if (separatorIndex === -1) return null;
  const code = message.slice(0, separatorIndex);
  if (!isErrorCode(code)) return null;
  return { code, detail: message.slice(separatorIndex + 2) };
}
function getStandardErrorMessage(error, fallback = STANDARD_MESSAGES.INTERNAL_ERROR) {
  if (!(error instanceof Error)) return fallback;
  if (isErrorCode(error.message)) return STANDARD_MESSAGES[error.message];
  const coded = splitCodedMessage(error.message);
  if (coded) return coded.detail;
  if (error.message) return error.message;
  return fallback;
}
function getErrorCode(error) {
  if (!(error instanceof Error)) return null;
  if (isErrorCode(error.message)) return error.message;
  return splitCodedMessage(error.message)?.code ?? null;
}
const CLOUDFLARE_SETUP_GUIDE_URL = "https://github.com/every-app/open-seo/blob/main/docs/SELF_HOSTING_CLOUDFLARE.md#2-configure-authentication-and-secrets";
function AuthConfigErrorCard({
  message,
  onRetry
}) {
  const isHostedMode = isHostedClientAuthMode();
  return /* @__PURE__ */ jsx("div", { className: "card w-full max-w-2xl bg-base-100 border border-base-300 shadow-xl", children: /* @__PURE__ */ jsxs("div", { className: "card-body gap-4", children: [
    /* @__PURE__ */ jsxs("h2", { className: "card-title gap-2", children: [
      /* @__PURE__ */ jsx(ShieldAlert, { className: "size-5 text-error" }),
      "Authentication setup required"
    ] }),
    /* @__PURE__ */ jsx("div", { className: "alert alert-error", children: /* @__PURE__ */ jsx("span", { children: message }) }),
    isHostedMode ? /* @__PURE__ */ jsxs("p", { className: "text-sm text-base-content/70", children: [
      "Hosted mode requires",
      " ",
      /* @__PURE__ */ jsx("code", { className: "mx-1", children: "BETTER_AUTH_SECRET" }),
      "(32+ characters), ",
      /* @__PURE__ */ jsx("code", { className: "mx-1", children: "BETTER_AUTH_URL" }),
      ", and Google OAuth credentials on the deployment."
    ] }) : /* @__PURE__ */ jsxs("p", { className: "text-sm text-base-content/70", children: [
      "Cloudflare Access mode requires",
      /* @__PURE__ */ jsx("code", { className: "mx-1", children: "TEAM_DOMAIN" }),
      " (a full https URL) and",
      /* @__PURE__ */ jsx("code", { className: "mx-1", children: "POLICY_AUD" }),
      " set on the deployment, with an Access application protecting this hostname."
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "card-actions justify-end", children: [
      onRetry ? /* @__PURE__ */ jsx("button", { className: "btn btn-ghost btn-sm", onClick: onRetry, children: "Try Again" }) : null,
      /* @__PURE__ */ jsx(
        "a",
        {
          className: "btn btn-primary btn-sm",
          href: CLOUDFLARE_SETUP_GUIDE_URL,
          target: "_blank",
          rel: "noreferrer",
          children: "Open Setup Guide"
        }
      )
    ] })
  ] }) });
}
let browserPostHogClientPromise = null;
function getBrowserPostHogClient() {
  if (typeof window === "undefined" || !isHostedClientAuthMode()) {
    return Promise.resolve(null);
  }
  if (browserPostHogClientPromise) {
    return browserPostHogClientPromise;
  }
  browserPostHogClientPromise = import("posthog-js").then((module) => {
    module.default;
    {
      return null;
    }
  }).catch((error) => {
    console.error("posthog client init failed", error);
    return null;
  });
  return browserPostHogClientPromise;
}
function withPostHogClient(fn) {
  void getBrowserPostHogClient().then((client) => {
    if (!client) return;
    try {
      fn(client);
    } catch (e) {
      console.error("posthog operation failed", e);
    }
  });
}
function withExistingPostHogClient(fn) {
  if (!browserPostHogClientPromise) return;
  void browserPostHogClientPromise.then((client) => {
    if (!client) return;
    try {
      fn(client);
    } catch (e) {
      console.error("posthog operation failed", e);
    }
  });
}
function captureClientEvent(event, properties) {
  withPostHogClient((client) => client.capture(event, properties));
}
function resetAnalyticsUser() {
  withExistingPostHogClient((client) => {
    client.stopSessionRecording();
    client.reset();
  });
}
function captureClientError(error, properties = {}) {
  withPostHogClient(
    (client) => client.captureException(error, {
      source: "client",
      ...properties
    })
  );
}
const OAUTH_AUTHORIZE_PATH = "/api/auth/oauth2/authorize";
const OAUTH_SIGNED_QUERY_END = "sig";
const OAUTH_AUTHORIZE_MARKERS = ["response_type", "client_id", "redirect_uri"];
function normalizeAuthRedirect(value) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return "/";
  }
  return value;
}
function getOAuthSignedQuery(search) {
  if (!search) return null;
  const params = new URLSearchParams(search);
  if (!params.has(OAUTH_SIGNED_QUERY_END) || !OAUTH_AUTHORIZE_MARKERS.every((marker) => params.has(marker))) {
    return null;
  }
  const signedParams = new URLSearchParams();
  for (const [key, value] of params.entries()) {
    signedParams.append(key, value);
    if (key === OAUTH_SIGNED_QUERY_END) break;
  }
  return signedParams.toString();
}
function getOAuthAuthorizeRedirectFromSearch(search) {
  const signedQuery = getOAuthSignedQuery(search);
  return signedQuery ? `${OAUTH_AUTHORIZE_PATH}?${signedQuery}` : null;
}
function getAuthRedirectFromSearch(search, redirect2) {
  return getOAuthAuthorizeRedirectFromSearch(search) ?? normalizeAuthRedirect(redirect2);
}
function getCurrentAuthRedirect(redirect2, location = typeof window !== "undefined" ? window.location : null) {
  return getAuthRedirectFromSearch(location?.search, redirect2);
}
function getCurrentAuthRedirectFromHref(href) {
  const url = new URL(href, "https://openseo.local");
  return normalizeAuthRedirect(`${url.pathname}${url.search}${url.hash}`);
}
function getSignInSearch(redirectTo) {
  return redirectTo === "/" ? {} : { redirect: redirectTo };
}
function getVerifyEmailSearch(email, redirectTo) {
  const search = {};
  if (email) search.email = email;
  if (redirectTo !== "/") search.redirect = redirectTo;
  return search;
}
function getSignInHref(redirectTo) {
  const search = getSignInSearch(redirectTo);
  if (!("redirect" in search)) {
    return "/sign-in";
  }
  return `/sign-in?redirect=${encodeURIComponent(search.redirect ?? "/")}`;
}
function getSignInHrefForLocation(location) {
  return getSignInHref(
    normalizeAuthRedirect(
      `${location.pathname}${location.search}${location.hash ?? ""}`
    )
  );
}
function UnauthenticatedErrorCard({
  message,
  onRetry
}) {
  const isHostedMode = isHostedClientAuthMode();
  const signInHref = typeof window === "undefined" ? getSignInHref("/") : getSignInHrefForLocation(window.location);
  useEffect(() => {
    if (typeof window === "undefined" || !isHostedMode) {
      return;
    }
    window.location.replace(signInHref);
  }, [isHostedMode, signInHref]);
  if (isHostedMode) {
    return null;
  }
  return /* @__PURE__ */ jsx("div", { className: "card w-full max-w-md bg-base-100 border border-base-300 shadow-xl", children: /* @__PURE__ */ jsxs("div", { className: "card-body gap-4", children: [
    /* @__PURE__ */ jsx("h2", { className: "card-title", children: "Authentication required" }),
    /* @__PURE__ */ jsx("p", { className: "text-sm text-base-content/70", children: message }),
    /* @__PURE__ */ jsx("p", { className: "text-sm text-base-content/70", children: "This deployment uses external authentication. Refresh your access session, then try again." }),
    onRetry ? /* @__PURE__ */ jsx("div", { className: "card-actions justify-end", children: /* @__PURE__ */ jsx("button", { className: "btn btn-primary btn-sm", onClick: onRetry, children: "Try Again" }) }) : null
  ] }) });
}
function DefaultCatchBoundary({ error }) {
  const router2 = useRouter();
  const isRoot = useMatch({
    strict: false,
    select: (state) => state.id === rootRouteId
  });
  const pathname = router2.state.location.pathname;
  const message = getStandardErrorMessage(
    error,
    "Something went wrong. Please try again."
  );
  const errorCode = getErrorCode(error);
  React.useEffect(() => {
    if (!shouldCaptureAppErrorCode(errorCode)) {
      return;
    }
    captureClientError(error, {
      errorCode,
      path: pathname
    });
  }, [error, errorCode, pathname]);
  const showAuthConfigHelp = errorCode === "AUTH_CONFIG_MISSING";
  const showSignInHelp = errorCode === "UNAUTHENTICATED";
  if (showAuthConfigHelp) {
    return /* @__PURE__ */ jsx("div", { className: "min-w-0 flex-1 p-4 flex items-center justify-center", children: /* @__PURE__ */ jsx(
      AuthConfigErrorCard,
      {
        message,
        onRetry: () => {
          void router2.invalidate();
        }
      }
    ) });
  }
  if (showSignInHelp) {
    return /* @__PURE__ */ jsx("div", { className: "min-w-0 flex-1 p-4 flex items-center justify-center", children: /* @__PURE__ */ jsx(
      UnauthenticatedErrorCard,
      {
        message,
        onRetry: () => {
          void router2.invalidate();
        }
      }
    ) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1 p-4 flex flex-col items-center justify-center gap-6", children: [
    /* @__PURE__ */ jsx("p", { className: "text-center text-error", children: message }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-2 items-center flex-wrap", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            void router2.invalidate();
          },
          className: "btn btn-primary btn-sm",
          children: "Try Again"
        }
      ),
      isRoot ? /* @__PURE__ */ jsx(Link, { to: "/", className: "btn btn-sm", children: "Home" }) : /* @__PURE__ */ jsx(
        Link,
        {
          to: "/",
          className: "btn btn-sm",
          onClick: (e) => {
            e.preventDefault();
            window.history.back();
          },
          children: "Go Back"
        }
      )
    ] })
  ] });
}
const LIGHT_THEME_NAME = "openseo";
const DARK_THEME_NAME = "openseo-dark";
const THEME_STORAGE_KEY = "theme-preference";
const THEME_CHANGE_EVENT = "theme-preference-change";
function readThemePreference() {
  if (typeof window === "undefined") {
    return "system";
  }
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark") {
      return stored;
    }
    return "system";
  } catch {
    return "system";
  }
}
function writeThemePreference(themePreference) {
  try {
    if (themePreference === "system") {
      window.localStorage.removeItem(THEME_STORAGE_KEY);
    } else {
      window.localStorage.setItem(THEME_STORAGE_KEY, themePreference);
    }
  } catch {
  }
}
function resolveThemeName(themePreference) {
  if (themePreference === "light") return LIGHT_THEME_NAME;
  if (themePreference === "dark") return DARK_THEME_NAME;
  if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return DARK_THEME_NAME;
  }
  return LIGHT_THEME_NAME;
}
function applyThemePreference(themePreference) {
  if (typeof document === "undefined") {
    return;
  }
  document.documentElement.setAttribute(
    "data-theme",
    resolveThemeName(themePreference)
  );
}
function subscribeToThemePreference(onStoreChange) {
  if (typeof window === "undefined") {
    return () => {
    };
  }
  const handleThemeChange = () => {
    onStoreChange();
  };
  const handleStorage = (event) => {
    if (event.key && event.key !== THEME_STORAGE_KEY) {
      return;
    }
    onStoreChange();
  };
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const handleMediaChange = () => {
    applyThemePreference(readThemePreference());
    onStoreChange();
  };
  window.addEventListener(THEME_CHANGE_EVENT, handleThemeChange);
  window.addEventListener("storage", handleStorage);
  mediaQuery.addEventListener("change", handleMediaChange);
  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, handleThemeChange);
    window.removeEventListener("storage", handleStorage);
    mediaQuery.removeEventListener("change", handleMediaChange);
  };
}
function useThemePreference() {
  const themePreference = React.useSyncExternalStore(
    subscribeToThemePreference,
    readThemePreference,
    () => "system"
  );
  React.useEffect(() => {
    applyThemePreference(themePreference);
  }, [themePreference]);
  const setThemePreference = React.useCallback(
    (nextThemePreference) => {
      writeThemePreference(nextThemePreference);
      applyThemePreference(nextThemePreference);
      window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
    },
    []
  );
  return { themePreference, setThemePreference };
}
const themePreferenceInitScript = `(() => {
  try {
    var p = window.localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
    var t;
    if (p === "light") t = ${JSON.stringify(LIGHT_THEME_NAME)};
    else if (p === "dark") t = ${JSON.stringify(DARK_THEME_NAME)};
    else t = window.matchMedia("(prefers-color-scheme: dark)").matches ? ${JSON.stringify(DARK_THEME_NAME)} : ${JSON.stringify(LIGHT_THEME_NAME)};
    document.documentElement.setAttribute("data-theme", t);
  } catch {
    document.documentElement.setAttribute("data-theme", ${JSON.stringify(LIGHT_THEME_NAME)});
  }
})();`;
function NotFound({ children }) {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-2 p-4", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-2xl", children: "404" }),
    /* @__PURE__ */ jsx("div", { className: "text-base-content/70", children: children || /* @__PURE__ */ jsx("p", { children: "The page you are looking for does not exist." }) })
  ] });
}
const appCss = "/assets/app-B_a7vJCR.css";
const Route$L = createRootRoute({
  head: () => ({
    meta: [
      {
        title: "OpenSEO"
      },
      {
        charSet: "utf-8"
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, viewport-fit=cover"
      },
      // Disable browser auto-translate (Google Translate) app-wide. It rewrites
      // text nodes into <font> wrappers, which React then can't remove/insert,
      // crashing render with NotFoundError ("removeChild"/"insertBefore"). The
      // product UI is data-dense (keywords, domains, metrics) and not meaningful
      // to machine-translate; the marketing site is a separate app and unaffected.
      {
        name: "google",
        content: "notranslate"
      },
      {
        name: "apple-mobile-web-app-capable",
        content: "yes"
      },
      {
        name: "apple-mobile-web-app-status-bar-style",
        content: "black-translucent"
      }
    ],
    links: [{
      rel: "stylesheet",
      href: appCss
    }, {
      rel: "apple-touch-icon",
      sizes: "180x180",
      href: "/apple-touch-icon.png"
    }, {
      rel: "icon",
      type: "image/png",
      sizes: "32x32",
      href: "/favicon-32x32.png"
    }, {
      rel: "icon",
      type: "image/png",
      sizes: "16x16",
      href: "/favicon-16x16.png"
    }, {
      rel: "icon",
      type: "image/x-icon",
      href: "/favicon.ico"
    }, {
      rel: "manifest",
      href: "/site.webmanifest"
    }],
    scripts: []
  }),
  component: AppLayout,
  errorComponent: DefaultCatchBoundary,
  notFoundComponent: () => /* @__PURE__ */ jsx(NotFound, {}),
  shellComponent: RootDocument
});
function AppLayout() {
  return /* @__PURE__ */ jsx(Outlet, {});
}
function RootDocument({
  children
}) {
  return /* @__PURE__ */ jsxs("html", { suppressHydrationWarning: true, translate: "no", children: [
    /* @__PURE__ */ jsxs("head", { children: [
      /* @__PURE__ */ jsx("script", { dangerouslySetInnerHTML: {
        __html: themePreferenceInitScript
      } }),
      /* @__PURE__ */ jsx(HeadContent, {})
    ] }),
    /* @__PURE__ */ jsxs("body", { children: [
      /* @__PURE__ */ jsx(ClientOnly, {}),
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
const authRedirectSearchSchema = z.object({
  redirect: z.string().optional()
});
function useAuthPageState(redirect2) {
  const redirectTo = getCurrentAuthRedirect(redirect2);
  const oauthQuery = typeof window !== "undefined" ? getOAuthSignedQuery(window.location.search) : null;
  const isHostedMode = isHostedClientAuthMode();
  return {
    redirectTo,
    oauthQuery,
    isHostedMode
  };
}
function AuthMethodChooser({
  googleLabel,
  emailLabel = "Continue with email",
  isBusy,
  disabled,
  onContinueWithGoogle,
  onContinueWithEmail
}) {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        className: "btn w-full border border-black/10 bg-white text-neutral-900 hover:border-black/20 hover:bg-neutral-50 disabled:bg-white disabled:text-neutral-500 disabled:opacity-70",
        onClick: onContinueWithGoogle,
        disabled: disabled || isBusy,
        children: [
          /* @__PURE__ */ jsx(GoogleLogo, {}),
          isBusy ? "Opening Google..." : googleLabel
        ]
      }
    ),
    /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        className: "btn w-full",
        onClick: onContinueWithEmail,
        disabled: disabled || isBusy,
        children: emailLabel
      }
    )
  ] });
}
function GoogleLogo() {
  return /* @__PURE__ */ jsxs("svg", { "aria-hidden": "true", viewBox: "0 0 18 18", className: "size-4 shrink-0", children: [
    /* @__PURE__ */ jsx(
      "path",
      {
        fill: "#4285F4",
        d: "M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      }
    ),
    /* @__PURE__ */ jsx(
      "path",
      {
        fill: "#34A853",
        d: "M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.33-1.58-5.04-3.72H.94v2.34A9 9 0 0 0 9 18Z"
      }
    ),
    /* @__PURE__ */ jsx(
      "path",
      {
        fill: "#FBBC05",
        d: "M3.96 10.7A5.4 5.4 0 0 1 3.68 9c0-.59.1-1.16.28-1.7V4.96H.94A9 9 0 0 0 0 9c0 1.45.34 2.82.94 4.04l3.02-2.34Z"
      }
    ),
    /* @__PURE__ */ jsx(
      "path",
      {
        fill: "#EA4335",
        d: "M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A8.64 8.64 0 0 0 9 0 9 9 0 0 0 .94 4.96L3.96 7.3C4.67 5.16 6.66 3.58 9 3.58Z"
      }
    )
  ] });
}
function AuthPageCard({
  title,
  helperText,
  children,
  footer
}) {
  return /* @__PURE__ */ jsxs("div", { className: "w-full max-w-xs space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center space-y-3", children: [
      /* @__PURE__ */ jsx(
        "img",
        {
          src: "/transparent-logo.png",
          alt: "OpenSEO",
          className: "mx-auto size-10 rounded-lg"
        }
      ),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold", children: title }),
        helperText ? /* @__PURE__ */ jsx("p", { className: "text-sm text-base-content/60 mt-1", children: helperText }) : null
      ] })
    ] }),
    children,
    footer ? /* @__PURE__ */ jsx("div", { className: "text-center", children: footer }) : null
  ] });
}
function AuthPageShell({ children }) {
  return (
    // `h-[100dvh]` + `overflow-y-auto` makes this a scroll container, and the
    // auto-margin child centers when it fits but stays fully reachable (top and
    // bottom) when it's taller than the viewport. Plain `justify-center` clips
    // the overflow with no way to scroll to it.
    /* @__PURE__ */ jsx("div", { className: "h-[100dvh] flex flex-col items-center overflow-y-auto p-4 bg-base-200", children: /* @__PURE__ */ jsx("div", { className: "m-auto flex w-full flex-col items-center", children }) })
  );
}
const $$splitComponentImporter$D = () => import("./verify-email-ggbU0zW9.js");
const verifyEmailSearchSchema = authRedirectSearchSchema.extend({
  error: z.string().optional(),
  email: z.string().optional()
});
const Route$K = createFileRoute("/verify-email")({
  validateSearch: verifyEmailSearchSchema,
  component: lazyRouteComponent($$splitComponentImporter$D, "component")
});
const $$splitComponentImporter$C = () => import("./reset-password-BmLo8mxF.js");
const resetPasswordSearchSchema = authRedirectSearchSchema.extend({
  error: z.string().optional(),
  token: z.string().optional()
});
const Route$J = createFileRoute("/reset-password")({
  validateSearch: resetPasswordSearchSchema,
  component: lazyRouteComponent($$splitComponentImporter$C, "component")
});
const $$splitComponentImporter$B = () => import("./forgot-password-BUP-oqBh.js");
const Route$I = createFileRoute("/forgot-password")({
  validateSearch: authRedirectSearchSchema,
  component: lazyRouteComponent($$splitComponentImporter$B, "component")
});
const $$splitComponentImporter$A = () => import("./_authenticated-j_Wz4hNu.js");
const Route$H = createFileRoute("/_authenticated")({
  component: lazyRouteComponent($$splitComponentImporter$A, "component")
});
const $$splitComponentImporter$z = () => import("./_auth-C0Rf8beg.js");
const Route$G = createFileRoute("/_auth")({
  validateSearch: authRedirectSearchSchema,
  component: lazyRouteComponent($$splitComponentImporter$z, "component")
});
const $$splitComponentImporter$y = () => import("./route-CQsDlFHI.js");
const Route$F = createFileRoute("/_project")({
  component: lazyRouteComponent($$splitComponentImporter$y, "component")
});
const $$splitComponentImporter$x = () => import("./route-DMtVZ5j_.js");
const Route$E = createFileRoute("/_app")({
  component: lazyRouteComponent($$splitComponentImporter$x, "component")
});
const $$splitComponentImporter$w = () => import("./index-eGbC9i7-.js");
const Route$D = createFileRoute("/_app/")({
  component: lazyRouteComponent($$splitComponentImporter$w, "component")
});
async function handleHealthRequest() {
  if (isHostedAuthMode(env.AUTH_MODE)) {
    return Response.json({ status: "ok" });
  }
  const { getSelfHostSetupStatus } = await import("../entry.js").then((n) => n.cX);
  const setup = await getSelfHostSetupStatus();
  const hasError = Object.values(setup.checks).some(
    (check) => check.status === "error"
  );
  return Response.json({ status: hasError ? "issues" : "ok", ...setup });
}
const Route$C = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: () => handleHealthRequest()
    }
  }
});
const $$splitComponentImporter$v = () => import("./_authenticated.subscribe-Cszwoh2Z.js");
const Route$B = createFileRoute("/_authenticated/subscribe")({
  validateSearch: (search) => ({
    upgrade: search.upgrade === true || search.upgrade === "true" ? true : void 0,
    redirect: typeof search.redirect === "string" ? normalizeAuthRedirect(search.redirect) : void 0,
    checkout: search.checkout === "success" ? "success" : void 0
  }),
  component: lazyRouteComponent($$splitComponentImporter$v, "component")
});
const $$splitComponentImporter$u = () => import("./_authenticated.oauth-consent-BKU_4YIS.js");
const Route$A = createFileRoute("/_authenticated/oauth-consent")({
  component: lazyRouteComponent($$splitComponentImporter$u, "component")
});
const $$splitComponentImporter$t = () => import("./_auth.sign-up-DkYuMyOI.js");
const Route$z = createFileRoute("/_auth/sign-up")({
  validateSearch: authRedirectSearchSchema,
  component: lazyRouteComponent($$splitComponentImporter$t, "component")
});
const $$splitComponentImporter$s = () => import("./_auth.sign-in-CPpkOtOf.js");
const Route$y = createFileRoute("/_auth/sign-in")({
  validateSearch: authRedirectSearchSchema,
  component: lazyRouteComponent($$splitComponentImporter$s, "component")
});
const $$splitComponentImporter$r = () => import("./support-C_pDGKxD.js");
const Route$x = createFileRoute("/_app/support")({
  component: lazyRouteComponent($$splitComponentImporter$r, "component")
});
const $$splitComponentImporter$q = () => import("./settings-CkzAAib6.js");
const Route$w = createFileRoute("/_app/settings")({
  component: lazyRouteComponent($$splitComponentImporter$q, "component")
});
const $$splitComponentImporter$p = () => import("./projects-D28mrXgG.js");
const Route$v = createFileRoute("/_app/projects")({
  component: lazyRouteComponent($$splitComponentImporter$p, "component")
});
const $$splitComponentImporter$o = () => import("./billing-CLbP4R63.js");
const Route$u = createFileRoute("/_app/billing")({
  beforeLoad: () => {
    if (!isHostedClientAuthMode()) {
      throw notFound();
    }
  },
  component: lazyRouteComponent($$splitComponentImporter$o, "component")
});
const $$splitComponentImporter$n = () => import("./ai-BHZEYUtw.js");
const Route$t = createFileRoute("/_app/ai")({
  component: lazyRouteComponent($$splitComponentImporter$n, "component")
});
const OPENAI_APPS_CHALLENGE_TOKEN = "GEqD0QcIISUHCDhQXqm18K9Hm4Fixm8RMbDxz3nUXsw";
const Route$s = createFileRoute("/.well-known/openai-apps-challenge")({
  server: {
    handlers: {
      GET: async () => {
        return new Response(OPENAI_APPS_CHALLENGE_TOKEN, {
          headers: {
            "content-type": "text/plain; charset=utf-8"
          }
        });
      }
    }
  }
});
var createSsrRpc = (functionId) => {
  const url = "/_serverFn/" + functionId;
  const serverFnMeta = { id: functionId };
  const fn = async (...args) => {
    return (await getServerFnById(functionId))(...args);
  };
  return Object.assign(fn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
const onboardingAnswersSchema = z.object({
  interestedFeatures: z.array(z.string()).optional(),
  workFor: z.string().optional(),
  clientWebsiteCount: z.string().optional(),
  foundVia: z.string().optional(),
  mcpSetupIntent: z.enum(["yes", "no"]).optional(),
  completed: z.boolean().optional()
});
const getOnboardingAnswers = createServerFn({
  method: "GET"
}).middleware(requireAuthenticatedContext).handler(createSsrRpc("f3ccdf1c5f7849adbe55a38000c0c568b1f72b75fea6deea496f965b8c7ab155"));
const saveOnboardingAnswers = createServerFn({
  method: "POST"
}).middleware(requireAuthenticatedContext).validator(onboardingAnswersSchema).handler(createSsrRpc("9059a6b8babf4dd972195adcbd6d5b0a44a9abda3a66071b8b90e201141c10d5"));
const dismissGscNudge = createServerFn({
  method: "POST"
}).middleware(requireAuthenticatedContext).handler(createSsrRpc("5036bfbbb0648430f1305a7b8a9540118bd537d96bd6f393c94d703319ee3282"));
const ONBOARDING_LAST_STEP = 3;
const INTEREST_OPTIONS = [
  "AI workflows with Claude or Codex (MCP)",
  "Keyword research",
  "Competitor research",
  "Backlink analysis",
  "Site audits",
  "Rank tracking",
  "Other"
];
const WORK_FOR_OPTIONS = [
  "My own startup or business",
  "My clients",
  "My employer's website",
  "My own side project",
  "I'm exploring before choosing a project",
  "Other"
];
const CLIENT_WORK_FOR = "My clients";
const CLIENT_WEBSITE_COUNT_OPTIONS = [
  "1–3",
  "4–10",
  "11–25",
  "25+"
];
const SOURCE_OPTIONS = [
  "Product Hunt",
  "Google",
  "Reddit",
  "X / Twitter",
  "GitHub",
  "AI (Claude, ChatGPT, etc)",
  "Friend or colleague",
  "Other"
];
const SOURCE_OPTIONS_HIDDEN_ON_MOBILE = [
  "Reddit",
  "X / Twitter",
  "AI (Claude, ChatGPT, etc)"
];
const onboardingAnswersQueryOptions = () => queryOptions({
  queryKey: ["onboardingAnswers"],
  queryFn: () => getOnboardingAnswers()
});
function restoreSingleChoice(saved, options) {
  if (!saved) return { value: "", other: "" };
  if (options.includes(saved)) return { value: saved, other: "" };
  return { value: "Other", other: saved };
}
function restoreOnboardingAnswers(saved) {
  const known = saved.interestedFeatures.filter(
    (value) => INTEREST_OPTIONS.includes(value)
  );
  const custom = saved.interestedFeatures.filter(
    (value) => !INTEREST_OPTIONS.includes(value)
  );
  const work = restoreSingleChoice(saved.workFor, WORK_FOR_OPTIONS);
  const found = restoreSingleChoice(saved.foundVia, SOURCE_OPTIONS);
  return {
    selectedInterests: custom.length > 0 ? [...known, "Other"] : known,
    interestOther: custom[0] ?? "",
    workFor: work.value,
    workForOther: work.other,
    clientWebsiteCount: work.value === CLIENT_WORK_FOR ? saved.clientWebsiteCount ?? "" : "",
    source: found.value,
    sourceOther: found.other
  };
}
function buildOnboardingPayload(answers, step, extra = {}) {
  const interestedFeatures = answers.selectedInterests.map(
    (value) => value === "Other" && answers.interestOther.trim() ? answers.interestOther.trim() : value
  );
  const workFor = answers.workFor === "Other" && answers.workForOther.trim() ? answers.workForOther.trim() : answers.workFor || void 0;
  const clientWebsiteCount = answers.workFor === CLIENT_WORK_FOR ? answers.clientWebsiteCount : "";
  const foundVia = answers.source === "Other" && answers.sourceOther.trim() ? answers.sourceOther.trim() : answers.source || void 0;
  return {
    ...step >= 0 ? { interestedFeatures } : {},
    ...step >= 1 ? { workFor, clientWebsiteCount } : {},
    ...step >= 2 ? { foundVia } : {},
    ...extra
  };
}
const clampStep = (step) => Math.min(Math.max(0, Math.trunc(step)), ONBOARDING_LAST_STEP);
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1e3 * 60 * 60,
      staleTime: 1e3 * 60 * 5
      // 5 minutes — show cached data instantly, refetch in background after
    }
  }
});
const $$splitComponentImporter$m = () => import("./_authenticated.onboarding.index-DWSy4YiT.js");
const Route$r = createFileRoute("/_authenticated/onboarding/")({
  // The app renders inside ClientOnly, and this guard reads account-scoped data
  // through a module-scoped query client. Keep it out of server requests so one
  // worker isolate cannot reuse another account's cached onboarding state.
  ssr: false,
  // Step lives in the URL so it survives refresh and works with back/forward.
  validateSearch: (search) => {
    const raw = Number(search.step);
    return {
      step: Number.isFinite(raw) ? clampStep(raw) : 0
    };
  },
  // Send users who already finished onboarding home before rendering. Running
  // this in beforeLoad (not a component effect) means it can't race with the
  // navigation we trigger after the final step.
  beforeLoad: async () => {
    const data = await queryClient.ensureQueryData(onboardingAnswersQueryOptions());
    if (data.completedAt) {
      throw redirect({
        to: "/",
        replace: true
      });
    }
  },
  component: lazyRouteComponent($$splitComponentImporter$m, "component")
});
let handlerPromise;
function loadHandler() {
  return handlerPromise ??= import("autumn-js/fetch").then(
    ({ autumnHandler }) => autumnHandler({
      identify: async (request) => {
        const context = await resolveHostedContext(request.headers);
        return {
          customerId: context.organizationId
        };
      }
    })
  );
}
async function handleAutumnRequest(request) {
  if (!isHostedAuthMode(env.AUTH_MODE)) {
    return new Response("Not found", {
      status: 404
    });
  }
  return (await loadHandler())(request);
}
const Route$q = createFileRoute("/api/autumn/$")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return handleAutumnRequest(request);
      },
      POST: async ({ request }) => {
        return handleAutumnRequest(request);
      }
    }
  }
});
async function handleAuthRequest(request) {
  if (!isHostedAuthMode(env.AUTH_MODE)) {
    return new Response("Not found", {
      status: 404
    });
  }
  if (!hasHostedAuthConfig()) {
    return new Response("Missing Better Auth hosted configuration", {
      status: 500
    });
  }
  const auth = getAuth();
  return auth.handler(request);
}
const Route$p = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return handleAuthRequest(request);
      },
      POST: async ({ request }) => {
        return handleAuthRequest(request);
      }
    }
  }
});
const $$splitComponentImporter$l = () => import("./_authenticated.onboarding.chat-DWe0m2Nd.js");
const Route$o = createFileRoute("/_authenticated/onboarding/chat")({
  // The strategy chat is hosted-only (managed LLM + trial credits). Self-hosted
  // has no business here — send it back to the onboarding wizard.
  beforeLoad: () => {
    if (!isHostedClientAuthMode()) {
      throw redirect({
        to: "/onboarding",
        search: {
          step: 3
        },
        replace: true
      });
    }
  },
  component: lazyRouteComponent($$splitComponentImporter$l, "component")
});
const $$splitComponentImporter$k = () => import("./openrouter-api-key-Qhu0VXTZ.js");
const Route$n = createFileRoute("/_app/help/openrouter-api-key")({
  component: lazyRouteComponent($$splitComponentImporter$k, "component")
});
const $$splitComponentImporter$j = () => import("./dataforseo-api-key-DVM_DP16.js");
const Route$m = createFileRoute("/_app/help/dataforseo-api-key")({
  component: lazyRouteComponent($$splitComponentImporter$j, "component")
});
const $$splitComponentImporter$i = () => import("./route-DDlyCRpf.js");
const Route$l = createFileRoute("/_project/p/$projectId")({
  // Everything under this subtree fetches its data client-side with
  // react-query, so SSR would only render empty chrome.
  ssr: false,
  component: lazyRouteComponent($$splitComponentImporter$i, "component")
});
const $$splitComponentImporter$h = () => import("./index-D9Ha230E.js");
const Route$k = createFileRoute("/_project/p/$projectId/")({
  component: lazyRouteComponent($$splitComponentImporter$h, "component")
});
const Route$j = createFileRoute("/api/gsc/oauth/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return handleSelfHostedGoogleOAuthCallbackRequest(
          request,
          GSC_INTEGRATION
        );
      }
    }
  }
});
const Route$i = createFileRoute("/api/ga4/oauth/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => handleSelfHostedGoogleOAuthCallbackRequest(request, GA4_INTEGRATION)
    }
  }
});
const $$splitComponentImporter$g = () => import("./settings-BKOlYotZ.js");
const Route$h = createFileRoute("/_project/p/$projectId/settings")({
  component: lazyRouteComponent($$splitComponentImporter$g, "component")
});
const $$splitComponentImporter$f = () => import("./search-performance-D3tM3cc6.js");
const Route$g = createFileRoute("/_project/p/$projectId/search-performance")({
  component: lazyRouteComponent($$splitComponentImporter$f, "component")
});
const $$splitComponentImporter$e = () => import("./saved-BYYtRo96.js");
const Route$f = createFileRoute("/_project/p/$projectId/saved")({
  component: lazyRouteComponent($$splitComponentImporter$e, "component")
});
const $$splitComponentImporter$d = () => import("./sam-BdI8JR6O.js");
const samSearchSchema = z.object({
  // Active session id. Omitted until a session is selected/created.
  s: z.string().optional()
});
const Route$e = createFileRoute("/_project/p/$projectId/sam")({
  validateSearch: samSearchSchema,
  component: lazyRouteComponent($$splitComponentImporter$d, "component")
});
const $$splitComponentImporter$c = () => import("./rank-tracking-6wk21dE5.js");
const Route$d = createFileRoute("/_project/p/$projectId/rank-tracking")({
  component: lazyRouteComponent($$splitComponentImporter$c, "component")
});
const $$splitComponentImporter$b = () => import("./prompt-explorer-B6oONvUa.js");
const Route$c = createFileRoute("/_project/p/$projectId/prompt-explorer")({
  validateSearch: promptExplorerSearchSchema,
  component: lazyRouteComponent($$splitComponentImporter$b, "component")
});
function normalizeLegacyKeywordSearch(search) {
  const normalized = {
    ...search,
    q: search.q === "" ? void 0 : search.q,
    loc: search.loc,
    kLimit: search.kLimit === 150 ? void 0 : search.kLimit,
    mode: search.mode === "auto" ? void 0 : search.mode,
    cs: search.cs === true ? true : void 0,
    sort: search.sort === "searchVolume" ? void 0 : search.sort,
    order: search.order === "desc" ? void 0 : search.order,
    minVol: void 0,
    maxVol: void 0,
    minCpc: void 0,
    maxCpc: void 0,
    minKd: void 0,
    maxKd: void 0,
    include: void 0,
    exclude: void 0
  };
  const keys = [
    "q",
    "loc",
    "kLimit",
    "mode",
    "cs",
    "sort",
    "order",
    "minVol",
    "maxVol",
    "minCpc",
    "maxCpc",
    "minKd",
    "maxKd",
    "include",
    "exclude"
  ];
  return {
    normalized,
    changed: keys.some((key) => search[key] !== normalized[key])
  };
}
function isResultLimit(value) {
  return value === 150 || value === 300 || value === 500;
}
function normalizeKeywordMode(value) {
  if (value === "auto") return "auto";
  if (value === "related") return "related";
  if (value === "suggestions") return "suggestions";
  if (value === "ideas") return "ideas";
  return "auto";
}
function normalizeSortField(value) {
  if (value === "keyword") return "keyword";
  if (value === "searchVolume") return "searchVolume";
  if (value === "cpc") return "cpc";
  if (value === "competition") return "competition";
  if (value === "keywordDifficulty") return "keywordDifficulty";
  return "searchVolume";
}
function normalizeSortDir(value) {
  return value === "asc" ? "asc" : "desc";
}
const $$splitComponentImporter$a = () => import("./keywords-CSKAcB1L.js");
const Route$b = createFileRoute("/_project/p/$projectId/keywords")({
  validateSearch: keywordsSearchSchema,
  beforeLoad: ({
    params,
    search
  }) => {
    const {
      normalized,
      changed
    } = normalizeLegacyKeywordSearch(search);
    if (!changed) return;
    throw redirect({
      to: "/p/$projectId/keywords",
      params: {
        projectId: params.projectId
      },
      search: normalized,
      replace: true
    });
  },
  component: lazyRouteComponent($$splitComponentImporter$a, "component")
});
const $$splitComponentImporter$9 = () => import("./domain-Bsg_YAU4.js");
const DEFAULT_DOMAIN_SEARCH = {
  domain: "",
  sort: "traffic",
  order: void 0,
  tab: "keywords",
  page: 1,
  size: DEFAULT_DOMAIN_KEYWORDS_PAGE_SIZE,
  include: "",
  exclude: "",
  minTraffic: void 0,
  maxTraffic: void 0,
  minVol: void 0,
  maxVol: void 0,
  minCpc: void 0,
  maxCpc: void 0,
  minKd: void 0,
  maxKd: void 0,
  minRank: void 0,
  maxRank: void 0,
  pInclude: "",
  pExclude: "",
  pMinTraffic: void 0,
  pMaxTraffic: void 0,
  pMinVol: void 0,
  pMaxVol: void 0
};
const Route$a = createFileRoute("/_project/p/$projectId/domain")({
  validateSearch: domainSearchSchema,
  search: {
    middlewares: [stripSearchParams(DEFAULT_DOMAIN_SEARCH)]
  },
  component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
const $$splitComponentImporter$8 = () => import("./brand-lookup-D41U08kN.js");
const Route$9 = createFileRoute("/_project/p/$projectId/brand-lookup")({
  validateSearch: brandLookupSearchSchema,
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const $$splitComponentImporter$7 = () => import("./backlinks-CtDsH93l.js");
const Route$8 = createFileRoute("/_project/p/$projectId/backlinks")({
  validateSearch: backlinksSearchSchema,
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./audit-d4ahNnZa.js");
const Route$7 = createFileRoute("/_project/p/$projectId/audit")({
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./index-BAb2ps-g.js");
const MOVED_TO_INTEGRATIONS = ["search-console", "google-analytics"];
const Route$6 = createFileRoute("/_project/p/$projectId/settings/")({
  beforeLoad: ({
    params,
    location
  }) => {
    const hash = location.hash.replace(/^#/, "");
    if (!MOVED_TO_INTEGRATIONS.includes(hash)) return;
    throw redirect({
      to: "/p/$projectId/settings/integrations",
      params: {
        projectId: params.projectId
      },
      hash,
      replace: true
    });
  },
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./index-BdICAHZr.js");
const Route$5 = createFileRoute("/_project/p/$projectId/rank-tracking/")({
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const startAudit = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(startAuditSchema).handler(createSsrRpc("e239daa45c0dc82d2216f3ac9a60781ba3bad43f9837cb6779399d0c3d87885c"));
const getAuditStatus = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(getAuditStatusSchema).handler(createSsrRpc("75f7965168786313e194a1941f91dd242a6b8c06b1cf69463eae0e9ce5dd6773"));
const getAuditResults = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(getAuditResultsSchema).handler(createSsrRpc("b85790a9585d03d2f8132b707c468c39db0e8f6c3f9921647d221ec8a3aa7a60"));
const getAuditHistory = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(getAuditHistorySchema).handler(createSsrRpc("8e1e5f26a194415159d9074271d62e81c5b365b4c35612f4e23581af549700cf"));
const getCrawlProgress = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(getCrawlProgressSchema).handler(createSsrRpc("a28e240f440a737b1ba00fa06c35615836e9658df9c6a9b04b18bd57f4533a93"));
const deleteAudit = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(deleteAuditSchema).handler(createSsrRpc("516782e359aa3cdba9ed9ea54db3d5b889263ae7b7a025542320a44198af7371"));
function PortalMenu({
  ariaLabel,
  triggerClassName = "btn btn-ghost btn-xs btn-square",
  triggerContent = /* @__PURE__ */ jsx(MoreHorizontal, { className: "size-3.5" }),
  menuClassName = "w-40",
  children
}) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  useEffect(() => {
    if (!isOpen) return;
    const closeOnOutsideClick = (event) => {
      const target = event.target;
      if (target instanceof Node && (buttonRef.current?.contains(target) || menuRef.current?.contains(target))) {
        return;
      }
      setIsOpen(false);
    };
    const close = () => setIsOpen(false);
    const closeOnScroll = (event) => {
      const target = event.target;
      if (target instanceof Node && menuRef.current?.contains(target)) return;
      setIsOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    window.addEventListener("scroll", closeOnScroll, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("scroll", closeOnScroll, true);
      window.removeEventListener("resize", close);
    };
  }, [isOpen]);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        ref: buttonRef,
        type: "button",
        className: triggerClassName,
        "aria-label": ariaLabel,
        "aria-expanded": isOpen,
        onClick: () => {
          const rect = buttonRef.current?.getBoundingClientRect();
          if (rect) setPosition({ top: rect.bottom + 4, left: rect.right });
          setIsOpen((open) => !open);
        },
        children: triggerContent
      }
    ),
    isOpen && typeof document !== "undefined" ? createPortal(
      /* @__PURE__ */ jsx(
        "ul",
        {
          ref: menuRef,
          className: `menu fixed z-[1000] -translate-x-full rounded-box border border-base-300 bg-base-100 p-2 shadow-lg ${menuClassName}`,
          style: { top: position.top, left: position.left },
          children: children(() => setIsOpen(false))
        }
      ),
      document.body
    ) : null
  ] });
}
const SUPPORT_EMAIL = "ben@openseo.so";
function extractPathname(url) {
  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
}
function extractHostname(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}
function formatStartedAt(dateStr) {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}
function StatusBadge({ status }) {
  if (status === "running") {
    return /* @__PURE__ */ jsxs("span", { className: "badge badge-info badge-sm gap-1", children: [
      /* @__PURE__ */ jsx(Loader2, { className: "size-3 animate-spin" }),
      " Running"
    ] });
  }
  if (status === "completed") {
    return /* @__PURE__ */ jsxs("span", { className: "badge badge-outline badge-sm gap-1 text-success/80 border-success/30 bg-success/5", children: [
      /* @__PURE__ */ jsx(CheckCircle, { className: "size-3" }),
      " Done"
    ] });
  }
  return /* @__PURE__ */ jsxs("span", { className: "badge badge-error badge-sm gap-1", children: [
    /* @__PURE__ */ jsx(AlertCircle, { className: "size-3" }),
    " Failed"
  ] });
}
function HttpStatusBadge({ code }) {
  if (!code) return /* @__PURE__ */ jsx("span", { className: "badge badge-ghost badge-sm", children: "-" });
  if (code >= 200 && code < 300) {
    return /* @__PURE__ */ jsx("span", { className: "badge badge-success badge-sm", children: code });
  }
  if (code >= 300 && code < 400) {
    return /* @__PURE__ */ jsx("span", { className: "badge badge-warning badge-sm", children: code });
  }
  return /* @__PURE__ */ jsx("span", { className: "badge badge-error badge-sm", children: code });
}
function LighthouseScoreBadge({ score }) {
  if (score == null) {
    return /* @__PURE__ */ jsx("span", { className: "text-xs text-base-content/40", children: "-" });
  }
  const color = score >= 90 ? "text-success" : score >= 50 ? "text-warning" : "text-error";
  return /* @__PURE__ */ jsx("span", { className: `font-medium text-sm ${color}`, children: score });
}
function AuditHistorySection({
  projectId,
  history,
  isLoading,
  onDelete
}) {
  if (history.length === 0 && !isLoading) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-16", children: /* @__PURE__ */ jsxs("div", { className: "text-center text-base-content/40 space-y-3", children: [
      /* @__PURE__ */ jsx(ScanSearch, { className: "size-12 mx-auto opacity-30" }),
      /* @__PURE__ */ jsx("p", { className: "text-lg font-medium", children: "No audits yet" })
    ] }) });
  }
  if (history.length === 0) return null;
  return /* @__PURE__ */ jsx("div", { className: "card bg-base-100 border border-base-300", children: /* @__PURE__ */ jsxs("div", { className: "card-body gap-3", children: [
    /* @__PURE__ */ jsx("h2", { className: "card-title text-base", children: "Previous Audits" }),
    /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "table table-sm", children: [
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("th", { children: "Date" }),
        /* @__PURE__ */ jsx("th", { children: "URL" }),
        /* @__PURE__ */ jsx("th", { children: "Status" }),
        /* @__PURE__ */ jsx("th", { children: "Pages" }),
        /* @__PURE__ */ jsx("th", { children: "Lighthouse" }),
        /* @__PURE__ */ jsx("th", {})
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { children: history.map((audit) => /* @__PURE__ */ jsxs("tr", { className: "hover group", children: [
        /* @__PURE__ */ jsx("td", { className: "text-xs text-base-content/70", children: formatDate(audit.startedAt) }),
        /* @__PURE__ */ jsx("td", { className: "max-w-[220px] truncate", children: audit.startUrl }),
        /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx(StatusBadge, { status: audit.status }) }),
        /* @__PURE__ */ jsx("td", { children: audit.pagesTotal || audit.pagesCrawled }),
        /* @__PURE__ */ jsx("td", { children: audit.ranLighthouse ? /* @__PURE__ */ jsx("span", { className: "badge badge-ghost badge-xs", children: "Yes" }) : null }),
        /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx(
          HistoryActions,
          {
            projectId,
            auditId: audit.id,
            onDelete
          }
        ) })
      ] }, audit.id)) })
    ] }) })
  ] }) });
}
function HistoryActions({
  projectId,
  auditId,
  onDelete
}) {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-2 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100", children: [
    /* @__PURE__ */ jsx(
      Link,
      {
        to: "/p/$projectId/audit",
        params: { projectId },
        search: { auditId, tab: "pages" },
        className: "btn btn-primary btn-xs",
        children: "View"
      }
    ),
    /* @__PURE__ */ jsx(PortalMenu, { ariaLabel: "Audit actions", children: (close) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
      "button",
      {
        className: "text-error",
        onClick: () => {
          close();
          onDelete(auditId);
        },
        children: [
          /* @__PURE__ */ jsx(Trash2, { className: "size-3.5" }),
          "Delete audit"
        ]
      }
    ) }) })
  ] });
}
const MIN_PAGES = MIN_AUDIT_PAGES;
function getMaxPagesLimit(isFreePlan) {
  return isFreePlan ? FREE_MAX_AUDIT_PAGES : PAID_MAX_AUDIT_PAGES;
}
const DEFAULT_LAUNCH_FORM_VALUES = {
  url: "",
  maxPagesInput: String(DEFAULT_AUDIT_PAGES),
  runLighthouse: false
};
function createFormValidationErrors({
  fields,
  form
}) {
  const normalizedFields = {};
  for (const [key, value] of Object.entries(fields ?? {})) {
    if (typeof value === "string") {
      normalizedFields[key] = value;
    }
  }
  if (!form && Object.keys(normalizedFields).length === 0) {
    return null;
  }
  return {
    fields: Object.keys(normalizedFields).length > 0 ? normalizedFields : void 0,
    form: form ?? void 0
  };
}
function getFormError(error) {
  if (typeof error === "string") {
    return error;
  }
  if (error && typeof error === "object" && "form" in error && typeof error.form === "string") {
    return error.form;
  }
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    return error.message;
  }
  return null;
}
function getFieldError(errors) {
  return getFormError(errors[0]);
}
function shouldValidateFieldOnChange(formApi, field) {
  return formApi.state.submissionAttempts > 0 || Boolean(formApi.getFieldMeta(field)?.isTouched);
}
function LaunchFormCard({
  commitMaxPagesInput: commitMaxPagesInput2,
  launchForm,
  maxPagesLimit
}) {
  return /* @__PURE__ */ jsx("div", { className: "card bg-base-100 border border-base-300", children: /* @__PURE__ */ jsxs("div", { className: "card-body gap-4", children: [
    /* @__PURE__ */ jsx("h2", { className: "card-title text-base", children: "Start New Audit" }),
    /* @__PURE__ */ jsxs(
      "form",
      {
        className: "grid grid-cols-1 gap-3 lg:grid-cols-12 lg:items-center",
        onSubmit: (event) => {
          event.preventDefault();
          void launchForm.handleSubmit();
        },
        children: [
          /* @__PURE__ */ jsx(launchForm.Field, { name: "url", children: (field) => {
            const urlError = getFieldError(field.state.meta.errors);
            return /* @__PURE__ */ jsx(
              "label",
              {
                className: `input input-bordered w-full lg:col-span-9 ${urlError ? "input-error" : ""}`,
                children: /* @__PURE__ */ jsx(
                  "input",
                  {
                    placeholder: "https://example.com",
                    value: field.state.value,
                    onChange: (event) => {
                      field.handleChange(event.target.value);
                      if (launchForm.state.errorMap.onSubmit) {
                        launchForm.setErrorMap({ onSubmit: void 0 });
                      }
                    }
                  }
                )
              }
            );
          } }),
          /* @__PURE__ */ jsx(launchForm.Subscribe, { selector: (state) => state.isSubmitting, children: (isSubmitting) => /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              className: "btn btn-primary btn-sm w-full lg:col-span-3",
              disabled: isSubmitting,
              children: isSubmitting ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(Loader2, { className: "size-4 animate-spin" }),
                " Starting..."
              ] }) : "Start Audit"
            }
          ) }),
          /* @__PURE__ */ jsxs("div", { className: "grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:col-span-12 lg:items-start", children: [
            /* @__PURE__ */ jsx(
              LaunchOptions,
              {
                launchForm,
                commitMaxPagesInput: commitMaxPagesInput2,
                maxPagesLimit
              }
            ),
            /* @__PURE__ */ jsx(LighthouseOptions, { launchForm })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsx(LaunchErrors, { launchForm })
  ] }) });
}
function LaunchOptions({
  launchForm,
  commitMaxPagesInput: commitMaxPagesInput2,
  maxPagesLimit
}) {
  const isFreeLimited = maxPagesLimit < PAID_MAX_AUDIT_PAGES;
  return /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-base-300 bg-base-200/20 p-3 space-y-2", children: [
    /* @__PURE__ */ jsx("label", { className: "text-xs font-medium uppercase tracking-wide text-base-content/60", children: "Crawl limit" }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx("span", { className: "text-sm text-base-content/70", children: "Max pages" }),
      /* @__PURE__ */ jsx(launchForm.Field, { name: "maxPagesInput", children: (field) => /* @__PURE__ */ jsx(
        "input",
        {
          type: "number",
          min: MIN_PAGES,
          max: maxPagesLimit,
          className: "input input-bordered input-sm w-28",
          value: field.state.value,
          onChange: (event) => {
            const next = event.target.value;
            if (!/^\d*$/.test(next)) return;
            field.handleChange(next);
            if (launchForm.state.errorMap.onSubmit) {
              launchForm.setErrorMap({ onSubmit: void 0 });
            }
          },
          onBlur: commitMaxPagesInput2
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxs("p", { className: "text-xs text-base-content/50", children: [
      "Enter any value from ",
      MIN_PAGES,
      " to ",
      maxPagesLimit.toLocaleString(),
      ".",
      isFreeLimited ? /* @__PURE__ */ jsxs(Fragment, { children: [
        " ",
        /* @__PURE__ */ jsx(
          Link,
          {
            to: SUBSCRIBE_ROUTE,
            search: { upgrade: true },
            className: "link link-primary",
            children: "Upgrade"
          }
        ),
        " ",
        "to crawl up to ",
        PAID_MAX_AUDIT_PAGES.toLocaleString(),
        " pages."
      ] }) : null
    ] })
  ] });
}
function LighthouseOptions({ launchForm }) {
  return /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-base-300 bg-base-200/20 p-3 space-y-2", children: [
    /* @__PURE__ */ jsxs("label", { className: "label cursor-pointer justify-start gap-2 p-0", children: [
      /* @__PURE__ */ jsx(launchForm.Field, { name: "runLighthouse", children: (field) => /* @__PURE__ */ jsx(
        "input",
        {
          type: "checkbox",
          className: "toggle toggle-sm toggle-primary",
          checked: Boolean(field.state.value),
          onChange: (event) => field.handleChange(event.target.checked)
        }
      ) }),
      /* @__PURE__ */ jsx(
        "span",
        {
          className: "text-sm font-medium text-base-content/80",
          title: "Lighthouse measures the performance of your pages and identifies issues.",
          children: "Include Lighthouse"
        }
      )
    ] }),
    /* @__PURE__ */ jsx(
      launchForm.Subscribe,
      {
        selector: (snapshot) => snapshot.values.runLighthouse,
        children: (runLighthouse) => runLighthouse ? /* @__PURE__ */ jsx("div", { className: "space-y-1", children: /* @__PURE__ */ jsx("p", { className: "text-xs text-base-content/60", children: "We choose a sample of 20 pages to audit, removing pages from duplicate templates." }) }) : null
      }
    )
  ] });
}
function LaunchErrors({ launchForm }) {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
    /* @__PURE__ */ jsx(launchForm.Field, { name: "url", children: (field) => {
      const urlError = getFieldError(field.state.meta.errors);
      return urlError ? /* @__PURE__ */ jsx("p", { className: "text-sm text-error", children: urlError }) : null;
    } }),
    /* @__PURE__ */ jsx(launchForm.Subscribe, { selector: (state) => state.errorMap.onSubmit, children: (submitError) => {
      const errorMessage = getFormError(submitError);
      return errorMessage ? /* @__PURE__ */ jsx("div", { className: "alert alert-error py-2", children: /* @__PURE__ */ jsx("span", { className: "text-sm", children: errorMessage }) }) : null;
    } })
  ] });
}
function getLaunchValidationErrors(value, shouldValidateUntouchedField) {
  if (value.url.trim()) {
    return null;
  }
  if (!shouldValidateUntouchedField) {
    return null;
  }
  return createFormValidationErrors({
    fields: {
      url: "Please enter a URL."
    }
  });
}
function useLaunchController({
  projectId,
  isFreePlan,
  onAuditStarted
}) {
  const maxPagesLimit = getMaxPagesLimit(isFreePlan);
  const historyQuery = useQuery({
    queryKey: ["audit-history", projectId],
    queryFn: () => getAuditHistory({ data: { projectId } })
  });
  const { startMutation, deleteMutation } = useLaunchMutations({
    projectId,
    historyRefetch: historyQuery.refetch
  });
  const launchForm = useForm({
    defaultValues: DEFAULT_LAUNCH_FORM_VALUES,
    validators: {
      onChange: ({ formApi, value }) => getLaunchValidationErrors(
        value,
        shouldValidateFieldOnChange(formApi, "url")
      ),
      onSubmit: ({ value }) => getLaunchValidationErrors(value, true)
    },
    onSubmit: async ({ formApi, value }) => {
      const effectiveMaxPages = commitMaxPagesInput(launchForm, maxPagesLimit);
      formApi.setErrorMap({ onSubmit: void 0 });
      if (effectiveMaxPages > 500) {
        const confirmed = window.confirm(
          `You are about to crawl ${effectiveMaxPages.toLocaleString()} pages. This is okay, but it may take a while. Continue?`
        );
        if (!confirmed) {
          return;
        }
      }
      try {
        const result = await startMutation.mutateAsync({
          projectId,
          startUrl: value.url,
          maxPages: effectiveMaxPages,
          lighthouseStrategy: value.runLighthouse ? "auto" : "none"
        });
        toast.success("Audit started!");
        onAuditStarted(result.auditId);
      } catch (error) {
        formApi.setErrorMap({
          onSubmit: createFormValidationErrors({
            form: getStandardErrorMessage(error, "Failed to start audit")
          })
        });
      }
    }
  });
  return {
    launchForm,
    historyQuery,
    maxPagesLimit,
    commitMaxPagesInput: () => commitMaxPagesInput(launchForm, maxPagesLimit),
    deleteAudit: (auditId) => deleteMutation.mutate(auditId)
  };
}
function useLaunchMutations({
  projectId,
  historyRefetch
}) {
  const startMutation = useMutation({
    mutationFn: (data) => startAudit({ data })
  });
  const deleteMutation = useMutation({
    mutationFn: (auditId) => deleteAudit({ data: { projectId, auditId } }),
    onSuccess: () => {
      void historyRefetch();
      toast.success("Audit deleted");
    }
  });
  return { startMutation, deleteMutation };
}
function commitMaxPagesInput(launchForm, maxPagesLimit) {
  const maxPagesInput = launchForm.state.values.maxPagesInput;
  const value = maxPagesInput ? Number.parseInt(maxPagesInput, 10) : MIN_PAGES;
  const safeValue = Number.isFinite(value) ? Math.max(MIN_PAGES, Math.min(maxPagesLimit, Math.round(value))) : MIN_PAGES;
  launchForm.setFieldValue("maxPagesInput", String(safeValue));
  return safeValue;
}
function getCustomerPlanStatus(customer) {
  return customer?.flags?.[AUTUMN_PAID_PLAN_FEATURE_ID] ? "paid" : "free";
}
const redirectPlugin = {
  id: "redirect",
  name: "Redirect",
  hooks: { onSuccess(context) {
    if (context.data?.url && context.data?.redirect && isSafeUrlScheme(context.data.url)) {
      if (typeof window !== "undefined" && window.location) {
        if (window.location) try {
          window.location.href = context.data.url;
        } catch {
        }
      }
    }
  } }
};
let listenerQueue = [];
let lqIndex = 0;
const QUEUE_ITEMS_PER_LISTENER = 4;
const atom = /* @__NO_SIDE_EFFECTS__ */ (initialValue) => {
  let listeners2 = [];
  let $atom = {
    get() {
      if (!$atom.lc) {
        $atom.listen(() => {
        })();
      }
      return $atom.value;
    },
    lc: 0,
    listen(listener) {
      $atom.lc = listeners2.push(listener);
      return () => {
        for (let i = lqIndex + QUEUE_ITEMS_PER_LISTENER; i < listenerQueue.length; ) {
          if (listenerQueue[i] === listener) {
            listenerQueue.splice(i, QUEUE_ITEMS_PER_LISTENER);
          } else {
            i += QUEUE_ITEMS_PER_LISTENER;
          }
        }
        let index = listeners2.indexOf(listener);
        if (~index) {
          listeners2.splice(index, 1);
          if (!--$atom.lc) $atom.off();
        }
      };
    },
    notify(oldValue, changedKey) {
      let runListenerQueue = !listenerQueue.length;
      for (let listener of listeners2) {
        listenerQueue.push(listener, $atom.value, oldValue, changedKey);
      }
      if (runListenerQueue) {
        for (lqIndex = 0; lqIndex < listenerQueue.length; lqIndex += QUEUE_ITEMS_PER_LISTENER) {
          listenerQueue[lqIndex](
            listenerQueue[lqIndex + 1],
            listenerQueue[lqIndex + 2],
            listenerQueue[lqIndex + 3]
          );
        }
        listenerQueue.length = 0;
      }
    },
    /* It will be called on last listener unsubscribing.
       We will redefine it in onMount and onStop. */
    off() {
    },
    set(newValue) {
      let oldValue = $atom.value;
      if (oldValue !== newValue) {
        $atom.value = newValue;
        $atom.notify(oldValue);
      }
    },
    subscribe(listener) {
      let unbind = $atom.listen(listener);
      listener($atom.value);
      return unbind;
    },
    value: initialValue
  };
  return $atom;
};
const SET = 2;
const MOUNT = 5;
const UNMOUNT = 6;
const REVERT_MUTATION = 10;
let on = (object, listener, eventKey, mutateStore) => {
  object.events = object.events || {};
  if (!object.events[eventKey + REVERT_MUTATION]) {
    object.events[eventKey + REVERT_MUTATION] = mutateStore((eventProps) => {
      object.events[eventKey].reduceRight((event, l) => (l(event), event), {
        shared: {},
        ...eventProps
      });
    });
  }
  object.events[eventKey] = object.events[eventKey] || [];
  object.events[eventKey].push(listener);
  return () => {
    let currentListeners = object.events[eventKey];
    let index = currentListeners.indexOf(listener);
    currentListeners.splice(index, 1);
    if (!currentListeners.length) {
      delete object.events[eventKey];
      object.events[eventKey + REVERT_MUTATION]();
      delete object.events[eventKey + REVERT_MUTATION];
    }
  };
};
let onSet = ($store, listener) => on($store, listener, SET, (runListeners) => {
  let originSet = $store.set;
  let originSetKey = $store.setKey;
  if ($store.setKey) {
    $store.setKey = (changed, changedValue) => {
      let isAborted;
      let abort = () => {
        isAborted = true;
      };
      runListeners({
        abort,
        changed,
        newValue: { ...$store.value, [changed]: changedValue }
      });
      if (!isAborted) return originSetKey(changed, changedValue);
    };
  }
  $store.set = (newValue) => {
    let isAborted;
    let abort = () => {
      isAborted = true;
    };
    runListeners({ abort, newValue });
    if (!isAborted) return originSet(newValue);
  };
  return () => {
    $store.set = originSet;
    $store.setKey = originSetKey;
  };
});
let STORE_UNMOUNT_DELAY = 1e3;
let onMount = ($store, initialize) => {
  let listener = (payload) => {
    let destroy = initialize(payload);
    if (destroy) $store.events[UNMOUNT].push(destroy);
  };
  return on($store, listener, MOUNT, (runListeners) => {
    let originListen = $store.listen;
    $store.listen = (...args) => {
      if (!$store.lc && !$store.active) {
        $store.active = true;
        runListeners();
      }
      return originListen(...args);
    };
    let originOff = $store.off;
    $store.events[UNMOUNT] = [];
    $store.off = () => {
      originOff();
      setTimeout(() => {
        if ($store.active && !$store.lc) {
          $store.active = false;
          for (let destroy of $store.events[UNMOUNT]) destroy();
          $store.events[UNMOUNT] = [];
        }
      }, STORE_UNMOUNT_DELAY);
    };
    return () => {
      $store.listen = originListen;
      $store.off = originOff;
    };
  });
};
function listenKeys($store, keys, listener) {
  let keysSet = new Set(keys).add(void 0);
  return $store.listen((value, oldValue, changed) => {
    if (keysSet.has(changed)) {
      listener(value, oldValue, changed);
    }
  });
}
function isPlainObject(value) {
  if (typeof value !== "object" || value === null) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}
function isJsonEqual(a, b) {
  if (a === b) return true;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (!isJsonEqual(a[i], b[i])) return false;
    return true;
  }
  if (isPlainObject(a) && isPlainObject(b)) {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    for (const key of keysA) if (!(key in b) || !isJsonEqual(a[key], b[key])) return false;
    return true;
  }
  return false;
}
function withEquality(store, isEqual) {
  return onSet(store, ({ newValue, abort }) => {
    if (isEqual(store.value, newValue)) abort();
  });
}
const kBroadcastChannel = /* @__PURE__ */ Symbol.for("better-auth:broadcast-channel");
const now$1 = () => Math.floor(Date.now() / 1e3);
var WindowBroadcastChannel = class {
  listeners = /* @__PURE__ */ new Set();
  name;
  constructor(name = "better-auth.message") {
    this.name = name;
  }
  subscribe(listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
  post(message) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(this.name, JSON.stringify({
        ...message,
        timestamp: now$1()
      }));
    } catch {
    }
  }
  setup() {
    if (typeof window === "undefined" || typeof window.addEventListener === "undefined") return () => {
    };
    const handler = (event) => {
      if (event.key !== this.name) return;
      const message = JSON.parse(event.newValue ?? "{}");
      if (message?.event !== "session" || !message?.data) return;
      this.listeners.forEach((listener) => listener(message));
    };
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("storage", handler);
    };
  }
};
function getGlobalBroadcastChannel(name = "better-auth.message") {
  if (!globalThis[kBroadcastChannel]) globalThis[kBroadcastChannel] = new WindowBroadcastChannel(name);
  return globalThis[kBroadcastChannel];
}
const kFocusManager = /* @__PURE__ */ Symbol.for("better-auth:focus-manager");
var WindowFocusManager = class {
  listeners = /* @__PURE__ */ new Set();
  subscribe(listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
  setFocused(focused) {
    this.listeners.forEach((listener) => listener(focused));
  }
  setup() {
    if (typeof window === "undefined" || typeof document === "undefined" || typeof window.addEventListener === "undefined") return () => {
    };
    const visibilityHandler = () => {
      if (document.visibilityState === "visible") this.setFocused(true);
    };
    document.addEventListener("visibilitychange", visibilityHandler, false);
    return () => {
      document.removeEventListener("visibilitychange", visibilityHandler, false);
    };
  }
};
function getGlobalFocusManager() {
  if (!globalThis[kFocusManager]) globalThis[kFocusManager] = new WindowFocusManager();
  return globalThis[kFocusManager];
}
const kOnlineManager = /* @__PURE__ */ Symbol.for("better-auth:online-manager");
var WindowOnlineManager = class {
  listeners = /* @__PURE__ */ new Set();
  isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
  subscribe(listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
  setOnline(online) {
    this.isOnline = online;
    this.listeners.forEach((listener) => listener(online));
  }
  setup() {
    if (typeof window === "undefined" || typeof window.addEventListener === "undefined") return () => {
    };
    const onOnline = () => this.setOnline(true);
    const onOffline = () => this.setOnline(false);
    window.addEventListener("online", onOnline, false);
    window.addEventListener("offline", onOffline, false);
    return () => {
      window.removeEventListener("online", onOnline, false);
      window.removeEventListener("offline", onOffline, false);
    };
  }
};
function getGlobalOnlineManager() {
  if (!globalThis[kOnlineManager]) globalThis[kOnlineManager] = new WindowOnlineManager();
  return globalThis[kOnlineManager];
}
const now = () => Math.floor(Date.now() / 1e3);
const FOCUS_REFETCH_RATE_LIMIT_SECONDS = 5;
function createSessionRefreshManager(opts) {
  const { fetchSession, shouldPollSession = () => true, sessionSignal, options = {} } = opts;
  const refetchInterval = options.sessionOptions?.refetchInterval ?? 0;
  const refetchOnWindowFocus = options.sessionOptions?.refetchOnWindowFocus ?? true;
  const refetchWhenOffline = options.sessionOptions?.refetchWhenOffline ?? false;
  const state = {
    isInitialized: false,
    lastSessionRequest: 0
  };
  const shouldRefetch = () => {
    return refetchWhenOffline || getGlobalOnlineManager().isOnline;
  };
  const triggerRefetch = (event) => {
    if (!shouldRefetch()) return;
    if (event?.event === "storage") {
      fetchSession();
      return;
    }
    if (event?.event === "poll") {
      state.lastSessionRequest = now();
      fetchSession();
      return;
    }
    if (event?.event === "visibilitychange") {
      if (now() - state.lastSessionRequest < FOCUS_REFETCH_RATE_LIMIT_SECONDS) return;
      state.lastSessionRequest = now();
      fetchSession();
      return;
    }
    fetchSession();
  };
  const broadcastSessionUpdate = (trigger) => {
    getGlobalBroadcastChannel().post({
      event: "session",
      data: { trigger },
      clientId: Math.random().toString(36).substring(7)
    });
  };
  const setupPolling = () => {
    if (refetchInterval && refetchInterval > 0) state.pollInterval = setInterval(() => {
      if (shouldPollSession()) triggerRefetch({ event: "poll" });
    }, refetchInterval * 1e3);
  };
  const setupBroadcast = () => {
    state.unsubscribeBroadcast = getGlobalBroadcastChannel().subscribe(() => {
      triggerRefetch({ event: "storage" });
    });
  };
  const setupFocusRefetch = () => {
    if (!refetchOnWindowFocus) return;
    state.unsubscribeFocus = getGlobalFocusManager().subscribe(() => {
      triggerRefetch({ event: "visibilitychange" });
    });
  };
  const setupOnlineRefetch = () => {
    state.unsubscribeOnline = getGlobalOnlineManager().subscribe((online) => {
      if (online) triggerRefetch({ event: "visibilitychange" });
    });
  };
  const setupSignalSubscription = () => {
    state.unsubscribeSignal = sessionSignal.listen(() => {
      fetchSession();
    });
  };
  const init = () => {
    if (state.isInitialized) return;
    state.isInitialized = true;
    setupPolling();
    setupBroadcast();
    setupFocusRefetch();
    setupOnlineRefetch();
    setupSignalSubscription();
    state.cleanupBroadcastSetup = getGlobalBroadcastChannel().setup();
    state.cleanupFocusSetup = getGlobalFocusManager().setup();
    state.cleanupOnlineSetup = getGlobalOnlineManager().setup();
  };
  const cleanup = () => {
    if (!state.isInitialized) return;
    if (state.pollInterval) {
      clearInterval(state.pollInterval);
      state.pollInterval = void 0;
    }
    if (state.unsubscribeBroadcast) {
      state.unsubscribeBroadcast();
      state.unsubscribeBroadcast = void 0;
    }
    if (state.unsubscribeFocus) {
      state.unsubscribeFocus();
      state.unsubscribeFocus = void 0;
    }
    if (state.unsubscribeOnline) {
      state.unsubscribeOnline();
      state.unsubscribeOnline = void 0;
    }
    if (state.unsubscribeSignal) {
      state.unsubscribeSignal();
      state.unsubscribeSignal = void 0;
    }
    if (state.cleanupBroadcastSetup) {
      state.cleanupBroadcastSetup();
      state.cleanupBroadcastSetup = void 0;
    }
    if (state.cleanupFocusSetup) {
      state.cleanupFocusSetup();
      state.cleanupFocusSetup = void 0;
    }
    if (state.cleanupOnlineSetup) {
      state.cleanupOnlineSetup();
      state.cleanupOnlineSetup = void 0;
    }
    state.isInitialized = false;
    state.lastSessionRequest = 0;
  };
  return {
    init,
    cleanup,
    triggerRefetch,
    broadcastSessionUpdate
  };
}
const isServer$1 = () => typeof window === "undefined";
function normalizeSessionResponse(res) {
  if (typeof res === "object" && res !== null && "data" in res && "error" in res) return res;
  return {
    data: res,
    error: null
  };
}
function normalizeSessionData(data) {
  if (!data) return null;
  if (data.session === null && data.user === null) return null;
  return data;
}
function isSessionAtomEqual(a, b) {
  return isJsonEqual(a.data, b.data) && a.error === b.error && a.isPending === b.isPending && a.isRefetching === b.isRefetching && a.refetch === b.refetch;
}
function getSessionAtom($fetch, options) {
  const $signal = /* @__PURE__ */ atom(false);
  let abortController;
  const refetch = (queryParams) => fetchSession(queryParams);
  const session = /* @__PURE__ */ atom({
    data: null,
    error: null,
    isPending: true,
    isRefetching: false,
    refetch
  });
  withEquality(session, isSessionAtomEqual);
  const settleAbortedFetch = (controller) => {
    if (abortController !== controller) return;
    const current = session.get();
    abortController = void 0;
    if (!current.isPending && !current.isRefetching) return;
    session.set({
      ...current,
      isPending: false,
      isRefetching: false,
      refetch
    });
  };
  const fetchSession = async (queryParams) => {
    abortController?.abort();
    const controller = new AbortController();
    abortController = controller;
    const current = session.get();
    session.set({
      ...current,
      isPending: current.data === null,
      isRefetching: true,
      error: null,
      refetch
    });
    try {
      const res = await $fetch("/get-session", {
        method: "GET",
        query: queryParams?.query,
        signal: controller.signal
      });
      if (controller.signal.aborted) {
        settleAbortedFetch(controller);
        return;
      }
      let { data, error } = normalizeSessionResponse(res);
      if (data?.needsRefresh) try {
        const refreshRes = await $fetch("/get-session", {
          method: "POST",
          signal: controller.signal
        });
        if (controller.signal.aborted) {
          settleAbortedFetch(controller);
          return;
        }
        ({ data, error } = normalizeSessionResponse(refreshRes));
      } catch {
        if (controller.signal.aborted) {
          settleAbortedFetch(controller);
          return;
        }
      }
      if (error) {
        const latest = session.get();
        const isUnauthorized = error?.status === 401;
        session.set({
          data: isUnauthorized ? null : latest.data,
          error,
          isPending: false,
          isRefetching: false,
          refetch
        });
        return;
      }
      const sessionData = normalizeSessionData(data);
      const current2 = session.get();
      const stableData = current2.data != null && sessionData != null && isJsonEqual(current2.data, sessionData) ? current2.data : sessionData;
      session.set({
        data: stableData,
        error: null,
        isPending: false,
        isRefetching: false,
        refetch
      });
    } catch (fetchError) {
      if (controller.signal.aborted) {
        settleAbortedFetch(controller);
        return;
      }
      const latest = session.get();
      session.set({
        data: latest.data,
        error: fetchError,
        isPending: false,
        isRefetching: false,
        refetch
      });
    }
  };
  let broadcastSessionUpdate = () => {
  };
  onMount(session, () => {
    let timeoutId;
    if (!isServer$1()) timeoutId = setTimeout(() => {
      fetchSession();
    }, 0);
    const refreshManager = createSessionRefreshManager({
      fetchSession,
      shouldPollSession: () => session.get().data != null,
      sessionSignal: $signal,
      options
    });
    refreshManager.init();
    broadcastSessionUpdate = refreshManager.broadcastSessionUpdate;
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      const controller = abortController;
      controller?.abort();
      if (controller) settleAbortedFetch(controller);
      refreshManager.cleanup();
    };
  });
  return {
    session,
    $sessionSignal: $signal,
    broadcastSessionUpdate: (trigger) => broadcastSessionUpdate(trigger)
  };
}
const resolvePublicAuthUrl = (basePath) => {
  if (typeof process === "undefined") return void 0;
  const path = basePath ?? "/api/auth";
  if (process.env.NEXT_PUBLIC_AUTH_URL) return process.env.NEXT_PUBLIC_AUTH_URL;
  if (typeof window === "undefined") {
    if (process.env.NEXTAUTH_URL) try {
      return process.env.NEXTAUTH_URL;
    } catch {
    }
    if (process.env.VERCEL_URL) try {
      const protocol = process.env.VERCEL_URL.startsWith("http") ? "" : "https://";
      return `${new URL(`${protocol}${process.env.VERCEL_URL}`).origin}${path}`;
    } catch {
    }
  }
};
const getClientConfig = (options, loadEnv) => {
  const isCredentialsSupported = "credentials" in Request.prototype;
  const baseURL = getBaseURL(options?.baseURL, options?.basePath, void 0) ?? resolvePublicAuthUrl(options?.basePath) ?? "/api/auth";
  const pluginsFetchPlugins = options?.plugins?.flatMap((plugin) => plugin.fetchPlugins).filter((pl) => pl !== void 0) || [];
  const lifeCyclePlugin = {
    id: "lifecycle-hooks",
    name: "lifecycle-hooks",
    hooks: {
      onSuccess: options?.fetchOptions?.onSuccess,
      onError: options?.fetchOptions?.onError,
      onRequest: options?.fetchOptions?.onRequest,
      onResponse: options?.fetchOptions?.onResponse
    }
  };
  const { onSuccess: _onSuccess, onError: _onError, onRequest: _onRequest, onResponse: _onResponse, ...restOfFetchOptions } = options?.fetchOptions || {};
  const $fetch = createFetch({
    baseURL,
    ...isCredentialsSupported ? { credentials: "include" } : {},
    method: "GET",
    jsonParser(text) {
      if (!text) return null;
      return parseJSON(text, { strict: false });
    },
    customFetchImpl: fetch,
    ...restOfFetchOptions,
    plugins: [
      lifeCyclePlugin,
      ...restOfFetchOptions.plugins || [],
      ...options?.disableDefaultFetchPlugins ? [] : [redirectPlugin],
      ...pluginsFetchPlugins
    ]
  });
  const { $sessionSignal, session, broadcastSessionUpdate } = getSessionAtom($fetch, options);
  const plugins = options?.plugins || [];
  let pluginsActions = {};
  const pluginsAtoms = {
    $sessionSignal,
    session
  };
  const pluginPathMethods = {
    "/sign-out": "POST",
    "/revoke-sessions": "POST",
    "/revoke-other-sessions": "POST",
    "/delete-user": "POST"
  };
  const atomListeners = [{
    signal: "$sessionSignal",
    matcher(path) {
      return path === "/sign-out" || path === "/update-user" || path === "/update-session" || path === "/sign-up/email" || path === "/sign-in/email" || path === "/delete-user" || path === "/verify-email" || path === "/revoke-sessions" || path === "/revoke-session" || path === "/revoke-other-sessions" || path === "/change-email" || path === "/change-password";
    },
    callback(path) {
      if (path === "/sign-out") broadcastSessionUpdate("signout");
      else if (path === "/update-user" || path === "/update-session") broadcastSessionUpdate("updateUser");
    }
  }];
  for (const plugin of plugins) {
    if (plugin.getAtoms) Object.assign(pluginsAtoms, plugin.getAtoms?.($fetch));
    if (plugin.pathMethods) Object.assign(pluginPathMethods, plugin.pathMethods);
    if (plugin.atomListeners) atomListeners.push(...plugin.atomListeners);
  }
  const $store = {
    notify: (signal) => {
      pluginsAtoms[signal].set(!pluginsAtoms[signal].get());
    },
    listen: (signal, listener) => {
      pluginsAtoms[signal].subscribe(listener);
    },
    atoms: pluginsAtoms
  };
  for (const plugin of plugins) if (plugin.getActions) pluginsActions = defu(plugin.getActions?.($fetch, $store, options) ?? {}, pluginsActions);
  return {
    get baseURL() {
      return baseURL;
    },
    pluginsActions,
    pluginsAtoms,
    pluginPathMethods,
    atomListeners,
    $fetch,
    $store
  };
};
function isAtom(value) {
  return typeof value === "object" && value !== null && "get" in value && typeof value.get === "function" && "lc" in value && typeof value.lc === "number";
}
function getMethod(path, knownPathMethods, args) {
  const method = knownPathMethods[path];
  const { fetchOptions, query: _query, ...body } = args || {};
  if (method) return method;
  if (fetchOptions?.method) return fetchOptions.method;
  if (body && Object.keys(body).length > 0) return "POST";
  return "GET";
}
function createDynamicPathProxy(routes, client, knownPathMethods, atoms, atomListeners) {
  function createProxy(path = []) {
    return new Proxy(function() {
    }, {
      get(_, prop) {
        if (typeof prop !== "string") return;
        if (prop === "then" || prop === "catch" || prop === "finally") return;
        const fullPath = [...path, prop];
        let current = routes;
        for (const segment of fullPath) if (current && typeof current === "object" && segment in current) current = current[segment];
        else {
          current = void 0;
          break;
        }
        if (typeof current === "function") return current;
        if (isAtom(current)) return current;
        return createProxy(fullPath);
      },
      apply: async (_, __, args) => {
        const routePath = "/" + path.map(toKebabCase).join("/");
        const arg = args[0] || {};
        const fetchOptions = args[1] || {};
        const { query, fetchOptions: argFetchOptions, ...body } = arg;
        const options = {
          ...fetchOptions,
          ...argFetchOptions
        };
        const method = getMethod(routePath, knownPathMethods, arg);
        return await client(routePath, {
          ...options,
          body: method === "GET" ? void 0 : {
            ...body,
            ...options?.body || {}
          },
          query: query || options?.query,
          method,
          async onSuccess(context) {
            await options?.onSuccess?.(context);
            if (!atomListeners || options.disableSignal) return;
            const matches = atomListeners.filter((s) => s.matcher(routePath));
            if (!matches.length) return;
            const visited = /* @__PURE__ */ new Set();
            for (const match of matches) {
              const signal = atoms[match.signal];
              if (!signal) return;
              if (visited.has(match.signal)) continue;
              visited.add(match.signal);
              const val = signal.get();
              setTimeout(() => {
                signal.set(!val);
              }, 10);
              match.callback?.(routePath);
            }
          }
        });
      }
    });
  }
  return createProxy();
}
function useStore(store, options = {}) {
  const snapshotRef = useRef(store.get());
  const { keys, deps = [store, keys] } = options;
  const subscribe = useCallback((onChange) => {
    const emitChange = (value) => {
      if (snapshotRef.current === value) return;
      snapshotRef.current = value;
      onChange();
    };
    emitChange(store.value);
    if (keys?.length) return listenKeys(store, keys, emitChange);
    return store.listen(emitChange);
  }, deps);
  const get = () => snapshotRef.current;
  return useSyncExternalStore(subscribe, get, get);
}
function getAtomKey(str) {
  return `use${capitalizeFirstLetter(str)}`;
}
function createAuthClient(options) {
  const { pluginPathMethods, pluginsActions, pluginsAtoms, $fetch, $store, atomListeners } = getClientConfig(options);
  const resolvedHooks = {};
  for (const [key, value] of Object.entries(pluginsAtoms)) resolvedHooks[getAtomKey(key)] = () => useStore(value);
  return createDynamicPathProxy({
    ...pluginsActions,
    ...resolvedHooks,
    $fetch,
    $store
  }, $fetch, pluginPathMethods, pluginsAtoms, atomListeners);
}
const inferAdditionalFields = (schema) => {
  return {
    id: "additional-fields-client",
    version: PACKAGE_VERSION,
    $InferServerPlugin: {}
  };
};
const genericOAuthClient = () => {
  return {
    id: "generic-oauth-client",
    version: PACKAGE_VERSION,
    $InferServerPlugin: {},
    $ERROR_CODES: GENERIC_OAUTH_ERROR_CODES
  };
};
const isServer = () => typeof window === "undefined";
function isAuthQueryStateEqual(a, b) {
  return isJsonEqual(a.data, b.data) && a.error === b.error && a.isPending === b.isPending && a.isRefetching === b.isRefetching && a.refetch === b.refetch;
}
const useAuthQuery = (initializedAtom, path, $fetch, options) => {
  const value = /* @__PURE__ */ atom({
    data: null,
    error: null,
    isPending: true,
    isRefetching: false,
    refetch: (queryParams) => fn(queryParams)
  });
  withEquality(value, isAuthQueryStateEqual);
  const fn = async (queryParams) => {
    return new Promise((resolve) => {
      const opts = typeof options === "function" ? options({
        data: value.get().data,
        error: value.get().error,
        isPending: value.get().isPending
      }) : options;
      $fetch(path, {
        ...opts,
        query: {
          ...opts?.query,
          ...queryParams?.query
        },
        async onSuccess(context) {
          const current = value.get();
          const stableData = current.data != null && context.data != null && isJsonEqual(current.data, context.data) ? current.data : context.data;
          value.set({
            data: stableData,
            error: null,
            isPending: false,
            isRefetching: false,
            refetch: value.value.refetch
          });
          await opts?.onSuccess?.(context);
        },
        async onError(context) {
          const { request } = context;
          const retryAttempts = typeof request.retry === "number" ? request.retry : request.retry?.attempts;
          const retryAttempt = request.retryAttempt || 0;
          if (retryAttempts && retryAttempt < retryAttempts) return;
          const isUnauthorized = context.error.status === 401;
          value.set({
            error: context.error,
            data: isUnauthorized ? null : value.get().data,
            isPending: false,
            isRefetching: false,
            refetch: value.value.refetch
          });
          await opts?.onError?.(context);
        },
        async onRequest(context) {
          const currentValue = value.get();
          value.set({
            isPending: currentValue.data === null,
            data: currentValue.data,
            error: null,
            isRefetching: true,
            refetch: value.value.refetch
          });
          await opts?.onRequest?.(context);
        }
      }).catch((error) => {
        value.set({
          error,
          data: value.get().data,
          isPending: false,
          isRefetching: false,
          refetch: value.value.refetch
        });
      }).finally(() => {
        resolve(void 0);
      });
    });
  };
  initializedAtom = Array.isArray(initializedAtom) ? initializedAtom : [initializedAtom];
  let isInitialized = false;
  const cleanups = [];
  for (const initAtom of initializedAtom) {
    const unbind = initAtom.subscribe(async () => {
      if (isServer()) return;
      if (isInitialized) await fn();
      else onMount(value, () => {
        const timeoutId = setTimeout(async () => {
          if (!isInitialized) {
            isInitialized = true;
            await fn();
          }
        }, 0);
        return () => {
          for (const u of cleanups) u();
          clearTimeout(timeoutId);
        };
      });
    });
    cleanups.push(unbind);
  }
  return value;
};
const clientSideHasPermission = (input) => {
  return hasPermissionFn(input, input.options.roles || defaultRoles);
};
const organizationClient = (options) => {
  const $listOrg = /* @__PURE__ */ atom(false);
  const $activeOrgSignal = /* @__PURE__ */ atom(false);
  const $activeMemberSignal = /* @__PURE__ */ atom(false);
  const $activeMemberRoleSignal = /* @__PURE__ */ atom(false);
  const roles = {
    admin: adminAc,
    member: memberAc,
    owner: ownerAc,
    ...options?.roles
  };
  return {
    id: "organization",
    version: PACKAGE_VERSION,
    $InferServerPlugin: {},
    getActions: ($fetch, _$store, co) => ({
      $Infer: {
        ActiveOrganization: {},
        Organization: {},
        Invitation: {},
        Member: {},
        Team: {}
      },
      organization: { checkRolePermission: (data) => {
        return clientSideHasPermission({
          role: data.role,
          options: {
            ac: options?.ac,
            roles
          },
          permissions: data.permissions
        });
      } }
    }),
    getAtoms: ($fetch) => {
      const listOrganizations = useAuthQuery($listOrg, "/organization/list", $fetch, { method: "GET" });
      return {
        $listOrg,
        $activeOrgSignal,
        $activeMemberSignal,
        $activeMemberRoleSignal,
        activeOrganization: useAuthQuery([$activeOrgSignal], "/organization/get-full-organization", $fetch, () => ({ method: "GET" })),
        listOrganizations,
        activeMember: useAuthQuery([$activeOrgSignal, $activeMemberSignal], "/organization/get-active-member", $fetch, { method: "GET" }),
        activeMemberRole: useAuthQuery([$activeOrgSignal, $activeMemberRoleSignal], "/organization/get-active-member-role", $fetch, { method: "GET" })
      };
    },
    pathMethods: {
      "/organization/get-full-organization": "GET",
      "/organization/list-user-teams": "GET"
    },
    atomListeners: [
      {
        matcher(path) {
          return path === "/organization/create" || path === "/organization/delete" || path === "/organization/update";
        },
        signal: "$listOrg"
      },
      {
        matcher(path) {
          return path === "/sign-out" || path.startsWith("/organization");
        },
        signal: "$activeOrgSignal"
      },
      {
        matcher(path) {
          return path.startsWith("/organization/set-active") || path === "/organization/create" || path === "/organization/delete" || path === "/organization/remove-member" || path === "/organization/leave" || path === "/organization/accept-invitation";
        },
        signal: "$sessionSignal"
      },
      {
        matcher(path) {
          return path.includes("/organization/update-member-role") || path.startsWith("/organization/set-active");
        },
        signal: "$activeMemberSignal"
      },
      {
        matcher(path) {
          return path.includes("/organization/update-member-role") || path.startsWith("/organization/set-active");
        },
        signal: "$activeMemberRoleSignal"
      }
    ],
    $ERROR_CODES: ORGANIZATION_ERROR_CODES
  };
};
const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : "",
  plugins: [
    apiKeyClient(),
    organizationClient(),
    genericOAuthClient(),
    inferAdditionalFields()
  ]
});
const { useSession } = authClient;
function signOutAndRedirect() {
  const signInHref = getSignInHrefForLocation(window.location);
  captureClientEvent("auth:sign_out");
  resetAnalyticsUser();
  void authClient.signOut({
    fetchOptions: {
      onSuccess: () => {
        window.location.assign(signInHref);
      }
    }
  });
}
function LaunchView(props) {
  if (!isHostedClientAuthMode()) {
    return /* @__PURE__ */ jsx(LaunchContent, { ...props, isFreePlan: false });
  }
  return /* @__PURE__ */ jsx(HostedLaunchView, { ...props });
}
function HostedLaunchView(props) {
  const { data: session } = useSession();
  const customerQuery = useCustomer({
    queryOptions: {
      enabled: Boolean(session?.user?.id)
    }
  });
  const isFreePlan = customerQuery.data != null && getCustomerPlanStatus(customerQuery.data) === "free";
  return /* @__PURE__ */ jsx(LaunchContent, { ...props, isFreePlan });
}
function LaunchContent({
  projectId,
  isFreePlan,
  onAuditStarted
}) {
  const controller = useLaunchController({
    projectId,
    isFreePlan,
    onAuditStarted
  });
  return /* @__PURE__ */ jsx("div", { className: "px-4 py-4 md:px-6 md:py-6 pb-24 md:pb-8 overflow-auto", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-5xl space-y-4", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold", children: "Site Audit" }),
    /* @__PURE__ */ jsx(
      LaunchFormCard,
      {
        launchForm: controller.launchForm,
        commitMaxPagesInput: controller.commitMaxPagesInput,
        maxPagesLimit: controller.maxPagesLimit
      }
    ),
    /* @__PURE__ */ jsx(
      AuditHistorySection,
      {
        projectId,
        history: controller.historyQuery.data ?? [],
        isLoading: controller.historyQuery.isLoading,
        onDelete: controller.deleteAudit
      }
    )
  ] }) });
}
function buildCsv(headers, rows) {
  const normalizedRows = rows.map(
    (row) => row.map((value) => normalizeExportValue(value ?? ""))
  );
  return Papa.unparse(
    {
      fields: headers,
      data: normalizedRows
    },
    {
      quotes: true,
      newline: "\n"
    }
  );
}
function normalizeExportValue(value) {
  const normalized = typeof value === "number" ? roundExportNumber(value) : value;
  return sanitizeCsvValue(normalized ?? "");
}
function roundExportNumber(value) {
  if (!Number.isFinite(value)) return value;
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
function sanitizeCsvValue(value) {
  if (typeof value !== "string" || value.length === 0) {
    return value;
  }
  if (["=", "+", "-", "@", "	", "\r", "\n"].includes(value[0])) {
    return `'${value}`;
  }
  return value;
}
function downloadCsv(filename, content) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
function downloadFile(content, filename, mime) {
  const blob = new Blob([content], { type: `${mime};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
async function copyTableToClipboard(headers, rows) {
  if (typeof navigator === "undefined" || !navigator.clipboard?.write) {
    throw new Error("Clipboard API not available in this browser.");
  }
  const safeRows = rows.map(
    (row) => row.map((value) => normalizeExportValue(value ?? ""))
  );
  const tsv = buildTsv(headers, safeRows);
  const html = buildHtmlTable(headers, safeRows);
  await navigator.clipboard.write([
    new ClipboardItem({
      "text/plain": Promise.resolve(new Blob([tsv], { type: "text/plain" })),
      "text/html": Promise.resolve(new Blob([html], { type: "text/html" }))
    })
  ]);
}
function buildTsv(headers, rows) {
  const lines = [headers.map(tsvCell).join("	")];
  for (const row of rows) {
    lines.push(row.map(tsvCell).join("	"));
  }
  return lines.join("\n");
}
function tsvCell(value) {
  if (typeof value !== "string") return String(value);
  return value.replace(/[\t\r\n]+/g, " ");
}
function buildHtmlTable(headers, rows) {
  const thead = `<thead><tr>${headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("")}</tr></thead>`;
  const tbody = `<tbody>${rows.map(
    (row) => `<tr>${row.map((cell) => `<td>${escapeHtmlCell(cell)}</td>`).join("")}</tr>`
  ).join("")}</tbody>`;
  return `<table>${thead}${tbody}</table>`;
}
function escapeHtmlCell(value) {
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  if (isLinkableUrl(value)) {
    const safeValue = escapeHtml(value);
    return `<a href="${escapeHtml(value)}">${safeValue}</a>`;
  }
  return escapeHtml(value);
}
function isLinkableUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
function escapeHtml(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
const listeners = /* @__PURE__ */ new Set();
function emit() {
  for (const listener of listeners) listener();
}
function setState(next) {
  emit();
}
async function exportTableToSheets(args) {
  const { headers, rows, feature } = args;
  if (rows.length === 0) {
    toast.error("No data to export");
    return;
  }
  try {
    await copyTableToClipboard(headers, rows);
    captureClientEvent("data:export_sheets", {
      source_feature: feature,
      result_count: rows.length
    });
    setState({ isOpen: true, rowCount: rows.length });
  } catch (error) {
    toast.error(getStandardErrorMessage(error, "Could not copy to clipboard"));
  }
}
const ISSUES_HEADERS = ["Severity", "Issue", "URL", "Details", "How To Fix"];
function issuesRows(issues) {
  return issues.map((issue) => {
    const descriptor = getIssueDescriptor(issue.issueType);
    return [
      issue.severity,
      descriptor?.title ?? issue.issueType,
      issue.pageUrl,
      issue.detailsJson ?? "",
      descriptor?.howToFix ?? ""
    ];
  });
}
function exportIssues(issues, format) {
  if (format === "json") {
    const rows = issues.map((issue) => {
      const descriptor = getIssueDescriptor(issue.issueType);
      return {
        severity: issue.severity,
        issueType: issue.issueType,
        issue: descriptor?.title ?? issue.issueType,
        url: issue.pageUrl,
        details: issue.detailsJson ? JSON.parse(issue.detailsJson) : null,
        howToFix: descriptor?.howToFix ?? null
      };
    });
    downloadFile(
      JSON.stringify(rows, null, 2),
      "audit-issues.json",
      "application/json"
    );
    return;
  }
  if (format === "sheets") {
    void exportTableToSheets({
      headers: ISSUES_HEADERS,
      rows: issuesRows(issues),
      feature: "audit_issues"
    });
    return;
  }
  downloadCsv("audit-issues.csv", buildCsv(ISSUES_HEADERS, issuesRows(issues)));
}
const PAGES_HEADERS = [
  "URL",
  "Status",
  "Title",
  "H1",
  "Words",
  "Images",
  "Missing Alt",
  "Response Time (ms)"
];
function pagesRows(pages) {
  return pages.map((page) => [
    page.url,
    page.statusCode,
    page.title ?? "",
    page.h1Count,
    page.wordCount,
    page.imagesTotal,
    page.imagesMissingAlt,
    page.responseTimeMs
  ]);
}
const PERFORMANCE_HEADERS = [
  "URL",
  "Device",
  "Performance",
  "Accessibility",
  "SEO",
  "LCP (ms)",
  "CLS",
  "INP (ms)",
  "TTFB (ms)"
];
function performanceRows(lighthouse, pages) {
  return lighthouse.map((result) => {
    const page = pages.find((candidate) => candidate.id === result.pageId);
    return [
      page?.url ?? "",
      result.strategy,
      result.performanceScore,
      result.accessibilityScore,
      result.seoScore,
      result.lcpMs,
      result.cls,
      result.inpMs,
      result.ttfbMs
    ];
  });
}
function exportPages(pages, format) {
  if (format === "json") {
    const rows = pages.map((page) => ({
      url: page.url,
      statusCode: page.statusCode,
      title: page.title ?? "",
      h1Count: page.h1Count,
      wordCount: page.wordCount,
      imagesTotal: page.imagesTotal,
      imagesMissingAlt: page.imagesMissingAlt,
      responseTimeMs: page.responseTimeMs
    }));
    downloadFile(
      JSON.stringify(rows, null, 2),
      "audit-pages.json",
      "application/json"
    );
    return;
  }
  if (format === "sheets") {
    void exportTableToSheets({
      headers: PAGES_HEADERS,
      rows: pagesRows(pages),
      feature: "audit_pages"
    });
    return;
  }
  downloadCsv("audit-pages.csv", buildCsv(PAGES_HEADERS, pagesRows(pages)));
}
function exportPerformance(lighthouse, pages, format) {
  if (format === "json") {
    const rows2 = lighthouse.map((result) => {
      const page = pages.find((candidate) => candidate.id === result.pageId);
      return {
        url: page?.url ?? "",
        strategy: result.strategy,
        performance: result.performanceScore,
        accessibility: result.accessibilityScore,
        seo: result.seoScore,
        lcpMs: result.lcpMs,
        cls: result.cls,
        inpMs: result.inpMs,
        ttfbMs: result.ttfbMs
      };
    });
    downloadFile(
      JSON.stringify(rows2, null, 2),
      "audit-performance.json",
      "application/json"
    );
    return;
  }
  const rows = performanceRows(lighthouse, pages);
  if (format === "sheets") {
    void exportTableToSheets({
      headers: PERFORMANCE_HEADERS,
      rows,
      feature: "audit_performance"
    });
    return;
  }
  downloadCsv("audit-performance.csv", buildCsv(PERFORMANCE_HEADERS, rows));
}
const EMPTY_PAGES_FILTERS = {
  query: "",
  status: "all",
  minWords: "",
  maxWords: "",
  minResponseMs: "",
  maxResponseMs: "",
  missingAlt: "all"
};
const EMPTY_PERFORMANCE_FILTERS = {
  query: "",
  device: "all",
  status: "all",
  minPerf: "",
  maxPerf: "",
  minSeo: "",
  maxSeo: "",
  maxLcpSeconds: ""
};
function hasMissingLighthouseScores(row) {
  return row.performanceScore == null && row.accessibilityScore == null && row.bestPracticesScore == null && row.seoScore == null;
}
function isLighthouseFailure(row) {
  return !!row.errorMessage || hasMissingLighthouseScores(row);
}
function filterPages(rows, filters) {
  const query = filters.query.trim().toLowerCase();
  return rows.filter((row) => {
    if (query) {
      const haystack = [row.url, row.title, row.metaDescription].filter(Boolean).join(" ").toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    if (!matchesStatus(row.statusCode, filters.status)) return false;
    if (!matchesRange(row.wordCount, filters.minWords, filters.maxWords)) {
      return false;
    }
    if (!matchesRange(
      row.responseTimeMs,
      filters.minResponseMs,
      filters.maxResponseMs
    )) {
      return false;
    }
    if (filters.missingAlt === "yes" && row.imagesMissingAlt <= 0) {
      return false;
    }
    if (filters.missingAlt === "no" && row.imagesMissingAlt > 0) {
      return false;
    }
    return true;
  });
}
function filterPerformanceRows(rows, filters) {
  const query = filters.query.trim().toLowerCase();
  return rows.filter((row) => {
    if (query) {
      const haystack = [row.pageUrl, row.pagePath].filter(Boolean).join(" ");
      if (!haystack.toLowerCase().includes(query)) return false;
    }
    if (filters.device !== "all" && row.strategy !== filters.device) {
      return false;
    }
    if (filters.status === "ok" && isLighthouseFailure(row)) return false;
    if (filters.status === "failed" && !isLighthouseFailure(row)) return false;
    if (!matchesRange(row.performanceScore, filters.minPerf, filters.maxPerf)) {
      return false;
    }
    if (!matchesRange(row.seoScore, filters.minSeo, filters.maxSeo)) {
      return false;
    }
    const maxLcpSeconds = parseFilterNumber(filters.maxLcpSeconds);
    if (maxLcpSeconds != null && (row.lcpMs == null || row.lcpMs / 1e3 > maxLcpSeconds)) {
      return false;
    }
    return true;
  });
}
function matchesStatus(statusCode, status) {
  if (status === "all") return true;
  if (status === "missing") return statusCode == null;
  if (statusCode == null) return false;
  if (status === "ok") return statusCode >= 200 && statusCode < 300;
  if (status === "redirect") return statusCode >= 300 && statusCode < 400;
  return statusCode >= 400;
}
function matchesRange(value, minRaw, maxRaw) {
  const min = parseFilterNumber(minRaw);
  const max = parseFilterNumber(maxRaw);
  if (min == null && max == null) return true;
  if (value == null) return false;
  if (min != null && value < min) return false;
  if (max != null && value > max) return false;
  return true;
}
function parseFilterNumber(value) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}
function nullableNumberSort(left, right, columnId) {
  const a = left.getValue(columnId);
  const b = right.getValue(columnId);
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  return a - b;
}
function nullableStringSort(left, right, columnId) {
  const a = left.getValue(columnId);
  const b = right.getValue(columnId);
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  return a.localeCompare(b);
}
const MAX_RENDERED_URLS = 100;
const SEVERITY_DOT = {
  critical: "bg-error",
  warning: "bg-warning",
  info: "bg-base-content/30"
};
const SEVERITY_RULE = {
  critical: "border-l-error/60",
  warning: "border-l-warning/60",
  info: "border-l-base-content/20"
};
const SEVERITY_LABEL = {
  critical: "Critical",
  warning: "Warning",
  info: "Info"
};
function resolveIssueSeverity(issue) {
  const descriptor = getIssueDescriptor(issue.issueType);
  if (descriptor) return descriptor.severity;
  return issue.severity === "critical" || issue.severity === "warning" ? issue.severity : "info";
}
function groupIssues(issues) {
  const groups = /* @__PURE__ */ new Map();
  for (const issue of issues) {
    let group = groups.get(issue.issueType);
    if (!group) {
      const descriptor = getIssueDescriptor(issue.issueType);
      group = {
        issueType: issue.issueType,
        severity: resolveIssueSeverity(issue),
        title: descriptor?.title ?? issue.issueType,
        explanation: descriptor?.explanation ?? "",
        howToFix: descriptor?.howToFix ?? "",
        issues: []
      };
      groups.set(issue.issueType, group);
    }
    group.issues.push(issue);
  }
  return Array.from(groups.values()).toSorted(
    (a, b) => ISSUE_SEVERITY_ORDER[a.severity] - ISSUE_SEVERITY_ORDER[b.severity] || b.issues.length - a.issues.length
  );
}
function IssuesView({ issues }) {
  const groups = useMemo(() => groupIssues(issues), [issues]);
  const sections = useMemo(
    () => ["critical", "warning", "info"].map((severity) => ({
      severity,
      groups: groups.filter((group) => group.severity === severity)
    })).filter((section) => section.groups.length > 0),
    [groups]
  );
  if (issues.length === 0) {
    return /* @__PURE__ */ jsxs("div", { className: "py-10 text-center text-base-content/60", children: [
      /* @__PURE__ */ jsx("p", { className: "font-medium", children: "No issues recorded for this audit." }),
      /* @__PURE__ */ jsx("p", { className: "text-sm mt-1", children: "Either the site is in great shape, or this audit ran before issue checks existed — run a new audit to get the full report." })
    ] });
  }
  return /* @__PURE__ */ jsx("div", { className: "border border-base-300 rounded-lg overflow-hidden", children: sections.map((section) => /* @__PURE__ */ jsx(IssueSection, { section }, section.severity)) });
}
function IssueSection({
  section
}) {
  const issueCount = section.groups.reduce(
    (sum, group) => sum + group.issues.length,
    0
  );
  return /* @__PURE__ */ jsxs("div", { className: "border-t border-base-300 first:border-t-0", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 bg-base-200/60 px-4 py-1.5 border-b border-base-300/60", children: [
      /* @__PURE__ */ jsx(
        "span",
        {
          className: `size-1.5 rounded-full ${SEVERITY_DOT[section.severity]}`
        }
      ),
      /* @__PURE__ */ jsx("span", { className: "text-[11px] font-semibold uppercase tracking-wider text-base-content/60", children: SEVERITY_LABEL[section.severity] }),
      /* @__PURE__ */ jsx("span", { className: "text-[11px] tabular-nums text-base-content/40", children: issueCount })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "divide-y divide-base-300/60", children: section.groups.map((group) => /* @__PURE__ */ jsx(IssueRow, { group }, group.issueType)) })
  ] });
}
function IssueRow({ group }) {
  const [open, setOpen] = useState(false);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: open ? `border-l-2 ${SEVERITY_RULE[group.severity]} bg-base-200/20` : "border-l-2 border-l-transparent",
      children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            className: "w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-base-200/40 transition-colors",
            onClick: () => setOpen((value) => !value),
            "aria-expanded": open,
            children: [
              /* @__PURE__ */ jsx(
                "span",
                {
                  className: `size-2 shrink-0 rounded-full ${SEVERITY_DOT[group.severity]}`
                }
              ),
              /* @__PURE__ */ jsx("span", { className: "text-sm font-medium flex-1 min-w-0 truncate", children: group.title }),
              /* @__PURE__ */ jsxs("span", { className: "text-xs tabular-nums text-base-content/50 shrink-0", children: [
                group.issues.length,
                " ",
                group.issues.length === 1 ? "page" : "pages"
              ] }),
              /* @__PURE__ */ jsx(
                ChevronRight,
                {
                  className: `size-4 shrink-0 text-base-content/40 transition-transform ${open ? "rotate-90" : ""}`
                }
              )
            ]
          }
        ),
        open && /* @__PURE__ */ jsxs("div", { className: "pl-9 pr-4 pb-4 pt-0.5 space-y-3", children: [
          group.explanation && /* @__PURE__ */ jsx("p", { className: "text-sm text-base-content/70 max-w-prose", children: group.explanation }),
          group.howToFix && /* @__PURE__ */ jsxs("p", { className: "text-sm max-w-prose", children: [
            /* @__PURE__ */ jsx("span", { className: "font-medium", children: "How to fix: " }),
            /* @__PURE__ */ jsx("span", { className: "text-base-content/80", children: group.howToFix })
          ] }),
          /* @__PURE__ */ jsx(AffectedUrlList, { issues: group.issues })
        ] })
      ]
    }
  );
}
function AffectedUrlList({ issues }) {
  const rendered = issues.slice(0, MAX_RENDERED_URLS);
  const remaining = issues.length - rendered.length;
  return /* @__PURE__ */ jsxs("div", { className: "max-h-[320px] overflow-y-auto rounded border border-base-300/60 bg-base-100", children: [
    rendered.map((issue) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: "px-3 py-1.5 text-sm flex flex-col gap-0.5 border-b border-base-300/50 last:border-b-0",
        children: [
          /* @__PURE__ */ jsx(
            "a",
            {
              className: "link link-hover text-base-content/80 truncate",
              href: issue.pageUrl,
              target: "_blank",
              rel: "noreferrer",
              title: issue.pageUrl,
              children: issue.pageUrl
            }
          ),
          /* @__PURE__ */ jsx(IssueDetails, { detailsJson: issue.detailsJson })
        ]
      },
      issue.id
    )),
    remaining > 0 && /* @__PURE__ */ jsxs("div", { className: "px-3 py-2 text-xs text-base-content/50", children: [
      "…and ",
      remaining,
      " more — export the issues CSV for the full list."
    ] })
  ] });
}
function parseDetails(detailsJson) {
  try {
    const parsed = JSON.parse(detailsJson);
    if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
      return Object.entries(parsed);
    }
    return null;
  } catch {
    return null;
  }
}
function IssueDetails({ detailsJson }) {
  const details = useMemo(
    () => detailsJson ? parseDetails(detailsJson) : null,
    [detailsJson]
  );
  if (!details) return null;
  const entries = details.filter(
    ([, value]) => value !== null && value !== void 0
  );
  if (entries.length === 0) return null;
  return /* @__PURE__ */ jsx("span", { className: "text-xs text-base-content/50 truncate", children: entries.map(([key, value]) => {
    const rendered = Array.isArray(value) ? value.join(" → ") : String(value);
    return `${key}: ${rendered}`;
  }).join(" · ") });
}
function applyShiftRangeSelection(event, row, table, anchorRef) {
  if (!event.shiftKey || !anchorRef.current) {
    anchorRef.current = {
      id: row.id,
      selected: !row.getIsSelected()
    };
    return false;
  }
  const rows = table.getRowModel().rows;
  const anchorIndex = rows.findIndex((candidate) => {
    return candidate.id === anchorRef.current?.id;
  });
  const currentIndex = rows.findIndex((candidate) => candidate.id === row.id);
  if (anchorIndex === -1 || currentIndex === -1) {
    anchorRef.current = {
      id: row.id,
      selected: !row.getIsSelected()
    };
    return false;
  }
  event.preventDefault();
  const [from, to] = anchorIndex < currentIndex ? [anchorIndex, currentIndex] : [currentIndex, anchorIndex];
  const selected = anchorRef.current.selected;
  table.setRowSelection((currentSelection) => {
    const nextSelection = { ...currentSelection };
    for (let index = from; index <= to; index++) {
      const rangeRow = rows[index];
      if (!rangeRow) continue;
      if (selected) {
        nextSelection[rangeRow.id] = true;
      } else {
        delete nextSelection[rangeRow.id];
      }
    }
    return nextSelection;
  });
  anchorRef.current = { id: row.id, selected };
  return true;
}
function useAppTable(options) {
  const { withSorting, withExpanded, withPagination, ...tableOptions } = options;
  return useReactTable({
    ...tableOptions,
    getCoreRowModel: getCoreRowModel(),
    ...withSorting ? { getSortedRowModel: getSortedRowModel() } : {},
    ...withExpanded ? { getExpandedRowModel: getExpandedRowModel() } : {},
    ...withPagination ? { getPaginationRowModel: getPaginationRowModel() } : {}
  });
}
function useSelectionAnchor() {
  return useRef(null);
}
function makeSelectionColumn(anchorRef) {
  return {
    id: "select",
    size: 32,
    enableSorting: false,
    header: ({ table }) => /* @__PURE__ */ jsx(
      "input",
      {
        type: "checkbox",
        className: "checkbox checkbox-xs [--radius-selector:0.25rem]",
        checked: table.getIsAllRowsSelected(),
        onChange: table.getToggleAllRowsSelectedHandler(),
        "aria-label": "Select all rows"
      }
    ),
    cell: ({ row, table }) => /* @__PURE__ */ jsx(SelectionCheckbox, { row, table, anchorRef })
  };
}
function SelectionCheckbox({
  row,
  table,
  anchorRef
}) {
  const rangeHandledRef = useRef(false);
  return /* @__PURE__ */ jsx(
    "input",
    {
      type: "checkbox",
      className: "checkbox checkbox-xs [--radius-selector:0.25rem]",
      checked: row.getIsSelected(),
      "aria-label": "Select row",
      onClick: (event) => {
        event.stopPropagation();
        rangeHandledRef.current = applyShiftRangeSelection(
          event,
          row,
          table,
          anchorRef
        );
      },
      onChange: (event) => {
        if (rangeHandledRef.current) {
          rangeHandledRef.current = false;
          return;
        }
        row.getToggleSelectedHandler()(event);
      }
    }
  );
}
function AppDataTable({
  table,
  className = "table table-sm",
  wrapperClassName = "overflow-x-auto",
  empty,
  isLoading,
  loading,
  getRowClassName,
  getRowProps,
  getCellClassName,
  fixedLayout,
  stickyHeader
}) {
  if (isLoading && loading) return /* @__PURE__ */ jsx(Fragment, { children: loading });
  if (table.getRowModel().rows.length === 0 && empty) return /* @__PURE__ */ jsx(Fragment, { children: empty });
  return /* @__PURE__ */ jsx("div", { className: wrapperClassName, children: /* @__PURE__ */ jsxs(
    "table",
    {
      className,
      style: fixedLayout ? { tableLayout: "fixed" } : void 0,
      children: [
        fixedLayout ? /* @__PURE__ */ jsx("colgroup", { children: table.getVisibleLeafColumns().map((column) => /* @__PURE__ */ jsx("col", { style: { width: column.getSize() } }, column.id)) }) : null,
        /* @__PURE__ */ jsx("thead", { children: table.getHeaderGroups().map((headerGroup) => /* @__PURE__ */ jsx("tr", { children: headerGroup.headers.map((header) => /* @__PURE__ */ jsx(
          HeaderCell,
          {
            header,
            fixedLayout,
            stickyHeader
          },
          header.id
        )) }, headerGroup.id)) }),
        /* @__PURE__ */ jsx("tbody", { children: table.getRowModel().rows.map((row) => {
          const rowProps = getRowProps?.(row);
          return /* @__PURE__ */ jsx(
            "tr",
            {
              onClick: rowProps?.onClick,
              className: [getRowClassName?.(row), rowProps?.className].filter(Boolean).join(" "),
              children: row.getVisibleCells().map((cell) => {
                const metaClass = cell.column.columnDef.meta?.cellClassName;
                return /* @__PURE__ */ jsx(
                  "td",
                  {
                    className: [
                      typeof metaClass === "function" ? metaClass(row) : metaClass,
                      getCellClassName?.(row, cell.column.id)
                    ].filter(Boolean).join(" "),
                    children: flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )
                  },
                  cell.id
                );
              })
            },
            row.id
          );
        }) })
      ]
    }
  ) });
}
function HeaderCell({
  header,
  fixedLayout,
  stickyHeader
}) {
  const meta = header.column.columnDef.meta;
  return /* @__PURE__ */ jsx(
    "th",
    {
      className: [
        stickyHeader ? "bg-base-200" : void 0,
        meta?.headerClassName
      ].filter(Boolean).join(" "),
      style: fixedLayout ? { width: header.getSize() } : void 0,
      children: header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())
    }
  );
}
function scoreTierClass(value) {
  if (value == null) return "score-tier-na";
  if (value <= 20) return "score-tier-1";
  if (value <= 35) return "score-tier-2";
  if (value <= 50) return "score-tier-3";
  if (value <= 65) return "score-tier-4";
  if (value <= 80) return "score-tier-5";
  return "score-tier-6";
}
function parseTerms(value) {
  return value.toLowerCase().split(/[,+]/).map((term) => term.trim()).filter(Boolean);
}
function formatNumber(value) {
  if (value == null) return "-";
  return new Intl.NumberFormat().format(value);
}
function formatCompactNumber(value) {
  if (value == null) return "-";
  return new Intl.NumberFormat(void 0, {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value);
}
function FloatingTooltip({
  id,
  position,
  children
}) {
  return /* @__PURE__ */ jsx(
    "span",
    {
      id,
      role: "tooltip",
      className: "pointer-events-none fixed z-[1000] w-max max-w-64 -translate-x-1/2 -translate-y-full rounded-md border border-base-300 bg-base-100 px-2.5 py-2 text-[11px] font-normal normal-case leading-snug text-base-content shadow-md",
      style: { left: position.left, top: position.top },
      children
    }
  );
}
function useFloatingTooltip({
  delayMs = 150,
  enabled = true
} = {}) {
  const tooltipId = useId();
  const triggerRef = useRef(null);
  const timeoutRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const updatePosition = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPosition({
      top: rect.top - 8,
      left: rect.left + rect.width / 2
    });
  };
  const clearOpenTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };
  const open = () => {
    if (!enabled) return;
    updatePosition();
    setIsOpen(true);
  };
  const scheduleOpen = () => {
    if (!enabled) return;
    clearOpenTimeout();
    timeoutRef.current = setTimeout(() => {
      open();
      timeoutRef.current = null;
    }, delayMs);
  };
  const close = () => {
    clearOpenTimeout();
    setIsOpen(false);
  };
  useEffect(() => clearOpenTimeout, []);
  useEffect(() => {
    if (!isOpen) return;
    updatePosition();
    const handleReposition = () => updatePosition();
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);
    return () => {
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [isOpen]);
  return {
    close,
    isOpen,
    open,
    position,
    scheduleOpen,
    tooltipId,
    triggerRef
  };
}
function HeaderHelpLabel({
  label,
  helpText,
  delayMs = 150
}) {
  const tooltip = useFloatingTooltip({ delayMs });
  return /* @__PURE__ */ jsxs(
    "span",
    {
      ref: tooltip.triggerRef,
      className: "relative inline-flex items-center",
      onMouseEnter: tooltip.scheduleOpen,
      onMouseLeave: tooltip.close,
      onFocus: tooltip.scheduleOpen,
      onBlur: tooltip.close,
      onKeyDown: (e) => {
        if (e.key === "Escape") tooltip.close();
      },
      "aria-describedby": tooltip.isOpen ? tooltip.tooltipId : void 0,
      children: [
        /* @__PURE__ */ jsx("span", { children: label }),
        tooltip.isOpen && typeof document !== "undefined" ? createPortal(
          /* @__PURE__ */ jsx(FloatingTooltip, { id: tooltip.tooltipId, position: tooltip.position, children: helpText }),
          document.body
        ) : null
      ]
    }
  );
}
function AreaTrendChart({ trend }) {
  const sorted = sortBy(trend, (item) => item.year * 100 + item.month);
  const last12 = sorted.slice(-12);
  const containerRef = useRef(null);
  const [chartWidth, setChartWidth] = useState(0);
  if (last12.length === 0) return null;
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const update = () => {
      setChartWidth(container.clientWidth);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(container);
    return () => {
      observer.disconnect();
    };
  }, []);
  const monthLabels = [
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
  const data = last12.map((m) => ({
    month: monthLabels[m.month - 1],
    year: m.year,
    searchVolume: m.searchVolume,
    label: `${monthLabels[m.month - 1]} ${m.year}`
  }));
  return /* @__PURE__ */ jsx(
    "div",
    {
      ref: containerRef,
      className: "w-full h-[210px] min-w-0",
      "aria-label": "Search trend chart",
      children: chartWidth > 0 ? /* @__PURE__ */ jsxs(
        AreaChart,
        {
          width: chartWidth,
          height: 210,
          data,
          margin: { top: 8, right: 8, left: 0, bottom: 4 },
          accessibilityLayer: true,
          children: [
            /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", { id: "trendGrad", x1: "0", y1: "0", x2: "0", y2: "1", children: [
              /* @__PURE__ */ jsx(
                "stop",
                {
                  offset: "0%",
                  stopColor: "var(--color-primary)",
                  stopOpacity: "var(--trend-fill-start-opacity)"
                }
              ),
              /* @__PURE__ */ jsx(
                "stop",
                {
                  offset: "100%",
                  stopColor: "var(--color-primary)",
                  stopOpacity: "var(--trend-fill-end-opacity)"
                }
              )
            ] }) }),
            /* @__PURE__ */ jsx(
              CartesianGrid,
              {
                stroke: "var(--trend-grid-color)",
                strokeDasharray: "2 4",
                vertical: true,
                horizontal: true
              }
            ),
            /* @__PURE__ */ jsx(
              XAxis,
              {
                dataKey: "month",
                tick: { fill: "var(--trend-axis-color)", fontSize: 11 },
                axisLine: false,
                tickLine: false
              }
            ),
            /* @__PURE__ */ jsx(
              YAxis,
              {
                tickFormatter: (value) => formatCompactNumber(Number(value)),
                tick: { fill: "var(--trend-axis-color)", fontSize: 11 },
                width: 44,
                axisLine: false,
                tickLine: false
              }
            ),
            /* @__PURE__ */ jsx(
              Tooltip,
              {
                contentStyle: {
                  backgroundColor: "var(--trend-tooltip-bg)",
                  border: "1px solid var(--trend-tooltip-border)",
                  borderRadius: "10px",
                  boxShadow: "0 8px 24px var(--trend-tooltip-shadow)",
                  color: "var(--color-base-content)"
                }
              }
            ),
            /* @__PURE__ */ jsx(
              Area,
              {
                type: "monotone",
                dataKey: "searchVolume",
                name: "Search volume",
                stroke: "var(--color-primary)",
                strokeWidth: 2,
                fill: "url(#trendGrad)",
                isAnimationActive: false,
                dot: { r: 3, fill: "var(--color-primary)", strokeWidth: 0 },
                activeDot: { r: 5, fill: "var(--color-primary)" }
              }
            )
          ]
        }
      ) : null
    }
  );
}
function SortHeader({
  label,
  helpText,
  field,
  current,
  dir,
  onToggle,
  className
}) {
  const isActive = field === current;
  const tooltip = useFloatingTooltip({
    enabled: !!helpText
  });
  return /* @__PURE__ */ jsxs(
    "button",
    {
      ref: tooltip.triggerRef,
      className: `inline-flex items-center gap-0.5 hover:text-primary transition-colors cursor-pointer select-none ${className ?? ""}`,
      onClick: () => onToggle(field),
      onMouseEnter: tooltip.scheduleOpen,
      onMouseLeave: tooltip.close,
      onFocus: tooltip.scheduleOpen,
      onBlur: tooltip.close,
      onKeyDown: (e) => {
        if (e.key === "Escape") tooltip.close();
      },
      "aria-describedby": tooltip.isOpen && helpText ? tooltip.tooltipId : void 0,
      children: [
        label,
        isActive && (dir === "asc" ? /* @__PURE__ */ jsx(ChevronUp, { className: "size-3" }) : /* @__PURE__ */ jsx(ChevronDown, { className: "size-3" })),
        tooltip.isOpen && helpText && typeof document !== "undefined" ? createPortal(
          /* @__PURE__ */ jsx(FloatingTooltip, { id: tooltip.tooltipId, position: tooltip.position, children: helpText }),
          document.body
        ) : null
      ]
    }
  );
}
function SortableHeader({
  column,
  label,
  helpText,
  align
}) {
  const sorted = column.getIsSorted();
  const content = /* @__PURE__ */ jsxs(
    "button",
    {
      type: "button",
      className: "inline-flex items-center gap-1 font-medium transition-colors hover:text-base-content",
      onClick: column.getToggleSortingHandler(),
      "aria-label": `Sort by ${label}`,
      "aria-pressed": !!sorted,
      children: [
        helpText ? /* @__PURE__ */ jsx(HeaderHelpLabel, { label, helpText }) : label,
        sorted === "asc" ? /* @__PURE__ */ jsx(ArrowUp, { className: "size-3 shrink-0" }) : sorted === "desc" ? /* @__PURE__ */ jsx(ArrowDown, { className: "size-3 shrink-0" }) : null
      ]
    }
  );
  if (align === "right") {
    return /* @__PURE__ */ jsx("span", { className: "flex w-full justify-end", children: content });
  }
  return content;
}
function PagesFilterBar({
  filters,
  onChange,
  activeFilterCount,
  onReset
}) {
  return /* @__PURE__ */ jsxs(FilterPanel, { activeFilterCount, onReset, children: [
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-3 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsx(
        TextFilter,
        {
          label: "Search",
          value: filters.query,
          placeholder: "URL, title, meta",
          onChange: (query) => onChange({ ...filters, query })
        }
      ),
      /* @__PURE__ */ jsx(
        SelectFilter,
        {
          label: "Status",
          value: filters.status,
          onChange: (status) => onChange({ ...filters, status }),
          options: [
            ["all", "All"],
            ["ok", "2xx"],
            ["redirect", "3xx"],
            ["error", "4xx/5xx"],
            ["missing", "Missing"]
          ]
        }
      ),
      /* @__PURE__ */ jsx(
        SelectFilter,
        {
          label: "Alt text",
          value: filters.missingAlt,
          onChange: (missingAlt) => onChange({ ...filters, missingAlt }),
          options: [
            ["all", "All"],
            ["yes", "Missing alt"],
            ["no", "No missing alt"]
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-2 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsx(
        RangeFilter,
        {
          label: "Words",
          min: filters.minWords,
          max: filters.maxWords,
          onMinChange: (minWords) => onChange({ ...filters, minWords }),
          onMaxChange: (maxWords) => onChange({ ...filters, maxWords })
        }
      ),
      /* @__PURE__ */ jsx(
        RangeFilter,
        {
          label: "Speed ms",
          min: filters.minResponseMs,
          max: filters.maxResponseMs,
          onMinChange: (minResponseMs) => onChange({ ...filters, minResponseMs }),
          onMaxChange: (maxResponseMs) => onChange({ ...filters, maxResponseMs })
        }
      )
    ] })
  ] });
}
function PerformanceFilterBar({
  filters,
  onChange,
  activeFilterCount,
  onReset
}) {
  return /* @__PURE__ */ jsxs(FilterPanel, { activeFilterCount, onReset, children: [
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-3 lg:grid-cols-4", children: [
      /* @__PURE__ */ jsx(
        TextFilter,
        {
          label: "Search",
          value: filters.query,
          placeholder: "URL",
          onChange: (query) => onChange({ ...filters, query })
        }
      ),
      /* @__PURE__ */ jsx(
        SelectFilter,
        {
          label: "Device",
          value: filters.device,
          onChange: (device) => onChange({ ...filters, device }),
          options: [
            ["all", "All"],
            ["desktop", "Desktop"],
            ["mobile", "Mobile"]
          ]
        }
      ),
      /* @__PURE__ */ jsx(
        SelectFilter,
        {
          label: "Status",
          value: filters.status,
          onChange: (status) => onChange({ ...filters, status }),
          options: [
            ["all", "All"],
            ["ok", "OK"],
            ["failed", "Failed"]
          ]
        }
      ),
      /* @__PURE__ */ jsx(
        TextFilter,
        {
          label: "Max LCP s",
          value: filters.maxLcpSeconds,
          placeholder: "2.5",
          type: "number",
          onChange: (maxLcpSeconds) => onChange({ ...filters, maxLcpSeconds })
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-2 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsx(
        RangeFilter,
        {
          label: "Perf",
          min: filters.minPerf,
          max: filters.maxPerf,
          onMinChange: (minPerf) => onChange({ ...filters, minPerf }),
          onMaxChange: (maxPerf) => onChange({ ...filters, maxPerf })
        }
      ),
      /* @__PURE__ */ jsx(
        RangeFilter,
        {
          label: "SEO",
          min: filters.minSeo,
          max: filters.maxSeo,
          onMinChange: (minSeo) => onChange({ ...filters, minSeo }),
          onMaxChange: (maxSeo) => onChange({ ...filters, maxSeo })
        }
      )
    ] })
  ] });
}
function EmptyTableMessage({ label }) {
  return /* @__PURE__ */ jsx("div", { className: "py-6 text-center text-base-content/60", children: label });
}
function TableFilterToggle({
  showFilters,
  onToggle,
  activeFilterCount,
  resultCount,
  totalCount
}) {
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3 border-b border-base-300 px-4 py-2.5", children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        className: `btn btn-ghost btn-sm gap-1.5 ${showFilters ? "btn-active" : ""}`,
        onClick: onToggle,
        title: "Toggle filters",
        type: "button",
        children: [
          /* @__PURE__ */ jsx(SlidersHorizontal, { className: "size-3.5" }),
          "Filters",
          activeFilterCount > 0 ? /* @__PURE__ */ jsx("span", { className: "badge badge-xs badge-primary border-0 text-primary-content", children: activeFilterCount }) : null
        ]
      }
    ),
    /* @__PURE__ */ jsxs("span", { className: "text-sm tabular-nums text-base-content/60", children: [
      resultCount.toLocaleString(),
      " of ",
      totalCount.toLocaleString()
    ] })
  ] });
}
function countActiveFilters(filters, emptyFilters) {
  return Object.keys(filters).reduce((count, key) => {
    const filterKey = key;
    return filters[filterKey] !== emptyFilters[filterKey] ? count + 1 : count;
  }, 0);
}
function FilterPanel({
  activeFilterCount,
  onReset,
  children
}) {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-3 border-b border-base-300 bg-gradient-to-b from-base-100 to-base-200/30 px-4 py-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold", children: "Refine results" }),
        activeFilterCount > 0 ? /* @__PURE__ */ jsxs("span", { className: "badge badge-xs badge-primary border-0 text-primary-content", children: [
          activeFilterCount,
          " active"
        ] }) : null
      ] }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
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
    children
  ] });
}
function TextFilter({
  label,
  value,
  placeholder,
  type = "text",
  onChange
}) {
  return /* @__PURE__ */ jsxs("label", { className: "form-control gap-1.5", children: [
    /* @__PURE__ */ jsx("span", { className: "text-[11px] font-semibold uppercase tracking-wide text-base-content/60", children: label }),
    /* @__PURE__ */ jsx(
      "input",
      {
        className: "input input-bordered input-sm w-full bg-base-100",
        type,
        value,
        placeholder,
        onChange: (event) => onChange(event.target.value)
      }
    )
  ] });
}
function RangeFilter({
  label,
  min,
  max,
  onMinChange,
  onMaxChange
}) {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-2 rounded-lg border border-base-300 bg-base-100 p-2.5", children: [
    /* @__PURE__ */ jsx("p", { className: "text-[11px] font-semibold uppercase tracking-wide text-base-content/60", children: label }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          className: "input input-bordered input-xs bg-base-100",
          type: "number",
          value: min,
          placeholder: "Min",
          onChange: (event) => onMinChange(event.target.value)
        }
      ),
      /* @__PURE__ */ jsx(
        "input",
        {
          className: "input input-bordered input-xs bg-base-100",
          type: "number",
          value: max,
          placeholder: "Max",
          onChange: (event) => onMaxChange(event.target.value)
        }
      )
    ] })
  ] });
}
function SelectFilter({
  label,
  value,
  options,
  onChange
}) {
  return /* @__PURE__ */ jsxs("label", { className: "form-control gap-1.5", children: [
    /* @__PURE__ */ jsx("span", { className: "text-[11px] font-semibold uppercase tracking-wide text-base-content/60", children: label }),
    /* @__PURE__ */ jsx(
      "select",
      {
        className: "select select-bordered select-sm w-full bg-base-100",
        value,
        onChange: (event) => {
          const selected = options.find(
            ([optionValue]) => optionValue === event.target.value
          )?.[0];
          if (selected != null) onChange(selected);
        },
        children: options.map(([optionValue, optionLabel]) => /* @__PURE__ */ jsx("option", { value: optionValue, children: optionLabel }, optionValue))
      }
    )
  ] });
}
const pageColumnHelper = createColumnHelper();
function displayPath(url, canonicalHost) {
  const host = extractHostname(url);
  const path = extractPathname(url);
  return host === canonicalHost ? path : host + path;
}
function predominantHost(pages, startUrl) {
  const counts = /* @__PURE__ */ new Map();
  for (const page of pages) {
    if (page.statusCode === null || page.statusCode >= 300) continue;
    const host = extractHostname(page.url);
    counts.set(host, (counts.get(host) ?? 0) + 1);
  }
  let best = extractHostname(startUrl);
  let bestCount = 0;
  for (const [host, count] of counts) {
    if (count > bestCount) {
      best = host;
      bestCount = count;
    }
  }
  return best;
}
function isRedirect(row) {
  return row.statusCode !== null && row.statusCode >= 300 && row.statusCode < 400;
}
function hasAnalyzedContent(row) {
  return row.fetchClass === "ok" && !isRedirect(row);
}
const EmptyCell = () => /* @__PURE__ */ jsx("span", { className: "text-xs text-base-content/40", children: "-" });
function buildPagesColumns({
  canonicalHost,
  missingTitlePageIds
}) {
  return [
    pageColumnHelper.accessor("url", {
      header: ({ column }) => /* @__PURE__ */ jsx(SortableHeader, { column, label: "URL" }),
      cell: ({ getValue }) => {
        const url = getValue();
        return /* @__PURE__ */ jsxs(
          "a",
          {
            href: url,
            target: "_blank",
            rel: "noopener noreferrer",
            className: "link link-primary inline-flex items-center gap-1 text-xs",
            children: [
              /* @__PURE__ */ jsx("span", { className: "truncate", children: displayPath(url, canonicalHost) }),
              /* @__PURE__ */ jsx(ExternalLink, { className: "size-3 shrink-0" })
            ]
          }
        );
      },
      meta: { cellClassName: "max-w-[240px] truncate" }
    }),
    pageColumnHelper.accessor("statusCode", {
      header: ({ column }) => /* @__PURE__ */ jsx(SortableHeader, { column, label: "Status" }),
      cell: ({ getValue }) => /* @__PURE__ */ jsx(HttpStatusBadge, { code: getValue() }),
      sortingFn: nullableNumberSort
    }),
    pageColumnHelper.accessor("title", {
      header: ({ column }) => /* @__PURE__ */ jsx(SortableHeader, { column, label: "Title" }),
      cell: ({ getValue, row }) => {
        if (isRedirect(row.original)) {
          const target = row.original.redirectUrl;
          return /* @__PURE__ */ jsxs("span", { className: "text-xs text-base-content/60", children: [
            "→ ",
            target ? displayPath(target, canonicalHost) : "redirect"
          ] });
        }
        const title = getValue();
        if (title) {
          return /* @__PURE__ */ jsx("span", { className: "break-words", children: title });
        }
        return missingTitlePageIds.has(row.original.id) ? /* @__PURE__ */ jsx("span", { className: "text-error text-xs", children: "missing" }) : /* @__PURE__ */ jsx(EmptyCell, {});
      },
      sortingFn: nullableStringSort,
      meta: { cellClassName: "max-w-[360px]" }
    }),
    pageColumnHelper.accessor("h1Count", {
      header: ({ column }) => /* @__PURE__ */ jsx(SortableHeader, { column, label: "H1" }),
      cell: ({ getValue, row }) => hasAnalyzedContent(row.original) ? getValue() : /* @__PURE__ */ jsx(EmptyCell, {})
    }),
    pageColumnHelper.accessor("wordCount", {
      header: ({ column }) => /* @__PURE__ */ jsx(SortableHeader, { column, label: "Words" }),
      cell: ({ getValue, row }) => hasAnalyzedContent(row.original) ? getValue() : /* @__PURE__ */ jsx(EmptyCell, {})
    }),
    pageColumnHelper.display({
      id: "images",
      header: ({ column }) => /* @__PURE__ */ jsx(SortableHeader, { column, label: "Images" }),
      cell: ({ row }) => {
        if (!hasAnalyzedContent(row.original)) return /* @__PURE__ */ jsx(EmptyCell, {});
        return row.original.imagesMissingAlt > 0 ? /* @__PURE__ */ jsxs("span", { className: "text-warning", children: [
          row.original.imagesMissingAlt,
          "/",
          row.original.imagesTotal
        ] }) : row.original.imagesTotal;
      },
      enableSorting: true,
      sortingFn: (left, right) => left.original.imagesMissingAlt - right.original.imagesMissingAlt || left.original.imagesTotal - right.original.imagesTotal
    }),
    pageColumnHelper.accessor("responseTimeMs", {
      header: ({ column }) => /* @__PURE__ */ jsx(SortableHeader, { column, label: "Speed" }),
      cell: ({ getValue }) => {
        const value = getValue();
        return value ? /* @__PURE__ */ jsxs("span", { className: "text-xs", children: [
          value,
          "ms"
        ] }) : /* @__PURE__ */ jsx(EmptyCell, {});
      },
      sortingFn: nullableNumberSort
    })
  ];
}
function PagesTable({
  pages,
  startUrl,
  issues
}) {
  const [filters, setFilters] = useState(EMPTY_PAGES_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [sorting, setSorting] = useState([
    { id: "url", desc: false }
  ]);
  const activeFilterCount = countActiveFilters(filters, EMPTY_PAGES_FILTERS);
  const filteredPages = useMemo(
    () => filterPages(pages, filters),
    [filters, pages]
  );
  const columns = useMemo(
    () => buildPagesColumns({
      canonicalHost: predominantHost(pages, startUrl),
      missingTitlePageIds: new Set(
        issues.filter((issue) => issue.issueType === "missing-title").map((issue) => issue.pageId).filter((pageId) => pageId !== null)
      )
    }),
    [issues, pages, startUrl]
  );
  const table = useAppTable({
    data: filteredPages,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    withSorting: true
  });
  return /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsx(
      TableFilterToggle,
      {
        showFilters,
        onToggle: () => setShowFilters((current) => !current),
        activeFilterCount,
        resultCount: filteredPages.length,
        totalCount: pages.length
      }
    ),
    showFilters ? /* @__PURE__ */ jsx(
      PagesFilterBar,
      {
        filters,
        onChange: setFilters,
        activeFilterCount,
        onReset: () => setFilters(EMPTY_PAGES_FILTERS)
      }
    ) : null,
    /* @__PURE__ */ jsx(
      AppDataTable,
      {
        table,
        className: "table table-sm",
        empty: /* @__PURE__ */ jsx(EmptyTableMessage, { label: "No pages match these filters." })
      }
    )
  ] });
}
function TableBulkActionBar({
  selectedCount,
  selectedLabel = "selected",
  actions,
  onClear,
  placement = "fixed"
}) {
  if (selectedCount === 0) return null;
  const wrapperClass = placement === "fixed" ? "pointer-events-none fixed inset-x-0 bottom-6 z-30 flex justify-center px-4" : "flex justify-center";
  const toolbarClass = placement === "fixed" ? "pointer-events-auto flex items-stretch overflow-visible rounded-xl border border-base-content/15 bg-base-300/85 shadow-2xl backdrop-blur" : "flex items-stretch overflow-visible rounded-xl border border-base-content/15 bg-base-200";
  return /* @__PURE__ */ jsx("div", { className: wrapperClass, children: /* @__PURE__ */ jsxs("div", { role: "toolbar", "aria-label": "Bulk actions", className: toolbarClass, children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 border-r border-base-content/10 px-3 py-2 text-sm", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          "aria-label": "Clear selection",
          className: "-ml-1 rounded p-1 text-base-content/55 hover:bg-base-content/10 hover:text-base-content",
          onClick: onClear,
          children: /* @__PURE__ */ jsx(X, { className: "size-3.5" })
        }
      ),
      /* @__PURE__ */ jsx("span", { className: "font-medium tabular-nums", children: selectedCount }),
      /* @__PURE__ */ jsx("span", { className: "text-base-content/60", children: selectedLabel })
    ] }),
    actions
  ] }) });
}
function TableBulkActionButton({
  icon,
  children,
  onClick,
  disabled,
  variant = "default"
}) {
  const color = variant === "danger" ? "text-error hover:bg-error/10" : "text-base-content/85 hover:bg-base-content/10";
  return /* @__PURE__ */ jsxs(
    "button",
    {
      type: "button",
      onClick,
      disabled,
      className: `inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm disabled:opacity-50 ${color}`,
      children: [
        icon,
        children
      ]
    }
  );
}
function TableBulkExportMenu({
  actions,
  busy
}) {
  return /* @__PURE__ */ jsxs("div", { className: "dropdown dropdown-top dropdown-end", children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        tabIndex: 0,
        disabled: busy,
        "aria-haspopup": "menu",
        className: "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-base-content/85 hover:bg-base-content/10 disabled:opacity-50",
        children: [
          busy ? /* @__PURE__ */ jsx(Loader2, { className: "size-3.5 animate-spin" }) : /* @__PURE__ */ jsx(Download, { className: "size-3.5" }),
          "Export",
          /* @__PURE__ */ jsx(ChevronDown, { className: "size-3 opacity-60" })
        ]
      }
    ),
    /* @__PURE__ */ jsx(
      "ul",
      {
        tabIndex: 0,
        role: "menu",
        className: "dropdown-content menu z-10 mb-2 w-52 rounded-box border border-base-300 bg-base-100 p-2 shadow-lg",
        children: actions.map((action, index) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: action.onClick,
            disabled: busy || action.disabled,
            children: [
              action.icon,
              action.label
            ]
          }
        ) }, index))
      }
    )
  ] });
}
function TableExportMenu({
  actions,
  buttonClassName = "btn btn-sm gap-1",
  menuClassName = "dropdown-content z-10 menu p-2 shadow-lg bg-base-100 border border-base-300 rounded-box w-56"
}) {
  return /* @__PURE__ */ jsxs("div", { className: "dropdown dropdown-end", children: [
    /* @__PURE__ */ jsxs("div", { tabIndex: 0, role: "button", className: buttonClassName, children: [
      /* @__PURE__ */ jsx(Download, { className: "size-4" }),
      "Export",
      /* @__PURE__ */ jsx(ChevronDown, { className: "size-3 opacity-60" })
    ] }),
    /* @__PURE__ */ jsx("ul", { tabIndex: 0, className: menuClassName, children: actions.map((action, index) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        onClick: action.onClick,
        disabled: action.disabled,
        children: [
          action.icon,
          action.label
        ]
      }
    ) }, index)) })
  ] });
}
const performanceColumnHelper = createColumnHelper();
function PerformanceTable({
  auditId,
  projectId,
  lighthouse,
  pages
}) {
  const [filters, setFilters] = useState(
    EMPTY_PERFORMANCE_FILTERS
  );
  const [showFilters, setShowFilters] = useState(false);
  const [sorting, setSorting] = useState([
    { id: "performanceScore", desc: false }
  ]);
  const rows = useMemo(
    () => lighthouse.map((result) => {
      const page = pages.find((candidate) => candidate.id === result.pageId);
      const pageUrl = page?.url ?? null;
      return {
        ...result,
        pageUrl,
        pagePath: pageUrl ? extractPathname(pageUrl) : null
      };
    }),
    [lighthouse, pages]
  );
  const filteredRows = useMemo(
    () => filterPerformanceRows(rows, filters),
    [filters, rows]
  );
  const activeFilterCount = countActiveFilters(
    filters,
    EMPTY_PERFORMANCE_FILTERS
  );
  const columns = useMemo(
    () => buildPerformanceColumns({ auditId, projectId }),
    [auditId, projectId]
  );
  const table = useAppTable({
    data: filteredRows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    withSorting: true
  });
  return /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsx(
      TableFilterToggle,
      {
        showFilters,
        onToggle: () => setShowFilters((current) => !current),
        activeFilterCount,
        resultCount: filteredRows.length,
        totalCount: rows.length
      }
    ),
    showFilters ? /* @__PURE__ */ jsx(
      PerformanceFilterBar,
      {
        filters,
        onChange: setFilters,
        activeFilterCount,
        onReset: () => setFilters(EMPTY_PERFORMANCE_FILTERS)
      }
    ) : null,
    /* @__PURE__ */ jsx(
      AppDataTable,
      {
        table,
        className: "table table-sm",
        empty: /* @__PURE__ */ jsx(EmptyTableMessage, { label: "No performance results match these filters." })
      }
    )
  ] });
}
function buildPerformanceColumns({
  auditId,
  projectId
}) {
  return [
    performanceColumnHelper.accessor("pagePath", {
      header: ({ column }) => /* @__PURE__ */ jsx(SortableHeader, { column, label: "URL" }),
      cell: ({ getValue }) => /* @__PURE__ */ jsx("span", { className: "text-xs", children: getValue() ?? "-" }),
      sortingFn: nullableStringSort,
      meta: { cellClassName: "max-w-[180px] truncate" }
    }),
    performanceColumnHelper.accessor("strategy", {
      header: ({ column }) => /* @__PURE__ */ jsx(SortableHeader, { column, label: "Device" }),
      cell: ({ getValue }) => /* @__PURE__ */ jsx("span", { className: "capitalize text-xs", children: getValue() })
    }),
    performanceColumnHelper.display({
      id: "status",
      header: ({ column }) => /* @__PURE__ */ jsx(SortableHeader, { column, label: "Status" }),
      cell: ({ row }) => {
        const isFailed = isLighthouseFailure(row.original);
        const failureMessage = row.original.errorMessage ?? "Lighthouse returned no category scores";
        return isFailed ? /* @__PURE__ */ jsx(
          "span",
          {
            className: "badge badge-error badge-outline text-xs",
            title: failureMessage,
            children: "failed"
          }
        ) : /* @__PURE__ */ jsx("span", { className: "badge badge-success badge-outline text-xs", children: "ok" });
      },
      enableSorting: true,
      sortingFn: (left, right) => Number(isLighthouseFailure(left.original)) - Number(isLighthouseFailure(right.original))
    }),
    performanceColumnHelper.accessor("performanceScore", {
      header: ({ column }) => /* @__PURE__ */ jsx(SortableHeader, { column, label: "Perf" }),
      cell: ({ getValue }) => /* @__PURE__ */ jsx(LighthouseScoreBadge, { score: getValue() }),
      sortingFn: nullableNumberSort
    }),
    performanceColumnHelper.accessor("accessibilityScore", {
      header: ({ column }) => /* @__PURE__ */ jsx(SortableHeader, { column, label: "A11y" }),
      cell: ({ getValue }) => /* @__PURE__ */ jsx(LighthouseScoreBadge, { score: getValue() }),
      sortingFn: nullableNumberSort
    }),
    performanceColumnHelper.accessor("seoScore", {
      header: ({ column }) => /* @__PURE__ */ jsx(SortableHeader, { column, label: "SEO" }),
      cell: ({ getValue }) => /* @__PURE__ */ jsx(LighthouseScoreBadge, { score: getValue() }),
      sortingFn: nullableNumberSort
    }),
    performanceColumnHelper.accessor("lcpMs", {
      header: ({ column }) => /* @__PURE__ */ jsx(SortableHeader, { column, label: "LCP" }),
      cell: ({ getValue }) => {
        const value = getValue();
        return value ? /* @__PURE__ */ jsxs("span", { className: "text-xs", children: [
          (value / 1e3).toFixed(1),
          "s"
        ] }) : /* @__PURE__ */ jsx("span", { className: "text-xs text-base-content/40", children: "-" });
      },
      sortingFn: nullableNumberSort
    }),
    performanceColumnHelper.accessor("cls", {
      header: ({ column }) => /* @__PURE__ */ jsx(SortableHeader, { column, label: "CLS" }),
      cell: ({ getValue }) => {
        const value = getValue();
        return value != null ? /* @__PURE__ */ jsx("span", { className: "text-xs", children: value.toFixed(3) }) : /* @__PURE__ */ jsx("span", { className: "text-xs text-base-content/40", children: "-" });
      },
      sortingFn: nullableNumberSort
    }),
    performanceColumnHelper.accessor("inpMs", {
      header: ({ column }) => /* @__PURE__ */ jsx(SortableHeader, { column, label: "INP" }),
      cell: ({ getValue }) => {
        const value = getValue();
        return value ? /* @__PURE__ */ jsxs("span", { className: "text-xs", children: [
          Math.round(value),
          "ms"
        ] }) : /* @__PURE__ */ jsx("span", { className: "text-xs text-base-content/40", children: "-" });
      },
      sortingFn: nullableNumberSort
    }),
    performanceColumnHelper.accessor("ttfbMs", {
      header: ({ column }) => /* @__PURE__ */ jsx(SortableHeader, { column, label: "TTFB" }),
      cell: ({ getValue }) => {
        const value = getValue();
        return value ? /* @__PURE__ */ jsxs("span", { className: "text-xs", children: [
          Math.round(value),
          "ms"
        ] }) : /* @__PURE__ */ jsx("span", { className: "text-xs text-base-content/40", children: "-" });
      },
      sortingFn: nullableNumberSort
    }),
    performanceColumnHelper.display({
      id: "issues",
      header: () => "Issues",
      cell: ({ row }) => row.original.r2Key && !isLighthouseFailure(row.original) ? /* @__PURE__ */ jsx(
        Link,
        {
          className: "btn btn-primary btn-xs",
          to: "/p/$projectId/audit/issues/$resultId",
          params: { projectId, resultId: row.original.id },
          search: { auditId, category: "performance" },
          children: "View issues"
        }
      ) : /* @__PURE__ */ jsx("span", { className: "text-xs text-base-content/40", children: "-" })
    })
  ];
}
function ExportDropdown({
  onExport
}) {
  return /* @__PURE__ */ jsx(
    TableExportMenu,
    {
      buttonClassName: "btn btn-sm btn-ghost gap-1",
      menuClassName: "dropdown-content z-10 menu p-2 shadow-lg bg-base-100 border border-base-300 rounded-box w-52",
      actions: [
        { label: "Export to Sheets", onClick: () => onExport("sheets") },
        { label: "CSV", onClick: () => onExport("csv") },
        { label: "JSON", onClick: () => onExport("json") }
      ]
    }
  );
}
function ResultsView({
  projectId,
  data,
  onTabChange,
  tab
}) {
  const { audit, pages, lighthouse, issues } = data;
  const hasPerformanceTab = lighthouse.length > 0;
  const activeTab = tab === "performance" && !hasPerformanceTab ? "issues" : tab;
  const stats = useResultStats(pages, lighthouse);
  const blockedCount = useMemo(
    () => pages.filter((page) => page.fetchClass === "blocked").length,
    [pages]
  );
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    blockedCount > 0 && /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/5 px-4 py-3 text-sm", children: [
      /* @__PURE__ */ jsx(ShieldAlert, { className: "mt-0.5 size-4 shrink-0 text-warning" }),
      /* @__PURE__ */ jsxs("p", { children: [
        /* @__PURE__ */ jsxs("span", { className: "font-medium", children: [
          "We were blocked on ",
          blockedCount,
          " ",
          blockedCount === 1 ? "page" : "pages",
          "."
        ] }),
        " ",
        /* @__PURE__ */ jsxs("span", { className: "text-base-content/70", children: [
          "The site's bot protection challenged our crawler, so those pages couldn't be audited. We don't have a workaround for this yet. Desktop crawlers run from your own machine and usually get past it: try",
          " ",
          /* @__PURE__ */ jsx(
            "a",
            {
              className: "link link-primary",
              href: "https://github.com/PhialsBasement/LibreCrawl",
              target: "_blank",
              rel: "noreferrer",
              children: "LibreCrawl"
            }
          ),
          " ",
          "(free, open source) or",
          " ",
          /* @__PURE__ */ jsx(
            "a",
            {
              className: "link link-primary",
              href: "https://www.screamingfrog.co.uk/seo-spider/",
              target: "_blank",
              rel: "noreferrer",
              children: "Screaming Frog"
            }
          ),
          " ",
          "(free up to 500 URLs)."
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      StatsStrip,
      {
        pagesCrawled: audit.pagesCrawled,
        issues,
        totalLighthouse: lighthouse.length,
        averageResponseMs: stats.averageResponseMs,
        lighthouseSummary: stats.lighthouseSummary
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "card bg-base-100 border border-base-300", children: /* @__PURE__ */ jsxs("div", { className: "card-body gap-3", children: [
      /* @__PURE__ */ jsx(
        ResultsHeader,
        {
          issueCount: issues.length,
          pageCount: pages.length,
          lighthouseCount: lighthouse.length,
          hasPerformanceTab,
          activeTab,
          onTabChange,
          onExport: (format) => {
            if (activeTab === "performance") {
              exportPerformance(lighthouse, pages, format);
              return;
            }
            if (activeTab === "issues") {
              exportIssues(issues, format);
              return;
            }
            exportPages(pages, format);
          }
        }
      ),
      activeTab === "issues" && /* @__PURE__ */ jsx(IssuesView, { issues }),
      activeTab === "pages" && /* @__PURE__ */ jsx(
        PagesTable,
        {
          pages,
          startUrl: audit.startUrl,
          issues
        }
      ),
      activeTab === "performance" && lighthouse.length > 0 && /* @__PURE__ */ jsx(
        PerformanceTable,
        {
          auditId: audit.id,
          projectId,
          lighthouse,
          pages
        }
      )
    ] }) })
  ] });
}
function useResultStats(pages, lighthouse) {
  const averageResponseMs = useMemo(() => {
    if (pages.length === 0) return 0;
    const total = pages.reduce(
      (sum, page) => sum + (page.responseTimeMs ?? 0),
      0
    );
    return Math.round(total / pages.length);
  }, [pages]);
  const lighthouseSummary = useMemo(() => {
    const failed = lighthouse.filter(
      (row) => isLighthouseFailure(row)
    ).length;
    const successful = lighthouse.filter(
      (row) => !isLighthouseFailure(row)
    );
    const averageScore = (key) => {
      const values = successful.map((row) => row[key]).filter((value) => value != null);
      if (values.length === 0) return null;
      const total = values.reduce((sum, value) => sum + value, 0);
      return Math.round(total / values.length);
    };
    return {
      failed,
      avgPerformance: averageScore("performanceScore"),
      avgSeo: averageScore("seoScore"),
      avgAccessibility: averageScore("accessibilityScore")
    };
  }, [lighthouse]);
  return { averageResponseMs, lighthouseSummary };
}
function ResultsHeader({
  issueCount,
  pageCount,
  lighthouseCount,
  hasPerformanceTab,
  activeTab,
  onTabChange,
  onExport
}) {
  const tabs = [
    { tab: "issues", label: `Issues (${issueCount})` },
    { tab: "pages", label: `Pages (${pageCount})` },
    ...hasPerformanceTab ? [
      {
        tab: "performance",
        label: `Performance (${lighthouseCount})`
      }
    ] : []
  ];
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col lg:flex-row lg:items-center justify-between gap-3", children: [
    /* @__PURE__ */ jsx("div", { role: "tablist", className: "tabs tabs-border w-fit", children: tabs.map(({ label, tab }) => {
      const isActive = activeTab === tab;
      return /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          role: "tab",
          "aria-selected": isActive,
          className: `tab ${isActive ? "tab-active" : ""}`,
          onClick: () => onTabChange(tab),
          children: label
        },
        tab
      );
    }) }),
    /* @__PURE__ */ jsx(ExportDropdown, { onExport })
  ] });
}
function StatsStrip({
  pagesCrawled,
  issues,
  totalLighthouse,
  averageResponseMs,
  lighthouseSummary
}) {
  const severityCounts = useMemo(() => {
    const counts = { critical: 0, warning: 0, info: 0 };
    for (const issue of issues) {
      counts[resolveIssueSeverity(issue)] += 1;
    }
    return counts;
  }, [issues]);
  const items = [
    { label: "Pages crawled", value: String(pagesCrawled) },
    {
      label: "Issues found",
      value: String(issues.length),
      valueClass: issues.length === 0 ? "text-success" : "",
      sub: issues.length > 0 && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2.5", children: [
        /* @__PURE__ */ jsx(SeverityCount, { count: severityCounts.critical, dotClass: "bg-error" }),
        /* @__PURE__ */ jsx(SeverityCount, { count: severityCounts.warning, dotClass: "bg-warning" }),
        /* @__PURE__ */ jsx(
          SeverityCount,
          {
            count: severityCounts.info,
            dotClass: "bg-base-content/30"
          }
        )
      ] })
    },
    { label: "Avg response", value: `${averageResponseMs}ms` }
  ];
  if (totalLighthouse > 0) {
    items.push(
      { label: "Lighthouse tests", value: String(totalLighthouse) },
      {
        label: "Avg Lighthouse perf",
        value: lighthouseSummary.avgPerformance == null ? "-" : String(lighthouseSummary.avgPerformance),
        valueClass: scoreClass(lighthouseSummary.avgPerformance)
      },
      {
        label: "Avg Lighthouse SEO",
        value: lighthouseSummary.avgSeo == null ? "-" : String(lighthouseSummary.avgSeo),
        valueClass: scoreClass(lighthouseSummary.avgSeo)
      },
      {
        label: "Avg Lighthouse a11y",
        value: lighthouseSummary.avgAccessibility == null ? "-" : String(lighthouseSummary.avgAccessibility),
        valueClass: scoreClass(lighthouseSummary.avgAccessibility)
      },
      {
        label: "Lighthouse failures",
        value: String(lighthouseSummary.failed),
        valueClass: lighthouseSummary.failed > 0 ? "text-error" : "text-success"
      }
    );
  }
  const columnsClass = items.length === 3 ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2 md:grid-cols-4";
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: `grid ${columnsClass} gap-px rounded-lg border border-base-300 bg-base-300/70 overflow-hidden`,
      children: items.map((item) => /* @__PURE__ */ jsxs("div", { className: "bg-base-100 px-4 py-3", children: [
        /* @__PURE__ */ jsx("p", { className: "text-[11px] uppercase tracking-wider text-base-content/50", children: item.label }),
        /* @__PURE__ */ jsx(
          "p",
          {
            className: `text-xl font-semibold mt-0.5 tabular-nums ${item.valueClass ?? ""}`,
            children: item.value
          }
        ),
        item.sub && /* @__PURE__ */ jsx("div", { className: "text-xs text-base-content/60 mt-1", children: item.sub })
      ] }, item.label))
    }
  );
}
function SeverityCount({
  count,
  dotClass
}) {
  if (count === 0) return null;
  return /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 tabular-nums", children: [
    /* @__PURE__ */ jsx("span", { className: `size-1.5 rounded-full ${dotClass}` }),
    count
  ] });
}
function scoreClass(score) {
  if (score == null) return "";
  if (score >= 90) return "text-success";
  if (score >= 50) return "text-warning";
  return "text-error";
}
const Route$4 = createFileRoute(
  "/_project/p/$projectId/audit/"
)({
  validateSearch: auditSearchSchema,
  component: SiteAuditPage
});
function SiteAuditPage() {
  const { projectId } = Route$4.useParams();
  const { auditId, tab } = Route$4.useSearch();
  const navigate = useNavigate({ from: Route$4.fullPath });
  const setSearchParams = useCallback(
    (updates) => {
      void navigate({
        search: (prev) => ({ ...prev, ...updates }),
        replace: true
      });
    },
    [navigate]
  );
  if (!auditId) {
    return /* @__PURE__ */ jsx(
      LaunchView,
      {
        projectId,
        onAuditStarted: (id) => setSearchParams({ auditId: id })
      }
    );
  }
  return /* @__PURE__ */ jsx(
    AuditDetail,
    {
      projectId,
      auditId,
      tab,
      onBack: () => setSearchParams({ auditId: void 0 }),
      onTabChange: (nextTab) => setSearchParams({ tab: nextTab })
    }
  );
}
function AuditDetail({
  projectId,
  auditId,
  tab,
  onBack,
  onTabChange
}) {
  const statusQuery = useQuery({
    queryKey: ["audit-status", projectId, auditId],
    queryFn: () => getAuditStatus({ data: { projectId, auditId } }),
    refetchInterval: (query) => {
      const data = query.state.data;
      return data?.status === "running" ? 3e3 : false;
    }
  });
  const isComplete = statusQuery.data?.status === "completed";
  const isFailed = statusQuery.data?.status === "failed";
  const isRunning = statusQuery.data?.status === "running";
  const resultsQuery = useQuery({
    queryKey: ["audit-results", projectId, auditId],
    queryFn: () => getAuditResults({ data: { projectId, auditId } }),
    enabled: isComplete || isFailed
  });
  if (statusQuery.isLoading) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-20", children: /* @__PURE__ */ jsx("span", { className: "loading loading-spinner loading-lg" }) });
  }
  if (statusQuery.isError) {
    return /* @__PURE__ */ jsx("div", { className: "px-4 py-6 md:px-6", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-3xl space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "alert alert-error", children: [
        /* @__PURE__ */ jsx(AlertCircle, { className: "size-5" }),
        /* @__PURE__ */ jsx("span", { children: "We could not load this audit. It may have been deleted." })
      ] }),
      /* @__PURE__ */ jsx("button", { className: "btn btn-ghost btn-sm", onClick: onBack, children: "← Back to audits" })
    ] }) });
  }
  const status = statusQuery.data;
  const partialPageCount = isFailed ? resultsQuery.data?.pages.length ?? 0 : 0;
  const failedWithResults = isFailed && partialPageCount > 0;
  const showSupportCta = isFailed && resultsQuery.isSuccess && !failedWithResults || isComplete && status && status.pagesCrawled <= 1;
  return /* @__PURE__ */ jsx("div", { className: "px-4 py-4 md:px-6 md:py-6 pb-24 md:pb-8 overflow-auto", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-5xl space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsx("button", { className: "btn btn-ghost btn-sm px-0", onClick: onBack, children: "← All audits" }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-x-3 gap-y-1", children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold", children: status ? extractHostname(status.startUrl) : "Site Audit" }),
        status?.status !== "running" && status && /* @__PURE__ */ jsx(StatusBadge, { status: status.status })
      ] }),
      status && /* @__PURE__ */ jsxs("p", { className: "text-sm text-base-content/60", children: [
        "Site audit · Started ",
        formatStartedAt(status.startedAt)
      ] })
    ] }),
    isRunning && status && /* @__PURE__ */ jsx(
      ProgressCard,
      {
        projectId,
        auditId,
        status
      }
    ),
    showSupportCta && /* @__PURE__ */ jsxs(
      "div",
      {
        className: isFailed ? "alert alert-error" : "alert alert-warning",
        children: [
          /* @__PURE__ */ jsx(AlertCircle, { className: "size-5" }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium", children: "Site audit couldn't fully crawl this website." }),
            /* @__PURE__ */ jsxs("p", { children: [
              "Sorry! This site's bot protection blocked our crawler. We don't have a workaround for this yet. Desktop crawlers run from your own machine and usually get past it: try",
              " ",
              /* @__PURE__ */ jsx(
                "a",
                {
                  className: "link link-primary",
                  href: "https://github.com/PhialsBasement/LibreCrawl",
                  target: "_blank",
                  rel: "noreferrer",
                  children: "LibreCrawl"
                }
              ),
              " ",
              "(free, open source) or",
              " ",
              /* @__PURE__ */ jsx(
                "a",
                {
                  className: "link link-primary",
                  href: "https://www.screamingfrog.co.uk/seo-spider/",
                  target: "_blank",
                  rel: "noreferrer",
                  children: "Screaming Frog"
                }
              ),
              " ",
              "(free up to 500 URLs)."
            ] })
          ] })
        ]
      }
    ),
    failedWithResults && /* @__PURE__ */ jsxs("div", { className: "alert alert-warning", children: [
      /* @__PURE__ */ jsx(AlertCircle, { className: "size-5" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxs("p", { className: "font-medium", children: [
          "This audit stopped early after ",
          partialPageCount,
          " page",
          partialPageCount === 1 ? "" : "s",
          "."
        ] }),
        /* @__PURE__ */ jsxs("p", { children: [
          "The results below cover everything crawled before it stopped. Run a new audit to try again, or email",
          " ",
          /* @__PURE__ */ jsx(
            "a",
            {
              className: "link link-primary",
              href: `mailto:${SUPPORT_EMAIL}`,
              children: SUPPORT_EMAIL
            }
          ),
          " ",
          "if this keeps happening."
        ] })
      ] })
    ] }),
    (isComplete || failedWithResults) && resultsQuery.data && /* @__PURE__ */ jsx(
      ResultsView,
      {
        projectId,
        data: resultsQuery.data,
        tab,
        onTabChange
      }
    )
  ] }) });
}
function ProgressCard({
  projectId,
  auditId,
  status
}) {
  const crawlProgress = status.pagesTotal > 0 ? Math.round(status.pagesCrawled / status.pagesTotal * 100) : 0;
  const lighthouseDone = status.lighthouseCompleted + status.lighthouseFailed;
  const lighthouseProgress = status.lighthouseTotal > 0 ? Math.round(lighthouseDone / status.lighthouseTotal * 100) : 0;
  const isLighthousePhase = status.currentPhase === "lighthouse";
  const phaseLabel = status.currentPhase === "discovery" ? "Discovery" : status.currentPhase === "crawling" ? "Crawling" : status.currentPhase === "lighthouse" ? "Lighthouse" : status.currentPhase === "finalizing" ? "Finalizing" : status.currentPhase ?? "Running";
  const progress = isLighthousePhase ? lighthouseProgress : crawlProgress;
  const crawlProgressQuery = useQuery({
    queryKey: ["audit-crawl-progress", projectId, auditId],
    queryFn: () => getCrawlProgress({ data: { projectId, auditId } }),
    refetchInterval: 1500
  });
  const crawledUrls = crawlProgressQuery.data ?? [];
  return /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsx("div", { className: "card bg-base-100 border border-base-300", children: /* @__PURE__ */ jsxs("div", { className: "card-body gap-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("h2", { className: "font-medium flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Loader2, { className: "size-4 animate-spin text-primary" }),
          isLighthousePhase ? "Running Lighthouse checks" : "Crawling pages"
        ] }),
        /* @__PURE__ */ jsx("span", { className: "badge badge-ghost badge-sm", children: phaseLabel })
      ] }),
      /* @__PURE__ */ jsx(
        "progress",
        {
          className: "progress progress-primary w-full",
          value: progress,
          max: 100
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-sm", children: [
        isLighthousePhase ? /* @__PURE__ */ jsxs("span", { children: [
          lighthouseDone,
          " / ",
          status.lighthouseTotal,
          " checks",
          status.lighthouseFailed > 0 ? ` (${status.lighthouseFailed} failed)` : ""
        ] }) : /* @__PURE__ */ jsxs("span", { children: [
          status.pagesCrawled,
          " / ",
          status.pagesTotal,
          " pages"
        ] }),
        /* @__PURE__ */ jsxs("span", { className: "text-base-content/60", children: [
          progress,
          "%"
        ] })
      ] })
    ] }) }),
    crawledUrls.length > 0 && /* @__PURE__ */ jsx("div", { className: "card bg-base-100 border border-base-300", children: /* @__PURE__ */ jsxs("div", { className: "card-body gap-2 p-4", children: [
      /* @__PURE__ */ jsxs("h3", { className: "text-sm font-medium text-base-content/70", children: [
        "Crawled Pages (",
        crawledUrls.length,
        ")"
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "text-xs text-base-content/50", children: [
        "Updated ",
        new Date(crawledUrls[0].crawledAt).toLocaleTimeString()
      ] }),
      /* @__PURE__ */ jsx("div", { className: "max-h-[400px] overflow-y-auto -mx-1", children: crawledUrls.map((entry, i) => /* @__PURE__ */ jsx(
        ProgressRow,
        {
          entry,
          index: i
        },
        `${entry.url}-${entry.crawledAt}`
      )) })
    ] }) })
  ] });
}
function ProgressRow({
  entry,
  index
}) {
  const pathname = extractPathname(entry.url);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: `flex items-center justify-between gap-3 px-2 py-1.5 rounded text-sm ${index === 0 ? "bg-primary/5 animate-in fade-in slide-in-from-top-1 duration-300" : ""}`,
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 min-w-0 flex-1", children: [
          /* @__PURE__ */ jsx(HttpStatusBadge, { code: entry.statusCode }),
          /* @__PURE__ */ jsx("span", { className: "truncate text-base-content/80", title: entry.url, children: pathname })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex items-center gap-3 shrink-0", children: entry.title && /* @__PURE__ */ jsx(
          "span",
          {
            className: "text-xs text-base-content/40 truncate max-w-[260px] hidden md:block",
            title: entry.title,
            children: entry.title
          }
        ) })
      ]
    }
  );
}
const $$splitComponentImporter$3 = () => import("./integrations-BTESU-fN.js");
const Route$3 = createFileRoute("/_project/p/$projectId/settings/integrations")({
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./context-DylYexKT.js");
const Route$2 = createFileRoute("/_project/p/$projectId/settings/context")({
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./_configId-BjfS4u5J.js");
const Route$1 = createFileRoute("/_project/p/$projectId/rank-tracking/$configId")({
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./_resultId-CpDUwZTv.js");
const Route = createFileRoute("/_project/p/$projectId/audit/issues/$resultId")({
  validateSearch: lighthouseIssuesSearchSchema,
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const VerifyEmailRoute = Route$K.update({
  id: "/verify-email",
  path: "/verify-email",
  getParentRoute: () => Route$L
});
const ResetPasswordRoute = Route$J.update({
  id: "/reset-password",
  path: "/reset-password",
  getParentRoute: () => Route$L
});
const ForgotPasswordRoute = Route$I.update({
  id: "/forgot-password",
  path: "/forgot-password",
  getParentRoute: () => Route$L
});
const AuthenticatedRoute = Route$H.update({
  id: "/_authenticated",
  getParentRoute: () => Route$L
});
const AuthRoute = Route$G.update({
  id: "/_auth",
  getParentRoute: () => Route$L
});
const ProjectRouteRoute = Route$F.update({
  id: "/_project",
  getParentRoute: () => Route$L
});
const AppRouteRoute = Route$E.update({
  id: "/_app",
  getParentRoute: () => Route$L
});
const AppIndexRoute = Route$D.update({
  id: "/",
  path: "/",
  getParentRoute: () => AppRouteRoute
});
const ApiHealthRoute = Route$C.update({
  id: "/api/health",
  path: "/api/health",
  getParentRoute: () => Route$L
});
const AuthenticatedSubscribeRoute = Route$B.update({
  id: "/subscribe",
  path: "/subscribe",
  getParentRoute: () => AuthenticatedRoute
});
const AuthenticatedOauthConsentRoute = Route$A.update({
  id: "/oauth-consent",
  path: "/oauth-consent",
  getParentRoute: () => AuthenticatedRoute
});
const AuthSignUpRoute = Route$z.update({
  id: "/sign-up",
  path: "/sign-up",
  getParentRoute: () => AuthRoute
});
const AuthSignInRoute = Route$y.update({
  id: "/sign-in",
  path: "/sign-in",
  getParentRoute: () => AuthRoute
});
const AppSupportRoute = Route$x.update({
  id: "/support",
  path: "/support",
  getParentRoute: () => AppRouteRoute
});
const AppSettingsRoute = Route$w.update({
  id: "/settings",
  path: "/settings",
  getParentRoute: () => AppRouteRoute
});
const AppProjectsRoute = Route$v.update({
  id: "/projects",
  path: "/projects",
  getParentRoute: () => AppRouteRoute
});
const AppBillingRoute = Route$u.update({
  id: "/billing",
  path: "/billing",
  getParentRoute: () => AppRouteRoute
});
const AppAiRoute = Route$t.update({
  id: "/ai",
  path: "/ai",
  getParentRoute: () => AppRouteRoute
});
const Char91DotwellKnownChar93OpenaiAppsChallengeRoute = Route$s.update({
  id: "/.well-known/openai-apps-challenge",
  path: "/.well-known/openai-apps-challenge",
  getParentRoute: () => Route$L
});
const AuthenticatedOnboardingIndexRoute = Route$r.update({
  id: "/onboarding/",
  path: "/onboarding/",
  getParentRoute: () => AuthenticatedRoute
});
const ApiAutumnSplatRoute = Route$q.update({
  id: "/api/autumn/$",
  path: "/api/autumn/$",
  getParentRoute: () => Route$L
});
const ApiAuthSplatRoute = Route$p.update({
  id: "/api/auth/$",
  path: "/api/auth/$",
  getParentRoute: () => Route$L
});
const AuthenticatedOnboardingChatRoute = Route$o.update({
  id: "/onboarding/chat",
  path: "/onboarding/chat",
  getParentRoute: () => AuthenticatedRoute
});
const AppHelpOpenrouterApiKeyRoute = Route$n.update({
  id: "/help/openrouter-api-key",
  path: "/help/openrouter-api-key",
  getParentRoute: () => AppRouteRoute
});
const AppHelpDataforseoApiKeyRoute = Route$m.update({
  id: "/help/dataforseo-api-key",
  path: "/help/dataforseo-api-key",
  getParentRoute: () => AppRouteRoute
});
const ProjectPProjectIdRouteRoute = Route$l.update({
  id: "/p/$projectId",
  path: "/p/$projectId",
  getParentRoute: () => ProjectRouteRoute
});
const ProjectPProjectIdIndexRoute = Route$k.update({
  id: "/",
  path: "/",
  getParentRoute: () => ProjectPProjectIdRouteRoute
});
const ApiGscOauthCallbackRoute = Route$j.update({
  id: "/api/gsc/oauth/callback",
  path: "/api/gsc/oauth/callback",
  getParentRoute: () => Route$L
});
const ApiGa4OauthCallbackRoute = Route$i.update({
  id: "/api/ga4/oauth/callback",
  path: "/api/ga4/oauth/callback",
  getParentRoute: () => Route$L
});
const ProjectPProjectIdSettingsRoute = Route$h.update({
  id: "/settings",
  path: "/settings",
  getParentRoute: () => ProjectPProjectIdRouteRoute
});
const ProjectPProjectIdSearchPerformanceRoute = Route$g.update({
  id: "/search-performance",
  path: "/search-performance",
  getParentRoute: () => ProjectPProjectIdRouteRoute
});
const ProjectPProjectIdSavedRoute = Route$f.update({
  id: "/saved",
  path: "/saved",
  getParentRoute: () => ProjectPProjectIdRouteRoute
});
const ProjectPProjectIdSamRoute = Route$e.update({
  id: "/sam",
  path: "/sam",
  getParentRoute: () => ProjectPProjectIdRouteRoute
});
const ProjectPProjectIdRankTrackingRoute = Route$d.update({
  id: "/rank-tracking",
  path: "/rank-tracking",
  getParentRoute: () => ProjectPProjectIdRouteRoute
});
const ProjectPProjectIdPromptExplorerRoute = Route$c.update({
  id: "/prompt-explorer",
  path: "/prompt-explorer",
  getParentRoute: () => ProjectPProjectIdRouteRoute
});
const ProjectPProjectIdKeywordsRoute = Route$b.update({
  id: "/keywords",
  path: "/keywords",
  getParentRoute: () => ProjectPProjectIdRouteRoute
});
const ProjectPProjectIdDomainRoute = Route$a.update({
  id: "/domain",
  path: "/domain",
  getParentRoute: () => ProjectPProjectIdRouteRoute
});
const ProjectPProjectIdBrandLookupRoute = Route$9.update({
  id: "/brand-lookup",
  path: "/brand-lookup",
  getParentRoute: () => ProjectPProjectIdRouteRoute
});
const ProjectPProjectIdBacklinksRoute = Route$8.update({
  id: "/backlinks",
  path: "/backlinks",
  getParentRoute: () => ProjectPProjectIdRouteRoute
});
const ProjectPProjectIdAuditRoute = Route$7.update({
  id: "/audit",
  path: "/audit",
  getParentRoute: () => ProjectPProjectIdRouteRoute
});
const ProjectPProjectIdSettingsIndexRoute = Route$6.update({
  id: "/",
  path: "/",
  getParentRoute: () => ProjectPProjectIdSettingsRoute
});
const ProjectPProjectIdRankTrackingIndexRoute = Route$5.update({
  id: "/",
  path: "/",
  getParentRoute: () => ProjectPProjectIdRankTrackingRoute
});
const ProjectPProjectIdAuditIndexRoute = Route$4.update({
  id: "/",
  path: "/",
  getParentRoute: () => ProjectPProjectIdAuditRoute
});
const ProjectPProjectIdSettingsIntegrationsRoute = Route$3.update({
  id: "/integrations",
  path: "/integrations",
  getParentRoute: () => ProjectPProjectIdSettingsRoute
});
const ProjectPProjectIdSettingsContextRoute = Route$2.update({
  id: "/context",
  path: "/context",
  getParentRoute: () => ProjectPProjectIdSettingsRoute
});
const ProjectPProjectIdRankTrackingConfigIdRoute = Route$1.update({
  id: "/$configId",
  path: "/$configId",
  getParentRoute: () => ProjectPProjectIdRankTrackingRoute
});
const ProjectPProjectIdAuditIssuesResultIdRoute = Route.update({
  id: "/issues/$resultId",
  path: "/issues/$resultId",
  getParentRoute: () => ProjectPProjectIdAuditRoute
});
const AppRouteRouteChildren = {
  AppAiRoute,
  AppBillingRoute,
  AppProjectsRoute,
  AppSettingsRoute,
  AppSupportRoute,
  AppIndexRoute,
  AppHelpDataforseoApiKeyRoute,
  AppHelpOpenrouterApiKeyRoute
};
const AppRouteRouteWithChildren = AppRouteRoute._addFileChildren(
  AppRouteRouteChildren
);
const ProjectPProjectIdAuditRouteChildren = {
  ProjectPProjectIdAuditIndexRoute,
  ProjectPProjectIdAuditIssuesResultIdRoute
};
const ProjectPProjectIdAuditRouteWithChildren = ProjectPProjectIdAuditRoute._addFileChildren(
  ProjectPProjectIdAuditRouteChildren
);
const ProjectPProjectIdRankTrackingRouteChildren = {
  ProjectPProjectIdRankTrackingConfigIdRoute,
  ProjectPProjectIdRankTrackingIndexRoute
};
const ProjectPProjectIdRankTrackingRouteWithChildren = ProjectPProjectIdRankTrackingRoute._addFileChildren(
  ProjectPProjectIdRankTrackingRouteChildren
);
const ProjectPProjectIdSettingsRouteChildren = {
  ProjectPProjectIdSettingsContextRoute,
  ProjectPProjectIdSettingsIntegrationsRoute,
  ProjectPProjectIdSettingsIndexRoute
};
const ProjectPProjectIdSettingsRouteWithChildren = ProjectPProjectIdSettingsRoute._addFileChildren(
  ProjectPProjectIdSettingsRouteChildren
);
const ProjectPProjectIdRouteRouteChildren = {
  ProjectPProjectIdAuditRoute: ProjectPProjectIdAuditRouteWithChildren,
  ProjectPProjectIdBacklinksRoute,
  ProjectPProjectIdBrandLookupRoute,
  ProjectPProjectIdDomainRoute,
  ProjectPProjectIdKeywordsRoute,
  ProjectPProjectIdPromptExplorerRoute,
  ProjectPProjectIdRankTrackingRoute: ProjectPProjectIdRankTrackingRouteWithChildren,
  ProjectPProjectIdSamRoute,
  ProjectPProjectIdSavedRoute,
  ProjectPProjectIdSearchPerformanceRoute,
  ProjectPProjectIdSettingsRoute: ProjectPProjectIdSettingsRouteWithChildren,
  ProjectPProjectIdIndexRoute
};
const ProjectPProjectIdRouteRouteWithChildren = ProjectPProjectIdRouteRoute._addFileChildren(
  ProjectPProjectIdRouteRouteChildren
);
const ProjectRouteRouteChildren = {
  ProjectPProjectIdRouteRoute: ProjectPProjectIdRouteRouteWithChildren
};
const ProjectRouteRouteWithChildren = ProjectRouteRoute._addFileChildren(
  ProjectRouteRouteChildren
);
const AuthRouteChildren = {
  AuthSignInRoute,
  AuthSignUpRoute
};
const AuthRouteWithChildren = AuthRoute._addFileChildren(AuthRouteChildren);
const AuthenticatedRouteChildren = {
  AuthenticatedOauthConsentRoute,
  AuthenticatedSubscribeRoute,
  AuthenticatedOnboardingChatRoute,
  AuthenticatedOnboardingIndexRoute
};
const AuthenticatedRouteWithChildren = AuthenticatedRoute._addFileChildren(
  AuthenticatedRouteChildren
);
const rootRouteChildren = {
  AppRouteRoute: AppRouteRouteWithChildren,
  ProjectRouteRoute: ProjectRouteRouteWithChildren,
  AuthRoute: AuthRouteWithChildren,
  AuthenticatedRoute: AuthenticatedRouteWithChildren,
  ForgotPasswordRoute,
  ResetPasswordRoute,
  VerifyEmailRoute,
  Char91DotwellKnownChar93OpenaiAppsChallengeRoute,
  ApiHealthRoute,
  ApiAuthSplatRoute,
  ApiAutumnSplatRoute,
  ApiGa4OauthCallbackRoute,
  ApiGscOauthCallbackRoute
};
const routeTree = Route$L._addFileChildren(rootRouteChildren)._addFileTypes();
function getRouter() {
  const router2 = createRouter({
    routeTree,
    defaultPreload: "intent",
    defaultErrorComponent: DefaultCatchBoundary,
    defaultNotFoundComponent: () => /* @__PURE__ */ jsx(NotFound, {}),
    scrollRestoration: true
  });
  return router2;
}
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  saveOnboardingAnswers as $,
  AuthPageShell as A,
  scoreTierClass as B,
  useFloatingTooltip as C,
  downloadCsv as D,
  buildCsv as E,
  FloatingTooltip as F,
  Route$3 as G,
  queryClient as H,
  Route$z as I,
  Route$l as J,
  makeSelectionColumn as K,
  Route$6 as L,
  Route$5 as M,
  INTEREST_OPTIONS as N,
  ONBOARDING_LAST_STEP as O,
  PortalMenu as P,
  CLIENT_WEBSITE_COUNT_OPTIONS as Q,
  Route$K as R,
  SortableHeader as S,
  CLIENT_WORK_FOR as T,
  UnauthenticatedErrorCard as U,
  SOURCE_OPTIONS_HIDDEN_ON_MOBILE as V,
  WORK_FOR_OPTIONS as W,
  SOURCE_OPTIONS as X,
  onboardingAnswersQueryOptions as Y,
  restoreOnboardingAnswers as Z,
  Route$r as _,
  AuthPageCard as a,
  buildOnboardingPayload as a0,
  clampStep as a1,
  useSelectionAnchor as a2,
  useAppTable as a3,
  AppDataTable as a4,
  TableBulkActionBar as a5,
  TableBulkActionButton as a6,
  normalizeExportValue as a7,
  exportTableToSheets as a8,
  TableExportMenu as a9,
  Route$8 as aA,
  router as aB,
  Route$g as aa,
  Route$2 as ab,
  Route$e as ac,
  Route$c as ad,
  downloadFile as ae,
  Route as af,
  dismissGscNudge as ag,
  Route$k as ah,
  applyShiftRangeSelection as ai,
  HeaderHelpLabel as aj,
  parseTerms as ak,
  Route$9 as al,
  TableBulkExportMenu as am,
  Route$1 as an,
  Route$f as ao,
  formatNumber as ap,
  shouldValidateFieldOnChange as aq,
  createFormValidationErrors as ar,
  SortHeader as as,
  AreaTrendChart as at,
  isResultLimit as au,
  normalizeKeywordMode as av,
  Route$b as aw,
  normalizeSortDir as ax,
  normalizeSortField as ay,
  Route$a as az,
  authClient as b,
  captureClientEvent as c,
  Route$J as d,
  getFormError as e,
  getFieldError as f,
  getSignInSearch as g,
  Route$I as h,
  getCurrentAuthRedirectFromHref as i,
  getVerifyEmailSearch as j,
  Route$G as k,
  getCurrentAuthRedirect as l,
  createSsrRpc as m,
  normalizeAuthRedirect as n,
  useThemePreference as o,
  getStandardErrorMessage as p,
  getErrorCode as q,
  AuthConfigErrorCard as r,
  Route$B as s,
  getCustomerPlanStatus as t,
  useSession as u,
  signOutAndRedirect as v,
  Route$y as w,
  useAuthPageState as x,
  AuthMethodChooser as y,
  Route$h as z
};
