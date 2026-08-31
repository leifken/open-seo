import { jsx, jsxs } from "react/jsx-runtime";
const DATAFORSEO_API_ACCESS_URL = "https://app.dataforseo.com/api-access";
function DataforseoApiKeyHelpPage() {
  return /* @__PURE__ */ jsx("div", { className: "px-4 py-4 md:px-6 md:py-6 pb-24 md:pb-8 overflow-auto", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-3xl space-y-4", children: [
    /* @__PURE__ */ jsx("div", { className: "card bg-base-100 border border-base-300", children: /* @__PURE__ */ jsxs("div", { className: "card-body gap-3", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold", children: "Set up your DataForSEO API key" }),
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-base-content/70", children: [
        "OpenSEO needs the ",
        /* @__PURE__ */ jsx("code", { children: "DATAFORSEO_API_KEY" }),
        " secret before keyword, domain, and SEO data workflows can run."
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "card bg-base-100 border border-base-300", children: /* @__PURE__ */ jsxs("div", { className: "card-body gap-4", children: [
      /* @__PURE__ */ jsx("h2", { className: "card-title text-base", children: "Steps" }),
      /* @__PURE__ */ jsxs("ol", { className: "list-decimal pl-5 text-sm space-y-3 text-base-content/80", children: [
        /* @__PURE__ */ jsxs("li", { children: [
          "Go to",
          " ",
          /* @__PURE__ */ jsx("a", { className: "link link-primary", href: DATAFORSEO_API_ACCESS_URL, target: "_blank", rel: "noreferrer", children: "DataForSEO API Access" }),
          " ",
          "and request API credentials by email."
        ] }),
        /* @__PURE__ */ jsxs("li", { children: [
          "Base64 encode your DataForSEO login and API password in this format:",
          /* @__PURE__ */ jsx("pre", { className: "mt-2 p-3 rounded bg-base-200 border border-base-300 overflow-x-auto text-xs", children: /* @__PURE__ */ jsx("code", { children: "printf '%s' 'YOUR_LOGIN:YOUR_PASSWORD' | base64" }) })
        ] }),
        /* @__PURE__ */ jsxs("li", { children: [
          "Save the output as the ",
          /* @__PURE__ */ jsx("code", { children: "DATAFORSEO_API_KEY" }),
          " secret in your environment."
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "card bg-base-100 border border-base-300", children: /* @__PURE__ */ jsxs("div", { className: "card-body gap-2 text-sm text-base-content/75", children: [
      /* @__PURE__ */ jsx("h2", { className: "card-title text-base", children: "Cloudflare Workers (Dashboard UI)" }),
      /* @__PURE__ */ jsxs("ol", { className: "list-decimal pl-5 space-y-2 text-sm text-base-content/80", children: [
        /* @__PURE__ */ jsxs("li", { children: [
          "In Cloudflare, go to ",
          /* @__PURE__ */ jsx("code", { children: "Compute" }),
          " ->",
          " ",
          /* @__PURE__ */ jsx("code", { children: "Workers & Pages" }),
          "and open your OpenSEO Worker."
        ] }),
        /* @__PURE__ */ jsxs("li", { children: [
          "Open ",
          /* @__PURE__ */ jsx("code", { children: "Settings" }),
          "."
        ] }),
        /* @__PURE__ */ jsxs("li", { children: [
          "Go to ",
          /* @__PURE__ */ jsx("code", { children: "Variables & Secrets" }),
          " and add a new secret named",
          /* @__PURE__ */ jsx("code", { className: "mx-1", children: "DATAFORSEO_API_KEY" }),
          "."
        ] }),
        /* @__PURE__ */ jsx("li", { children: "Paste the base64 value from the terminal command above and save." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "divider my-1" }),
      /* @__PURE__ */ jsx("p", { children: "Or set the same secret from your terminal with:" }),
      /* @__PURE__ */ jsx("pre", { className: "p-3 rounded bg-base-200 border border-base-300 overflow-x-auto text-xs", children: /* @__PURE__ */ jsx("code", { children: "npx wrangler secret put DATAFORSEO_API_KEY" }) }),
      /* @__PURE__ */ jsxs("p", { children: [
        "Use the base64 value of ",
        /* @__PURE__ */ jsx("code", { children: "login:password" }),
        " when prompted."
      ] })
    ] }) })
  ] }) });
}
export {
  DataforseoApiKeyHelpPage as component
};
