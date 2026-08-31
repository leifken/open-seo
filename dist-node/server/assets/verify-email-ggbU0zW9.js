import { jsx, jsxs } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { R as Route, n as normalizeAuthRedirect, u as useSession, c as captureClientEvent, A as AuthPageShell, a as AuthPageCard, g as getSignInSearch, b as authClient } from "./router-DHiBnyXs.js";
import { az as isHostedClientAuthMode, aA as isEmailVerificationBypassed } from "../entry.js";
import { z } from "zod";
import "lucide-react";
import "@tanstack/react-query";
import "./middleware-Doy-pxkJ.js";
import "@tanstack/query-core";
import "./selfHostedOAuth-C3UAQwsK.js";
import "drizzle-orm";
import "jose";
import "./ai-search-BV1mIqc0.js";
import "./audit-SZdMhI6q.js";
import "autumn-js/react";
import "react-dom";
import "@tanstack/react-form";
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
import "@modelcontextprotocol/client";
import "@modelcontextprotocol/client/validators/cf-worker";
import "@modelcontextprotocol/sdk/types.js";
import "node:diagnostics_channel";
import "drizzle-orm/d1";
import "drizzle-orm/sqlite-core";
import "drizzle-orm/postgres-js";
import "postgres";
import "drizzle-orm/pg-core";
import "jose/errors";
import "node:fs";
import "node:os";
import "@better-auth/api-key";
import "posthog-node";
import "@modelcontextprotocol/server";
import "tldts";
import "srvx";
import "@tanstack/react-router/ssr/server";
const verificationIssueSchema = z.enum(["invalid_token", "token_expired", "user_not_found", "unknown"]).catch("unknown");
function getVerificationErrorMessage(error) {
  switch ((error ?? "").toLowerCase()) {
    case "invalid_token":
      return "This link is no longer valid. Request a new email to keep going.";
    case "token_expired":
      return "This link has expired. Request a new email to keep going.";
    case "user_not_found":
      return "We couldn't find this account anymore. Try creating it again.";
    default:
      return error ? "We couldn't confirm this email. Request a new email and try again." : null;
  }
}
function getVerifyEmailPageCopy({
  isHostedMode,
  errorMessage,
  isPending,
  isRedirecting,
  email
}) {
  if (!isHostedMode) {
    return {
      title: "Verify email",
      helperText: "Email confirmation isn't available right now."
    };
  }
  if (errorMessage) {
    return {
      title: "We couldn't confirm your email",
      helperText: errorMessage
    };
  }
  if (isRedirecting) {
    return {
      title: "Email confirmed",
      helperText: "You're all set. Taking you to your account now."
    };
  }
  if (isPending) {
    return {
      title: "Verify email",
      helperText: "Checking your email confirmation."
    };
  }
  return {
    title: "Verify your email",
    helperText: email ? `Click the link we sent to ${email} to verify your email.` : "Check your inbox for the link to verify your email."
  };
}
function VerifyEmailPage() {
  const search = Route.useSearch();
  const redirectTo = normalizeAuthRedirect(search.redirect);
  const isHostedMode = isHostedClientAuthMode();
  const {
    data: session,
    isPending
  } = useSession();
  const bypassEmailVerification = isEmailVerificationBypassed();
  const errorMessage = getVerificationErrorMessage(search.error);
  const verificationIssueType = search.error ? verificationIssueSchema.parse(search.error) : null;
  const email = search.email ?? session?.user?.email;
  const isVerified = !!session?.user?.emailVerified;
  const [isResending, setIsResending] = useState(false);
  const isRedirecting = isVerified || bypassEmailVerification;
  const pageCopy = getVerifyEmailPageCopy({
    isHostedMode,
    errorMessage,
    isPending,
    isRedirecting,
    email
  });
  useEffect(() => {
    if (isPending || !isVerified && true) {
      return;
    }
    if (isVerified) {
      captureClientEvent("auth:verification_success", {
        redirect_to: redirectTo
      });
    }
    window.location.replace(redirectTo);
  }, [bypassEmailVerification, isPending, isVerified, redirectTo, session?.user?.id]);
  useEffect(() => {
    if (!verificationIssueType) {
      return;
    }
    captureClientEvent("auth:verification_issue", {
      issue_type: verificationIssueType
    });
  }, [verificationIssueType]);
  async function handleResend() {
    if (!email) return;
    setIsResending(true);
    try {
      const callbackURL = new URL("/verify-email", window.location.origin);
      if (redirectTo !== "/") callbackURL.searchParams.set("redirect", redirectTo);
      const result = await authClient.sendVerificationEmail({
        email,
        callbackURL: callbackURL.toString()
      });
      if (result.error) {
        toast.error(result.error.message || "We couldn't send another email.");
        return;
      }
      captureClientEvent("auth:verification_resend");
      toast.success("A new email is on the way.");
    } catch {
      toast.error("We couldn't send another email right now. Please try again.");
    } finally {
      setIsResending(false);
    }
  }
  return /* @__PURE__ */ jsx(AuthPageShell, { children: /* @__PURE__ */ jsx(AuthPageCard, { title: pageCopy.title, helperText: pageCopy.helperText, footer: /* @__PURE__ */ jsx("p", { className: "text-sm", children: /* @__PURE__ */ jsx(Link, { to: "/sign-in", search: getSignInSearch(redirectTo), className: "text-base-content/50 hover:text-base-content transition-colors", children: "Back to sign in" }) }), children: !isHostedMode ? null : errorMessage ? /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsx("div", { className: "alert alert-error", children: /* @__PURE__ */ jsx("span", { children: errorMessage }) }),
    /* @__PURE__ */ jsx(Link, { to: "/sign-in", search: getSignInSearch(redirectTo), className: "btn btn-soft w-full", children: "Back to sign in" })
  ] }) : isPending || isRedirecting ? /* @__PURE__ */ jsx("div", { className: "flex justify-center py-4", children: /* @__PURE__ */ jsx("span", { className: "loading loading-spinner loading-md" }) }) : email ? /* @__PURE__ */ jsx("button", { type: "button", className: "btn btn-soft w-full", onClick: () => void handleResend(), disabled: isResending, children: isResending ? "Sending email..." : "Resend email" }) : null }) });
}
export {
  VerifyEmailPage as component
};
