import { a1 as AppError, b6 as getAuthMode, a6 as env, b7 as isHostedAuthMode, b8 as resolveLocalNoAuthContext, b9 as resolveCloudflareAccessContext, J as getPublicOrigin, ba as getGoogleOAuthClientConfig, bb as getAuth, a8 as db, b0 as account, bc as symmetricEncrypt, E as hasSelfHostedGoogleOAuthConfig, bd as GSC_OAUTH_SCOPES, be as GSC_OAUTH_PROVIDER_ID, bf as GA4_OAUTH_SCOPES, b1 as GA4_OAUTH_PROVIDER_ID } from "../entry.js";
import { and, eq } from "drizzle-orm";
import { decodeJwt } from "jose";
import { z } from "zod";
function statusForAppError(code) {
  switch (code) {
    case "UNAUTHENTICATED":
      return 401;
    case "FORBIDDEN":
      return 403;
    case "NOT_FOUND":
      return 404;
    case "VALIDATION_ERROR":
      return 400;
    case "PAYMENT_REQUIRED":
      return 402;
    default:
      return 500;
  }
}
function responseForAppError(error, fallbackMessage) {
  if (error instanceof AppError) {
    return new Response(error.message, {
      status: statusForAppError(error.code)
    });
  }
  return new Response(fallbackMessage, { status: 500 });
}
const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GSC_INTEGRATION = {
  providerId: GSC_OAUTH_PROVIDER_ID,
  // Preserve the state-signing namespace used by the original GSC flow so a
  // deployment does not invalidate an authorization already in progress.
  stateNamespace: "gsc",
  displayName: "Search Console",
  callbackPath: "/api/gsc/oauth/callback",
  scopes: GSC_OAUTH_SCOPES
};
const GA4_INTEGRATION = {
  providerId: GA4_OAUTH_PROVIDER_ID,
  stateNamespace: "ga4",
  displayName: "Google Analytics",
  callbackPath: "/api/ga4/oauth/callback",
  scopes: GA4_OAUTH_SCOPES
};
const oauthStateSchema = z.object({
  userId: z.string().min(1),
  callbackPath: z.string().min(1),
  exp: z.number().int()
});
const googleTokenResponseSchema = z.object({
  access_token: z.string().min(1),
  expires_in: z.number().optional(),
  refresh_token: z.string().optional(),
  scope: z.string().optional(),
  id_token: z.string().optional(),
  token_type: z.string().optional()
});
const googleIdTokenSchema = z.object({ sub: z.string().min(1) });
function bytesToBase64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}
function base64UrlToBytes(value) {
  const padded = `${value}${"=".repeat((4 - value.length % 4) % 4)}`;
  const binary = atob(padded.replaceAll("-", "+").replaceAll("_", "/"));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}
