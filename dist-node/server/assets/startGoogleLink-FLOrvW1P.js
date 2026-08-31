import { jsxs, jsx } from "react/jsx-runtime";
import { toast } from "sonner";
import { l as createSsrRpc, b as authClient, o as getStandardErrorMessage } from "./router-CC5LdN6j.js";
import { i as createServerFn, b1 as GA4_OAUTH_PROVIDER_ID, be as GSC_OAUTH_PROVIDER_ID, aC as isHostedClientAuthMode } from "../entry.js";
import { z } from "zod";
import { r as requireProjectContext, a as requireAuthenticatedContext } from "./middleware-CwR3-L1M.js";
function GoogleGlyph({
  className,
  muted = false
}) {
  const fill = (brand) => muted ? "currentColor" : brand;
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      className,
      viewBox: "0 0 48 48",
      "aria-hidden": "true",
      focusable: "false",
      children: [
        /* @__PURE__ */ jsx(
          "path",
          {
            fill: fill("#EA4335"),
            d: "M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
          }
        ),
        /* @__PURE__ */ jsx(
          "path",
          {
            fill: fill("#4285F4"),
            d: "M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
          }
        ),
        /* @__PURE__ */ jsx(
          "path",
          {
            fill: fill("#FBBC05"),
            d: "M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
          }
        ),
        /* @__PURE__ */ jsx(
          "path",
          {
            fill: fill("#34A853"),
            d: "M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
          }
        )
      ]
    }
  );
}
function GoogleGlyphMuted({ className }) {
  return /* @__PURE__ */ jsx(GoogleGlyph, { muted: true, className });
}
const projectScopedSchema$1 = z.object({
  projectId: z.string().min(1)
});
const setPropertySchema = projectScopedSchema$1.extend({
  accountId: z.string().min(1),
  propertyId: z.string().regex(/^properties\/\d+$/)
});
const startSelfHostedLinkSchema$1 = z.object({
  callbackURL: z.string().min(1)
});
const getGa4Connection = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(projectScopedSchema$1).handler(createSsrRpc("a4c5ccb6a409cc77e5e7b9193c9dc297024a48793fcd4437e01eb3aa2e1e71ea"));
const getGa4DashboardReport = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(projectScopedSchema$1).handler(createSsrRpc("aef09a57d39104b1d10659a92003c6f2a2a124fab74bdfc9358f984506751295"));
const listGa4Properties = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(projectScopedSchema$1).handler(createSsrRpc("afea34b6bf4da665d300c562fed995ffb979fe6ebb3bdb7d08c7ce493506a148"));
const setGa4Property = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(setPropertySchema).handler(createSsrRpc("131f47ab2c8b293725f7a4013737cb0d5e77f8ac22c985f4952b7140820a6430"));
const disconnectGa4 = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(projectScopedSchema$1).handler(createSsrRpc("9d62c976afd0592ac01d146421e81b4b46e99090b01e75b15797fba6d6af5e1d"));
const startSelfHostedGa4Link = createServerFn({
  method: "POST"
}).middleware(requireAuthenticatedContext).validator(startSelfHostedLinkSchema$1).handler(createSsrRpc("c36a03514a4a30b2f2aad7b77bba4606e70547fefc757782bb3f12ae4c226619"));
const projectScopedSchema = z.object({
  projectId: z.string().min(1)
});
const setSiteSchema = projectScopedSchema.extend({
  accountId: z.string().min(1),
  siteUrl: z.string().min(1)
});
const startSelfHostedLinkSchema = z.object({
  callbackURL: z.string().min(1)
});
const getGscGrantStatus = createServerFn({
  method: "GET"
}).middleware(requireAuthenticatedContext).handler(createSsrRpc("b55a517c6ff4161ff3bcf8bfa47562d71dd21f63950855318e723829d164b395"));
const getGscConnection = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(projectScopedSchema).handler(createSsrRpc("0a4a16ebe522d754ddd99b702cf7418577545e6ce062ede31ea16bc201d64943"));
const listGscSites = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(projectScopedSchema).handler(createSsrRpc("956a5e2004016739fc80341f1095d7bd8a96655c6c9fe7ba4126d97f40498e2a"));
const setGscSite = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(setSiteSchema).handler(createSsrRpc("ee56593aa127e081b934d6fec3a8bc310d3d98cbb59dd0947c77be7c85514de4"));
const disconnectGsc = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(projectScopedSchema).handler(createSsrRpc("02a3f23c7994a670645e4ace9876310700d9e054aab37095332d1846e11ec462"));
const startSelfHostedGscLink = createServerFn({
  method: "POST"
}).middleware(requireAuthenticatedContext).validator(startSelfHostedLinkSchema).handler(createSsrRpc("40b504d5f882e6201483a0134c8f88c5b566a334664337c847b00819ab66c6cd"));
const googleProviders = {
  gsc: {
    providerId: GSC_OAUTH_PROVIDER_ID,
    startSelfHosted: startSelfHostedGscLink
  },
  ga4: {
    providerId: GA4_OAUTH_PROVIDER_ID,
    startSelfHosted: startSelfHostedGa4Link
  }
};
async function startGoogleLink(provider, callbackURL) {
  try {
    const config = googleProviders[provider];
    if (!isHostedClientAuthMode()) {
      const res2 = await config.startSelfHosted({ data: { callbackURL } });
      window.location.href = res2.url;
      return;
    }
    const res = await authClient.oauth2.link({
      providerId: config.providerId,
      callbackURL
    });
    if (res.error) {
      toast.error(res.error.message ?? "Could not start Google sign-in");
      return;
    }
    if (res.data?.url) window.location.href = res.data.url;
  } catch (error) {
    toast.error(getStandardErrorMessage(error));
  }
}
export {
  GoogleGlyph as G,
  setGa4Property as a,
  getGscConnection as b,
  listGscSites as c,
  disconnectGa4 as d,
  setGscSite as e,
  disconnectGsc as f,
  getGa4Connection as g,
  GoogleGlyphMuted as h,
  getGscGrantStatus as i,
  getGa4DashboardReport as j,
  listGa4Properties as l,
  startGoogleLink as s
};
