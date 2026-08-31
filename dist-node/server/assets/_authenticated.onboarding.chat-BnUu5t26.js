import { jsxs, jsx } from "react/jsx-runtime";
import { queryOptions, useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { i as createServerFn, aL as AUTUMN_PAID_PLAN_ID, aG as DEFAULT_LOCATION_CODE } from "../entry.js";
import { L as LocationSelect } from "./LocationSelect-BPALgSkR.js";
import { l as createSsrRpc, c as captureClientEvent, o as getStandardErrorMessage, H as queryClient, u as useSession } from "./router-CC5LdN6j.js";
import { z } from "zod";
import { a as requireAuthenticatedContext } from "./middleware-CwR3-L1M.js";
import { O as OnboardingAccountMenu } from "./OnboardingAccountMenu-9zjgOTmi.js";
import { u as useAgent, a as useAgentChat, b as useStickToBottom, m as messageHasVisibleContent, U as UpgradeSidebar, W as WelcomeMessage, C as ChatMessage, S as SuggestedQuestions, c as ChatGate, d as ChatComposer, F as FREE_ONBOARDING_QUESTION_LIMIT } from "./OnboardingChatParts-B3PzkXkz.js";
import { useCustomer } from "autumn-js/react";
import { b as buildCheckoutSuccessUrl } from "./checkout-url-YPxaDcBC.js";
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
import "@tanstack/react-router";
import "@tanstack/react-router/ssr/server";
import "robots-parser";
import "fast-xml-parser";
import "@tanstack/query-core";
import "./selfHostedOAuth-BpCugic0.js";
import "./ai-search-B6IOR0fs.js";
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
import "./ThemePreferenceMenuItems-DiqeZ0dq.js";
import "ai";
import "@ai-sdk/react";
import "./Markdown-Bj-WSGPs.js";
import "react-markdown";
import "remark-gfm";
const getOnboardingChatState = createServerFn({
  method: "GET"
}).middleware(requireAuthenticatedContext).handler(createSsrRpc("3dbeccce043161813d8711ff4113fda42d161033a0efa91044658e370c98be80"));
const saveSiteSchema = z.object({
  projectId: z.string().min(1),
  domain: z.string().min(1),
  locationCode: z.number().int()
});
const saveOnboardingSite = createServerFn({
  method: "POST"
}).middleware(requireAuthenticatedContext).validator(saveSiteSchema).handler(createSsrRpc("a6e76ddc449222a502da7b7425f361fcfb4df793782aee76909707bf70ee90d4"));
const TOOL_LABELS = {
  "tool-read_website": { running: "Reading site", done: "Read site" },
  "tool-get_seo_metrics": {
    running: "Getting SEO metrics",
    done: "SEO metrics"
  },
  "tool-research_keywords": {
    running: "Researching keywords",
    done: "Keyword research"
  },
  "tool-get_domain_overview": {
    running: "Analyzing domain",
    done: "Domain overview"
  },
  "tool-get_serp_results": {
    running: "Checking search results",
    done: "Search results"
  },
  "tool-find_serp_competitors": {
    running: "Finding competitors",
    done: "Competitors"
  },
  "tool-get_competitor_keywords": {
    running: "Analyzing competitor",
    done: "Competitor keywords"
  },
  "tool-get_backlinks_overview": {
    running: "Checking backlinks",
    done: "Backlinks overview"
  }
};
const resolveToolLabel = (partType) => TOOL_LABELS[partType] ?? null;
const SUGGESTED_QUESTIONS = [
  "How will OpenSEO help me get more traffic?",
  "Compare OpenSEO and Claude",
  "What do I get after I upgrade?",
  "How does the Google Search Console integration work?",
  "Right fit for consultants and agencies?"
];
const STRATEGY_SUGGESTION = "What do you recommend for my site?";
const COMPETITOR_SUGGESTION = "Compare against my competitors";
const PRIMARY_SUGGESTIONS = [STRATEGY_SUGGESTION, COMPETITOR_SUGGESTION];
function OnboardingChatConversation({
  projectId,
  domain
}) {
  const agent = useAgent({ agent: "onboarding-chat", name: projectId });
  const { messages, sendMessage, status } = useAgentChat({ agent });
  const customerQuery = useCustomer();
  const [checkoutError, setCheckoutError] = useState(null);
  const [isStartingCheckout, setIsStartingCheckout] = useState(false);
  const [usedSuggestions, setUsedSuggestions] = useState([]);
  const [strategyRequested, setStrategyRequested] = useState(false);
  const questionsUsed = messages.filter((m) => m.role === "user").length;
  const remaining = Math.max(0, FREE_ONBOARDING_QUESTION_LIMIT - questionsUsed);
  const isLocked = remaining <= 0;
  const showRemainingHint = remaining > 0 && remaining <= 3;
  const isBusy = status === "submitted" || status === "streaming";
  const { scrollRef, onScroll, pinToBottom } = useStickToBottom(
    messages,
    status
  );
  const sendText = (text) => {
    pinToBottom();
    void sendMessage({ text });
  };
  async function startCheckout() {
    setCheckoutError(null);
    setIsStartingCheckout(true);
    try {
      captureClientEvent("billing:checkout_start");
      await customerQuery.attach({
        planId: AUTUMN_PAID_PLAN_ID,
        redirectMode: "always",
        successUrl: buildCheckoutSuccessUrl("/onboarding?step=3")
      });
    } catch (checkoutErr) {
      setCheckoutError(
        getStandardErrorMessage(
          checkoutErr,
          "We couldn't start checkout. Please refresh and try again."
        )
      );
      setIsStartingCheckout(false);
    }
  }
  const lastMessage = messages[messages.length - 1];
  const suggestionPool = [
    ...strategyRequested ? [] : [STRATEGY_SUGGESTION],
    COMPETITOR_SUGGESTION,
    ...SUGGESTED_QUESTIONS
  ];
  const remainingSuggestions = suggestionPool.filter(
    (question) => !usedSuggestions.includes(question)
  );
  const showTyping = isBusy && (lastMessage?.role !== "assistant" || !messageHasVisibleContent(lastMessage));
  const showSuggestions = remainingSuggestions.length > 0 && !isBusy && (messages.length === 0 || lastMessage?.role === "assistant");
  return /* @__PURE__ */ jsxs("div", { className: "flex min-h-0 flex-1", children: [
    /* @__PURE__ */ jsx(
      UpgradeSidebar,
      {
        domain,
        questionsUsed,
        isStartingCheckout,
        onUpgrade: () => void startCheckout()
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 flex-1 flex-col", children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          ref: scrollRef,
          onScroll,
          className: "flex-1 overflow-y-auto px-5 py-6",
          children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-2xl space-y-6", children: [
            /* @__PURE__ */ jsx(
              WelcomeMessage,
              {
                domain,
                checkoutError,
                isStartingCheckout,
                onUpgrade: () => void startCheckout()
              }
            ),
            messages.map((message, index) => /* @__PURE__ */ jsx(
              ChatMessage,
              {
                message,
                resolveToolLabel,
                streaming: isBusy && index === messages.length - 1 && message.role === "assistant"
              },
              message.id
            )),
            showTyping ? /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2 pt-1 text-base-content/40", children: /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsx("span", { className: "size-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" }),
              /* @__PURE__ */ jsx("span", { className: "size-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" }),
              /* @__PURE__ */ jsx("span", { className: "size-1.5 animate-bounce rounded-full bg-current" })
            ] }) }) : null,
            status === "error" ? /* @__PURE__ */ jsx("p", { className: "text-sm text-error", children: "Something went wrong. Please refresh and try again." }) : null,
            showSuggestions ? /* @__PURE__ */ jsx(
              SuggestedQuestions,
              {
                questions: remainingSuggestions,
                primaryQuestions: PRIMARY_SUGGESTIONS,
                onSelect: (question) => {
                  setUsedSuggestions(
                    (current) => current.includes(question) ? current : [...current, question]
                  );
                  if (question === STRATEGY_SUGGESTION) {
                    setStrategyRequested(true);
                  }
                  sendText(question);
                }
              }
            ) : null
          ] })
        }
      ),
      isLocked ? /* @__PURE__ */ jsx(
        ChatGate,
        {
          isStartingCheckout,
          onUpgrade: () => void startCheckout()
        }
      ) : /* @__PURE__ */ jsx("div", { className: "flex-shrink-0 border-t border-base-300 px-5 py-3", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto w-full max-w-2xl space-y-2", children: [
        showRemainingHint ? /* @__PURE__ */ jsxs("p", { className: "px-1 text-xs text-base-content/50", children: [
          remaining,
          " free question",
          remaining === 1 ? "" : "s",
          " left.",
          " ",
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "link link-primary",
              disabled: isStartingCheckout,
              onClick: () => void startCheckout(),
              children: "Upgrade for full access"
            }
          )
        ] }) : null,
        /* @__PURE__ */ jsx(ChatComposer, { busy: isBusy, onSend: sendText })
      ] }) })
    ] })
  ] });
}
const onboardingChatStateQueryOptions = () => queryOptions({
  queryKey: ["onboardingChatState"],
  queryFn: () => getOnboardingChatState()
});
function invalidateOnboardingChatState() {
  void queryClient.invalidateQueries({ queryKey: ["onboardingChatState"] });
}
function StrategyShell({ children }) {
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 flex flex-col bg-base-100", children });
}
function OnboardingChat() {
  const stateQuery = useQuery(onboardingChatStateQueryOptions());
  const { data: session } = useSession();
  const accountMenu = /* @__PURE__ */ jsx(OnboardingAccountMenu, { email: session?.user?.email });
  if (stateQuery.isError) {
    return /* @__PURE__ */ jsx(StrategyShell, { children: /* @__PURE__ */ jsx("div", { className: "flex flex-1 items-center justify-center p-6 text-sm text-error", children: "Couldn’t load your strategy. Please refresh to try again." }) });
  }
  if (!stateQuery.data) {
    return /* @__PURE__ */ jsx(StrategyShell, { children: /* @__PURE__ */ jsxs("div", { className: "flex flex-1 items-center justify-center gap-2 p-6 text-sm text-base-content/60", children: [
      /* @__PURE__ */ jsx(Loader2, { className: "size-4 animate-spin" }),
      "Loading…"
    ] }) });
  }
  const { projectId, domain } = stateQuery.data;
  return /* @__PURE__ */ jsxs(StrategyShell, { children: [
    accountMenu,
    !domain ? /* @__PURE__ */ jsx(SiteForm, { projectId }) : /* @__PURE__ */ jsx(OnboardingChatConversation, { projectId, domain })
  ] });
}
function SiteForm({ projectId }) {
  const [domain, setDomain] = useState("");
  const [locationCode, setLocationCode] = useState(DEFAULT_LOCATION_CODE);
  const save = useMutation({
    mutationFn: () => saveOnboardingSite({ data: { projectId, domain, locationCode } }),
    onSuccess: invalidateOnboardingChatState
  });
  return /* @__PURE__ */ jsx("div", { className: "flex flex-1 items-center justify-center overflow-y-auto p-6", children: /* @__PURE__ */ jsxs(
    "form",
    {
      className: "w-full max-w-md space-y-6",
      onSubmit: (event) => {
        event.preventDefault();
        if (domain.trim()) {
          save.mutate();
        }
      },
      children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-center", children: [
          /* @__PURE__ */ jsx(
            "img",
            {
              src: "/transparent-logo.png",
              alt: "OpenSEO",
              className: "mx-auto size-10 rounded-lg"
            }
          ),
          /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold", children: "Tell us about your website." }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-base-content/60", children: "If you have multiple websites, you can set that up later." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4 rounded-lg border border-base-300 bg-base-100 p-5 shadow-sm", children: [
          /* @__PURE__ */ jsxs("label", { className: "block space-y-1", children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: "Your website" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                className: "input input-bordered w-full",
                placeholder: "example.com",
                value: domain,
                onChange: (event) => setDomain(event.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "block space-y-1", children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: "This is the country we will use when getting SEO data." }),
            /* @__PURE__ */ jsx(LocationSelect, { value: locationCode, onChange: setLocationCode })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              className: "btn btn-primary w-full",
              disabled: !domain.trim() || save.isPending,
              children: save.isPending ? "Saving…" : "Continue"
            }
          )
        ] })
      ]
    }
  ) });
}
const SplitComponent = OnboardingChat;
export {
  SplitComponent as component
};
