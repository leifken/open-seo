import { env } from "cloudflare:workers";
import { genericOAuth, organization } from "better-auth/plugins";
import { baseAuthOptions } from "@/lib/auth-options";
import { orgAccessControl, orgRoles } from "@/lib/org-permissions";

type OrganizationOptions = NonNullable<Parameters<typeof organization>[0]>;

const INVITATION_EXPIRES_IN_SECONDS = 60 * 60 * 24 * 7;

export function createBaseAuthConfig(options?: {
  organization?: Pick<OrganizationOptions, "organizationHooks">;
}) {
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
      // Better Auth writes the OAuth state verification row with a 10-minute
      // expiry but sets the matching signed cookie with maxAge 300, and checks
      // the cookie before the row's expiresAt — so the intended 10-minute
      // window is unreachable. A user who takes more than 5 minutes on
      // Google's sign-in screens returns with a live verification row and a
      // dead cookie and fails with "State mismatch". The row's expiresAt still
      // enforces the real 10-minute window and the state stays single-use.
      cookies: { state: { attributes: { maxAge: 600 } } },
    },
    account: {
      // Encrypt OAuth access/refresh tokens at rest. Covers the google
      // social-login tokens and the Search Console / Analytics grants written
      // by googleOAuth.ts; the key derives from BETTER_AUTH_SECRET.
      encryptOAuthTokens: true,
      accountLinking: {
        // Preserve linking a Google sign-in account whose email differs from
        // the current user's email. Data grants use a separate OAuth flow.
        allowDifferentEmails: true,
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
      organization({
        allowUserToCreateOrganization: false,
        ac: orgAccessControl,
        roles: orgRoles,
        // No self-serve delete: it would cascade projects/members/activation
        // state, strand the org's Autumn customer, and (with the signup
        // bootstrap re-minting a fresh org + free grant on next login) act as
        // a credit-farming loop. Deletion stays a support action.
        disableOrganizationDeletion: true,
        invitationExpiresIn: INVITATION_EXPIRES_IN_SECONDS,
        // DB-backed bound on outstanding pending invitations per org — the
        // only rate control that actually holds on Workers (in-memory rate
        // limiting is per-isolate).
        invitationLimit: 20,
        ...options?.organization,
      }),
      genericOAuth({
        config:
          // LEIFKEN landscape SSO: Authentik (auth.leifken.ai) as the central
          // OIDC provider — Authorization Code + PKCE, better-auth as the
          // client lib. Mirrors the OL-CRM implementation (the landscape's
          // production pattern): plugin loads only when client id+secret are
          // set, redirect URI ends in /api/auth/oauth2/callback/authentik,
          // and the central profile picture maps into user.image. With
          // SIGNUP_DISABLED, implicit signup is off too: only pre-provisioned
          // users (the bootstrapped admin) can sign in through it.
          env.AUTHENTIK_CLIENT_ID?.trim() && env.AUTHENTIK_CLIENT_SECRET?.trim()
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
                  mapProfileToUser: async (
                    profile: Record<string, unknown>,
                  ) => {
                    const mapped: { name?: string; image?: string } = {};
                    const name = profile.name;
                    if (typeof name === "string" && name.trim()) {
                      mapped.name = name.trim();
                    }
                    const picture = profile.picture;
                    if (typeof picture === "string" && picture) {
                      if (picture.startsWith("data:")) {
                        try {
                          const { storeDataUriAvatar } =
                            await import("@/node-runtime/avatar-store");
                          const identity =
                            typeof profile.sub === "string"
                              ? profile.sub
                              : typeof profile.email === "string"
                                ? profile.email
                                : "user";
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
            : [],
      }),
    ],
  };
}