async function getStateKey(clientSecret, stateNamespace) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(`openseo:${stateNamespace}:${clientSecret}`),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}
async function signState(payload, clientSecret, stateNamespace) {
  const signature = await crypto.subtle.sign(
    "HMAC",
    await getStateKey(clientSecret, stateNamespace),
    new TextEncoder().encode(payload)
  );
  return bytesToBase64Url(new Uint8Array(signature));
}
function getSafeCallbackPath(callbackURL, publicOrigin) {
  try {
    const url = new URL(callbackURL, publicOrigin);
    if (url.origin !== publicOrigin) return "/";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/";
  }
}
async function createState(input) {
  const payload = bytesToBase64Url(
    new TextEncoder().encode(
      JSON.stringify({
        userId: input.userId,
        callbackPath: getSafeCallbackPath(
          input.callbackURL,
          input.publicOrigin
        ),
        exp: Date.now() + 10 * 60 * 1e3
      })
    )
  );
  const signature = await signState(
    payload,
    input.clientSecret,
    input.integration.stateNamespace
  );
  return `${payload}.${signature}`;
}
async function verifyState(input) {
  const [payload, signature] = input.state.split(".");
  if (!payload || !signature) {
    throw new AppError(
      "VALIDATION_ERROR",
      `Invalid ${input.integration.displayName} state`
    );
  }
  const ok = await crypto.subtle.verify(
    "HMAC",
    await getStateKey(input.clientSecret, input.integration.stateNamespace),
    base64UrlToBytes(signature),
    new TextEncoder().encode(payload)
  );
  if (!ok) {
    throw new AppError(
      "VALIDATION_ERROR",
      `Invalid ${input.integration.displayName} state`
    );
  }
  const parsed = oauthStateSchema.parse(
    JSON.parse(new TextDecoder().decode(base64UrlToBytes(payload)))
  );
  if (parsed.exp < Date.now()) {
    throw new AppError(
      "VALIDATION_ERROR",
      `Expired ${input.integration.displayName} state`
    );
  }
  return parsed;
}
function getRedirectUri(publicOrigin, integration) {
  return `${publicOrigin}${integration.callbackPath}`;
}
function getGoogleAccountId(tokens) {
  if (!tokens.id_token) {
    throw new AppError(
      "VALIDATION_ERROR",
      "Google did not return an ID token."
    );
  }
  return googleIdTokenSchema.parse(decodeJwt(tokens.id_token)).sub;
}
async function upsertGrant(input) {
  const ctx = await getAuth().$context;
  const encrypt = (value) => ctx.options.account?.encryptOAuthTokens ? symmetricEncrypt({ key: ctx.secretConfig, data: value }) : value;
  const googleAccountId = getGoogleAccountId(input.tokens);
  const existing = await db.select({ id: account.id, refreshToken: account.refreshToken }).from(account).where(
    and(
      eq(account.userId, input.user.userId),
      eq(account.providerId, input.integration.providerId),
      eq(account.accountId, googleAccountId)
    )
  ).limit(1);
  const accountValues = {
    accountId: googleAccountId,
    providerId: input.integration.providerId,
    userId: input.user.userId,
    accessToken: await encrypt(input.tokens.access_token),
    refreshToken: input.tokens.refresh_token ? await encrypt(input.tokens.refresh_token) : existing[0]?.refreshToken ?? null,
    idToken: input.tokens.id_token ? await encrypt(input.tokens.id_token) : null,
    accessTokenExpiresAt: new Date(
      Date.now() + (input.tokens.expires_in ?? 3600) * 1e3
    ),
    refreshTokenExpiresAt: null,
    scope: input.tokens.scope ? input.tokens.scope.trim().split(/\s+/).join(",") : input.integration.scopes.join(","),
    password: null
  };
  if (existing[0]) {
    await db.update(account).set({ ...accountValues, updatedAt: /* @__PURE__ */ new Date() }).where(eq(account.id, existing[0].id));
    return;
  }
  await db.insert(account).values({
    id: crypto.randomUUID(),
    ...accountValues,
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  });
}
async function exchangeCode(input) {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code: input.code,
      client_id: input.clientId,
      client_secret: input.clientSecret,
      redirect_uri: input.redirectUri,
      grant_type: "authorization_code"
    })
  });
  if (!response.ok) {
    throw new AppError(
      "VALIDATION_ERROR",
      `Google rejected the ${input.integration.displayName} authorization code.`
    );
  }
  return googleTokenResponseSchema.parse(await response.json());
}
async function createSelfHostedGoogleAuthorizationUrl(input) {
  const config = await getGoogleOAuthClientConfig();
  if (!config || !await hasSelfHostedGoogleOAuthConfig(config)) {
    throw new AppError(
      "AUTH_CONFIG_MISSING",
      `${input.integration.displayName} is not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and BETTER_AUTH_SECRET.`
    );
  }
  const redirectUri = getRedirectUri(input.publicOrigin, input.integration);
  const state = await createState({
    integration: input.integration,
    clientSecret: config.clientSecret,
    userId: input.user.userId,
    callbackURL: input.callbackURL,
    publicOrigin: input.publicOrigin
  });
  const url = new URL(GOOGLE_AUTH_URL);
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", input.integration.scopes.join(" "));
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "select_account consent");
  url.searchParams.set("state", state);
  return url.toString();
}
async function handleSelfHostedGoogleOAuthCallback(input) {
  const config = await getGoogleOAuthClientConfig();
  if (!config) {
    return new Response(
      `Missing ${input.integration.displayName} OAuth configuration`,
      { status: 500 }
    );
  }
  const url = new URL(input.request.url);
  const stateParam = url.searchParams.get("state");
  if (!stateParam) {
    return new Response(
      `Missing ${input.integration.displayName} OAuth state`,
      {
        status: 400
      }
    );
  }
  const state = await verifyState({
    state: stateParam,
    clientSecret: config.clientSecret,
    integration: input.integration
  });
  if (state.userId !== input.user.userId) {
    return new Response(
      `${input.integration.displayName} OAuth user mismatch`,
      {
        status: 403
      }
    );
  }
  const redirectToCallback = () => new Response(null, {
    status: 303,
    headers: { Location: state.callbackPath }
  });
  if (url.searchParams.get("error")) return redirectToCallback();
  const code = url.searchParams.get("code");
  if (!code) {
    return new Response(`Missing ${input.integration.displayName} OAuth code`, {
      status: 400
    });
  }
  const tokens = await exchangeCode({
    integration: input.integration,
    code,
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    redirectUri: getRedirectUri(input.publicOrigin, input.integration)
  });
  await upsertGrant({
    integration: input.integration,
    user: input.user,
    tokens
  });
  return redirectToCallback();
}
async function handleSelfHostedGoogleOAuthCallbackRequest(request, integration) {
  try {
    const authMode = getAuthMode(env.AUTH_MODE);
    if (isHostedAuthMode(authMode)) {
      return new Response("Not found", { status: 404 });
    }
    const context = authMode === "local_noauth" ? await resolveLocalNoAuthContext() : await resolveCloudflareAccessContext(request.headers);
    return await handleSelfHostedGoogleOAuthCallback({
      integration,
      request,
      user: {
        userId: context.userId,
        userEmail: context.userEmail
      },
      publicOrigin: getPublicOrigin(request)
    });
  } catch (error) {
    return responseForAppError(
      error,
      `${integration.displayName} OAuth failed`
    );
  }
}
export {
  GSC_INTEGRATION as G,
  GA4_INTEGRATION as a,
  createSelfHostedGoogleAuthorizationUrl as c,
  handleSelfHostedGoogleOAuthCallbackRequest as h
};
