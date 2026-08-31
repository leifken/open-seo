import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { Link, useNavigate } from "@tanstack/react-router";
import { useRef, useState, useLayoutEffect, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronUp, ChevronDown, AlertCircle, Globe, ExternalLink, CheckCircle2, XCircle, MessageSquare, Columns3, SearchCheck, Sparkles, ArrowLeft } from "lucide-react";
import { f as formatModelLabel, a as formatCountryLabel, g as getModelAccent, S as SearchHistorySection, H as HISTORY_ITEM_LINK_CLASS, u as useTimestampedSearchHistory, b as HostedPlanGate, e as explorePrompt, A as AiSearchPaidPlanGate } from "./useTimestampedSearchHistory-BwFzEEJM.js";
import { o as getStandardErrorMessage, ad as Route } from "./router-CFUJAOTG.js";
import { P as PROMPT_EXPLORER_MAX_PROMPT_LENGTH, d as PROMPT_EXPLORER_MODELS, W as WEB_SEARCH_COUNTRY_CODES, w as webSearchCountryCodeSchema, e as promptExplorerModelSchema } from "./ai-search-B6IOR0fs.js";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { M as MARKDOWN_COMPONENTS } from "./Markdown-Bj-WSGPs.js";
import { f as formatUrlForDisplay } from "./url-D1aM6mYO.js";
import { z } from "zod";
import "../entry.js";
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
import "jose";
import "drizzle-orm/d1";
import "drizzle-orm/sqlite-core";
import "drizzle-orm";
import "drizzle-orm/postgres-js";
import "drizzle-orm/pg-core";
import "jose/errors";
import "node:os";
import "@better-auth/api-key";
import "posthog-node";
import "@modelcontextprotocol/server";
import "remeda";
import "tldts";
import "srvx";
import "@tanstack/react-router/ssr/server";
import "robots-parser";
import "fast-xml-parser";
import "./middleware-CwR3-L1M.js";
import "autumn-js/react";
import "./useLocalHistoryStore-CAiu5gzu.js";
import "@tanstack/query-core";
import "./selfHostedOAuth-BpCugic0.js";
import "./audit-D01_HjiI.js";
import "react-dom";
import "@tanstack/react-form";
import "sonner";
import "@better-auth/api-key/client";
import "papaparse";
import "@tanstack/react-table";
import "recharts";
import "./lighthouse-CiThJE4g.js";
import "./lighthouse-CxIZIYPF.js";
function isCountryCode(value) {
  return WEB_SEARCH_COUNTRY_CODES.includes(value);
}
function parseCountryCode(value) {
  return isCountryCode(value) ? value : "US";
}
function PromptExplorerForm({
  form,
  onPromptChange,
  onHighlightBrandChange,
  onModelsChange,
  onWebSearchChange,
  onCountryChange,
  onSubmit,
  isLoading,
  validationError
}) {
  const toggleModel = (model) => {
    if (form.models.includes(model)) {
      onModelsChange(form.models.filter((m) => m !== model));
    } else {
      onModelsChange([...form.models, model]);
    }
  };
  const promptCharCount = form.prompt.length;
  const promptOverLimit = promptCharCount > PROMPT_EXPLORER_MAX_PROMPT_LENGTH;
  return /* @__PURE__ */ jsx(
    "form",
    {
      onSubmit,
      className: "card border border-base-300 bg-base-100",
      children: /* @__PURE__ */ jsxs("div", { className: "card-body gap-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsx(
            "label",
            {
              className: "block text-sm font-medium",
              htmlFor: "prompt-explorer-prompt",
              children: "Prompt"
            }
          ),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              id: "prompt-explorer-prompt",
              className: `textarea textarea-bordered w-full resize-none ${promptOverLimit ? "textarea-error" : ""}`,
              rows: 3,
              value: form.prompt,
              maxLength: PROMPT_EXPLORER_MAX_PROMPT_LENGTH + 50,
              onChange: (event) => onPromptChange(event.target.value),
              "aria-invalid": promptOverLimit ? true : void 0,
              autoFocus: true
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-xs text-base-content/60", children: [
            /* @__PURE__ */ jsx("span", { children: "What your customers might ask AI." }),
            /* @__PURE__ */ jsxs(
              "span",
              {
                className: `tabular-nums ${promptOverLimit ? "font-medium text-error" : ""}`,
                children: [
                  promptCharCount,
                  "/",
                  PROMPT_EXPLORER_MAX_PROMPT_LENGTH
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-5 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsx(
              "label",
              {
                className: "block text-sm font-medium",
                htmlFor: "prompt-explorer-brand",
                children: "Highlight brand (optional)"
              }
            ),
            /* @__PURE__ */ jsx(
              "input",
              {
                id: "prompt-explorer-brand",
                type: "text",
                className: "input input-bordered w-full",
                value: form.highlightBrand,
                onChange: (event) => onHighlightBrandChange(event.target.value),
                autoComplete: "off",
                spellCheck: false
              }
            ),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-base-content/60", children: "We'll flag whether each model mentions this brand." })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsx("span", { className: "block text-sm font-medium", children: "Models" }),
            /* @__PURE__ */ jsx("div", { className: "flex flex-wrap items-center gap-x-5 gap-y-2 pt-1.5", children: PROMPT_EXPLORER_MODELS.map((model) => {
              const isActive = form.models.includes(model);
              return /* @__PURE__ */ jsxs(
                "label",
                {
                  className: "flex cursor-pointer items-center gap-2",
                  children: [
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "checkbox",
                        className: "checkbox checkbox-sm",
                        checked: isActive,
                        onChange: () => toggleModel(model)
                      }
                    ),
                    /* @__PURE__ */ jsx("span", { className: "text-sm", children: formatModelLabel(model) })
                  ]
                },
                model
              );
            }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3 border-t border-base-300 pt-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
            /* @__PURE__ */ jsxs("label", { className: "flex cursor-pointer items-center gap-2", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "checkbox",
                  className: "checkbox checkbox-sm",
                  checked: form.webSearch,
                  onChange: (event) => onWebSearchChange(event.target.checked)
                }
              ),
              /* @__PURE__ */ jsx("span", { className: "text-sm", children: "Allow web search (more current answers)" })
            ] }),
            /* @__PURE__ */ jsx(
              "select",
              {
                id: "prompt-explorer-country",
                "aria-label": "Web search location",
                className: "select select-bordered select-sm min-w-0 sm:max-w-xs",
                value: form.webSearchCountryCode,
                onChange: (event) => onCountryChange(parseCountryCode(event.target.value)),
                disabled: !form.webSearch,
                children: WEB_SEARCH_COUNTRY_CODES.map((code) => /* @__PURE__ */ jsx("option", { value: code, children: formatCountryLabel(code) }, code))
              }
            )
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              className: "btn btn-primary shrink-0 px-6",
              disabled: isLoading || form.models.length === 0,
              children: isLoading ? "Running…" : "Run"
            }
          )
        ] }),
        validationError ? /* @__PURE__ */ jsx("p", { className: "text-sm text-error", children: validationError }) : null
      ] })
    }
  );
}
const COLLAPSED_MAX_PX = 240;
function MarkdownAnswer({ text }) {
  const contentRef = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [needsCollapse, setNeedsCollapse] = useState(false);
  const { thinking, body } = extractThinkingBlocks(text);
  const normalized = normalizeLlmMarkdown(body);
  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    setNeedsCollapse(el.scrollHeight > COLLAPSED_MAX_PX + 8);
  }, [normalized]);
  if (normalized.trim().length === 0 && thinking.length === 0) {
    return /* @__PURE__ */ jsx("p", { className: "text-sm text-base-content/60 italic", children: "Model returned an empty response." });
  }
  const isCollapsed = needsCollapse && !expanded;
  return /* @__PURE__ */ jsxs("div", { className: "text-sm leading-relaxed", children: [
    thinking.map((block, index) => /* @__PURE__ */ jsx(ThinkingBlock, { text: block }, index)),
    normalized.trim().length > 0 ? /* @__PURE__ */ jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          ref: contentRef,
          style: isCollapsed ? { maxHeight: `${COLLAPSED_MAX_PX}px` } : void 0,
          className: isCollapsed ? "overflow-hidden" : void 0,
          children: /* @__PURE__ */ jsx(
            ReactMarkdown,
            {
              remarkPlugins: [remarkGfm],
              components: MARKDOWN_COMPONENTS,
              children: normalized
            }
          )
        }
      ),
      isCollapsed ? /* @__PURE__ */ jsx(
        "div",
        {
          "aria-hidden": true,
          className: "pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-base-100 to-transparent"
        }
      ) : null
    ] }) : null,
    needsCollapse ? /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: () => setExpanded((prev) => !prev),
        className: "mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline",
        "aria-expanded": expanded,
        children: expanded ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(ChevronUp, { className: "size-3.5" }),
          "Show less"
        ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(ChevronDown, { className: "size-3.5" }),
          "Read more"
        ] })
      }
    ) : null
  ] });
}
function ThinkingBlock({ text }) {
  return /* @__PURE__ */ jsxs(
    "details",
    {
      open: true,
      className: "group mb-3 rounded-lg border border-base-300 bg-base-200/40",
      children: [
        /* @__PURE__ */ jsxs("summary", { className: "flex cursor-pointer list-none items-center gap-2 px-3 py-2 text-xs font-medium text-base-content/70 hover:text-base-content", children: [
          /* @__PURE__ */ jsx(ChevronDown, { className: "size-3.5 transition-transform group-open:rotate-180" }),
          "Model Thinking"
        ] }),
        /* @__PURE__ */ jsx("pre", { className: "overflow-x-auto whitespace-pre-wrap break-words rounded-b-lg border-t border-base-300 bg-base-200/60 px-3 py-2.5 text-xs font-mono text-base-content/80", children: text })
      ]
    }
  );
}
function extractThinkingBlocks(text) {
  const thinking = [];
  let body = text;
  body = body.replace(/<think>([\s\S]*?)<\/think>/gi, (_, inner) => {
    thinking.push(inner.trim());
    return "";
  });
  body = body.replace(/<think>([\s\S]*)$/i, (_, inner) => {
    thinking.push(inner.trim());
    return "";
  });
  return { thinking, body };
}
function normalizeLlmMarkdown(text) {
  return text.replace(
    /^([ \t]*)([-*+]|\d+\.)[ \t]*\r?\n[ \t]*\r?\n(?=\S)(?![ \t]*(?:[-*+]|\d+\.)[ \t])/gm,
    "$1$2 "
  );
}
function PromptExplorerResults({ result }) {
  return /* @__PURE__ */ jsx("div", { className: "space-y-5", children: result.results.map((modelResult) => /* @__PURE__ */ jsx(
    ModelResultCard,
    {
      modelResult,
      highlightBrand: result.highlightBrand
    },
    modelResult.model
  )) });
}
function ModelResultCard({
  modelResult,
  highlightBrand
}) {
  const accent = getModelAccent(modelResult.model);
  if (modelResult.status === "error") {
    return /* @__PURE__ */ jsxs(
      "article",
      {
        className: `overflow-hidden rounded-r-lg border border-base-300 border-l-4 ${accent.border} bg-base-100`,
        children: [
          /* @__PURE__ */ jsx(
            ModelHeader,
            {
              model: modelResult.model,
              modelName: null,
              tokens: null,
              webSearch: false,
              brandMentioned: null,
              highlightBrand: null,
              status: "error"
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2 px-5 py-4 text-sm text-error", children: [
            /* @__PURE__ */ jsx(AlertCircle, { className: "mt-0.5 size-4 shrink-0" }),
            /* @__PURE__ */ jsx("span", { children: modelResult.message })
          ] })
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxs(
    "article",
    {
      className: `overflow-hidden rounded-r-lg border border-base-300 border-l-4 ${accent.border} bg-base-100`,
      children: [
        /* @__PURE__ */ jsx(
          ModelHeader,
          {
            model: modelResult.model,
            modelName: modelResult.modelName,
            tokens: modelResult.outputTokens,
            webSearch: modelResult.webSearch,
            brandMentioned: modelResult.brandMentioned,
            highlightBrand,
            status: "success"
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "px-5 py-5", children: /* @__PURE__ */ jsx(MarkdownAnswer, { text: modelResult.text }) }),
        modelResult.citations.length > 0 ? /* @__PURE__ */ jsx(
          CitationsList,
          {
            citations: modelResult.citations,
            highlightBrand
          }
        ) : null,
        modelResult.fanOutQueries.length > 0 ? /* @__PURE__ */ jsxs("div", { className: "border-t border-base-200 px-5 py-3", children: [
          /* @__PURE__ */ jsx("p", { className: "mb-2 text-xs font-medium uppercase tracking-wider text-base-content/50", children: "Related queries the model considered" }),
          /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1.5", children: modelResult.fanOutQueries.map((query, index) => /* @__PURE__ */ jsx(
            "span",
            {
              className: "rounded-full border border-base-300 px-2.5 py-0.5 text-xs text-base-content/70",
              children: query
            },
            `${query}-${index}`
          )) })
        ] }) : null
      ]
    }
  );
}
function CitationsList({
  citations,
  highlightBrand
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? citations : citations.slice(0, 3);
  const remaining = citations.length - visible.length;
  return /* @__PURE__ */ jsxs("div", { className: "border-t border-base-200 bg-base-200/30 px-5 py-3", children: [
    /* @__PURE__ */ jsxs("p", { className: "mb-2 text-xs font-medium uppercase tracking-wider text-base-content/50", children: [
      "Cited sources (",
      citations.length,
      ")"
    ] }),
    /* @__PURE__ */ jsx("ul", { className: "space-y-1.5", children: visible.map((citation, index) => /* @__PURE__ */ jsxs(
      "li",
      {
        className: "flex items-start gap-2 text-sm",
        children: [
          /* @__PURE__ */ jsx("span", { className: "mt-1 size-1 shrink-0 rounded-full bg-base-content/30" }),
          /* @__PURE__ */ jsxs(
            "a",
            {
              href: citation.url,
              target: "_blank",
              rel: "noreferrer",
              className: `link inline-flex items-start gap-1 ${citation.matchedBrand ? "link-primary font-medium" : ""}`,
              children: [
                /* @__PURE__ */ jsx("span", { className: "break-all", children: citation.title || formatUrlForDisplay(citation.url) }),
                /* @__PURE__ */ jsx(ExternalLink, { className: "mt-1 size-3 shrink-0" })
              ]
            }
          ),
          citation.matchedBrand && highlightBrand ? /* @__PURE__ */ jsx("span", { className: "badge badge-primary badge-xs", children: highlightBrand }) : null
        ]
      },
      `${citation.url}-${index}`
    )) }),
    citations.length > 3 ? /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: () => setExpanded((current) => !current),
        className: "mt-1.5 text-xs text-base-content/50 hover:text-base-content",
        children: expanded ? "Show less" : `+${remaining} more`
      }
    ) : null
  ] });
}
function ModelHeader({
  model,
  modelName,
  tokens,
  webSearch,
  brandMentioned,
  highlightBrand,
  status
}) {
  const accent = getModelAccent(model);
  return /* @__PURE__ */ jsxs("header", { className: "flex flex-wrap items-center justify-between gap-2 border-b border-base-200 bg-base-200/40 px-5 py-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ jsx("span", { className: `size-2 rounded-full ${accent.dot}` }),
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold", children: formatModelLabel(model) }),
      modelName ? /* @__PURE__ */ jsx("code", { className: "text-xs text-base-content/50", children: modelName }) : null,
      status === "error" ? /* @__PURE__ */ jsx("span", { className: "badge badge-error badge-sm", children: "Error" }) : null,
      /* @__PURE__ */ jsx(
        BrandMentionBadge,
        {
          mentioned: brandMentioned,
          highlightBrand
        }
      ),
      webSearch ? /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 text-xs text-base-content/60", children: [
        /* @__PURE__ */ jsx(Globe, { className: "size-3" }),
        "web search"
      ] }) : null
    ] }),
    tokens != null ? /* @__PURE__ */ jsxs("span", { className: "text-xs tabular-nums text-base-content/50", children: [
      tokens.toLocaleString(),
      " tokens"
    ] }) : null
  ] });
}
function BrandMentionBadge({
  mentioned,
  highlightBrand
}) {
  if (mentioned == null || !highlightBrand) return null;
  if (mentioned) {
    return /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-xs font-medium text-success", children: [
      /* @__PURE__ */ jsx(CheckCircle2, { className: "size-3" }),
      highlightBrand
    ] });
  }
  return /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-base-200 px-2 py-0.5 text-xs text-base-content/60", children: [
    /* @__PURE__ */ jsx(XCircle, { className: "size-3" }),
    "no ",
    highlightBrand
  ] });
}
function PromptExplorerLoadingState({ modelCount }) {
  const count = Math.max(1, modelCount);
  return /* @__PURE__ */ jsx("div", { className: "space-y-5", "aria-busy": true, children: Array.from({ length: count }).map((_, index) => /* @__PURE__ */ jsxs(
    "article",
    {
      className: "overflow-hidden rounded-r-lg border border-base-300 border-l-4 border-l-base-300 bg-base-100",
      children: [
        /* @__PURE__ */ jsxs("header", { className: "flex items-center justify-between border-b border-base-200 bg-base-200/40 px-5 py-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("div", { className: "skeleton size-2 rounded-full" }),
            /* @__PURE__ */ jsx("div", { className: "skeleton h-4 w-20" }),
            /* @__PURE__ */ jsx("div", { className: "skeleton h-3 w-32" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "skeleton h-3 w-16" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2 px-5 py-5", children: [
          /* @__PURE__ */ jsx("div", { className: "skeleton h-3 w-full" }),
          /* @__PURE__ */ jsx("div", { className: "skeleton h-3 w-11/12" }),
          /* @__PURE__ */ jsx("div", { className: "skeleton h-3 w-10/12" }),
          /* @__PURE__ */ jsx("div", { className: "skeleton h-3 w-9/12" })
        ] })
      ]
    },
    index
  )) });
}
function PromptExplorerHistorySection({ projectId, ...props }) {
  return /* @__PURE__ */ jsx(
    SearchHistorySection,
    {
      ...props,
      emptyIcon: MessageSquare,
      emptyMessage: "Enter a prompt to compare model answers",
      noun: "prompt",
      renderItemLink: (item, content) => /* @__PURE__ */ jsx(
        Link,
        {
          from: "/p/$projectId/prompt-explorer",
          to: "/p/$projectId/prompt-explorer",
          params: { projectId },
          search: {
            q: item.prompt,
            models: item.models,
            web: item.webSearch ? void 0 : false,
            cc: item.webSearchCountryCode === "US" ? void 0 : item.webSearchCountryCode,
            hb: item.highlightBrand || void 0
          },
          replace: true,
          className: HISTORY_ITEM_LINK_CLASS,
          children: content
        }
      ),
      renderItem: (item) => /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("p", { className: "font-medium text-base-content truncate", children: item.prompt }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-base-content/60 truncate", children: item.models.map(formatModelLabel).join(", ") })
      ] })
    }
  );
}
const promptExplorerSearchBodySchema = z.object({
  prompt: z.string(),
  highlightBrand: z.string(),
  models: z.array(promptExplorerModelSchema),
  webSearch: z.boolean(),
  webSearchCountryCode: webSearchCountryCodeSchema
});
function sameModels(a, b) {
  if (a.length !== b.length) return false;
  const sortedA = a.toSorted();
  const sortedB = b.toSorted();
  return sortedA.every((model, index) => model === sortedB[index]);
}
function isSameSearch(a, b) {
  return a.prompt === b.prompt && a.highlightBrand === b.highlightBrand && a.webSearch === b.webSearch && a.webSearchCountryCode === b.webSearchCountryCode && sameModels(a.models, b.models);
}
function usePromptExplorerSearchHistory(projectId) {
  return useTimestampedSearchHistory({
    storageKey: `prompt-explorer-search-history:${projectId}`,
    bodySchema: promptExplorerSearchBodySchema,
    isSame: isSameSearch
  });
}
const PROMPT_EXPLORER_BULLETS = [
  {
    icon: Columns3,
    title: "Four models side-by-side",
    body: "Run one prompt across ChatGPT, Claude, Gemini, and Perplexity and compare answers in a single view."
  },
  {
    icon: SearchCheck,
    title: "See what the models cite",
    body: "Every answer lists the sources it drew from, so you can audit where each model gets its information."
  },
  {
    icon: Sparkles,
    title: "Check brand mentions",
    body: "Highlight a brand to instantly see whether it shows up in the answer text or the cited sources."
  }
];
function PromptExplorerPage(props) {
  return /* @__PURE__ */ jsx(HostedPlanGate, { children: (planGate) => /* @__PURE__ */ jsx(PromptExplorerPageInner, { ...props, planGate }) });
}
function PromptExplorerPageInner({
  projectId,
  urlState,
  onSubmit,
  planGate
}) {
  const [form, setForm] = useState(urlState);
  const [validationError, setValidationError] = useState(null);
  const {
    history,
    isLoaded: historyLoaded,
    addSearch,
    removeHistoryItem
  } = usePromptExplorerSearchHistory(projectId);
  const trimmedPrompt = urlState.prompt.trim();
  const hasActivePrompt = trimmedPrompt.length > 0;
  const exploreQuery = useQuery({
    queryKey: [
      "prompt-explorer",
      projectId,
      trimmedPrompt,
      urlState.models.toSorted().join(","),
      urlState.webSearch,
      urlState.webSearchCountryCode,
      urlState.highlightBrand.trim()
    ],
    queryFn: () => explorePrompt({
      data: {
        projectId,
        prompt: trimmedPrompt,
        models: urlState.models,
        highlightBrand: urlState.highlightBrand.trim() || void 0,
        webSearch: urlState.webSearch,
        webSearchCountryCode: urlState.webSearchCountryCode
      }
    }),
    // Client-side gate is a UX optimization only; the paywall is enforced
    // server-side (explorePrompt → assertPaidPlan) before any DataForSEO spend,
    // so a stale free-plan window here just yields a rejected request, not cost.
    enabled: hasActivePrompt && urlState.models.length > 0 && !planGate.isFreePlan,
    staleTime: 5 * 60 * 1e3,
    retry: false
  });
  useEffect(() => {
    setForm(urlState);
    setValidationError(null);
  }, [urlState]);
  const lastAddedKeyRef = useRef(null);
  useEffect(() => {
    if (!hasActivePrompt || !exploreQuery.isSuccess) return;
    const key = [
      trimmedPrompt,
      urlState.highlightBrand.trim(),
      urlState.models.toSorted().join(","),
      urlState.webSearch,
      urlState.webSearchCountryCode
    ].join("|");
    if (lastAddedKeyRef.current === key) return;
    lastAddedKeyRef.current = key;
    addSearch({
      prompt: trimmedPrompt,
      highlightBrand: urlState.highlightBrand.trim(),
      models: urlState.models,
      webSearch: urlState.webSearch,
      webSearchCountryCode: urlState.webSearchCountryCode
    });
  }, [
    hasActivePrompt,
    exploreQuery.isSuccess,
    trimmedPrompt,
    urlState.highlightBrand,
    urlState.models,
    urlState.webSearch,
    urlState.webSearchCountryCode,
    addSearch
  ]);
  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = form.prompt.trim();
    if (trimmed.length === 0) {
      setValidationError("Enter a prompt");
      return;
    }
    if (trimmed.length > PROMPT_EXPLORER_MAX_PROMPT_LENGTH) {
      setValidationError(
        `Keep prompts under ${PROMPT_EXPLORER_MAX_PROMPT_LENGTH} characters`
      );
      return;
    }
    if (form.models.length === 0) {
      setValidationError("Select at least one model");
      return;
    }
    setValidationError(null);
    onSubmit({
      ...form,
      prompt: trimmed,
      highlightBrand: form.highlightBrand.trim()
    });
  };
  const errorMessage = exploreQuery.isError ? getStandardErrorMessage(exploreQuery.error) : null;
  const isLoading = hasActivePrompt && exploreQuery.isPending;
  const resultData = hasActivePrompt ? exploreQuery.data : void 0;
  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (validationError) setValidationError(null);
  };
  return /* @__PURE__ */ jsx("div", { className: "px-4 py-4 pb-24 overflow-auto md:px-6 md:py-6 md:pb-8", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-7xl space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold", children: "Prompt Explorer" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-base-content/70", children: "Ask any prompt across ChatGPT, Claude, Gemini, and Perplexity side-by-side." })
    ] }),
    planGate.isFreePlan ? /* @__PURE__ */ jsx(
      AiSearchPaidPlanGate,
      {
        feature: "Prompt Explorer",
        description: "Ask one prompt across ChatGPT, Claude, Gemini, and Perplexity at the same time and compare their answers — including which sources each model cites.",
        bullets: PROMPT_EXPLORER_BULLETS
      }
    ) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(
        PromptExplorerForm,
        {
          form,
          onPromptChange: (value) => updateForm("prompt", value),
          onHighlightBrandChange: (value) => updateForm("highlightBrand", value),
          onModelsChange: (value) => updateForm("models", value),
          onWebSearchChange: (value) => updateForm("webSearch", value),
          onCountryChange: (value) => updateForm("webSearchCountryCode", value),
          onSubmit: handleSubmit,
          isLoading,
          validationError
        }
      ),
      errorMessage ? /* @__PURE__ */ jsxs(
        "div",
        {
          role: "alert",
          className: "flex items-start gap-2 rounded-lg border border-error/30 bg-error/10 p-3 text-sm text-error",
          children: [
            /* @__PURE__ */ jsx(AlertCircle, { className: "mt-0.5 size-4 shrink-0" }),
            /* @__PURE__ */ jsx("span", { children: errorMessage })
          ]
        }
      ) : null,
      isLoading ? /* @__PURE__ */ jsx(PromptExplorerLoadingState, { modelCount: form.models.length }) : resultData ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs(
          Link,
          {
            from: "/p/$projectId/prompt-explorer",
            to: "/p/$projectId/prompt-explorer",
            params: { projectId },
            search: {},
            replace: true,
            className: "btn btn-ghost btn-sm gap-2 px-0 text-base-content/70 hover:bg-transparent",
            children: [
              /* @__PURE__ */ jsx(ArrowLeft, { className: "size-4" }),
              "Recent searches"
            ]
          }
        ) }),
        /* @__PURE__ */ jsx(PromptExplorerResults, { result: resultData })
      ] }) : !errorMessage ? /* @__PURE__ */ jsx(
        PromptExplorerHistorySection,
        {
          projectId,
          history,
          historyLoaded,
          onRemoveHistoryItem: removeHistoryItem
        }
      ) : null
    ] })
  ] }) });
}
function PromptExplorerRoute() {
  const {
    projectId
  } = Route.useParams();
  const navigate = useNavigate({
    from: Route.fullPath
  });
  const search = Route.useSearch();
  return /* @__PURE__ */ jsx(PromptExplorerPage, { projectId, urlState: {
    prompt: search.q ?? "",
    highlightBrand: search.hb ?? "",
    models: search.models && search.models.length > 0 ? search.models : [...PROMPT_EXPLORER_MODELS],
    webSearch: search.web ?? true,
    webSearchCountryCode: search.cc ?? "US"
  }, onSubmit: (values) => {
    void navigate({
      search: {
        q: values.prompt,
        models: values.models,
        web: values.webSearch ? void 0 : false,
        cc: values.webSearchCountryCode === "US" ? void 0 : values.webSearchCountryCode,
        hb: values.highlightBrand || void 0
      },
      replace: true
    });
  } });
}
export {
  PromptExplorerRoute as component
};
