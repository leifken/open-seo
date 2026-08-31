import { jsx, jsxs } from "react/jsx-runtime";
const OPENROUTER_KEYS_URL = "https://openrouter.ai/settings/keys";
function OpenrouterApiKeyHelpPage() {
  return /* @__PURE__ */ jsx("div", { className: "px-4 py-4 md:px-6 md:py-6 pb-24 md:pb-8 overflow-auto", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-3xl space-y-4", children: [
    /* @__PURE__ */ jsx("div", { className: "card bg-base-100 border border-base-300", children: /* @__PURE__ */ jsxs("div", { className: "card-body gap-3", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold", children: "Set up your OpenRouter API key" }),
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-base-content/70", children: [
        "OpenSEO needs the ",
        /* @__PURE__ */ jsx("code", { children: "OPENROUTER_API_KEY" }),
        " secret before AI features like SAM, the in-app SEO agent, can run. It is optional — everything else in OpenSEO works without it."
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "card bg-base-100 border border-base-300", children: /* @__PURE__ */ jsxs("div", { className: "card-body gap-4", children: [
      /* @__PURE__ */ jsx("h2", { className: "card-title text-base", children: "Steps" }),
      /* @__PURE__ */ jsxs("ol", { className: "list-decimal pl-5 text-sm space-y-3 text-base-content/80", children: [
        /* @__PURE__ */ jsxs("li", { children: [
          "Create an account at",
          " ",
          /* @__PURE__ */ jsx("a", { className: "link link-primary", href: "https://openrouter.ai", target: "_blank", rel: "noreferrer", children: "openrouter.ai" }),
          " ",
          "and add credits (pay-as-you-go, like DataForSEO)."
        ] }),
        /* @__PURE__ */ jsxs("li", { children: [
          "Go to",
          " ",
          /* @__PURE__ */ jsx("a", { className: "link link-primary", href: OPENROUTER_KEYS_URL, target: "_blank", rel: "noreferrer", children: "OpenRouter API Keys" }),
          " ",
          'and click "Create API Key".'
        ] }),
        /* @__PURE__ */ jsxs("li", { children: [
          "Save the key as the ",
          /* @__PURE__ */ jsx("code", { children: "OPENROUTER_API_KEY" }),
          " secret in your environment:",
          /* @__PURE__ */ jsxs("ul", { className: "list-disc pl-5 mt-2 space-y-1", children: [
            /* @__PURE__ */ jsxs("li", { children: [
              "Docker self-hosting: ",
              /* @__PURE__ */ jsx("code", { children: ".env" })
            ] }),
            /* @__PURE__ */ jsx("li", { children: "Cloudflare: set it in the Workers UI (see below)" }),
            /* @__PURE__ */ jsxs("li", { children: [
              "Local development: ",
              /* @__PURE__ */ jsx("code", { children: ".env.local" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("li", { children: "Restart OpenSEO." })
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
          /* @__PURE__ */ jsx("code", { className: "mx-1", children: "OPENROUTER_API_KEY" }),
          "."
        ] }),
        /* @__PURE__ */ jsx("li", { children: "Paste your OpenRouter API key and save." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "divider my-1" }),
      /* @__PURE__ */ jsx("p", { children: "Or set the same secret from your terminal with:" }),
      /* @__PURE__ */ jsx("pre", { className: "p-3 rounded bg-base-200 border border-base-300 overflow-x-auto text-xs", children: /* @__PURE__ */ jsx("code", { children: "npx wrangler secret put OPENROUTER_API_KEY" }) }),
      /* @__PURE__ */ jsx("p", { children: "Paste your OpenRouter API key when prompted." })
    ] }) })
  ] }) });
}
export {
  OpenrouterApiKeyHelpPage as component
};
