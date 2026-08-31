import { m as createSsrRpc, u as useSession, t as getCustomerPlanStatus } from "./router-DHiBnyXs.js";
import { h as createServerFn, az as isHostedClientAuthMode, aG as SUBSCRIBE_ROUTE, bp as jsonCodec } from "../entry.js";
import { r as requireProjectContext } from "./middleware-Doy-pxkJ.js";
import { p as promptExplorerInputSchema, b as brandLookupInputSchema } from "./ai-search-BV1mIqc0.js";
import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useCustomer } from "autumn-js/react";
import { History, Clock, X, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { z } from "zod";
import { u as useLocalHistoryStore } from "./useLocalHistoryStore-CAiu5gzu.js";
const lookupBrand = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(brandLookupInputSchema).handler(createSsrRpc("06c91e3888f8bcec4a820827c04796cd80041afad39d1b5549be4e2cf810951b"));
const explorePrompt = createServerFn({
  method: "POST"
}).middleware(requireProjectContext).validator(promptExplorerInputSchema).handler(createSsrRpc("e2b5146b78833600dfd30aa3bda214dfa8c480278644dcff1698db1e51e5759a"));
const SELF_HOSTED_PLAN_GATE = {
  isLoading: false,
  isFreePlan: false
};
function HostedPlanGate({
  children
}) {
  if (!isHostedClientAuthMode()) {
    return children(SELF_HOSTED_PLAN_GATE);
  }
  return /* @__PURE__ */ jsx(HostedPlanGateContent, { children });
}
function HostedPlanGateContent({
  children
}) {
  const { data: session, isPending: isSessionPending } = useSession();
  const hasSession = Boolean(session?.user?.id);
  const customerQuery = useCustomer({
    queryOptions: { enabled: hasSession }
  });
  return children({
    isLoading: isSessionPending || !hasSession || customerQuery.isLoading,
    isFreePlan: !!customerQuery.data && getCustomerPlanStatus(customerQuery.data) === "free"
  });
}
const MENTION_PLATFORM_LABELS = {
  chat_gpt: "ChatGPT",
  google: "Google AI Overview"
};
const MODEL_LABELS = {
  chat_gpt: "ChatGPT",
  claude: "Claude",
  gemini: "Gemini",
  perplexity: "Perplexity"
};
const MODEL_ACCENTS = {
  chat_gpt: {
    border: "border-l-emerald-500",
    dot: "bg-emerald-500"
  },
  claude: {
    border: "border-l-orange-500",
    dot: "bg-orange-500"
  },
  gemini: {
    border: "border-l-sky-500",
    dot: "bg-sky-500"
  },
  perplexity: {
    border: "border-l-violet-500",
    dot: "bg-violet-500"
  }
};
function formatPlatformLabel(platform) {
  return MENTION_PLATFORM_LABELS[platform];
}
const PLATFORM_DOT_CLASS = {
  chat_gpt: "bg-emerald-500",
  google: "bg-sky-500"
};
const PLATFORM_SHORT_LABEL = {
  chat_gpt: "ChatGPT",
  google: "Google"
};
function formatModelLabel(model) {
  return MODEL_LABELS[model];
}
function getModelAccent(model) {
  return MODEL_ACCENTS[model];
}
const COUNTRY_LABELS = {
  US: "United States",
  GB: "United Kingdom",
  CA: "Canada",
  AU: "Australia",
  IE: "Ireland",
  DE: "Germany",
  FR: "France",
  ES: "Spain",
  IT: "Italy",
  NL: "Netherlands",
  PT: "Portugal",
  PL: "Poland",
  SE: "Sweden",
  NO: "Norway",
  DK: "Denmark",
  BR: "Brazil",
  MX: "Mexico",
  IN: "India",
  JP: "Japan",
  KR: "South Korea",
  SG: "Singapore",
  HK: "Hong Kong",
  TW: "Taiwan",
  ZA: "South Africa"
};
function formatCountryLabel(code) {
  return COUNTRY_LABELS[code];
}
const NUMBER_FORMATTER = new Intl.NumberFormat("en-US");
function formatCount(value) {
  if (value == null) return "—";
  return NUMBER_FORMATTER.format(value);
}
function SearchHistorySection({
  history,
  historyLoaded,
  onRemoveHistoryItem,
  renderItemLink,
  emptyIcon: EmptyIcon,
  emptyMessage,
  noun,
  renderItem
}) {
  if (!historyLoaded) {
    return null;
  }
  if (history.length === 0) {
    return /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-dashed border-base-300 bg-base-100/70 p-6 text-center text-base-content/55 space-y-2", children: [
      /* @__PURE__ */ jsx(EmptyIcon, { className: "size-9 mx-auto opacity-35" }),
      /* @__PURE__ */ jsx("p", { className: "text-base font-medium text-base-content/80", children: emptyMessage })
    ] });
  }
  return /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-base-300 bg-base-100 p-5 md:p-6", children: [
    /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between mb-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx(History, { className: "size-4 text-base-content/45" }),
      /* @__PURE__ */ jsxs("span", { className: "text-sm text-base-content/60", children: [
        history.length,
        " recent ",
        noun,
        history.length !== 1 ? "s" : ""
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "grid gap-2", children: history.map((item) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: "group flex items-center gap-2 rounded-lg border border-base-300 bg-base-100 p-2",
        children: [
          renderItemLink(
            item,
            /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Clock, { className: "size-4 text-base-content/40 shrink-0" }),
              /* @__PURE__ */ jsx("div", { className: "min-w-0", children: renderItem(item) })
            ] })
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xs text-base-content/40", children: new Date(item.timestamp).toLocaleDateString(void 0, {
              month: "short",
              day: "numeric"
            }) }),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                className: "btn btn-ghost btn-xs opacity-0 group-hover:opacity-100 p-1",
                onClick: () => onRemoveHistoryItem(item.timestamp),
                "aria-label": "Remove from history",
                children: /* @__PURE__ */ jsx(X, { className: "size-3" })
              }
            )
          ] })
        ]
      },
      item.timestamp
    )) })
  ] });
}
const HISTORY_ITEM_LINK_CLASS = "flex min-w-0 flex-1 items-center gap-3 rounded-md px-1 py-1 text-left transition-colors hover:bg-base-200";
function AiSearchPaidPlanGate({ feature, description, bullets }) {
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-3xl overflow-hidden rounded-xl border border-base-300 bg-base-100 shadow-sm", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-5 px-6 py-6 sm:flex-row sm:items-start sm:justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "max-w-xl space-y-2", children: [
        /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary", children: [
          /* @__PURE__ */ jsx(Sparkles, { className: "size-3.5" }),
          "Paid plan"
        ] }),
        /* @__PURE__ */ jsxs("h2", { className: "text-xl font-semibold tracking-tight", children: [
          "Unlock ",
          feature
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-base-content/70", children: description })
      ] }),
      /* @__PURE__ */ jsx(
        Link,
        {
          to: SUBSCRIBE_ROUTE,
          search: { upgrade: true },
          className: "btn btn-primary shrink-0",
          children: "Upgrade"
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-5 border-t border-base-300 px-6 py-6 sm:grid-cols-3", children: bullets.map(({ icon: Icon, title, body }) => /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx("div", { className: "inline-flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary", children: /* @__PURE__ */ jsx(Icon, { className: "size-4" }) }),
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold", children: title }),
      /* @__PURE__ */ jsx("p", { className: "text-xs leading-relaxed text-base-content/65", children: body })
    ] }, title)) })
  ] });
}
const timestampFieldSchema = z.object({ timestamp: z.number() });
function useTimestampedSearchHistory(args) {
  const codec = jsonCodec(
    z.array(z.intersection(args.bodySchema, timestampFieldSchema))
  );
  const { history, isLoaded, addItem, removeItem } = useLocalHistoryStore({
    storageKey: args.storageKey,
    maxItems: args.maxItems ?? 20,
    parse: (raw) => {
      const parsed = codec.safeParse(raw);
      return parsed.success ? parsed.data : null;
    },
    isSameItem: (existing, next) => args.isSame(existing, next),
    createItem: (input) => ({ ...input, timestamp: Date.now() }),
    getItemKey: (item) => item.timestamp
  });
  return {
    history,
    isLoaded,
    addSearch: addItem,
    removeHistoryItem: removeItem
  };
}
export {
  AiSearchPaidPlanGate as A,
  HISTORY_ITEM_LINK_CLASS as H,
  PLATFORM_SHORT_LABEL as P,
  SearchHistorySection as S,
  formatCountryLabel as a,
  HostedPlanGate as b,
  formatCount as c,
  formatPlatformLabel as d,
  explorePrompt as e,
  formatModelLabel as f,
  getModelAccent as g,
  PLATFORM_DOT_CLASS as h,
  lookupBrand as l,
  useTimestampedSearchHistory as u
};
