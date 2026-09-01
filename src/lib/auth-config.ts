import { env } from "cloudflare:workers";
import { genericOAuth, organization } from "better-auth/plugins";
import { baseAuthOptions } from "@/lib/auth-options";
import { GA4_OAUTH_PROVIDER_ID, GA4_OAUTH_SCOPES } from "@/shared/ga4";
import { GSC_OAUTH_PROVIDER_ID, GSC_OAUTH_SCOPES } from "@/shared/gsc";

export function createBaseAuthConfig() {
  return {
    ...baseAuthOptions,
    advanced: {
      ipAddress: {
        // On Cloudflare Workers the client IP arrives in CF-Connecting-IP;
        // x-forwarded-for (better-auth's default) is absent, so without this
        // getIp() returns null and rate limiting is silently skipped on every
        // /api/auth endpoint. Header lookup is case-insensitive.
        ipAddressHeaders: ["cf-connecting-ip"],
      },
    },
    account: {
      // Encrypt OAuth access/refresh tokens at rest in D1. Also covers the
      // google social-login tokens; the key derives from BETTER_AUTH_SECRET.
      encryptOAuthTokens: true,
      accountLinking: {
        // Allow connecting a Google account whose email differs from the
        // logged-in user's (agency/freelancer managing a client's property).
        allowDifferentEmails: true,
        // LEIFKEN landscape SSO (Authentik OIDC): link a same-email sign-in
        // to the pre-provisioned admin user instead of failing. Authentik
        // already verifies the email, so no local verification is required
        // (pattern from the OL-CRM implementation).
        trustedProviders: ["authentik"],
        requireLocalEmailVerified: false,
      },
    },
    plugins: [
      // Block user-initiated org creation: each org is its own Autumn customer
      // with its own onboarding-plan credit grant, so an authenticated user
      // hitting POST /api/auth/organization/create could mint unlimited fresh
      // grants. The app gives every user exactly one workspace, created
      // server-side at signup via `auth.api.createOrganization({ body: { userId }})`
      // — that's a "system action" (no session + userId in body) which better-auth
      // exempts from this flag, so the bootstrap keeps working.
      //
      // invitationLimit: 0 closes the other path to multi-org membership.
      // "One user, one workspace" is a billing invariant: MCP API keys bill the
      // user's first org, sessions bill the active org — identical only while
      // users can't be invited into a second workspace. Remove this when teams
      // ship, in the same change that moves API-key requests to project-level
      // authz (org derived per tool call from the project; keys stay
      // user-scoped, no key→workspace binding).
      //
      // disableOrganizationDeletion closes the delete side of the same loop:
      // POST /api/auth/organization/delete (owner-callable by default) would
      // cascade-delete the workspace, and the next request auto-creates a fresh
      // org id — a fresh Autumn customer with a fresh credit grant.
      organization({
        allowUserToCreateOrganization: false,
        invitationLimit: 0,
        disableOrganizationDeletion: true,
      }),
      genericOAuth({
        config: [
          // LEIFKEN landscape SSO: Authentik (auth.leifken.ai) as the central
          // OIDC provider — Authorization Code + PKCE, better-auth as the
          // client lib. Mirrors the OL-CRM implementation (the landscape's
          // production pattern): plugin loads only when client id+secret are
          // set, redirect URI ends in /api/auth/oauth2/callback/authentik,
          // and the central profile picture maps into user.image. With
          // SIGNUP_DISABLED, implicit signup is off too: only pre-provisioned
          // users (the bootstrapped admin) can sign in through it.
          ...(env.AUTHENTIK_CLIENT_ID?.trim() && env.AUTHENTIK_CLIENT_SECRET?.trim()
            ? [
                {
                  providerId: "authentik",
                  clientId: env.AUTHENTIK_CLIENT_ID.trim(),
                  clientSecret: env.AUTHENTIK_CLIENT_SECRET.trim(),
                  discoveryUrl: `${(
                    env.AUTHENTIK_ISSUER_URL?.trim() ||
                    "https://auth.leifken.ai/application/o/seo/"
                  ).replace(/\/?$/, "/")}.well-known/openid-configuration`,
                  scopes: ["openid", "profile", "email"],
                  pkce: true,
                  // Without this better-auth only applies the mapped profile
                  // when it first creates the account — an existing user keeps
                  // whatever name/picture it was bootstrapped with. The central
                  // profile is the source of truth, so re-apply it every login.
                  overrideUserInfo: true,
                  // Central profile picture: picture claim → user.image
                  // (defensive, exactly as in OL-CRM).
                  // Take the central profile on every login: full name plus
                  // picture. Authentik ships avatars as ~26 KB data: URIs,
                  // which would overflow better-auth's signed session cookie —
                  // the Node runtime stores those on disk and returns a short
                  // URL instead (see node-runtime/avatar-store.ts).
                  mapProfileToUser: async (profile: Record<string, unknown>) => {
                    const mapped: { name?: string; image?: string } = {};
                    const name = profile.name;
                    if (typeof name === "string" && name.trim()) {
                      mapped.name = name.trim();
                    }
                    const picture = profile.picture;
                    if (typeof picture === "string" && picture) {
                      if (picture.startsWith("data:")) {
                        try {
                          const { storeDataUriAvatar } = await import(
                            "@/node-runtime/avatar-store"
                          );
                          const identity =
                            typeof profile.sub === "string"
                              ? profile.sub
                              : String(profile.email ?? "user");
                          const url = storeDataUriAvatar(identity, picture);
                          if (url) mapped.image = url;
                        } catch {
                          // Non-Node runtime: skip the oversized inline image.
                        }
                      } else {
                        mapped.image = picture;
                      }
                    }
                    return mapped;
                  },
                  disableImplicitSignUp:
                    Reflect.get(env, "SIGNUP_DISABLED") === "true",
                },
              ]
            : []),
          {
            providerId: GSC_OAUTH_PROVIDER_ID,
            clientId: env.GOOGLE_CLIENT_ID?.trim() ?? "",
            clientSecret: env.GOOGLE_CLIENT_SECRET?.trim() ?? "",
            discoveryUrl:
              "https://accounts.google.com/.well-known/openid-configuration",
            scopes: [...GSC_OAUTH_SCOPES],
            accessType: "offline", // request a refresh token
            prompt: "select_account consent",
            pkce: true,
          },
          {
            providerId: GA4_OAUTH_PROVIDER_ID,
            clientId: env.GOOGLE_CLIENT_ID?.trim() ?? "",
            clientSecret: env.GOOGLE_CLIENT_SECRET?.trim() ?? "",
            discoveryUrl:
              "https://accounts.google.com/.well-known/openid-configuration",
            scopes: [...GA4_OAUTH_SCOPES],
            accessType: "offline",
            prompt: "select_account consent",
            pkce: true,
          },
        ],
      }),
    ],
  };
}
