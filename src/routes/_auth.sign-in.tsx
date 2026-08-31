import { useForm } from "@tanstack/react-form";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  AuthPageCard,
  AuthMethodChooser,
  authRedirectSearchSchema,
  useAuthPageState,
} from "@/client/features/auth/AuthPage";
import { getFieldError, getFormError } from "@/client/lib/forms";
import { captureClientEvent } from "@/client/lib/posthog";
import { authClient } from "@/lib/auth-client";
import {
  isAuthentikAuthEnabled,
  isGoogleAuthDisabled,
  isSignupDisabled,
} from "@/lib/auth-mode";
import { getSignInSearch, getVerifyEmailSearch } from "@/lib/auth-redirect";
import { z } from "zod";

const signInSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

export const Route = createFileRoute("/_auth/sign-in")({
  validateSearch: authRedirectSearchSchema,
  component: SignInPage,
});

function SignInPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { redirectTo, oauthQuery, isHostedMode } = useAuthPageState(
    search.redirect,
  );
  const authCallbackURL = redirectTo;
  // Without Google or Authentik there is no chooser — open the email form.
  const [showEmailForm, setShowEmailForm] = useState(
    isGoogleAuthDisabled() && !isAuthentikAuthEnabled(),
  );
  const [isStartingGoogle, setIsStartingGoogle] = useState(false);
  const [socialError, setSocialError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: signInSchema,
    },
    onSubmit: async ({ formApi, value }) => {
      try {
        const email = value.email.trim();
        captureClientEvent("auth:sign_in_submit", {
          redirect_to: redirectTo,
        });

        const result = await authClient.signIn.email({
          email,
          password: value.password,
          callbackURL: authCallbackURL,
          ...(oauthQuery ? { oauth_query: oauthQuery } : {}),
        });

        if (!result.error) {
          captureClientEvent("auth:sign_in_success", {
            redirect_to: redirectTo,
          });
          return;
        }

        if (result.error.status === 403) {
          captureClientEvent("auth:sign_in_block_unverified", {
            redirect_to: redirectTo,
          });
          // Email not verified yet: send them to the verification page (which
          // shows "check your inbox" + resend) instead of leaving them on a
          // sign-in form that will keep rejecting them.
          void navigate({
            to: "/verify-email",
            search: getVerifyEmailSearch(email, redirectTo),
          });
          return;
        }

        formApi.setErrorMap({
          onSubmit: {
            form: result.error.message || "We couldn't sign you in.",
            fields: {},
          },
        });
      } catch {
        formApi.setErrorMap({
          onSubmit: {
            form: "Unable to sign in right now. Please try again.",
            fields: {},
          },
        });
      }
    },
  });

  // LEIFKEN landscape SSO: central login through Authentik (auth.leifken.ai),
  // wired via the better-auth genericOAuth provider in auth-config.ts.
  async function handleContinueWithAuthentik() {
    setSocialError(null);
    setIsStartingGoogle(true);
    try {
      const result = await authClient.signIn.oauth2({
        providerId: "authentik",
        callbackURL: authCallbackURL,
      });
      if (result.error) {
        setSocialError(
          result.error.message || "Central sign-in is not available right now.",
        );
        setIsStartingGoogle(false);
      } else if (result.data?.url) {
        window.location.href = result.data.url;
      }
    } catch {
      setSocialError("Central sign-in is not available right now.");
      setIsStartingGoogle(false);
    }
  }

  async function handleContinueWithGoogle() {
    setSocialError(null);
    setIsStartingGoogle(true);

    try {
      captureClientEvent("auth:sign_in_google_start", {
        redirect_to: redirectTo,
      });
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: authCallbackURL,
      });

      if (result.error) {
        setSocialError(
          result.error.message || "Google sign in is not available right now.",
        );
        setIsStartingGoogle(false);
      }
    } catch {
      setSocialError("Google sign in is not available right now.");
      setIsStartingGoogle(false);
    }
  }

  return (
    <AuthPageCard
      title="Sign in"
      footer={
        isHostedMode ? (
          <div
            className={
              showEmailForm
                ? "flex justify-between text-sm text-base-content/50"
                : "text-sm text-base-content/50"
            }
          >
            {showEmailForm ? (
              <Link
                to="/forgot-password"
                search={getSignInSearch(redirectTo)}
                className="text-base-content underline underline-offset-2 hover:text-base-content/80 transition-colors"
              >
                Forgot password?
              </Link>
            ) : null}
            {isSignupDisabled() ? null : (
              <Link
                to="/sign-up"
                search={getSignInSearch(redirectTo)}
                className="text-base-content underline underline-offset-2 hover:text-base-content/80 transition-colors"
              >
                Create account
              </Link>
            )}
          </div>
        ) : null
      }
    >
      {isAuthentikAuthEnabled() && !showEmailForm ? (
        // LEIFKEN landscape SSO: one central login for everything. The
        // password form stays reachable as a fail-safe (OL-CRM principle:
        // an SSO outage must never lock the admin out).
        <>
          <button
            type="button"
            className="btn btn-primary w-full"
            onClick={() => {
              void handleContinueWithAuthentik();
            }}
            disabled={!isHostedMode || isStartingGoogle}
          >
            {isStartingGoogle ? "Redirecting..." : "Sign in with LEIFKEN AI"}
          </button>
          {socialError ? (
            <p className="text-sm text-error">{socialError}</p>
          ) : null}
          <button
            type="button"
            className="btn btn-ghost btn-sm w-full text-base-content/60"
            onClick={() => {
              setShowEmailForm(true);
              setSocialError(null);
            }}
          >
            Sign in with password instead
          </button>
        </>
      ) : !showEmailForm ? (
        <>
          <AuthMethodChooser
            googleLabel="Continue with Google"
            disabled={!isHostedMode}
            isBusy={isStartingGoogle}
            onContinueWithGoogle={() => {
              void handleContinueWithGoogle();
            }}
            onContinueWithEmail={() => {
              setShowEmailForm(true);
              setSocialError(null);
            }}
          />
          {socialError ? (
            <p className="text-sm text-error">{socialError}</p>
          ) : null}
        </>
      ) : (
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void form.handleSubmit();
          }}
        >
          <form.Field name="email">
            {(field) => {
              const error = getFieldError(field.state.meta.errors);

              return (
                <div>
                  <input
                    type="email"
                    className="input input-bordered w-full"
                    placeholder="Email address..."
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    autoComplete="email"
                    disabled={!isHostedMode}
                    required
                  />
                  {error ? (
                    <p className="mt-1 text-sm text-error">{error}</p>
                  ) : null}
                </div>
              );
            }}
          </form.Field>

          <form.Field name="password">
            {(field) => {
              const error = getFieldError(field.state.meta.errors);

              return (
                <div>
                  <input
                    type="password"
                    className="input input-bordered w-full"
                    placeholder="Password..."
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    autoComplete="current-password"
                    disabled={!isHostedMode}
                    required
                  />
                  {error ? (
                    <p className="mt-1 text-sm text-error">{error}</p>
                  ) : null}
                </div>
              );
            }}
          </form.Field>

          <form.Subscribe
            selector={(state) => ({
              submitError: state.errorMap.onSubmit,
              isSubmitting: state.isSubmitting,
            })}
          >
            {({ submitError, isSubmitting }) => {
              const errorMessage = getFormError(submitError);
              return (
                <>
                  {errorMessage ? (
                    <p className="text-sm text-error">{errorMessage}</p>
                  ) : null}
                  <button
                    className="btn btn-primary w-full"
                    disabled={!isHostedMode || isSubmitting}
                  >
                    {isSubmitting ? "Signing in..." : "Sign in"}
                  </button>
                </>
              );
            }}
          </form.Subscribe>
        </form>
      )}
    </AuthPageCard>
  );
}
