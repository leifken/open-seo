import { jsx, jsxs } from "react/jsx-runtime";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useRef, useEffect, Suspense } from "react";
import { Wrench, ShieldAlert, Brain, Loader2, Plus } from "lucide-react";
import { i as invalidateSamSessions, s as samSessionsQueryOptions, c as createSamSession } from "./samQueries-Coo8RfEC.js";
import { l as createSsrRpc, o as getStandardErrorMessage, ac as Route } from "./router-CC5LdN6j.js";
import { i as createServerFn, aC as isHostedClientAuthMode } from "../entry.js";
import { z } from "zod";
import { r as requireProjectContext } from "./middleware-CwR3-L1M.js";
import { a as useAgentChat$1, u as useAgent, b as useStickToBottom, m as messageHasVisibleContent, C as ChatMessage, h as humanizeToolLabel, d as ChatComposer } from "./OnboardingChatParts-B3PzkXkz.js";
import "@tanstack/query-core";
import "./selfHostedOAuth-BpCugic0.js";
import "drizzle-orm";
import "jose";
import "./ai-search-B6IOR0fs.js";
import "./audit-D01_HjiI.js";
import "autumn-js/react";
import "react-dom";
import "@tanstack/react-form";
import "sonner";
import "@better-auth/api-key/client";
import "papaparse";
import "@tanstack/react-table";
import "remeda";
import "recharts";
import "./lighthouse-CiThJE4g.js";
import "./lighthouse-CxIZIYPF.js";
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
import "drizzle-orm/d1";
import "drizzle-orm/sqlite-core";
import "drizzle-orm/postgres-js";
import "drizzle-orm/pg-core";
import "jose/errors";
import "node:os";
import "@better-auth/api-key";
import "posthog-node";
import "@modelcontextprotocol/server";
import "tldts";
import "srvx";
import "@tanstack/react-router/ssr/server";
import "robots-parser";
import "fast-xml-parser";
import "ai";
import "@ai-sdk/react";
import "./Markdown-Bj-WSGPs.js";
import "react-markdown";
import "remark-gfm";
const projectScopedSchema = z.object({
  projectId: z.string().min(1)
});
const getSamAccessSetupStatus = createServerFn({
  method: "GET"
}).middleware(requireProjectContext).validator(projectScopedSchema).handler(createSsrRpc("57eebe4b148ecd8baeab46c7dc1c92b78de5e9a45d9f805e437b74cda250d02e"));
function useSamAccess(projectId) {
  const isHosted = isHostedClientAuthMode();
  const { data, error, isRefetching, refetch } = useQuery({
    queryKey: ["samAccessStatus", projectId],
    queryFn: () => getSamAccessSetupStatus({ data: { projectId } }),
    enabled: !isHosted,
    refetchOnWindowFocus: false,
    staleTime: 60 * 1e3
  });
  const onRetry = useCallback(() => {
    void refetch();
  }, [refetch]);
  if (isHosted) {
    return {
      showSetupGate: false,
      errorMessage: null,
      isRefetching: false,
      onRetry
    };
  }
  const resolved = data !== void 0 || error != null;
  return {
    showSetupGate: resolved && !(data?.enabled ?? false),
    errorMessage: data?.errorMessage ?? (error ? getStandardErrorMessage(
      error,
      "Could not load AI agent setup status."
    ) : null),
    isRefetching,
    onRetry
  };
}
function SamSetupGate({
  errorMessage,
  isRefetching,
  onRetry
}) {
  return /* @__PURE__ */ jsx("section", { children: /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-base-300 bg-base-100 p-6 md:p-7 space-y-5", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: "rounded-xl bg-warning/15 p-2.5 text-warning shrink-0", children: /* @__PURE__ */ jsx(Wrench, { className: "size-5" }) }),
      /* @__PURE__ */ jsxs("div", { className: "max-w-3xl space-y-1.5", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold", children: "Enable AI Features" }),
        /* @__PURE__ */ jsxs("div", { className: "text-sm text-base-content/68", children: [
          "SAM, OpenSEO's in-app AI agent, needs an OpenRouter API key. Create a key on OpenRouter, set it as the",
          " ",
          /* @__PURE__ */ jsx("code", { children: "OPENROUTER_API_KEY" }),
          " environment variable, restart OpenSEO, then confirm here."
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-xs text-base-content/50", children: [
          "Step-by-step instructions for every deployment are in the",
          " ",
          /* @__PURE__ */ jsx(
            Link,
            {
              className: "underline underline-offset-2 hover:text-base-content/70",
              to: "/help/openrouter-api-key",
              children: "OpenRouter API key setup guide"
            }
          ),
          "."
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          className: "btn btn-primary",
          onClick: onRetry,
          disabled: isRefetching,
          children: isRefetching ? "Confirming..." : "Confirm API Key"
        }
      ),
      /* @__PURE__ */ jsx(
        "a",
        {
          className: "btn",
          href: "https://openrouter.ai/settings/keys",
          target: "_blank",
          rel: "noreferrer",
          children: "Open OpenRouter Keys"
        }
      )
    ] }),
    errorMessage ? /* @__PURE__ */ jsxs("div", { className: "alert alert-warning", children: [
      /* @__PURE__ */ jsx(ShieldAlert, { className: "size-4 shrink-0" }),
      /* @__PURE__ */ jsx("span", { children: errorMessage })
    ] }) : null
  ] }) });
}
const _thinkReactWarnings = /* @__PURE__ */ new Set();
function isProductionRuntime() {
  return globalThis.process?.env?.NODE_ENV === "production";
}
function useAgentChat(options) {
  const maybeSyncMessagesToServer = options.syncMessagesToServer;
  if (!isProductionRuntime() && maybeSyncMessagesToServer && !_thinkReactWarnings.has("syncMessagesToServer")) {
    _thinkReactWarnings.add("syncMessagesToServer");
    console.warn("[@cloudflare/think] `syncMessagesToServer` has no effect: Think ignores client-pushed transcripts. `setMessages` updates the local view only. Use `clearHistory()` for persisted clears.");
  }
  return useAgentChat$1({
    ...options,
    syncMessagesToServer: false
  });
}
const SUGGESTIONS = [
  "What keywords should I focus on next?",
  "Who are my top SERP competitors?",
  "How is my Search Console traffic trending?",
  "Find quick-win keywords I already rank for"
];
function SamConversation({
  projectId,
  sessionId
}) {
  const agent = useAgent({ agent: "sam-chat", name: sessionId });
  const { messages, sendMessage, setMessages, status } = useAgentChat({ agent });
  const isBusy = status === "submitted" || status === "streaming";
  const { scrollRef, onScroll, pinToBottom } = useStickToBottom(
    messages,
    status
  );
  const sendText = (text) => {
    pinToBottom();
    void sendMessage({ text });
  };
  const rewindTo = async (messageId) => {
    const response = await fetch(`/agents/sam-chat/${sessionId}/rewind`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ messageId })
    });
    if (!response.ok) return false;
    const fresh = await fetch(
      `/agents/sam-chat/${sessionId}/get-messages`
    ).then((res) => res.ok ? res.json() : null);
    if (Array.isArray(fresh)) setMessages(fresh);
    return true;
  };
  const undoFrom = (messageId) => void rewindTo(messageId);
  const editAndResend = async (messageId, newText) => {
    if (await rewindTo(messageId)) sendText(newText);
  };
  const wasBusyRef = useRef(false);
  useEffect(() => {
    if (isBusy) {
      wasBusyRef.current = true;
      return;
    }
    if (wasBusyRef.current) {
      wasBusyRef.current = false;
      invalidateSamSessions(projectId);
    }
  }, [isBusy, projectId]);
  const lastMessage = messages[messages.length - 1];
  const showTyping = isBusy && (lastMessage?.role !== "assistant" || !messageHasVisibleContent(lastMessage));
  const showSuggestions = messages.length === 0 && !isBusy;
  return /* @__PURE__ */ jsxs("div", { className: "relative flex min-w-0 flex-1 flex-col", children: [
    null,
    /* @__PURE__ */ jsx(
      "div",
      {
        ref: scrollRef,
        onScroll,
        className: "flex-1 overflow-y-auto px-5 py-6",
        children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-2xl space-y-6", children: [
          messages.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-sm text-base-content/80", children: [
            /* @__PURE__ */ jsx("p", { children: "Hey, I’m SAM — your in-app SEO agent. I can research keywords, size up competitors, read your SERPs, backlinks, rank tracking and Search Console, and turn it into next steps for this project." }),
            /* @__PURE__ */ jsx("p", { children: "Ask me anything, or start with one of these:" })
          ] }) : null,
          messages.map((message, index) => /* @__PURE__ */ jsx(
            ChatMessage,
            {
              message,
              resolveToolLabel: humanizeToolLabel,
              streaming: isBusy && index === messages.length - 1 && message.role === "assistant",
              onUndo: (
                // Allowed even mid-turn: rewind aborts the in-flight turn
                // server-side, so undo doubles as "stop and take it back".
                message.role === "user" ? () => undoFrom(message.id) : void 0
              ),
              onEdit: message.role === "user" ? (newText) => void editAndResend(message.id, newText) : void 0
            },
            message.id
          )),
          showTyping ? /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2 pt-1 text-base-content/40", children: /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsx("span", { className: "size-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" }),
            /* @__PURE__ */ jsx("span", { className: "size-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" }),
            /* @__PURE__ */ jsx("span", { className: "size-1.5 animate-bounce rounded-full bg-current" })
          ] }) }) : null,
          status === "error" ? /* @__PURE__ */ jsx("p", { className: "text-sm text-error", children: "Something went wrong. Please try again." }) : null,
          showSuggestions ? /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: SUGGESTIONS.map((question) => /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "rounded-full border border-base-300 bg-base-100 px-3 py-1.5 text-xs font-medium text-base-content/70 transition-colors hover:border-primary/50 hover:text-base-content",
              onClick: () => sendText(question),
              children: question
            },
            question
          )) }) : null
        ] })
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "flex-shrink-0 border-t border-base-300 px-5 py-3", children: /* @__PURE__ */ jsx("div", { className: "mx-auto w-full max-w-2xl", children: /* @__PURE__ */ jsx(
      ChatComposer,
      {
        busy: isBusy,
        onSend: sendText,
        placeholder: "Ask SAM to research, analyze, or track anything…"
      }
    ) }) })
  ] });
}
function SamChat({
  projectId,
  activeSessionId
}) {
  const navigate = useNavigate();
  const access = useSamAccess(projectId);
  const sessionsQuery = useQuery(samSessionsQueryOptions(projectId));
  const sessions = sessionsQuery.data ?? [];
  const goToSession = useCallback(
    (sessionId) => void navigate({
      to: "/p/$projectId/sam",
      params: { projectId },
      search: { s: sessionId },
      replace: true
    }),
    [navigate, projectId]
  );
  const createSession = useMutation({
    mutationFn: () => createSamSession({ data: { projectId } }),
    onSuccess: ({ id }) => {
      invalidateSamSessions(projectId);
      goToSession(id);
    }
  });
  const firstSessionId = sessions[0]?.id;
  useEffect(() => {
    if (activeSessionId || !firstSessionId) return;
    goToSession(firstSessionId);
  }, [activeSessionId, firstSessionId, goToSession]);
  if (access.showSetupGate) {
    return /* @__PURE__ */ jsx("div", { className: "overflow-auto px-4 py-4 md:px-6 md:py-6", children: /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-3xl", children: /* @__PURE__ */ jsx(
      SamSetupGate,
      {
        errorMessage: access.errorMessage,
        isRefetching: access.isRefetching,
        onRetry: access.onRetry
      }
    ) }) });
  }
  if (activeSessionId) {
    const activeTitle = sessions.find(
      (session) => session.id === activeSessionId
    )?.title;
    return /* @__PURE__ */ jsxs("div", { className: "flex h-full min-h-0 flex-col", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3 border-b border-base-300 px-5 py-3.5", children: [
        /* @__PURE__ */ jsx("span", { className: "truncate text-sm font-medium text-base-content/80", children: activeTitle ?? "Chat" }),
        /* @__PURE__ */ jsxs(
          Link,
          {
            to: "/p/$projectId/settings/context",
            params: { projectId },
            className: "flex shrink-0 items-center gap-1.5 text-xs text-base-content/60 transition-colors hover:text-base-content",
            children: [
              /* @__PURE__ */ jsx(Brain, { className: "size-3.5" }),
              "Project memory"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex min-h-0 flex-1", children: /* @__PURE__ */ jsx(
        Suspense,
        {
          fallback: /* @__PURE__ */ jsx("div", { className: "flex flex-1 items-center justify-center", children: /* @__PURE__ */ jsx(Loader2, { className: "size-5 animate-spin text-base-content/40" }) }),
          children: /* @__PURE__ */ jsx(
            SamConversation,
            {
              projectId,
              sessionId: activeSessionId
            },
            activeSessionId
          )
        }
      ) })
    ] });
  }
  if (sessionsQuery.isLoading) {
    return /* @__PURE__ */ jsx("div", { className: "flex h-full items-center justify-center", children: /* @__PURE__ */ jsx(Loader2, { className: "size-5 animate-spin text-base-content/40" }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "flex h-full flex-col items-center justify-center gap-4 p-6 text-center", children: [
    /* @__PURE__ */ jsx("div", { className: "flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary", children: /* @__PURE__ */ jsx(Wrench, { className: "size-6" }) }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsx("p", { className: "text-lg font-medium", children: "What should we work on?" }),
      /* @__PURE__ */ jsx("p", { className: "max-w-sm text-sm text-base-content/60", children: "SAM is your in-app SEO agent with access to every OpenSEO research tool. Start a chat to get going." })
    ] }),
    /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        className: "btn btn-primary btn-sm gap-1",
        disabled: createSession.isPending,
        onClick: () => createSession.mutate(),
        children: [
          createSession.isPending ? /* @__PURE__ */ jsx(Loader2, { className: "size-4 animate-spin" }) : /* @__PURE__ */ jsx(Plus, { className: "size-4" }),
          "New chat"
        ]
      }
    )
  ] });
}
function SamRoute() {
  const {
    projectId
  } = Route.useParams();
  const {
    s
  } = Route.useSearch();
  return /* @__PURE__ */ jsx(SamChat, { projectId, activeSessionId: s });
}
export {
  SamRoute as component
};
