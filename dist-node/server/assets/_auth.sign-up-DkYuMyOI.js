import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useForm } from "@tanstack/react-form";
import { useNavigate, Link } from "@tanstack/react-router";
import { useRef, useState, useCallback, useEffect } from "react";
import { I as Route, x as useAuthPageState, c as captureClientEvent, j as getVerifyEmailSearch, b as authClient, a as AuthPageCard, y as AuthMethodChooser, f as getFieldError, e as getFormError, g as getSignInSearch } from "./router-DHiBnyXs.js";
import { aB as HOSTED_PASSWORD_MAX_LENGTH, aC as HOSTED_PASSWORD_MIN_LENGTH } from "../entry.js";
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
const TURNSTILE_SITE_KEY = void 0;
function useTurnstileCaptcha() {
  const tokenRef = useRef(null);
  const [hasToken, setHasToken] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);
  const onToken = useCallback((token) => {
    tokenRef.current = token;
    setHasToken(Boolean(token));
  }, []);
  const reset = useCallback(() => {
    tokenRef.current = null;
    setHasToken(false);
    setResetNonce((nonce) => nonce + 1);
  }, []);
  return { tokenRef, hasToken, resetNonce, onToken, reset };
}
function TurnstileWidget({
  onToken,
  resetNonce
}) {
  useRef(null);
  const widgetIdRef = useRef(null);
  const onTokenRef = useRef(onToken);
  onTokenRef.current = onToken;
  useEffect(() => {
    return;
  }, []);
  useEffect(() => {
    if (resetNonce === 0) return;
    if (widgetIdRef.current !== null && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
      onTokenRef.current(null);
    }
  }, [resetNonce]);
  return null;
}
const signUpSchema = z.object({
  name: z.string().trim(),
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(HOSTED_PASSWORD_MIN_LENGTH, `Password must be at least ${HOSTED_PASSWORD_MIN_LENGTH} characters.`).max(HOSTED_PASSWORD_MAX_LENGTH, `Password must be at most ${HOSTED_PASSWORD_MAX_LENGTH} characters.`),
  confirmPassword: z.string()
}).refine((value) => value.password === value.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"]
});
function SignUpPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const {
    redirectTo,
    isHostedMode
  } = useAuthPageState(search.redirect);
  const postSignupRedirect = redirectTo === "/" ? "/onboarding" : redirectTo;
  const [showEmailForm, setShowEmailForm] = useState(false);
  const google = useGoogleSignUp({
    redirectTo,
    postSignupRedirect
  });
  const isTurnstileEnabled = isHostedMode && Boolean(TURNSTILE_SITE_KEY);
  const captcha = useTurnstileCaptcha();
  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: ""
    },
    validators: {
      onSubmit: signUpSchema
    },
    onSubmit: async ({
      formApi,
      value
    }) => {
      const captchaToken = captcha.tokenRef.current;
      if (isTurnstileEnabled && !captchaToken) {
        formApi.setErrorMap({
          onSubmit: {
            form: "Please complete the captcha to continue.",
            fields: {}
          }
        });
        return;
      }
      try {
        const email = value.email.trim();
        captureClientEvent("auth:sign_up_submit", {
          redirect_to: redirectTo
        });
        const resolvedName = value.name.trim() || email.split("@")[0] || "OpenSEO User";
        const verificationCallbackURL = new URL("/verify-email", window.location.origin);
        const verificationSearch = getVerifyEmailSearch(void 0, postSignupRedirect);
        if (verificationSearch.redirect) {
          verificationCallbackURL.searchParams.set("redirect", verificationSearch.redirect);
        }
        const result = await authClient.signUp.email({
          name: resolvedName,
          email,
          password: value.password,
          callbackURL: verificationCallbackURL.toString(),
          ...isTurnstileEnabled && captchaToken ? {
            fetchOptions: {
              headers: {
                "x-captcha-response": captchaToken
              }
            }
          } : {}
        });
        if (result.error) {
          if (isTurnstileEnabled) captcha.reset();
          formApi.setErrorMap({
            onSubmit: {
              form: result.error.message || "Unable to create account.",
              fields: {}
            }
          });
          return;
        }
        captureClientEvent("auth:sign_up_success", {
          redirect_to: redirectTo
        });
        void navigate({
          to: "/verify-email",
          search: getVerifyEmailSearch(email, postSignupRedirect),
          replace: true
        });
      } catch {
        if (isTurnstileEnabled) captcha.reset();
        formApi.setErrorMap({
          onSubmit: {
            form: "Unable to create account right now. Please try again.",
            fields: {}
          }
        });
      }
    }
  });
  return /* @__PURE__ */ jsx(AuthPageCard, { title: "Create your account", footer: isHostedMode ? showEmailForm ? /* @__PURE__ */ jsx("button", { type: "button", className: "text-sm text-base-content underline underline-offset-2 hover:text-base-content/80 transition-colors", onClick: () => {
    setShowEmailForm(false);
    google.clearError();
  }, children: "Back to signup" }) : /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("p", { className: "text-sm leading-relaxed text-base-content/60", children: [
      "By signing up, you agree to our",
      " ",
      /* @__PURE__ */ jsx("a", { href: "https://openseo.so/terms-and-conditions", target: "_blank", rel: "noreferrer", className: "text-base-content underline underline-offset-2 hover:text-base-content/80 transition-colors", children: "Terms" }),
      " ",
      "and",
      " ",
      /* @__PURE__ */ jsx("a", { href: "https://openseo.so/privacy", target: "_blank", rel: "noreferrer", className: "text-base-content underline underline-offset-2 hover:text-base-content/80 transition-colors", children: "Privacy Policy" }),
      "."
    ] }),
    /* @__PURE__ */ jsxs("p", { className: "text-sm text-base-content/50", children: [
      "Already have an account?",
      " ",
      /* @__PURE__ */ jsx(Link, { to: "/sign-in", search: getSignInSearch(redirectTo), className: "text-base-content underline underline-offset-2 hover:text-base-content/80 transition-colors", children: "Sign in" })
    ] })
  ] }) : null, children: !showEmailForm ? /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(AuthMethodChooser, { googleLabel: "Continue with Google", disabled: !isHostedMode, isBusy: google.isStarting, onContinueWithGoogle: () => {
      void google.start();
    }, onContinueWithEmail: () => {
      setShowEmailForm(true);
      google.clearError();
    } }),
    google.error ? /* @__PURE__ */ jsx("p", { className: "text-sm text-error", children: google.error }) : null
  ] }) : /* @__PURE__ */ jsxs("form", { className: "space-y-4", onSubmit: (event) => {
    event.preventDefault();
    void form.handleSubmit();
  }, children: [
    /* @__PURE__ */ jsx(form.Field, { name: "name", children: (field) => {
      const error = getFieldError(field.state.meta.errors);
      return /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("input", { type: "text", className: "input input-bordered w-full", placeholder: "Name (optional)...", value: field.state.value, onChange: (event) => field.handleChange(event.target.value), autoComplete: "name", disabled: !isHostedMode }),
        error ? /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-error", children: error }) : null
      ] });
    } }),
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
        /* @__PURE__ */ jsx("input", { type: "password", className: "input input-bordered w-full", placeholder: "Password...", value: field.state.value, onChange: (event) => field.handleChange(event.target.value), autoComplete: "new-password", disabled: !isHostedMode, required: true, minLength: HOSTED_PASSWORD_MIN_LENGTH, maxLength: HOSTED_PASSWORD_MAX_LENGTH }),
        error ? /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-error", children: error }) : null
      ] });
    } }),
    /* @__PURE__ */ jsx(form.Field, { name: "confirmPassword", children: (field) => {
      const error = getFieldError(field.state.meta.errors);
      return /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("input", { type: "password", className: "input input-bordered w-full", placeholder: "Confirm password...", value: field.state.value, onChange: (event) => field.handleChange(event.target.value), autoComplete: "new-password", disabled: !isHostedMode, required: true, minLength: HOSTED_PASSWORD_MIN_LENGTH, maxLength: HOSTED_PASSWORD_MAX_LENGTH }),
        error ? /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-error", children: error }) : null
      ] });
    } }),
    isTurnstileEnabled ? /* @__PURE__ */ jsx(TurnstileWidget, { onToken: captcha.onToken, resetNonce: captcha.resetNonce }) : null,
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
        /* @__PURE__ */ jsx("button", { className: "btn btn-soft w-full", disabled: !isHostedMode || isSubmitting || isTurnstileEnabled && !captcha.hasToken, children: isSubmitting ? "Creating account..." : "Create account" })
      ] });
    } })
  ] }) });
}
function useGoogleSignUp({
  redirectTo,
  postSignupRedirect
}) {
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState(null);
  const start = async () => {
    setError(null);
    setIsStarting(true);
    try {
      captureClientEvent("auth:sign_up_google_start", {
        redirect_to: redirectTo
      });
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: redirectTo,
        newUserCallbackURL: postSignupRedirect,
        requestSignUp: true
      });
      if (result.error) {
        setError(result.error.message || "Google sign up is not available right now.");
        setIsStarting(false);
      }
    } catch {
      setError("Google sign up is not available right now.");
      setIsStarting(false);
    }
  };
  return {
    isStarting,
    error,
    start,
    clearError: () => setError(null)
  };
}
export {
  SignUpPage as component
};
