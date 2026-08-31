import { jsx, jsxs } from "react/jsx-runtime";
import { useForm } from "@tanstack/react-form";
import { Link } from "@tanstack/react-router";
import { d as Route, n as normalizeAuthRedirect, b as authClient, A as AuthPageShell, e as getFormError, a as AuthPageCard, g as getSignInSearch, f as getFieldError } from "./router-DHiBnyXs.js";
import { az as isHostedClientAuthMode, aB as HOSTED_PASSWORD_MAX_LENGTH, aC as HOSTED_PASSWORD_MIN_LENGTH } from "../entry.js";
import { z } from "zod";
import "react";
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
const resetPasswordSchema = z.object({
  password: z.string().min(HOSTED_PASSWORD_MIN_LENGTH, `Password must be at least ${HOSTED_PASSWORD_MIN_LENGTH} characters.`).max(HOSTED_PASSWORD_MAX_LENGTH, `Password must be at most ${HOSTED_PASSWORD_MAX_LENGTH} characters.`),
  confirmPassword: z.string()
}).refine((value) => value.password === value.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"]
});
function getResetPasswordErrorMessage(error) {
  switch ((error ?? "").toLowerCase()) {
    case "invalid_token":
      return "This reset link is no longer valid. Request a new one to keep going.";
    case "token_expired":
      return "This reset link has expired. Request a new one to keep going.";
    default:
      return error ? "This reset link can't be used anymore. Request a new one and try again." : null;
  }
}
function getResetPasswordPageCopy({
  isHostedMode,
  isComplete,
  routeError,
  hasToken
}) {
  if (!isHostedMode) {
    return {
      title: "Reset password",
      helperText: "Password reset isn't available right now."
    };
  }
  if (isComplete) {
    return {
      title: "Password updated",
      helperText: "Your password has been updated. Sign in with your new password."
    };
  }
  if (routeError || !hasToken) {
    return {
      title: "Reset link expired",
      helperText: routeError || "This reset link is no longer valid. Request a new one to keep going."
    };
  }
  return {
    title: "Reset password",
    helperText: "Choose a new password for your account."
  };
}
function ResetPasswordPage() {
  const search = Route.useSearch();
  const redirectTo = normalizeAuthRedirect(search.redirect);
  const isHostedMode = isHostedClientAuthMode();
  const routeError = getResetPasswordErrorMessage(search.error);
  const token = typeof search.token === "string" ? search.token : null;
  const form = useForm({
    defaultValues: {
      password: "",
      confirmPassword: ""
    },
    validators: {
      onSubmit: resetPasswordSchema
    },
    onSubmit: async ({
      formApi,
      value
    }) => {
      if (!token) {
        formApi.setErrorMap({
          onSubmit: {
            form: "This reset link is no longer valid. Request a new one and try again.",
            fields: {}
          }
        });
        return;
      }
      try {
        const result = await authClient.resetPassword({
          newPassword: value.password,
          token
        });
        if (result.error) {
          formApi.setErrorMap({
            onSubmit: {
              form: "This reset link is no longer valid. Request a new one and try again.",
              fields: {}
            }
          });
          return;
        }
      } catch {
        formApi.setErrorMap({
          onSubmit: {
            form: "We couldn't update your password right now. Please try again.",
            fields: {}
          }
        });
      }
    }
  });
  return /* @__PURE__ */ jsx(AuthPageShell, { children: /* @__PURE__ */ jsx(form.Subscribe, { selector: (state) => ({
    isComplete: state.isSubmitSuccessful && !state.errorMap.onSubmit,
    submitError: state.errorMap.onSubmit,
    isSubmitting: state.isSubmitting
  }), children: ({
    isComplete,
    submitError,
    isSubmitting
  }) => {
    const errorMessage = getFormError(submitError);
    const pageCopy = getResetPasswordPageCopy({
      isHostedMode,
      isComplete,
      routeError,
      hasToken: !!token
    });
    return /* @__PURE__ */ jsx(AuthPageCard, { title: pageCopy.title, helperText: pageCopy.helperText, footer: /* @__PURE__ */ jsx("p", { className: "text-sm", children: /* @__PURE__ */ jsx(Link, { to: "/sign-in", search: getSignInSearch(redirectTo), className: "text-base-content/50 hover:text-base-content transition-colors", children: "Sign in" }) }), children: !isHostedMode ? null : isComplete ? /* @__PURE__ */ jsx("a", { href: redirectTo === "/" ? "/sign-in" : `/sign-in?redirect=${encodeURIComponent(redirectTo)}`, className: "btn btn-soft w-full", children: "Continue to sign in" }) : routeError || !token ? /* @__PURE__ */ jsx(Link, { to: "/forgot-password", search: getSignInSearch(redirectTo), className: "btn btn-soft w-full", children: "Request a new reset link" }) : /* @__PURE__ */ jsxs("form", { className: "space-y-4", onSubmit: (event) => {
      event.preventDefault();
      void form.handleSubmit();
    }, children: [
      /* @__PURE__ */ jsx(form.Field, { name: "password", children: (field) => {
        const error = getFieldError(field.state.meta.errors);
        return /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("input", { type: "password", className: "input input-bordered w-full", placeholder: "New password...", value: field.state.value, onChange: (event) => field.handleChange(event.target.value), autoComplete: "new-password", minLength: HOSTED_PASSWORD_MIN_LENGTH, maxLength: HOSTED_PASSWORD_MAX_LENGTH, required: true }),
          error ? /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-error", children: error }) : null
        ] });
      } }),
      /* @__PURE__ */ jsx(form.Field, { name: "confirmPassword", children: (field) => {
        const error = getFieldError(field.state.meta.errors);
        return /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("input", { type: "password", className: "input input-bordered w-full", placeholder: "Confirm new password...", value: field.state.value, onChange: (event) => field.handleChange(event.target.value), autoComplete: "new-password", minLength: HOSTED_PASSWORD_MIN_LENGTH, maxLength: HOSTED_PASSWORD_MAX_LENGTH, required: true }),
          error ? /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-error", children: error }) : null
        ] });
      } }),
      errorMessage ? /* @__PURE__ */ jsx("p", { className: "text-sm text-error", children: errorMessage }) : null,
      /* @__PURE__ */ jsx("button", { className: "btn btn-soft w-full", disabled: isSubmitting, children: isSubmitting ? "Updating password..." : "Update password" })
    ] }) });
  } }) });
}
export {
  ResetPasswordPage as component
};
