import { jsx, jsxs } from "react/jsx-runtime";
import { useForm } from "@tanstack/react-form";
import { Link } from "@tanstack/react-router";
import { h as Route, n as normalizeAuthRedirect, b as authClient, A as AuthPageShell, e as getFormError, a as AuthPageCard, f as getFieldError, g as getSignInSearch } from "./router-CFUJAOTG.js";
import { aC as isHostedClientAuthMode } from "../entry.js";
import { z } from "zod";
import "react";
import "lucide-react";
import "@tanstack/react-query";
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
const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Enter a valid email address.")
});
function ForgotPasswordPage() {
  const search = Route.useSearch();
  const redirectTo = normalizeAuthRedirect(search.redirect);
  const isHostedMode = isHostedClientAuthMode();
  const form = useForm({
    defaultValues: {
      email: ""
    },
    validators: {
      onSubmit: forgotPasswordSchema
    },
    onSubmit: async ({
      formApi,
      value
    }) => {
      try {
        const redirectUrl = new URL("/reset-password", window.location.origin);
        if (redirectTo !== "/") redirectUrl.searchParams.set("redirect", redirectTo);
        const result = await authClient.requestPasswordReset({
          email: value.email.trim(),
          redirectTo: redirectUrl.toString()
        });
        if (result.error) {
          formApi.setErrorMap({
            onSubmit: {
              form: result.error.message || "We couldn't send the reset email.",
              fields: {}
            }
          });
          return;
        }
      } catch {
        formApi.setErrorMap({
          onSubmit: {
            form: "We couldn't send the reset email right now. Please try again.",
            fields: {}
          }
        });
      }
    }
  });
  return /* @__PURE__ */ jsx(AuthPageShell, { children: /* @__PURE__ */ jsx(form.Subscribe, { selector: (state) => ({
    isSuccess: state.isSubmitSuccessful && !state.errorMap.onSubmit,
    submittedEmail: state.values.email,
    submitError: state.errorMap.onSubmit,
    isSubmitting: state.isSubmitting
  }), children: ({
    isSuccess,
    submittedEmail,
    submitError,
    isSubmitting
  }) => {
    const errorMessage = getFormError(submitError);
    return /* @__PURE__ */ jsx(AuthPageCard, { title: isSuccess ? "Check your email" : "Forgot password", helperText: isSuccess ? `If an account exists for ${submittedEmail}, we sent a reset link.` : isHostedMode ? "Enter your email and we'll send you a password reset link." : "Password reset isn't available right now.", footer: /* @__PURE__ */ jsx("p", { className: "text-sm", children: /* @__PURE__ */ jsx(Link, { to: "/sign-in", search: getSignInSearch(redirectTo), className: "text-base-content/50 hover:text-base-content transition-colors", children: "Back to sign in" }) }), children: isSuccess ? /* @__PURE__ */ jsx("div", { className: "alert alert-success", children: /* @__PURE__ */ jsx("span", { children: "If an account exists for that email, you'll receive password reset instructions shortly." }) }) : /* @__PURE__ */ jsxs("form", { className: "space-y-4", onSubmit: (event) => {
      event.preventDefault();
      void form.handleSubmit();
    }, children: [
      /* @__PURE__ */ jsx(form.Field, { name: "email", children: (field) => {
        const error = getFieldError(field.state.meta.errors);
        return /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("input", { type: "email", className: "input input-bordered w-full", placeholder: "Email address...", value: field.state.value, onChange: (event) => field.handleChange(event.target.value), autoComplete: "email", disabled: !isHostedMode, required: true }),
          error ? /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-error", children: error }) : null
        ] });
      } }),
      errorMessage ? /* @__PURE__ */ jsx("p", { className: "text-sm text-error", children: errorMessage }) : null,
      /* @__PURE__ */ jsx("button", { className: "btn btn-soft w-full", disabled: !isHostedMode || isSubmitting, children: isSubmitting ? "Sending reset link..." : "Send reset link" })
    ] }) });
  } }) });
}
export {
  ForgotPasswordPage as component
};
