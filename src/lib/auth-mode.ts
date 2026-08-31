import { z } from "zod";

export const AUTH_MODES = [
  "cloudflare_access",
  "local_noauth",
  "hosted",
] as const;

type AuthMode = (typeof AUTH_MODES)[number];

const authModeSchema = z.enum(AUTH_MODES);

const warnedInvalidAuthModes = new Set<string>();

export function getAuthMode(value: string | null | undefined): AuthMode {
  const parsed = authModeSchema.safeParse(value);
  if (parsed.success) return parsed.data;

  // Unset stays a silent fail-closed default; a SET-but-invalid value is a
  // typo the operator needs to hear about — silently coercing it made every
  // request fail with a Cloudflare Access error about a mode they never chose.
  if (value && !warnedInvalidAuthModes.has(value)) {
    warnedInvalidAuthModes.add(value);
    console.error(
      `Invalid AUTH_MODE "${value}" — falling back to "cloudflare_access". Valid values: ${AUTH_MODES.join(", ")}.`,
    );
  }

  return "cloudflare_access";
}

export function isHostedAuthMode(value: string | null | undefined) {
  return getAuthMode(value) === "hosted";
}

export function isHostedClientAuthMode() {
  // This is an explicit deploy-time contract: the operator must keep the
  // client build-time AUTH_MODE aligned with the server runtime AUTH_MODE.
  // We accept that tradeoff to avoid a startup round-trip just to ask the
  // backend which auth UI to render. Hosted deployments must therefore set
  // AUTH_MODE=hosted in both the client build environment and the runtime.
  return isHostedAuthMode(import.meta.env.AUTH_MODE);
}

export function isSignupDisabled() {
  // Single-admin self-hosts close public registration (SIGNUP_DISABLED=true).
  // Same deploy-time contract as AUTH_MODE: set it in the client build env
  // AND the server runtime. The server enforces (better-auth disableSignUp);
  // this only steers which auth UI renders.
  return import.meta.env.SIGNUP_DISABLED === "true";
}

export function isGoogleAuthDisabled() {
  // Self-hosts without a Google OAuth client hide the Google sign-in UI
  // (GOOGLE_AUTH_DISABLED=true). The server omits the provider when
  // GOOGLE_CLIENT_ID/SECRET are unset, so this is cosmetic-only.
  return import.meta.env.GOOGLE_AUTH_DISABLED === "true";
}

export function isAuthentikAuthEnabled() {
  // LEIFKEN landscape SSO: renders the central-login button when the server
  // has the AUTHENTIK_* provider configured. Same deploy-time contract as
  // AUTH_MODE — set it in the client build env AND the server runtime.
  return import.meta.env.AUTHENTIK_AUTH_ENABLED === "true";
}

export function isEmailVerificationBypassed() {
  // Local-dev escape hatch (BYPASS_EMAIL_VERIFICATION=true). The server skips
  // verification and never marks users emailVerified, so the client must treat
  // the session as verified too — otherwise route guards and /verify-email
  // bounce each other in an infinite redirect loop.
  return import.meta.env.BYPASS_EMAIL_VERIFICATION === "true";
}
