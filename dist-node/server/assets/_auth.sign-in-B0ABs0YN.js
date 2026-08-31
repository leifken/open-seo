import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useForm } from "@tanstack/react-form";
import { useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { v as Route, w as useAuthPageState, c as captureClientEvent, b as authClient, x as getVerifyEmailSearch, a as AuthPageCard, y as AuthMethodChooser, f as getFieldError, e as getFormError, g as getSignInSearch } from "./router-CC5LdN6j.js";
import { aM as isGoogleAuthDisabled } from "../entry.js";
import { z } from "zod";
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
const signInSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password.")
});
function SignInPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const {
    redirectTo,
    oauthQuery,
    isHostedMode
  } = useAuthPageState(search.redirect);
  const authCallbackURL = redirectTo;
  const [showEmailForm, setShowEmailForm] = useState(isGoogleAuthDisabled());
  const [isStartingGoogle, setIsStartingGoogle] = useState(false);
  const [socialError, setSocialError] = useState(null);
  const form = useForm({
    defaultValues: {
      email: "",
      password: ""
    },
    validators: {
      onSubmit: signInSchema
    },
    onSubmit: async ({
      formApi,
      value
    }) => {
      try {
        const email = value.email.trim();
        captureClientEvent("auth:sign_in_submit", {
          redirect_to: redirectTo
        });
        const result = await authClient.signIn.email({
          email,
          password: value.password,
          callbackURL: authCallbackURL,
          ...oauthQuery ? {
            oauth_query: oauthQuery
          } : {}
        });
        if (!result.error) {
          captureClientEvent("auth:sign_in_success", {
            redirect_to: redirectTo
          });
          return;
        }
        if (result.error.status === 403) {
          captureClientEvent("auth:sign_in_block_unverified", {
            redirect_to: redirectTo
          });
          void navigate({
            to: "/verify-email",
            search: getVerifyEmailSearch(email, redirectTo)
          });
          return;
        }
        formApi.setErrorMap({
          onSubmit: {
            form: result.error.message || "We couldn't sign you in.",
            fields: {}
          }
        });
      } catch {
        formApi.setErrorMap({
          onSubmit: {
            form: "Unable to sign in right now. Please try again.",
            fields: {}
          }
        });
      }
    }
  });
  async function handleContinueWithGoogle() {
    setSocialError(null);
    setIsStartingGoogle(true);
    try {
      captureClientEvent("auth:sign_in_google_start", {
        redirect_to: redirectTo
      });
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: authCallbackURL
      });
      if (result.error) {
        setSocialError(result.error.message || "Google sign in is not available right now.");
        setIsStartingGoogle(false);
      }
    } catch {
      setSocialError("Google sign in is not available right now.");
      setIsStartingGoogle(false);
    }
  }
  return /* @__PURE__ */ jsx(AuthPageCard, { title: "Sign in", footer: isHostedMode ? /* @__PURE__ */ jsxs("div", { className: showEmailForm ? "flex justify-between text-sm text-base-content/50" : "text-sm text-base-content/50", children: [
    showEmailForm ? /* @__PURE__ */ jsx(Link, { to: "/forgot-password", search: getSignInSearch(redirectTo), className: "text-base-content underline underline-offset-2 hover:text-base-content/80 transition-colors", children: "Forgot password?" }) : null,
    null
  ] }) : null, children: !showEmailForm ? /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(AuthMethodChooser, { googleLabel: "Continue with Google", disabled: !isHostedMode, isBusy: isStartingGoogle, onContinueWithGoogle: () => {
      void handleContinueWithGoogle();
    }, onContinueWithEmail: () => {
      setShowEmailForm(true);
      setSocialError(null);
    } }),
    socialError ? /* @__PURE__ */ jsx("p", { className: "text-sm text-error", children: socialError }) : null
  ] }) : /* @__PURE__ */ jsxs("form", { className: "space-y-4", onSubmit: (event) => {
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
    /* @__PURE__ */ jsx(form.Field, { name: "password", children: (field) => {
      const error = getFieldError(field.state.meta.errors);
      return /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("input", { type: "password", className: "input input-bordered w-full", placeholder: "Password...", value: field.state.value, onChange: (event) => field.handleChange(event.target.value), autoComplete: "current-password", disabled: !isHostedMode, required: true }),
        error ? /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-error", children: error }) : null
      ] });
    } }),
    /* @__PURE__ */ jsx(form.Subscribe, { selector: (state) => ({
      submitError: state.errorMap.onSubmit,
      isSubmitting: state.isSubmitting
    }), children: ({
      submitError,
      isSubmitting
    }) => {
      const errorMessage = getFormError(submitError);
      return /* @__PURE__ */ jsxs(Fragment, { children: [
        errorMessage ? /* @__PURE__ */ jsx("p", { className: "text-sm text-error", children: errorMessage }) : null,
        /* @__PURE__ */ jsx("button", { className: "btn btn-primary w-full", disabled: !isHostedMode || isSubmitting, children: isSubmitting ? "Signing in..." : "Sign in" })
      ] });
    } })
  ] }) });
}
export {
  SignInPage as component
};
